import { getSoloResult } from '@/app/actions/quiz';
import { QuizResultView } from '@/components/QuizResultView';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ attemptId: string }>;
}

export const metadata: Metadata = {
  title: 'Assessment Results | QuizCode',
  description: 'Detailed assessment evaluation, performance metrics, and solution breakdown.',
};

export default async function ResultPage({ params }: Props) {
  const { attemptId } = await params;
  const result = await getSoloResult(attemptId);

  if (!result) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-24 text-center select-none">
        <div className="p-8 rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#14213D] font-serif-title">
              Assessment Not Found
            </h2>
            <p className="text-xs text-[#5B667A] leading-relaxed">
              This quiz attempt does not exist or may have been archived.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Courses</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center">
      <QuizResultView result={result} />
    </div>
  );
}
