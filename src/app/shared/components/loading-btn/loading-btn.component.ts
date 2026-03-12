import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-btn',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="'btn ' + btnClass" [disabled]="loading || disabled" (click)="clicked.emit()">
      <span class="lb-spinner" *ngIf="loading"></span>
      <span *ngIf="!loading">{{ label }}</span>
      <span *ngIf="loading" class="lb-text">{{ loadingLabel || label }}</span>
    </button>
  `,
  styles: [
    `
      .lb-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid currentColor;
        border-top-color: transparent;
        animation: lb-spin 0.7s linear infinite;
        flex-shrink: 0;
      }
      .lb-text {
        opacity: 0.7;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      @keyframes lb-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingBtnComponent {
  @Input() label = 'Save';
  @Input() loadingLabel = '';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() btnClass = 'btn-primary btn-sm';
  @Output() clicked = new EventEmitter<void>();
}
