import { motion } from 'framer-motion';
import { getOccupancyLabel } from '../../utils/occupancy';

const LEVEL_TEXT = {
  GREEN: 'text-emerald-400',
  ORANGE: 'text-amber-400',
  RED: 'text-red-400',
};

const RING_COLORS = {
  GREEN: '#16b364',
  ORANGE: '#f59e0b',
  RED: '#ef4444',
};

export default function ProgressRing({
  percentage = 0,
  level = 'GREEN',
  size = 56,
  strokeWidth = 4,
  showLabel = true,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const color = RING_COLORS[level] || RING_COLORS.GREEN;

  return (
    <div className="fc-progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      {showLabel && (
        <div className="fc-progress-ring__label">
          <span className="fc-progress-ring__pct">{Math.round(percentage)}%</span>
          <span className={`fc-progress-ring__level ${LEVEL_TEXT[level] || LEVEL_TEXT.GREEN}`}>
            {getOccupancyLabel(level).split(' ')[0]}
          </span>
        </div>
      )}
    </div>
  );
}