'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hash, AlertCircle, ArrowRight, Loader2, CheckCircle2, Search } from 'lucide-react';
import { validateRoomCode } from '@/app/actions/quiz';

interface Props {
  size?: 'sm' | 'lg';
  className?: string;
  placeholder?: string;
}

export function RoomCodeInput({ size = 'lg', className = '', placeholder = 'Enter 6-digit room code (e.g. 849201)' }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const isLg = size === 'lg';
  const isComplete = code.length === 6;

  // Accept ONLY numeric characters, maximum 6 digits
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
    if (error) setError(null);
    if (isSuccess) setIsSuccess(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit room code to join.');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const res = await validateRoomCode(code);

      if (!res.success) {
        if (res.requireAuth) {
          router.push(`/login?redirect_url=/room/${code}`);
          return;
        }
        setError(res.error || 'Quiz room not found or has concluded.');
        setIsValidating(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/room/${code}`);
      }, 250);
    } catch {
      setError('Network error validating room code. Please try again.');
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className={`w-full ${className || 'max-w-md'}`}>
      <div
        className={`relative flex items-center rounded-2xl bg-white bg-card-white border-2 transition-all duration-200 shadow-md hover:shadow-lg ${
          error
            ? 'border-[#DC2626] ring-4 ring-red-100'
            : isSuccess
            ? 'border-[#10B981] ring-4 ring-emerald-100'
            : isComplete
            ? 'border-[#1769E0] ring-4 ring-[#1769E0]/20'
            : 'border-[#D1DCEB] hover:border-[#1769E0]/60 focus-within:border-[#1769E0] focus-within:ring-4 focus-within:ring-[#1769E0]/15'
        } ${isLg ? 'p-2 pl-4' : 'p-1.5 pl-3'}`}
      >
        {/* Left Search / Room Code Icon */}
        <div
          className={`flex items-center justify-center rounded-xl transition-colors ${
            isSuccess
              ? 'bg-emerald-50 text-[#10B981]'
              : isComplete
              ? 'bg-blue-subtle bg-[#EBF3FC] text-blue-primary text-[#1769E0]'
              : 'bg-[#F0F4F8] text-[#1769E0]'
          } ${isLg ? 'w-10 h-10' : 'w-8 h-8'} shrink-0`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          ) : (
            <Hash className={isLg ? 'w-5 h-5' : 'w-4 h-4'} />
          )}
        </div>

        {/* 6-Digit Numeric Input */}
        <div className="relative flex-1 px-3 min-w-0">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={placeholder}
            value={code}
            onChange={handleChange}
            maxLength={6}
            disabled={isValidating || isSuccess}
            className={`w-full bg-transparent text-navy-primary text-[#14213D] font-mono placeholder:font-sans placeholder:text-[#8E9AAB] focus:outline-none transition-all ${
              code ? 'tracking-[0.25em] font-bold text-base sm:text-lg' : 'tracking-normal font-normal text-xs sm:text-sm'
            }`}
          />
        </div>

        {/* Live Digits Counter Badge */}
        {code.length > 0 && code.length < 6 && (
          <span className="text-[11px] font-mono font-bold text-[#1769E0] bg-[#EBF3FC] px-2 py-0.5 rounded-md mr-2 shrink-0">
            {code.length}/6
          </span>
        )}

        {/* Join Room CTA Button (Always clearly visible as an interactive button) */}
        <button
          type="submit"
          disabled={isValidating || isSuccess}
          className={`shrink-0 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-[0.98] ${
            isSuccess
              ? 'bg-[#10B981] text-white'
              : 'bg-[#1769E0] hover:bg-[#1257BD] text-white'
          } ${isLg ? 'px-6 py-3 text-xs sm:text-sm' : 'px-4 py-2 text-xs'}`}
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Joining...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <span>Join Room</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Error Feedback Message */}
      {error && (
        <div className="flex items-center justify-center gap-2 mt-2 text-[#DC2626] text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
