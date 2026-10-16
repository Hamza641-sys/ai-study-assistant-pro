import { useState, useEffect, useCallback } from 'react';
import { conversationsAPI } from '../services/api.js';
import toast from 'react-hot-toast';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await conversationsAPI.list();
      setConversations(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const createConversation = useCallback(async (payload = {}) => {
    const { data } = await conversationsAPI.create(payload);
    setConversations((prev) => [data.data, ...prev]);
    return data.data;
  }, []);

  const deleteConversation = useCallback(async (id) => {
    await conversationsAPI.delete(id);
    setConversations((prev) => prev.filter((c) => c._id !== id));
    toast.success('Conversation deleted.');
  }, []);

  return {
    conversations, loading, error,
    fetchConversations, createConversation, deleteConversation,
  };
}

export function useChat(conversationId) {
  const [messages,  setMessages]  = useState([]);
  const [sending,   setSending]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const loadMessages = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await conversationsAPI.get(id);
      setMessages(data.data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMessages(conversationId); }, [conversationId, loadMessages]);

  const sendMessage = useCallback(async (content) => {
    if (!conversationId || !content.trim()) return;
    setSending(true);

    // Optimistic user message
    const tempUserMsg = {
      _id: `temp_${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const { data } = await conversationsAPI.sendMessage(conversationId, { content });
      // Replace temp message and add AI response
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== tempUserMsg._id),
        data.data.userMessage,
        data.data.aiMessage,
      ]);
      return data.data.aiMessage;
    } catch (err) {
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
      throw err;
    } finally {
      setSending(false);
    }
  }, [conversationId]);

  return { messages, sending, loading, sendMessage, setMessages };
}
