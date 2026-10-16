import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-950/50 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-1 underline text-red-400 hover:text-red-300">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
