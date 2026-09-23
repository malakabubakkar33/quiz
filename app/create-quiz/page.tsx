import { getCourses } from '@/app/actions/quiz';
import { CourseCard } from '@/components/CourseCard';
import { PlusCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Quiz Room | QuizCode',
  description: 'Create a multiplayer quiz room. Select a course, configure settings, and share the room code with friends.',
};

export default async function CreateQuizPage() {
  const courses = await getCourses();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-12 space-y-5">
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5EAF0] text-[#1769E0] text-xs font-bold shadow-2xs mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Host Multiplayer Arena</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14213D] font-serif-title tracking-tight">
          Select a Course to Host
        </h1>

        <p className="text-xs sm:text-sm text-[#5B667A] mt-1 max-w-xl leading-relaxed">
          Choose a technology course for your room. You will configure time limits, question counts, and receive an 8-digit invite code for your peers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} linkPrefix="/create-quiz" index={index} />
        ))}
      </div>
    </div>
  );
}
