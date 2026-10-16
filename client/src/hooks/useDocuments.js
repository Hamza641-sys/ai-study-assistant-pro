import { useState, useEffect, useCallback } from 'react';
import { documentsAPI } from '../services/api.js';
import toast from 'react-hot-toast';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await documentsAPI.list();
      setDocuments(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const uploadDocument = useCallback(async (file, title) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const { data } = await documentsAPI.upload(formData);
    // Optimistically add the new doc at the top
    setDocuments((prev) => [data.document, ...prev]);
    toast.success('File uploaded! Processing started...');
    return data.document;
  }, []);

  const deleteDocument = useCallback(async (id) => {
    await documentsAPI.delete(id);
    setDocuments((prev) => prev.filter((d) => d._id !== id));
    toast.success('Document deleted.');
  }, []);

  // Poll status for processing documents
  const pollStatus = useCallback(async (id) => {
    try {
      const { data } = await documentsAPI.getStatus(id);
      setDocuments((prev) =>
        prev.map((d) => d._id === id ? { ...d, ...data.data } : d)
      );
      return data.data.status;
    } catch {
      return null;
    }
  }, []);

  return { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument, pollStatus };
}
