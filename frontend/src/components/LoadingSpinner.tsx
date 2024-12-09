import React from 'react';
import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        {/* Rotating scissors animation */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="relative z-10"
        >
          <Scissors className="w-16 h-16 text-red-400" />
        </motion.div>

        {/* Pulsing background effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-red-500/10 rounded-full -z-10"
        />
      </motion.div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-lg text-zinc-400 font-medium"
      >
        Loading...
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
