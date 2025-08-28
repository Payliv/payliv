import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CountdownTimer = ({ expiryTimestamp, primaryColor }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryTimestamp) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
        heures: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        secondes: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-bold" style={{ color: primaryColor }}>
          {timeLeft[interval]}
        </span>
        <span className="text-xs uppercase tracking-wider opacity-75">{interval}</span>
      </div>
    );
  });

  if (!timerComponents.length) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 p-4 rounded-xl border border-white/10 bg-white/5 glass-effect"
    >
      <h4 className="text-center text-lg font-semibold mb-3" style={{ color: primaryColor }}>Offre à durée limitée !</h4>
      <div className="flex justify-center space-x-4 md:space-x-8">
        {timerComponents}
      </div>
    </motion.div>
  );
};

export default CountdownTimer;