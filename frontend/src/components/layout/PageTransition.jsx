import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname + location.search} className="fc-page-content">
      {children}
    </div>
  );
}