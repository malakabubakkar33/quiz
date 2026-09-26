'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  User,
  School,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Code2,
  Flame,
  Zap,
  Check,
  LogOut,
  ArrowRight,
  ShieldCheck,
  X,
  BookOpen,
} from 'lucide-react';
import type { AppUser } from '@/lib/supabase/useUser';

interface OnboardingModalProps {
  user: AppUser | any;
  onCompleted?: () => void;
  isStandalonePage?: boolean;
}

type InstitutionType = 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY';
type CodingLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export function OnboardingModal({
  user,
  onCompleted,
  isStandalonePage = false,
}: OnboardingModalProps) {
  const router = useRouter();

  // Initial values from user metadata if any
  const defaultName =
    user?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    '';

  const defaultUsername = (
    user?.username ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    ''
  )
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 18);

  const [name, setName] = useState(defaultName);
  const [username, setUsername] = useState(defaultUsername);
  const [institutionType, setInstitutionType] = useState<InstitutionType>(
    (user?.institutionType as InstitutionType) || 'COLLEGE'
  );
  const [institutionName, setInstitutionName] = useState(user?.institutionName || '');
  const [codingLevel, setCodingLevel] = useState<CodingLevel>(
    (user?.codingLevel as CodingLevel) || 'BEGINNER'
  );

  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameMessage, setUsernameMessage] = useState<string>('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Debounced username check
  useEffect(() => {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setUsernameAvailable(null);
      setUsernameMessage(cleanUsername ? 'Minimum 3 characters required.' : '');
      setUsernameSuggestions([]);
      return;
    }

    // If current username is already assigned to this user
    if (user?.username && cleanUsername === user.username.toLowerCase()) {
      setUsernameAvailable(true);
      setUsernameMessage('Current username');
      setUsernameSuggestions([]);
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/user/check-username?username=${encodeURIComponent(cleanUsername)}`
        );
        const data = await res.json();
        setUsernameAvailable(data.available);
        setUsernameMessage(data.message || '');
        setUsernameSuggestions(data.suggestions || []);
      } catch {
        setUsernameAvailable(null);
        setUsernameMessage('Unable to verify username right now.');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, user?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!username.trim() || usernameAvailable === false) {
      setErrorMessage('Please choose an available unique username handle.');
      return;
    }

    if (!institutionName.trim()) {
      setErrorMessage(`Please enter the name of your ${institutionType.toLowerCase()}.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase().replace(/^@/, ''),
          institutionType,
          institutionName: institutionName.trim(),
          codingLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to complete profile setup.');
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onCompleted) onCompleted();
        router.push('/');
        router.refresh();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving profile.');
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const { logoutUser } = await import('@/app/actions/auth');
    await logoutUser();
    window.dispatchEvent(new Event('cq-auth-change'));
    router.push('/login');
    router.refresh();
  };

  const formCard = (
    <div
      className={`relative w-full max-w-2xl my-auto rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-2xl shadow-[#14213D]/15 text-[#14213D] flex flex-col ${
        isStandalonePage
          ? 'max-h-[calc(100dvh-6rem)] sm:max-h-[min(88vh,880px)]'
          : 'max-h-[calc(100dvh-2rem)] sm:max-h-[min(90vh,880px)]'
      } overflow-hidden`}
    >
      {/* ── TOP HEADER SECTION (Pinned at top) ── */}
      <div className="shrink-0 p-5 sm:p-7 pb-4 border-b border-[#E5EAF0] bg-white space-y-3 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7] shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-[#1769E0]" />
            <span className="uppercase tracking-wider text-[11px]">Academic Profile Setup</span>
          </div>

          <div className="flex items-center gap-2">
            {!isStandalonePage && (
              <button
                type="button"
                onClick={() => {
                  if (onCompleted) onCompleted();
                }}
                className="text-xs font-semibold text-[#1769E0] hover:text-[#1257BD] px-2.5 py-1 rounded-lg bg-[#EBF3FC] hover:bg-[#DCEBFB] border border-[#C8DEF7] transition-all cursor-pointer"
              >
                Skip for now →
              </button>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-medium text-[#5B667A] hover:text-[#D92D20] flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-[#FDF2F2]"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {!isStandalonePage && (
              <button
                type="button"
                onClick={() => {
                  if (onCompleted) onCompleted();
                }}
                className="p-1 rounded-lg text-[#5B667A] hover:text-[#14213D] hover:bg-[#F0F4F8] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#14213D] font-serif-title tracking-tight">
            Welcome to QuizCode
          </h2>
          <p className="text-xs sm:text-sm text-[#5B667A] mt-1 leading-relaxed">
            Please complete this quick profile initialization. Your details customize multiplayer arena matchmaking, campus leaderboards, and personalized coding quizzes.
          </p>
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0]">
          <div className="w-9 h-9 rounded-lg bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center font-bold text-sm text-[#1769E0] shrink-0 overflow-hidden">
            {user?.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (name[0] || 'D').toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#14213D] truncate">
              {name || 'New Developer'}
            </div>
            <div className="text-[11px] text-[#5B667A] truncate">
              {user?.email || 'Signed in via Clerk'}
            </div>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8]">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified</span>
          </div>
        </div>
      </div>

      {/* ── FORM WITH SCROLLABLE FIELDS & DOCKED FOOTER ── */}
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7 py-5 space-y-5 overscroll-contain focus:outline-none">
          {/* Section 1: Full Name & Unique Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ali Ahmed"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5EAF0] text-sm font-semibold text-[#14213D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
            />
          </div>

          {/* Unique Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="text-[#1769E0] font-mono font-bold">@</span>
                <span>Unique Handle</span>
              </span>
              {isCheckingUsername && (
                <span className="text-[10px] text-[#1769E0] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Checking...</span>
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[#5B667A] font-mono font-bold text-sm select-none">
                @
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
                placeholder="handle"
                maxLength={20}
                className={`w-full pl-8 pr-9 py-2.5 rounded-xl bg-white border text-sm font-mono font-semibold text-[#14213D] placeholder:text-[#94A3B8] focus:outline-none transition-all shadow-2xs ${
                  usernameAvailable === true
                    ? 'border-[#0F8A52] focus:ring-2 focus:ring-[#0F8A52]/15'
                    : usernameAvailable === false
                    ? 'border-[#D92D20] focus:ring-2 focus:ring-[#D92D20]/15'
                    : 'border-[#E5EAF0] focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15'
                }`}
              />
              {usernameAvailable === true && (
                <CheckCircle2 className="w-4 h-4 text-[#0F8A52] absolute right-3 top-3" />
              )}
              {usernameAvailable === false && (
                <AlertCircle className="w-4 h-4 text-[#D92D20] absolute right-3 top-3" />
              )}
            </div>

            {/* Live Availability Note */}
            {usernameMessage && (
              <div
                className={`text-[11px] font-medium transition-all ${
                  usernameAvailable === true
                    ? 'text-[#0F8A52]'
                    : usernameAvailable === false
                    ? 'text-[#D92D20]'
                    : 'text-[#5B667A]'
                }`}
              >
                {usernameMessage}
              </div>
            )}

            {/* Suggestions when taken */}
            {usernameSuggestions.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-[#5B667A]">Suggestions:</span>
                {usernameSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setUsername(sug)}
                    className="text-[10px] font-mono font-bold text-[#1769E0] bg-[#EBF3FC] hover:bg-[#DCEBFB] px-2 py-0.5 rounded-md border border-[#C8DEF7] transition-colors cursor-pointer"
                  >
                    @{sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: School / College / University */}
        <div className="space-y-3 p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>Academic Institution</span>
            </label>
            <span className="text-[11px] text-[#5B667A]">Select campus level</span>
          </div>

          {/* 3 Institution Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setInstitutionType('SCHOOL')}
              className={`py-2.5 px-2 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                institutionType === 'SCHOOL'
                  ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                  : 'bg-white border-[#E5EAF0] text-[#5B667A] hover:text-[#14213D] hover:border-[#CBD5E1]'
              }`}
            >
              <School className="w-4 h-4 shrink-0" />
              <span>School</span>
            </button>

            <button
              type="button"
              onClick={() => setInstitutionType('COLLEGE')}
              className={`py-2.5 px-2 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                institutionType === 'COLLEGE'
                  ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                  : 'bg-white border-[#E5EAF0] text-[#5B667A] hover:text-[#14213D] hover:border-[#CBD5E1]'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>College</span>
            </button>

            <button
              type="button"
              onClick={() => setInstitutionType('UNIVERSITY')}
              className={`py-2.5 px-2 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                institutionType === 'UNIVERSITY'
                  ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                  : 'bg-white border-[#E5EAF0] text-[#5B667A] hover:text-[#14213D] hover:border-[#CBD5E1]'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>University</span>
            </button>
          </div>

          {/* Institution Name Input */}
          <div className="space-y-1">
            <input
              type="text"
              required
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder={
                institutionType === 'SCHOOL'
                  ? 'e.g. Army Public School / Beaconhouse School'
                  : institutionType === 'COLLEGE'
                  ? 'e.g. Punjab College / GC College / Cadet College'
                  : 'e.g. NUST / FAST-NUCES / Stanford University'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5EAF0] text-sm font-semibold text-[#14213D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Section 3: Coding Experience Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider block">
              Coding Experience Level
            </label>
            <span className="text-[11px] text-[#5B667A]">Calibrates quiz questions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Option 1: Beginner */}
            <button
              type="button"
              onClick={() => setCodingLevel('BEGINNER')}
              className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                codingLevel === 'BEGINNER'
                  ? 'bg-[#EBF3FC] border-2 border-[#1769E0] ring-2 ring-[#1769E0]/15'
                  : 'bg-white border-[#E5EAF0] hover:border-[#CBD5E1] hover:bg-[#F7F8FA]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7] flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#14213D]">Beginner</div>
                <p className="text-[11px] text-[#5B667A] leading-tight">
                  Just starting out with coding fundamentals and basic syntax.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-bold text-[#1769E0] uppercase tracking-wider">
                Level 1 • Explorer
              </div>
              {codingLevel === 'BEGINNER' && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#1769E0] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Option 2: Intermediate */}
            <button
              type="button"
              onClick={() => setCodingLevel('INTERMEDIATE')}
              className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                codingLevel === 'INTERMEDIATE'
                  ? 'bg-[#EEF2F6] border-2 border-[#14213D] ring-2 ring-[#14213D]/15'
                  : 'bg-white border-[#E5EAF0] hover:border-[#CBD5E1] hover:bg-[#F7F8FA]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#EEF2F6] text-[#14213D] border border-[#CBD5E1] flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#14213D]">Intermediate</div>
                <p className="text-[11px] text-[#5B667A] leading-tight">
                  Comfortable building real projects, functions, and web apps.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-bold text-[#14213D] uppercase tracking-wider">
                Level 2 • Builder
              </div>
              {codingLevel === 'INTERMEDIATE' && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#14213D] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Option 3: Expert */}
            <button
              type="button"
              onClick={() => setCodingLevel('EXPERT')}
              className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                codingLevel === 'EXPERT'
                  ? 'bg-[#FEF9E7] border-2 border-[#B45309] ring-2 ring-[#B45309]/15'
                  : 'bg-white border-[#E5EAF0] hover:border-[#CBD5E1] hover:bg-[#F7F8FA]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#FEF9E7] text-[#B45309] border border-[#FDE68A] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#14213D]">Expert</div>
                <p className="text-[11px] text-[#5B667A] leading-tight">
                  Experienced engineer mastering advanced algorithms and system design.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-bold text-[#B45309] uppercase tracking-wider">
                Level 3 • Grandmaster
              </div>
              {codingLevel === 'EXPERT' && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#B45309] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Close the scrollable form fields container */}
        </div>

        {/* ── STICKY / DOCKED ACTION FOOTER (Always Visible & Accessible!) ── */}
        <div className="shrink-0 p-4 sm:p-6 pt-3.5 border-t border-[#E5EAF0] bg-[#FAFCFF] sm:bg-white rounded-b-3xl space-y-2.5 shadow-[0_-4px_20px_rgba(20,33,61,0.06)] z-10">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#A6F4C5] text-[#027A48] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0" />
              <span>Academic profile saved! Opening QuizCode...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || usernameAvailable === false}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Profile Activated!</span>
              </>
            ) : (
              <>
                <span>Save &amp; Continue to QuizCode</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {!isStandalonePage && (
            <button
              type="button"
              onClick={() => {
                if (onCompleted) onCompleted();
              }}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-[#5B667A] hover:text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] transition-colors text-center cursor-pointer border border-[#E5EAF0]"
            >
              Skip for now and browse QuizCode →
            </button>
          )}
        </div>
      </form>
    </div>
  );

  if (isStandalonePage) {
    return formCard;
  }

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-[#14213D]/50 backdrop-blur-md animate-fade-in p-3 sm:p-6 md:p-8 flex min-h-screen items-center justify-center">
      {formCard}
    </div>
  );
}
