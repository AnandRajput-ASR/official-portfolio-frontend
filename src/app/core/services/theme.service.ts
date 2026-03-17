import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'portfolio_theme';
  theme = signal<Theme>(this.getSavedTheme());

  constructor() {
    // Apply theme to <html> element whenever it changes
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(this.STORAGE_KEY, t);
    });
  }

  toggle(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private getSavedTheme(): Theme {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme;
    if (saved === 'light' || saved === 'dark') return saved;
    // Respect system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
