import { useState, useEffect, useRef } from 'react';
import { Brain, CheckCircle, XCircle, Clock, RotateCcw, Trophy, ChevronDown } from 'lucide-react';
import { useQuiz, useQuizHistory } from '../hooks/useQuiz.js';
import { useDocuments } from '../hooks/useDocuments.js';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { formatDate, formatTime, getScoreColor } from '../utils/formatters.js';
import clsx from 'clsx';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPage() {
  const { documents } = useDocuments();
  const { quiz, result, generating, submitting, error, generateQuiz, submitQuiz, resetQuiz } = useQuiz();
  const { attempts, loading: histLoading } = useQuizHistory();

  const [form, setForm] = useState({ sourceType: 'topic', topic: '', documentId: '', numQuestions: 5 });
  const [answers, setAnswers] = useState({});
  const [formError, setFormError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [tab, setTab] = useState('generate'); // 'generate' | 'history'

  const readyDocs = documents.filter((d) => d.status === 'ready');

  // Start timer when quiz loads
  useEffect(() => {
    if (quiz && !result) setStartTime(Date.now());
  }, [quiz]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (form.sourceType === 'topic' && !form.topic.trim()) {
      setFormError('Please enter a topic.'); return;
    }
    if (form.sourceType === 'document' && !form.documentId) {
      setFormError('Please select a document.'); return;
    }
    const payload = {
      sourceType:   form.sourceType,
      numQuestions: Number(form.numQuestions),
      ...(form.sourceType === 'topic'    ? { topic: form.topic.trim() }       : {}),
      ...(form.sourceType === 'document' ? { documentId: form.documentId }     : {}),
    };
    await generateQuiz(payload);
    setAnswers({});
    setStartTime(Date.now());
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.totalQuestions) {
      alert(`Please answer all ${quiz.totalQuestions} questions before submitting.`); return;
    }
    const answersArr = Object.entries(answers).map(([qNum, answer]) => ({
      questionNumber: Number(qNum),
      answer,
    }));
    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : null;
    await submitQuiz(quiz._id, answersArr, timeTaken);
  };

  // ── Result Screen ────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Score card */}
        <div className="card text-center py-8">
          <div className={`text-6xl font-extrabold mb-2 ${getScoreColor(result.scorePercentage)}`}>
            {result.scorePercentage}%
          </div>
          <p className="text-gray-400 text-lg">
            {result.score} / {result.totalQuestions} correct
          </p>
          <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-sm font-medium ${
            result.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {result.passed ? <><Trophy size={14} /> Passed!</> : <><XCircle size={14} /> Keep practising</>}
          </div>
          {result.timeTaken && (
            <p className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-1">
              <Clock size={13} /> Time taken: {formatTime(result.timeTaken)}
            </p>
          )}
          <button onClick={resetQuiz} className="btn-primary mt-6 flex items-center gap-2 mx-auto">
            <RotateCcw size={16} /> New Quiz
          </button>
        </div>

        {/* Review questions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Review Answers</h3>
          {result.questions.map((q) => (
            <div key={q.questionNumber} className={`card border-l-4 ${q.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <p className="text-sm font-medium text-white mb-3">
                <span className="text-gray-500 mr-2">{q.questionNumber}.</span>{q.questionText}
              </p>
              <div className="space-y-2">
                {OPTION_LABELS.map((opt) => {
                  const isCorrect = opt === q.correctAnswer;
                  const isUser    = opt === q.userAnswer;
                  return (
                    <div key={opt} className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                      isCorrect            ? 'bg-green-500/10 text-green-300 border border-green-700' :
                      isUser && !isCorrect ? 'bg-red-500/10 text-red-300 border border-red-700' :
                                             'bg-gray-800/50 text-gray-400'
                    )}>
                      <span className="font-medium w-5 shrink-0">{opt}.</span>
                      <span className="flex-1">{q.options[opt]}</span>
                      {isCorrect && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                      {isUser && !isCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
              {q.explanation && (
                <p className="mt-3 text-xs text-gray-400 bg-gray-800/50 rounded-lg p-3">
                  💡 {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Active Quiz ──────────────────────────────────────────────────────────────
  if (quiz) {
    const answered = Object.keys(answers).length;
    const progress  = (answered / quiz.totalQuestions) * 100;
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">{quiz.title}</h2>
            <p className="text-sm text-gray-400">{answered} / {quiz.totalQuestions} answered</p>
          </div>
          <button onClick={resetQuiz} className="btn-secondary text-sm flex items-center gap-1.5">
            <RotateCcw size={14} /> New Quiz
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {error && <ErrorMessage message={error} />}

        {quiz.questions.map((q) => (
          <div key={q.questionNumber} className="card">
            <p className="text-sm font-medium text-white mb-4">
              <span className="text-primary-400 font-semibold mr-2">{q.questionNumber}.</span>
              {q.questionText}
            </p>
            <div className="space-y-2">
              {OPTION_LABELS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.questionNumber]: opt }))}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all border',
                    answers[q.questionNumber] === opt
                      ? 'border-primary-500 bg-primary-500/10 text-primary-200'
                      : 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
                  )}
                >
                  <span className={clsx(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0',
                    answers[q.questionNumber] === opt ? 'border-primary-400 bg-primary-500 text-white' : 'border-gray-600 text-gray-400'
                  )}>{opt}</span>
                  {q.options[opt]}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={submitting || answered < quiz.totalQuestions}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {submitting ? <><Spinner size="sm" /> Submitting...</> : `Submit Quiz (${answered}/${quiz.totalQuestions} answered)`}
        </button>
      </div>
    );
  }

  // ── Generator / History ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {['generate', 'history'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx(
              'px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              tab === t ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            )}>
            {t === 'generate' ? '⚡ Generate Quiz' : '📊 Quiz History'}
          </button>
        ))}
      </div>

      {tab === 'generate' ? (
        <div className="max-w-lg card">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
            <Brain size={16} className="text-pink-400" /> Quiz Generator
          </h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Source type */}
            <div className="flex gap-2">
              {['topic', 'document'].map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm((p) => ({ ...p, sourceType: t }))}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                    form.sourceType === t
                      ? 'border-pink-500 bg-pink-500/10 text-pink-300'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}>
                  {t === 'topic' ? '🏷️ By Topic' : '📄 From Document'}
                </button>
              ))}
            </div>

            {form.sourceType === 'topic' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Photosynthesis, World War II, Python OOP..."
                  value={form.topic}
                  onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                  className="input-field"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Document</label>
                {readyDocs.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-gray-800 rounded-lg px-4 py-3">No processed documents yet.</p>
                ) : (
                  <div className="relative">
                    <select
                      value={form.documentId}
                      onChange={(e) => setForm((p) => ({ ...p, documentId: e.target.value }))}
                      className="input-field appearance-none pr-9"
                    >
                      <option value="">Choose a document...</option>
                      {readyDocs.map((d) => (
                        <option key={d._id} value={d._id}>{d.title}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Number of Questions: <span className="text-primary-400">{form.numQuestions}</span>
              </label>
              <input
                type="range" min="3" max="15" step="1"
                value={form.numQuestions}
                onChange={(e) => setForm((p) => ({ ...p, numQuestions: e.target.value }))}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1"><span>3</span><span>15</span></div>
            </div>

            {(formError || error) && <ErrorMessage message={formError || error} />}

            <button type="submit" disabled={generating}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {generating ? <><Spinner size="sm" /> Generating...</> : <><Brain size={16} /> Generate Quiz</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-semibold text-white">Quiz History</h2>
          {histLoading ? (
            <div className="flex justify-center py-10"><Spinner size="lg" /></div>
          ) : attempts.length === 0 ? (
            <EmptyState icon={Brain} title="No quizzes taken yet" description="Generate and complete a quiz to see your history." />
          ) : (
            attempts.map((a) => (
              <div key={a._id} className="card flex items-center gap-4">
                <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Brain size={18} className="text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{a.title}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {a.sourceType} · {a.totalQuestions} questions · {formatDate(a.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {a.status === 'submitted' ? (
                    <>
                      <p className={`font-bold ${getScoreColor(a.scorePercentage)}`}>{a.scorePercentage}%</p>
                      <p className="text-xs text-gray-500">{a.score}/{a.totalQuestions}</p>
                    </>
                  ) : (
                    <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">In Progress</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
