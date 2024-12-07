import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, PhoneCall, MapPin, Scissors } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const ShopClosedPage = () => {
  const { translations } = useLanguage();

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Content */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block p-4 bg-zinc-800/50 rounded-full mb-6 relative"
            >
              <Clock className="w-12 h-12 text-red-400" />
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
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-zinc-400">
                {translations.shopClosed || "We're Not Working Today"}
              </h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Scissors className="w-5 h-5 text-red-400" />
                <span className="text-xl text-zinc-400">
                  {translations.shopClosedMessage || "Our barbershop is taking a break today. We'll be back to serve you with fresh cuts and great styles!"}
                </span>
                <Scissors className="w-5 h-5 text-red-400 transform scale-x-[-1]" />
              </div>
            </motion.div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Hours Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-700/50 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-200">
                  {translations.regularHours || "Regular Hours"}
                </h3>
              </div>
              <div className="space-y-3 text-zinc-400">
                <div className="flex justify-between items-center">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Saturday</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-700/50 rounded-lg">
                  <PhoneCall className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-200">
                  {translations.getInTouch || "Get in Touch"}
                </h3>
              </div>
              <div className="space-y-4 text-zinc-400">
                <div className="flex items-start gap-3">
                  <PhoneCall className="w-5 h-5 mt-1 text-red-400" />
                  <div>
                    <p className="font-medium text-zinc-300">+1 234 567 890</p>
                    <p className="text-sm text-zinc-500">Available during business hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 text-red-400" />
                  <div>
                    <p className="font-medium text-zinc-300">123 Main Street</p>
                    <p className="text-sm text-zinc-500">Downtown, City, State 12345</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-all duration-300 group"
            >
              <span>{translations.backToHome || "Back to Home"}</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="opacity-50 group-hover:opacity-100"
              >
                →
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopClosedPage;
