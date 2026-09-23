'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, User, Settings, LogOut, LogIn, Swords, GraduationCap } from 'lucide-react';
import { useUser } from '@/lib/supabase/useUser';
import { useClerk } from '@clerk/nextjs';
import { CourseSearch } from './CourseSearch';
import { ConfirmationModal } from './ConfirmationModal';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close dropdowns on route change
  useEffect(() => {
    setDropdownOpen(false);
    setNotificationsOpen(false);
    setShowLogoutModal(false);
  }, [pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      try {
        await signOut({ redirectUrl: '/login' });
      } catch (clerkErr) {
        console.warn('Clerk signOut error, continuing fallback:', clerkErr);
      }
      const { logoutUser } = await import('@/app/actions/auth');
      await logoutUser();
      window.dispatchEvent(new Event('cq-auth-change'));
      setDropdownOpen(false);
      setShowLogoutModal(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isAuthed = isLoaded && !!user;
  const displayName = isAuthed
    ? user?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer'
    : 'Guest';
  const username = isAuthed
    ? user?.username
      ? `@${user.username}`
      : user?.user_metadata?.username
      ? `@${user.user_metadata.username}`
      : user?.email || '@developer'
    : '@guest';
  const avatarUrl = isAuthed ? user?.avatar || user?.user_metadata?.avatar_url : undefined;

  // Hide in quiz play mode
  if (pathname.startsWith('/quiz/play')) {
    return null;
  }

  return (
    <>
      <header
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(229, 234, 240, 0.85)',
        }}
        className="sticky top-0 z-40 w-full h-16 bg-white/90 backdrop-blur-md border-b border-[#E5EAF0]/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none shadow-xs transition-all"
      >
        {/* ── LEFT: LOGO & BRANDING ── */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#1769E0] text-white flex items-center justify-center shadow-sm group-hover:bg-[#1257BD] transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-[#14213D] text-navy-primary flex items-center">
              Quiz<span className="text-[#1769E0]">Code</span>
            </span>
          </Link>

          {/* Navigation: Learn, Practice, Compete */}
          <nav className="hidden lg:flex items-center gap-1 pl-3 border-l border-[#E5EAF0] border-card">
            <Link
              href="/courses"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#14213D] text-navy-primary hover:text-[#1769E0] hover:bg-[#F0F4F8] transition-colors"
            >
              Learn
            </Link>
            <Link
              href="/courses"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#14213D] text-navy-primary hover:text-[#1769E0] hover:bg-[#F0F4F8] transition-colors"
            >
              Practice
            </Link>
            <Link
              href="/challenge-vs"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#14213D] text-navy-primary hover:text-[#1769E0] hover:bg-[#F0F4F8] transition-colors"
            >
              Compete
            </Link>
          </nav>
        </div>

        {/* ── CENTER: LIVE COURSE SEARCH ── */}
        <div className="flex-1 flex justify-center max-w-xl mx-auto px-2">
          <CourseSearch />
        </div>

        {/* ── RIGHT: NOTIFICATIONS & USER PROFILE OR SIGN IN ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isAuthed ? (
            /* UNAUTHENTICATED: Show ONLY Sign In Button */
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1769E0] hover:bg-[#1257BD] text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          ) : (
            /* AUTHENTICATED: Show Bell Notification + Profile Dropdown */
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  title="Notifications"
                  className="w-9 h-9 rounded-xl bg-[#F0F4F8] hover:bg-[#E5EAF0] border border-[#E5EAF0] text-[#14213D] flex items-center justify-center transition-colors cursor-pointer relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1769E0] ring-2 ring-white" />
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#FFFFFF] border border-[#E5EAF0] shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF0] mb-2">
                      <span className="text-xs font-bold text-[#14213D]">Notifications</span>
                      <span className="text-[10px] font-mono text-[#1769E0] font-bold">Live Arena</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] text-xs flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-[#EBF3FC] text-[#1769E0] flex items-center justify-center shrink-0 mt-0.5">
                          <Swords className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-[11px] text-[#14213D]">1v1 Duel Arena Active</p>
                          <p className="text-[10px] text-[#5B667A]">Challenge any friend by username in real-time.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F0F4F8] border border-[#E5EAF0] shadow-2xs transition-colors cursor-pointer"
                >
                  {/* Avatar */}
                  {avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#1769E0]/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#1769E0] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {displayName[0]?.toUpperCase() || 'A'}
                    </div>
                  )}

                  <span className="text-xs font-bold text-[#14213D] max-w-[95px] truncate hidden sm:inline">
                    {displayName}
                  </span>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#5B667A] transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-[#1769E0]' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FFFFFF] border border-[#E5EAF0] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-[#E5EAF0] mb-1">
                      <div className="text-xs font-bold text-[#14213D] truncate">{displayName}</div>
                      <div className="text-[10px] font-mono text-[#5B667A] truncate">{username}</div>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#14213D] hover:text-[#1769E0] hover:bg-[#F0F4F8] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#1769E0]" />
                        <span>Profile &amp; Stats</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#14213D] hover:text-[#1769E0] hover:bg-[#F0F4F8] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#5B667A]" />
                        <span>Settings</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        variant="danger"
        title="Sign Out of QuizCode?"
        message="Are you sure you want to sign out? You will need to sign back in to access saved assessment stats, MMR ratings, and custom duels."
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        isLoading={isLoggingOut}
        onConfirm={handleSignOut}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
