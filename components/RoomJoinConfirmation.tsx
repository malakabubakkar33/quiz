'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinQuizRoom } from '@/app/actions/quiz';
import { useUser } from '@/lib/supabase/useUser';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Clock,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Play,
  LayoutDashboard,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';

interface RoomDetails {
  id: string;
  roomCode: string;
  creatorName: string;
  creatorClerkId: string;
  courseName: string;
  courseSlug: string;
  quizName: string;
  description: string | null;
  questionCount: number;
  timeLimit: number;
  difficulty: string | null;
  instructions: string | null;
  status: string;
  participantsCount: number;
}

interface Props {
  room: RoomDetails;
}

export function RoomJoinConfirmation({ room }: Props) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHost = isLoaded && user && user.id === room.creatorClerkId;
  const isCompleted = room.status === 'COMPLETED';

  async function handleJoin() {
    if (!isLoaded) return;
    if (!user) {
      router.push(`/login?redirect_url=/room/${room.roomCode}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await joinQuizRoom(room.roomCode);

      // Instant Realtime broadcast to Host and Waiting Room
      if (res.participant) {
        try {
          const supabase = createClient();
          const channel = supabase.channel(`quiz-room:${room.roomCode}`);
          channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.send({
                type: 'broadcast',
                event: 'player_joined',
                payload: res.participant,
              });
              supabase.removeChannel(channel);
            }
          });
        } catch {}
      }

      if (room.status === 'IN_PROGRESS') {
        router.push(`/room/${room.roomCode}/quiz`);
      } else {
        router.push(`/room/${room.roomCode}/waiting`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join quiz room.');
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-sm relative overflow-hidden text-[#14213D] space-y-6">
      {/* Header */}
      <div className="relative space-y-3 pb-6 border-b border-[#E5EAF0]">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{room.courseName}</span>
          </span>
          <span className="font-mono text-sm font-bold text-[#1769E0] bg-[#F7F8FA] px-3 py-1 rounded-xl border border-[#E5EAF0]">
            #{room.roomCode}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title tracking-tight">
          {room.quizName}
        </h1>

        {room.description && (
          <p className="text-xs sm:text-sm text-[#5B667A] leading-relaxed">
            {room.description}
          </p>
        )}

        <div className="text-xs text-[#5B667A] flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-[#1769E0]" />
          <span>Hosted by</span>
          <strong className="text-[#14213D]">{room.creatorName}</strong>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] text-center space-y-1">
          <HelpCircle className="w-4 h-4 text-[#1769E0] mx-auto" />
          <div className="text-lg font-bold text-[#14213D]">{room.questionCount}</div>
          <div className="text-[11px] text-[#5B667A] uppercase font-bold tracking-wider">Questions</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] text-center space-y-1">
          <Clock className="w-4 h-4 text-[#B45309] mx-auto" />
          <div className="text-lg font-bold text-[#14213D]">{room.timeLimit}m</div>
          <div className="text-[11px] text-[#5B667A] uppercase font-bold tracking-wider">Time Limit</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] text-center space-y-1">
          <Users className="w-4 h-4 text-[#0F8A52] mx-auto" />
          <div className="text-lg font-bold text-[#14213D]">{room.participantsCount}</div>
          <div className="text-[11px] text-[#5B667A] uppercase font-bold tracking-wider">Joined</div>
        </div>
      </div>

      {/* Instructions / Rules */}
      {room.instructions ? (
        <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] space-y-1.5">
          <div className="text-xs font-bold text-[#14213D] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1769E0]" />
            <span>Host Instructions</span>
          </div>
          <p className="text-xs text-[#5B667A] whitespace-pre-line leading-relaxed">
            {room.instructions}
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] text-xs text-[#5B667A] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1769E0] shrink-0" />
          <span>Tab switches and focus loss are monitored during this live room quiz.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#D92D20]" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {isCompleted ? (
          <div className="text-center p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0]">
            <p className="text-sm font-bold text-[#14213D] mb-2">This quiz room has already ended.</p>
            <Link
              href={`/room/${room.roomCode}/dashboard`}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1769E0] hover:text-[#1257BD]"
            >
              View Room Results <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Joining Room...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Enter Waiting Room</span>
                </>
              )}
            </button>

            {isHost && (
              <Link
                href={`/room/${room.roomCode}/dashboard`}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-[#1769E0]" />
                <span>Open Host Dashboard</span>
              </Link>
            )}
          </>
        )}

        <div className="text-center pt-2">
          <Link
            href="/join-quiz"
            className="text-xs text-[#5B667A] hover:text-[#14213D] transition-colors font-medium"
          >
            ← Enter a different room code
          </Link>
        </div>
      </div>
    </div>
  );
}
