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
    <div className="text-center space-y-6">
      <h1 className="text-5xl font-bold text-gray-900">{title}</h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        {subtitle}
      </p>
      <button 
        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => router.push('/auth/signin')}
      >
        Get Started
      </button>
    </div>
  );
};

export default HeroSection;