'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/lib/supabase/useUser';
import { createClient } from '@/lib/supabase/client';
import { startRoomQuiz, endRoomQuiz } from '@/app/actions/quiz';
import { playCountdownTick, playCountdownGo } from '@/lib/sound';
import {
  Users,
  Trophy,
  Activity,
  Play,
  StopCircle,
  Copy,
  Check,
  Clock,
  Crown,
  Share2,
  RefreshCw,
  Search,
  Zap,
  Sparkles,
  Radio,
  ExternalLink,
  Flame,
  LayoutDashboard,
  QrCode,
  ShieldCheck,
  GraduationCap,
  Maximize2,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { ConfirmationModal } from './ConfirmationModal';

interface Participant {
  rank: number;
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  status: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completionTimeSec: number;
  submittedAt: string | null;
}

interface ActivityEvent {
  id: string;
  userName: string;
  eventType: string;
  metadata: string | null;
  time: string;
}

interface RoomLiveState {
  roomCode: string;
  quizName: string;
  courseName: string;
  status: string;
  questionCount: number;
  timeLimit: number;
  creatorClerkId: string;
  participants: Participant[];
  activities: ActivityEvent[];
}

interface Props {
  initialState: RoomLiveState;
}

export function CreatorDashboard({ initialState }: Props) {
  const { user } = useUser();
  const supabase = useMemo(() => createClient(), []);

  const [state, setState] = useState<RoomLiveState>(initialState);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'activity'>('leaderboard');
  const [showEndModal, setShowEndModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastJoinedPlayer, setLastJoinedPlayer] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Synchronized 3-2-1 countdown state
  const [countdown, setCountdown] = useState<number | null>(null);

  const isHost = user && user.id === state.creatorClerkId;

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${state.roomCode}`
      : `https://joinquiz.vercel.app/room/${state.roomCode}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    joinUrl
  )}&margin=8&color=14-33-61&bgcolor=ffffff`;

  // Supabase Realtime WebSocket Channel (0ms live updates)
  useEffect(() => {
    const channel = supabase.channel(`quiz-room:${state.roomCode}`, {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
        if (!payload || !payload.userId) return;

        setLastJoinedPlayer(payload.userName || 'New Player');
        setTimeout(() => setLastJoinedPlayer(null), 3500);

        setState((prev) => {
          const exists = prev.participants.some(
            (p) => p.userId === payload.userId || p.id === payload.id
          );
          if (exists) return prev;

          const newParticipant: Participant = {
            rank: prev.participants.length + 1,
            id: payload.id || `p_${Date.now()}`,
            userId: payload.userId,
            userName: payload.userName || 'Player',
            userAvatar: payload.userAvatar || null,
            status: payload.status || 'WAITING',
            score: payload.score || 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            completionTimeSec: 0,
            submittedAt: null,
          };

          const newActivity: ActivityEvent = {
            id: `act_${Date.now()}`,
            userName: payload.userName || 'Player',
            eventType: 'JOINED',
            metadata: null,
            time: new Date().toLocaleTimeString(),
          };

          return {
            ...prev,
            participants: [newParticipant, ...prev.participants],
            activities: [newActivity, ...prev.activities],
          };
        });
      })
      .on('broadcast', { event: 'score_updated' }, ({ payload }) => {
        if (!payload || !payload.userId) return;
        setState((prev) => ({
          ...prev,
          participants: prev.participants.map((p) =>
            p.userId === payload.userId ? { ...p, ...payload } : p
          ),
        }));
      })
      .subscribe();

    // Background polling fallback (every 1.5s)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/room/${state.roomCode}/status`);
        if (!res.ok) return;
        const data: RoomLiveState = await res.json();
        setState(data);
      } catch {}
    }, 1500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [state.roomCode, supabase]);

  async function handleManualRefresh() {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/room/${state.roomCode}/status`);
      if (res.ok) {
        const data: RoomLiveState = await res.json();
        setState(data);
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(state.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyJoinLink() {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Handle Start with 3... 2... 1... GO! countdown
  async function handleStart() {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      // 1. Broadcast countdown event across Supabase Realtime channel to all waiting players
      const channel = supabase.channel(`quiz-room:${state.roomCode}`);
      await channel.send({
        type: 'broadcast',
        event: 'quiz_countdown',
        payload: { roomCode: state.roomCode },
      });

      // 2. Run local 3-2-1 countdown on Creator Screen
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

      setTimeout(async () => {
        setCountdown(0);
        playCountdownGo();

        // 3. Mark quiz started in DB and switch to ranking dashboard
        await startRoomQuiz(state.roomCode);
        setState((prev) => ({ ...prev, status: 'IN_PROGRESS' }));

        setTimeout(() => {
          setCountdown(null);
          setActionLoading(false);
          handleManualRefresh();
        }, 1000);
      }, 3000);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to start quiz');
      setActionLoading(false);
      setCountdown(null);
    }
  }

  async function executeEndTournament() {
    setActionLoading(true);
    try {
      await endRoomQuiz(state.roomCode);

      const channel = supabase.channel(`quiz-room:${state.roomCode}`);
      await channel.send({
        type: 'broadcast',
        event: 'quiz_ended',
        payload: { roomCode: state.roomCode },
      });

      await handleManualRefresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to end quiz');
    } finally {
      setActionLoading(false);
      setShowEndModal(false);
    }
  }

  const formatSecs = (sec: number) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return state.participants;
    const q = searchQuery.toLowerCase().trim();
    return state.participants.filter(
      (p) =>
        (p?.userName || '').toLowerCase().includes(q) ||
        (p?.userId || '').toLowerCase().includes(q)
    );
  }, [state.participants, searchQuery]);

  const completedCount = state.participants.filter((p) => p.status === 'SUBMITTED').length;
  const waitingCount = state.participants.filter((p) => p.status === 'WAITING').length;
  const averageScore =
    state.participants.length > 0
      ? Math.round(state.participants.reduce((acc, p) => acc + p.score, 0) / state.participants.length)
      : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 text-[#14213D]">
      {/* Realtime 3... 2... 1... Countdown Fullscreen Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[100] bg-[#14213D]/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 animate-fade-in text-white select-none">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center mb-6 shadow-2xl shadow-[#1769E0]/40 animate-pulse">
            <span className="text-7xl sm:text-9xl font-black font-mono text-white">
              {countdown === 0 ? 'GO!' : countdown}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {countdown === 0 ? 'Launching Tournament!' : 'Starting Quiz in...'}
          </h2>
          <p className="text-sm text-slate-300 mt-2 font-medium">
            Switching host to live ranking dashboard...
          </p>
        </div>
      )}

      {/* Live Player Joined Toast Notification */}
      {lastJoinedPlayer && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#E8F8F0] border border-[#C2F0D8] text-[#0F8A52] shadow-xl backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#0F8A52] animate-pulse" />
          <span className="text-xs font-bold text-[#14213D]">
            <strong className="text-[#0F8A52] font-extrabold">{lastJoinedPlayer}</strong> just joined the room!
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: WAITING LOBBY (ACADEMIC CARD: 6-DIGIT CODE + QR CODE + USERS)   */}
      {/* ========================================================================= */}
      {state.status === 'WAITING' ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Main Room Card */}
          <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 md:p-10 shadow-sm space-y-6 relative overflow-hidden">
            {/* Top Badge & Header */}
            <div className="text-center space-y-2 pb-6 border-b border-[#E5EAF0]">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] text-xs font-bold shadow-2xs">
                <Radio className="w-3.5 h-3.5 text-[#1769E0] animate-pulse" />
                <span className="uppercase tracking-wider text-[11px]">Live Quiz Room Lobby</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title tracking-tight">
                {state.quizName}
              </h1>
              <p className="text-xs sm:text-sm text-[#5B667A]">
                Course Track: <strong className="text-[#14213D]">{state.courseName}</strong> • {state.questionCount} Questions • {state.timeLimit} Min Limit
              </p>
            </div>

            {/* Code + QR Code Side-by-Side Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-stretch">
              {/* Left Column: Room Code Display (3 cols) */}
              <div className="md:col-span-3 rounded-2xl bg-[#F7F8FA] border-2 border-[#E5EAF0] p-5 sm:p-6 flex flex-col justify-between text-center space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#5B667A] uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#1769E0]" />
                    <span>6-Digit Room Code</span>
                  </div>
                  <p className="text-[11px] text-[#5B667A]">
                    Share this code with players to enter at <code className="text-[#1769E0] font-mono font-bold">/join-quiz</code>
                  </p>
                </div>

                {/* Massive 6-Digit Monospace Display */}
                <div className="py-3 px-4 rounded-2xl bg-white border-2 border-[#C8DEF7] shadow-xs">
                  <span className="font-mono text-5xl sm:text-6xl lg:text-7xl font-black tracking-[0.2em] sm:tracking-[0.25em] text-[#1769E0] select-all">
                    {state.roomCode}
                  </span>
                </div>

                {/* Buttons: Copy Code, Copy Link, Open Join Tab */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={copyCode}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20 cursor-pointer active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyJoinLink}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#1769E0] bg-[#EBF3FC] hover:bg-[#DCEBFB] border border-[#C8DEF7] transition-all cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Copy Join Link</span>
                  </button>

                  <Link
                    href={`/room/${state.roomCode}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#14213D] bg-white hover:bg-[#F7F8FA] border border-[#E5EAF0] hover:border-[#CBD5E1] transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#5B667A]" />
                    <span>Open Tab</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: QR Code Box (2 cols) */}
              <div className="md:col-span-2 rounded-2xl bg-[#F7F8FA] border-2 border-[#E5EAF0] p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#14213D]">
                  <QrCode className="w-4 h-4 text-[#1769E0]" />
                  <span>Scan to Join Instantly</span>
                </div>

                {/* QR Code Container */}
                <div className="relative group p-2.5 bg-white rounded-2xl border-2 border-[#E5EAF0] shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt={`Room #${state.roomCode} QR Code`}
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="absolute inset-0 bg-[#14213D]/40 backdrop-blur-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Full Screen</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#5B667A] leading-tight max-w-[200px]">
                  Point phone camera at this QR code to join directly on mobile.
                </p>
              </div>
            </div>

            {/* Inside Box: Joined Players Section */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5EAF0]">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[#14213D] text-base">Joined Players</span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8] flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#0F8A52] animate-ping" />
                    {state.participants.length} Ready in Lobby
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search player name..."
                    className="w-full pl-9 pr-3 py-2 bg-[#F7F8FA] border border-[#E5EAF0] rounded-xl text-xs font-semibold text-[#14213D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Grid of Joined Users */}
              {filteredParticipants.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-[#F7F8FA] border border-dashed border-[#CBD5E1] p-6 space-y-2">
                  <Users className="w-10 h-10 text-[#94A3B8] mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-[#14213D]">
                    Waiting for players to enter with code {state.roomCode}...
                  </p>
                  <p className="text-xs text-[#5B667A]">
                    When participants enter via room code or QR scan, they will instantly appear here live.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                  {filteredParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] flex flex-col items-center text-center gap-2 hover:border-[#1769E0] transition-all shadow-2xs"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#EBF3FC] border-2 border-[#C8DEF7] p-0.5 shadow-xs overflow-hidden flex items-center justify-center">
                        {p.userAvatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={p.userAvatar}
                            alt={p.userName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-[#EBF3FC] flex items-center justify-center font-bold text-sm text-[#1769E0]">
                            {p.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-xs text-[#14213D] truncate max-w-[120px]">
                        {p.userName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8]">
                        Ready in lobby
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Start Quiz Action Card */}
          {isHost ? (
            <div className="text-center pt-2 space-y-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={actionLoading || state.participants.length === 0}
                className="w-full py-4 px-8 rounded-2xl font-bold text-base sm:text-lg text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-lg shadow-[#1769E0]/25 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                <span>
                  {actionLoading
                    ? 'Starting Countdown...'
                    : state.participants.length === 0
                    ? 'Waiting for Players to Join...'
                    : `Start Quiz (${state.participants.length} Players Ready)`}
                </span>
                <Flame className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
              </button>
              <p className="text-xs text-[#5B667A]">
                Clicking start triggers a synchronized 3-second countdown on all players&apos; devices and switches to the live ranking dashboard.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border-2 border-[#E5EAF0] text-center text-xs text-[#5B667A] shadow-xs">
              You are viewing as a participant/guest. The room creator will start the quiz shortly.
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* PHASE 2: LIVE RANKING & LEADERBOARD DASHBOARD (ACADEMIC DESIGN)          */
        /* ========================================================================= */
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner Card */}
          <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    state.status === 'IN_PROGRESS'
                      ? 'bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8] animate-pulse'
                      : 'bg-[#F7F8FA] text-[#5B667A] border border-[#E5EAF0]'
                  }`}
                >
                  {state.status === 'IN_PROGRESS' ? '● Live Ranking Dashboard' : '✓ Tournament Completed'}
                </span>
                <span className="text-xs font-mono font-bold text-[#1769E0] bg-[#EBF3FC] px-2.5 py-0.5 rounded-lg border border-[#C8DEF7]">
                  Room #{state.roomCode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title">
                {state.quizName}
              </h1>
              <p className="text-xs sm:text-sm text-[#5B667A]">
                Category: <strong className="text-[#14213D]">{state.courseName}</strong> • Questions: {state.questionCount} • Real-time Sync Active
              </p>
            </div>

            {/* Host action controls */}
            {isHost && state.status === 'IN_PROGRESS' && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#D92D20] bg-[#FDF2F2] hover:bg-[#FEE4E2] border border-[#FECDCA] transition-all cursor-pointer shadow-2xs"
                >
                  <StopCircle className="w-4 h-4 text-[#D92D20]" />
                  <span>End Tournament</span>
                </button>

                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-2.5 rounded-xl bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] text-[#14213D] transition-all cursor-pointer shadow-2xs"
                  title="Manual refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#1769E0]' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* Metrics summary: 4 White Academic Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#14213D]">{state.participants.length}</div>
              <div className="text-xs font-bold text-[#5B667A] uppercase tracking-wider">Total Players</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#FEF9E7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#B45309]">{waitingCount}</div>
              <div className="text-xs font-bold text-[#5B667A] uppercase tracking-wider">Solving Test</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#E8F8F0] border border-[#C2F0D8] text-[#0F8A52] flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0F8A52]">{completedCount}</div>
              <div className="text-xs font-bold text-[#5B667A] uppercase tracking-wider">Finished</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#1769E0]">{averageScore}%</div>
              <div className="text-xs font-bold text-[#5B667A] uppercase tracking-wider">Average Score</div>
            </div>
          </div>

          {/* Leaderboard Table & Tabs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex p-1 bg-[#F7F8FA] border border-[#E5EAF0] rounded-2xl shadow-2xs">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'leaderboard'
                      ? 'bg-white text-[#1769E0] shadow-xs border border-[#E5EAF0]'
                      : 'text-[#5B667A] hover:text-[#14213D]'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Live Leaderboard ({state.participants.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'activity'
                      ? 'bg-white text-[#1769E0] shadow-xs border border-[#E5EAF0]'
                      : 'text-[#5B667A] hover:text-[#14213D]'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Activity Feed</span>
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter player..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5EAF0] rounded-xl text-xs font-semibold text-[#14213D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 shadow-2xs"
                />
              </div>
            </div>

            {activeTab === 'leaderboard' && (
              <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F7F8FA] text-[#5B667A] text-xs font-bold uppercase tracking-wider border-b border-[#E5EAF0]">
                      <tr>
                        <th className="py-3.5 px-6">Rank</th>
                        <th className="py-3.5 px-6">Player</th>
                        <th className="py-3.5 px-6 text-center">Status</th>
                        <th className="py-3.5 px-6 text-center">Accuracy</th>
                        <th className="py-3.5 px-6 text-center">Score</th>
                        <th className="py-3.5 px-6 text-right">Time Taken</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EAF0]">
                      {filteredParticipants.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-[#F7F8FA] transition-colors">
                          <td className="py-4 px-6 font-mono font-bold">
                            {idx === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[#B45309] font-extrabold">
                                <Crown className="w-4 h-4 fill-[#B45309]" /> #1
                              </span>
                            ) : idx === 1 ? (
                              <span className="text-[#5B667A] font-bold">#2</span>
                            ) : idx === 2 ? (
                              <span className="text-[#B45309] font-bold">#3</span>
                            ) : (
                              <span className="text-[#5B667A]">#{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold text-[#14213D]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center text-xs font-bold text-[#1769E0] shrink-0 overflow-hidden">
                                {p.userAvatar ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={p.userAvatar}
                                    alt={p.userName}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  p.userName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span className="truncate max-w-[160px] font-bold">{p.userName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                p.status === 'SUBMITTED'
                                  ? 'bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8]'
                                  : 'bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7] animate-pulse'
                              }`}
                            >
                              {p.status === 'SUBMITTED' ? 'Completed' : 'Solving'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center font-mono text-xs text-[#5B667A] font-bold">
                            {p.status === 'SUBMITTED' ? `${p.correctAnswers}/${state.questionCount}` : '—'}
                          </td>
                          <td className="py-4 px-6 text-center font-mono font-bold text-base">
                            <span
                              className={
                                p.score >= 70
                                  ? 'text-[#0F8A52]'
                                  : p.score > 0
                                  ? 'text-[#1769E0]'
                                  : 'text-[#5B667A]'
                              }
                            >
                              {p.status === 'SUBMITTED' ? `${p.score}%` : '—'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-xs text-[#5B667A]">
                            {formatSecs(p.completionTimeSec)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-4 divide-y divide-[#E5EAF0] max-h-96 overflow-y-auto shadow-xs">
                {state.activities.map((a) => (
                  <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#1769E0]" />
                      <span className="font-bold text-[#14213D]">{a.userName}</span>
                      <span className="text-[#5B667A]">{a.eventType.toLowerCase()}</span>
                    </div>
                    <span className="text-[#5B667A] font-mono text-[11px]">{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen QR Code Modal */}
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
              Scan to Join Live Quiz
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
              Open phone camera or QR scanner. You will be taken straight to the waiting lobby.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-colors cursor-pointer"
            >
              Close QR View
            </button>
          </div>
        </div>
      )}

      {/* End Tournament Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEndModal}
        variant="danger"
        title="End Tournament Now?"
        message="Are you sure you want to end this live tournament? Submissions will be closed, final ranks computed, and all players notified."
        confirmText="Yes, End Tournament"
        cancelText="Cancel"
        isLoading={actionLoading}
        onConfirm={executeEndTournament}
        onCancel={() => setShowEndModal(false)}
      />
    </div>
  );
}
