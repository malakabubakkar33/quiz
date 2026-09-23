import Link from 'next/link';
import { getAuthUser } from '@/app/actions/auth';
import { getUserAnalytics } from '@/app/actions/leaderboard';
import { ProfileAnalyticsRings } from '@/components/ProfileAnalyticsRings';
import { ProfileSignOutButton } from '@/components/ProfileSignOutButton';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  Target,
  GraduationCap,
  Sparkles,
  Shield,
  Camera,
  Code2,
  Mail,
  UserCheck,
  Settings,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer Profile & Assessment Stats | QuizCode',
  description: 'View your real-time MMR rating, accuracy rankings, quiz assessment metrics, and developer skill stats.',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const [user, analytics] = await Promise.all([
    getAuthUser(),
    getUserAnalytics(),
  ]);

  const stats = {
    totalCompleted: analytics?.quizzesPlayed || 0,
    averageScore: analytics?.averageAccuracy || 0,
    quizzesWon: analytics?.quizzesWon || 0,
    totalTimeSec: (analytics?.quizzesPlayed || 0) * (analytics?.averageTimeSec || 40),
  };
  const isGuest = user?.provider !== 'clerk' && !user?.userId;

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m ${sec % 60}s`;
  };

  const displayName = user?.name || 'Developer';
  const primaryEmail = user?.email || 'guest@codequiz.dev';
  const ratingPoints = analytics?.ratingPoints || 1000;

  const getTierDetails = (rp: number) => {
    if (rp >= 2200) return { name: 'Grandmaster Coder', badge: 'bg-[#FEF9E7] text-[#B45309] border-[#FDE68A]' };
    if (rp >= 1800) return { name: 'Diamond Master', badge: 'bg-[#EBF3FC] text-[#1769E0] border-[#C8DEF7]' };
    if (rp >= 1400) return { name: 'Platinum Contender', badge: 'bg-[#F3E8FF] text-[#7C3AED] border-[#DDD6FE]' };
    return { name: 'Challenger Rank', badge: 'bg-[#EEF7F2] text-[#0D9488] border-[#99F6E4]' };
  };

  const tier = getTierDetails(ratingPoints);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-14 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-end">
        <Link
          href="/settings"
          className="text-xs font-bold text-[#5B667A] hover:text-[#1769E0] transition-colors flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5 text-[#5B667A]" />
          <span>Settings &amp; Preferences →</span>
        </Link>
      </div>

      {/* Guest Mode Notice */}
      {isGuest && (
        <div className="p-4 rounded-2xl bg-white border-2 border-[#E5EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#1769E0] shrink-0" />
            <div className="text-xs sm:text-sm text-[#5B667A]">
              You are viewing a <strong className="text-[#14213D]">Guest Developer Profile</strong>. Sign in to permanently save your assessments, sync MMR, and unlock 1v1 friend duels.
            </div>
          </div>
          <Link
            href="/login?redirect_url=/profile"
            className="px-4 py-2 bg-[#1769E0] hover:bg-[#1257BD] text-white text-xs font-bold rounded-xl transition-colors shrink-0 text-center shadow-xs"
          >
            Sign In / Register
          </Link>
        </div>
      )}

      {/* 1. Developer Profile Identity Card */}
      <div className="rounded-2xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Customizer Link */}
          <div className="flex flex-col items-center sm:items-start gap-2.5 shrink-0">
            <Link
              href="/profile/edit-avatar"
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#EBF3FC] border-2 border-[#C8DEF7] p-0.5 shadow-xs shrink-0 overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1769E0] transition-all hover:scale-[1.02]"
              title="Click to customize avatar and photo"
            >
              {user?.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-[#1769E0] bg-[#EBF3FC] rounded-[14px]">
                  {(displayName || 'D')[0].toUpperCase()}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#14213D]/70 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[14px] text-white">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[10px] font-bold text-white mt-1">Change Photo</span>
              </div>
            </Link>

            <Link
              href="/profile/edit-avatar"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-[#1769E0] hover:text-[#1257BD] bg-[#EBF3FC] border border-[#C8DEF7] transition-all cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Customize Avatar</span>
            </Link>
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left space-y-3 flex-1 min-w-0">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title tracking-tight">
                  {displayName}
                </h1>
                {user?.username && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7]">
                    @{user.username}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${tier.badge}`}>
                  <Sparkles className="w-3 h-3" />
                  <span>{tier.name}</span>
                </span>
              </div>
            </div>

            {/* Email & Academic Credentials */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-xs text-[#5B667A] pt-1">
              <span className="flex items-center gap-1.5 text-[#5B667A]">
                <Mail className="w-4 h-4 text-[#5B667A]" />
                {primaryEmail}
              </span>

              {user?.institutionName && (
                <span className="flex items-center gap-1.5 text-[#14213D] font-medium">
                  <GraduationCap className="w-4 h-4 text-[#1769E0]" />
                  <span>
                    {user.institutionType ? `${user.institutionType.charAt(0) + user.institutionType.slice(1).toLowerCase()}: ` : ''}
                    {user.institutionName}
                  </span>
                </span>
              )}

              {user?.codingLevel && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#F0F4F8] text-[#14213D] border border-[#E5EAF0]">
                  <Code2 className="w-3.5 h-3.5 text-[#1769E0]" />
                  {user.codingLevel} DEVELOPER
                </span>
              )}

              <span className="flex items-center gap-1.5 text-[#10B981] font-semibold text-xs">
                <UserCheck className="w-4 h-4" />
                <span>{isGuest ? 'Guest Session' : 'Verified Account'}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Link
                href="/profile/edit-avatar"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Avatar Studio</span>
              </Link>

              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#14213D] hover:bg-[#E5EAF0] bg-[#F0F4F8] border border-[#E5EAF0] transition-colors"
              >
                <span>Preferences &amp; Settings</span>
              </Link>

              {!isGuest && <ProfileSignOutButton />}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Realtime Radial Analytics */}
      <ProfileAnalyticsRings analytics={analytics} />

      {/* 3. Lifetime Performance Analytics Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#14213D] flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#1769E0]" />
          <span>Lifetime Assessment &amp; Skill Metrics</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center text-[#1769E0] mb-2.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#14213D]">{stats.totalCompleted}</div>
            <div className="text-[11px] font-bold text-[#5B667A] mt-1 uppercase tracking-wider">
              Quizzes Solved
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#EEF7F2] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] mb-2.5">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#14213D]">{stats.averageScore}%</div>
            <div className="text-[11px] font-bold text-[#5B667A] mt-1 uppercase tracking-wider">
              Average Accuracy
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#FEF9E7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] mb-2.5">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#14213D]">{stats.quizzesWon}</div>
            <div className="text-[11px] font-bold text-[#5B667A] mt-1 uppercase tracking-wider">
              Arena Victories
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] mb-2.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#14213D]">{formatSecs(stats.totalTimeSec)}</div>
            <div className="text-[11px] font-bold text-[#5B667A] mt-1 uppercase tracking-wider">
              Dedication Time
            </div>
          </div>
        </div>
      </div>

      {/* 4. Credentials & Security Details */}
      <div className="p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-[#14213D] flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#1769E0]" />
          <span>Profile Authentication &amp; Security</span>
        </h3>
        <p className="text-xs text-[#5B667A] leading-relaxed">
          Your profile is securely synced to your Account (<code className="text-[#14213D] font-mono text-[11px] bg-[#F7F8FA] border border-[#E5EAF0] px-1.5 py-0.5 rounded">{user?.userId || 'Guest Session'}</code>). All assessment ratings, MMR points, accuracy percentiles, and avatar customizer assets are encrypted and tied to this account.
        </p>
      </div>
    </div>
  );
}
