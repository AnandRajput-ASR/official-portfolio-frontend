import { Injectable, signal } from '@angular/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastMsg {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMsg[]>([]);
  show(message: string, type: ToastMsg['type'] = 'success', dur = 3500): void {
    const id = `t${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    this.toasts.update((l) => [...l, { id, message, type }]);
    setTimeout(() => this.remove(id), dur);
  }
  success(m: string): void {
    this.show(m, 'success');
  }
  error(m: string): void {
    this.show(m, 'error', 5000);
  }
  info(m: string): void {
    this.show(m, 'info');
  }
  warning(m: string): void {
    this.show(m, 'warning');
  }
  remove(id: string): void {
    this.toasts.update((l) => l.filter((t) => t.id !== id));
  }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tc">
      <div
        *ngFor="let t of ts.toasts()"
        class="ti"
        [ngClass]="'ti-' + t.type"
        (click)="ts.remove(t.id)"
      >
        <span class="ti-i">{{
          t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'
        }}</span>
        <span class="ti-m">{{ t.message }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .tc {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        pointer-events: none;
      }
      .ti {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.75rem 1.1rem;
        max-width: 320px;
        font-family: 'Space Mono', monospace;
        font-size: 0.72rem;
        letter-spacing: 0.02em;
        cursor: pointer;
        pointer-events: all;
        animation: ti-in 0.22s ease;
        clip-path: polygon(
          0 0,
          calc(100% - 5px) 0,
          100% 5px,
          100% 100%,
          5px 100%,
          0 calc(100% - 5px)
        );
      }
      .ti-i {
        font-size: 0.85rem;
        flex-shrink: 0;
      }
      .ti-success {
        background: #22c55e;
        color: #052e16;
      }
      .ti-error {
        background: #ef4444;
        color: #fff;
      }
      .ti-warning {
        background: #f5a623;
        color: #0d0d0d;
      }
      .ti-info {
        background: #3b82f6;
        color: #fff;
      }
      @keyframes ti-in {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class ToastComponent {
  constructor(public ts: ToastService) {}
}
