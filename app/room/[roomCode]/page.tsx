import { getRoomDetails } from '@/app/actions/quiz';
import { RoomJoinConfirmation } from '@/components/RoomJoinConfirmation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ roomCode: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { roomCode } = await params;
  const room = await getRoomDetails(roomCode);

  if (!room) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-24 text-center">
        <div className="p-8 rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#14213D] font-serif-title">Room Not Found</h2>
          <p className="text-xs text-[#5B667A]">
            No active quiz room found with code <strong className="text-[#1769E0] font-mono font-bold">{roomCode}</strong>. Please check the code and try again.
          </p>
          <Link
            href="/join-quiz"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Try Again</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-12 md:py-16">
      <RoomJoinConfirmation room={room} />
    </div>
  );
}
