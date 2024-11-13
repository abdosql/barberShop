import React from 'react';
import Navbar from './Navbar';
import BookingForm from './BookingForm';
import Footer from './Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function Layout() {
  const { translations, language } = useLanguage();
  
  const images = [
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1584486483122-af7d49cf2992?auto=format&fit=crop&q=80&w=2070",
  ];

  // Add RTL-specific classes when Arabic is selected
  const textAlignClass = language === 'ar' ? 'text-right' : 'text-left';

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Background Image */}
        <div className="fixed inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2074"
            alt="Barber Shop Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/90 via-zinc-900/80 to-zinc-900/90" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] gap-8 py-12">
              {language === 'ar' ? (
                <>
                  {/* Booking Form Section - Left in Arabic */}
                  <div className="w-full lg:w-1/2 flex items-center order-2 lg:order-1">
                    <div className="w-full max-w-md mx-auto">
                      <BookingForm />
                    </div>
                  </div>

                  {/* Images Section - Right in Arabic */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center order-1 lg:order-2">
                    <div className={`text-center lg:${textAlignClass} mb-8 lg:mb-12`}>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                        {translations.home.hero.title}
                        <span className="block text-blue-500">{translations.home.hero.subtitle}</span>
                      </h1>
                      <p className="text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0 mb-8 lg:mb-16">
                        {translations.home.hero.description}
                      </p>
                    </div>

                    <div className="hidden lg:block relative h-[450px] w-full">
                      {/* Images with same styling */}
                      <div className="absolute top-0 right-0 w-[300px] h-[300px] transform -rotate-6 hover:scale-105 transition-transform duration-300">
                        <img src={images[0]} alt="Barber Service 1" className="w-full h-full object-cover rounded-[25px] shadow-xl border-4 border-zinc-800" />
                      </div>
                      <div className="absolute top-[100px] right-[200px] w-[280px] h-[280px] transform rotate-3 z-10 hover:scale-105 transition-transform duration-300">
                        <img src={images[1]} alt="Barber Service 2" className="w-full h-full object-cover rounded-[25px] shadow-xl border-4 border-zinc-800" />
                      </div>
                      <div className="absolute top-[180px] right-[40px] w-[260px] h-[260px] transform -rotate-3 z-20 hover:scale-105 transition-transform duration-300">
                        <img src={images[2]} alt="Barber Service 3" className="w-full h-full object-cover rounded-[25px] shadow-xl border-4 border-zinc-800" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Images Section - Left in English/French */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center">
                    <div className={`text-center lg:${textAlignClass} mb-8 lg:mb-12`}>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                        {translations.home.hero.title}
                        <span className="block text-blue-500">{translations.home.hero.subtitle}</span>
                      </h1>
                      <p className="text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0 mb-8 lg:mb-16">
                        {translations.home.hero.description}
                      </p>
                    </div>

                    <div className="hidden lg:block relative h-[450px] w-full">
                      <div className="absolute top-0 left-0 w-[300px] h-[300px] transform -rotate-6 hover:scale-105 transition-transform duration-300">
                        <img src={images[0]} alt="Barber Service 1" className="w-full h-full object-cover rounded-[25px] shadow-xl border-4 border-zinc-800" />
                      </div>
                      <div className="absolute top-[100px] left-[200px] w-[280px] h-[280px] transform rotate-3 z-10 hover:scale-105 transition-transform duration-300">
                        <img src={images[1]} alt="Barber Service 2" className="w-full h-full object-cover rounded-[25px] shadow-xl border-4 border-zinc-800" />
                      </div>
                      <div className="absolute top-[180px] left-[40px] w-[260px] h-[260px] transform -rotate-3 z-20 hover:scale-105 transition-transform duration-300">
                        <img src={images[2]} alt="Barber Service 3" className="w-full h-full object-cover rounded-[25px] shadow-xl border-4 border-zinc-800" />
                      </div>
                    </div>
                  </div>

                  {/* Booking Form Section - Right in English/French */}
                  <div className="w-full lg:w-1/2 flex items-center">
                    <div className="w-full max-w-md mx-auto">
                      <BookingForm />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 