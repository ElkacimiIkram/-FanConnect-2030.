export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
}) {
  return (
    <div
      className={`fc-glass-card ${hover ? 'fc-glass-card--hover' : ''} ${glow ? 'fc-glass-card--glow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}