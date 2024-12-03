import React, { useState } from 'react';
import Services from './Services';
import TimeSlots from './TimeSlots';
import Summary from './Summary';
import { ArrowLeft } from 'lucide-react';

interface BookingState {
  services: string[];
  time: string;
  selectedTimeSlot?: {
    id: number;
    startTime: string;
    endTime: string;
  };
  totalDuration: number;
}

export default function BookingSection() {
  const [step, setStep] = useState(1);
  const [refreshTimeSlots, setRefreshTimeSlots] = useState(0);
  const [booking, setBooking] = useState<BookingState>({
    services: [],
    time: '',
    selectedTimeSlot: undefined,
    totalDuration: 0
  });

  const updateBooking = (field: keyof BookingState, value: any) => {
    if (field === 'time') {
      setBooking(prev => ({
        ...prev,
        time: value.time,
        selectedTimeSlot: value.timeSlot
      }));
      setStep(prev => Math.min(prev + 1, 3));
    } else if (field === 'services') {
      setBooking(prev => ({ 
        ...prev, 
        services: value.services,
        totalDuration: value.totalDuration
      }));
      // Refresh time slots when services change
      console.log('Services changed, triggering time slot refresh');
      setRefreshTimeSlots(prev => prev + 1);
      setStep(prev => Math.min(prev + 1, 3));
    } else {
      setBooking(prev => ({ ...prev, [field]: value }));
    }
  };

  const goBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  return (
    <main className="relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2074"
          alt="Barber Shop"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-900"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Text */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Professional Grooming
              <span className="block text-amber-500">Just a Click Away</span>
            </h1>
            <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto">
              Book your next premium haircut and beard trim with our expert barbers
            </p>
          </div>

          {/* Booking Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((number) => (
                <React.Fragment key={number}>
                  {number > 1 && (
                    <div className={`h-px w-12 ${number <= step ? 'bg-amber-500' : 'bg-zinc-700'}`} />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      number <= step ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {number}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Booking Content */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {step > 1 && (
                <button
                  onClick={goBack}
                  className="absolute -left-16 top-0 p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}

              {step === 1 && (
                <Services
                  onSelect={(services, totalDuration) => updateBooking('services', { services, totalDuration })}
                  selectedServices={booking.services}
                />
              )}

              {step === 2 && (
                <TimeSlots
                  selectedServices={booking.services}
                  totalDuration={booking.totalDuration}
                  onSelect={(timeData) => updateBooking('time', timeData)}
                  onNext={handleNext}
                  refreshTrigger={refreshTimeSlots}
                />
              )}
              {step === 3 && <Summary booking={booking} onBack={goBack} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}