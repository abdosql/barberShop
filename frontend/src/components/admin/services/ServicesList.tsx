import React from 'react';
import { Service } from '../../../types/service';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ServicesListProps {
  services: Service[];
}

export const ServicesList: React.FC<ServicesListProps> = ({ services }) => {
  const { translations } = useLanguage();

  return (
    <div className="space-y-2">
      {services.length > 0 ? (
        services.map((service) => (
          <div
            key={`service-${service['@id']}`}
            className="p-3 bg-zinc-800/50 rounded-lg flex items-center justify-between"
          >
            <span className="text-zinc-200">{service.name}</span>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-zinc-400">
          {translations.admin.services.modal.noServices}
        </div>
      )}
    </div>
  );
};
