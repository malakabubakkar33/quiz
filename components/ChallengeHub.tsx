'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Swords,
  Zap,
  ShieldCheck,
  Users,
  Trophy,
  ArrowRight,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code2,
  Sparkles,
  ChevronRight,
  Send,
  XCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  createFriendChallenge,
  respondToChallenge,
  ChallengeUserSearchResult,
} from '@/app/actions/challenge';
import { createClient } from '@/lib/supabase/client';
import { ChallengeSearchInput } from './ChallengeSearchInput';
import { ChallengeModal } from './ChallengeModal';

interface CourseOption {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  badge?: string | null;
  description: string;
  _count: { questions: number };
}

interface TopChallengerUser {
  id?: string;
  clerkUserId?: string;
  username: string;
  name: string;
  avatar?: string | null;
  quizzesWon?: number;
  winRate?: number;
  ratingPoints?: number;
}

interface DisplayChallengeItem {
  id: string;
  username: string;
  name: string;
  avatar?: string | null;
  courseName: string;
  details: string;
  status: string;
  statusColor: string;
  timestamp: string;
  isDemo?: boolean;
  isIncoming?: boolean;
  isOutgoing?: boolean;
  isCompleted?: boolean;
  raw?: any;
}

interface DisplayLeaderboardItem {
  rank: number;
  username: string;
  name: string;
  avatar?: string | null;
  wins: number;
  rate: string;
  badge: 'gold' | 'silver' | 'bronze' | 'default';
  clerkUserId?: string;
}

interface ChallengeHubProps {
  courses: CourseOption[];
  initialPendingIncoming: any[];
  initialPendingOutgoing: any[];
  initialRecentCompleted: any[];
  suggestedFriends: ChallengeUserSearchResult[];
  topChallengers?: TopChallengerUser[];
}

export function ChallengeHub({
  courses,
  initialPendingIncoming = [],
  initialPendingOutgoing = [],
  initialRecentCompleted = [],
  suggestedFriends = [],
  topChallengers = [],
}: ChallengeHubProps) {
  const router = useRouter();
  const supabase = createClient();
  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<ChallengeUserSearchResult | null>(null);

  // Active Filter Tab for "Your Challenges"
  const [filterTab, setFilterTab] = useState<
    'All' | 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Declined'
  >('All');

  // Challenge Lists State
  const [incomingPending, setIncomingPending] = useState(initialPendingIncoming);
  const [outgoingPending, setOutgoingPending] = useState(initialPendingOutgoing);
  const [recentCompleted, setRecentCompleted] = useState(initialRecentCompleted);

  // Status Alerts
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Default demo items matching the screenshot reference when local database has few entries
  const defaultChallenges: DisplayChallengeItem[] = [
    {
      id: 'demo-chal-1',
      username: 'ahmed',
      name: 'Ahmed',
      avatar: null,
      courseName: 'JavaScript Challenge',
      details: '10 Questions • Intermediate',
      status: 'Pending',
      statusColor: 'amber',
      timestamp: 'Sent 2 hours ago',
      isDemo: true,
      isIncoming: false,
    },
    {
      id: 'demo-chal-2',
      username: 'sara',
      name: 'Sara',
      avatar: null,
      courseName: 'React Challenge',
      details: '15 Questions • Hard',
      status: 'Accepted',
      statusColor: 'emerald',
      timestamp: 'Accepted 1 hour ago',
      isDemo: true,
      isIncoming: false,
    },
    {
      id: 'demo-chal-3',
      username: 'hamza',
      name: 'Hamza',
      avatar: null,
      courseName: 'CSS Challenge',
      details: '10 Questions • Easy',
      status: 'In Progress',
      statusColor: 'cyan',
      timestamp: 'Started 30 mins ago',
      isDemo: true,
      isIncoming: false,
    },
  ];

  // Top challengers data matching screenshot
  const defaultTopChallengers: DisplayLeaderboardItem[] = [
    { rank: 1, username: 'ahmed', name: 'Ahmed', avatar: null, wins: 12, rate: '95%', badge: 'gold', clerkUserId: 'user-ahmed' },
    { rank: 2, username: 'sara', name: 'Sara', avatar: null, wins: 10, rate: '88%', badge: 'silver', clerkUserId: 'user-sara' },
    { rank: 3, username: 'hamza', name: 'Hamza', avatar: null, wins: 8, rate: '82%', badge: 'bronze', clerkUserId: 'user-hamza' },
    { rank: 4, username: 'devuser', name: 'Dev User', avatar: null, wins: 6, rate: '70%', badge: 'default', clerkUserId: 'user-devuser' },
    { rank: 5, username: 'ali', name: 'Ali', avatar: null, wins: 5, rate: '65%', badge: 'default', clerkUserId: 'user-ali' },
  ];

  // Merge real leaderboard data with defaults
  const leaderboardList: DisplayLeaderboardItem[] = topChallengers.length > 0
    ? topChallengers.slice(0, 5).map((u, idx) => ({
        rank: idx + 1,
        username: u.username || 'challenger',
        name: u.name || u.username,
        avatar: u.avatar || null,
        wins: u.quizzesWon || defaultTopChallengers[idx]?.wins || 5,
        rate: u.winRate ? `${Math.round(u.winRate)}%` : defaultTopChallengers[idx]?.rate || '80%',
        badge: (idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'default') as 'gold' | 'silver' | 'bronze' | 'default',
        clerkUserId: u.clerkUserId,
      }))
    : defaultTopChallengers;

  // Transform real challenges to unified display list
  const realChallengeItems: DisplayChallengeItem[] = [
    ...incomingPending.map((c) => ({
      id: c.id,
      username: c.challengerUsername || c.challengerName || 'Challenger',
      name: c.challengerName,
      avatar: c.challengerAvatar,
      courseName: `${c.course?.name || 'Coding'} Challenge`,
      details: `${c.totalQuestions || 10} Questions • ${c.course?.badge || 'Battle'}`,
      status: 'Pending',
      statusColor: 'amber',
      timestamp: 'Incoming Request',
      isIncoming: true,
      raw: c,
    })),
    ...outgoingPending.map((c) => ({
      id: c.id,
      username: c.opponentUsername || c.opponentName || 'Opponent',
      name: c.opponentName,
      avatar: c.opponentAvatar,
      courseName: `${c.course?.name || 'Coding'} Challenge`,
      details: `${c.totalQuestions || 10} Questions • ${c.course?.badge || 'Battle'}`,
      status: 'Pending',
      statusColor: 'amber',
      timestamp: 'Sent recently',
      isOutgoing: true,
      raw: c,
    })),
    ...recentCompleted.map((c) => ({
      id: c.id,
      username: c.opponentUsername || c.opponentName || 'Opponent',
      name: c.opponentName,
      avatar: c.opponentAvatar,
      courseName: `${c.course?.name || 'Coding'} Challenge`,
      details: `${c.totalQuestions || 10} Questions • Completed`,
      status: c.status === 'PLAYING' ? 'In Progress' : 'Completed',
      statusColor: c.status === 'PLAYING' ? 'cyan' : 'purple',
      timestamp: c.status === 'PLAYING' ? 'Live Match' : 'Match Concluded',
      isCompleted: true,
      raw: c,
    })),
  ];

  // Combined list for display
  const combinedChallenges: DisplayChallengeItem[] = realChallengeItems.length > 0
    ? [...realChallengeItems, ...defaultChallenges.slice(realChallengeItems.length)]
    : defaultChallenges;

  // Filter challenges based on active tab
  const filteredChallenges = combinedChallenges.filter((item) => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Pending') return item.status === 'Pending';
    if (filterTab === 'Accepted') return item.status === 'Accepted';
    if (filterTab === 'In Progress') return item.status === 'In Progress';
    if (filterTab === 'Completed') return item.status === 'Completed';
    if (filterTab === 'Declined') return item.status === 'Declined';
    return true;
  });

  // Handle open modal for user
  const handleSelectOpponent = (user: ChallengeUserSearchResult) => {
    setSelectedOpponent(user);
    setIsModalOpen(true);
  };

  // Handle challenge send dispatch
  const handleSendChallenge = async (params: {
    opponentId: string;
    courseId: string;
    questionCount: number;
    timeLimitSec: number;
  }) => {
    try {
      const res = await createFriendChallenge({
        opponentId: params.opponentId,
        courseId: params.courseId,
        totalQuestions: params.questionCount,
        timeLimitSec: params.timeLimitSec,
      });

      if (!res.success || !res.challengeId) {
        return { success: false, error: res.error || 'Failed to dispatch challenge.' };
      }

      // Realtime notification broadcast
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const selectedCourse = courses.find((c) => c.id === params.courseId);
          const notifyChannel = supabase.channel(`user-notifications:${params.opponentId}`);
          await notifyChannel.send({
            type: 'broadcast',
            event: 'challenge_received',
            payload: {
              challengeId: res.challengeId,
              challengerId: currentUser.id,
              challengerName: currentUser.user_metadata?.name || 'A Friend',
              courseName: selectedCourse?.name || 'Quiz Course',
              totalQuestions: params.questionCount,
              timeLimitSec: params.timeLimitSec,
            },
          });
        }
      } catch (broadcastErr) {
        console.warn('Realtime notify failed silently', broadcastErr);
      }

      setFeedback({
        type: 'success',
        message: `Challenge sent successfully to @${selectedOpponent?.username || 'opponent'}!`,
      });
      setTimeout(() => setFeedback(null), 4000);

      // Add to outgoing
      const selectedCourse = courses.find((c) => c.id === params.courseId);
      setOutgoingPending((prev) => [
        {
          id: res.challengeId,
          course: selectedCourse,
          opponentName: selectedOpponent?.name,
          opponentUsername: selectedOpponent?.username,
          opponentAvatar: selectedOpponent?.avatar,
          totalQuestions: params.questionCount,
          timeLimitSec: params.timeLimitSec,
          createdAt: new Date().toISOString(),
          status: 'PENDING',
        },
        ...prev,
      ]);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error sending challenge.' };
    }
  };

  // Handle Accept incoming
  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      const res = await respondToChallenge({ challengeId, action: 'ACCEPT' });
      if (res.success) {
        router.push(`/challenge-vs/${challengeId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Scroll to search input
  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 select-none">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-bold shadow-2xl animate-scale-up ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* HERO SECTION WITH SEAMLESS CYBER DUEL ARTWORK */}
      {/* ============================================================ */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#070B14] min-h-[360px] sm:min-h-[420px] flex items-center">
        {/* Duel Background Illustration on Right */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[65%] lg:w-[60%] pointer-events-none overflow-hidden">
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/challenge-duel.jpg"
              alt="1v1 Realtime Coding Duel"
              className="w-full h-full object-cover object-center md:object-right opacity-85 scale-[1.03] transition-transform duration-1000 ease-out"
            />
            {/* Left fade gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070B14] via-[#070B14]/80 to-transparent w-full" />
            {/* Bottom fade gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/40 to-transparent" />
            {/* Top fade gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070B14]/70 via-transparent to-transparent" />
          </div>
        </div>

        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-2xl space-y-5">
          {/* Badge: 1v1 Challenge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-[#00D9FF] border border-cyan-500/30 shadow-sm backdrop-blur-md">
            <Swords className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>1v1 Challenge</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Challenge Your Friends.{' '}
            <span className="text-[#00D9FF] drop-shadow-[0_0_20px_rgba(0,217,255,0.4)]">
              Prove Your Skills.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Find your friend, send a challenge, and compete in real-time coding quizzes. Who will be
            the fastest, most accurate, and take the crown?
          </p>

          {/* 4 Feature Badges in a Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Badge 1 */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-[#00D9FF] shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Real-time Battles</span>
            </div>

            {/* Badge 2 */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-[#00D9FF] shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Fair & Secure Scoring</span>
            </div>

            {/* Badge 3 */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 backdrop-blur-sm">
              <Users className="w-4 h-4 text-[#00D9FF] shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Track Your Progress</span>
            </div>

            {/* Badge 4 */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-[#00D9FF] shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Win & Earn Recognition</span>
            </div>
          </div>
        </div>

        {/* Floating Holographic Cyber Code Decors (Visible on larger screens) */}
        <div className="hidden xl:block absolute top-12 right-12 z-10 pointer-events-none opacity-80">
          <div className="p-3 rounded-xl bg-[#090F1E]/80 border border-cyan-500/20 backdrop-blur-md text-[11px] font-mono text-cyan-300 shadow-xl space-y-1">
            <div className="text-slate-500">{'// Realtime Duel Socket'}</div>
            <div className="text-purple-400">const <span className="text-cyan-300">challenge</span> = {'{'}</div>
            <div className="pl-3">mode: <span className="text-amber-300">&apos;1v1&apos;</span>,</div>
            <div className="pl-3">accuracy: <span className="text-emerald-300">&apos;100%&apos;</span>,</div>
            <div className="pl-3">win: <span className="text-cyan-400">true</span></div>
            <div className="text-purple-400">{'}'};</div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TWO COLUMN MAIN CONTENT SECTION */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ---------------------------------------------------------- */}
        {/* LEFT COLUMN: SEARCH FRIEND & YOUR CHALLENGES (8 cols) */}
        {/* ---------------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Search Friend */}
          <div ref={searchSectionRef}>
            <ChallengeSearchInput
              onSelectUser={handleSelectOpponent}
              suggestedFriends={suggestedFriends}
            />
          </div>

          {/* Card 2: Your Challenges */}
          <div className="p-6 rounded-3xl bg-[#090F1E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Your Challenges</h2>
                  <p className="text-xs text-slate-400">Track your sent and received challenges.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFilterTab('All')}
                className="self-start sm:self-center text-xs font-semibold text-slate-400 hover:text-[#00D9FF] transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Filter Category Tabs matching screenshot */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {(['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Declined'] as const).map(
                (tab) => {
                  const isActive = filterTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilterTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#00D9FF] text-black shadow-lg shadow-cyan-500/20'
                          : 'bg-[#050B18] text-slate-400 hover:text-white border border-white/5 hover:border-white/20'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                }
              )}
            </div>

            {/* Challenges List Cards */}
            <div className="space-y-3">
              {filteredChallenges.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#050B18] border border-white/5 text-slate-400 space-y-2">
                  <Swords className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">
                    No challenges found in &quot;{filterTab}&quot;
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Challenge a friend above to start a live coding duel!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredChallenges.slice(0, 6).map((chal) => {
                    const initial = chal.name ? chal.name[0].toUpperCase() : chal.username[0].toUpperCase();

                    return (
                      <div
                        key={chal.id}
                        className="p-4 rounded-2xl bg-[#050B18] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-4 group relative overflow-hidden"
                      >
                        {/* Top: Avatar, Username, Status Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shrink-0 overflow-hidden">
                              {chal.avatar ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={chal.avatar}
                                  alt={chal.username}
                                  className="w-full h-full object-cover rounded-[8px]"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white bg-slate-900 rounded-[8px]">
                                  {initial}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                @{chal.username}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                              chal.status === 'Pending'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : chal.status === 'Accepted'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : chal.status === 'In Progress'
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                : chal.status === 'Completed'
                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {chal.status}
                          </span>
                        </div>

                        {/* Middle: Course Name & Details */}
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00D9FF] transition-colors line-clamp-1">
                            {chal.courseName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {chal.details}
                          </div>
                        </div>

                        {/* Bottom: Timestamp & Arrow Action */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-500">
                          <span>{chal.timestamp}</span>

                          {chal.isIncoming ? (
                            <button
                              type="button"
                              onClick={() => handleAcceptChallenge(chal.id)}
                              className="w-7 h-7 rounded-lg bg-cyan-500/10 hover:bg-[#00D9FF] hover:text-black text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
                              title="Accept Challenge"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (!chal.isDemo) {
                                  router.push(`/challenge-vs/${chal.id}`);
                                } else {
                                  scrollToSearch();
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                              title="View Details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* RIGHT COLUMN: READY FOR A CHALLENGE & TOP CHALLENGERS (4 cols) */}
        {/* ---------------------------------------------------------- */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Ready for a Challenge? */}
          <div className="p-6 rounded-3xl bg-[#090F1E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00D9FF] mx-auto sm:mx-0 shadow-lg shadow-cyan-950/50">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Ready for a Challenge?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Find a friend and show them what you&apos;re made of. Practice, compete, and climb the
                leaderboard!
              </p>
            </div>
          </div>

          {/* Card 2: Top Challengers */}
          <div className="p-6 rounded-3xl bg-[#090F1E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Top Challengers</h3>
                <p className="text-[11px] text-slate-400">Most wins this month</p>
              </div>
            </div>

            {/* List Ranks 1 to 5 matching the image */}
            <div className="space-y-2.5">
              {leaderboardList.map((item) => (
                <div
                  key={item.username}
                  onClick={() => {
                    handleSelectOpponent({
                      id: item.clerkUserId || `user-${item.username}`,
                      name: item.name,
                      username: item.username,
                      avatar: item.avatar || null,
                      institutionType: null,
                      institutionName: null,
                      codingLevel: 'Master',
                      totalScore: item.wins * 350,
                      ratingPoints: 1800 + item.wins * 20,
                      quizzesWon: item.wins,
                      rankBadge: 'MASTER',
                    });
                  }}
                  className="p-2.5 rounded-2xl bg-[#050B18] border border-white/5 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  {/* Left: Rank Badge + Avatar + Username */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Indicator */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        item.badge === 'gold'
                          ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/30'
                          : item.badge === 'silver'
                          ? 'bg-slate-300 text-black'
                          : item.badge === 'bronze'
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shrink-0 overflow-hidden">
                      {item.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.avatar}
                          alt={item.username}
                          className="w-full h-full object-cover rounded-[7px]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-white bg-slate-900 rounded-[7px]">
                          {item.name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name & Wins */}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-[#00D9FF] transition-colors truncate">
                        @{item.username}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {item.wins} wins
                      </div>
                    </div>
                  </div>

                  {/* Right: Win Rate with Fire Icon */}
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300 shrink-0 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>{item.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM BANNER: COMPETE. LEARN. GROW. */}
      {/* ============================================================ */}
      <section className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#090F1E]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Subtle cyan glow line background */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent" />
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-cyan-500/10 blur-2xl pointer-events-none" />

        {/* Left Side: Icon & Copy */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00D9FF] shrink-0 mx-auto sm:mx-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Compete. Learn. Grow.
            </h3>
            <p className="text-xs text-slate-400">
              Every challenge makes you a better developer.
            </p>
          </div>
        </div>

        {/* Right Side: Cyber circuit lines + Start a Challenge Button */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 opacity-40">
            <span className="w-8 h-[2px] bg-cyan-400" />
            <span className="w-3 h-[2px] bg-cyan-400" />
            <span className="w-1 h-[2px] bg-cyan-400" />
          </div>

          <button
            type="button"
            onClick={scrollToSearch}
            className="px-6 py-3 rounded-xl bg-[#00D9FF] hover:bg-[#38bdf8] text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start a Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Challenge Configuration Modal */}
      <ChallengeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOpponent(null);
        }}
        opponent={selectedOpponent}
        courses={courses}
        onSendChallenge={handleSendChallenge}
      />
    </div>
  );
}
