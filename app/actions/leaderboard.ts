'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from './auth';

function withTimeout<T>(promise: Promise<T>, ms = 10000, errorMsg = 'Database operation timed out'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
  ]);
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  clerkUserId: string;
  name: string;
  username: string;
  avatar: string | null;
  codingLevel: string;
  institutionName: string | null;
  totalScore: number;
  ratingPoints: number;
  effectiveScore: number;
  quizzesPlayed: number;
  quizzesWon: number;
  winRate: number;
  averageAccuracy: number;
  averageTimeSec: number;
  lastActiveAt: string | null;
  isActive: boolean;
  rankBadge: 'CHAMPION' | 'MASTER' | 'GRANDMASTER' | 'CONTENDER';
}

export interface UserAnalyticsData {
  totalScore: number;
  ratingPoints: number;
  quizzesPlayed: number;
  quizzesWon: number;
  averageAccuracy: number;
  averageTimeSec: number;
  globalRank: number;
  totalRankedPlayers: number;
  codingLevel: string;
  percentile: number;
}

/**
 * Calculate effective competitive score applying inactivity decay
 */
function computeEffectiveScore(user: {
  ratingPoints: number;
  totalScore: number;
  quizzesWon: number;
  lastActiveAt: Date | null;
  createdAt: Date;
}): { effectiveScore: number; isActive: boolean } {
  const baseScore = user.ratingPoints + user.totalScore * 0.5 + user.quizzesWon * 75;
  const lastActive = user.lastActiveAt || user.createdAt;
  const daysSinceActive = Math.floor(
    (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Inactivity decay begins after 7 days of no quiz matches
  if (daysSinceActive > 7) {
    const weeksInactive = Math.floor(daysSinceActive / 7);
    const decayMultiplier = Math.max(0.4, 1 - weeksInactive * 0.08); // 8% penalty per week inactive
    return {
      effectiveScore: Math.round(baseScore * decayMultiplier),
      isActive: daysSinceActive <= 21,
    };
  }

  return {
    effectiveScore: Math.round(baseScore),
    isActive: true,
  };
}

/**
 * Get International Top 10 Global Leaderboard with Inactivity Decay & Recalculation
 */
export async function getGlobalLeaderboard(): Promise<{
  top10: LeaderboardUser[];
  currentUserRank: LeaderboardUser | null;
  totalRankedPlayers: number;
}> {
  try {
    const authUser = await getAuthUser();
    const currentUserId = authUser?.userId || null;

    // Fetch all users with profile data
    const users = await withTimeout(
      prisma.user.findMany({
        where: {
          username: { not: null },
        },
        select: {
          id: true,
          clerkUserId: true,
          name: true,
          username: true,
          avatar: true,
          codingLevel: true,
          institutionName: true,
          totalScore: true,
          ratingPoints: true,
          quizzesPlayed: true,
          quizzesWon: true,
          averageAccuracy: true,
          averageTimeSec: true,
          lastActiveAt: true,
          createdAt: true,
        },
      }),
      10000
    );

    // Compute effective scores with decay
    const evaluatedUsers = users.map((u) => {
      const { effectiveScore, isActive } = computeEffectiveScore(u);
      const winRate =
        u.quizzesPlayed > 0 ? Math.round((u.quizzesWon / u.quizzesPlayed) * 100) : 0;

      return {
        id: u.id,
        clerkUserId: u.clerkUserId,
        name: u.name || 'Anonymous Coder',
        username: u.username || 'developer',
        avatar: u.avatar,
        codingLevel: u.codingLevel || 'BEGINNER',
        institutionName: u.institutionName,
        totalScore: u.totalScore,
        ratingPoints: u.ratingPoints,
        effectiveScore,
        quizzesPlayed: u.quizzesPlayed,
        quizzesWon: u.quizzesWon,
        winRate,
        averageAccuracy: Math.round(u.averageAccuracy),
        averageTimeSec: u.averageTimeSec || 45,
        lastActiveAt: u.lastActiveAt ? u.lastActiveAt.toISOString() : null,
        isActive,
      };
    });

    // Sort by effective score descending; secondary sort by accuracy; tertiary sort by speed (lower time is better)
    evaluatedUsers.sort((a, b) => {
      if (b.effectiveScore !== a.effectiveScore) {
        return b.effectiveScore - a.effectiveScore;
      }
      if (b.averageAccuracy !== a.averageAccuracy) {
        return b.averageAccuracy - a.averageAccuracy;
      }
      return a.averageTimeSec - b.averageTimeSec;
    });

    // Assign dynamic ranks and rank badges
    const rankedUsers: LeaderboardUser[] = evaluatedUsers.map((u, index) => {
      const rank = index + 1;
      let rankBadge: LeaderboardUser['rankBadge'] = 'CONTENDER';
      if (rank === 1) rankBadge = 'CHAMPION';
      else if (rank === 2) rankBadge = 'MASTER';
      else if (rank === 3) rankBadge = 'GRANDMASTER';

      return {
        ...u,
        rank,
        rankBadge,
      };
    });

    const top10 = rankedUsers.slice(0, 10);
    const currentUserRank =
      currentUserId ? rankedUsers.find((u) => u.clerkUserId === currentUserId) || null : null;

    return {
      top10,
      currentUserRank,
      totalRankedPlayers: rankedUsers.length,
    };
  } catch (err) {
    console.error('Error fetching global leaderboard:', err);
    return {
      top10: [],
      currentUserRank: null,
      totalRankedPlayers: 0,
    };
  }
}

/**
 * Get 4 Circular Radial Analytics Bars for User Profile
 */
export async function getUserAnalytics(clerkUserId?: string): Promise<UserAnalyticsData | null> {
  try {
    const authUser = await getAuthUser();
    const targetUserId = clerkUserId || authUser?.userId;
    if (!targetUserId) return null;

    // Recalculate stats with safe timeout
    await withTimeout(recalculateUserStats(targetUserId), 8000).catch(() => {});

    const user = await withTimeout(
      prisma.user.findFirst({
        where: { clerkUserId: targetUserId },
      }),
      10000
    );

    if (!user) return null;

    // Get all users to determine rank
    const allUsers = await withTimeout(
      prisma.user.findMany({
        select: {
          clerkUserId: true,
          ratingPoints: true,
          totalScore: true,
          quizzesWon: true,
          lastActiveAt: true,
          createdAt: true,
        },
      }),
      10000
    );

    const ranked = allUsers.map((u) => ({
      clerkUserId: u.clerkUserId,
      score: computeEffectiveScore(u).effectiveScore,
    }));

    ranked.sort((a, b) => b.score - a.score);

    const rankIndex = ranked.findIndex((r) => r.clerkUserId === targetUserId);
    const globalRank = rankIndex !== -1 ? rankIndex + 1 : ranked.length;
    const percentile =
      ranked.length > 1
        ? Math.max(1, Math.round(((ranked.length - globalRank) / ranked.length) * 100))
        : 99;

    return {
      totalScore: user.totalScore,
      ratingPoints: user.ratingPoints,
      quizzesPlayed: user.quizzesPlayed,
      quizzesWon: user.quizzesWon,
      averageAccuracy: Math.min(100, Math.round(user.averageAccuracy)),
      averageTimeSec: user.averageTimeSec || 45,
      globalRank,
      totalRankedPlayers: ranked.length,
      codingLevel: user.codingLevel || 'BEGINNER',
      percentile,
    };
  } catch (err) {
    console.error('Error fetching user analytics:', err);
    return null;
  }
}

/**
 * Recalculate User Cumulative Stats from Solo, Multiplayer Rooms, and Duels
 */
export async function recalculateUserStats(clerkUserId: string) {
  try {
    const [soloAttempts, roomParticipations, duels] = await Promise.all([
      prisma.soloQuizAttempt.findMany({
        where: { clerkUserId },
        select: { score: true, timeTakenSec: true, correctCount: true, totalQuestions: true, completedAt: true },
      }),
      prisma.quizParticipant.findMany({
        where: { userId: clerkUserId, status: 'SUBMITTED' },
        select: { score: true, completionTimeSec: true, correctAnswers: true, submittedAt: true },
      }),
      prisma.friendChallenge.findMany({
        where: {
          OR: [{ challengerId: clerkUserId }, { opponentId: clerkUserId }],
          status: 'COMPLETED',
        },
        select: {
          challengerId: true,
          opponentId: true,
          challengerScore: true,
          opponentScore: true,
          challengerTimeSec: true,
          opponentTimeSec: true,
          winnerId: true,
          updatedAt: true,
        },
      }),
    ]);

    let totalScore = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalDurationSec = 0;
    const totalMatches = soloAttempts.length + roomParticipations.length + duels.length;
    let quizzesWon = 0;
    let latestActivity: Date | null = null;

    // 1. Process Solo Attempts
    for (const s of soloAttempts) {
      totalScore += s.score;
      totalCorrect += s.correctCount;
      totalQuestions += s.totalQuestions;
      totalDurationSec += s.timeTakenSec;
      if (s.score >= 80) quizzesWon++; // Solo mastery win criterion
      if (!latestActivity || s.completedAt > latestActivity) {
        latestActivity = s.completedAt;
      }
    }

    // 2. Process Multiplayer Rooms
    for (const r of roomParticipations) {
      totalScore += r.score;
      totalCorrect += r.correctAnswers;
      totalQuestions += 10;
      totalDurationSec += r.completionTimeSec;
      if (r.score >= 80) quizzesWon++;
      if (r.submittedAt && (!latestActivity || r.submittedAt > latestActivity)) {
        latestActivity = r.submittedAt;
      }
    }

    // 3. Process 1v1 Duels
    for (const d of duels) {
      const isChallenger = d.challengerId === clerkUserId;
      const myScore = isChallenger ? d.challengerScore || 0 : d.opponentScore || 0;
      const myTime = isChallenger ? d.challengerTimeSec || 0 : d.opponentTimeSec || 0;

      totalScore += myScore;
      totalDurationSec += myTime;
      if (d.winnerId === clerkUserId) quizzesWon++;
      if (!latestActivity || d.updatedAt > latestActivity) {
        latestActivity = d.updatedAt;
      }
    }

    const averageAccuracy =
      totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : totalMatches > 0 ? 75 : 0;
    const averageTimeSec =
      totalMatches > 0 ? Math.round(totalDurationSec / totalMatches) : 45;

    // Rating points formula: Base 1000 + performance bonuses
    const ratingPoints = Math.max(
      800,
      Math.round(1000 + totalScore * 0.2 + quizzesWon * 40 + (averageAccuracy - 50) * 5)
    );

    await prisma.user.updateMany({
      where: { clerkUserId },
      data: {
        totalScore,
        ratingPoints,
        quizzesPlayed: totalMatches,
        quizzesWon,
        averageAccuracy,
        averageTimeSec,
        lastActiveAt: latestActivity || new Date(),
      },
    });

    // Silently check if user achieved a Top 10 leaderboard milestone and email them
    const updatedUser = await prisma.user.findFirst({
      where: { clerkUserId },
      select: { email: true, name: true, username: true, ratingPoints: true, totalScore: true },
    });

    if (updatedUser?.email) {
      const analytics = await getUserAnalytics(clerkUserId);
      if (analytics && analytics.globalRank <= 10) {
        const tier =
          analytics.ratingPoints >= 2000
            ? 'CHAMPION'
            : analytics.ratingPoints >= 1600
            ? 'GRANDMASTER'
            : analytics.ratingPoints >= 1300
            ? 'MASTER'
            : 'CONTENDER';

        const { sendLeaderboardMilestoneEmail } = await import('@/lib/email');
        void sendLeaderboardMilestoneEmail({
          to: updatedUser.email,
          name: updatedUser.name || updatedUser.username || 'Developer',
          username: updatedUser.username || undefined,
          rank: analytics.globalRank,
          totalScore: analytics.totalScore,
          ratingPoints: analytics.ratingPoints,
          tier,
        }).catch((err) => console.error('[Resend Leaderboard Milestone Silent Error]', err));
      }
    }
  } catch (err) {
    console.error('Error recalculating user stats:', err);
  }
}
