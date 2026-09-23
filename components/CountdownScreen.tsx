'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

export function CountdownScreen({ redirectUrl }: { redirectUrl: string }) {
  const router = useRouter();
  const [count, setCount] = useState(3);
  const [phase, setPhase] = useState<'counting' | 'go' | 'done'>('counting');

  useEffect(() => {
    if (phase === 'done') {
      router.push(redirectUrl);
      return;
    }

    if (phase === 'go') {
      const timer = setTimeout(() => setPhase('done'), 700);
      return () => clearTimeout(timer);
    }

    if (count > 0) {
      const timer = setTimeout(() => {
        if (count === 1) {
          setPhase('go');
        } else {
          setCount((c) => c - 1);
        }
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [count, phase, redirectUrl, router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F7F8FA] select-none">
      <div className="relative z-10 text-center space-y-6">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5EAF0] text-[#1769E0] text-xs font-bold shadow-xs">
          <GraduationCap className="w-4 h-4 text-[#1769E0]" />
          <span className="uppercase tracking-wider">Practice Arena • Starting Session</span>
        </div>

        <p className="text-xs sm:text-sm text-[#5B667A] font-medium">
          Prepare your focus. Question timer will start immediately.
        </p>

        {/* Countdown Number */}
        {phase === 'counting' && count > 0 && (
          <div key={count} className="py-2">
            <span className="text-[100px] sm:text-[140px] font-black text-[#14213D] font-serif-title tabular-nums leading-none tracking-tight">
              {count}
            </span>
          </div>
        )}

        {/* START! */}
        {phase === 'go' && (
          <div className="py-2 animate-scale-in">
            <span className="text-[72px] sm:text-[96px] font-black text-[#1769E0] font-serif-title leading-none tracking-tight">
              START!
            </span>
          </div>
        )}

        {/* Loading state */}
        {phase === 'done' && (
          <div className="flex flex-col items-center gap-3 pt-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#E5EAF0] border-t-[#1769E0] animate-spin" />
            <span className="text-xs font-semibold text-[#5B667A]">Loading questions...</span>
          </div>
        )}
      </div>
    </div>
  );
}
