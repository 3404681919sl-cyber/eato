import React from 'react';
import { MapPin, LogIn } from 'lucide-react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CTASection from './CTASection';

export default function LandingPage({ onAuth }: { onAuth: () => void }) {
  return (
    <div className='min-h-screen bg-[#0C0805] text-white overflow-x-hidden' style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Nav */}
      <nav className='fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5'>
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-lg bg-[#BF4E2A] flex items-center justify-center'>
            <MapPin className='w-3.5 h-3.5 text-white' />
          </div>
          <span className='text-lg font-bold tracking-tight' style={{ fontFamily: 'Playfair Display, serif' }}>Eato</span>
        </div>
        <button onClick={onAuth}
          className='flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors'>
          <LogIn className='w-3.5 h-3.5' />
          登录 / 注册
        </button>
      </nav>

      <HeroSection onAuth={onAuth} />
      <FeaturesSection />
      <CTASection onAuth={onAuth} />

      {/* Footer */}
      <footer className='py-10 text-center text-sm text-white/30'>
        <p>&copy; 2026 Eato. All rights reserved.</p>
      </footer>
    </div>
  );
}
