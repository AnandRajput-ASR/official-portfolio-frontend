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
export class AdminService {
  private base = environment.api.baseUrl + '/admin';
  constructor(
      private http: HttpClient,
      private sanitizer: DomSanitizer,
  ) {}

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
    console.log('Deleting skill with id:', id);
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
}