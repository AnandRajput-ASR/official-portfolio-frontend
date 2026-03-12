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
    return this.http.get<PortfolioContent>(this.base);
  }
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.base + '/hero', hero);
  }

  // Skills
  updateSkills(s: Skill[]): Observable<any> {
    return this.http.put(this.base + '/skills', s);
  }
  addSkill(s: Skill): Observable<any> {
    return this.http.post(this.base + '/skills', s);
  }
  deleteSkill(id: string): Observable<any> {
    return this.http.delete(this.base + '/skills/' + id);
  }

  // Companies
  updateCompanies(c: Company[]): Observable<any> {
    return this.http.put(this.base + '/companies', c);
  }
  addCompany(c: Partial<Company>): Observable<any> {
    return this.http.post(this.base + '/companies', c);
  }
  deleteCompany(id: string): Observable<any> {
    return this.http.delete(this.base + '/companies/' + id);
  }
  addCompanyProject(coId: string, p: Partial<CompanyProject>): Observable<any> {
    return this.http.post(`${this.base}/companies/${coId}/projects`, p);
  }
  deleteCompanyProject(coId: string, pid: string): Observable<any> {
    return this.http.delete(`${this.base}/companies/${coId}/projects/${pid}`);
  }

  // Personal Projects
  updatePersonalProjects(p: PersonalProject[]): Observable<any> {
    return this.http.put(this.base + '/personal-projects', p);
  }
  addPersonalProject(p: Partial<PersonalProject>): Observable<any> {
    return this.http.post(this.base + '/personal-projects', p);
  }
  deletePersonalProject(id: string): Observable<any> {
    return this.http.delete(this.base + '/personal-projects/' + id);
  }

  // Experience
  updateExperience(e: Experience[]): Observable<any> {
    return this.http.put(this.base + '/experience', e);
  }
  addExperience(e: Experience): Observable<any> {
    return this.http.post(this.base + '/experience', e);
  }
  deleteExperience(id: string): Observable<any> {
    return this.http.delete(this.base + '/experience/' + id);
  }

  // Stats
  updateStats(s: Stat[]): Observable<any> {
    return this.http.put(this.base + '/stats', s);
  }

  // Certifications
  updateCertifications(c: Certification[]): Observable<any> {
    return this.http.put(this.base + '/certifications', c);
  }
  addCertification(c: Partial<Certification>): Observable<any> {
    return this.http.post(this.base + '/certifications', c);
  }
  deleteCertification(id: string): Observable<any> {
    return this.http.delete(this.base + '/certifications/' + id);
  }

  // Settings
  getSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings>(this.base + '/settings');
  }
  updateSettings(s: Partial<SiteSettings>): Observable<any> {
    return this.http.put(this.base + '/settings', s);
  }

  // Testimonials (admin: all + pending)
  getAllTestimonials(): Observable<{ approved: Testimonial[]; pending: Testimonial[] }> {
    return this.http.get<{ approved: Testimonial[]; pending: Testimonial[] }>(
      this.base + '/testimonials/all',
    );
  }
  updateTestimonials(t: Testimonial[]): Observable<any> {
    return this.http.put(this.base + '/testimonials', t);
  }
  addTestimonial(t: Partial<Testimonial>): Observable<any> {
    return this.http.post(this.base + '/testimonials', t);
  }
  updateTestimonial(id: string, d: Partial<Testimonial>): Observable<any> {
    return this.http.put(this.base + '/testimonials/' + id, d);
  }
  deleteTestimonial(id: string): Observable<any> {
    return this.http.delete(this.base + '/testimonials/' + id);
  }
  submitTestimonial(t: Partial<Testimonial>): Observable<any> {
    return this.http.post(this.base + '/testimonials/submit', t);
  }
  approveTestimonial(id: string): Observable<any> {
    return this.http.put(`${this.base}/testimonials/pending/${id}/approve`, {});
  }
  rejectTestimonial(id: string): Observable<any> {
    return this.http.put(`${this.base}/testimonials/pending/${id}/reject`, {});
  }
  deletePendingTestimonial(id: string): Observable<any> {
    return this.http.delete(`${this.base}/testimonials/pending/${id}`);
  }

  // Blog
  updateBlogPosts(p: BlogPost[]): Observable<any> {
    return this.http.put(this.base + '/blog', p);
  }
  addBlogPost(p: Partial<BlogPost>): Observable<any> {
    return this.http.post(this.base + '/blog', p);
  }
  updateBlogPost(id: string, d: Partial<BlogPost>): Observable<any> {
    return this.http.put(this.base + '/blog/' + id, d);
  }
  deleteBlogPost(id: string): Observable<any> {
    return this.http.delete(this.base + '/blog/' + id);
  }

  // Analytics
  getAnalytics(): Observable<Analytics> {
    return this.http.get<Analytics>(this.base + '/analytics');
  }
  resetAnalytics(): Observable<any> {
    return this.http.delete(this.base + '/analytics/reset');
  }
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
  reorder(section: string, items: { id: string; order: number }[]): Observable<any> {
    return this.http.put(this.base + '/reorder/' + section, items);
  }
}
