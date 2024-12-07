import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ShopClosedOverlay = () => {
  const { translations } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex justify-center"
        >
          <Clock className="w-16 h-16 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          {translations.shopClosed || "We're Currently Closed"}
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-300"
        >
          {translations.shopClosedMessage || "We apologize for any inconvenience. Please check back later or contact us for more information."}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ShopClosedOverlay;
