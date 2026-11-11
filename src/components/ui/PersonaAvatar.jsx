import React from 'react';
import {personaTone} from '../../styles/tokens';

// Illustrative, synthetic avatars (not real people). Each persona gets a
// distinct silhouette plus a badge for their job: spreadsheet, email, shield.
const LOOKS = {
  groupAdmin: {
    label: 'Maya, delegated group admin', skin: '#E8B996', hair: '#2B2B2B',
    hairPath: 'M20 31 C19 18 25 14 32 14 C39 14 45 18 44 31 L44 37 C41 36 40 31 40 26 C36 23 28 23 24 26 C24 31 23 36 20 37 Z',
    extra: (fg) => (
      <g fill="none" stroke={fg} strokeWidth="1.4">
        <circle cx="28" cy="29" r="3" /><circle cx="36" cy="29" r="3" /><path d="M31 29 H33" />
      </g>
    ),
    badge: (fg) => (
      <g fill="none" stroke={fg} strokeWidth="1.4">
        <rect x="45" y="46" width="10" height="8" rx="1" /><path d="M45 49 H55 M45 51.5 H55 M48.5 46 V54" />
      </g>
    ),
  },
  practice: {
    label: 'Rosa, small practice office manager', skin: '#C68E6A', hair: '#5A3825',
    hairPath: 'M22 28 C22 19 27 17 32 17 C37 17 42 19 42 28 C39 22 25 22 22 28 Z M27 14 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 Z',
    extra: () => null,
    badge: (fg) => (
      <g fill="none" stroke={fg} strokeWidth="1.4" strokeLinejoin="round">
        <rect x="45" y="46" width="10" height="7.5" rx="1" /><path d="M45 46.5 L50 50.5 L55 46.5" />
      </g>
    ),
  },
  payerOps: {
    label: 'Devon, health plan network ops lead', skin: '#8D5B3E', hair: '#1E1E1E',
    hairPath: 'M22 27 C22 18 27 16 32 16 C37 16 42 18 42 27 C40 22 24 22 22 27 Z',
    extra: () => (
      <g>
        <path d="M27 43 L32 49 L37 43 Z" fill="#FFFFFF" />
        <path d="M31 45 L33 45 L33.8 52 L32 54 L30.2 52 Z" fill="#1E1E1E" />
      </g>
    ),
    badge: (fg) => (
      <g fill="none" stroke={fg} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M50 44.5 L55 46.5 V50 C55 53 52.5 55 50 56 C47.5 55 45 53 45 50 V46.5 Z" /><path d="M47.8 50.2 L49.4 51.8 L52.4 48.6" />
      </g>
    ),
  },
};

export default function PersonaAvatar({id, size = 40, title}) {
  const look = LOOKS[id] ?? LOOKS.groupAdmin;
  const tone = personaTone[id] ?? personaTone.groupAdmin;
  const clip = `pa-clip-${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title ?? look.label} style={{flexShrink: 0, display: 'block'}}>
      <defs><clipPath id={clip}><circle cx="32" cy="32" r="30" /></clipPath></defs>
      <circle cx="32" cy="32" r="30" fill={tone.bg} stroke={tone.fg} strokeWidth="2" />
      <g clipPath={`url(#${clip})`}>
        <path d="M10 66 C10 49 20 43 32 43 C44 43 54 49 54 66 Z" fill={tone.fg} />
        <rect x="28.5" y="35" width="7" height="9" rx="2" fill={look.skin} />
        <circle cx="32" cy="28" r="10" fill={look.skin} />
        <path d={look.hairPath} fill={look.hair} />
        {look.extra(tone.fg)}
      </g>
      <circle cx="50" cy="50" r="9" fill="#FFFFFF" stroke={tone.fg} strokeWidth="1.5" />
      {look.badge(tone.fg)}
    </svg>
  );
}
