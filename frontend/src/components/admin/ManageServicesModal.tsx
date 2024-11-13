import React, { useState, useEffect } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
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
}

export default function ManageServicesModal({ isOpen, onClose }: ManageServicesModalProps) {
  const { translations } = useLanguage();
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServices = async (page: number) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/ld+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data: ServiceResponse = await response.json();
      setServices(data.member);
      setTotalPages(Math.ceil(data.totalItems / 30)); // Assuming 30 items per page
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

        // Remove the deleted service from the state
        setServices(prevServices => 
          prevServices.filter(service => service.id !== serviceId)
        );

        // Show success message (you can add a toast notification here)
        console.log('Service deleted successfully');
      } catch (err) {
        console.error('Error deleting service:', err);
        setError(translations.admin.services.errorDeleting || 'Failed to delete service');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl"
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

        {/* Services List */}
        <div className="p-4">
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
                  className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>

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