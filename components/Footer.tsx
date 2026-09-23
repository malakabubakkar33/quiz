'use client';

import { Code2, Building2, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Strict rule: Render footer ONLY on the home page ('/')
  if (pathname !== '/') {
    return null;
  }

  return (
    <footer className="w-full bg-[#10233F] border-t border-[#1C365D] text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1769E0] text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">
                Quiz<span className="text-[#599BFF]">Code</span>
              </span>
              <div className="text-[11px] text-[#B8C2D1] font-medium">
                Academic Developer Education Platform
              </div>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs font-semibold text-white flex-wrap justify-center">
            <Link href="/courses" className="hover:text-[#599BFF] transition-colors">Courses</Link>
            <Link href="/challenge-vs" className="hover:text-[#599BFF] transition-colors">1v1 Duel</Link>
            <Link href="/leaderboard" className="hover:text-[#599BFF] transition-colors">Leaderboard</Link>
            <Link href="/create-quiz" className="hover:text-[#599BFF] transition-colors">Create Room</Link>
            <Link href="/join-quiz" className="hover:text-[#599BFF] transition-colors">Join Quiz</Link>
            <Link href="/profile" className="hover:text-[#599BFF] transition-colors">Profile</Link>
          </div>

          {/* Developer & Credit Badge */}
          <div className="flex flex-col items-center md:items-end gap-1.5 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-xs text-[#D1DCEB]">
              <Building2 className="w-3.5 h-3.5 text-[#599BFF]" />
              <span>QuizCode Academy</span>
              <span className="text-white/30">•</span>
              <Code2 className="w-3.5 h-3.5 text-[#A4B8D3]" />
              <span>Academic SaaS</span>
            </div>

            <p className="text-[11px] text-[#B8C2D1]">
              © 2026 QuizCode. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
