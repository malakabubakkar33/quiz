'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isQuizPlay = pathname.startsWith('/quiz/play');

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('cq_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // ignore
    }

    const handleSidebarChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isCollapsed: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isCollapsed === 'boolean') {
        const nextVal = customEvent.detail.isCollapsed;
        queueMicrotask(() => {
          setIsCollapsed(nextVal);
        });
      }
    };

    window.addEventListener('cq-sidebar-change', handleSidebarChange);
    return () => window.removeEventListener('cq-sidebar-change', handleSidebarChange);
  }, []);

  if (isQuizPlay) {
    return <>{children}</>;
  }

  return (
    <div
      className={`flex-1 flex flex-col min-h-screen w-full transform-gpu will-change-[padding] transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        mounted && !isCollapsed ? 'md:pl-64' : 'md:pl-[74px]'
      }`}
    >
      {children}
    </div>
  );
}
