import clsx from 'clsx';

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div
      className={clsx(
        'border-4 border-primary-500 border-t-transparent rounded-full animate-spin',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
