const variants = {
  primary:
    'bg-primary-600 text-white shadow-glow hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-glow-lg active:translate-y-0',
  secondary:
    'bg-surface-muted text-ink border border-surface-border hover:border-primary-500/40 hover:bg-primary-600/10',
  danger: 'bg-red-600 text-white hover:bg-red-500 shadow-soft',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink',
  gold: 'bg-gold-shine text-navy-950 shadow-glow-gold hover:-translate-y-0.5 hover:brightness-110',
};

const sizes = {
  sm: 'px-3.5 py-2 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}