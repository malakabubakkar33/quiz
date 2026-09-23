'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Target, Zap, Crown, Award, ArrowUpRight } from 'lucide-react';
import type { UserAnalyticsData } from '@/app/actions/leaderboard';

interface Props {
  analytics: UserAnalyticsData | null;
}

export function ProfileAnalyticsRings({ analytics }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger radial bar animation after mount
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const totalScore = analytics?.totalScore ?? 0;
  const ratingPoints = analytics?.ratingPoints ?? 1000;
  const accuracy = analytics?.averageAccuracy ?? 0;
  const averageTimeSec = analytics?.averageTimeSec ?? 45;
  const globalRank = analytics?.globalRank ?? 1;
  const totalPlayers = analytics?.totalRankedPlayers ?? 1;
  const percentile = analytics?.percentile ?? 50;

  // Speed score calculation (normalized: 15s or less = 100%, 90s or more = 20%)
  const speedPercentage = Math.max(
    15,
    Math.min(100, Math.round(100 - ((averageTimeSec - 10) / 80) * 85))
  );

  // Rating percentage toward 2500 Master rank
  const ratingPercentage = Math.min(100, Math.max(10, Math.round((ratingPoints / 2500) * 100)));

  // Tier designation
  const getTier = (rp: number) => {
    if (rp >= 2200) return { name: 'Grandmaster', color: 'text-[#B45309]', badgeColor: 'bg-[#FEF9E7] text-[#B45309] border-[#FDE68A]' };
    if (rp >= 1800) return { name: 'Diamond Master', color: 'text-[#1769E0]', badgeColor: 'bg-[#EBF3FC] text-[#1769E0] border-[#C8DEF7]' };
    if (rp >= 1400) return { name: 'Platinum Coder', color: 'text-[#7C3AED]', badgeColor: 'bg-[#F3E8FF] text-[#7C3AED] border-[#DDD6FE]' };
    return { name: 'Challenger', color: 'text-[#0D9488]', badgeColor: 'bg-[#EEF7F2] text-[#0D9488] border-[#99F6E4]' };
  };

  const tier = getTier(ratingPoints);

  const rings = [
    {
      id: 'score',
      title: 'Rating & MMR',
      value: `${ratingPoints.toLocaleString()} RP`,
      subtext: `${totalScore.toLocaleString()} total pts accumulated`,
      percentage: ratingPercentage,
      gradientId: 'grad-score',
      colorFrom: '#1769E0',
      colorTo: '#2563EB',
      textColor: 'text-[#1769E0]',
      icon: Trophy,
      badge: tier.name,
      badgeColor: tier.badgeColor,
    },
    {
      id: 'accuracy',
      title: 'Average Accuracy',
      value: `${accuracy}%`,
      subtext: accuracy >= 80 ? 'Mastery tier accuracy' : 'Active precision rate',
      percentage: Math.max(5, accuracy),
      gradientId: 'grad-accuracy',
      colorFrom: '#0F8A52',
      colorTo: '#059669',
      textColor: 'text-[#0F8A52]',
      icon: Target,
      badge: accuracy >= 85 ? 'Sharpshooter' : 'Calibrated',
      badgeColor: 'bg-[#E8F8F0] text-[#0F8A52] border-[#C2F0D8]',
    },
    {
      id: 'speed',
      title: 'Response Speed',
      value: `${averageTimeSec}s`,
      subtext: `${averageTimeSec <= 20 ? 'Lightning fast' : averageTimeSec <= 40 ? 'Swift thinking' : 'Deliberate'} pace`,
      percentage: speedPercentage,
      gradientId: 'grad-speed',
      colorFrom: '#D97706',
      colorTo: '#DC2626',
      textColor: 'text-[#D97706]',
      icon: Zap,
      badge: averageTimeSec <= 25 ? 'High Velocity' : 'Steady Pace',
      badgeColor: 'bg-[#FEF9E7] text-[#B45309] border-[#FDE68A]',
    },
    {
      id: 'rank',
      title: 'Global Position',
      value: `#${globalRank}`,
      subtext: `Top ${Math.max(1, 100 - percentile)}% of ${totalPlayers} coders`,
      percentage: Math.max(10, percentile),
      gradientId: 'grad-rank',
      colorFrom: '#7C3AED',
      colorTo: '#9333EA',
      textColor: 'text-[#7C3AED]',
      icon: Crown,
      badge: globalRank <= 10 ? 'Top 10 Global' : `Rank #${globalRank}`,
      badgeColor: 'bg-[#F3E8FF] text-[#7C3AED] border-[#DDD6FE]',
    },
  ];

  // SVG Circular Constants
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#14213D] flex items-center gap-2">
          <Award className="w-4 h-4 text-[#1769E0]" />
          <span>Realtime Performance Analytics</span>
        </h2>
        <span className="text-xs text-[#5B667A] flex items-center gap-1 font-medium">
          Live Backend Calculation
          <ArrowUpRight className="w-3.5 h-3.5 text-[#1769E0]" />
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rings.map((ring) => {
          const Icon = ring.icon;
          const strokeDashoffset = animated
            ? circumference - (ring.percentage / 100) * circumference
            : circumference;

          return (
            <div
              key={ring.id}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-xs hover:border-[#1769E0]/40 transition-all flex flex-col items-center text-center group"
            >
              {/* Title & Badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-xs font-bold text-[#5B667A] flex items-center gap-1.5 truncate">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${ring.textColor}`} />
                  <span className="truncate">{ring.title}</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${ring.badgeColor}`}
                >
                  {ring.badge}
                </span>
              </div>

              {/* Circular SVG Progress Ring */}
              <div className="relative w-[140px] h-[140px] flex items-center justify-center my-2">
                <svg
                  width={size}
                  height={size}
                  className="transform -rotate-90 origin-center"
                >
                  <defs>
                    <linearGradient
                      id={ring.gradientId}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={ring.colorFrom} />
                      <stop offset="100%" stopColor={ring.colorTo} />
                    </linearGradient>
                  </defs>

                  {/* Track Circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#E5EAF0"
                    strokeWidth={strokeWidth}
                  />

                  {/* Animated Progress Circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={`url(#${ring.gradientId})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </svg>

                {/* Center Content Inside Circle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#14213D] tracking-tight">
                    {ring.value}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B667A] mt-0.5">
                    {ring.percentage}% efficiency
                  </span>
                </div>
              </div>

              {/* Bottom Details */}
              <p className="text-xs text-[#5B667A] mt-2 font-medium">
                {ring.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
