export default function Card({ children, className = '', padding = true, hover = false, id, ...rest }) {
  return (
    <div
      id={id}
      className={`arena-card ${hover ? 'arena-card-hover' : ''} ${padding ? 'p-5 sm:p-6' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}