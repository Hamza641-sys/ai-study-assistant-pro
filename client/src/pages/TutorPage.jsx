import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Plus, Trash2, MessageSquare, Bot, User,
  AlertCircle, Mic, MicOff, Volume2, VolumeX,
} from 'lucide-react';
import { useConversations, useChat } from '../hooks/useConversations.js';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ReactMarkdown from 'react-markdown';
import { formatRelativeTime } from '../utils/formatters.js';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import api from '../services/api.js';

// ─── Text-to-Speech helper ────────────────────────────────────────────────────
const speak = (text) => {
  window.speechSynthesis.cancel(); // stop any current speech
  const clean = text.replace(/[#*`_~[\]]/g, '').substring(0, 500); // strip markdown
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang  = 'en-US';
  utter.rate  = 0.95;
  utter.pitch = 1;
  // Use a natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) =>
    v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural')
  );
  if (preferred) utter.voice = preferred;
  window.speechSynthesis.speak(utter);
};

const stopSpeaking = () => window.speechSynthesis.cancel();

export default function TutorPage() {
  const { conversations, loading: listLoading, createConversation, deleteConversation } = useConversations();
  const [activeId, setActiveId] = useState(null);
  const { messages, sending, loading: chatLoading, sendMessage } = useChat(activeId);

  const [input,       setInput]       = useState('');
  const [recording,   setRecording]   = useState(false);
  const [transcribing,setTranscribing]= useState(false);
  const [speaking,    setSpeaking]    = useState(false);
  const [autoSpeak,   setAutoSpeak]   = useState(false); // auto read AI replies

  const bottomRef    = useRef(null);
  const mediaRecRef  = useRef(null);
  const audioChunks  = useRef([]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track TTS speaking state
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeaking(window.speechSynthesis.speaking);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Auto-speak last AI message
  useEffect(() => {
    if (!autoSpeak || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role === 'assistant' && !last.error) {
      speak(last.content);
    }
  }, [messages, autoSpeak]);

  // ── New chat ────────────────────────────────────────────────────────────────
  const handleNewChat = async () => {
    try {
      const conv = await createConversation({ mode: 'general' });
      setActiveId(conv._id);
    } catch {
      toast.error('Could not create conversation.');
    }
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;

    if (!activeId) {
      try {
        const conv = await createConversation({ mode: 'general' });
        setActiveId(conv._id);
        await new Promise((r) => setTimeout(r, 150));
      } catch {
        toast.error('Could not start conversation.');
        return;
      }
    }
    const msg = input.trim();
    setInput('');
    try {
      await sendMessage(msg);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    }
  };

  // ── Voice Recording (Speech → Text via Groq Whisper) ───────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRec = new MediaRecorder(stream, { mimeType });
      mediaRecRef.current = mediaRec;
      audioChunks.current = [];

      mediaRec.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunks.current, { type: mimeType });

        if (blob.size < 1000) {
          toast.error('Recording too short. Please try again.');
          return;
        }

        // Send to Groq Whisper via backend
        setTranscribing(true);
        try {
          const formData = new FormData();
          const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
          formData.append('audio', blob, `recording.${ext}`);

          const { data } = await api.post('/voice/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
          });

          if (data.data?.text) {
            setInput(data.data.text);
            toast.success('Voice transcribed! Review and send.');
          } else {
            toast.error('Could not transcribe audio.');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Transcription failed.');
        } finally {
          setTranscribing(false);
        }
      };

      mediaRec.start();
      setRecording(true);
      toast('🎤 Recording... Click again to stop', { duration: 2000 });
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        toast.error('Microphone permission denied. Please allow mic access.');
      } else {
        toast.error('Could not start recording: ' + err.message);
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecRef.current && recording) {
      mediaRecRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  // ── TTS — speak a specific message ─────────────────────────────────────────
  const handleSpeak = (text) => {
    if (speaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  // ── Delete conversation ─────────────────────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await deleteConversation(id);
      if (activeId === id) setActiveId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden animate-fade-in">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-64 shrink-0 border-r border-gray-800 flex-col hidden md:flex">
        <div className="p-3 border-b border-gray-800">
          <button onClick={handleNewChat} className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2">
            <Plus size={16} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {listLoading ? (
            <div className="flex justify-center pt-8"><Spinner /></div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-gray-500 text-center pt-8 px-3">No conversations yet. Start a new chat!</p>
          ) : (
            conversations.map((c) => (
              <button key={c._id}
                onClick={() => setActiveId(c._id)}
                className={clsx(
                  'w-full text-left px-3 py-2.5 rounded-lg mb-1 group flex items-center justify-between transition-colors',
                  activeId === c._id ? 'bg-primary-600/20 border border-primary-700' : 'hover:bg-gray-800'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-200 truncate">{c.title}</p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(c.updatedAt)}</p>
                </div>
                <button onClick={(e) => handleDelete(c._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
              </button>
            ))
          )}
        </div>

        {/* Auto-speak toggle */}
        <div className="px-3 py-3 border-t border-gray-800">
          <button
            onClick={() => setAutoSpeak((v) => !v)}
            className={clsx(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
              autoSpeak ? 'bg-primary-600/20 text-primary-300 border border-primary-700' : 'text-gray-400 hover:bg-gray-800'
            )}
          >
            {autoSpeak ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
          </button>
        </div>
      </div>

      {/* ── Chat area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeId && !chatLoading && (
            <EmptyState
              icon={MessageSquare}
              title="Start a conversation"
              description="Ask anything by typing or using the mic 🎤. The AI Tutor will explain concepts, give examples, and help you understand any topic."
              action={
                <button onClick={handleNewChat} className="btn-primary flex items-center gap-2">
                  <Plus size={16} /> New Chat
                </button>
              }
            />
          )}

          {chatLoading && <div className="flex justify-center pt-10"><Spinner /></div>}

          {messages.map((msg) => (
            <div key={msg._id} className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-white" />
                </div>
              )}

              <div className={clsx(
                'max-w-[75%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-200 rounded-tl-sm'
              )}>
                {msg.error && (
                  <div className="flex items-center gap-1.5 text-red-400 text-xs mb-2">
                    <AlertCircle size={12} /> AI service error
                  </div>
                )}

                {msg.role === 'assistant' ? (
                  <>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {/* Speaker button on AI messages */}
                    <button
                      onClick={() => handleSpeak(msg.content)}
                      className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-primary-400 transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 size={12} />
                      {speaking ? 'Stop' : 'Read aloud'}
                    </button>
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                <p className={clsx('text-xs mt-1.5', msg.role === 'user' ? 'text-primary-200' : 'text-gray-500')}>
                  {formatRelativeTime(msg.createdAt)}
                </p>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <User size={14} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map((i) => (
                    <div key={i} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">

            {/* Mic button — Groq Whisper speech-to-text */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={transcribing}
              title={recording ? 'Stop recording' : 'Start voice input'}
              className={clsx(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0',
                recording
                  ? 'bg-red-600 hover:bg-red-500 animate-pulse'
                  : transcribing
                  ? 'bg-gray-700 cursor-wait'
                  : 'bg-gray-700 hover:bg-gray-600'
              )}
            >
              {transcribing
                ? <Spinner size="sm" />
                : recording
                ? <MicOff size={18} className="text-white" />
                : <Mic size={18} className="text-gray-300" />
              }
            </button>

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                recording    ? '🔴 Recording... click mic to stop' :
                transcribing ? '⏳ Transcribing your voice...' :
                'Ask anything or click 🎤 to speak...'
              }
              className="input-field flex-1"
              disabled={sending || recording || transcribing}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-11 h-11 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              {sending ? <Spinner size="sm" /> : <Send size={18} className="text-white" />}
            </button>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {recording    ? '🔴 Recording — click mic to stop & transcribe' :
               transcribing ? '⏳ Converting speech to text via Groq Whisper...' :
               speaking     ? '🔊 Speaking — click "Stop" on message to pause' :
               '🎤 Voice input  ·  🔊 Click "Read aloud" on any AI reply'}
            </p>
            {speaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <VolumeX size={12} /> Stop speaking
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
