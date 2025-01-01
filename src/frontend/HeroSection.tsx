'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  title: string;
  subtitle: string;
}

const HeroSection: FC<HeroSectionProps> = ({ title, subtitle }) => {
  const router = useRouter();

  return (
    <div className="relative bg-gradient-to-r from-blue-500 to-indigo-400 text-white min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-opacity-50 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-6">
        <h1 className="text-6xl font-extrabold leading-tight drop-shadow-lg">
          {title}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          {subtitle}
        </p>
        <button
          className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105"
          onClick={() => router.push('/auth/signin')}
        >
          Get Started
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-400 opacity-30 rounded-full blur-xl z-0"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-300 opacity-20 rounded-full blur-2xl z-0"></div>
    </div>
  );
};

export default HeroSection;
