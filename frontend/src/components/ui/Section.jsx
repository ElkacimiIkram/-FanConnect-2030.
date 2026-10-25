export default function Section({ title, description, action, children, className = '' }) {
  return (
    <section className={`arena-card p-5 sm:p-6 ${className}`}>
      {(title || description || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="font-display text-lg font-bold text-ink sm:text-xl">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-ink-muted">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}