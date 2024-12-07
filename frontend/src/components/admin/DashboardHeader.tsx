import React from 'react';
import { Store, Settings, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useShopAvailability } from '../../contexts/ShopAvailabilityContext';

interface DashboardHeaderProps {
  onManageServices: () => void;
  onAddService: () => void;
}

export default function DashboardHeader({ onManageServices, onAddService }: DashboardHeaderProps) {
  const { translations } = useLanguage();
  const { isShopOpen, toggleShopAvailability } = useShopAvailability();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">
        {translations.admin.dashboard.title}
      </h1>
      <div className="flex items-center gap-3">
        <motion.button
          onClick={toggleShopAvailability}
          whileTap={{ scale: 0.95 }}
          className={`
            w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
            bg-zinc-700 hover:bg-zinc-600 rounded-lg 
            text-sm font-medium transition-colors relative group
            ${isShopOpen 
              ? 'text-emerald-400 hover:text-emerald-300' 
              : 'text-red-400 hover:text-red-300'
            }
          `}
        >
          <motion.div
            initial={false}
            animate={{ 
              rotate: isShopOpen ? 0 : 180,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 0.3 },
              scale: { duration: 0.2 }
            }}
          >
            <Store className="w-4 h-4" />
          </motion.div>
          <span>
            {isShopOpen 
              ? (translations.shopOpen || "Shop Open") 
              : (translations.shopClosed || "Shop Closed")
            }
          </span>
          <motion.div
            className={`absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full
              ${isShopOpen ? 'bg-emerald-400' : 'bg-red-400'}
            `}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.button>
        <button
          onClick={onManageServices}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
                   bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg 
                   text-sm font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          {translations.admin.dashboard.manageServices}
        </button>
        <button
          onClick={onAddService}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
                   bg-blue-500 hover:bg-blue-400 text-white rounded-lg 
                   text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {translations.admin.dashboard.addService}
        </button>
      </div>
    </div>
  );
}
