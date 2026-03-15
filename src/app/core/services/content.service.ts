import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Analytics,
  BlogPost,
  Certification,
  Company,
  CompanyProject,
  Experience,
  Hero,
  PersonalProject,
  PortfolioContent,
  SiteSettings,
  Skill,
  Stat,
  Testimonial,
} from '../models/portfolio.model';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private base = environment.api.baseUrl + '/content';
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  /** Resolve a stored image value to a full URL.
   *  Handles: /uploads/... paths (from new file storage) and legacy data: base64 */
  getImageUrl(val: string | undefined): string {
    if (!val) return '';
    if (val.startsWith('data:') || val.startsWith('http')) return val;
    return environment.assets.baseUrl + val;
  }

  getAll(): Observable<PortfolioContent> {
    return this.http.get<PortfolioContent>(this.base + '/page-content');
  }
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.base + '/hero', hero);
  }

  // Companies

  // Personal Projects

  // Experience

  // Stats

  // Certifications

  // Settings
  getSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings>(this.base + '/settings');
  }

  // Testimonials (admin: all + pending)
  submitTestimonial(t: Partial<Testimonial>): Observable<any> {
    return this.http.post(environment.api.baseUrl + '/admin' + '/testimonials/submit', t);
  }

  // Blog

  // Analytics

  trackEvent(event: string, projectId?: string): void {
    this.http
      .post(this.base + '/analytics/track', { event, projectId })
      .subscribe({ error: () => {} });
  }

  // Image upload (returns { url: '/uploads/filename.ext' })
  uploadImage(fileName: string, fileData: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(this.base + '/upload-image', { fileName, fileData });
  }

  // Reorder
  reorder(section: string, items: { id: string; displayOrder: number }[]): Observable<any> {
    return this.http.put(this.base + '/reorder/' + section, items);
  }
}
