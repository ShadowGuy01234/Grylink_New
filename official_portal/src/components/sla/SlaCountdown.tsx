import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineExclamation } from 'react-icons/hi';

interface SlaCountdownProps {
  targetDate: string;
  label?: string;
  onExpire?: () => void;
  showAlert?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'inline';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const calculateTimeRemaining = (targetDate: string): TimeLeft => {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const difference = target - now;

  if (difference <= 0) {
    const overdueMs = Math.abs(difference);
    return {
      days: Math.floor(overdueMs / (1000 * 60 * 60 * 24)),
      hours: Math.floor((overdueMs / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((overdueMs / (1000 * 60)) % 60),
      seconds: Math.floor((overdueMs / 1000) % 60),
      total: -overdueMs, // Negative to indicate overdue
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
};

export const SlaCountdown = ({
  targetDate,
  label,
  onExpire,
  showAlert = true,
  size = 'md',
  variant = 'default',
}: SlaCountdownProps) => {
  // Use lazy initial state to avoid effect-based initialization
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeRemaining(targetDate));
  const expiredRef = useRef(false);

  const hasExpired = timeLeft.total <= 0;
  const isAlertShowing = showAlert && timeLeft.total > 0 && timeLeft.total < 2 * 60 * 60 * 1000;

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeRemaining(targetDate);
      setTimeLeft(newTimeLeft);
      
      // Handle expiration callback
      if (newTimeLeft.total <= 0 && !expiredRef.current && onExpire) {
        expiredRef.current = true;
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  const getStatus = () => {
    if (hasExpired) return 'expired';
    if (timeLeft.total < 2 * 60 * 60 * 1000) return 'critical'; // < 2 hours
    if (timeLeft.total < 4 * 60 * 60 * 1000) return 'warning'; // < 4 hours
    if (timeLeft.total < 8 * 60 * 60 * 1000) return 'attention'; // < 8 hours
    return 'normal';
  };

  const status = getStatus();

  const padNumber = (num: number) => num.toString().padStart(2, '0');

  // Compact inline variant
  if (variant === 'inline') {
    return (
      <span className={`sla-countdown-inline ${status} ${size}`}>
        {hasExpired ? (
          <>
            <HiOutlineExclamation className="inline-icon" />
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours}h {timeLeft.minutes}m overdue
          </>
        ) : (
          <>
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours}h {timeLeft.minutes}m
          </>
        )}
      </span>
    );
  }

  // Compact card variant
  if (variant === 'compact') {
    return (
      <motion.div 
        className={`sla-countdown-compact ${status} ${size}`}
        animate={status === 'critical' || status === 'expired' ? { 
          scale: [1, 1.02, 1],
        } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {label && <span className="countdown-label">{label}</span>}
        <div className="countdown-time">
          {hasExpired && <span className="overdue-badge">OVERDUE</span>}
          <span className="time-value">
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {padNumber(timeLeft.hours)}:{padNumber(timeLeft.minutes)}:{padNumber(timeLeft.seconds)}
          </span>
        </div>
      </motion.div>
    );
  }

  // Default full variant
  return (
    <motion.div 
      className={`sla-countdown ${status} ${size}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {label && <span className="countdown-label">{label}</span>}
      
      <AnimatePresence>
        {isAlertShowing && (
          <motion.div
            className="countdown-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <HiOutlineBell className="alert-icon pulse" />
            <span>SLA Critical - Action Required</span>
          </motion.div>
        )}
        {hasExpired && (
          <motion.div
            className="countdown-expired-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <HiOutlineExclamation />
            <span>BREACHED</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="countdown-grid">
        {timeLeft.days > 0 && (
          <div className="countdown-unit">
            <motion.span 
              className="unit-value"
              key={timeLeft.days}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {padNumber(timeLeft.days)}
            </motion.span>
            <span className="unit-label">Days</span>
          </div>
        )}
        <div className="countdown-unit">
          <motion.span 
            className="unit-value"
            key={timeLeft.hours}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {padNumber(timeLeft.hours)}
          </motion.span>
          <span className="unit-label">Hours</span>
        </div>
        <div className="countdown-unit">
          <motion.span 
            className="unit-value"
            key={timeLeft.minutes}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {padNumber(timeLeft.minutes)}
          </motion.span>
          <span className="unit-label">Minutes</span>
        </div>
        <div className="countdown-unit">
          <motion.span 
            className="unit-value"
            key={timeLeft.seconds}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {padNumber(timeLeft.seconds)}
          </motion.span>
          <span className="unit-label">Seconds</span>
        </div>
      </div>

      {hasExpired && (
        <div className="overdue-time">
          Time overdue: {timeLeft.days > 0 && `${timeLeft.days} days, `}
          {timeLeft.hours} hours, {timeLeft.minutes} minutes
        </div>
      )}
    </motion.div>
  );
};

export default SlaCountdown;
