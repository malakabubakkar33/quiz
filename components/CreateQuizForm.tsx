'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createQuizRoom } from '@/app/actions/quiz';
import {
  ArrowLeft,
  PlusCircle,
  Hash,
  Clock,
  Gauge,
  FileText,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Check,
} from 'lucide-react';
import Link from 'next/link';

interface CourseInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  questionCount: number;
}

const QUESTION_COUNTS = [10, 15, 20, 25, 30, 50];
const TIME_LIMITS = [5, 10, 15, 20, 30, 45, 60];

export function CreateQuizForm({ course }: { course: CourseInfo }) {
  const router = useRouter();
  const [quizName, setQuizName] = useState(`${course.name} Room`);
  const [description, setDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(10);
  const [difficulty, setDifficulty] = useState('ALL');
  const [instructions, setInstructions] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!quizName.trim()) {
      setError('Quiz name is required');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      const result = await createQuizRoom({
        courseSlug: course.slug,
        quizName: quizName.trim(),
        description: description.trim(),
        questionCount,
        timeLimit,
        difficulty,
        instructions: instructions.trim(),
      });
      router.push(`/room/${result.roomCode}/dashboard`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz room');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 text-[#14213D] select-none">
      {/* ── COURSE HEADER CARD ── */}
      <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 text-[#1769E0] text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Host Multiplayer Room</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title mb-2 tracking-tight">
          {course.name}
        </h1>
        <p className="text-xs sm:text-sm text-[#5B667A] leading-relaxed max-w-xl">
          {course.description}
        </p>
      </div>

      {/* ── ROOM CONFIGURATION FORM ── */}
      <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Quiz Name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14213D]">
            <FileText className="w-3.5 h-3.5 text-[#1769E0]" />
            <span>Room / Quiz Name</span>
          </label>
          <input
            type="text"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            placeholder="e.g. JavaScript Midterm Arena"
            className="w-full bg-[#F7F8FA] border border-[#E5EAF0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#14213D] placeholder-[#94A3B8] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#14213D] block">
            Room Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief overview or room purpose..."
            className="w-full bg-[#F7F8FA] border border-[#E5EAF0] rounded-xl px-4 py-2.5 text-sm font-medium text-[#14213D] placeholder-[#94A3B8] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all resize-none shadow-2xs"
          />
        </div>

        {/* Question Count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14213D]">
              <Hash className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>Questions Count</span>
            </label>
            <span className="text-xs font-bold text-[#1769E0]">{questionCount} Qs</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {QUESTION_COUNTS.map((count) => {
              const isSelected = questionCount === count;
              const isDisabled = count > course.questionCount;
              return (
                <button
                  key={count}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setQuestionCount(count)}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                      : isDisabled
                      ? 'bg-[#F7F8FA] text-[#CBD5E1] border border-[#E5EAF0] cursor-not-allowed'
                      : 'bg-white text-[#5B667A] border border-[#E5EAF0] hover:border-[#1769E0] hover:text-[#14213D]'
                  }`}
                >
                  {count} Qs
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14213D]">
              <Clock className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>Time Limit</span>
            </label>
            <span className="text-xs font-bold text-[#1769E0]">{timeLimit} Minutes</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {TIME_LIMITS.map((t) => {
              const isSelected = timeLimit === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeLimit(t)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                      : 'bg-white text-[#5B667A] border border-[#E5EAF0] hover:border-[#1769E0] hover:text-[#14213D]'
                  }`}
                >
                  {t}m
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14213D]">
            <Gauge className="w-3.5 h-3.5 text-[#1769E0]" />
            <span>Target Difficulty</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { val: 'ALL', label: 'All Levels' },
              { val: 'EASY', label: 'Beginner' },
              { val: 'MEDIUM', label: 'Intermediate' },
              { val: 'HARD', label: 'Advanced' },
            ].map((d) => {
              const isSelected = difficulty === d.val;
              return (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => setDifficulty(d.val)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0]'
                      : 'bg-white text-[#5B667A] border border-[#E5EAF0] hover:border-[#1769E0] hover:text-[#14213D]'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#14213D] block">
            Instructions for Participants (optional)
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder="Special instructions or rules for participating coders..."
            className="w-full bg-[#F7F8FA] border border-[#E5EAF0] rounded-xl px-4 py-2.5 text-sm font-medium text-[#14213D] placeholder-[#94A3B8] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all resize-none shadow-2xs"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D92D20] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Create Button */}
      <button
        type="button"
        onClick={handleCreate}
        disabled={isCreating}
        className="w-full py-4 rounded-2xl text-sm sm:text-base font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] disabled:opacity-50 transition-all shadow-md shadow-[#1769E0]/20 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isCreating ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating 8-Digit Room Code...
          </span>
        ) : (
          <>
            <PlusCircle className="w-4 h-4" />
            <span>Generate Room &amp; Open Arena Dashboard</span>
          </>
        )}
      </button>
    </div>
  );
}
