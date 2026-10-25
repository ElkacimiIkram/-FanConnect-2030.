import { motion } from 'framer-motion';

export default function BookingProgressTracker({ steps, currentStep }) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="fc-booking-progress">
      <div className="fc-booking-progress__track">
        <motion.div
          className="fc-booking-progress__fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="fc-booking-progress__steps">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;
          return (
            <motion.div
              key={label}
              className={`fc-booking-progress__step ${
                isActive ? 'fc-booking-progress__step--active' : ''
              } ${isDone ? 'fc-booking-progress__step--done' : ''}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="fc-booking-progress__dot">
                {isDone ? '✓' : stepNum}
              </span>
              <span className="fc-booking-progress__label hidden sm:inline">{label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}