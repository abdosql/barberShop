import { Appointment } from '../types/appointment';

export const getClientName = (appointment: Appointment) => {
  const user = appointment.user_ || {};
  return {
    fullName: `${user.firstName || 'Unknown'} ${user.lastName || ''}`,
    phone: user.phoneNumber || 'No phone'
  };
};

export const getUrgencyIndicator = (startTime: string) => {
  const appointmentDate = new Date(startTime);
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);
  const appointmentDay = new Date(appointmentDate);
  appointmentDay.setHours(0, 0, 0, 0);
  
  const diffTime = appointmentDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return {
      color: 'bg-rose-500',
      pulseColor: 'bg-rose-500/50',
      title: 'Urgent - Today'
    };
  } else if (diffDays <= 2) {
    return {
      color: 'bg-amber-500',
      pulseColor: 'bg-amber-500/50',
      title: 'Soon - Within 2 days'
    };
  }
  return {
    color: 'bg-emerald-500',
    pulseColor: 'bg-emerald-500/50',
    title: 'Scheduled'
  };
};
