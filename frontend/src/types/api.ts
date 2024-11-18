export interface AppointmentService {
  id: number;
  quantity: number;
  price: number;
  service?: Service;
}

export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
}

export interface ApiCollection<T> {
  "@context": string;
  "@id": string;
  "@type": string;
  "totalItems": number;
  "member": T[];
} 