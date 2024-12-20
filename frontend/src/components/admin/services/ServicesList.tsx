import React from 'react';
import { Service } from '../../../types/service';

interface ServicesListProps {
  services: Service[];
}

export const ServicesList: React.FC<ServicesListProps> = ({ services }) => (
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
        No services found for this appointment
      </div>
    )}
  </div>
);
