'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/supabase/useUser';
import { createClient } from '@/lib/supabase/client';
import { playCountdownTick, playCountdownGo } from '@/lib/sound';
import { BackButton } from '@/components/BackButton';
import {
  Users,
  Clock,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Search,
  Radio,
  Share2,
  Zap,
  QrCode,
  GraduationCap,
  Maximize2,
} from 'lucide-react';
import Link from 'next/link';

interface Participant {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  status: string;
}

interface RoomState {
  roomCode: string;
  quizName: string;
  courseName: string;
  status: string;
  questionCount: number;
  timeLimit: number;
  creatorClerkId: string;
  participants: Participant[];
}

interface Props {
  initialState: RoomState;
}

export function WaitingRoom({ initialState }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const supabase = useMemo(() => createClient(), []);

  const [state, setState] = useState<RoomState>(initialState);
  const [copied, setCopied] = useState(false);
  const [startingNotice, setStartingNotice] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPlayerToast, setNewPlayerToast] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const hasRedirectedRef = useRef(false);
  const isCountingDownRef = useRef(false);

  const isHost = user && user.id === state.creatorClerkId;

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${state.roomCode}`
      : `https://joinquiz.vercel.app/room/${state.roomCode}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    joinUrl
  )}&margin=8&color=14-33-61&bgcolor=ffffff`;

  // Supabase Realtime Channel (0ms live updates)
  useEffect(() => {
    const channel = supabase.channel(`quiz-room:${state.roomCode}`, {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
        if (!payload || !payload.userId) return;

        setNewPlayerToast(payload.userName || 'New Player');
        setTimeout(() => setNewPlayerToast(null), 3500);

        setState((prev) => {
          const exists = prev.participants.some(
            (p) => p.userId === payload.userId || p.id === payload.id
          );
          if (exists) return prev;

          const newP: Participant = {
            id: payload.id || `p_${Date.now()}`,
            userId: payload.userId,
            userName: payload.userName || 'Player',
            userAvatar: payload.userAvatar || null,
            status: payload.status || 'WAITING',
          };

          return {
            ...prev,
            participants: [newP, ...prev.participants],
          };
        });
      })
      .on('broadcast', { event: 'quiz_countdown' }, () => {
        if (hasRedirectedRef.current || isCountingDownRef.current) return;
        isCountingDownRef.current = true;

        setCountdown(3);
        playCountdownTick(3);

        setTimeout(() => {
          setCountdown(2);
          playCountdownTick(2);
        }, 1000);

        setTimeout(() => {
          setCountdown(1);
          playCountdownTick(1);
        }, 2000);

        setTimeout(() => {
          setCountdown(0);
          playCountdownGo();

          setTimeout(() => {
            hasRedirectedRef.current = true;
            router.push(`/room/${state.roomCode}/quiz`);
          }, 800);
        }, 3000);
      })
      .on('broadcast', { event: 'quiz_started' }, () => {
        if (!hasRedirectedRef.current && !isCountingDownRef.current) {
          hasRedirectedRef.current = true;
          setStartingNotice(true);
          setTimeout(() => {
            router.push(`/room/${state.roomCode}/quiz`);
          }, 1000);
        }
      })
      .subscribe();

    // 1.5s fast polling fallback
    let isMounted = true;
    async function pollStatus() {
      try {
        const res = await fetch(`/api/room/${state.roomCode}/status`);
        if (!res.ok) return;
        const data: RoomState = await res.json();
        if (!isMounted) return;

        setState(data);

        // Check if quiz has started
        if (data.status === 'IN_PROGRESS' && !hasRedirectedRef.current && !isCountingDownRef.current) {
          hasRedirectedRef.current = true;
          setStartingNotice(true);
          setTimeout(() => {
            router.push(`/room/${state.roomCode}/quiz`);
          }, 600);
        }
      } catch {}
    }

    const interval = setInterval(pollStatus, 1500);

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [state.roomCode, supabase, router]);

  function copyRoomCode() {
    navigator.clipboard.writeText(state.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyJoinLink() {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Filter participants for high concurrency
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return state.participants;
    const q = searchQuery.toLowerCase().trim();
    return state.participants.filter(
      (p) =>
        (p?.userName || '').toLowerCase().includes(q) ||
        (p?.userId || '').toLowerCase().includes(q)
    );
  }, [state.participants, searchQuery]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 text-[#14213D]">
      {/* 3... 2... 1... GO! Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[100] bg-[#14213D]/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 animate-fade-in select-none text-white">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center mb-6 shadow-2xl shadow-[#1769E0]/40 animate-pulse">
            <span className="font-mono text-7xl sm:text-9xl font-black text-white">
              {countdown === 0 ? 'GO!' : countdown}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {countdown === 0 ? 'Quiz Launched!' : 'Quiz Starting In...'}
          </h2>
          <p className="text-sm text-slate-300 font-medium mt-2">
            Get ready to answer fast and climb the leaderboard!
          </p>
        </div>
      )}

      {/* Starting Fullscreen Overlay */}
      {startingNotice && countdown === null && (
        <div className="fixed inset-0 z-[100] bg-[#14213D]/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 animate-fade-in text-white">
          <div className="w-20 h-20 rounded-3xl bg-white/10 border-2 border-white/20 text-[#1769E0] flex items-center justify-center mb-6 animate-bounce shadow-2xl">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-title mb-2 tracking-tight">
            Quiz is Launching!
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-semibold">
            Prepare yourself! Loading quiz questions...
          </p>
        </div>
      )}

      {/* Toast when player joins live */}
      {newPlayerToast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#E8F8F0] border border-[#C2F0D8] text-[#0F8A52] backdrop-blur-xl shadow-xl">
          <Sparkles className="w-4 h-4 text-[#0F8A52] animate-pulse" />
          <span className="text-xs font-bold text-[#14213D]">
            <strong className="text-[#0F8A52] font-extrabold">{newPlayerToast}</strong> entered the room!
          </span>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-between items-center">
        <BackButton fallbackUrl="/join-quiz" label="Leave Waiting Room" />
        {isHost && (
          <Link
            href={`/room/${state.roomCode}/dashboard`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7] hover:bg-[#DCEBFB] transition-all shadow-2xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Host Dashboard</span>
          </Link>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO BANNER: ACADEMIC ROOM CODE & QR CODE                              */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs text-center space-y-6 relative overflow-hidden">
        <div className="space-y-2 pb-5 border-b border-[#E5EAF0]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] text-xs font-bold shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-[#1769E0] animate-pulse" />
            <span className="uppercase tracking-wider text-[11px]">Multiplayer Room Lobby</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title tracking-tight">
            {state.quizName}
          </h1>
          <p className="text-xs sm:text-sm text-[#5B667A]">
            Track: <strong className="text-[#14213D]">{state.courseName}</strong> • {state.questionCount} Questions • {state.timeLimit} Min Limit
          </p>
        </div>

        {/* Code & QR Code Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Left: Room Code */}
          <div className="md:col-span-3 rounded-2xl bg-[#F7F8FA] border-2 border-[#E5EAF0] p-5 sm:p-6 text-center space-y-3">
            <span className="text-xs font-bold text-[#5B667A] uppercase tracking-wider block">
              6-Digit Room Code
            </span>

            <div className="py-2.5 px-4 rounded-2xl bg-white border-2 border-[#C8DEF7] shadow-xs inline-block w-full max-w-sm">
              <span className="font-mono text-4xl sm:text-6xl font-black tracking-[0.2em] sm:tracking-[0.25em] text-[#1769E0] select-all block">
                {state.roomCode}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={copyRoomCode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769E0] hover:bg-[#1257BD] text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-[#1769E0]/20 active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={copyJoinLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EBF3FC] hover:bg-[#DCEBFB] border border-[#C8DEF7] text-xs font-bold text-[#1769E0] transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Invite Link</span>
              </button>
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="md:col-span-2 rounded-2xl bg-[#F7F8FA] border-2 border-[#E5EAF0] p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#14213D]">
              <QrCode className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>Invite Friends Nearby</span>
            </div>

            <div className="relative group p-2 bg-white rounded-xl border border-[#E5EAF0] shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt={`Room #${state.roomCode} QR Code`}
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="absolute inset-0 bg-[#14213D]/40 backdrop-blur-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Enlarge</span>
              </button>
            </div>

            <span className="text-[10px] text-[#5B667A]">Scan camera to join</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WAITING FOR HOST STATUS                                                */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] p-6 text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#EBF3FC] border-2 border-[#C8DEF7] flex items-center justify-center text-[#1769E0]">
              <Users className="w-8 h-8 animate-pulse" />
            </div>
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F8A52] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#0F8A52]"></span>
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#14213D] font-serif-title">
              Waiting for Host to Launch Quiz...
            </h3>
            <p className="text-xs text-[#5B667A] max-w-md mx-auto">
              Please keep this tab open. When the host hits Start, your screen will automatically count down 3-2-1 and start the assessment.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F0] border border-[#C2F0D8] text-xs font-bold text-[#0F8A52]">
            <span className="w-2 h-2 rounded-full bg-[#0F8A52] animate-ping" />
            <span>You are connected and ready</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. LOBBY ROSTER (JOINED PLAYERS)                                          */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5EAF0]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#14213D] uppercase tracking-wider">
                Players in Lobby
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7]">
                {state.participants.length}
              </span>
            </div>

            {/* Live Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lobby..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F7F8FA] border border-[#E5EAF0] rounded-xl text-xs font-semibold text-[#14213D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1769E0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
            {filteredParticipants.map((p) => {
              const isCurrentUser = user && user.id === p.userId;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all shadow-2xs ${
                    isCurrentUser
                      ? 'bg-[#EBF3FC] border-2 border-[#1769E0]'
                      : 'bg-[#F7F8FA] border-[#E5EAF0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center font-bold text-xs text-[#1769E0] overflow-hidden">
                    {p.userAvatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.userAvatar} alt={p.userName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      p.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="font-bold text-xs text-[#14213D] truncate max-w-[120px]">
                    {p.userName} {isCurrentUser && '(You)'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8]">
                    Ready
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quiz Rules & Ethics Card */}
        <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-start gap-3 text-xs text-[#5B667A]">
          <ShieldCheck className="w-4 h-4 text-[#1769E0] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#14213D] block">Assessment Room Integrity Protocol</span>
            <p>
              Tab switching and window blur events are logged automatically. Please maintain continuous window focus throughout the quiz.
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Waiting Room */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-[120] bg-[#14213D]/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white border-2 border-[#E5EAF0] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] text-xs font-bold">
              <QrCode className="w-3.5 h-3.5" />
              <span>Room #{state.roomCode}</span>
            </div>

            <h3 className="text-xl font-bold text-[#14213D] font-serif-title">
              Scan to Enter Room
            </h3>

            <div className="p-3 bg-white rounded-2xl border-2 border-[#E5EAF0] shadow-xs inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt={`Room #${state.roomCode} QR Code`}
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
              />
            </div>

            <p className="text-xs text-[#5B667A]">
              Anyone who scans this QR code will join this waiting lobby directly.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
