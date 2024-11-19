import React, { useState, useEffect } from 'react';
import { X, Trash2, Loader2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
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
  duration: number;
  createdAt: string;
  updatedAt: string;
}

interface ServiceResponse {
  "@context": string;
  "@id": string;
  "@type": string;
  "totalItems": number;
  "member": Service[];
  "view": {
    "@id": string;
    "@type": string;
    "first": string;
    "last": string;
    "next"?: string;
    "previous"?: string;
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
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    serviceId: number | null;
  }>({
    isOpen: false,
    serviceId: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

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
      
      // Update pagination state based on view
      setHasNextPage(!!data.view?.next);
      setHasPrevPage(!!data.view?.previous);

      // Log pagination info for debugging
      console.log('Pagination info:', {
        totalItems: data.totalItems,
        currentPage,
        hasNext: !!data.view?.next,
        hasPrev: !!data.view?.previous
      });
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
  }, [isOpen, currentPage, token]);

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleDelete = async (serviceId: number) => {
    setDeleteConfirmation({
      isOpen: true,
      serviceId: serviceId
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.serviceId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${deleteConfirmation.serviceId}`, {
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
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation({ isOpen: false, serviceId: null });
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
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-blue-500">{service.price} DH</p>
                        <span className="text-zinc-500">•</span>
                        <p className="text-zinc-400 text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration} min
                        </p>
                      </div>
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
                  disabled={!hasPrevPage || currentPage === 1}
                  className={`p-2 rounded-lg ${
                    !hasPrevPage || currentPage === 1
                      ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  } transition-colors`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className={`p-2 rounded-lg ${
                    !hasNextPage
                      ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  } transition-colors`}
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

        {/* Add Delete Confirmation Modal */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div 
              className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-rose-500/10 rounded-full">
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-lg font-medium text-white">
                  {translations.admin.services.confirmDeleteTitle || 'Delete Service'}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {translations.admin.services.confirmDeleteMessage || 'Are you sure you want to delete this service? This action cannot be undone.'}
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, serviceId: null })}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border border-zinc-700 
                           text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 
                           transition-colors focus:outline-none focus:ring-2 
                           focus:ring-blue-500/60 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  {translations.common.cancel}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium 
                             ${isDeleting 
                               ? 'bg-rose-500/50 cursor-not-allowed' 
                               : 'bg-rose-500 hover:bg-rose-600'} 
                             text-white transition-colors 
                             focus:outline-none focus:ring-2 focus:ring-rose-500/60 
                             focus:ring-offset-2 focus:ring-offset-zinc-900
                             disabled:opacity-70`}
                >
                  <span className="flex items-center gap-2">
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {translations.common.deleting || 'Deleting...'}
                      </>
                    ) : (
                      translations.common.delete
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 