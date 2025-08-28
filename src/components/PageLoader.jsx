import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="relative flex w-24 h-24 items-center justify-center">
        {/* Yellow Element */}
        <motion.div
          className="absolute w-16 h-16 rounded-full border-4 border-primary"
          animate={{
            scale: [1, 1.2, 1, 1.2, 1],
            rotate: [0, 180, 360, 180, 0],
            borderRadius: ["50%", "35%", "50%", "35%", "50%"],
          }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
        {/* Green Element */}
        <motion.div
          className="absolute w-16 h-16 rounded-full border-4 border-secondary"
          animate={{
            scale: [1.2, 1, 1.2, 1, 1.2],
            rotate: [360, 180, 0, 180, 360],
            borderRadius: ["35%", "50%", "35%", "50%", "35%"],
          }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: 0.2,
          }}
        />
      </div>
    </div>
  );
};

export default PageLoader;