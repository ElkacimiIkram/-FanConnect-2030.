const variants = {
  error: 'bg-red-50 text-red-800 border-red-200',
  success: 'bg-primary-50 text-primary-900 border-primary-200',
  info: 'bg-accent-50 text-accent-800 border-accent-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
};

const icons = {
  error: '⚠️',
  success: '✓',
  info: 'ℹ️',
  warning: '⚠️',
};

export default function Alert({ children, variant = 'info' }) {
  return (
    <div
      className={`flex gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium animate-fade-in ${variants[variant]}`}
      role="alert"
    >
      <span aria-hidden>{icons[variant]}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}