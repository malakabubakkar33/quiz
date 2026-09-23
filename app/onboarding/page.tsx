import { getAuthUser } from '@/app/actions/auth';
import { OnboardingModal } from '@/components/OnboardingModal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Your Academic Profile | QuizCode',
  description: 'Complete your initial profile setup, link your academic institution, and choose your coding experience level.',
};

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await getAuthUser();

  const activeUser = user || {
    id: 'developer',
    userId: '',
    name: '',
    email: 'new.student@quizcode.dev',
    provider: 'local' as const,
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-[#F7F8FA]">
      <OnboardingModal user={activeUser} isStandalonePage={true} />
    </div>
  );
}
