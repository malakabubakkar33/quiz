'use client';

import React from 'react';

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* 1. Base Layer */}
      <div className="absolute inset-0 bg-[#F7F8FA]" />

      {/* 2. Seamless Combined Light Linear Gradient + Academic Workspace Image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              #F7F8FA 0%,
              rgba(247, 248, 250, 0.98) 38%,
              rgba(247, 248, 250, 0.88) 52%,
              rgba(247, 248, 250, 0.25) 75%,
              rgba(247, 248, 250, 0.05) 100%
            ),
            url('/images/hero-academic-workspace.jpg')
          `,
          backgroundPosition: 'right 30% center',
        }}
      />

      {/* 3. Subtle Bottom Blend into #F7F8FA */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F7F8FA] to-transparent" />
    </div>
  );
}
