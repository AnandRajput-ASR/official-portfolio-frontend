import { Injectable, signal, computed } from '@angular/core';

/**
 * Global loading service.
 * Usage anywhere:
 *   loadingService.start('key')   — register a loading source
 *   loadingService.stop('key')    — mark that source as done
 *   loadingService.isLoading()    — true if ANY source is still loading
 *
 * Multiple concurrent calls are safe — the screen stays up until
 * every caller has called stop().
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  /** Set of active loading keys */
  private readonly _active = signal<Set<string>>(new Set());

  /** True if any key is still active */
  readonly isLoading = computed(() => this._active().size > 0);

  /** Start loading for a named key */
  start(key: string): void {
    this._active.update((s) => new Set(s).add(key));
  }

  /** Stop loading for a named key */
  stop(key: string): void {
    this._active.update((s) => {
      const next = new Set(s);
      next.delete(key);
      return next;
    });
  }

  /** Convenience: stop all active keys at once */
  stopAll(): void {
    this._active.set(new Set());
  }
}
