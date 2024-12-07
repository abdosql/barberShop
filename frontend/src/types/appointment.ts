export interface Appointment {
  "@id": string;
  "@type": string;
  id: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  totalDuration: number;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
  user_: {
    "@id": string;
    "@type": string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
  };
  appointmentServices: string[];
  timeSlots: string[];
}
