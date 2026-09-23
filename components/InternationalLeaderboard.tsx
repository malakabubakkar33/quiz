'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Medal,
  Globe,
  TrendingUp,
  Target,
  Zap,
  Sparkles,
} from 'lucide-react';
import { LeaderboardUser } from '@/app/actions/leaderboard';

interface Props {
  initialTop10: LeaderboardUser[];
  currentUserRank?: {
    rank: number;
    ratingPoints: number;
    averageAccuracy: number;
    clerkUserId: string;
  } | null;
  totalRankedPlayers: number;
}

export function InternationalLeaderboard({
  initialTop10,
  currentUserRank,
  totalRankedPlayers,
}: Props) {
  const [leaderboard] = useState<LeaderboardUser[]>(initialTop10);

  const firstPlace = leaderboard.find((u) => u.rank === 1);
  const secondPlace = leaderboard.find((u) => u.rank === 2);
  const thirdPlace = leaderboard.find((u) => u.rank === 3);
  const remainingTop10 = leaderboard.filter((u) => u.rank > 3);

  const formatTime = (sec: number) => {
    if (sec >= 60) {
      const mins = Math.floor(sec / 60);
      const remainingSec = sec % 60;
      return `${mins}m ${remainingSec}s`;
    }
    return `${sec}s`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-14 space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="rounded-2xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF9E7] text-[#B45309] border border-[#FDE68A]">
          <Globe className="w-3.5 h-3.5 text-[#B45309]" />
          <span>Global Developer Standings</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14213D] font-serif-title tracking-tight">
          Hall of Fame • Top Coders
        </h1>

        <p className="text-xs sm:text-sm text-[#5B667A] leading-relaxed max-w-2xl mx-auto">
          Rankings calculated dynamically across Solo Assessments, Multiplayer Arenas, and 1v1 Duels.
        </p>

        <div className="flex items-center justify-center gap-6 pt-1 text-xs font-semibold text-[#5B667A]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1769E0]" />
            <span>
              <strong className="text-[#14213D]">{totalRankedPlayers}</strong> Ranked Developers
            </span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Active MMR Ladder</span>
          </span>
        </div>
      </div>

      {/* ── 1. TOP 3 PODIUM DISPLAY ── */}
      {leaderboard.length > 0 && (
        <div className="pt-2 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end max-w-4xl mx-auto">
            {/* 🥈 SECOND PLACE */}
            {secondPlace && (
              <div className="order-2 md:order-1 rounded-2xl bg-white border-2 border-[#E5EAF0] p-5 text-center space-y-3 shadow-xs hover:border-[#94A3B8] transition-all">
                <div className="relative">
                  <div className="w-8 h-8 mx-auto rounded-full bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center text-[#475569] font-mono font-bold text-xs shadow-2xs mb-2">
                    #2
                  </div>

                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F1F5F9] p-0.5 overflow-hidden shadow-2xs border border-[#CBD5E1]">
                    {secondPlace.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={secondPlace.avatar}
                        alt={secondPlace.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[#14213D] bg-[#F1F5F9]">
                        {secondPlace.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-base font-bold text-[#14213D] truncate">
                    {secondPlace.name}
                  </div>
                  <div className="text-xs font-mono text-[#1769E0]">@{secondPlace.username}</div>
                  <div className="text-[11px] text-[#5B667A] pt-0.5">
                    {secondPlace.codingLevel} Coder
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] space-y-1 text-xs">
                  <div className="font-semibold text-[#5B667A] flex items-center justify-between">
                    <span>MMR Points</span>
                    <span className="font-mono text-[#1769E0] font-bold">{secondPlace.ratingPoints}</span>
                  </div>
                  <div className="font-semibold text-[#5B667A] flex items-center justify-between">
                    <span>Accuracy</span>
                    <span className="font-mono text-[#10B981] font-bold">{secondPlace.averageAccuracy}%</span>
                  </div>
                  <div className="font-semibold text-[#5B667A] flex items-center justify-between">
                    <span>Speed</span>
                    <span className="font-mono text-[#D97706] font-bold">{formatTime(secondPlace.averageTimeSec)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 🥇 FIRST PLACE (Champion) */}
            {firstPlace && (
              <div className="order-1 md:order-2 rounded-2xl bg-white border-2 border-[#F59E0B] p-6 text-center space-y-3.5 shadow-md -translate-y-2 relative">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#FEF9E7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shadow-xs mb-2">
                    <Crown className="w-5 h-5 fill-[#F59E0B] text-[#D97706]" />
                  </div>

                  <div className="w-20 h-20 mx-auto rounded-2xl bg-[#FEF9E7] p-0.5 overflow-hidden shadow-xs border-2 border-[#F59E0B]">
                    {firstPlace.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={firstPlace.avatar}
                        alt={firstPlace.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-2xl text-[#B45309] bg-[#FEF9E7]">
                        {firstPlace.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#F59E0B] text-white font-mono font-bold text-[10px] shadow-xs">
                    #1 CHAMPION
                  </div>
                </div>

                <div className="pt-1">
                  <div className="text-lg font-bold text-[#14213D] truncate">
                    {firstPlace.name}
                  </div>
                  <div className="text-xs font-mono text-[#1769E0]">@{firstPlace.username}</div>
                  <div className="text-[11px] text-[#B45309] font-bold uppercase tracking-wider">
                    {firstPlace.institutionName || 'Grandmaster Tier'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FEF9E7]/40 border border-[#FDE68A] space-y-1.5 text-xs">
                  <div className="font-semibold text-[#5B667A] flex items-center justify-between">
                    <span>Championship Score</span>
                    <span className="font-mono text-[#B45309] font-black text-sm">{firstPlace.ratingPoints}</span>
                  </div>
                  <div className="font-semibold text-[#5B667A] flex items-center justify-between">
                    <span>Average Accuracy</span>
                    <span className="font-mono text-[#10B981] font-bold">{firstPlace.averageAccuracy}%</span>
                  </div>
                  <div className="font-semibold text-[#5B667A] flex items-center justify-between">
                    <span>Duels Won</span>
                    <span className="font-mono text-[#1769E0] font-bold">{firstPlace.quizzesWon} Wins</span>
                  </div>
                </div>
              </div>
            )}

            {/* 🥉 THIRD PLACE */}
            {thirdPlace && (
              <div className="order-3 rounded-2xl bg-white border-2 border-[#E5EAF0] p-5 text-center space-y-3 shadow-xs hover:border-[#D97706]/40 transition-all">
                <div className="relative">
                  <div className="w-8 h-8 mx-auto rounded-full bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#B45309] font-mono font-bold text-xs shadow-2xs mb-2">
                    #3
                  </div>

                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFFBEB] p-0.5 overflow-hidden shadow-2xs border border-[#FDE68A]">
                    {thirdPlace.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={thirdPlace.avatar}
                        alt={thirdPlace.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[#14213D] bg-[#FFFBEB]">
                        {thirdPlace.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-base font-bold text-[#14213D] truncate">
                    {thirdPlace.name}
                  </div>
                  <div className="text-xs font-mono text-[#1769E0]">@{thirdPlace.username}</div>
                  <div className="text-[11px] text-[#5B667A] pt-0.5">
                    {thirdPlace.codingLevel} Coder
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] space-y-1 text-xs">
                  <div className="font-semibold text-[#5B667A] flex items-center justify-between">
                    <span>MMR Points</span>
                    <span className="font-mono text-[#1769E0] font-bold">{thirdPlace.ratingPoints}</span>
                  </div>
                  <div className="font-semibold text-[#5B667A] flex items-center justify-between">
                    <span>Accuracy</span>
                    <span className="font-mono text-[#10B981] font-bold">{thirdPlace.averageAccuracy}%</span>
                  </div>
                  <div className="font-semibold text-[#5B667A] flex items-center justify-between">
                    <span>Speed</span>
                    <span className="font-mono text-[#D97706] font-bold">{formatTime(thirdPlace.averageTimeSec)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. RANKS #4 TO #10 TABLE ── */}
      <div className="rounded-2xl bg-white border-2 border-[#E5EAF0] p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#1769E0]" />
            <h3 className="text-base font-bold text-[#14213D]">
              Rankings (Positions 4 – 10)
            </h3>
          </div>
          <span className="text-xs text-[#5B667A] font-medium">Global Ladder</span>
        </div>

        {remainingTop10.length === 0 ? (
          <div className="p-8 text-center text-[#5B667A] text-xs">
            Play quizzes and duels to claim your spot in the top 10!
          </div>
        ) : (
          <div className="space-y-2">
            {remainingTop10.map((user) => {
              const isCurrentUser = currentUserRank?.clerkUserId === user.clerkUserId;
              return (
                <div
                  key={user.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    isCurrentUser
                      ? 'bg-[#EBF3FC] border-[#1769E0] shadow-xs'
                      : 'bg-[#F7F8FA] border-[#E5EAF0] hover:bg-[#F0F4F8]'
                  }`}
                >
                  {/* Rank & User Info */}
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E5EAF0] flex items-center justify-center font-mono font-bold text-xs text-[#14213D] shrink-0">
                      #{user.rank}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] shrink-0 overflow-hidden">
                      {user.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm text-[#1769E0]">
                          {user.name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#14213D] flex items-center gap-2">
                        <span className="truncate">{user.name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1769E0] text-white shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#1769E0] truncate">@{user.username}</div>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[10px] text-[#5B667A]">Level</span>
                    <span className="text-xs font-bold text-[#14213D] uppercase">
                      {user.codingLevel}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5EAF0]">
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-[#5B667A]">Accuracy</div>
                      <div className="text-xs font-bold font-mono text-[#10B981]">
                        {user.averageAccuracy}%
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-[#5B667A]">Speed</div>
                      <div className="text-xs font-bold font-mono text-[#5B667A]">
                        {formatTime(user.averageTimeSec)}
                      </div>
                    </div>

                    <div className="text-right pl-2 border-l border-[#E5EAF0] min-w-[70px]">
                      <div className="text-[10px] text-[#5B667A]">MMR</div>
                      <div className="text-sm font-extrabold font-mono text-[#1769E0]">
                        {user.ratingPoints}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
