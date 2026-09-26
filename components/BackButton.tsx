'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallbackUrl = '/',
  label = 'Back',
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <div className={`flex items-center justify-start ${className}`}>
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F7F8FA] border border-[#E5EAF0] hover:border-[#C8DEF7] text-[#14213D] transition-all text-xs font-bold shadow-xs cursor-pointer group"
        aria-label={label}
        title="Go back to previous page or session"
      >
        <div className="w-5 h-5 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center text-[#1769E0] group-hover:bg-[#1769E0] group-hover:text-white transition-colors">
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span>{label}</span>
      </button>
    </div>
  );
}
