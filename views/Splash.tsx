import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface SplashProps {
  onEnter: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onEnter }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-sm flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 text-3xl font-bold text-brand-600 border border-gray-100">
          JS
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Jalpan<span className="text-brand-600">Sewa</span></h1>
        <p className="text-gray-500 mb-8">Attendance Portal</p>

        <button 
          onClick={onEnter}
          className="w-full bg-brand-600 text-white font-medium py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
        >
          Enter Portal
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};