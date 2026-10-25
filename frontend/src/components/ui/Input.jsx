export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      )}
      <input
        className={`input-arena ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''} ${className}`}
        {...props}
      />
      {error && <span className="mt-1.5 block text-sm font-medium text-red-600">{error}</span>}
    </label>
  );
}