'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

export function AppSplashLoader() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    try {
      const hasLoaded = sessionStorage.getItem('cq_splash_loaded');
      if (hasLoaded) return;
    } catch {
      return;
    }

    setVisible(true);

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 400);

    const hideTimer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('cq_splash_loaded', 'true');
      } catch {}
    }, 700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={() => setVisible(false)}
      className={`fixed inset-0 z-[99999] bg-[#F7F8FA] flex flex-col items-center justify-center transition-opacity duration-300 select-none cursor-pointer ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Brand Icon */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#10233F] text-white flex items-center justify-center shadow-md font-mono font-black text-lg">
          &lt;/&gt;
        </div>

        {/* Sleek Dual-Ring Circular Loader */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#E5EAF0] border-t-[#1769E0] animate-spin" />
        </div>
      </div>
    </div>
  );
}
