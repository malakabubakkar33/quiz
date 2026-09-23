import { getUserQuizzes } from '@/app/actions/quiz';
import Link from 'next/link';
import {
  Trophy,
  Users,
  PlusCircle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Quizzes & History | QuizCode',
  description: 'View your completed solo coding quizzes, hosted multiplayer rooms, and room tournament history.',
};

export const dynamic = 'force-dynamic';

export default async function MyQuizzesPage() {
  const { createdRooms, soloAttempts, joinedRooms } = await getUserQuizzes();

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-14 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAF0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title tracking-tight">
            My Quizzes &amp; History
          </h1>
          <p className="text-xs sm:text-sm text-[#5B667A] mt-0.5">
            Track your solo assessments, hosted quiz rooms, and arena history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/create-quiz"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Quiz Room</span>
          </Link>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs text-[#14213D] bg-white hover:bg-[#F0F4F8] border border-[#E5EAF0] shadow-2xs transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#1769E0]" />
            <span>Browse Courses</span>
          </Link>
        </div>
      </div>

      {/* 1. Solo Quizzes History */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#14213D] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#1769E0]" />
            <span>Solo Quiz Attempts ({soloAttempts.length})</span>
          </h2>
        </div>

        {soloAttempts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border-2 border-[#E5EAF0] text-center text-xs text-[#5B667A] space-y-2 shadow-xs">
            <p>You haven&apos;t completed any solo quizzes yet.</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-[#1769E0] hover:text-[#1257BD] font-bold"
            >
              Take a quiz now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {soloAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] hover:border-[#1769E0] transition-all shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7] font-bold text-[11px]">
                    {attempt.courseName}
                  </span>
                  <span className="text-[#5B667A] flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    {attempt.completedAt}
                  </span>
                </div>

                <h3 className="font-bold text-[#14213D] text-base truncate">
                  {attempt.quizName}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5EAF0] text-xs">
                  <div>
                    <span className="text-[#5B667A] block text-[10px] uppercase font-bold">Score</span>
                    <span className={`font-mono text-base font-bold ${
                      attempt.score >= 70 ? 'text-[#10B981]' : 'text-[#1769E0]'
                    }`}>
                      {attempt.score}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5B667A] block text-[10px] uppercase font-bold">Correct</span>
                    <span className="font-bold text-[#14213D]">
                      {attempt.correctCount} / {attempt.totalQuestions}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5B667A] block text-[10px] uppercase font-bold">Time</span>
                    <span className="font-mono text-[#5B667A]">
                      {formatSec(attempt.timeTakenSec)}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/quiz/result/${attempt.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] text-xs font-bold text-[#1769E0] transition-colors"
                  >
                    <span>View Answers &amp; Review</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Created Quiz Rooms */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#14213D] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1769E0]" />
            <span>Created Quiz Rooms ({createdRooms.length})</span>
          </h2>
        </div>

        {createdRooms.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border-2 border-[#E5EAF0] text-center text-xs text-[#5B667A] space-y-2 shadow-xs">
            <p>You haven&apos;t hosted any quiz rooms yet.</p>
            <Link
              href="/create-quiz"
              className="inline-flex items-center gap-1.5 text-[#1769E0] hover:text-[#1257BD] font-bold"
            >
              Create your first room <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {createdRooms.map((room) => (
              <div
                key={room.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] hover:border-[#1769E0] transition-all shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7] px-2 py-0.5 rounded-lg">
                    #{room.roomCode}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    room.status === 'IN_PROGRESS'
                      ? 'bg-[#EEF7F2] text-[#0D9488] border border-[#99F6E4]'
                      : room.status === 'COMPLETED'
                      ? 'bg-[#F0F4F8] text-[#5B667A]'
                      : 'bg-[#FEF9E7] text-[#B45309] border border-[#FDE68A]'
                  }`}>
                    {room.status}
                  </span>
                </div>

                <h3 className="font-bold text-[#14213D] text-base truncate">
                  {room.quizName}
                </h3>
                <p className="text-xs text-[#5B667A]">{room.courseName}</p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5EAF0] text-xs text-[#5B667A]">
                  <span>{room.questionCount} Questions</span>
                  <span>{room.participantsCount} Joined</span>
                  <span>{room.createdAt}</span>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/room/${room.roomCode}/dashboard`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] text-xs font-bold text-[#1769E0] transition-colors"
                  >
                    <span>Open Host Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Joined Room Quizzes */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#14213D] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>Joined Multiplayer Rooms ({joinedRooms.length})</span>
        </h2>

        {joinedRooms.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border-2 border-[#E5EAF0] text-center text-xs text-[#5B667A] space-y-2 shadow-xs">
            <p>You haven&apos;t joined any multiplayer quiz rooms hosted by others.</p>
            <Link
              href="/join-quiz"
              className="inline-flex items-center gap-1.5 text-[#1769E0] hover:text-[#1257BD] font-bold"
            >
              Join a room by code <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {joinedRooms.map((joined) => (
              <div
                key={joined.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5EAF0] hover:border-[#1769E0] transition-all shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#5B667A]">
                    #{joined.roomCode}
                  </span>
                  <span className="text-[#5B667A] text-[11px]">{joined.joinedAt}</span>
                </div>

                <h3 className="font-bold text-[#14213D] text-base truncate">
                  {joined.quizName}
                </h3>
                <p className="text-xs text-[#5B667A]">{joined.courseName}</p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5EAF0] text-xs">
                  <div>
                    <span className="text-[#5B667A] block text-[10px] uppercase font-bold">Score</span>
                    <span className="font-mono text-base font-bold text-[#1769E0]">
                      {joined.score !== null ? `${joined.score}%` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5B667A] block text-[10px] uppercase font-bold">Correct</span>
                    <span className="font-bold text-[#14213D]">
                      {joined.correctAnswers !== null ? joined.correctAnswers : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5B667A] block text-[10px] uppercase font-bold">Time</span>
                    <span className="font-mono text-[#5B667A]">
                      {joined.completionTimeSec ? formatSec(joined.completionTimeSec) : '—'}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/room/${joined.roomCode}/dashboard`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] text-xs font-bold text-[#1769E0] transition-colors"
                  >
                    <span>View Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
