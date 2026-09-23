'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { QuizResultReview } from '@/app/actions/quiz';
import { playVictory } from '@/lib/sound';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  BookOpen,
  Zap,
  Award,
  Code,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export function QuizResultView({ result }: { result: QuizResultReview }) {
  const [copied, setCopied] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'INCORRECT' | 'CORRECT'>('ALL');
  const [displayScore, setDisplayScore] = useState(0);

  const {
    score,
    totalQuestions,
    correctCount,
    incorrectCount,
    timeTakenSec,
    courseName,
    courseSlug,
    questions,
  } = result;

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassing = score >= 70;
  const isPerfect = score === 100;

  // Grade determination
  const getGrade = (s: number) => {
    if (s >= 95) return { letter: 'A+', color: 'text-[#0F8A52]', bg: 'bg-[#E8F8F0]', border: 'border-[#C2F0D8]' };
    if (s >= 90) return { letter: 'A', color: 'text-[#0F8A52]', bg: 'bg-[#E8F8F0]', border: 'border-[#C2F0D8]' };
    if (s >= 80) return { letter: 'B', color: 'text-[#1769E0]', bg: 'bg-[#EBF3FC]', border: 'border-[#C8DEF7]' };
    if (s >= 70) return { letter: 'C', color: 'text-[#B45309]', bg: 'bg-[#FEF9E7]', border: 'border-[#FDE68A]' };
    if (s >= 60) return { letter: 'D', color: 'text-[#B45309]', bg: 'bg-[#FEF9E7]', border: 'border-[#FDE68A]' };
    return { letter: 'F', color: 'text-[#D92D20]', bg: 'bg-[#FDF2F2]', border: 'border-[#FECDCA]' };
  };

  const grade = getGrade(score);

  // Animated Count-Up Score
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(ease * score));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [score]);

  // Performance message
  const performanceMessage = isPerfect
    ? 'Outstanding mastery! You answered every question flawlessly with full technical precision.'
    : score >= 90
    ? 'Exceptional performance! Near-flawless conceptual understanding across the curriculum.'
    : score >= 80
    ? 'Solid work! You demonstrated strong competency and grasp of core technical principles.'
    : score >= 70
    ? 'Passed! You met the passing benchmark. Review the explanations below to refine tricky areas.'
    : score >= 50
    ? 'Keep practicing! Review the solutions below and retake the test to boost your score.'
    : 'Comprehensive review recommended. Explore the detailed breakdowns below before retesting.';

  const avgSecPerQ =
    totalQuestions > 0 && timeTakenSec > 0 ? (timeTakenSec / totalQuestions).toFixed(1) : '0';

  const speedRating =
    Number(avgSecPerQ) < 12
      ? { text: 'Lightning Pace', color: 'text-[#0F8A52] bg-[#E8F8F0] border-[#C2F0D8]' }
      : Number(avgSecPerQ) < 25
      ? { text: 'Optimal Solver', color: 'text-[#1769E0] bg-[#EBF3FC] border-[#C8DEF7]' }
      : { text: 'Deliberate & Steady', color: 'text-[#B45309] bg-[#FEF9E7] border-[#FDE68A]' };

  // Confetti celebration
  useEffect(() => {
    if (isPassing) {
      playVictory();
      const end = Date.now() + 1.6 * 1000;
      const colors = ['#1769E0', '#0F8A52', '#B45309', '#6366F1'];
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [isPassing]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const text = `I just scored ${score}% (${grade.letter}) on the ${courseName} assessment on QuizCode! 🚀 ${window.location.href}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const filteredQuestions = (questions || []).filter((q) => {
    if (filterMode === 'CORRECT') return q.isCorrect;
    if (filterMode === 'INCORRECT') return !q.isCorrect;
    return true;
  });

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (circumference * displayScore) / 100;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 text-[#14213D] select-none">
      {/* ── BREADCRUMB & CONTEXT ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5B667A]">
        <div className="flex items-center gap-2">
          <Link href="/courses" className="hover:text-[#1769E0] transition-colors font-medium">
            Courses
          </Link>
          <span>/</span>
          <span className="text-[#14213D] font-bold">{courseName}</span>
          <span>/</span>
          <span className="text-[#1769E0] font-bold">Assessment Scorecard</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5EAF0] text-[11px] font-bold shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F8A52]" />
          <span>Verified Academic Assessment</span>
        </div>
      </div>

      {/* ── MAIN EXECUTIVE SCORECARD ── */}
      <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-10 shadow-xs space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5EAF0]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1769E0] uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Official Assessment Results</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14213D] font-serif-title tracking-tight">
              {courseName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isPassing
                  ? 'bg-[#E8F8F0] text-[#0F8A52] border-[#C2F0D8]'
                  : 'bg-[#FDF2F2] text-[#D92D20] border-[#FECDCA]'
              }`}
            >
              {isPassing ? <Trophy className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{isPassing ? 'Assessment Passed' : 'Needs Practice'}</span>
            </span>

            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-black border font-mono ${grade.bg} ${grade.color} ${grade.border}`}
            >
              Grade {grade.letter}
            </span>
          </div>
        </div>

        {/* Score & Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Circular Animated Dial */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-[#F8FAFD] border border-[#E5EAF0]">
            <div className="relative w-48 h-48 sm:w-52 sm:h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="7"
                />
                {/* Progress */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={isPassing ? '#0F8A52' : '#D92D20'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-5xl sm:text-6xl font-black font-sans tracking-tight ${
                    isPassing ? 'text-[#0F8A52]' : 'text-[#D92D20]'
                  }`}
                >
                  {displayScore}%
                </span>
                <span className="text-xs font-bold text-[#5B667A] mt-1 uppercase tracking-wider">
                  Overall Score
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5B667A] mt-4 leading-relaxed max-w-xs font-medium">
              {performanceMessage}
            </p>
          </div>

          {/* Right: 4 Executive Metric Tiles */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              {/* Correct Answers */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-2xs hover:border-[#C2F0D8] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5B667A]">
                    Correct
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#E8F8F0] border border-[#C2F0D8] text-[#0F8A52] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#14213D]">
                  {correctCount}{' '}
                  <span className="text-xs font-normal text-[#5B667A]">/ {totalQuestions}</span>
                </div>
                <div className="text-[11px] text-[#0F8A52] font-semibold mt-1 flex items-center gap-1">
                  <span>{accuracy}% accuracy rate</span>
                </div>
              </div>

              {/* Missed Questions */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-2xs hover:border-[#FECDCA] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5B667A]">
                    Incorrect
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] flex items-center justify-center">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#14213D]">
                  {incorrectCount}
                </div>
                <div className="text-[11px] text-[#D92D20] font-semibold mt-1">
                  <span>{100 - accuracy}% missed</span>
                </div>
              </div>

              {/* Time Spent */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-2xs hover:border-[#C8DEF7] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5B667A]">
                    Duration
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#14213D]">
                  {formatTime(timeTakenSec)}
                </div>
                <div className="text-[11px] text-[#1769E0] font-semibold mt-1">
                  <span>Total test time</span>
                </div>
              </div>

              {/* Average Pace */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] shadow-2xs hover:border-[#FDE68A] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5B667A]">
                    Pace
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#FEF9E7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#14213D]">
                  {avgSecPerQ}s{' '}
                  <span className="text-xs font-normal text-[#5B667A]">/ Q</span>
                </div>
                <div className="text-[11px] text-[#B45309] font-semibold mt-1 truncate">
                  <span>{speedRating.text}</span>
                </div>
              </div>
            </div>

            {/* Proficiency Progress Bar */}
            <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#E5EAF0] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#14213D]">Curriculum Benchmark Standard</span>
                <span className={isPassing ? 'text-[#0F8A52]' : 'text-[#D92D20]'}>
                  {score}% / 70% Required
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isPassing ? 'bg-[#0F8A52]' : 'bg-[#D92D20]'
                  }`}
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
                {/* 70% passing marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#14213D]/40"
                  style={{ left: '70%' }}
                  title="Passing threshold (70%)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="pt-6 border-t border-[#E5EAF0] flex flex-wrap items-center justify-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/quiz/setup/${courseSlug}`}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-xs flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </Link>

            <Link
              href="/courses"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#14213D] hover:bg-[#F7F8FA] bg-white border border-[#E5EAF0] transition-colors flex items-center gap-2 shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-[#1769E0]" />
              <span>Explore Courses</span>
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#14213D] hover:bg-[#F7F8FA] bg-white border border-[#E5EAF0] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#0F8A52]" />
                  <span className="text-[#0F8A52]">Scorecard Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#1769E0]" />
                  <span>Share Scorecard</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAnswers(!showAnswers)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#1769E0] hover:bg-[#EBF3FC] transition-colors cursor-pointer"
          >
            <span>{showAnswers ? 'Hide Solutions Review' : 'Show Solutions Review'}</span>
            {showAnswers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── SOLUTIONS & ANSWERS REVIEW BREAKDOWN ── */}
      {showAnswers && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#14213D] font-serif-title tracking-tight">
                Solutions &amp; Explanations Review
              </h2>
              <p className="text-xs text-[#5B667A]">
                Carefully review every question, test options, and step-by-step explanations.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E5EAF0] shadow-2xs self-start sm:self-auto">
              {(['ALL', 'INCORRECT', 'CORRECT'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterMode === mode
                      ? mode === 'INCORRECT'
                        ? 'bg-[#FDF2F2] text-[#D92D20] border border-[#FECDCA]'
                        : mode === 'CORRECT'
                        ? 'bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8]'
                        : 'bg-[#1769E0] text-white shadow-xs'
                      : 'text-[#5B667A] hover:text-[#14213D]'
                  }`}
                >
                  {mode === 'ALL'
                    ? `All (${questions.length})`
                    : mode === 'INCORRECT'
                    ? `Incorrect (${incorrectCount})`
                    : `Correct (${correctCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className={`rounded-3xl border-2 p-5 sm:p-7 bg-white shadow-xs space-y-4 ${
                  q.isCorrect ? 'border-[#C2F0D8]' : 'border-[#FECDCA]'
                }`}
              >
                {/* Question Header Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                        q.isCorrect
                          ? 'bg-[#E8F8F0] text-[#0F8A52] border border-[#C2F0D8]'
                          : 'bg-[#FDF2F2] text-[#D92D20] border border-[#FECDCA]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {q.topic && (
                      <span className="text-[11px] font-bold text-[#1769E0] bg-[#EBF3FC] px-2.5 py-0.5 rounded-full border border-[#C8DEF7]">
                        {q.topic}
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                      q.isCorrect
                        ? 'text-[#0F8A52] bg-[#E8F8F0] border-[#C2F0D8]'
                        : 'text-[#D92D20] bg-[#FDF2F2] border-[#FECDCA]'
                    }`}
                  >
                    {q.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Missed
                      </>
                    )}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-bold text-[#14213D] leading-snug">
                  {q.question}
                </h3>

                {/* Optional Code Snippet */}
                {q.codeSnippet && (
                  <div className="rounded-2xl overflow-hidden border border-[#1E3A66] bg-[#0C1B33] text-[#F8FAFC]">
                    <div className="flex items-center px-4 py-2 border-b border-[#1E3A66] bg-[#071324] text-xs text-[#93C5FD] font-mono">
                      <Code className="w-3.5 h-3.5 text-[#60A5FA] mr-1.5" />
                      Code Context
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-[#F1F5F9] leading-relaxed">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {q.options.map((optText, optIdx) => {
                    const isUserChoice = q.selectedOption === optIdx;
                    const isCorrectAnswer = q.correctAnswer === optIdx;
                    const optionLetter = String.fromCharCode(65 + optIdx);

                    let rowStyle = 'bg-[#F8FAFD] border-[#E5EAF0] text-[#5B667A]';
                    let badge = null;

                    if (isCorrectAnswer) {
                      rowStyle =
                        'bg-[#E8F8F0] border-[#0F8A52] text-[#027A48] font-semibold ring-1 ring-[#0F8A52]/20';
                      badge = (
                        <span className="text-[11px] font-bold uppercase text-[#0F8A52] bg-[#C2F0D8] px-2.5 py-0.5 rounded-md ml-auto shrink-0">
                          Correct Answer
                        </span>
                      );
                    } else if (isUserChoice && !q.isCorrect) {
                      rowStyle =
                        'bg-[#FDF2F2] border-[#D92D20] text-[#B42318] font-semibold ring-1 ring-[#D92D20]/20';
                      badge = (
                        <span className="text-[11px] font-bold uppercase text-[#D92D20] bg-[#FECDCA] px-2.5 py-0.5 rounded-md ml-auto shrink-0">
                          Your Choice
                        </span>
                      );
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm transition-colors ${rowStyle}`}
                      >
                        <span className="w-7 h-7 rounded-xl bg-white border border-[#E5EAF0] flex items-center justify-center font-bold text-xs font-mono shrink-0 text-[#14213D] shadow-2xs">
                          {optionLetter}
                        </span>
                        <span className="flex-1 leading-snug">{optText}</span>
                        {badge}
                      </div>
                    );
                  })}
                </div>

                {/* Solution Explanation Box */}
                {q.explanation && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFD] border border-[#E5EAF0] text-xs sm:text-sm text-[#5B667A] leading-relaxed space-y-1">
                    <div className="font-bold text-[#14213D] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#1769E0]" />
                      <span>Academic Solution Explanation:</span>
                    </div>
                    <p className="whitespace-pre-line text-[#5B667A]">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
