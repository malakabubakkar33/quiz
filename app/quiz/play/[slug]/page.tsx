import { getSoloQuestions } from '@/app/actions/quiz';
import { QuizSession } from '@/components/QuizSession';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ count?: string; difficulty?: string }>;
}

export const metadata: Metadata = {
  title: 'Quiz | CodeQuiz',
};

export default async function QuizPlayPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const count = parseInt(sp.count || '10', 10);
  const difficulty = sp.difficulty || 'ALL';

  let data = null;
  let loadFailed = false;

  try {
    data = await getSoloQuestions(slug, count, difficulty);
  } catch (error) {
    console.error(`Error loading quiz for slug "${slug}":`, error);
    loadFailed = true;
  }

  if (loadFailed || !data) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-24 text-center">
        <div className="p-8 rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#14213D] font-serif-title">Quiz Not Available</h2>
          <p className="text-xs text-[#5B667A]">
            Couldn&apos;t load questions for &ldquo;{slug}&rdquo;. The course may not have enough questions for your selected count.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center">
      <QuizSession
        questions={data.questions}
        courseName={data.courseName}
        courseSlug={data.courseSlug}
        courseId={data.courseId}
        quizName={`${data.courseName} Quiz`}
      />
    </div>
  );
}
