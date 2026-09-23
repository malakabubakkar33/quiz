import { SignUp } from '@clerk/nextjs';
import { GraduationCap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | QuizCode',
  description: 'Create your QuizCode account to compete in live rooms, solve interactive coding challenges, and level up your developer skills.',
};

interface Props {
  searchParams: Promise<{ redirect_url?: string }>;
}

export default async function SignUpPage({ searchParams }: Props) {
  const { redirect_url } = await searchParams;

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8 md:py-14 relative bg-[#F7F8FA] text-[#14213D]">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5EAF0] text-[#1769E0] text-xs font-bold shadow-xs">
          <GraduationCap className="w-4 h-4 text-[#1769E0]" />
          <span>Join the Developer Arena</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] tracking-tight font-serif-title">
          Create your QuizCode Account
        </h1>
        <p className="text-xs sm:text-sm text-[#5B667A] max-w-md mx-auto">
          Sign up with Clerk to track assessments, compete in real-time quiz battles, and climb the rankings.
        </p>
      </div>

      {/* Clerk Sign Up Component */}
      <div className="w-full max-w-md flex justify-center relative z-10">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/login"
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
