import { useState } from 'react';
import { getBusinessImageUrl } from '../../utils/businessImage';

export default function BusinessImage({
  business,
  alt,
  className = '',
  imageIndex = 0,
  overlay = false,
  loading = 'lazy',
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = getBusinessImageUrl(business, imageIndex);
  const label = alt || business?.name || 'Établissement';

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-primary-500/20 via-emerald-400/10 to-accent-500/20 ${className}`}
        aria-label={label}
      >
        <span className="text-4xl opacity-80" aria-hidden>
          {business?.businessType === 'RESTAURANT' ? '🍽️' : '☕'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 shimmer-bg" aria-hidden />
      )}
      <img
        src={src}
        alt={label}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition duration-700 ${
          loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
        }`}
      />
      {overlay && <div className="image-overlay-gradient absolute inset-0" aria-hidden />}
    </div>
  );
}