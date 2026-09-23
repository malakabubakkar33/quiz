'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ClientQuestion, submitSoloQuiz } from '@/app/actions/quiz';
import {
  playSelect,
  playVictory,
  isSoundEnabled,
  setSoundEnabled,
  playQuizBgm,
  stopQuizBgm,
} from '@/lib/sound';
import { Timer, Code, AlertTriangle, Volume2, VolumeX, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface QuizSessionProps {
  questions: ClientQuestion[];
  courseName: string;
  courseSlug: string;
  courseId?: string;
  quizName?: string;
  roomMode?: boolean;
  roomCode?: string;
  onRoomSubmit?: (
    answers: { questionId: string; selectedAnswer: number }[],
    timeSec: number
  ) => Promise<void>;
}

export function QuizSession({
  questions,
  courseName,
  courseSlug,
  quizName,
  roomMode = false,
  roomCode,
  onRoomSubmit,
}: QuizSessionProps) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);

  // Answer feedback state
  const [feedbackState, setFeedbackState] = useState<'idle' | 'showing'>('idle');
  const [selectedForFeedback, setSelectedForFeedback] = useState<number | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentIndex + (feedbackState === 'showing' ? 1 : 0)) / totalQuestions) * 100)
      : 0;

  // Initialize sound preference & start Quiz Background Music
  useEffect(() => {
    setSoundOn(isSoundEnabled());
    playQuizBgm();
    return () => {
      stopQuizBgm();
    };
  }, []);

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup feedback timer
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = useCallback(
    async (lastOptionIndex?: number) => {
      try {
        setIsSubmitting(true);
        setErrorMessage(null);
        stopQuizBgm();
        playVictory();

        const finalAnswers = { ...answers };
        if (lastOptionIndex !== undefined && currentQ) {
          finalAnswers[currentQ.id] = lastOptionIndex;
        }

        const payloadAnswers = questions.map((q) => ({
          questionId: q.id,
          selectedAnswer: finalAnswers[q.id] !== undefined ? finalAnswers[q.id] : -1,
        }));

        if (roomMode && onRoomSubmit) {
          await onRoomSubmit(payloadAnswers, secondsElapsed);
        } else {
          const res = await submitSoloQuiz({
            courseSlug,
            quizName: quizName || `${courseName} Quiz`,
            answers: payloadAnswers,
            timeTakenSec: secondsElapsed,
          });
          router.push(`/quiz/result/${res.attemptId}`);
        }
      } catch (err: unknown) {
        console.error('Quiz submission error:', err);
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to submit quiz. Please try again.'
        );
        setIsSubmitting(false);
      }
    },
    [
      answers,
      currentQ,
      questions,
      roomMode,
      onRoomSubmit,
      secondsElapsed,
      courseSlug,
      quizName,
      courseName,
      router,
    ]
  );

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (feedbackState === 'showing') return;

      playSelect();

      const autoAdvanceEnabled =
        typeof window !== 'undefined'
          ? localStorage.getItem('codequiz_auto_advance') !== 'false'
          : true;
      const instantFeedbackEnabled =
        typeof window !== 'undefined'
          ? localStorage.getItem('codequiz_instant_feedback') !== 'false'
          : true;

      setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));
      if (instantFeedbackEnabled) {
        setSelectedForFeedback(optionIndex);
        setFeedbackState('showing');
      }

      const advanceDelay = autoAdvanceEnabled ? 700 : 1500;

      feedbackTimerRef.current = setTimeout(() => {
        setFeedbackState('idle');
        setSelectedForFeedback(null);

        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          handleAutoSubmit(optionIndex);
        }
      }, advanceDelay);
    },
    [currentIndex, totalQuestions, currentQ, feedbackState, handleAutoSubmit]
  );

  const difficultyBadges: Record<string, string> = {
    EASY: 'bg-[#E8F8F0] text-[#0F8A52] border-[#C2F0D8]',
    MEDIUM: 'bg-[#FEF9E7] text-[#B45309] border-[#FDE68A]',
    HARD: 'bg-[#FDF2F2] text-[#D92D20] border-[#FECDCA]',
  };

  if (totalQuestions === 0 || !currentQ) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-24 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-[#14213D] font-serif-title">
            No Questions Available
          </h2>
          <p className="text-xs text-[#5B667A]">
            There are no questions found for this quiz session.
          </p>
          <button
            onClick={() => router.push('/courses')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-colors cursor-pointer"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-28 text-center">
        <div className="p-8 rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-xs flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#E5EAF0] border-t-[#1769E0] rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-[#14213D] font-serif-title">
            Grading your answers...
          </h2>
          <p className="text-xs text-[#5B667A]">
            Calculating your score, accuracy rating, and review breakdown.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-start max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-[#14213D] select-none">
      {/* ── TOP HUD BAR ── */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5EAF0]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FDF2F2] border border-[#E5EAF0] hover:border-[#FECDCA] text-[#5B667A] hover:text-[#D92D20] transition-all text-xs font-bold shadow-2xs cursor-pointer group shrink-0"
            title="Exit quiz session"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#5B667A] group-hover:text-[#D92D20] group-hover:-translate-x-0.5 transition-transform" />
            <span>Exit</span>
          </button>

          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1769E0] uppercase tracking-wider truncate">
              <span className="w-2 h-2 rounded-full bg-[#1769E0] animate-pulse shrink-0" />
              <span className="truncate">
                {courseName} {roomMode && roomCode && `• Room #${roomCode}`}
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-bold text-[#14213D] font-serif-title tracking-tight truncate">
              Question {currentIndex + 1}{' '}
              <span className="text-[#5B667A] text-xs font-normal">of {totalQuestions}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Audio Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              setSoundEnabled(next);
            }}
            title={soundOn ? 'Sound is ON (click to mute)' : 'Sound is OFF (click to unmute)'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F8FA] border border-[#E5EAF0] text-[#5B667A] hover:text-[#14213D] transition-all cursor-pointer text-xs font-bold shadow-2xs"
          >
            {soundOn ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#1769E0]" />
                <span className="hidden sm:inline">Audio</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#5B667A]" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>

          {/* Timer Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5EAF0] shadow-2xs">
            <Timer className="w-3.5 h-3.5 text-[#1769E0]" />
            <span className="font-mono text-xs sm:text-sm font-bold text-[#14213D]">
              {formatTime(secondsElapsed)}
            </span>
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-xs text-[#5B667A] mb-1.5 font-medium">
          <span>
            Answered: <strong className="text-[#14213D]">{answeredCount}</strong> of{' '}
            {totalQuestions}
          </span>
          <span className="font-mono font-bold text-[#1769E0]">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E5EAF0] overflow-hidden">
          <div
            className="h-full bg-[#1769E0] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── QUESTION CARD ── */}
      <div
        key={currentQ.id}
        className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-5 sm:p-8 shadow-xs relative mb-6 animate-fade-in"
      >
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {currentQ.topic && (
            <span className="px-3 py-1 text-xs font-bold bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7] rounded-full">
              {currentQ.topic}
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border rounded-full ${
              difficultyBadges[currentQ.difficulty] ||
              'bg-[#F7F8FA] text-[#5B667A] border-[#E5EAF0]'
            }`}
          >
            {currentQ.difficulty}
          </span>
        </div>

        {/* Question Text - Crystal Clear High Contrast Typography */}
        <h2 className="text-lg sm:text-2xl lg:text-[25px] font-extrabold text-[#14213D] leading-relaxed mb-6 font-sans tracking-tight">
          {currentQ.question}
        </h2>

        {/* Code Snippet Box */}
        {currentQ.codeSnippet && (
          <div className="mb-6 rounded-2xl overflow-hidden border-2 border-[#1E3A66] bg-[#0C1B33] text-[#F8FAFC] shadow-xs">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E3A66] bg-[#071324] text-xs text-[#93C5FD] font-mono font-semibold">
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Code Context</span>
              </div>
              <span className="text-[10px] text-[#64748B]">Terminal Snippet</span>
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-[#F1F5F9] leading-relaxed tracking-wide">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* 4 Options Grid - Crystal Clear & Highly Legible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
          {currentQ.options.map((option, idx) => {
            const isSelected = answers[currentQ.id] === idx;
            const optionLetter = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={feedbackState === 'showing'}
                className={`min-h-[64px] p-4 sm:p-5 rounded-2xl border-2 text-left font-semibold transition-all duration-150 cursor-pointer flex items-center gap-4 shadow-2xs group ${
                  isSelected
                    ? 'bg-[#EBF3FC] border-[#1769E0] text-[#14213D] ring-2 ring-[#1769E0]/25 shadow-xs scale-[1.01]'
                    : 'bg-white border-[#D6DFE9] text-[#14213D] hover:border-[#1769E0] hover:bg-[#F8FAFD] hover:shadow-xs'
                } ${feedbackState === 'showing' ? 'cursor-default' : ''}`}
              >
                <span
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono font-bold text-sm sm:text-base flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#1769E0] text-white shadow-xs'
                      : 'bg-[#F0F4F8] border border-[#D6DFE9] text-[#14213D] group-hover:border-[#1769E0] group-hover:bg-[#EBF3FC] group-hover:text-[#1769E0]'
                  }`}
                >
                  {optionLetter}
                </span>
                <span className="flex-1 text-sm sm:text-[15px] font-semibold text-[#14213D] leading-normal">
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] text-xs font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D92D20] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Leave Quiz Confirmation Modal */}
      <ConfirmationModal
        isOpen={showExitModal}
        variant="danger"
        title="Leave Quiz Session?"
        message="Are you sure you want to abandon this quiz test? All current answers and progress in this session will be lost."
        confirmText="Leave Quiz"
        cancelText="Resume Quiz"
        onConfirm={() => {
          stopQuizBgm();
          setShowExitModal(false);
          router.push(roomMode ? '/join-quiz' : '/courses');
        }}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
