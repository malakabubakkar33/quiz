import { getCourses } from '@/app/actions/quiz';
import { CoursesClient } from '@/components/CoursesClient';
import { GraduationCap, Layers } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Choose Your Course | QuizCode',
  description: 'Browse interactive programming courses. Practice solo coding concepts across HTML, CSS, JavaScript, React, TypeScript, Python, SQL, and Git.',
};

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-12">
      {/* ── TOP HEADING SECTION ── */}
      <div className="mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5EAF0] text-[#1769E0] text-xs font-bold shadow-2xs mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Interactive Curriculum</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14213D] font-serif-title tracking-tight">
              Choose Your Course
            </h1>

            <p className="text-xs sm:text-sm text-[#5B667A] mt-1 max-w-2xl leading-relaxed">
              Select a programming course to start solo practice, master technical concepts, and prepare for multiplayer arena challenges.
            </p>
          </div>

          {/* Quick Counter Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5EAF0] text-xs shadow-2xs">
              <Layers className="w-4 h-4 text-[#1769E0]" />
              <span className="text-[#5B667A] font-medium">
                <strong className="text-[#14213D] font-bold">{courses.length}</strong> Available Courses
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR & COURSE CARDS ── */}
      <CoursesClient initialCourses={courses} />
    </div>
  );
}
