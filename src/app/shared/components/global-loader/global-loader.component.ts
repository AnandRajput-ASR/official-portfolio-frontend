import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '@core/services/loading.service';

/**
 * Full-screen loading overlay driven by LoadingService.
 * Place once in AppComponent. Fades out when isLoading() becomes false.
 */
@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gl-backdrop" [class.gl-hidden]="!loading.isLoading()">
      <div class="gl-card">
        <div class="gl-logo">AR<span class="gl-dot">.</span></div>
        <div class="gl-ring-wrap">
          <div class="gl-ring"></div>
          <div class="gl-ring gl-ring-2"></div>
        </div>
        <p class="gl-label">Loading portfolio…</p>
        <div class="gl-bar-track"><div class="gl-bar"></div></div>
      </div>
    </div>
  `,
  styles: [
    `
      .gl-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: #0d0d0d;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          opacity 0.45s ease,
          visibility 0.45s ease;
        opacity: 1;
        visibility: visible;
      }
      .gl-hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }
      .gl-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }
      .gl-logo {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: 2rem;
        color: #f0ede8;
        letter-spacing: -0.03em;
      }
      .gl-dot {
        color: #f5a623;
      }
      .gl-ring-wrap {
        position: relative;
        width: 52px;
        height: 52px;
      }
      .gl-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2.5px solid transparent;
        border-top-color: #f5a623;
        animation: gl-spin 0.9s linear infinite;
      }
      .gl-ring-2 {
        inset: 8px;
        border-top-color: rgba(245, 166, 35, 0.35);
        animation-duration: 1.4s;
        animation-direction: reverse;
      }
      .gl-label {
        font-family: 'Space Mono', monospace;
        font-size: 0.65rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #7a7570;
      }
      .gl-bar-track {
        width: 120px;
        height: 2px;
        background: #252525;
        overflow: hidden;
      }
      .gl-bar {
        height: 100%;
        background: #f5a623;
        animation: gl-pulse 1.6s ease-in-out infinite;
      }
      @keyframes gl-spin {
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes gl-pulse {
        0% {
          width: 0%;
          margin-left: 0;
        }
        50% {
          width: 60%;
          margin-left: 20%;
        }
        100% {
          width: 0%;
          margin-left: 100%;
        }
      }
    `,
  ],
})
export class GlobalLoaderComponent {
  readonly loading = inject(LoadingService);
}
