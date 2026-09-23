'use client';

import { useState, useMemo } from 'react';
import { CourseCard } from '@/components/CourseCard';
import { Search, BookOpen, Layers, X, Sparkles } from 'lucide-react';

interface CourseItem {
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

interface Props {
  initialCourses: CourseItem[];
}

const CATEGORIES = [
  { id: 'all', label: 'All Courses' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'database', label: 'Databases' },
  { id: 'devops', label: 'DevOps & Git' },
];

export function CoursesClient({ initialCourses }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      // Category filtering
      if (selectedCategory === 'frontend') {
        if (!['html', 'css', 'javascript', 'react', 'typescript'].includes(course.slug)) {
          return false;
        }
      } else if (selectedCategory === 'backend') {
        if (!['python'].includes(course.slug)) {
          return false;
        }
      } else if (selectedCategory === 'database') {
        if (!['sql'].includes(course.slug)) {
          return false;
        }
      } else if (selectedCategory === 'devops') {
        if (!['git'].includes(course.slug)) {
          return false;
        }
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = course.name.toLowerCase().includes(query);
        const matchesDesc = course.description.toLowerCase().includes(query);
        const matchesTopics = course.topics.some((t) => t.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesTopics;
      }

      return true;
    });
  }, [initialCourses, selectedCategory, searchQuery]);

  const totalQuestions = useMemo(() => {
    return initialCourses.reduce((sum, c) => sum + (c.questionCount || 50), 0);
  }, [initialCourses]);

  return (
    <div className="space-y-6">
      {/* ── COURSE FILTRATION BAR (HEADER SHAPED) ── */}
      <div className="w-full bg-white border-2 border-[#E5EAF0] rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5B667A]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, topics (e.g. React, SQL, Flexbox)..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] text-[#14213D] text-xs sm:text-sm placeholder:text-[#5B667A] focus:outline-none focus:border-[#1769E0] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5B667A] hover:text-[#14213D] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1769E0] text-white shadow-xs'
                    : 'bg-[#F7F8FA] hover:bg-[#E5EAF0] text-[#14213D] border border-[#E5EAF0]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Total Bank Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F4F8] border border-[#E5EAF0] text-xs text-[#5B667A] font-medium shrink-0">
          <Layers className="w-3.5 h-3.5 text-[#1769E0]" />
          <span>
            Bank: <strong className="text-[#14213D] font-bold">~{totalQuestions}</strong> Qs
          </span>
        </div>
      </div>

      {/* Showing Count Status */}
      <div className="flex items-center justify-between text-xs text-[#5B667A] px-1">
        <span>
          Showing <strong className="text-[#14213D] font-bold">{filteredCourses.length}</strong> of{' '}
          <strong className="text-[#1769E0] font-bold">{initialCourses.length}</strong> available courses
        </span>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border-2 border-[#E5EAF0] bg-white shadow-xs">
          <BookOpen className="w-10 h-10 text-[#5B667A] mx-auto mb-2.5" />
          <h3 className="text-base font-bold text-[#14213D] mb-1">No matching courses found</h3>
          <p className="text-xs text-[#5B667A] mb-4">
            Try adjusting your search query or switching back to &ldquo;All Courses&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#1769E0] hover:bg-[#1257BD] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCourses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
