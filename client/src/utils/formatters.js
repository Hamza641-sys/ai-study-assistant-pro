/**
 * Format bytes to human-readable size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Format date to relative time (e.g. "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60)   return 'just now';
  if (diffMins < 60)   return `${diffMins}m ago`;
  if (diffHours < 24)  return `${diffHours}h ago`;
  if (diffDays < 7)    return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

/**
 * Format seconds to mm:ss
 */
export const formatTime = (seconds) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * Truncate text to max length
 */
export const truncate = (text, maxLen = 80) => {
  if (!text) return '';
  return text.length <= maxLen ? text : text.substring(0, maxLen) + '...';
};

/**
 * Score color class based on percentage
 */
export const getScoreColor = (pct) => {
  if (pct >= 80) return 'text-green-400';
  if (pct >= 60) return 'text-yellow-400';
  return 'text-red-400';
};
