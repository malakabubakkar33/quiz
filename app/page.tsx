import Link from 'next/link';
import {
  FileText,
  Users,
  Swords,
  ArrowRight,
  Sparkles,
  Star,
  CheckCircle2,
  SlidersHorizontal,
  Play,
  BarChart3,
  Code2,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { RoomCodeInput } from '@/components/RoomCodeInput';
import { HeroBackground } from '@/components/HeroBackground';
import { CourseTechIcon } from '@/components/CourseTechIcon';
import { Footer } from '@/components/Footer';
import { getCourses, getPlatformStats, getUserDashboardStats } from '@/app/actions/quiz';

export default async function HomePage() {
  const [courses, stats, userStats] = await Promise.all([
    getCourses().catch(() => []),
    getPlatformStats(),
    getUserDashboardStats().catch(() => null),
  ]);

  const recentAttempts = userStats?.recentAttempts || [];
  const displayCourses = courses.slice(0, 10);

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden relative bg-page bg-[#F7F8FA] text-navy-primary text-[#14213D] font-academic min-h-screen">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH SEAMLESS ACADEMIC DESK WORKSPACE BACKDROP            */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24 bg-page bg-[#F7F8FA]">
        {/* Layered Academic Workspace Visual + #F7F8FA Light Linear Gradient */}
        <HeroBackground />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl lg:max-w-3xl space-y-6 text-left">
            
            {/* Eyebrow Academic Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white bg-card-white border border-[#E5EAF0] border-card text-blue-primary text-[#1769E0] text-xs font-bold tracking-wide shadow-xs">
              <GraduationCap className="w-4 h-4 text-blue-primary text-[#1769E0]" />
              <span className="uppercase tracking-wider text-[11px] font-bold">The Academic Coding Quiz Platform</span>
            </div>

            {/* Main Headline (Sophisticated Serif Display Typography) */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-navy-primary text-[#14213D] leading-[1.08] font-serif-title">
              Code Fast.<br />
              <span className="text-blue-primary text-[#1769E0]">
                Challenge Friends.
              </span><br />
              Master Quizzes.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-secondary text-[#5B667A] leading-relaxed max-w-xl font-medium">
              Sharpen your coding skills with interactive quizzes, compete with friends in real-time, and track your progress — all in one place.
            </p>

            {/* Feature Highlights (4 Clean Academic SaaS Highlights - Dark Blue & White) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-xl pt-1">
              {/* Highlight 1 */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white bg-card-white border border-[#E5EAF0] border-card shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#10233F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-navy-primary text-[#14213D] leading-tight">Interactive Quizzes</div>
                  <div className="text-[11px] text-slate-secondary text-[#5B667A] mt-0.5 font-medium">Learn by doing</div>
                </div>
              </div>

              {/* Highlight 2 */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white bg-card-white border border-[#E5EAF0] border-card shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#10233F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Swords className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-navy-primary text-[#14213D] leading-tight">Real-time Competition</div>
                  <div className="text-[11px] text-slate-secondary text-[#5B667A] mt-0.5 font-medium">Challenge your friends</div>
                </div>
              </div>

              {/* Highlight 3 */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white bg-card-white border border-[#E5EAF0] border-card shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#10233F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-navy-primary text-[#14213D] leading-tight">Track Progress</div>
                  <div className="text-[11px] text-slate-secondary text-[#5B667A] mt-0.5 font-medium">See your growth</div>
                </div>
              </div>

              {/* Highlight 4 */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white bg-card-white border border-[#E5EAF0] border-card shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#10233F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-navy-primary text-[#14213D] leading-tight">Build Your Skills</div>
                  <div className="text-[11px] text-slate-secondary text-[#5B667A] mt-0.5 font-medium">Become a better developer</div>
                </div>
              </div>
            </div>

            {/* Quick CTAs in Hero */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#quiz-modes"
                className="px-5 py-2.5 rounded-xl bg-[#1769E0] hover:bg-[#1257BD] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:shadow"
              >
                <span>Explore Quiz Modes</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/courses"
                className="px-5 py-2.5 rounded-xl bg-white bg-card-white border border-[#E5EAF0] border-card hover:border-[#1769E0] text-navy-primary text-[#14213D] text-xs sm:text-sm font-bold shadow-xs transition-all"
              >
                Browse All Tracks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CENTERED SEARCH-STYLE JOIN ROOM BAR (PROMINENT, VISIBLE INPUT)         */}
      {/* ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="w-full rounded-2xl p-6 sm:p-8 bg-white bg-card-white border-2 border-[#E5EAF0] border-card shadow-lg flex flex-col items-center text-center space-y-4">
          
          {/* Eyebrow / Label Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-subtle bg-[#EBF3FC] text-blue-primary text-[#1769E0] text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HAVE AN INVITATION CODE?</span>
          </div>

          {/* Section Title & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-navy-primary text-[#14213D] font-serif-title tracking-tight">
              Join a Live Multiplayer Quiz Room
            </h2>
            <p className="text-xs sm:text-sm text-slate-secondary text-[#5B667A] max-w-md mx-auto font-medium">
              Enter your 6-digit room code below to jump directly into the live quiz session:
            </p>
          </div>

          {/* Big Centered Search/Room Code Input Bar */}
          <div className="w-full max-w-xl mx-auto pt-1">
            <RoomCodeInput size="lg" className="max-w-xl mx-auto" placeholder="Enter 6-digit room code (e.g. 849201)" />
          </div>

          {/* Micro Status Caption (Strict Dark Blue Palette) */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-secondary text-[#5B667A] font-semibold pt-1">
            <span className="w-2 h-2 rounded-full bg-[#1769E0] animate-pulse" />
            <span>Real-time room synchronization • Enter code and click Join Room</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THREE PRIMARY ACTION CARDS (DESIGNED CLEARLY WITH CLICKABLE BUTTONS)  */}
      {/* ========================================================================= */}
      <section id="quiz-modes" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 relative z-10">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-bold tracking-widest text-blue-primary text-[#1769E0] uppercase">
            — START PLAYING
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-primary text-[#14213D] tracking-tight font-serif-title">
            Choose Your Quiz Mode
          </h2>
          <p className="text-xs sm:text-sm text-slate-secondary text-[#5B667A] max-w-md mx-auto font-medium">
            Practice solo, host a live room for your community, or challenge a friend in a 1v1 battle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: SINGLE QUIZ */}
          <Link
            href="/courses"
            className="group relative rounded-2xl p-6 sm:p-7 bg-white bg-card-white border-2 border-[#E5EAF0] border-card hover:border-[#1769E0] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#10233F] text-white flex items-center justify-center group-hover:bg-[#1769E0] transition-colors shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#F0F4F8] text-[11px] font-bold text-[#14213D] group-hover:bg-[#EBF3FC] group-hover:text-[#1769E0] transition-colors">
                  Solo Practice
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-navy-primary text-[#14213D] tracking-tight group-hover:text-[#1769E0] transition-colors">
                  Single Quiz
                </h3>
                <p className="text-xs font-semibold text-slate-secondary text-[#5B667A] mt-1">
                  Take a quiz on your own terms.
                </p>
              </div>

              <p className="text-xs text-slate-secondary text-[#5B667A] leading-relaxed font-normal">
                Choose your course, topic, number of questions and difficulty level. Test your knowledge and see your results with detailed analytics.
              </p>
            </div>

            {/* Big Prominent Call-to-Action Button */}
            <div className="w-full mt-6 pt-5 border-t border-[#E5EAF0] border-card">
              <div className="w-full py-3.5 px-4 rounded-xl bg-[#1769E0] group-hover:bg-[#1257BD] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition-all">
                <span>Start Single Quiz</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* CARD 2: LIVE ROOM */}
          <Link
            href="/create-quiz"
            className="group relative rounded-2xl p-6 sm:p-7 bg-white bg-card-white border-2 border-[#E5EAF0] border-card hover:border-[#10233F] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#10233F] text-white flex items-center justify-center group-hover:bg-[#1769E0] transition-colors shadow-xs">
                  <Users className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#F0F4F8] text-[11px] font-bold text-[#14213D] group-hover:bg-[#EBF3FC] group-hover:text-[#1769E0] transition-colors">
                  Multiplayer
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-navy-primary text-[#14213D] tracking-tight group-hover:text-[#1769E0] transition-colors">
                  Live Room
                </h3>
                <p className="text-xs font-semibold text-slate-secondary text-[#5B667A] mt-1">
                  Create or join a quiz room.
                </p>
              </div>

              <p className="text-xs text-slate-secondary text-[#5B667A] leading-relaxed font-normal">
                Host a live quiz, share a 6-digit code, watch real-time leaderboards and compete with multiple players simultaneously.
              </p>
            </div>

            {/* Big Prominent Call-to-Action Button */}
            <div className="w-full mt-6 pt-5 border-t border-[#E5EAF0] border-card">
              <div className="w-full py-3.5 px-4 rounded-xl bg-[#10233F] group-hover:bg-[#1A365D] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition-all">
                <span>Create Live Room</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* CARD 3: 1v1 CHALLENGE */}
          <Link
            href="/challenge-vs"
            className="group relative rounded-2xl p-6 sm:p-7 bg-white bg-card-white border-2 border-[#E5EAF0] border-card hover:border-[#1769E0] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#10233F] text-white flex items-center justify-center group-hover:bg-[#1769E0] transition-colors shadow-xs">
                  <Swords className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#F0F4F8] text-[11px] font-bold text-[#14213D] group-hover:bg-[#EBF3FC] group-hover:text-[#1769E0] transition-colors">
                  1v1 Battle
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-navy-primary text-[#14213D] tracking-tight group-hover:text-[#1769E0] transition-colors">
                  1v1 Challenge
                </h3>
                <p className="text-xs font-semibold text-slate-secondary text-[#5B667A] mt-1">
                  Challenge your friends.
                </p>
              </div>

              <p className="text-xs text-slate-secondary text-[#5B667A] leading-relaxed font-normal">
                Search for a friend, send a challenge, accept the request and compete in a 1v1 quiz. Who will be the fastest?
              </p>
            </div>

            {/* Big Prominent Call-to-Action Button */}
            <div className="w-full mt-6 pt-5 border-t border-[#E5EAF0] border-card">
              <div className="w-full py-3.5 px-4 rounded-xl bg-[#1769E0] group-hover:bg-[#1257BD] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition-all">
                <span>Challenge a Friend (1v1)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PLATFORM STATISTICS (REAL DATABASE COUNTS - DARK BLUE & WHITE)         */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full rounded-2xl bg-white bg-card-white border-2 border-[#E5EAF0] border-card p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#E5EAF0]">
            {/* Metric 1: Active Users */}
            <div className="flex items-center gap-3.5 sm:px-4 first:pl-0">
              <div className="w-11 h-11 rounded-xl bg-[#10233F] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-navy-primary text-[#14213D] font-serif-title">{stats.activeUsers}</div>
                <div className="text-xs font-semibold text-slate-secondary text-[#5B667A]">Active Users</div>
              </div>
            </div>

            {/* Metric 2: Coding Topics */}
            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-11 h-11 rounded-xl bg-[#10233F] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-navy-primary text-[#14213D] font-serif-title">{stats.codingTopics}</div>
                <div className="text-xs font-semibold text-slate-secondary text-[#5B667A]">Coding Topics</div>
              </div>
            </div>

            {/* Metric 3: Quizzes Completed */}
            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-11 h-11 rounded-xl bg-[#1769E0] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-navy-primary text-[#14213D] font-serif-title">{stats.quizzesCompleted}</div>
                <div className="text-xs font-semibold text-slate-secondary text-[#5B667A]">Quizzes Completed</div>
              </div>
            </div>

            {/* Metric 4: User Satisfaction */}
            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-11 h-11 rounded-xl bg-[#10233F] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-navy-primary text-[#14213D] font-serif-title">{stats.satisfaction}</div>
                <div className="text-xs font-semibold text-slate-secondary text-[#5B667A]">User Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. POPULAR CODING TRACKS (AUTHENTIC TECH LOGOS & PREMIUM SAAS CARDS)      */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-bold tracking-widest text-blue-primary text-[#1769E0] uppercase">
              — CURATED QUESTION BANKS
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-navy-primary text-[#14213D] font-serif-title">
              Popular Coding Tracks
            </h3>
            <p className="text-xs sm:text-sm text-slate-secondary text-[#5B667A] font-medium max-w-xl">
              Master web development, databases, and programming fundamentals with official structured question tracks.
            </p>
          </div>
          <Link
            href="/courses"
            className="px-4 py-2 rounded-xl bg-white bg-card-white border-2 border-[#E5EAF0] border-card hover:border-[#1769E0] text-navy-primary text-[#14213D] hover:text-[#1769E0] text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>View all {courses.length} tracks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayCourses.map((c) => (
            <Link
              key={c.id}
              href={`/quiz/setup/${c.slug}`}
              className="p-5 rounded-2xl bg-white bg-card-white border-2 border-[#E5EAF0] border-card hover:border-[#1769E0] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 group flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Top Row: Official Tech Logo Box + Question Count Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#10233F] text-white flex items-center justify-center p-2.5 shadow-sm group-hover:bg-[#1769E0] transition-colors">
                    <CourseTechIcon slug={c.slug} className="w-6 h-6 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#F0F4F8] text-[11px] font-mono font-bold text-[#14213D] group-hover:bg-[#EBF3FC] group-hover:text-[#1769E0] transition-colors">
                    {c.questionCount}+ Qs
                  </span>
                </div>

                {/* Course Name & Topic count */}
                <h4 className="text-base font-bold text-navy-primary text-[#14213D] group-hover:text-[#1769E0] transition-colors truncate">
                  {c.name}
                </h4>
                <p className="text-xs text-slate-secondary text-[#5B667A] line-clamp-2 mt-1.5 font-normal leading-relaxed">
                  {c.description || 'Master core syntax, algorithmic methods, and practical patterns with live feedback.'}
                </p>

                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#F0F4F8] text-[11px] text-slate-secondary text-[#5B667A] font-medium">
                  <Code2 className="w-3.5 h-3.5 text-[#1769E0]" />
                  <span>{c.topics ? `${c.topics.length} Key Topics` : 'Core Concepts'}</span>
                  <span>•</span>
                  <span>All Levels</span>
                </div>
              </div>

              {/* Bottom Practice CTA */}
              <div className="pt-4 mt-4 border-t border-[#E5EAF0] border-card flex items-center justify-between text-xs font-bold text-[#1769E0] group-hover:text-[#1257BD]">
                <span>Start Practice</span>
                <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] text-[#1769E0] group-hover:bg-[#1769E0] group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HOW IT WORKS (GET STARTED IN 4 SIMPLE STEPS)                           */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-left space-y-2 mb-8">
          <div className="text-xs font-bold tracking-widest text-blue-primary text-[#1769E0] uppercase">
            — HOW IT WORKS
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-primary text-[#14213D] tracking-tight font-serif-title">
            Get Started in 4 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-secondary text-[#5B667A] max-w-lg font-medium">
            From setup to your first quiz in minutes. It&apos;s simple, fast and structured.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white bg-card-white border-2 border-[#E5EAF0] border-card shadow-xs group hover:border-[#1769E0] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#10233F] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                1
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-subtle bg-[#EBF3FC] text-blue-primary text-[#1769E0] flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-navy-primary text-[#14213D] mb-1.5">Choose Mode</h4>
            <p className="text-xs text-slate-secondary text-[#5B667A] leading-relaxed font-normal">
              Select Single Quiz, Create Room, or Challenge a friend.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white bg-card-white border-2 border-[#E5EAF0] border-card shadow-xs group hover:border-[#1769E0] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#10233F] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                2
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-subtle bg-[#EBF3FC] text-blue-primary text-[#1769E0] flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-navy-primary text-[#14213D] mb-1.5">Configure</h4>
            <p className="text-xs text-slate-secondary text-[#5B667A] leading-relaxed font-normal">
              Pick your course, topic, number of questions and difficulty level.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white bg-card-white border-2 border-[#E5EAF0] border-card shadow-xs group hover:border-[#1769E0] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#10233F] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                3
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-subtle bg-[#EBF3FC] text-blue-primary text-[#1769E0] flex items-center justify-center">
                <Play className="w-4 h-4 text-blue-primary text-[#1769E0] fill-[#1769E0]" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-navy-primary text-[#14213D] mb-1.5">Play</h4>
            <p className="text-xs text-slate-secondary text-[#5B667A] leading-relaxed font-normal">
              Answer interactive coding questions and race against the clock.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white bg-card-white border-2 border-[#E5EAF0] border-card shadow-xs group hover:border-[#1769E0] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#10233F] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                4
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-subtle bg-[#EBF3FC] text-blue-primary text-[#1769E0] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-navy-primary text-[#14213D] mb-1.5">View Results</h4>
            <p className="text-xs text-slate-secondary text-[#5B667A] leading-relaxed font-normal">
              Get detailed accuracy analytics and climb the academic leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. RECENT ACTIVITY & ATTEMPTS                                             */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="p-6 sm:p-8 rounded-2xl bg-white bg-card-white border-2 border-[#E5EAF0] border-card shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-blue-primary text-[#1769E0]" />
              <h3 className="text-base sm:text-lg font-bold text-navy-primary text-[#14213D] font-serif-title">Recent Activity &amp; Attempts</h3>
            </div>
            {recentAttempts.length > 0 && (
              <Link href="/my-quizzes" className="text-xs font-bold text-blue-primary text-[#1769E0] hover:text-[#1257BD] transition-colors">
                View full history →
              </Link>
            )}
          </div>

          {recentAttempts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAttempts.slice(0, 3).map((attempt) => {
                const percentage = attempt.totalQuestions > 0 ? Math.round((attempt.score / (attempt.totalQuestions * 10)) * 100) : 0;
                return (
                  <div
                    key={attempt.id}
                    className="p-4 rounded-xl bg-page bg-[#F7F8FA] border border-[#E5EAF0] border-card flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-primary text-[#14213D] truncate max-w-[160px]">
                        {attempt.quizName || attempt.categoryName}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-primary text-[#1769E0]">
                        {attempt.score} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-secondary text-[#5B667A] font-mono font-semibold">
                      <span>{attempt.correctCount}/{attempt.totalQuestions} Correct</span>
                      <span className="text-[#1769E0] font-bold">{percentage}%</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-secondary text-[#5B667A] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{attempt.completedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs sm:text-sm text-navy-primary text-[#14213D] font-bold">
                Your quiz attempts and duel score history will appear here.
              </p>
              <p className="text-xs text-slate-secondary text-[#5B667A] font-medium">
                Choose a track above or join a live room to start practicing!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 6. FOOTER (EXCLUSIVE TO HOME PAGE) ── */}
      <Footer />
    </div>
  );
}
