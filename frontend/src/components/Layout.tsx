import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import BookingForm from './BookingForm';
import Footer from './Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Layout() {
  const { translations, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = [
    "/images/barber1.jpg",
    "/images/barber2.jpg",
    "/images/barber3.jpg",
  ];

  // Auto switch images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Add RTL-specific classes when Arabic is selected
  const textAlignClass = language === 'ar' ? 'text-right' : 'text-left';

  const renderImageStack = () => (
    <div className="hidden lg:block relative h-[450px] w-full">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px]">
        {/* First image */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] transform -rotate-6">
          <img 
            key={activeImageIndex}
            src={images[(activeImageIndex) % images.length]} 
            alt="Barber Service 1" 
            className="w-full h-full object-cover rounded-[25px] shadow-xl border-4 border-zinc-800 transition-all duration-1000 ease-in-out hover:scale-105"
            style={{
              animation: 'imageFade 1000ms ease-in-out'
            }}
          />
        </div>
        {/* Second image */}
        <div className="absolute top-[100px] left-[160px] w-[280px] h-[280px] transform rotate-3 z-10">
          <img 
            key={activeImageIndex}
            src={images[(activeImageIndex + 1) % images.length]} 
            alt="Barber Service 2" 
            className="w-full h-full object-cover rounded-[25px] shadow-xl border-4 border-zinc-800 transition-all duration-1000 ease-in-out hover:scale-105"
            style={{
              animation: 'imageFade 1000ms ease-in-out'
            }}
          />
        </div>
        {/* Third image */}
        <div className="absolute top-[180px] left-[300px] w-[260px] h-[260px] transform -rotate-3 z-20">
          <img 
            key={activeImageIndex}
            src={images[(activeImageIndex + 2) % images.length]} 
            alt="Barber Service 3" 
            className="w-full h-full object-cover rounded-[25px] shadow-xl border-4 border-zinc-800 transition-all duration-1000 ease-in-out hover:scale-105"
            style={{
              animation: 'imageFade 1000ms ease-in-out'
            }}
          />
        </div>
      </div>
    </div>
  );

  // Add animation keyframes to the component
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes imageFade {
        0% {
          opacity: 0;
          transform: scale(0.95) translateY(10px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const renderBookingSection = () => {
    if (!isAuthenticated) {
      return (
        <div className="w-full max-w-lg mx-auto">
          <BookingForm readOnly />
          <div className="mt-6 text-center">
            <p className="text-zinc-400 mb-4">
              {translations.auth.login.signInToBook}
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
            >
              {translations.auth.login.signIn}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-lg mx-auto">
        <BookingForm />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] gap-8 py-12">
            {language === 'ar' ? (
              <>
                <div className="w-full lg:w-1/2 flex items-center order-2 lg:order-1">
                  {renderBookingSection()}
                </div>

                <div className="w-full lg:w-1/2 flex flex-col justify-center order-1 lg:order-2">
                  <div className={`text-center lg:${textAlignClass} mb-8 lg:mb-12`}>
                    <h1 className={`${
                      language === 'ar' 
                        ? 'text-5xl sm:text-6xl lg:text-7xl font-arabic font-black tracking-normal leading-[1.2]' 
                        : 'text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight'
                    } text-white mb-6`}>
                      {translations.home.hero.title}
                      <span className={`block text-blue-500 ${
                        language === 'ar' 
                          ? 'mt-4 text-4xl sm:text-5xl lg:text-6xl' 
                          : 'mt-2 font-extrabold'
                      }`}>
                        {translations.home.hero.subtitle}
                      </span>
                    </h1>
                    <p className={`${
                      language === 'ar'
                        ? 'text-xl sm:text-2xl font-arabic leading-[1.8] font-medium'
                        : 'text-lg sm:text-xl leading-relaxed'
                    } text-zinc-400 max-w-2xl mx-auto lg:mx-0 mb-8 lg:mb-16`}>
                      {translations.home.hero.description}
                    </p>
                  </div>

                  {renderImageStack()}
                </div>
              </>
            ) : (
              <>
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <div className={`text-center lg:${textAlignClass} mb-8 lg:mb-12`}>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                      {translations.home.hero.title}
                      <span className="block text-blue-500 mt-2 font-extrabold">{translations.home.hero.subtitle}</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0 mb-8 lg:mb-16 leading-relaxed">
                      {translations.home.hero.description}
                    </p>
                  </div>

                  {renderImageStack()}
                </div>

                <div className="w-full lg:w-1/2 flex items-center">
                  {renderBookingSection()}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 