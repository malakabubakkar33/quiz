import Link from 'next/link';
import { Home, BookOpen, Users, Trophy, Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center select-none bg-[#F7F8FA]">
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in bg-white border-2 border-[#E5EAF0] p-8 rounded-3xl shadow-xs">
        {/* Academic 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4 animate-spin" />
          <span>Error 404 • Page Not Found</span>
        </div>

        {/* 404 Big Numbers */}
        <h1 className="font-serif-title text-7xl sm:text-9xl font-black tracking-tight text-[#14213D] select-none">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#14213D] font-serif-title">
            Page Not Found
          </h2>
          <p className="text-sm text-[#5B667A] max-w-sm mx-auto leading-relaxed">
            The curriculum page or arena you are looking for has been moved or does not exist.
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="pt-4 grid grid-cols-2 gap-3 max-w-md mx-auto text-left">
          <Link
            href="/"
            className="p-3.5 rounded-2xl bg-[#F7F8FA] hover:bg-white border border-[#E5EAF0] hover:border-[#1769E0]/40 transition-all group flex items-center gap-3 shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] text-[#1769E0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#14213D] group-hover:text-[#1769E0] transition-colors">
                Home Arena
              </div>
              <div className="text-[10px] text-[#5B667A]">Back to start</div>
            </div>
          </Link>

          <Link
            href="/courses"
            className="p-3.5 rounded-2xl bg-[#F7F8FA] hover:bg-white border border-[#E5EAF0] hover:border-[#1769E0]/40 transition-all group flex items-center gap-3 shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] text-[#1769E0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#14213D] group-hover:text-[#1769E0] transition-colors">
                Courses
              </div>
              <div className="text-[10px] text-[#5B667A]">Tech tracks</div>
            </div>
          </Link>

          <Link
            href="/join-quiz"
            className="p-3.5 rounded-2xl bg-[#F7F8FA] hover:bg-white border border-[#E5EAF0] hover:border-[#1769E0]/40 transition-all group flex items-center gap-3 shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] text-[#1769E0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#14213D] group-hover:text-[#1769E0] transition-colors">
                Join Quiz
              </div>
              <div className="text-[10px] text-[#5B667A]">6-digit code</div>
            </div>
          </Link>

          <Link
            href="/leaderboard"
            className="p-3.5 rounded-2xl bg-[#F7F8FA] hover:bg-white border border-[#E5EAF0] hover:border-[#1769E0]/40 transition-all group flex items-center gap-3 shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FEF9E7] text-[#B45309] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#14213D] group-hover:text-[#B45309] transition-colors">
                Leaderboard
              </div>
              <div className="text-[10px] text-[#5B667A]">Global ranks</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
