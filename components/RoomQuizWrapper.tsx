'use client';

import { useState, useEffect } from 'react';
import { ClientQuestion, submitRoomQuiz } from '@/app/actions/quiz';
import { QuizSession } from '@/components/QuizSession';
import { ActivityMonitor } from '@/components/ActivityMonitor';
import { playVictory } from '@/lib/sound';
import confetti from 'canvas-confetti';
import {
  Trophy, CheckCircle2, XCircle, Clock, LayoutDashboard, Home,
  Sparkles, Zap, Award, Target, Radio
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  roomCode: string;
  quizName: string;
  courseName: string;
  timeLimit: number;
  questions: ClientQuestion[];
}

interface ResultData {
  score: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  completionTimeSec: number;
}

export function RoomQuizWrapper({
  roomCode,
  quizName,
  courseName,
  questions,
}: Props) {
  const [result, setResult] = useState<ResultData | null>(null);

  async function handleRoomSubmit(
    answers: { questionId: string; selectedAnswer: number }[],
    timeSec: number
  ) {
    const res = await submitRoomQuiz(roomCode, answers, timeSec);
    setResult(res);
  }

  if (result) {
    return (
      <RoomQuizResult
        result={result}
        roomCode={roomCode}
        courseName={courseName}
      />
    );
  }

  return (
    <>
      <ActivityMonitor roomCode={roomCode} />
      <QuizSession
        questions={questions}
        courseName={courseName}
        courseSlug=""
        courseId=""
        quizName={quizName}
        roomMode={true}
        roomCode={roomCode}
        onRoomSubmit={handleRoomSubmit}
      />
    </>
  );
}

function RoomQuizResult({
  result,
  roomCode,
  courseName,
}: {
  result: ResultData;
  roomCode: string;
  courseName: string;
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const passed = result.score >= 60;
  const isPerfect = result.score === 100;
  const accuracy = result.totalQuestions > 0 ? Math.round((result.correctCount / result.totalQuestions) * 100) : 0;

  // Animated Count-Up Score
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(ease * result.score));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [result.score]);

  // Confetti & Audio Fanfare
  useEffect(() => {
    if (passed) {
      playVictory();
      const end = Date.now() + 1.6 * 1000;
      const colors = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b'];
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [passed]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const avgSec = result.totalQuestions > 0 && result.completionTimeSec > 0
    ? (result.completionTimeSec / result.totalQuestions).toFixed(1)
    : '0';

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (circumference * displayScore) / 100;

  const speedRating = Number(avgSec) < 12
    ? { text: 'Lightning Pace', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
    : Number(avgSec) < 25
    ? { text: 'Rapid Solver', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' }
    : { text: 'Careful & Steady', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16 animate-fade-in relative text-[#14213D]">
      <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-10 text-center shadow-sm relative overflow-hidden space-y-6">
        {/* Room & Tournament Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] text-xs font-bold shadow-2xs">
          <Radio className="w-3.5 h-3.5 text-[#1769E0] animate-pulse" />
          <span className="uppercase tracking-wider text-[11px]">ROOM #{roomCode} • {courseName}</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#14213D] font-serif-title tracking-tight">
            Assessment Submitted!
          </h1>
          <p className="text-xs sm:text-sm text-[#5B667A] mt-1">
            Your score and completion stats are live on the tournament leaderboard.
          </p>
        </div>

        {/* Animated Radial Score Circle */}
        <div className="flex items-center justify-center my-4">
          <div className="relative w-44 h-44">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#E5EAF0" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={passed ? '#1769E0' : '#D92D20'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
              <span className="font-mono text-4xl sm:text-5xl font-black text-[#14213D]">
                {displayScore}%
              </span>
              <span className="text-[10px] font-bold text-[#5B667A] uppercase tracking-wider mt-0.5">
                Final Score
              </span>
            </div>
          </div>
        </div>

        {/* Performance Tier Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs">
          {isPerfect ? (
            <span className="text-[#B45309] bg-[#FEF9E7] border border-[#FDE68A] px-3.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Perfect 100% Score! 🏆
            </span>
          ) : result.score >= 90 ? (
            <span className="text-[#0F8A52] bg-[#E8F8F0] border border-[#C2F0D8] px-3.5 py-1 rounded-full flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Tournament Champion Tier
            </span>
          ) : result.score >= 75 ? (
            <span className="text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7] px-3.5 py-1 rounded-full flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Gold Contender Tier
            </span>
          ) : passed ? (
            <span className="text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7] px-3.5 py-1 rounded-full flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Silver Challenger Tier
            </span>
          ) : (
            <span className="text-[#D92D20] bg-[#FDF2F2] border border-[#FECDCA] px-3.5 py-1 rounded-full flex items-center gap-1.5">
              Keep Practicing! Review answers to level up
            </span>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[#0F8A52] text-xs font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
            </div>
            <div className="text-xl font-bold text-[#14213D]">{result.correctCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[#D92D20] text-xs font-bold mb-1">
              <XCircle className="w-3.5 h-3.5" /> Incorrect
            </div>
            <div className="text-xl font-bold text-[#14213D]">{result.incorrectCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[#1769E0] text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5" /> Time
            </div>
            <div className="text-xl font-bold text-[#14213D]">{formatTime(result.completionTimeSec)}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[#1769E0] text-xs font-bold mb-1">
              <Target className="w-3.5 h-3.5" /> Accuracy
            </div>
            <div className="text-xl font-bold text-[#14213D]">{accuracy}%</div>
          </div>
        </div>

        {/* Speed Analytics Ribbon */}
        <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#5B667A] font-semibold">
            <Zap className="w-4 h-4 text-[#B45309]" />
            <span>Average Speed:</span>
            <strong className="text-[#14213D]">~{avgSec}s / question</strong>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[11px] ${speedRating.color}`}>
            {speedRating.text}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/room/${roomCode}/dashboard`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>View Live Leaderboard</span>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-colors"
          >
            <Home className="w-4 h-4 text-[#5B667A]" />
            <span>Back Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
