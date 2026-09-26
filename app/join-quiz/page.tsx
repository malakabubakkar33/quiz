import { RoomCodeInput } from '@/components/RoomCodeInput';
import { Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Quiz Room | QuizCode',
  description: 'Enter your 6-digit invite code or scan the QR code to join a live multiplayer coding quiz room.',
};

export default function JoinQuizPage() {
  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 space-y-6">
      <div className="text-center mb-6 space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7] flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <Users className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title tracking-tight">
          Join a Quiz Room
        </h1>

        <p className="text-xs sm:text-sm text-[#5B667A] max-w-sm mx-auto">
          Enter the 6-digit numeric room code or scan the host&apos;s QR code to enter the live arena.
        </p>
      </div>

      <div className="bg-white border-2 border-[#E5EAF0] rounded-2xl p-6 shadow-xs">
        <RoomCodeInput size="lg" />
      </div>
    </div>
  );
}
