'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F8FA] text-[#14213D] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border-2 border-[#E5EAF0] text-center space-y-5 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-[#FDF2F2] text-[#D92D20] border border-[#FECDCA] flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
            !
          </div>
          <h1 className="text-2xl font-bold text-[#14213D]">System Error</h1>
          <p className="text-xs text-[#5B667A]">
            A critical system error occurred. Click below to reload and restore the application.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 rounded-xl bg-[#1769E0] text-white font-bold text-xs hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20 cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
