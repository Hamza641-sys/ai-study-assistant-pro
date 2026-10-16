import { useState, useEffect, useCallback } from 'react';
import { quizzesAPI } from '../services/api.js';
import toast from 'react-hot-toast';

export function useQuizHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchAttempts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await quizzesAPI.list();
      setAttempts(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAttempts(); }, [fetchAttempts]);

  return { attempts, loading, error, fetchAttempts };
}

export function useQuiz() {
  const [quiz,       setQuiz]       = useState(null);       // generated quiz object
  const [result,     setResult]     = useState(null);       // submitted result
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  const generateQuiz = useCallback(async (payload) => {
    try {
      setGenerating(true);
      setError(null);
      setQuiz(null);
      setResult(null);
      const { data } = await quizzesAPI.generate(payload);
      setQuiz(data.data);
      toast.success(`${data.data.totalQuestions} questions generated!`);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate quiz.';
      setError(msg);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const submitQuiz = useCallback(async (quizId, answers, timeTaken) => {
    try {
      setSubmitting(true);
      setError(null);
      const { data } = await quizzesAPI.submit(quizId, { answers, timeTaken });
      setResult(data.data);
      toast.success(`Quiz submitted! Score: ${data.data.scorePercentage}%`);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit quiz.';
      setError(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const resetQuiz = useCallback(() => {
    setQuiz(null);
    setResult(null);
    setError(null);
  }, []);

  return { quiz, result, generating, submitting, error, generateQuiz, submitQuiz, resetQuiz };
}
