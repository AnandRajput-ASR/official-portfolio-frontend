import { Injectable } from '@angular/core';

export interface BadgeConfig {
  svg: string;      // inline SVG markup
  bg: string;       // background color
  textColor: string;
}

@Injectable({ providedIn: 'root' })
export class CertBadgeService {

  /** Returns true if this issuer has auto-generated badge support */
  isKnownIssuer(issuer: string): boolean {
    const known = ['microsoft', 'aws', 'amazon', 'google', 'comptia', 'oracle', 'cisco', 'pmi', 'meta'];
    return known.includes((issuer || '').toLowerCase().trim());
  }

  /** Get brand color for issuer */
  getIssuerColor(issuer: string): string {
    const colors: Record<string, string> = {
      'microsoft': '#0078d4',
      'aws': '#ff9900',
      'amazon': '#ff9900',
      'google': '#4285f4',
      'comptia': '#c8102e',
      'oracle': '#f80000',
      'cisco': '#1ba0d7',
      'pmi': '#003087',
      'meta': '#0668e1',
    };
    return colors[(issuer || '').toLowerCase()] || '#f5a623';
  }

  /** Returns the issuer logo SVG markup for known issuers */
  getIssuerLogoSVG(issuer: string): string {
    const key = (issuer || '').toLowerCase().trim();

    switch (key) {
      case 'microsoft':
        return `<svg viewBox="0 0 23 23" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
          <rect x="12" y="1" width="10" height="10" fill="#7fba00"/>
          <rect x="1" y="12" width="10" height="10" fill="#00a4ef"/>
          <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
        </svg>`;

      case 'aws':
      case 'amazon':
        return `<svg viewBox="0 0 80 48" width="52" height="32" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.4 28.8c-.6.4-1.5.6-2.4.6-1.3 0-2.3-.5-3-1.4l-.3.8h-1.8v-17h2v6.4c.7-.8 1.7-1.3 2.9-1.3 2.6 0 4.4 2.1 4.4 5.3 0 2.9-1 5.2-1.8 6.6zm-1.6-9.5c-.5-.7-1.2-1-2-1s-1.5.3-2 .9v5.4c.5.6 1.2 1 2 1 1.5 0 2.4-1.3 2.4-3.2 0-1.3-.4-2.4-1.2-3.1h.8zm9.5 10c-2.9 0-4.8-2.1-4.8-5.3 0-3.1 2-5.3 4.8-5.3s4.8 2.1 4.8 5.3c0 3.2-2 5.3-4.8 5.3zm0-8.7c-1.6 0-2.6 1.3-2.6 3.3s1 3.4 2.6 3.4 2.6-1.3 2.6-3.4-1-3.3-2.6-3.3zm12.8 8.5l-2-7.4-2 7.4h-2.2l-2.9-10.2h2.1l1.9 7.2 2-7.2h2.2l2 7.2 1.9-7.2h2l-2.9 10.2h-2.1z" fill="#ff9900"/>
          <path d="M9.4 38.2c-4.3-3.2-6.6-8-6.6-13.3 0-9.5 7.7-17.2 17.2-17.2 4.7 0 9.1 1.9 12.3 5" fill="none" stroke="#ff9900" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M55.6 38.2c4.3-3.2 6.6-8 6.6-13.3 0-9.5-7.7-17.2-17.2-17.2-4.7 0-9.1 1.9-12.3 5" fill="none" stroke="#ff9900" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M52 41l4-3.5-4-1z" fill="#ff9900"/>
        </svg>`;

      case 'google':
        return `<svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285f4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fbbc05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335"/>
        </svg>`;

      case 'comptia':
        return `<svg viewBox="0 0 60 32" width="52" height="28" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="32" fill="#c8102e" rx="3"/>
          <text x="30" y="22" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="14" fill="white">CompTIA</text>
        </svg>`;

      default:
        return '';
    }
  }

  /** Level badge color */
  getLevelColor(level: string): string {
    const lvl = (level || '').toLowerCase();
    if (lvl.includes('expert') || lvl.includes('professional'))  return '#f5a623';
    if (lvl.includes('associate') || lvl.includes('practitioner')) return '#0078d4';
    if (lvl.includes('fundamental') || lvl.includes('foundational')) return '#68a063';
    return '#7a7570';
  }

  getLevelLabel(level: string): string {
    const lvl = (level || '').toLowerCase();
    if (lvl.includes('expert'))       return 'Expert ★';
    if (lvl.includes('professional')) return 'Professional';
    if (lvl.includes('associate'))    return 'Associate';
    if (lvl.includes('practitioner')) return 'Practitioner';
    if (lvl.includes('fundamental'))  return 'Fundamental';
    if (lvl.includes('foundational')) return 'Foundational';
    return level;
  }
}
