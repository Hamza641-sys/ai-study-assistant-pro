import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, FileText, Trash2, RefreshCw, CheckCircle,
  Clock, XCircle, AlertCircle, Search,
} from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments.js';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Modal from '../components/common/Modal.jsx';
import { formatFileSize, formatRelativeTime } from '../utils/formatters.js';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const MAX_SIZE_MB = 10;

const STATUS_CONFIG = {
  ready:      { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Ready' },
  processing: { icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Processing' },
  uploading:  { icon: Clock,       color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Uploading' },
  failed:     { icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Failed' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

export default function DocumentsPage() {
  const { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument, pollStatus } = useDocuments();
  const [uploading,   setUploading]   = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [search,      setSearch]      = useState('');
  const [uploadErr,   setUploadErr]   = useState('');
  const fileInputRef = useRef(null);

  // Poll status for any processing documents
  useEffect(() => {
    const processing = documents.filter((d) => d.status === 'processing' || d.status === 'uploading');
    if (processing.length === 0) return;

    const interval = setInterval(async () => {
      for (const doc of processing) {
        const status = await pollStatus(doc._id);
        if (status === 'ready' || status === 'failed') {
          toast(status === 'ready' ? `✅ "${doc.title}" is ready!` : `❌ "${doc.title}" processing failed.`);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, pollStatus]);

  const handleFile = useCallback(async (file) => {
    setUploadErr('');
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadErr('Only PDF files are supported.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadErr(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    try {
      setUploading(true);
      await uploadDocument(file);
    } catch (err) {
      setUploadErr(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [uploadDocument]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const filtered = documents.filter((d) =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.originalName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
          dragOver    ? 'border-primary-500 bg-primary-900/20' : 'border-gray-700 hover:border-gray-600 bg-gray-900/50',
          uploading   && 'cursor-not-allowed opacity-60'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-gray-400 text-sm">Uploading...</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-primary-600/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Upload size={24} className="text-primary-400" />
            </div>
            <p className="text-white font-medium">Drop your PDF here or click to browse</p>
            <p className="text-gray-500 text-sm mt-1">PDF files only · Max {MAX_SIZE_MB}MB per file</p>
          </>
        )}
      </div>

      {uploadErr && <ErrorMessage message={uploadErr} />}

      {/* Search & refresh */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <button onClick={fetchDocuments} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={15} />
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDocuments} />}

      {/* Document list */}
      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? 'No documents match your search' : 'No documents yet'}
          description={search ? 'Try a different search term.' : 'Upload a PDF to get started with AI-powered study tools.'}
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map((doc) => (
            <div key={doc._id} className="card flex items-center gap-4 py-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={18} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                  <StatusBadge status={doc.status} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {doc.originalName} · {formatFileSize(doc.fileSize)} · {formatRelativeTime(doc.createdAt)}
                  {doc.pageCount > 0 && ` · ${doc.pageCount} pages`}
                  {doc.chunkCount > 0 && ` · ${doc.chunkCount} chunks`}
                </p>
                {doc.processingError && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                    <AlertCircle size={11} /> {doc.processingError}
                  </div>
                )}
              </div>
              <button
                onClick={() => setDeleteModal(doc)}
                className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                aria-label="Delete document"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Document"
      >
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to delete <strong className="text-white">"{deleteModal?.title}"</strong>?
          This will also remove all AI-generated chunks and cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary text-sm">Cancel</button>
          <button
            onClick={async () => {
              await deleteDocument(deleteModal._id);
              setDeleteModal(null);
            }}
            className="btn-danger text-sm"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
