'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookOpen,
  PlusCircle,
  Users,
  ClipboardList,
  Menu,
  X,
  Zap,
  LogIn,
  User,
  LogOut,
  Swords,
  Trophy,
  Settings,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { useUser } from '@/lib/supabase/useUser';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/challenge-vs', label: 'Challenge', icon: Swords },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const [avatarError, setAvatarError] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Handle clicking outside to smoothly close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileDropdownOpen]);

  // Close dropdown & mobile drawer on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { logoutUser } = await import('@/app/actions/auth');
      await logoutUser();
      window.dispatchEvent(new Event('cq-auth-change'));
      setShowSignOutModal(false);
      setProfileDropdownOpen(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const isAuthed = isLoaded && !!user;
  const displayName = isAuthed
    ? (user?.name ||
       user?.user_metadata?.full_name ||
       user?.email?.split('@')[0] ||
       'Developer')
    : 'Guest Developer';
  const username = isAuthed
    ? (user?.username
        ? `@${user.username}`
        : user?.user_metadata?.username
        ? `@${user.user_metadata.username}`
        : user?.email || '@developer')
    : '@guest';
  const avatarUrl = isAuthed ? (user?.avatar || user?.user_metadata?.avatar_url) : undefined;

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  // Hide Navbar only during active fullscreen timed quiz session
  const isQuizMode = pathname.startsWith('/quiz/play');

  if (isQuizMode) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5EAF0] bg-white/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#10233F] text-white flex items-center justify-center font-mono font-black text-xs shadow-xs group-hover:bg-[#1769E0] transition-colors">
            &lt;/&gt;
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-[#14213D] font-serif-title">
            Quiz<span className="text-[#1769E0]">Code</span>
          </span>
        </Link>

        {/* Desktop Nav: Home, Courses, Challenge, Leaderboard */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                  isActive
                    ? 'text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7] shadow-xs'
                    : 'text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1769E0]' : 'text-[#5B667A]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Profile Dropdown & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Profile Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className={`text-xs font-semibold flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full transition-all shadow-xs cursor-pointer select-none ${
                profileDropdownOpen
                  ? 'bg-[#F7F8FA] border-2 border-[#1769E0] ring-2 ring-[#1769E0]/15 text-[#14213D]'
                  : 'bg-white border border-[#E5EAF0] text-[#14213D] hover:border-[#1769E0]/40 hover:bg-[#F7F8FA]'
              }`}
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
              id="profile-dropdown-btn"
            >
              {isAuthed && avatarUrl && !avatarError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarUrl}
                  alt={displayName}
                  onError={() => setAvatarError(true)}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-[#1769E0]/30"
                />
              ) : isAuthed ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#10233F] text-white font-black text-[11px] sm:text-xs flex items-center justify-center shadow-xs">
                  {displayName[0]?.toUpperCase() || 'D'}
                </div>
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] flex items-center justify-center shadow-xs">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              )}
              <span className="font-bold text-[#14213D] max-w-[90px] sm:max-w-[130px] truncate">
                {isAuthed ? displayName : 'Profile'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#5B667A] transition-transform duration-200 ${
                  profileDropdownOpen ? 'rotate-180 text-[#1769E0]' : ''
                }`}
              />
            </button>

            {/* Academic Dropdown Menu: Profile, Settings, Sign Out / Sign In */}
            <div
              className={`absolute right-0 mt-2.5 w-64 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-xl p-2 z-50 origin-top-right transition-all duration-200 ease-out ${
                profileDropdownOpen
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
              }`}
              role="menu"
              aria-orientation="vertical"
            >
              {/* Header Preview */}
              <div className="px-3 py-2.5 mb-1.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#14213D] truncate">{displayName}</div>
                  <div className="text-[11px] font-mono text-[#1769E0] truncate mt-0.5">
                    {username}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-2 ${
                    isAuthed
                      ? 'bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7]'
                      : 'bg-white text-[#5B667A] border border-[#E5EAF0]'
                  }`}
                >
                  {isAuthed ? 'Online' : 'Guest'}
                </span>
              </div>

              {/* Dropdown Action Items */}
              <div className="space-y-1">
                {/* 1. Profile Option */}
                <Link
                  href="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    pathname === '/profile'
                      ? 'text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7]'
                      : 'text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center text-[#1769E0] group-hover:scale-105 transition-transform shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#14213D] group-hover:text-[#1769E0] transition-colors">Profile</div>
                    <div className="text-[10px] text-[#5B667A] truncate">Stats, rankings &amp; badges</div>
                  </div>
                </Link>

                {/* 2. Settings Option */}
                <Link
                  href="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    pathname === '/settings'
                      ? 'text-[#B45309] bg-[#FEF9E7] border border-[#FDE68A]'
                      : 'text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FEF9E7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] group-hover:scale-105 transition-transform shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#14213D] group-hover:text-[#B45309] transition-colors">Settings</div>
                    <div className="text-[10px] text-[#5B667A] truncate">Sound, audio &amp; preferences</div>
                  </div>
                </Link>
              </div>

              {/* Divider */}
              <div className="my-1.5 border-t border-[#E5EAF0]" />

              {/* 4. Sign Out / Login Link */}
              {isAuthed ? (
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setShowSignOutModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#D92D20] hover:text-[#B42318] hover:bg-[#FDF2F2] transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FDF2F2] border border-[#FECDCA] flex items-center justify-center text-[#D92D20] group-hover:scale-105 transition-transform shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Sign Out</div>
                    <div className="text-[10px] text-[#D92D20]/70">Disconnect session</div>
                  </div>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#1769E0] hover:text-[#1257BD] hover:bg-[#EBF3FC] transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center text-[#1769E0] group-hover:scale-105 transition-transform shrink-0">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Login / Sign In</div>
                    <div className="text-[10px] text-[#5B667A]">Save progress &amp; compete</div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Login button if not authenticated */}
          {!isAuthed && (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA] border border-[#E5EAF0] transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5EAF0] bg-white animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg">
          <nav className="flex flex-col p-4 gap-1">
            {/* Core Nav Links: Home, Courses, Challenge, Leaderboard */}
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7]'
                      : 'text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Profile Dropdown Items in Mobile */}
            <div className="pt-3 mt-2 border-t border-[#E5EAF0] space-y-1">
              <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#5B667A]">
                Account &amp; Workspace
              </div>

              {/* Profile */}
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname === '/profile'
                    ? 'text-[#1769E0] bg-[#EBF3FC] font-bold'
                    : 'text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA]'
                }`}
              >
                <User className="w-4 h-4 text-[#1769E0]" />
                <span>Profile</span>
              </Link>

              {/* Settings */}
              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname === '/settings'
                    ? 'text-[#B45309] bg-[#FEF9E7] font-bold'
                    : 'text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA]'
                }`}
              >
                <Settings className="w-4 h-4 text-[#B45309]" />
                <span>Settings</span>
              </Link>

              {/* Sign Out / Login */}
              {isAuthed ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setShowSignOutModal(true);
                  }}
                  className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-xl text-xs font-bold text-[#D92D20] bg-[#FDF2F2] border border-[#FECDCA] hover:bg-[#FEE4E2] transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full mt-3 py-3 rounded-xl text-sm font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Sign In</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Sign Out Permission Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] flex items-center justify-center mx-auto shadow-xs">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#14213D] font-serif-title">
                Sign Out of QuizCode?
              </h3>
              <p className="text-xs text-[#5B667A] leading-relaxed">
                Are you sure you want to sign out? You will need to sign back in to access saved scores and private rooms.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                disabled={isSigningOut}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-[#5B667A] hover:text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmSignOut}
                disabled={isSigningOut}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-[#D92D20] hover:bg-[#B42318] shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSigningOut ? (
                  <span>Signing out...</span>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Yes, Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
