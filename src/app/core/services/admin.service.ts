import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
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
} from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  private base = environment.api.baseUrl + '/admin';

  getAll(): Observable<PortfolioContent> {
    return this.http.get<PortfolioContent>(this.base + '/page-content');
  }

  updateHeroSection(heroContent: Hero): Observable<any> {
    return this.http.put(this.base + '/heroSection', heroContent);
  }

  updateSkills(s: Skill[]): Observable<any> {
    return this.http.put(this.base + '/skills', s);
  }

  addSkill(s: Skill): Observable<any> {
    return this.http.post(this.base + '/skills', s);
  }

  deleteSkill(id: string): Observable<any> {
    return this.http.delete(this.base + '/skills/' + id);
  }

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

  deleteCompanyProject(pid: string): Observable<any> {
    return this.http.delete(`${this.base}/projects/${pid}`);
  }

  updatePersonalProjects(p: PersonalProject[]): Observable<any> {
    return this.http.put(this.base + '/personal-projects', p);
  }

  addPersonalProject(p: Partial<PersonalProject>): Observable<any> {
    return this.http.post(this.base + '/personal-projects', p);
  }

  deletePersonalProject(id: string): Observable<any> {
    return this.http.delete(this.base + '/personal-projects/' + id);
  }

  updateExperience(e: Experience[]): Observable<any> {
    return this.http.put(this.base + '/experience', e);
  }

  addExperience(e: Experience): Observable<any> {
    return this.http.post(this.base + '/experience', e);
  }

  deleteExperience(id: string): Observable<any> {
    return this.http.delete(this.base + '/experience/' + id);
  }

  updateStats(s: Stat[]): Observable<any> {
    return this.http.put(this.base + '/stats', s);
  }

  updateCertifications(c: Certification[]): Observable<any> {
    return this.http.put(this.base + '/certifications', c);
  }

  addCertification(c: Partial<Certification>): Observable<any> {
    return this.http.post(this.base + '/certifications', c);
  }

  deleteCertification(id: string): Observable<any> {
    return this.http.delete(this.base + '/certifications/' + id);
  }

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

  approveTestimonial(id: string): Observable<any> {
    return this.http.put(`${this.base}/testimonials/pending/${id}/approve`, {});
  }

  rejectTestimonial(id: string): Observable<any> {
    return this.http.put(`${this.base}/testimonials/pending/${id}/reject`, {});
  }

  deletePendingTestimonial(id: string): Observable<any> {
    return this.http.delete(`${this.base}/testimonials/pending/${id}`);
  }

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

  getAnalytics(): Observable<Analytics> {
    return this.http
      .get<{ success: boolean; data: Analytics }>(this.base + '/analytics')
      .pipe(map((r) => r.data));
  }

  resetAnalytics(): Observable<any> {
    return this.http.delete(this.base + '/analytics/reset');
  }

  updateSettings(s: Partial<SiteSettings>): Observable<any> {
    return this.http.put(this.base + '/settings', s);
  }
}
