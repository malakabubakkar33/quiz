'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Loader2,
  Layers,
  ArrowRight,
  X,
  Sparkles,
  BookOpen,
  Hash,
  Compass,
  Play,
  Check,
} from 'lucide-react';
import {
  getCourseSearchResults,
  type CourseSearchResultItem,
  type TopicSearchResultItem,
} from '@/app/actions/quiz';
import { CourseTechIcon } from './CourseTechIcon';

const CATEGORIES = [
  { id: 'all', label: 'All Tracks' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'database', label: 'Databases' },
  { id: 'devops', label: 'DevOps & Tools' },
];

interface CourseSearchProps {
  mode?: 'all' | 'desktop' | 'mobile';
}

export function CourseSearch({ mode = 'all' }: CourseSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<CourseSearchResultItem[]>([]);
  const [topics, setTopics] = useState<TopicSearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load default suggested courses on initial modal open
  const loadInitialCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await getCourseSearchResults('');
      setCourses(results.courses);
      setTopics([]);
    } catch (err) {
      console.error('Failed to load suggested courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // When modal opens, load courses and focus input
  useEffect(() => {
    if (isOpen) {
      loadInitialCourses();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setActiveCategory('all');
      setSelectedIndex(-1);
    }
  }, [isOpen, loadInitialCourses]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen]);

  // Debounced live query search
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      loadInitialCourses();
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await getCourseSearchResults(query);
        setCourses(results.courses);
        setTopics(results.topics);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Course search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [query, isOpen, loadInitialCourses]);

  // Filter courses by category tab if selected
  const displayedCourses = useMemo(() => {
    if (activeCategory === 'all') return courses;
    return courses.filter((c) => {
      const cat = (c.category || '').toLowerCase();
      const badge = (c.badge || '').toLowerCase();
      const name = c.name.toLowerCase();
      if (activeCategory === 'frontend') {
        return cat.includes('front') || badge.includes('front') || ['html', 'css', 'javascript', 'react', 'typescript'].includes(c.slug);
      }
      if (activeCategory === 'backend') {
        return cat.includes('back') || badge.includes('back') || ['python', 'node', 'django', 'backend'].includes(c.slug);
      }
      if (activeCategory === 'database') {
        return cat.includes('data') || badge.includes('data') || ['sql', 'mongodb', 'postgresql'].includes(c.slug);
      }
      if (activeCategory === 'devops') {
        return cat.includes('devops') || badge.includes('version') || ['git', 'docker', 'linux'].includes(c.slug);
      }
      return true;
    });
  }, [courses, activeCategory]);

  const handleSelectCourse = (slug: string) => {
    setIsOpen(false);
    router.push(`/quiz/setup/${slug}`);
  };

  const handleSelectTopic = (courseSlug: string, topicName: string) => {
    setIsOpen(false);
    router.push(`/quiz/setup/${courseSlug}?topic=${encodeURIComponent(topicName)}`);
  };

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    const total = displayedCourses.length + topics.length;
    if (total === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < displayedCourses.length) {
        handleSelectCourse(displayedCourses[selectedIndex].slug);
      } else if (selectedIndex >= displayedCourses.length) {
        const topic = topics[selectedIndex - displayedCourses.length];
        if (topic) handleSelectTopic(topic.courseSlug, topic.topicName);
      } else if (displayedCourses.length > 0) {
        handleSelectCourse(displayedCourses[0].slug);
      }
    }
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP SEARCH TRIGGER (>= md)
          ───────────────────────────────────────────────────────────── */}
      {mode !== 'mobile' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="hidden md:flex items-center justify-between w-full max-w-md lg:max-w-lg px-3.5 py-2 rounded-xl bg-[#F0F4F8] hover:bg-[#FFFFFF] border border-[#E5EAF0] hover:border-[#CBD5E1] transition-all text-xs text-[#5B667A] cursor-pointer shadow-2xs group"
          aria-label="Open course search"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 text-[#5B667A] group-hover:text-[#1769E0] transition-colors" />
            <span className="truncate font-medium">Search courses, tracks, or topics...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-[#5B667A] bg-white border border-[#E5EAF0] rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE SEARCH ICON BUTTON (< md)
          ───────────────────────────────────────────────────────────── */}
      {mode !== 'desktop' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="md:hidden w-9 h-9 rounded-xl bg-[#F0F4F8] hover:bg-[#E5EAF0] border border-[#E5EAF0] text-[#1769E0] flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0"
          aria-label="Search courses and curriculum"
          title="Search courses"
        >
          <Search className="w-4 h-4 text-[#1769E0]" />
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. FULL RICH SEARCH MODAL DIALOG (DESKTOP & MOBILE)
          ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-start p-3 sm:p-6 sm:pt-14 bg-black/40 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className="relative w-full max-w-2xl rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-scale-up"
            role="dialog"
            aria-modal="true"
          >
            {/* Top Search Input Box */}
            <div className="p-4 sm:p-5 border-b border-[#E5EAF0] bg-white relative shrink-0">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-[#1769E0]">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-[#1769E0] animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-[#1769E0]" />
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search courses, curriculum tracks, or topics (e.g. React, Python, JavaScript)..."
                  className="w-full pl-11 pr-20 py-3 rounded-2xl text-sm sm:text-base font-semibold text-[#14213D] placeholder-[#94A3B8] bg-[#F7F8FA] border border-[#E5EAF0] focus:outline-none focus:border-[#1769E0] focus:ring-4 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
                />

                <div className="absolute right-3 flex items-center gap-1.5">
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        inputRef.current?.focus();
                      }}
                      className="p-1 rounded-full text-[#5B667A] hover:text-[#14213D] hover:bg-[#E5EAF0] transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl text-[#5B667A] hover:text-[#14213D] hover:bg-[#F0F4F8] transition-colors cursor-pointer"
                    title="Close search"
                  >
                    <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5EAF0] text-[#5B667A] font-bold mr-1">
                      ESC
                    </span>
                    <X className="w-4 h-4 sm:hidden" />
                  </button>
                </div>
              </div>

              {/* Category Quick Filter Chips */}
              <div className="flex items-center gap-1.5 pt-3 overflow-x-auto scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isCatActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isCatActive
                          ? 'bg-[#1769E0] text-white shadow-xs'
                          : 'bg-[#F7F8FA] hover:bg-[#E5EAF0] text-[#5B667A] border border-[#E5EAF0]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Course & Topics Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#F7F8FA]/50">
              {/* SECTION: SUGGESTED / MATCHING COURSES */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#14213D] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#1769E0]" />
                    <span>
                      {query.trim()
                        ? `Matching Courses (${displayedCourses.length})`
                        : 'Suggested Curriculum Tracks'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5B667A] font-medium">
                    Click track to start quiz
                  </span>
                </div>

                {displayedCourses.length === 0 && !isLoading ? (
                  <div className="py-8 px-4 text-center rounded-2xl bg-white border border-[#E5EAF0] space-y-2">
                    <Compass className="w-8 h-8 text-[#94A3B8] mx-auto animate-pulse" />
                    <h4 className="text-sm font-bold text-[#14213D]">
                      No courses found matching &ldquo;{query}&rdquo;
                    </h4>
                    <p className="text-xs text-[#5B667A] max-w-sm mx-auto">
                      Try searching for popular technologies like JavaScript, React, Python, or SQL.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/courses');
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-xs cursor-pointer"
                    >
                      <span>Browse All Tracks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {displayedCourses.map((course, idx) => {
                      const isHighlighted = selectedIndex === idx;

                      return (
                        <div
                          key={course.id || course.slug}
                          onClick={() => handleSelectCourse(course.slug)}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 text-left group bg-white shadow-2xs hover:shadow-md ${
                            isHighlighted
                              ? 'border-[#1769E0] ring-2 ring-[#1769E0]/15 bg-[#EBF3FC]/40'
                              : 'border-[#E5EAF0] hover:border-[#1769E0]/50'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Course Icon */}
                            <div className="w-10 h-10 rounded-xl bg-[#10233F] text-white flex items-center justify-center shrink-0 p-2 shadow-xs group-hover:scale-105 transition-transform">
                              <CourseTechIcon slug={course.slug} className="w-6 h-6" />
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Header: Title + Badge */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-[#14213D] group-hover:text-[#1769E0] transition-colors truncate">
                                  {course.name}
                                </h3>
                                {course.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3FC] text-[#1769E0] border border-[#C8DEF7] whitespace-nowrap">
                                    {course.badge}
                                  </span>
                                )}
                              </div>

                              {/* Description */}
                              {course.description && (
                                <p className="text-xs text-[#5B667A] line-clamp-1 mt-1 leading-snug">
                                  {course.description}
                                </p>
                              )}

                              {/* Footer Stats */}
                              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#5B667A] mt-2">
                                <span className="inline-flex items-center gap-1 text-[#1769E0]">
                                  <Hash className="w-3 h-3" />
                                  <span>{course.questionCount}+ Questions</span>
                                </span>
                                <span>•</span>
                                <span>{course.topicCount} Topics</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Start Arrow */}
                          <div className="w-7 h-7 rounded-lg bg-[#F7F8FA] group-hover:bg-[#1769E0] group-hover:text-white text-[#5B667A] flex items-center justify-center shrink-0 transition-colors mt-1">
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION: MATCHING TOPICS (IF ANY) */}
              {topics.length > 0 && (
                <div className="pt-2 border-t border-[#E5EAF0]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#14213D] uppercase tracking-wider mb-2.5 px-1">
                    <Layers className="w-3.5 h-3.5 text-[#1769E0]" />
                    <span>Specific Topic Lessons ({topics.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topics.map((t, idx) => {
                      const topicItemIndex = displayedCourses.length + idx;
                      const isHighlighted = selectedIndex === topicItemIndex;

                      return (
                        <div
                          key={`${t.courseSlug}:${t.topicName}`}
                          onClick={() => handleSelectTopic(t.courseSlug, t.topicName)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 bg-white text-left group shadow-2xs ${
                            isHighlighted
                              ? 'border-[#1769E0] bg-[#EBF3FC]/50 text-[#1769E0]'
                              : 'border-[#E5EAF0] hover:border-[#1769E0]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] text-[#1769E0] flex items-center justify-center shrink-0">
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#14213D] group-hover:text-[#1769E0] truncate">
                                {t.topicName}
                              </div>
                              <div className="text-[10px] text-[#5B667A] truncate font-mono">
                                in {t.courseName}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#5B667A] group-hover:text-[#1769E0] group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Dock / Keyboard Hints */}
            <div className="p-3 sm:p-4 border-t border-[#E5EAF0] bg-white flex items-center justify-between text-xs text-[#5B667A] shrink-0">
              <div className="hidden sm:flex items-center gap-2 font-medium">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#F0F4F8] border border-[#E5EAF0] text-[10px] font-mono font-bold">
                    ↑↓
                  </kbd>
                  <span>navigate</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#F0F4F8] border border-[#E5EAF0] text-[10px] font-mono font-bold">
                    ↵
                  </kbd>
                  <span>select</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#F0F4F8] border border-[#E5EAF0] text-[10px] font-mono font-bold">
                    esc
                  </kbd>
                  <span>close</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/courses');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 font-bold text-[#1769E0] hover:text-[#1257BD] transition-colors py-1 cursor-pointer"
              >
                <span>Explore all curriculum tracks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
