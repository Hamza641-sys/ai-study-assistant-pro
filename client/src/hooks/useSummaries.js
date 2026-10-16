import { useState, useEffect, useCallback } from 'react';
import { summariesAPI } from '../services/api.js';
import toast from 'react-hot-toast';

export function useSummaries() {
  const [summaries, setSummaries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchSummaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await summariesAPI.list();
      setSummaries(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load summaries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummaries(); }, [fetchSummaries]);

  const generateSummary = useCallback(async (payload) => {
    const { data } = await summariesAPI.generate(payload);
    setSummaries((prev) => [data.data, ...prev]);
    toast.success('Summary generated!');
    return data.data;
  }, []);

  const deleteSummary = useCallback(async (id) => {
    await summariesAPI.delete(id);
    setSummaries((prev) => prev.filter((s) => s._id !== id));
    toast.success('Summary deleted.');
  }, []);

  return { summaries, loading, error, fetchSummaries, generateSummary, deleteSummary };
}
