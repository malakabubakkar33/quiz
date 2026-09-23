'use client';

import Link from 'next/link';
import {
  FileCode2,
  Palette,
  Zap,
  Atom,
  Code2,
  Terminal,
  GitBranch,
  Database,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface CourseData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  badge: string | null;
  topics: string[];
  questionCount: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  FileCode2,
  Palette,
  Zap,
  Atom,
  Code2,
  Terminal,
  GitBranch,
  Database,
};

// Curated academic theme color pairings for course icons
const COURSE_THEME_MAP: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  html: { bg: 'bg-[#FFF3EB]', text: 'text-[#E44D26]', border: 'border-[#FDD8C6]' },
  css: { bg: 'bg-[#EBF3FC]', text: 'text-[#1769E0]', border: 'border-[#C8DEF7]' },
  javascript: { bg: 'bg-[#FEF9E7]', text: 'text-[#B45309]', border: 'border-[#FDE68A]' },
  react: { bg: 'bg-[#E8F6FC]', text: 'text-[#0284C7]', border: 'border-[#BAE6FD]' },
  typescript: { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', border: 'border-[#BFDBFE]' },
  python: { bg: 'bg-[#EEF7F2]', text: 'text-[#0D9488]', border: 'border-[#99F6E4]' },
  sql: { bg: 'bg-[#F3E8FF]', text: 'text-[#7C3AED]', border: 'border-[#DDD6FE]' },
  git: { bg: 'bg-[#FDF2F2]', text: 'text-[#DC2626]', border: 'border-[#FECACA]' },
};

export function CourseCard({
  course,
  linkPrefix = '/quiz/setup',
  index = 0,
}: {
  course: CourseData;
  linkPrefix?: string;
  index?: number;
}) {
  const IconComponent = ICON_MAP[course.icon] || Code2;
  const theme =
    COURSE_THEME_MAP[course.slug.toLowerCase()] || {
      bg: 'bg-[#EBF3FC]',
      text: 'text-[#1769E0]',
      border: 'border-[#C8DEF7]',
    };

  const isCreateQuiz = linkPrefix.includes('create');
  const buttonLabel = isCreateQuiz ? 'Select Course' : 'Start Quiz';

  return (
    <div className="group flex flex-col justify-between bg-white border-2 border-[#E5EAF0] hover:border-[#1769E0] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div>
        {/* Top Header: Course Icon & Category Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text} border ${theme.border} group-hover:scale-105 transition-transform shadow-2xs`}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          {course.badge && (
            <span className="px-2.5 py-1 text-[11px] font-bold text-[#14213D] bg-[#F0F4F8] border border-[#E5EAF0] rounded-lg">
              {course.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#14213D] group-hover:text-[#1769E0] transition-colors mb-1.5 font-serif-title tracking-tight">
          {course.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#5B667A] line-clamp-2 leading-relaxed mb-4 min-h-[34px]">
          {course.description}
        </p>

        {/* Topic Pills */}
        {course.topics && course.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.topics.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] font-medium bg-[#F7F8FA] border border-[#E5EAF0] text-[#14213D] rounded-md"
              >
                {topic}
              </span>
            ))}
            {course.topics.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] font-bold text-[#1769E0] bg-[#EBF3FC] rounded-md border border-[#C8DEF7]">
                +{course.topics.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Question Count & Action Button */}
      <div className="pt-3.5 border-t border-[#E5EAF0] mt-2 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-[#14213D]">
            <HelpCircle className="w-3.5 h-3.5 text-[#1769E0]" />
            {course.questionCount} Questions
          </span>

          <span className="text-[10px] font-bold text-[#1769E0] bg-[#EBF3FC] px-2 py-0.5 rounded-md border border-[#C8DEF7]">
            Practice Track
          </span>
        </div>

        <Link
          href={`${linkPrefix}/${course.slug}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-xs cursor-pointer group-hover:shadow-sm"
        >
          <span>{buttonLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
