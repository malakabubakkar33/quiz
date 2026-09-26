'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Swords,
  Clock,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { ChallengeUserSearchResult } from '@/app/actions/challenge';

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

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponent: ChallengeUserSearchResult | null;
  courses: CourseOption[];
  onSendChallenge: (params: {
    opponentId: string;
    courseId: string;
    questionCount: number;
    timeLimitSec: number;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ChallengeModal({
  isOpen,
  onClose,
  opponent,
  courses,
  onSendChallenge,
}: ChallengeModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeLimitSec, setTimeLimitSec] = useState<number>(300);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSending, onClose]);

  if (!isOpen || !opponent) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setErrorMsg('Please select a coding battlefield.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    const res = await onSendChallenge({
      opponentId: opponent.id,
      courseId: selectedCourseId,
      questionCount,
      timeLimitSec,
    });

    setIsSending(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to send challenge.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => !isSending && onClose()}
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-2xl z-10 space-y-6 text-[#14213D] animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5EAF0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center text-[#1769E0]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#14213D] font-serif-title flex items-center gap-2">
                Challenge Friend to 1v1 Duel
              </h2>
              <p className="text-xs text-[#5B667A]">
                Configure your match rules and invite your friend to duel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA] border border-[#E5EAF0] transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Opponent Preview Card */}
        <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E5EAF0] p-0.5 shrink-0 overflow-hidden shadow-xs">
              {opponent.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={opponent.avatar}
                  alt={opponent.name || 'Opponent'}
                  className="w-full h-full object-cover rounded-[10px]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-sm text-white bg-[#10233F] rounded-[10px]">
                  {(opponent.name || opponent.username || 'U')[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-[#1769E0] uppercase tracking-wider">
                Challenging
              </div>
              <div className="text-base font-bold text-[#14213D] flex items-center gap-2">
                <span>{opponent.name || opponent.username}</span>
                {opponent.username && (
                  <span className="text-xs font-mono text-[#5B667A]">@{opponent.username}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5B667A] mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B45309]">
                  <Trophy className="w-2.5 h-2.5 text-[#B45309]" />
                  {opponent.quizzesWon ?? 0} wins
                </span>
                <span>•</span>
                <span className="text-[10px] uppercase font-mono text-[#5B667A]">
                  {opponent.codingLevel || 'Contender'}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#1769E0] animate-pulse" />
            <span>Ready</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Battlefield Course Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider flex items-center justify-between">
              <span>Select Coding Track</span>
              <span className="text-[11px] text-[#5B667A] lowercase font-normal">
                {courses.length} tracks available
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {courses.map((course) => {
                const isSelected = selectedCourseId === course.id;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                      isSelected
                        ? 'bg-[#EBF3FC] border-[#1769E0] text-[#14213D] ring-1 ring-[#1769E0]/20'
                        : 'bg-white border-[#E5EAF0] text-[#5B667A] hover:bg-[#F7F8FA] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{course.icon || '⚡'}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-[#14213D]">{course.name}</div>
                        <div className="text-[10px] text-[#5B667A]">
                          {course._count.questions} Qs
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#1769E0] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions Count & Time Limit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Questions count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1769E0]" />
                <span>Question Count</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      questionCount === cnt
                        ? 'bg-[#EBF3FC] border-[#1769E0] text-[#1769E0] shadow-xs'
                        : 'bg-[#F7F8FA] border-[#E5EAF0] text-[#5B667A] hover:text-[#14213D] hover:bg-white'
                    }`}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Time limit */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1769E0]" />
                <span>Time Limit</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 180, label: '3 Mins' },
                  { sec: 300, label: '5 Mins' },
                  { sec: 600, label: '10 Mins' },
                ].map((item) => (
                  <button
                    key={item.sec}
                    type="button"
                    onClick={() => setTimeLimitSec(item.sec)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      timeLimitSec === item.sec
                        ? 'bg-[#EBF3FC] border-[#1769E0] text-[#1769E0] shadow-xs'
                        : 'bg-[#F7F8FA] border-[#E5EAF0] text-[#5B667A] hover:text-[#14213D] hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#5B667A] hover:text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-3 rounded-xl bg-[#1769E0] hover:bg-[#1257BD] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#1769E0]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching Challenge...</span>
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4" />
                  <span>Send Challenge Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
