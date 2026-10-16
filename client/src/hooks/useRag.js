import { useState, useCallback } from 'react';
import { ragAPI } from '../services/api.js';

export function useRag() {
  const [answer,   setAnswer]   = useState(null);
  const [sources,  setSources]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const askQuestion = useCallback(async (question, documentIds, conversationId = null) => {
    try {
      setLoading(true);
      setError(null);
      const payload = { question, documentIds };
      if (conversationId) payload.conversationId = conversationId;

      const { data } = await ragAPI.ask(payload);
      setAnswer(data.data.answer);
      setSources(data.data.sources || []);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get an answer.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnswer(null);
    setSources([]);
    setError(null);
  }, []);

  return { answer, sources, loading, error, askQuestion, reset };
}
