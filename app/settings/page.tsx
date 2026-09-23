import { getAuthUser } from '@/app/actions/auth';
import Link from 'next/link';
import {
  Settings,
  User,
  Camera,
  Mail,
} from 'lucide-react';
import type { Metadata } from 'next';
import { AppSettingsClient } from '@/components/AppSettingsClient';

export const metadata: Metadata = {
  title: 'Settings & Preferences | QuizCode',
  description: 'Manage your audio sound effects, background music, quiz gameplay speeds, and duel notifications.',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getAuthUser();

  const displayName = user?.name || 'Developer';
  const displayEmail = user?.email || 'guest@codequiz.dev';
  const displayUsername = user?.username ? `@${user.username}` : '@guest';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-14 space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAF0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5EAF0] text-[#1769E0] text-xs font-bold shadow-2xs mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences &amp; Control</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title tracking-tight">
            Application Settings
          </h1>

          <p className="text-xs sm:text-sm text-[#5B667A] mt-0.5">
            Configure audio effects, answering speed, duel invite notifications, and display modes.
          </p>
        </div>

        {/* Quick Nav Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#14213D] hover:bg-[#E5EAF0] bg-white border border-[#E5EAF0] shadow-2xs transition-all"
          >
            <User className="w-3.5 h-3.5 text-[#1769E0]" />
            <span>View Profile</span>
          </Link>
        </div>
      </div>

      {/* Account Info Strip */}
      <div className="rounded-2xl bg-white border-2 border-[#E5EAF0] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] shrink-0 overflow-hidden">
            {user?.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.avatar}
                alt={displayName}
                className="w-full h-full object-cover rounded-[10px]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg text-[#1769E0] bg-[#EBF3FC]">
                {displayName[0]?.toUpperCase() || 'D'}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#14213D]">{displayName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7]">
                {displayUsername}
              </span>
            </div>
            <div className="text-xs text-[#5B667A] mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[#5B667A]" />
              <span>{displayEmail}</span>
            </div>
          </div>
        </div>

        <Link
          href="/profile/edit-avatar"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1769E0] hover:text-[#1257BD] bg-[#EBF3FC] border border-[#C8DEF7] transition-all shadow-2xs flex items-center gap-1.5"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Edit Avatar &amp; Photo</span>
        </Link>
      </div>

      {/* Real Interactive Settings Component */}
      <AppSettingsClient initialUser={user} />
    </div>
  );
}
