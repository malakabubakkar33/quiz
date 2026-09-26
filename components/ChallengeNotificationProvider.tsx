'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { respondToChallenge, getUserChallenges } from '@/app/actions/challenge';
import {
  Swords,
  Clock,
  Code2,
  Loader2,
  Sparkles,
  Zap,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

interface IncomingDuelData {
  challengeId: string;
  challengerId: string;
  challengerName: string;
  challengerUsername?: string | null;
  challengerAvatar?: string | null;
  courseName: string;
  totalQuestions: number;
  timeLimitSec: number;
}

export function ChallengeNotificationProvider() {
  const router = useRouter();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [incomingDuel, setIncomingDuel] = useState<IncomingDuelData | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play audio chime for challenge alert
  const playAlertSound = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const notifSound = localStorage.getItem('codequiz_notif_sound') !== 'false';
        const masterSound = localStorage.getItem('codequiz_sound_enabled') !== 'false';
        if (!notifSound || !masterSound) return;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Monitor Auth User
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Check DB for any active incoming challenge
  const checkPendingChallenge = useCallback(async () => {
    if (!currentUser) return;
    if (typeof window !== 'undefined' && localStorage.getItem('codequiz_notif_challenges') === 'false') {
      return; // Disabled by user settings
    }
    try {
      const res = await getUserChallenges();
      if (res.incomingPending && res.incomingPending.length > 0) {
        const top = res.incomingPending[0];
        setIncomingDuel((prev) => {
          if (prev?.challengeId === top.id) return prev;
          playAlertSound();
          return {
            challengeId: top.id,
            challengerId: top.challengerId,
            challengerName: top.challengerName,
            challengerUsername: top.challengerUsername,
            challengerAvatar: top.challengerAvatar,
            courseName: top.course?.name || 'Quiz Course',
            totalQuestions: top.totalQuestions,
            timeLimitSec: top.timeLimitSec,
          };
        });
      }
    } catch (e) {
      // Silent error
    }
  }, [currentUser, playAlertSound]);

  // Fallback periodic sync every 60s (real-time broadcast handles instant notification)
  useEffect(() => {
    if (!currentUser) return;
    checkPendingChallenge();

    const interval = setInterval(checkPendingChallenge, 60000);
    return () => clearInterval(interval);
  }, [currentUser, checkPendingChallenge]);

  // Subscribe to personal real-time notification channel
  useEffect(() => {
    if (!currentUser) return;

    const channelName = `user-notifications:${currentUser.id}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: true } },
    });

    channel
      .on('broadcast', { event: 'challenge_received' }, ({ payload }) => {
        if (!payload || !payload.challengeId) return;
        if (typeof window !== 'undefined' && localStorage.getItem('codequiz_notif_challenges') === 'false') {
          return;
        }
        playAlertSound();
        setIncomingDuel({
          challengeId: payload.challengeId,
          challengerId: payload.challengerId,
          challengerName: payload.challengerName || 'A Friend',
          challengerUsername: payload.challengerUsername || null,
          challengerAvatar: payload.challengerAvatar || null,
          courseName: payload.courseName || 'Quiz Course',
          totalQuestions: payload.totalQuestions || 10,
          timeLimitSec: payload.timeLimitSec || 300,
        });
      })
      .on('broadcast', { event: 'challenge_accepted' }, ({ payload }) => {
        if (!payload || !payload.challengeId) return;
        setFeedbackToast({
          message: `${payload.opponentName || 'Opponent'} accepted your challenge! Entering Arena...`,
          type: 'success',
        });
        setTimeout(() => {
          router.push(`/challenge-vs/${payload.challengeId}`);
        }, 1000);
      })
      .on('broadcast', { event: 'challenge_rejected' }, ({ payload }) => {
        setFeedbackToast({
          message: `${payload.opponentName || 'Opponent'} declined the duel request.`,
          type: 'info',
        });
        setTimeout(() => setFeedbackToast(null), 4000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, supabase, router, playAlertSound]);

  const handleAccept = async () => {
    if (!incomingDuel) return;
    setIsResponding(true);

    try {
      const res = await respondToChallenge({
        challengeId: incomingDuel.challengeId,
        action: 'ACCEPT',
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to accept duel.');
      }

      // Broadcast acceptance to challenger's personal channel
      const notifyChannel = supabase.channel(`user-notifications:${incomingDuel.challengerId}`);
      await notifyChannel.send({
        type: 'broadcast',
        event: 'challenge_accepted',
        payload: {
          challengeId: incomingDuel.challengeId,
          opponentName: currentUser?.user_metadata?.name || 'Friend',
        },
      });

      const duelId = incomingDuel.challengeId;
      setIncomingDuel(null);
      router.push(`/challenge-vs/${duelId}`);
    } catch (err: any) {
      alert(err.message || 'Error accepting challenge');
      setIsResponding(false);
    }
  };

  const handleDecline = async () => {
    if (!incomingDuel) return;
    setIsResponding(true);

    try {
      await respondToChallenge({
        challengeId: incomingDuel.challengeId,
        action: 'REJECT',
      });

      // Broadcast rejection to challenger's channel
      const notifyChannel = supabase.channel(`user-notifications:${incomingDuel.challengerId}`);
      await notifyChannel.send({
        type: 'broadcast',
        event: 'challenge_rejected',
        payload: {
          challengeId: incomingDuel.challengeId,
          opponentName: currentUser?.user_metadata?.name || 'Friend',
        },
      });

      setIncomingDuel(null);
    } catch (err) {
      console.error(err);
      setIncomingDuel(null);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <>
      {/* Real-Time Incoming Duel Battle Popup - Academic Theme */}
      {incomingDuel && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 space-y-6 shadow-2xl text-center overflow-hidden transform transition-all animate-[fadeInScale_0.35s_cubic-bezier(0.16,1,0.3,1)]">
            {/* Battle Icon Badge */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center text-[#1769E0] shadow-xs">
              <Swords className="w-8 h-8 animate-pulse text-[#1769E0]" />
            </div>

            {/* Duel Header */}
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7]">
                <Sparkles className="w-3.5 h-3.5" /> 1v1 Code Duel Request
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title tracking-tight">
                Challenge Invitation!
              </h3>
              <p className="text-xs sm:text-sm text-[#5B667A] max-w-md mx-auto">
                A friend has challenged you to an arena battle. Randomized questions, highest score wins!
              </p>
            </div>

            {/* Challenger Card & Match Parameters */}
            <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] space-y-4 text-left shadow-2xs">
              {/* Opponent Info Row */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5EAF0] p-0.5 overflow-hidden shrink-0 shadow-xs">
                  {incomingDuel.challengerAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={incomingDuel.challengerAvatar}
                      alt="Challenger"
                      className="w-full h-full object-cover rounded-[12px]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white bg-[#10233F] rounded-[12px]">
                      {incomingDuel.challengerName[0]?.toUpperCase() || 'D'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#1769E0] font-bold uppercase tracking-wider">
                    Challenger
                  </div>
                  <div className="text-base font-bold text-[#14213D] truncate">
                    {incomingDuel.challengerName}
                  </div>
                  {incomingDuel.challengerUsername && (
                    <div className="text-xs font-mono text-[#5B667A] truncate">
                      @{incomingDuel.challengerUsername}
                    </div>
                  )}
                </div>
              </div>

              {/* Match Parameters Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5EAF0]">
                <div className="p-3 rounded-xl bg-white border border-[#E5EAF0] flex items-center gap-3 shadow-2xs">
                  <div className="p-2 rounded-lg bg-[#EBF3FC] text-[#1769E0]">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-[#5B667A] font-medium">Battlefield</div>
                    <div className="text-xs font-bold text-[#14213D] truncate">{incomingDuel.courseName}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E5EAF0] flex items-center gap-3 shadow-2xs">
                  <div className="p-2 rounded-lg bg-[#EBF3FC] text-[#1769E0]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-[#5B667A] font-medium">Format</div>
                    <div className="text-xs font-bold text-[#14213D] truncate">
                      {incomingDuel.totalQuestions} Qs • {Math.floor(incomingDuel.timeLimitSec / 60)} Min
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons: Accept / Decline */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleDecline}
                disabled={isResponding}
                className="w-1/3 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#5B667A] hover:text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-colors cursor-pointer disabled:opacity-50"
              >
                Decline
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={isResponding}
                className="flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] shadow-md shadow-[#1769E0]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isResponding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Entering Arena...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Accept & Enter Arena</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-[999999] p-4 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-xl flex items-center gap-3 animate-fade-in text-[#14213D] text-xs sm:text-sm font-semibold max-w-sm">
          <div className="p-2 rounded-xl bg-[#EBF3FC] text-[#1769E0] shrink-0">
            <Swords className="w-4 h-4" />
          </div>
          <span>{feedbackToast.message}</span>
        </div>
      )}
    </>
  );
}
