import React from 'react';

interface Props {
  slug: string;
  className?: string;
}

export function CourseTechIcon({ slug, className = 'w-6 h-6' }: Props) {
  const normalizedSlug = slug.toLowerCase().trim();

  switch (normalizedSlug) {
    // ── PYTHON ──
    case 'python':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11.91 2C8.75 2 6.84 3.39 6.84 5.76V7.47H12.02V8.12H4.81C2.65 8.12 1 9.77 1 12.03C1 14.28 2.65 15.93 4.81 15.93H6.38V13.88C6.38 11.51 8.29 9.54 10.74 9.54H15.94V7.47C15.94 5.1 14.03 2 11.91 2ZM9.32 3.65C9.9 3.65 10.37 4.12 10.37 4.7C10.37 5.28 9.9 5.75 9.32 5.75C8.74 5.75 8.27 5.28 8.27 4.7C8.27 4.12 8.74 3.65 9.32 3.65Z"
            fill="currentColor"
          />
          <path
            d="M12.09 22C15.25 22 17.16 20.61 17.16 18.24V16.53H11.98V15.88H19.19C21.35 15.88 23 14.23 23 11.97C23 9.72 21.35 8.07 19.19 8.07H17.62V10.12C17.62 12.49 15.71 14.46 13.26 14.46H8.06V16.53C8.06 18.9 9.97 22 12.09 22ZM14.68 20.35C14.1 20.35 13.63 19.88 13.63 19.3C13.63 18.72 14.1 18.25 14.68 18.25C15.26 18.25 15.73 18.72 15.73 19.3C15.73 19.88 15.26 20.35 14.68 20.35Z"
            fill="currentColor"
            opacity="0.8"
          />
        </svg>
      );

    // ── REACT ──
    case 'react':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(0 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
        </svg>
      );

    // ── JAVASCRIPT ──
    case 'javascript':
    case 'js':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" />
          <path
            d="M8.2 17.5C8.9 17.9 9.8 18.2 10.7 18.2C12.3 18.2 13.1 17.4 13.1 15.9V9.5H11.2V15.8C11.2 16.5 10.8 16.8 10.1 16.8C9.5 16.8 9.0 16.6 8.5 16.2L8.2 17.5ZM14.4 17.3C15.2 17.9 16.3 18.3 17.6 18.3C19.7 18.3 21.0 17.1 21.0 15.2C21.0 13.6 20.1 12.8 18.5 12.1L17.9 11.8C17.0 11.4 16.4 11.0 16.4 10.3C16.4 9.6 17.0 9.1 17.9 9.1C18.8 9.1 19.5 9.4 20.1 9.8L20.6 8.5C20.0 8.1 19.0 7.8 18.0 7.8C16.1 7.8 14.8 9.0 14.8 10.8C14.8 12.3 15.7 13.1 17.2 13.8L17.8 14.1C18.8 14.5 19.4 15.0 19.4 15.8C19.4 16.6 18.7 17.1 17.6 17.1C16.6 17.1 15.7 16.7 15.0 16.1L14.4 17.3Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    // ── TYPESCRIPT ──
    case 'typescript':
    case 'ts':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" />
          <path
            d="M6.5 10.2H12.5V8.5H4.5V10.2H6.5V18.5H8.5V10.2H6.5ZM14.1 17.3C14.9 17.9 16.0 18.3 17.3 18.3C19.4 18.3 20.7 17.1 20.7 15.2C20.7 13.6 19.8 12.8 18.2 12.1L17.6 11.8C16.7 11.4 16.1 11.0 16.1 10.3C16.1 9.6 16.7 9.1 17.6 9.1C18.5 9.1 19.2 9.4 19.8 9.8L20.3 8.5C19.7 8.1 18.7 7.8 17.7 7.8C15.8 7.8 14.5 9.0 14.5 10.8C14.5 12.3 15.4 13.1 16.9 13.8L17.5 14.1C18.5 14.5 19.1 15.0 19.1 15.8C19.1 16.6 18.4 17.1 17.3 17.1C16.3 17.1 15.4 16.7 14.7 16.1L14.1 17.3Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    // ── HTML ──
    case 'html':
    case 'html5':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 3L5.6 20.4L12 22L18.4 20.4L20 3H4Z" fill="currentColor" />
          <path d="M12 4.7V20.2L16.9 18.9L18.2 4.7H12Z" fill="#FFFFFF" fillOpacity="0.2" />
          <path
            d="M7.7 7.3H16.3L16.0 10.2H10.4L10.6 12.3H15.8L15.4 16.5L12 17.4L8.6 16.5L8.4 14.4H10.3L10.4 15.3L12 15.7L13.6 15.3L13.8 13.8H7.4L7.7 7.3Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    // ── CSS ──
    case 'css':
    case 'css3':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 3L5.6 20.4L12 22L18.4 20.4L20 3H4Z" fill="currentColor" />
          <path d="M12 4.7V20.2L16.9 18.9L18.2 4.7H12Z" fill="#FFFFFF" fillOpacity="0.2" />
          <path
            d="M7.7 7.3H16.3L16.1 9.4H10.1L10.3 11.2H15.9L15.5 15.4L12 16.4L8.5 15.4L8.3 13.4H10.2L10.3 14.3L12 14.8L13.7 14.3L13.9 12.8H8.1L7.7 7.3Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    // ── SQL / DATABASE ──
    case 'sql':
    case 'database':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="5" rx="8" ry="3" fill="currentColor" fillOpacity="0.1" />
          <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
          <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
        </svg>
      );

    // ── GIT & GITHUB ──
    case 'git':
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.15" />
          <circle cx="6" cy="6" r="3" fill="currentColor" fillOpacity="0.15" />
          <circle cx="18" cy="9" r="3" fill="currentColor" fillOpacity="0.15" />
          <path d="M6 9v6" />
          <path d="M9 9a9 9 0 0 1 9 0" />
        </svg>
      );

    // ── DEFAULT FALLBACK ──
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
  }
}
