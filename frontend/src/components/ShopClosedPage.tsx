import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Scissors } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ShopClosedPage = () => {
  const { translations } = useLanguage();

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block p-6 bg-zinc-800/50 rounded-full mb-8 relative"
            >
              <Clock className="w-16 h-16 text-red-400" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-red-500/10 rounded-full"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-300 via-zinc-200 to-red-300">
                {translations.shopClosed || "We're Closed"}
              </h1>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-transparent to-zinc-900 z-10" />
                <div className="flex items-center justify-center gap-4 overflow-hidden py-2">
                  <motion.div
                    animate={{
                      x: [-10, 10, -10],
                      rotate: [-5, 5, -5]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Scissors className="w-6 h-6 text-red-400" />
                  </motion.div>
                  <p className="text-xl md:text-2xl text-zinc-300 max-w-xl">
                    {translations.shopClosedMessage || "Our barbershop is taking a break. We'll be back soon to serve you with fresh cuts and great styles!"}
                  </p>
                  <motion.div
                    animate={{
                      x: [10, -10, 10],
                      rotate: [5, -5, 5]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Scissors className="w-6 h-6 text-red-400 transform scale-x-[-1]" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopClosedPage;
