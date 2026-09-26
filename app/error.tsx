'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center select-none bg-[#F7F8FA]">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in bg-white border-2 border-[#E5EAF0] p-8 rounded-3xl shadow-xs">
        {/* Error icon badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-xs sm:text-sm text-[#5B667A] leading-relaxed">
            An unexpected glitch occurred while rendering this view. Your session and quiz answers remain intact.
          </p>
        </div>

        {/* Error Details */}
        {error?.message && (
          <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] text-left">
            <div className="text-[11px] font-mono text-[#D92D20] break-words line-clamp-3">
              {error.message}
            </div>
            {error.digest && (
              <div className="text-[10px] font-mono text-[#5B667A] mt-1">
                Digest: {error.digest}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#5B667A] hover:text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
