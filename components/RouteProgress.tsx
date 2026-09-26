'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger brief top bar animation when route or query changes
  useEffect(() => {
    setLoading(true);
    setProgress(25);

    const t1 = setTimeout(() => setProgress(65), 100);
    const t2 = setTimeout(() => setProgress(90), 250);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, searchParams]);

  // Intercept all internal anchor clicks for instant feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        target.href.startsWith(window.location.origin) &&
        !target.target &&
        !target.hasAttribute('download')
      ) {
        try {
          const url = new URL(target.href);
          if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
            setLoading(true);
            setProgress(30);
          }
        } catch {}
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none transition-all duration-300 ease-out overflow-visible"
      style={{
        opacity: loading || progress < 100 ? 1 : 0,
      }}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-[#E5EAF0]/40 backdrop-blur-[1px]" />

      {/* Main clean royal blue loading bar */}
      <div
        className="relative h-full bg-gradient-to-r from-[#1769E0] to-[#3B82F6] rounded-r-full shadow-[0_0_10px_rgba(23,105,224,0.5)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
        }}
      >
        {/* Leading edge bright shimmer */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/60 rounded-r-full" />
      </div>
    </div>
  );
}
