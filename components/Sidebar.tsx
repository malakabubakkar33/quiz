'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  FileText,
  PlusCircle,
  Users,
  Swords,
  Trophy,
  User,
  Settings,
  PanelLeftClose,
  Menu,
  X,
  ChevronUp,
  LogOut,
  LogIn,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { useUser } from '@/lib/supabase/useUser';
import { useClerk } from '@clerk/nextjs';

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/courses', label: 'Single Quiz', icon: FileText },
  { href: '/create-quiz', label: 'Create Quiz', icon: PlusCircle },
  { href: '/join-quiz', label: 'Join Quiz', icon: Users },
  { href: '/challenge-vs', label: 'Challenge', icon: Swords },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropUpOpen, setProfileDropUpOpen] = useState(false);
  const dropUpRef = useRef<HTMLDivElement>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('cq_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('cq_sidebar_collapsed', String(next));
    } catch {
      // ignore
    }
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent('cq-sidebar-change', { detail: { isCollapsed: next } }));
    });
  };

  useEffect(() => {
    setProfileDropUpOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropUpRef.current && !dropUpRef.current.contains(event.target as Node)) {
        setProfileDropUpOpen(false);
      }
    };
    if (profileDropUpOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropUpOpen]);

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      try {
        await signOut({ redirectUrl: '/login' });
      } catch (clerkErr) {
        console.warn('Clerk signOut error in sidebar, continuing fallback:', clerkErr);
      }
      const { logoutUser } = await import('@/app/actions/auth');
      await logoutUser();
      window.dispatchEvent(new Event('cq-auth-change'));
      setShowSignOutModal(false);
      setProfileDropUpOpen(false);
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

  // Hide during active timed quiz mode
  if (pathname.startsWith('/quiz/play')) {
    return null;
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE DRAWER TRIGGER (< md)
          ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="w-12 h-12 rounded-full bg-[#1769E0] text-white flex items-center justify-center shadow-lg shadow-blue-950/40 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SIDEBAR CONTAINER (#10233F DARK NAVY)
          ───────────────────────────────────────────────────────────── */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#10233F] border-r border-[#1C365D] shadow-xl select-none transform-gpu will-change-[width,transform] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${mounted && !isCollapsed ? 'md:w-60' : 'md:w-[72px]'}
        `}
      >
        {/* ── TOP SECTION: LOGO + TOGGLE BUTTON ── */}
        <div className="p-3.5 border-b border-[#1C365D] relative shrink-0">
          <div
            className={`flex items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isCollapsed && !mobileOpen ? 'flex-col justify-center gap-2' : 'justify-between'
            }`}
          >
            {/* Logo Link */}
            <Link
              href="/"
              title="QuizCode Home"
              className="flex items-center gap-2.5 min-w-0 group"
            >
              <div className="w-9 h-9 shrink-0 rounded-xl bg-[#1769E0] text-white flex items-center justify-center shadow-sm group-hover:bg-[#1257BD] transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>

              {/* Brand Name (when expanded) */}
              <div
                className={`flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isCollapsed && !mobileOpen
                    ? 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                    : 'opacity-100 max-w-[140px] translate-x-0'
                }`}
              >
                <span className="text-base font-bold tracking-tight text-white whitespace-nowrap leading-none">
                  Quiz<span className="text-[#599BFF]">Code</span>
                </span>
                <span className="text-[10px] font-mono text-[#8FA7C9] uppercase font-semibold mt-1 whitespace-nowrap">
                  Academy
                </span>
              </div>
            </Link>

            {/* Toggle Button */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white transition-all cursor-pointer shadow-sm shrink-0"
            >
              <PanelLeftClose
                className={`w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isCollapsed ? 'rotate-180 text-[#599BFF]' : 'rotate-0 text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── NAVIGATION ITEMS (#10233F WITH #1769E0 ACTIVE STATE) ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3.5 px-2.5 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group relative flex items-center rounded-xl text-xs h-10 transition-all duration-200
                  ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'}
                  ${
                    isActive
                      ? 'bg-[#1769E0] text-white font-bold shadow-sm'
                      : 'text-[#D1DCEB] hover:text-white hover:bg-white/[0.08] font-medium'
                  }
                `}
              >
                <div
                  className={`shrink-0 flex items-center justify-center transition-transform duration-200 ${
                    isActive ? 'text-white' : 'text-[#A4B8D3] group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label */}
                <div
                  className={`flex items-center justify-between flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isCollapsed && !mobileOpen
                      ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                      : 'opacity-100 max-w-[150px] translate-x-0'
                  }`}
                >
                  <span className="truncate tracking-wide whitespace-nowrap">{item.label}</span>
                </div>

                {/* Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="hidden md:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-[#0C1B31] border border-[#1C365D] text-white text-xs font-semibold rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none items-center gap-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                    <span>{item.label}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── BOTTOM USER PROFILE SECTION ── */}
        <div className="p-2.5 border-t border-[#1C365D] relative shrink-0" ref={dropUpRef}>
          {profileDropUpOpen && (
            <div
              className={`absolute bottom-full mb-2 rounded-xl bg-[#0C1B31] border border-[#1C365D] shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150 ${
                isCollapsed && !mobileOpen ? 'left-2 w-56' : 'left-2 right-2'
              }`}
            >
              <div className="px-3 py-2 border-b border-[#1C365D] mb-1">
                <div className="text-xs font-bold text-white truncate">{displayName}</div>
                <div className="text-[10px] font-mono text-[#599BFF] truncate">{username}</div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setProfileDropUpOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#D1DCEB] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#599BFF]" />
                  <span>Profile &amp; Stats</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setProfileDropUpOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#D1DCEB] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#8FA7C9]" />
                  <span>Settings</span>
                </Link>

                {isAuthed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropUpOpen(false);
                      setShowSignOutModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setProfileDropUpOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#599BFF] hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setProfileDropUpOpen((prev) => !prev)}
            title={displayName}
            className={`w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer p-1.5 border ${
              isCollapsed ? 'justify-center' : 'gap-2.5 px-2'
            } ${
              profileDropUpOpen
                ? 'bg-[#132A4B] border-[#1769E0]'
                : 'bg-[#0C1B31] hover:bg-[#132A4B] border-[#1C365D]'
            }`}
          >
            {isAuthed && avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#1769E0]/50 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1769E0] text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                {displayName[0]?.toUpperCase() || 'A'}
              </div>
            )}

            <div
              className={`flex-1 min-w-0 text-left overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isCollapsed && !mobileOpen
                  ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                  : 'opacity-100 max-w-[130px] translate-x-0'
              }`}
            >
              <div className="text-xs font-bold text-white truncate leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] text-[#8FA7C9] truncate font-mono">
                {username}
              </div>
            </div>

            {(!isCollapsed || mobileOpen) && (
              <ChevronUp
                className={`w-3.5 h-3.5 text-[#8FA7C9] transition-transform duration-200 ${
                  profileDropUpOpen ? 'rotate-180 text-[#599BFF]' : ''
                }`}
              />
            )}
          </button>
        </div>
      </aside>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0C1B31] border border-[#1C365D] p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Sign Out of QuizCode?</h3>
              <p className="text-xs text-[#D1DCEB]">
                You will need to sign back in to participate in live rooms and save leaderboard points.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                disabled={isSigningOut}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSignOut}
                disabled={isSigningOut}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
