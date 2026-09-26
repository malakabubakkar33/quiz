import { getCourseBySlug } from '@/app/actions/quiz';
import { CreateQuizForm } from '@/components/CreateQuizForm';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CreateQuizConfigPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-24 text-center">
        <div className="p-8 rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#14213D] font-serif-title">Course Not Found</h2>
          <p className="text-xs text-[#5B667A]">
            The requested track does not exist or has no active questions.
          </p>
          <Link
            href="/create-quiz"
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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <CreateQuizForm course={course} />
    </div>
  );
}
