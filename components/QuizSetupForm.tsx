'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Settings2, Hash, Gauge, BookOpen, Clock, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

interface CourseInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  questionCount: number;
}

const QUESTION_COUNTS = [10, 15, 20, 25, 30, 50];
const DIFFICULTIES = [
  { value: 'ALL', label: 'All Levels', desc: 'Balanced mix of topics' },
  { value: 'EASY', label: 'Beginner', desc: 'Core syntax & basics' },
  { value: 'MEDIUM', label: 'Intermediate', desc: 'Real-world problem solving' },
  { value: 'HARD', label: 'Advanced', desc: 'Complex algorithms & edge cases' },
];

export function QuizSetupForm({ course }: { course: CourseInfo }) {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('ALL');

  const maxQuestions = course.questionCount || 50;

  const handleStart = () => {
    const params = new URLSearchParams({
      count: questionCount.toString(),
      difficulty,
    });
    router.push(`/quiz/countdown/${course.slug}?${params.toString()}`);
  };

  const estimatedMinutes = Math.max(5, Math.round(questionCount * 1.2));

  return (
    <div className="space-y-6 text-[#14213D] select-none">
      {/* ── COURSE HEADER CARD ── */}
      <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7]">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[11px]">Curriculum Track</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F7F8FA] border border-[#E5EAF0] text-[#5B667A]">
            <Clock className="w-3.5 h-3.5 text-[#1769E0]" />
            <span>~{estimatedMinutes} mins session</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold text-[#14213D] font-serif-title mb-2 tracking-tight">
          {course.name}
        </h1>

        <p className="text-xs sm:text-sm text-[#5B667A] leading-relaxed max-w-2xl">
          {course.description}
        </p>

        <div className="mt-4 pt-4 border-t border-[#E5EAF0] flex items-center gap-2 text-xs font-semibold text-[#1769E0]">
          <span className="w-2 h-2 rounded-full bg-[#1769E0] animate-pulse" />
          <span>{maxQuestions}+ questions verified in curriculum bank</span>
        </div>
      </div>

      {/* ── CONFIGURATION BOX ── */}
      <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 space-y-7 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center text-[#1769E0]">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#14213D] tracking-tight">
                Quiz Customization
              </h2>
              <p className="text-xs text-[#5B667A]">
                Select number of questions and preferred challenge difficulty.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Question Count Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14213D]">
              <Hash className="w-4 h-4 text-[#1769E0]" />
              <span>Number of Questions</span>
            </label>
            <span className="text-xs font-bold text-[#1769E0]">
              {questionCount} Questions
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {QUESTION_COUNTS.map((count) => {
              const isSelected = questionCount === count;
              const isDisabled = count > maxQuestions;
              return (
                <button
                  key={count}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setQuestionCount(count)}
                  className={`py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#1769E0] shadow-xs'
                      : isDisabled
                      ? 'bg-[#F7F8FA] text-[#CBD5E1] border border-[#E5EAF0] cursor-not-allowed'
                      : 'bg-white text-[#5B667A] border border-[#E5EAF0] hover:border-[#1769E0] hover:text-[#14213D] hover:bg-[#F7F8FA]'
                  }`}
                >
                  {count} Qs
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Difficulty Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14213D]">
              <Gauge className="w-4 h-4 text-[#1769E0]" />
              <span>Target Difficulty</span>
            </label>
            <span className="text-xs font-semibold text-[#5B667A]">
              Adjust question complexity
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {DIFFICULTIES.map((diff) => {
              const isSelected = difficulty === diff.value;
              return (
                <button
                  key={diff.value}
                  type="button"
                  onClick={() => setDifficulty(diff.value)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#EBF3FC] border-2 border-[#1769E0] text-[#14213D]'
                      : 'bg-white border-[#E5EAF0] text-[#5B667A] hover:border-[#CBD5E1] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#14213D]">
                      {diff.label}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#1769E0] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-[#5B667A] leading-tight">
                    {diff.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── START ACTION DOCK ── */}
      <button
        type="button"
        onClick={handleStart}
        className="w-full py-4 px-6 rounded-2xl text-sm sm:text-base font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20 flex items-center justify-center gap-3 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Begin Practice Session ({questionCount} Questions)</span>
      </button>
    </div>
  );
}
