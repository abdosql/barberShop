import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Scissors, User, Phone } from 'lucide-react';
import Footer from '../Footer';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background elements remain the same */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A0A0B]" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-transparent to-[#0A0A0B]" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5" />
        </div>

        {/* Content - Added responsive sizing */}
        <div className="w-full max-w-[min(90%,420px)] relative z-10">
          {/* Logo Section - Responsive sizing */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 backdrop-blur-xl border border-white/10">
              <Scissors className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Join Our Barbershop</h2>
            <p className="text-xs sm:text-sm text-zinc-400">Create an account to get started</p>
          </div>

          {/* Form Section - Responsive padding and spacing */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Input fields - Adjusted for responsive sizing */}
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-zinc-800 rounded-lg 
                             bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-zinc-800 rounded-lg 
                             bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-zinc-800 rounded-lg 
                             bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                         py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium 
                         hover:from-blue-600 hover:to-blue-700 transition-all
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                         focus:ring-offset-zinc-900"
              >
                Create Account
              </button>
            </form>

            {/* Sign in Link */}
            <div className="text-center text-xs sm:text-sm pt-1">
              <span className="text-zinc-400">Already have an account?</span>{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 