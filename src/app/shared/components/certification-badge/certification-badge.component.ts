import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Certification } from '@core/models';
import { CertBadgeService } from '@core/services/cert-badge.service';
import { ContentService } from '@core/services/content.service';

@Component({
  selector: 'app-certification-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certification-badge.component.html',
  styleUrls: ['./certification-badge.component.scss'],
})
export class CertificationBadgeComponent {
  @Input({ required: true }) cert: Partial<Certification> = {};
  @Input() previewSrc = '';
  @Input() size = 72;

  private certBadge = inject(CertBadgeService);
  protected contentService = inject(ContentService);

  get resolvedBadgeType(): Certification['badgeType'] {
    const type = this.cert.badgeType;

    if (type === 'auto' || type === 'default') return type;
    if (type === 'upload' && (this.previewSrc || this.cert.badgeLink)) return 'upload';
    if (this.previewSrc || this.cert.badgeLink) return 'upload';

    return this.certBadge.isKnownIssuer(this.cert.issuer || '') ? 'auto' : 'default';
  }

  get accentColor(): string {
    return this.cert.accentColor || this.certBadge.getIssuerColor(this.cert.issuer || '');
  }

  get codeText(): string {
    return this.cert.code || this.cert.name?.substring(0, 8) || 'CODE';
  }

  get uploadSrc(): string {
    const src = this.previewSrc || this.cert.badgeLink || '';
    return this.contentService.getImageUrl(src);
  }

  get altText(): string {
    return this.cert.name || 'Certification badge';
  }

  get issuerLabel(): string {
    return (this.cert.issuer || 'CERT').toUpperCase();
  }

  isIssuer(...names: string[]): boolean {
    const issuer = (this.cert.issuer || '').trim().toLowerCase();
    return names.some((name) => issuer === name.toLowerCase());
  }

  get showIssuerText(): boolean {
    return !this.isIssuer('Microsoft', 'AWS', 'Amazon', 'Google', 'CompTIA');
  }
}
