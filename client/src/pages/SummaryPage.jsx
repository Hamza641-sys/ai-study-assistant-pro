import { useState } from 'react';
import { BookOpen, Trash2, FileText, ChevronDown, Wand2 } from 'lucide-react';
import { useSummaries } from '../hooks/useSummaries.js';
import { useDocuments } from '../hooks/useDocuments.js';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Modal from '../components/common/Modal.jsx';
import ReactMarkdown from 'react-markdown';
import { formatRelativeTime } from '../utils/formatters.js';
import toast from 'react-hot-toast';

const SUMMARY_TYPES = [
  { value: 'short',        label: 'Short Summary',       desc: '2-3 concise paragraphs' },
  { value: 'detailed',     label: 'Detailed Summary',    desc: 'Comprehensive coverage' },
  { value: 'key_points',   label: 'Key Points',          desc: 'Bullet-point highlights' },
  { value: 'definitions',  label: 'Important Definitions', desc: 'Terms and definitions' },
  { value: 'revision',     label: 'Revision Notes',      desc: 'Exam-ready notes' },
  { value: 'chapter_wise', label: 'Chapter-wise',         desc: 'Section-by-section breakdown' },
];

export default function SummaryPage() {
  const { summaries, loading: listLoading, error: listError, generateSummary, deleteSummary } = useSummaries();
  const { documents } = useDocuments();

  const [form, setForm] = useState({
    summaryType: 'key_points',
    sourceType:  'document',
    documentId:  '',
    customText:  '',
  });
  const [generating, setGenerating] = useState(false);
  const [genError,   setGenError]   = useState('');
  const [viewModal,  setViewModal]  = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);

  const readyDocs = documents.filter((d) => d.status === 'ready');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenError('');

    if (form.sourceType === 'document' && !form.documentId) {
      setGenError('Please select a document.');
      return;
    }
    if (form.sourceType === 'custom_text' && form.customText.trim().length < 50) {
      setGenError('Please enter at least 50 characters of text.');
      return;
    }

    try {
      setGenerating(true);
      const payload = { summaryType: form.summaryType };
      if (form.sourceType === 'document') {
        payload.documentId = form.documentId;
      } else {
        payload.customText = form.customText.trim();
      }
      const result = await generateSummary(payload);
      setViewModal(result);
    } catch (err) {
      setGenError(err.response?.data?.message || 'Failed to generate summary.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Generator Form ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 card h-fit">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Wand2 size={16} className="text-emerald-400" /> Generate Summary
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Summary type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Summary Type</label>
              <div className="grid grid-cols-2 gap-2">
                {SUMMARY_TYPES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, summaryType: value }))}
                    className={`text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${
                      form.summaryType === value
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <p className="font-medium">{label}</p>
                    <p className="text-gray-500 mt-0.5 text-[11px]">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Source type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
              <div className="flex gap-2">
                {['document', 'custom_text'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, sourceType: t }))}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                      form.sourceType === t
                        ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {t === 'document' ? '📄 My Document' : '✍️ Custom Text'}
                  </button>
                ))}
              </div>
            </div>

            {form.sourceType === 'document' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Document</label>
                {readyDocs.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-gray-800 rounded-lg px-4 py-3">
                    No processed documents yet. Upload a PDF first.
                  </p>
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
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Paste your text
                </label>
                <textarea
                  rows={6}
                  value={form.customText}
                  onChange={(e) => setForm((p) => ({ ...p, customText: e.target.value }))}
                  placeholder="Paste your notes, lecture content or any text here (min 50 characters)..."
                  className="input-field resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{form.customText.length} characters</p>
              </div>
            )}

            {genError && <ErrorMessage message={genError} />}

            <button
              type="submit"
              disabled={generating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {generating ? <><Spinner size="sm" /> Generating...</> : <><Wand2 size={16} /> Generate Summary</>}
            </button>
          </form>
        </div>

        {/* ── Saved Summaries ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="font-semibold text-white">Saved Summaries</h2>

          {listError && <ErrorMessage message={listError} />}

          {listLoading ? (
            <div className="flex justify-center py-10"><Spinner size="lg" /></div>
          ) : summaries.length === 0 ? (
            <EmptyState icon={BookOpen} title="No summaries yet" description="Generate your first summary from a document or custom text." />
          ) : (
            summaries.map((s) => (
              <div key={s._id} className="card flex items-start gap-3 cursor-pointer hover:border-gray-700 transition-colors"
                onClick={() => setViewModal(s)}>
                <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full capitalize">
                      {s.summaryType?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">{s.wordCount} words · {formatRelativeTime(s.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(s._id); }}
                  className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Summary Modal */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title={viewModal?.title} maxWidth="max-w-2xl">
        <div className="max-h-[60vh] overflow-y-auto prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{viewModal?.content || ''}</ReactMarkdown>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
          <button onClick={() => setViewModal(null)} className="btn-secondary text-sm">Close</button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Summary">
        <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete this summary? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={async () => { await deleteSummary(deleteId); setDeleteId(null); }} className="btn-danger text-sm">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
