'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Zap,
  Bell,
  Eye,
  EyeOff,
  Sparkles,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Smartphone,
  Gauge,
  GraduationCap,
  School,
  Building2,
  Code2,
  Flame,
  User,
  Check,
  Loader2,
  AlertCircle,
  Save,
} from 'lucide-react';
import {
  isSoundEnabled,
  setSoundEnabled,
  isBgmEnabled,
  setBgmEnabled,
  isSfxEnabled,
  setSfxEnabled,
  getSoundVolume,
  setSoundVolume,
  playCorrect,
  playVictory,
} from '@/lib/sound';
import { ProfileSignOutButton } from './ProfileSignOutButton';
import { ConfirmationModal } from './ConfirmationModal';
import type { AppUser } from '@/lib/supabase/useUser';

interface AppSettingsClientProps {
  initialUser?: AppUser | any;
}

type InstitutionType = 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY';
type CodingLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export function AppSettingsClient({ initialUser }: AppSettingsClientProps) {
  // Academic Profile State
  const [profileName, setProfileName] = useState(initialUser?.name || '');
  const [profileUsername, setProfileUsername] = useState(initialUser?.username || '');
  const [profileInstType, setProfileInstType] = useState<InstitutionType>(
    (initialUser?.institutionType as InstitutionType) || 'COLLEGE'
  );
  const [profileInstName, setProfileInstName] = useState(initialUser?.institutionName || '');
  const [profileCodingLevel, setProfileCodingLevel] = useState<CodingLevel>(
    (initialUser?.codingLevel as CodingLevel) || 'BEGINNER'
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'primary';
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    confirmText: 'Confirm',
    onConfirm: () => {},
  });

  // Audio state
  const [masterSound, setMasterSoundState] = useState(true);
  const [bgm, setBgmState] = useState(true);
  const [sfx, setSfxState] = useState(true);
  const [volume, setVolumeState] = useState(70);

  // Gameplay state
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [timerPulse, setTimerPulse] = useState(true);
  const [compactHud, setCompactHud] = useState(false);

  // Notification state
  const [notifChallenges, setNotifChallenges] = useState(true);
  const [notifSound, setNotifSound] = useState(true);
  const [notifLeaderboard, setNotifLeaderboard] = useState(true);

  // Performance & Privacy state
  const [reduceMotion, setReduceMotion] = useState(false);
  const [incognito, setIncognito] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Audio
    setMasterSoundState(isSoundEnabled());
    setBgmState(isBgmEnabled());
    setSfxState(isSfxEnabled());
    setVolumeState(Math.round(getSoundVolume() * 100));

    // Gameplay
    setAutoAdvance(localStorage.getItem('codequiz_auto_advance') !== 'false');
    setInstantFeedback(localStorage.getItem('codequiz_instant_feedback') !== 'false');
    setTimerPulse(localStorage.getItem('codequiz_timer_pulse') !== 'false');
    setCompactHud(localStorage.getItem('codequiz_compact_hud') === 'true');

    // Notifications
    setNotifChallenges(localStorage.getItem('codequiz_notif_challenges') !== 'false');
    setNotifSound(localStorage.getItem('codequiz_notif_sound') !== 'false');
    setNotifLeaderboard(localStorage.getItem('codequiz_notif_leaderboard') !== 'false');

    // Display
    setReduceMotion(localStorage.getItem('codequiz_reduce_motion') === 'true');
    setIncognito(localStorage.getItem('codequiz_incognito') === 'true');
  }, []);

  // Save Academic Profile
  const handleSaveAcademicProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);

    if (!profileName.trim()) {
      setProfileError('Please enter your full name.');
      return;
    }

    if (!profileUsername.trim()) {
      setProfileError('Please enter your unique username handle.');
      return;
    }

    if (!profileInstName.trim()) {
      setProfileError(`Please enter your ${profileInstType.toLowerCase()} name.`);
      return;
    }

    setSavingProfile(true);

    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName.trim(),
          username: profileUsername.trim().toLowerCase().replace(/^@/, ''),
          institutionType: profileInstType,
          institutionName: profileInstName.trim(),
          codingLevel: profileCodingLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update academic profile.');
      }

      setProfileSaved(true);
      showToast('Academic profile updated successfully!');
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setProfileError(err?.message || 'Error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handlers for Audio
  const handleToggleMasterSound = (val: boolean) => {
    setMasterSoundState(val);
    setSoundEnabled(val);
    showToast(val ? 'Master audio enabled' : 'Master audio muted');
  };

  const handleToggleBgm = (val: boolean) => {
    setBgmState(val);
    setBgmEnabled(val);
    showToast(val ? 'Background music enabled' : 'Background music silenced');
  };

  const handleToggleSfx = (val: boolean) => {
    setSfxState(val);
    setSfxEnabled(val);
    showToast(val ? 'Synthesizer sound effects enabled' : 'Sound effects muted');
  };

  const handleVolumeChange = (val: number) => {
    setVolumeState(val);
    setSoundVolume(val / 100);
  };

  const handleTestChime = () => {
    if (!masterSound) {
      showToast('Master audio is currently muted');
      return;
    }
    playCorrect();
    setTimeout(() => playVictory(), 200);
  };

  // Handlers for Gameplay
  const handleToggleAutoAdvance = (val: boolean) => {
    setAutoAdvance(val);
    localStorage.setItem('codequiz_auto_advance', String(val));
    showToast(val ? 'Auto-advance enabled (0.8s slide)' : 'Manual question advance enabled');
  };

  const handleToggleInstantFeedback = (val: boolean) => {
    setInstantFeedback(val);
    localStorage.setItem('codequiz_instant_feedback', String(val));
    showToast(val ? 'Instant answer feedback enabled' : 'Answer feedback delayed');
  };

  const handleToggleTimerPulse = (val: boolean) => {
    setTimerPulse(val);
    localStorage.setItem('codequiz_timer_pulse', String(val));
    showToast(val ? '5-Second warning pulse active' : 'Warning pulse disabled');
  };

  const handleToggleCompactHud = (val: boolean) => {
    setCompactHud(val);
    localStorage.setItem('codequiz_compact_hud', String(val));
    showToast(val ? 'Compact mobile layout active' : 'Standard question layout restored');
  };

  // Handlers for Notifications
  const handleToggleNotifChallenges = (val: boolean) => {
    setNotifChallenges(val);
    localStorage.setItem('codequiz_notif_challenges', String(val));
    showToast(val ? '1v1 Challenge invite alerts enabled' : '1v1 Challenge invites silenced');
  };

  const handleToggleNotifSound = (val: boolean) => {
    setNotifSound(val);
    localStorage.setItem('codequiz_notif_sound', String(val));
    showToast(val ? 'Notification chime sound enabled' : 'Notification chime muted');
  };

  const handleToggleNotifLeaderboard = (val: boolean) => {
    setNotifLeaderboard(val);
    localStorage.setItem('codequiz_notif_leaderboard', String(val));
    showToast(val ? 'Leaderboard milestone notifications active' : 'Milestone notifications disabled');
  };

  // Handlers for Display & Privacy
  const handleToggleReduceMotion = (val: boolean) => {
    setReduceMotion(val);
    localStorage.setItem('codequiz_reduce_motion', String(val));
    showToast(val ? 'Reduced motion mode active' : 'Standard fluid animations restored');
  };

  const handleToggleIncognito = (val: boolean) => {
    setIncognito(val);
    localStorage.setItem('codequiz_incognito', String(val));
    showToast(val ? 'Incognito leaderboard mode active' : 'Public profile visible on leaderboard');
  };

  const handleClearLocalCache = () => {
    if (typeof window === 'undefined') return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('quiz_') || key.startsWith('draft_') || key.includes('cache'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      showToast('Local quiz cache cleared successfully!');
    } catch {
      showToast('Cache cleared.');
    }
  };

  const requestClearLocalCache = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Local Quiz Cache?',
      message: 'Are you sure you want to purge local drafts and cached quiz attempts? Your account data, MMR rating, and completed assessments are safe.',
      variant: 'danger',
      confirmText: 'Yes, Clear Cache',
      onConfirm: () => {
        handleClearLocalCache();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleResetToDefaults = () => {
    handleToggleMasterSound(true);
    handleToggleBgm(true);
    handleToggleSfx(true);
    handleVolumeChange(70);
    handleToggleAutoAdvance(true);
    handleToggleInstantFeedback(true);
    handleToggleTimerPulse(true);
    handleToggleCompactHud(false);
    handleToggleNotifChallenges(true);
    handleToggleNotifSound(true);
    handleToggleNotifLeaderboard(true);
    handleToggleReduceMotion(false);
    handleToggleIncognito(false);
    showToast('All application settings reset to factory defaults!');
  };

  const requestResetToDefaults = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Settings to Factory Defaults?',
      message: 'This will reset all audio, gameplay, animation, and notification preferences to their initial defaults. Do you want to continue?',
      variant: 'warning',
      confirmText: 'Yes, Reset Defaults',
      onConfirm: () => {
        handleResetToDefaults();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="space-y-6 text-[#14213D]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] px-4 py-3 rounded-2xl bg-white border-2 border-[#1769E0] shadow-2xl flex items-center gap-3 text-[#14213D] text-xs sm:text-sm font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#1769E0] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 0. ACADEMIC PROFILE & CAMPUS INFORMATION ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14213D]">Academic Profile &amp; Campus Details</h3>
              <p className="text-xs text-[#5B667A]">
                The information provided upon login. Update your campus, username, or skill level anytime.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveAcademicProfile} className="space-y-5">
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
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Ali Ahmed"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] text-sm font-semibold text-[#14213D] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
              />
            </div>

            {/* Username Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-[#1769E0] font-mono font-bold">@</span>
                <span>Username Handle</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[#5B667A] font-mono font-bold text-sm select-none">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={profileUsername}
                  onChange={(e) =>
                    setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  placeholder="handle"
                  maxLength={20}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] text-sm font-mono font-semibold text-[#14213D] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Academic Institution Select */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider">
                Academic Campus Level
              </label>
              <span className="text-[11px] text-[#5B667A]">School / College / University</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProfileInstType('SCHOOL')}
                className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  profileInstType === 'SCHOOL'
                    ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                    : 'bg-white border-[#E5EAF0] text-[#5B667A] hover:text-[#14213D]'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>School</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileInstType('COLLEGE')}
                className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  profileInstType === 'COLLEGE'
                    ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                    : 'bg-white border-[#E5EAF0] text-[#5B667A] hover:text-[#14213D]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>College</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileInstType('UNIVERSITY')}
                className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  profileInstType === 'UNIVERSITY'
                    ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                    : 'bg-white border-[#E5EAF0] text-[#5B667A] hover:text-[#14213D]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>University</span>
              </button>
            </div>

            <input
              type="text"
              required
              value={profileInstName}
              onChange={(e) => setProfileInstName(e.target.value)}
              placeholder="Enter your campus name..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5EAF0] text-sm font-semibold text-[#14213D] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
            />
          </div>

          {/* Coding Level Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider block">
              Coding Experience Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setProfileCodingLevel('BEGINNER')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
                  profileCodingLevel === 'BEGINNER'
                    ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                    : 'bg-[#F7F8FA] border-[#E5EAF0] text-[#5B667A] hover:bg-white hover:text-[#14213D]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Code2 className="w-4 h-4" />
                  <span>Beginner (Explorer)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProfileCodingLevel('INTERMEDIATE')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
                  profileCodingLevel === 'INTERMEDIATE'
                    ? 'bg-[#EEF2F6] border-2 border-[#14213D] text-[#14213D]'
                    : 'bg-[#F7F8FA] border-[#E5EAF0] text-[#5B667A] hover:bg-white hover:text-[#14213D]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Intermediate (Builder)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProfileCodingLevel('EXPERT')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
                  profileCodingLevel === 'EXPERT'
                    ? 'bg-[#FEF9E7] border-2 border-[#B45309] text-[#B45309]'
                    : 'bg-[#F7F8FA] border-[#E5EAF0] text-[#5B667A] hover:bg-white hover:text-[#14213D]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Flame className="w-4 h-4" />
                  <span>Expert (Master)</span>
                </div>
              </button>
            </div>
          </div>

          {profileError && (
            <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSaved && (
            <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#A6F4C5] text-[#027A48] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Academic profile updated successfully!</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Academic Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── 1. Audio & Arena Ambience Settings ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FEF9E7] text-[#B45309] border border-[#FDE68A]">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14213D]">Audio &amp; Quiz Ambience</h3>
              <p className="text-xs text-[#5B667A]">
                Control synthesizer audio, background music, and sound effects.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestChime}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#B45309] hover:text-[#92400E] bg-[#FEF9E7] hover:bg-[#FEF3C7] border border-[#FDE68A] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Test Chime</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Master Audio */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                <span>Master Sound</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    masterSound
                      ? 'bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8]'
                      : 'bg-[#E5EAF0] text-[#5B667A]'
                  }`}
                >
                  {masterSound ? 'ENABLED' : 'MUTED'}
                </span>
              </div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Global master switch for all audio playback across the entire app.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleMasterSound(!masterSound)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                masterSound ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  masterSound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Quiz Background Music */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                <Music className="w-4 h-4 text-[#1769E0]" />
                <span>Quiz Background Music (BGM)</span>
              </div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Looping focus music during solo quizzes, 1v1 duels, and live multiplayer matches.
              </div>
            </div>

            <button
              type="button"
              disabled={!masterSound}
              onClick={() => handleToggleBgm(!bgm)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-40 ${
                bgm && masterSound ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  bgm && masterSound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects SFX */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#B45309]" />
                <span>Interactive Sound Effects (SFX)</span>
              </div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Web Audio synthesizer feedback for option clicks, correct answers, and victory fanfare.
              </div>
            </div>

            <button
              type="button"
              disabled={!masterSound}
              onClick={() => handleToggleSfx(!sfx)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-40 ${
                sfx && masterSound ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  sfx && masterSound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#14213D] flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#1769E0]" />
                <span>Master Volume Level</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#1769E0]">{volume}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={volume}
              disabled={!masterSound}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="w-full accent-[#1769E0] cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>
      </div>

      {/* ── 2. Quiz Experience & Gameplay Settings ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EAF0]">
          <div className="p-2 rounded-xl bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7]">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#14213D]">Quiz Experience &amp; Auto-Advance</h3>
            <p className="text-xs text-[#5B667A]">
              Tailor answering speed, instant feedback indicators, and visual timers.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Auto Advance */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Auto-Advance on Option Selection</div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Automatically slide to next question 0.8s after clicking an answer for rapid practice.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleAutoAdvance(!autoAdvance)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                autoAdvance ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  autoAdvance ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Instant Feedback */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Instant Answer Highlight</div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Immediately illuminate selected option with correct (green) or wrong (red) indicators.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleInstantFeedback(!instantFeedback)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                instantFeedback ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  instantFeedback ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 5-Second Warning Pulse */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D]">5-Second Countdown Warning Pulse</div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Audible tick and pulse when question timer drops below 5 seconds.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleTimerPulse(!timerPulse)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                timerPulse ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  timerPulse ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Compact Mobile HUD */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#1769E0]" />
                <span>Compact Mobile HUD</span>
              </div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Minimize header padding to provide more screen space for question code snippets on phones.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleCompactHud(!compactHud)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                compactHud ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  compactHud ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Notification & Duel Alerts Settings ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EAF0]">
          <div className="p-2 rounded-xl bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#14213D]">Notifications &amp; Duel Alerts</h3>
            <p className="text-xs text-[#5B667A]">
              Configure real-time 1v1 challenge alerts and leaderboard notifications.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Challenge Popups */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D]">1v1 Friend Duel Challenge Popups</div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Display challenge invite modal when challenged by a fellow developer.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleNotifChallenges(!notifChallenges)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                notifChallenges ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  notifChallenges ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Audio Chime on Alert */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Notification Audio Chime</div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Play an audible ringtone when an opponent accepts your challenge.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleNotifSound(!notifSound)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                notifSound ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  notifSound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Leaderboard Milestones */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Leaderboard Milestone Alerts</div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Congratulatory notifications when climbing into the Top 10 International ranking.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleNotifLeaderboard(!notifLeaderboard)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                notifLeaderboard ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  notifLeaderboard ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Performance & Privacy ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EAF0]">
          <div className="p-2 rounded-xl bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#14213D]">Performance &amp; Privacy</h3>
            <p className="text-xs text-[#5B667A]">
              Optimize animations for maximum responsiveness and control leaderboard visibility.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Reduce Motion */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Reduce Motion / High-Speed Mode</div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Disable heavy background blur filters and radial particles for lightweight rendering.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleReduceMotion(!reduceMotion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                reduceMotion ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  reduceMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Incognito Leaderboard */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                {incognito ? (
                  <EyeOff className="w-4 h-4 text-[#1769E0]" />
                ) : (
                  <Eye className="w-4 h-4 text-[#5B667A]" />
                )}
                <span>Incognito Leaderboard Display</span>
              </div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Display as &quot;Anonymous Coder&quot; on public leaderboards while keeping your MMR active.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleIncognito(!incognito)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                incognito ? 'bg-[#1769E0]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  incognito ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. Storage & Session Controls ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EAF0]">
          <div className="p-2 rounded-xl bg-[#FDF2F2] text-[#D92D20] border border-[#FECDCA]">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#14213D]">Storage &amp; Session Management</h3>
            <p className="text-xs text-[#5B667A]">
              Clear temporary local storage data or reset preferences back to default.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex flex-col justify-between space-y-3">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Clear Local Quiz Cache</div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Purge saved question drafts and temporary local states while preserving your login session.
              </div>
            </div>

            <button
              type="button"
              onClick={requestClearLocalCache}
              className="px-4 py-2 bg-white hover:bg-[#FDF2F2] text-[#5B667A] hover:text-[#D92D20] border border-[#E5EAF0] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 self-start shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#D92D20]" />
              <span>Clear Cache</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] flex flex-col justify-between space-y-3">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Reset All Settings</div>
              <div className="text-xs text-[#5B667A] mt-0.5">
                Revert all audio, gameplay, and notification toggles back to original factory defaults.
              </div>
            </div>

            <button
              type="button"
              onClick={requestResetToDefaults}
              className="px-4 py-2 bg-white hover:bg-[#F0F4F8] text-[#5B667A] hover:text-[#14213D] border border-[#E5EAF0] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 self-start shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Sign Out Card */}
        <div className="pt-4 border-t border-[#E5EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-[#14213D]">Sign Out of Session</div>
            <div className="text-xs text-[#5B667A] mt-0.5">
              Securely disconnect this device from your QuizCode developer account.
            </div>
          </div>
          <ProfileSignOutButton />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        variant={confirmModal.variant}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
