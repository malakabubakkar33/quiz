import { SignIn } from '@clerk/nextjs';
import { GraduationCap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | QuizCode',
  description: 'Sign in to QuizCode to join multiplayer quiz rooms and track your developer progress.',
};

interface Props {
  searchParams: Promise<{ redirect_url?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { redirect_url } = await searchParams;

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8 md:py-14 relative bg-[#F7F8FA] text-[#14213D]">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5EAF0] text-[#1769E0] text-xs font-bold shadow-xs">
          <GraduationCap className="w-4 h-4 text-[#1769E0]" />
          <span>The Academic Coding Quiz Platform</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] tracking-tight font-serif-title">
          Welcome to QuizCode
        </h1>
        <p className="text-xs sm:text-sm text-[#5B667A] max-w-md mx-auto">
          Sign in with Clerk to access multiplayer rooms, solo quizzes, and live rankings.
        </p>
      </div>

      {/* Clerk Sign In Component */}
      <div className="w-full max-w-md flex justify-center relative z-10">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/sign-up"
          fallbackRedirectUrl={redirect_url || '/'}
          appearance={{
            elements: {
              card: 'shadow-lg border-2 border-[#E5EAF0] rounded-2xl bg-white',
              headerTitle: 'text-[#14213D] font-bold text-xl',
              headerSubtitle: 'text-[#5B667A] text-xs',
              formButtonPrimary: 'bg-[#1769E0] hover:bg-[#1257BD] text-white font-bold rounded-xl text-sm transition-all shadow-xs',
              footerActionLink: 'text-[#1769E0] hover:text-[#1257BD] font-bold',
            },
          }}
        />
      </div>
    </div>
  );
}
