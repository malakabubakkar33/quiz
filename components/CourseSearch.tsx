'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Layers, ArrowRight, X, Code2 } from 'lucide-react';
import {
  getCourseSearchResults,
  type CourseSearchResultItem,
  type TopicSearchResultItem,
} from '@/app/actions/quiz';
import { CourseTechIcon } from './CourseTechIcon';

export function CourseSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<CourseSearchResultItem[]>([]);
  const [topics, setTopics] = useState<TopicSearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Total selectable items across courses & topics
  const allItems = [
    ...courses.map((c) => ({ type: 'course' as const, id: c.slug, data: c })),
    ...topics.map((t) => ({ type: 'topic' as const, id: `${t.courseSlug}:${t.topicName}`, data: t })),
  ];

  // Debounced search fetching real data
  useEffect(() => {
    if (!query.trim()) {
      setCourses([]);
      setTopics([]);
      setIsOpen(false);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
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
    }, 180);

    return () => clearTimeout(timeout);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selection navigation handler
  const handleSelectCourse = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/quiz/setup/${slug}`);
  };

  const handleSelectTopic = (courseSlug: string, topicName: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/quiz/setup/${courseSlug}?topic=${encodeURIComponent(topicName)}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        if (query.trim()) setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allItems.length) {
        const item = allItems[selectedIndex];
        if (item.type === 'course') {
          handleSelectCourse((item.data as CourseSearchResultItem).slug);
        } else {
          const t = item.data as TopicSearchResultItem;
          handleSelectTopic(t.courseSlug, t.topicName);
        }
      } else if (courses.length > 0) {
        handleSelectCourse(courses[0].slug);
      } else {
        router.push('/courses');
        setIsOpen(false);
      }
    }
  };

  const hasResults = courses.length > 0 || topics.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md lg:max-w-lg">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-[#5B667A]">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-[#1769E0] animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-[#5B667A]" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search courses, topics, or tracks..."
          className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none bg-[#F0F4F8] border border-[#E5EAF0] border-card hover:border-[#CBD5E1] focus:bg-[#FFFFFF] focus:border-[#1769E0] focus:ring-4 focus:ring-[#1769E0]/15 text-[#14213D] text-navy-primary placeholder:text-[#5B667A] shadow-2xs font-medium"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-0.5 rounded-full text-[#5B667A] hover:text-[#14213D] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 bg-white bg-card-white border border-[#E5EAF0] border-card shadow-xl">
          {isLoading && !hasResults ? (
            <div className="flex items-center justify-center py-8 text-xs text-[#5B667A] gap-2 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-[#1769E0]" />
              <span>Searching coding tracks...</span>
            </div>
          ) : !hasResults ? (
            <div className="py-6 px-4 text-center space-y-1">
              <p className="text-xs font-bold text-[#14213D]">
                No courses or topics found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] text-[#5B667A]">
                Try searching for &quot;JavaScript&quot;, &quot;React&quot;, &quot;HTML&quot;, or &quot;CSS&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin pr-1">
              {/* SECTION 1: COURSES */}
              {courses.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between text-[#1769E0]">
                    <span>Courses</span>
                    <span className="text-[#5B667A] font-mono font-normal">{courses.length} matches</span>
                  </div>

                  <div className="space-y-1 mt-1">
                    {courses.map((course, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => handleSelectCourse(course.slug)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                            isSelected
                              ? 'bg-[#EBF3FC] border border-[#D5E5F9] text-[#1769E0] shadow-xs'
                              : 'hover:bg-[#F0F4F8] border border-transparent text-[#14213D]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#10233F] text-white p-1.5 shadow-xs">
                              <CourseTechIcon slug={course.slug} className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#14213D] group-hover:text-[#1769E0] transition-colors truncate">
                                {course.name}
                              </div>
                              <div className="text-[10px] text-[#5B667A] font-mono flex items-center gap-2">
                                <span>{course.topicCount} Topics</span>
                                <span>•</span>
                                <span>{course.questionCount} Questions</span>
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-[#5B667A] group-hover:text-[#1769E0] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: TOPICS */}
              {topics.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between border-t border-[#E5EAF0] pt-2 text-[#5B667A]">
                    <span>Topics</span>
                    <span className="text-[#5B667A] font-mono font-normal">{topics.length} topics</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                    {topics.map((topic, tIdx) => {
                      const itemIdx = courses.length + tIdx;
                      const isSelected = selectedIndex === itemIdx;

                      return (
                        <button
                          key={`${topic.courseSlug}:${topic.topicName}`}
                          type="button"
                          onClick={() => handleSelectTopic(topic.courseSlug, topic.topicName)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-150 group cursor-pointer ${
                            isSelected
                              ? 'bg-[#EBF3FC] border border-[#D5E5F9] text-[#1769E0]'
                              : 'hover:bg-[#F0F4F8] border border-transparent text-[#14213D]'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5 shrink-0 text-[#1769E0]" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-[#14213D] group-hover:text-[#1769E0] truncate">
                              {topic.topicName}
                            </div>
                            <div className="text-[9px] text-[#5B667A] font-mono truncate">
                              in {topic.courseName}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="pt-2 border-t border-[#E5EAF0] px-2 flex items-center justify-between text-[11px] text-[#5B667A]">
                <span className="font-mono">Press ↑↓ to navigate • ↵ to select</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/courses');
                  }}
                  className="font-bold flex items-center gap-1 text-[#1769E0] hover:text-[#1257BD] transition-colors"
                >
                  <span>View all courses</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
