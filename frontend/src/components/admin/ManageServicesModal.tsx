import React, { useState, useEffect } from 'react';
import { X, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface ManageServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Service {
  "@id": string;
  "@type": string;
  id: number;
  name: string;
  price: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceResponse {
  "@context": string;
  "@id": string;
  "@type": string;
  "totalItems": number;
  "member": Service[];
  "hydra:view"?: {
    "@id": string;
    "@type": string;
    "hydra:first": string;
    "hydra:last": string;
    "hydra:next"?: string;
    "hydra:previous"?: string;
  };
}

const ITEMS_PER_PAGE = 5; // Number of services to show per page

export default function ManageServicesModal({ isOpen, onClose }: ManageServicesModalProps) {
  const { translations } = useLanguage();
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const fetchServices = async (page: number) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/services?page=${page}&itemsPerPage=${ITEMS_PER_PAGE}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/ld+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data: ServiceResponse = await response.json();
      setServices(data.member);
      setTotalItems(data.totalItems);
      
      // Update pagination state based on hydra:view
      setHasNextPage(!!data['hydra:view']?.['hydra:next']);
      setHasPrevPage(!!data['hydra:view']?.['hydra:previous']);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(translations.admin.services.errorFetching || 'Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchServices(currentPage);
    }
  }, [isOpen, currentPage]);

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (window.confirm(translations.admin.services.confirmDelete)) {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.['hydra:description'] || 
            errorData?.detail || 
            'Failed to delete service'
          );
        }

        // Refresh current page
        fetchServices(currentPage);
      } catch (err) {
        console.error('Error deleting service:', err);
        setError(translations.admin.services.errorDeleting || 'Failed to delete service');
      }
    }
  };

  if (!isOpen) return null;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-medium text-white">
            {translations.admin.services.title}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Services List - Scrollable content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-900">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-rose-500 text-center py-4">{error}</div>
          ) : services.length === 0 ? (
            <div className="text-zinc-400 text-center py-4">No services found</div>
          ) : (
            <div className="space-y-4">
              {services.map(service => (
                <div 
                  key={service.id}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{service.name}</h4>
                      <p className="text-zinc-400 text-sm mt-1">{service.description}</p>
                      <p className="text-blue-500 mt-2">{service.price} DH</p>
                    </div>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                      title={translations.common.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalItems > ITEMS_PER_PAGE && (
          <div className="border-t border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                {translations.common.showing} {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}-
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} {translations.common.of} {totalItems}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={!hasPrevPage}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 
                           disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 
                           disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-zinc-800 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-zinc-800 text-white rounded-lg text-sm font-medium
                     hover:bg-zinc-700 transition-colors"
          >
            {translations.common.close}
          </button>
        </div>
      </div>
    </div>
  );
} 