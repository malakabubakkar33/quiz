'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Loader2,
  Users,
  Trophy,
  Swords,
  X,
  UserCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  searchFriendsByUsername,
  ChallengeUserSearchResult,
} from '@/app/actions/challenge';

interface ChallengeSearchInputProps {
  onSelectUser: (user: ChallengeUserSearchResult) => void;
  suggestedFriends: ChallengeUserSearchResult[];
}

export function ChallengeSearchInput({
  onSelectUser,
  suggestedFriends = [],
}: ChallengeSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChallengeUserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search logic with smooth animated response
  useEffect(() => {
    const clean = query.trim().toLowerCase().replace(/^@/, '');
    if (clean.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchFriendsByUsername(clean);
        setResults(found);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to search friends:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleManualSearch = async () => {
    const clean = query.trim().toLowerCase().replace(/^@/, '');
    if (!clean) return;
    setIsSearching(true);
    try {
      const found = await searchFriendsByUsername(clean);
      setResults(found);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Popular quick friends list (blend provided suggestions with default popular chips matching the image)
  const defaultPopular = [
    {
      id: 'demo-ahmed',
      name: 'Ahmed Khan',
      username: 'ahmed',
      avatar: null,
      institutionType: null,
      institutionName: null,
      codingLevel: 'Advanced',
      totalScore: 4200,
      ratingPoints: 2150,
      quizzesWon: 12,
      rankBadge: 'MASTER' as const,
    },
    {
      id: 'demo-sara',
      name: 'Sara Chen',
      username: 'sara',
      avatar: null,
      institutionType: null,
      institutionName: null,
      codingLevel: 'Intermediate',
      totalScore: 3800,
      ratingPoints: 1980,
      quizzesWon: 10,
      rankBadge: 'MASTER' as const,
    },
    {
      id: 'demo-hamza',
      name: 'Hamza Tariq',
      username: 'hamza',
      avatar: null,
      institutionType: null,
      institutionName: null,
      codingLevel: 'Senior',
      totalScore: 3100,
      ratingPoints: 1750,
      quizzesWon: 8,
      rankBadge: 'CHAMPION' as const,
    },
    {
      id: 'demo-devuser',
      name: 'Dev User',
      username: 'devuser',
      avatar: null,
      institutionType: null,
      institutionName: null,
      codingLevel: 'Fullstack',
      totalScore: 2400,
      ratingPoints: 1540,
      quizzesWon: 6,
      rankBadge: 'CHAMPION' as const,
    },
  ];

  const popularList = suggestedFriends.length > 0
    ? [...suggestedFriends.slice(0, 4), ...defaultPopular.filter(d => !suggestedFriends.some(s => s.username === d.username))].slice(0, 4)
    : defaultPopular;

  return (
    <div
      ref={containerRef}
      className="p-6 rounded-3xl bg-[#090F1E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 relative"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Search Friend</h2>
          <p className="text-xs text-slate-400">
            Enter your friend&apos;s username to send a challenge.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="relative flex items-center rounded-2xl bg-[#050B18] border border-white/10 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all p-1.5">
          <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen && e.target.value.trim().length > 1) {
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleManualSearch();
              }
            }}
            placeholder="Enter username (e.g. @john)"
            className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 font-medium focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors mr-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleManualSearch}
            disabled={isSearching || !query.trim()}
            className="px-5 py-2 rounded-xl bg-[#00D9FF] hover:bg-[#38bdf8] text-black font-extrabold text-xs tracking-wide shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>

        {/* Smooth Auto-Suggest Dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl bg-[#090F1E] border border-cyan-500/30 p-2 shadow-2xl shadow-black/80 backdrop-blur-xl animate-scale-up space-y-1 max-h-72 overflow-y-auto">
            {isSearching ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-cyan-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching arena challengers...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">No user found for &quot;{query}&quot;</p>
                <p className="text-[11px] text-slate-500">Check the spelling or try another username.</p>
              </div>
            ) : (
              results.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    onSelectUser(user);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shrink-0 overflow-hidden shadow-sm">
                      {user.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={user.avatar}
                          alt={user.name || 'Avatar'}
                          className="w-full h-full object-cover rounded-[8px]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-black bg-cyan-400 rounded-[8px]">
                          {(user.name || user.username || 'U')[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {user.name || user.username}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400/80 truncate">
                        @{user.username || 'player'}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                          <Trophy className="w-2.5 h-2.5 text-amber-400" />
                          {user.quizzesWon ?? 0} wins
                        </span>
                        <span>•</span>
                        <span className="uppercase">{user.codingLevel || 'Contender'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 group-hover:bg-[#00D9FF] group-hover:text-black text-cyan-300 text-xs font-bold transition-all flex items-center gap-1 shrink-0">
                    <Swords className="w-3.5 h-3.5" />
                    <span>Challenge</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Popular Quick Chips Section */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-slate-400 tracking-wider">
          Popular
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {popularList.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelectUser(user)}
              className="px-3 py-2 rounded-2xl bg-[#050B18] border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/[0.05] transition-all flex items-center gap-2.5 shrink-0 group cursor-pointer shadow-sm"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shrink-0 overflow-hidden">
                {user.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar}
                    alt={user.username || 'User'}
                    className="w-full h-full object-cover rounded-[7px]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-black bg-cyan-400 rounded-[7px]">
                    {(user.username || 'U')[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  @{user.username}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {user.quizzesWon ?? 0} wins
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
