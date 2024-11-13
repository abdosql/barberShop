import React, { useState } from 'react';
import { X, Clock, DollarSign, Scissors, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded?: () => void; // Callback to refresh services list
}

export default function AddServiceModal({ isOpen, onClose, onServiceAdded }: AddServiceModalProps) {
  const { translations } = useLanguage();
  const { token } = useAuth();
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          "@context": "/api/contexts/Service",
          "@type": "Service",
          name: serviceName,
          price: price.toString(),
          description: description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData?.['hydra:description'] || 'Failed to create service');
      }

      // Reset form
      setServiceName('');
      setPrice('');
      setDescription('');
      
      // Notify parent component
      onServiceAdded?.();
      onClose();
    } catch (err) {
      console.error('Error creating service:', err);
      setError(translations.admin.services.errorCreating || 'Failed to create service');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-medium text-white">
            {translations.admin.services.addNew}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Service Name Input */}
          <div>
            <label htmlFor="serviceName" className="block text-sm font-medium text-zinc-400 mb-1">
              {translations.admin.services.serviceName}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Scissors className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type="text"
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg
                        text-white placeholder-zinc-500 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={translations.admin.services.serviceNamePlaceholder}
                required
              />
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-zinc-400 mb-1">
              {translations.admin.services.price}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg
                        text-white placeholder-zinc-500 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-400 mb-1">
              {translations.admin.services.description}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg
                      text-white placeholder-zinc-500 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={translations.admin.services.descriptionPlaceholder}
              rows={3}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-zinc-700 rounded-lg text-sm font-medium
                       text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              disabled={isLoading}
            >
              {translations.common.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium
                       hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? translations.common.loading : translations.admin.services.addButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 