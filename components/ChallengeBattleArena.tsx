'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  ChallengeMatchData,
  submitChallengeAnswers,
  getChallengeMatch,
} from '@/app/actions/challenge';
import {
  playSelect,
  playVictory,
  playCountdownTick,
  playCountdownGo,
  playQuizBgm,
  stopQuizBgm,
} from '@/lib/sound';
import {
  Swords,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Flame,
  Zap,
  RotateCcw,
  Check,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface ChallengeBattleArenaProps {
  initialMatch: ChallengeMatchData;
  currentUserId: string;
}

export function ChallengeBattleArena({
  initialMatch,
  currentUserId,
}: ChallengeBattleArenaProps) {
  const router = useRouter();
  const supabase = createClient();

  const isChallenger = initialMatch.challengerId === currentUserId;
  const myQuestions = initialMatch.myQuestions || [];

  // Match State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qid: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(initialMatch.timeLimitSec || 300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(
    isChallenger ? !!initialMatch.myResult.completedAt : !!initialMatch.myResult.completedAt
  );
  const [showEarlySubmitConfirm, setShowEarlySubmitConfirm] = useState(false);

  // Opponent Live Progress (0 to totalQuestions)
  const [opponentAnsweredCount, setOpponentAnsweredCount] = useState(
    isChallenger
      ? initialMatch.opponentResult.correctCount !== null
        ? initialMatch.totalQuestions
        : 0
      : initialMatch.opponentResult.correctCount !== null
      ? initialMatch.totalQuestions
      : 0
  );
  const [opponentSubmitted, setOpponentSubmitted] = useState(
    isChallenger
      ? !!initialMatch.opponentResult.completedAt
      : !!initialMatch.opponentResult.completedAt
  );

  // Match Final Result
  const [matchData, setMatchData] = useState<ChallengeMatchData>(initialMatch);
  const isMatchFinished = matchData.status === 'COMPLETED';

  // Timer tracking
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Supabase Realtime Channel
  useEffect(() => {
    const channelName = `challenge-duel:${initialMatch.id}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'opponent_progress' }, ({ payload }) => {
        if (!payload) return;
        if (payload.userId !== currentUserId) {
          setOpponentAnsweredCount(payload.answeredCount || 0);
        }
      })
      .on('broadcast', { event: 'opponent_submitted' }, async ({ payload }) => {
        if (!payload) return;
        if (payload.userId !== currentUserId) {
          setOpponentSubmitted(true);
          // Fetch updated match state
          const updated = await getChallengeMatch(initialMatch.id);
          if (updated.success && updated.data) {
            setMatchData(updated.data);
          }
        }
      })
      .on('broadcast', { event: 'match_completed' }, async () => {
        const updated = await getChallengeMatch(initialMatch.id);
        if (updated.success && updated.data) {
          setMatchData(updated.data);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialMatch.id, currentUserId, supabase]);

  // Countdown timer
  useEffect(() => {
    if (isMatchFinished || hasSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        if (prev <= 10) {
          playCountdownTick(prev);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isMatchFinished, hasSubmitted]);

  // Manage Duel Arena Background Music
  useEffect(() => {
    if (!isMatchFinished) {
      playQuizBgm();
    } else {
      stopQuizBgm();
    }
    return () => {
      stopQuizBgm();
    };
  }, [isMatchFinished]);

  // Play Victory sound if player won upon finish
  useEffect(() => {
    if (isMatchFinished) {
      stopQuizBgm();
      if (matchData.winnerId === currentUserId) {
        playVictory();
      }
    }
  }, [isMatchFinished, matchData.winnerId, currentUserId]);

  const handleSelectOption = (optionIndex: number) => {
    if (hasSubmitted || isMatchFinished) return;
    const currentQ = myQuestions[currentIndex];
    if (!currentQ) return;

    playSelect();

    const newAnswers = {
      ...selectedAnswers,
      [currentQ.id]: optionIndex,
    };
    setSelectedAnswers(newAnswers);

    // Broadcast progress to opponent
    const answeredCount = Object.keys(newAnswers).length;
    const channel = supabase.channel(`challenge-duel:${initialMatch.id}`);
    channel.send({
      type: 'broadcast',
      event: 'opponent_progress',
      payload: {
        userId: currentUserId,
        answeredCount,
        totalQuestions: myQuestions.length,
      },
    });
  };

  const handleManualSubmit = async () => {
    if (hasSubmitted || isSubmitting) return;

    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < myQuestions.length) {
      setShowEarlySubmitConfirm(true);
      return;
    }

    await executeSubmission();
  };

  const handleAutoSubmit = async () => {
    if (hasSubmitted || isSubmitting) return;
    await executeSubmission();
  };

  const executeSubmission = async () => {
    setIsSubmitting(true);

    const elapsedSeconds = Math.max(
      1,
      Math.min(initialMatch.timeLimitSec, Math.floor((Date.now() - startTimeRef.current) / 1000))
    );

    const formattedAnswers = myQuestions.map((q) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    try {
      const res = await submitChallengeAnswers({
        challengeId: initialMatch.id,
        answers: formattedAnswers,
        timeTakenSec: elapsedSeconds,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to submit answers.');
      }

      setHasSubmitted(true);

      // Broadcast submitted event
      const channel = supabase.channel(`challenge-duel:${initialMatch.id}`);
      await channel.send({
        type: 'broadcast',
        event: 'opponent_submitted',
        payload: {
          userId: currentUserId,
          timeTakenSec: elapsedSeconds,
        },
      });

      // Reload match data to check if both finished
      const updated = await getChallengeMatch(initialMatch.id);
      if (updated.success && updated.data) {
        setMatchData(updated.data);
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = myQuestions[currentIndex];
  const myAnsweredCount = Object.keys(selectedAnswers).length;
  const myProgressPercent = Math.round((myAnsweredCount / (myQuestions.length || 1)) * 100);
  const opponentProgressPercent = Math.round(
    (opponentAnsweredCount / (initialMatch.totalQuestions || 1)) * 100
  );

  const opponentName = isChallenger ? initialMatch.opponentName : initialMatch.challengerName;
  const opponentUsername = isChallenger
    ? initialMatch.opponentUsername
    : initialMatch.challengerUsername;
  const opponentAvatar = isChallenger
    ? initialMatch.opponentAvatar
    : initialMatch.challengerAvatar;

  const myName = isChallenger ? initialMatch.challengerName : initialMatch.opponentName;
  const myUsername = isChallenger ? initialMatch.challengerUsername : initialMatch.opponentUsername;
  const myAvatar = isChallenger ? initialMatch.challengerAvatar : initialMatch.opponentAvatar;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================
  // VICTORY / DEFEAT / FINISHED BATTLE RESULT VIEW
  // ============================================================
  if (isMatchFinished) {
    const isWinner = matchData.winnerId === currentUserId;
    const isDraw = matchData.winnerId === 'DRAW';

    const myFinalScore = matchData.myResult?.score ?? 0;
    const myFinalCorrect = matchData.myResult?.correctCount ?? 0;
    const myFinalTime = matchData.myResult?.timeSec ?? 0;

    const oppFinalScore = matchData.opponentResult?.score ?? 0;
    const oppFinalCorrect = matchData.opponentResult?.correctCount ?? 0;
    const oppFinalTime = matchData.opponentResult?.timeSec ?? 0;

    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8 animate-fade-in">
        {/* Outcome Banner */}
        <div
          className={`rounded-3xl p-8 sm:p-12 text-center border relative overflow-hidden shadow-2xl ${
            isWinner
              ? 'bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-amber-500/50 shadow-amber-950/40'
              : isDraw
              ? 'bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border-indigo-500/50 shadow-indigo-950/40'
              : 'bg-gradient-to-b from-rose-950/60 via-slate-900 to-slate-950 border-rose-500/50 shadow-rose-950/40'
          }`}
        >
          {/* Glowing Aura */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
              isWinner ? 'bg-amber-500/20' : isDraw ? 'bg-indigo-500/20' : 'bg-rose-500/20'
            }`}
          />

          <div className="relative space-y-4">
            {/* Insignia Icon */}
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl p-1 shadow-2xl flex items-center justify-center ${
                isWinner
                  ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/40 animate-bounce'
                  : isDraw
                  ? 'bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white shadow-indigo-500/30'
                  : 'bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-rose-500/30'
              }`}
            >
              {isWinner ? (
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
              ) : isDraw ? (
                <Swords className="w-10 h-10 sm:w-12 sm:h-12" />
              ) : (
                <Flame className="w-10 h-10 sm:w-12 sm:h-12" />
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {isWinner ? '🏆 VICTORY!' : isDraw ? '🤝 STALEMATE DRAW!' : '💀 DEFEAT'}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
                {isWinner
                  ? `Spectacular performance! You dominated the 1v1 duel against @${opponentUsername || opponentName}.`
                  : isDraw
                  ? `Both developers achieved identical accuracy and speed. An honorable tie!`
                  : `@${opponentUsername || opponentName} outperformed you in speed or accuracy. Practice and claim revenge!`}
              </p>
            </div>
          </div>
        </div>

        {/* Side-by-Side Dual Performance Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 border border-white/15">
          <div className="text-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Battle Statistics Breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Center VS Divider (Desktop) */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 items-center justify-center text-xs font-mono font-black text-rose-400 shadow-md z-10">
              VS
            </div>

            {/* Left Player: YOU */}
            <div
              className={`p-6 rounded-2xl border text-center space-y-4 ${
                isWinner
                  ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 overflow-hidden">
                  {myAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={myAvatar} alt="You" className="w-full h-full object-cover rounded-[14px]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xl text-white bg-slate-900 rounded-[14px]">
                      {(myName || 'Y')[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-base font-black text-white flex items-center justify-center gap-1.5">
                    <span>{myName}</span>
                    <span className="text-xs font-bold text-cyan-400">(You)</span>
                  </div>
                  {myUsername && (
                    <div className="text-xs font-mono text-slate-400">@{myUsername}</div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-lg font-black text-white">{myFinalScore ?? 0}%</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-lg font-black text-emerald-400">
                    {myFinalCorrect ?? 0}/{initialMatch.totalQuestions}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Correct</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-lg font-black text-cyan-400">{myFinalTime ?? 0}s</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Time</div>
                </div>
              </div>
            </div>

            {/* Right Player: OPPONENT */}
            <div
              className={`p-6 rounded-2xl border text-center space-y-4 ${
                !isWinner && !isDraw
                  ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 overflow-hidden">
                  {opponentAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={opponentAvatar}
                      alt="Opponent"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xl text-white bg-slate-900 rounded-[14px]">
                      {(opponentName || 'O')[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-base font-black text-white">{opponentName}</div>
                  {opponentUsername && (
                    <div className="text-xs font-mono text-slate-400">@{opponentUsername}</div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-lg font-black text-white">{oppFinalScore ?? 0}%</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-lg font-black text-emerald-400">
                    {oppFinalCorrect ?? 0}/{initialMatch.totalQuestions}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Correct</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-lg font-black text-cyan-400">{oppFinalTime ?? 0}s</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/challenge-vs"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch / Challenge Again</span>
            </Link>

            <Link
              href="/courses"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors text-center"
            >
              Explore Practice Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // WAITING FOR OPPONENT SCREEN (When you already submitted)
  // ============================================================
  if (hasSubmitted && !isMatchFinished) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="glass-panel rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl border border-white/15 backdrop-blur-2xl">
          <div className="relative mx-auto w-20 h-20 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 bg-white/[0.08] px-3.5 py-1 rounded-full border border-white/15 backdrop-blur-xl">
              Your Answers Submitted!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Waiting for @{opponentUsername || opponentName} to finish...
            </h2>
            <p className="text-xs sm:text-sm text-slate-300/80 max-w-md mx-auto">
              Your score and time are locked in. As soon as your opponent submits (or the match timer expires), final victory will be computed live!
            </p>
          </div>

          {/* Opponent live progress meter in glass container */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold text-white">Opponent Progress:</span>
              <span className="font-mono text-cyan-400 font-bold">
                {opponentAnsweredCount}/{initialMatch.totalQuestions} Questions
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900/80 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300"
                style={{ width: `${opponentProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ACTIVE DUEL QUIZ ARENA VIEW
  // ============================================================
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 animate-fade-in relative">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-rose-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top 1v1 Battle HUD Header (Glassmorphic) */}
      <div className="glass-panel rounded-3xl p-3 sm:p-6 backdrop-blur-2xl shadow-2xl space-y-3 sm:space-y-4 border border-white/15">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Left Player: YOU */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shrink-0 overflow-hidden shadow-md">
              {myAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={myAvatar} alt="You" className="w-full h-full object-cover rounded-[10px]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-xs sm:text-sm text-white bg-slate-900 rounded-[10px]">
                  {(myName || 'Y')[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black text-white truncate flex items-center gap-1">
                <span className="truncate">{myName}</span>
                <span className="text-[10px] text-cyan-400 font-bold shrink-0">(You)</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-300 font-mono truncate">
                {myAnsweredCount}/{myQuestions.length} Qs
              </div>
            </div>
          </div>

          {/* Center: VS & Timer */}
          <div className="flex flex-col items-center shrink-0 px-1 sm:px-4">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-rose-500/20 border border-rose-500/35 text-rose-300 text-[10px] sm:text-xs font-mono font-black shadow-sm backdrop-blur-md">
              <Swords className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" />
              <span>VS</span>
            </div>

            <div
              className={`flex items-center gap-1 font-mono text-xs sm:text-base font-black mt-1 ${
                timeLeft <= 30 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
              }`}
            >
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>

          {/* Right Player: OPPONENT */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-0 flex-1 text-right">
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black text-white truncate">
                {opponentName}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-300 font-mono truncate">
                {opponentSubmitted ? (
                  <span className="text-emerald-400 font-semibold">Submitted!</span>
                ) : (
                  <span>{opponentAnsweredCount}/{initialMatch.totalQuestions} Qs</span>
                )}
              </div>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shrink-0 overflow-hidden shadow-md">
              {opponentAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={opponentAvatar}
                  alt="Opponent"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-xs sm:text-sm text-white bg-slate-900 rounded-[10px]">
                  {(opponentName || 'O')[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dual Progress Bars */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.08]">
          {/* My Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-cyan-400">
              <span>Your Progress</span>
              <span>{myProgressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900/80 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                style={{ width: `${myProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Opponent Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-rose-400">
              <span>Opponent Progress</span>
              <span>{opponentProgressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900/80 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                style={{ width: `${opponentProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Card (Glassmorphism with Staggered Entrance per Question) */}
      {currentQ ? (
        <div
          key={currentQ.id}
          className="glass-panel rounded-3xl p-6 sm:p-9 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden border border-white/15 animate-card-entrance"
        >
          {/* Top ambient glass sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Question Index & Topic */}
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider">
              Question {currentIndex + 1} of {myQuestions.length}
            </span>
            {currentQ.topic && (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/[0.08] backdrop-blur-xl text-slate-100 border border-white/15 shadow-sm">
                {currentQ.topic}
              </span>
            )}
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed relative z-10 tracking-tight">
            {currentQ.question}
          </h2>

          {/* Code Snippet (Glass container) */}
          {currentQ.codeSnippet && (
            <pre className="p-4 rounded-2xl bg-black/60 border border-white/15 text-xs sm:text-sm font-mono text-cyan-200 overflow-x-auto relative z-10 backdrop-blur-2xl shadow-inner">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          )}

          {/* 4 Options Grid (Frosted Glass Interactive Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 relative z-10">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`group p-4.5 rounded-2xl border text-left font-medium text-sm transition-all duration-200 cursor-pointer flex items-start gap-3.5 backdrop-blur-2xl ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/30 via-sky-500/25 to-indigo-500/25 border-cyan-400 text-white ring-2 ring-cyan-500/50 shadow-[0_0_28px_rgba(6,182,212,0.35)] scale-[1.015]'
                      : 'glass-option text-slate-200 hover:text-white hover:border-cyan-400/50 hover:bg-white/[0.08]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-md transition-colors ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 font-black shadow-cyan-500/50'
                        : 'bg-white/[0.08] group-hover:bg-cyan-400/20 text-slate-200 group-hover:text-cyan-300 border border-white/15'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-snug font-medium pt-0.5">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Navigation & Submit Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex === myQuestions.length - 1 ? (
              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-rose-500 via-amber-400 to-orange-400 hover:from-rose-400 hover:to-orange-300 transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Duel...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Submit Duel Answers</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(myQuestions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Questions Available</h3>
          <p className="text-xs text-slate-400">
            This challenge match does not have any questions assigned.
          </p>
        </div>
      )}

      {/* Early Duel Submit Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEarlySubmitConfirm}
        variant="warning"
        title="Submit Duel Early?"
        message={`You have answered ${Object.keys(selectedAnswers).length} of ${myQuestions.length} questions. Are you sure you want to submit? Any unanswered questions will be graded as incorrect.`}
        confirmText="Yes, Submit Duel"
        cancelText="Keep Answering"
        onConfirm={async () => {
          setShowEarlySubmitConfirm(false);
          await executeSubmission();
        }}
        onCancel={() => setShowEarlySubmitConfirm(false)}
      />
    </div>
  );
}
