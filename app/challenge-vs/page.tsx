import { redirect } from 'next/navigation';
import { getAuthUser } from '@/app/actions/auth';
import { getChallengeCourses, getUserChallenges, getRecentOrSuggestedFriends } from '@/app/actions/challenge';
import { getGlobalLeaderboard } from '@/app/actions/leaderboard';
import { ChallengeHub } from '@/components/ChallengeHub';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '1v1 Challenge • Challenge Your Friends | CodeQuiz Arena',
  description: 'Find your friend, send a challenge, and compete in real-time coding quizzes.',
};

export const dynamic = 'force-dynamic';

export default async function ChallengeVsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login?redirect_url=/challenge-vs');
  }

  const [courses, { incomingPending, outgoingPending, recentCompleted }, suggestedFriends, leaderboardData] =
    await Promise.all([
      getChallengeCourses(),
      getUserChallenges(),
      getRecentOrSuggestedFriends(),
      getGlobalLeaderboard().catch(() => ({ top10: [] })),
    ]);

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-start bg-[#070B14] text-white">
      <ChallengeHub
        courses={courses as any}
        initialPendingIncoming={incomingPending}
        initialPendingOutgoing={outgoingPending}
        initialRecentCompleted={recentCompleted}
        suggestedFriends={suggestedFriends}
        topChallengers={leaderboardData?.top10?.slice(0, 5) || []}
      />
    </main>
  );
}
