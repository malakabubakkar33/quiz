import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AppLayoutWrapper } from '@/components/AppLayoutWrapper';
import { Footer } from '@/components/Footer';
import { RouteProgress } from '@/components/RouteProgress';
import { NetworkStatus } from '@/components/NetworkStatus';
import { OnboardingProvider } from '@/components/OnboardingProvider';
import { ChallengeNotificationProvider } from '@/components/ChallengeNotificationProvider';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#F7F8FA',
};

export const metadata: Metadata = {
  title: 'QuizCode | Code Fast. Challenge Friends. Master Quizzes.',
  description:
    'The interactive coding quiz arena for developers. Practice concepts, host live multiplayer rooms, and compete in 1v1 duels.',
  keywords: ['coding quiz', 'developer challenge', 'multiplayer quiz room', 'javascript quiz', 'react quiz', 'python duel'],
  icons: {
    icon: [
      { url: '/graduation-cap.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/graduation-cap.svg',
    apple: '/graduation-cap.svg',
  },
};

const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_bXVzaWNhbC1jb3VnYXItOTc2OC5jbGVyay5hY2NvdW50cy5kZXYk';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased overflow-x-hidden"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;0,900;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-page text-navy-primary bg-[#F7F8FA] text-[#14213D] font-academic relative selection:bg-[#1769E0]/20 selection:text-[#1769E0] overflow-x-hidden w-full max-w-full"
        suppressHydrationWarning
      >
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          {/* Startup & Navigation Loaders */}
          <Suspense fallback={null}>
            <RouteProgress />
          </Suspense>

          {/* Live Network & Offline Monitor */}
          <NetworkStatus />

          {/* Global First-Time & Existing User Onboarding Session */}
          <OnboardingProvider />

          {/* Global 1v1 Friend Challenge Duel Notification Listener */}
          <ChallengeNotificationProvider />

          {/* Left Navigation Sidebar */}
          <Sidebar />

          {/* Dynamic Desktop Layout Wrapper with Integrated Header */}
          <AppLayoutWrapper>
            <Header />
            <main className="flex-1 flex flex-col w-full relative z-0">{children}</main>
          </AppLayoutWrapper>
        </ClerkProvider>
      </body>
    </html>
  );
}
