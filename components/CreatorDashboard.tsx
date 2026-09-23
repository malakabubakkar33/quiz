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

  // Synchronized 3-2-1 countdown state
  const [countdown, setCountdown] = useState<number | null>(null);

  const isHost = user && user.id === state.creatorClerkId;

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
    const url = `${window.location.origin}/room/${state.roomCode}`;
    navigator.clipboard.writeText(url);
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Realtime 3... 2... 1... Countdown Fullscreen Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 animate-fade-in">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-cyan-500/20 border-4 border-cyan-400 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/50 animate-pulse">
            <span className="text-6xl sm:text-8xl font-black font-mono text-cyan-300">
              {countdown === 0 ? 'GO!' : countdown}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {countdown === 0 ? 'Launching Tournament!' : 'Starting Quiz in...'}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Switching host to live ranking dashboard...
          </p>
        </div>
      )}

      {/* Live Player Joined Toast Notification */}
      {lastJoinedPlayer && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 backdrop-blur-xl shadow-2xl">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold">
            <strong className="text-white font-extrabold">{lastJoinedPlayer}</strong> just joined the room!
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: WAITING LOBBY (UNIFIED BOX: 8-DIGIT CODE + ALL USERS + START BTN) */}
      {/* ========================================================================= */}
      {state.status === 'WAITING' ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* THE SINGLE UNIFIED LOBBY BOX */}
          <div className="rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10 space-y-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top: 8-Digit Room Code */}
            <div className="text-center space-y-3 pb-6 border-b border-slate-800/80">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>TOURNAMENT ROOM CODE</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {state.quizName} ({state.courseName})
                </h1>
                <p className="text-xs text-slate-400">
                  Share this 8-digit code with players to enter at <code className="text-cyan-400">/join-quiz</code>
                </p>
              </div>

              {/* Massive 8-Digit Monospace Display */}
              <div className="inline-block p-4 sm:p-6 rounded-3xl bg-slate-950/90 border border-cyan-500/50 shadow-2xl shadow-cyan-500/20">
                <span className="font-mono text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.25em] sm:tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 select-all">
                  {state.roomCode}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
                  <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={copyJoinLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Copy Join Link</span>
                </button>

                <Link
                  href={`/room/${state.roomCode}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Join Tab</span>
                </Link>
              </div>
            </div>

            {/* Inside Box: All Joined Users */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-white text-base">Joined Players</span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {state.participants.length} Ready
                  </span>
                </div>

                {/* Search Bar for 1000+ players */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search player name..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Grid of All Joined Users inside the box */}
              {filteredParticipants.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 p-6 space-y-2">
                  <Users className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-slate-400">Waiting for players to join with code {state.roomCode}...</p>
                  <p className="text-xs text-slate-600">Joined players will appear here instantly without refreshing the page.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                  {filteredParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col items-center text-center gap-2 hover:border-cyan-500/40 transition-all shadow-md"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-md">
                        {p.userAvatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.userAvatar} alt={p.userName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-sm text-cyan-400">
                            {p.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-xs text-white truncate max-w-[120px]">{p.userName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                        Ready in lobby
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DIRECTLY BELOW THE BOX: START QUIZ BUTTON */}
          {isHost ? (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={actionLoading || state.participants.length === 0}
                className="w-full py-4 px-8 rounded-2xl font-black text-base sm:text-lg text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <Play className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
                <span>
                  {actionLoading
                    ? 'Starting Countdown...'
                    : state.participants.length === 0
                    ? 'Waiting for Players to Join...'
                    : `Start Quiz (${state.participants.length} Players Ready)`}
                </span>
                <Flame className="w-5 h-5 text-amber-950 fill-amber-950 animate-pulse" />
              </button>
              <p className="text-xs text-slate-500 mt-2">
                Clicking start will trigger a 3-second countdown on all players&apos; screens and switch to your live ranking dashboard.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              You are spectating as a guest. Only the host can launch the tournament.
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* PHASE 2: LIVE RANKING & LEADERBOARD DASHBOARD                            */
        /* ========================================================================= */
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  state.status === 'IN_PROGRESS'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {state.status === 'IN_PROGRESS' ? '● Live Ranking Dashboard' : '✓ Tournament Completed'}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                  Room #{state.roomCode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{state.quizName}</h1>
              <p className="text-xs text-slate-400">
                Category: {state.courseName} • Questions: {state.questionCount} • Realtime Leaderboard Active
              </p>
            </div>

            {/* Host action controls */}
            {isHost && state.status === 'IN_PROGRESS' && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                >
                  <StopCircle className="w-4 h-4 text-rose-400" />
                  <span>End Tournament</span>
                </button>

                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Manual refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">{state.participants.length}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Players</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">{waitingCount}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Solving Test</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{completedCount}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Finished</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-300">{averageScore}%</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</div>
            </div>
          </div>

          {/* Leaderboard Table & Tabs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'leaderboard'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Live Leaderboard ({state.participants.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'activity'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Activity Feed</span>
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter player..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {activeTab === 'leaderboard' && (
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-6">Rank</th>
                        <th className="py-3.5 px-6">Player</th>
                        <th className="py-3.5 px-6 text-center">Status</th>
                        <th className="py-3.5 px-6 text-center">Accuracy</th>
                        <th className="py-3.5 px-6 text-center">Score</th>
                        <th className="py-3.5 px-6 text-right">Time Taken</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredParticipants.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold">
                            {idx === 0 ? (
                              <span className="inline-flex items-center gap-1 text-amber-400 font-extrabold">
                                <Crown className="w-4 h-4 fill-amber-400" /> #1
                              </span>
                            ) : idx === 1 ? (
                              <span className="text-slate-300 font-bold">#2</span>
                            ) : idx === 2 ? (
                              <span className="text-amber-600 font-bold">#3</span>
                            ) : (
                              <span className="text-slate-500">#{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {p.userAvatar ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={p.userAvatar} alt={p.userName} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  p.userName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span className="truncate max-w-[160px]">{p.userName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              p.status === 'SUBMITTED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                            }`}>
                              {p.status === 'SUBMITTED' ? 'Completed' : 'Solving'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center font-mono text-xs text-slate-300">
                            {p.status === 'SUBMITTED' ? `${p.correctAnswers}/${state.questionCount}` : '—'}
                          </td>
                          <td className="py-4 px-6 text-center font-mono font-bold text-base">
                            <span className={p.score >= 70 ? 'text-emerald-400' : p.score > 0 ? 'text-cyan-400' : 'text-slate-500'}>
                              {p.status === 'SUBMITTED' ? `${p.score}%` : '—'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-xs text-slate-400">
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
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                {state.activities.map((a) => (
                  <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="font-bold text-white">{a.userName}</span>
                      <span className="text-slate-400">{a.eventType.toLowerCase()}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">{a.time}</span>
                  </div>
                ))}
              </div>
            )}
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
