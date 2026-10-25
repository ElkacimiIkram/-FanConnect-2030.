export default function PageHeader({ badge, title, subtitle, children, className = '' }) {
  return (
    <div className={`mb-8 animate-fade-up ${className}`}>
      {badge && <span className="badge-arena mb-4">{badge}</span>}
      <h1 className="section-title">{title}</h1>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}