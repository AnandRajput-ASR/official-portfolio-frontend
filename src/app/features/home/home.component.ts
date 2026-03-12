import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { LoadingService } from '../../core/services/loading.service';
import { MessagesService } from '../../core/services/messages.service';
import { ResumeService, ResumeInfo } from '../../core/services/resume.service';
import { ThemeService } from '../../core/services/theme.service';
import { PortfolioContent } from '../../core/models/portfolio.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  content: PortfolioContent | null = null;
  loading = true;
  apiError = false;
  resumeInfo: ResumeInfo | null = null;
  mobileMenuOpen = false;
  openCompanies = new Set<string>();
  activeBlogPost: string | null = null;
  otwDismissed = false;
  private destroyed = false;
  private scrollHandler: (() => void) | null = null;
  private observers: IntersectionObserver[] = [];

  // Contact form
  contactForm = { name: '', email: '', message: '' };
  contactSending = false;
  contactSuccess = false;
  contactError = '';

  @ViewChildren('revealEl') revealEls!: QueryList<ElementRef>;

  // Testimonial submission form
  testiSubmitForm = { name: '', role: '', company: '', quote: '', rating: 5 };
  testiSubmitting = false;
  testiSubmitSuccess = false;
  testiSubmitError = '';
  showTestiSubmitForm = false;

  constructor(
    public contentService: ContentService,
    private messagesService: MessagesService,
    private router: Router,
    public resumeService: ResumeService,
    public themeService: ThemeService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.loadingService.start('home-content');
    this.contentService.getAll().subscribe({
      next: (data) => {
        this.content = data;
        this.loading = false;
        this.refreshCaches();
        this.loadingService.stop('home-content');
        // Track page view
        this.contentService.trackEvent('pageView');
      },
      error: () => {
        this.loading = false;
        this.apiError = true;
        this.loadingService.stop('home-content');
      },
    });
    this.resumeService.getInfo().subscribe({
      next: (info) => (this.resumeInfo = info),
      error: () => {},
    });
  }

  ngAfterViewInit(): void {
    this.setupScrollReveal();
    this.setupCounters();
    this.scrollHandler = () => {
      if (this.destroyed) return;
      const nav = document.getElementById('mainNav');
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    // Track contact section view
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.contentService.trackEvent('contactView');
            io.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      io.observe(contactEl);
    }
  }

  dismissOtw(): void {
    this.otwDismissed = true;
  }

  navigateToBlog(slug: string): void {
    this.router.navigate(['/blog', slug]);
  }

  submitPublicTestimonial(): void {
    if (!this.testiSubmitForm.name || !this.testiSubmitForm.quote) {
      this.testiSubmitError = 'Name and your testimonial are required.';
      return;
    }
    this.testiSubmitting = true;
    this.testiSubmitError = '';
    this.contentService.submitTestimonial(this.testiSubmitForm).subscribe({
      next: () => {
        this.testiSubmitting = false;
        this.testiSubmitSuccess = true;
        this.testiSubmitForm = { name: '', role: '', company: '', quote: '', rating: 5 };
        setTimeout(() => {
          this.testiSubmitSuccess = false;
          this.showTestiSubmitForm = false;
        }, 5000);
      },
      error: (err) => {
        this.testiSubmitting = false;
        this.testiSubmitError = err.error?.message || 'Submission failed. Please try again.';
      },
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleCompany(id: string): void {
    if (this.openCompanies.has(id)) this.openCompanies.delete(id);
    else this.openCompanies.add(id);
  }
  isCompanyOpen(id: string): boolean {
    return this.openCompanies.has(id);
  }

  trackProjectClick(projectId: string): void {
    this.contentService.trackEvent('projectClick', projectId);
  }

  trackResumeDownload(): void {
    this.contentService.trackEvent('resumeDownload');
  }

  toggleBlogPost(id: string): void {
    this.activeBlogPost = this.activeBlogPost === id ? null : id;
  }

  private _visibleTestis: any[] = [];
  private _publishedPosts: any[] = [];

  visibleTestimonials() {
    return this._visibleTestis;
  }
  publishedPosts() {
    return this._publishedPosts;
  }

  private refreshCaches(): void {
    this._visibleTestis = (this.content?.testimonials || []).filter((t) => t.visible);
    this._publishedPosts = (this.content?.blogPosts || []).filter((p) => p.published);
  }

  tickerItems(): string[] {
    return (
      this.content?.siteSettings?.ticker?.items || [
        'Angular',
        'TypeScript',
        'Azure DevOps',
        'Node.js',
        'AWS Lambda',
        'RxJS',
        'NgRx',
        'PostgreSQL',
        'Cosmos DB',
        'AZ-400 Expert',
        'CI/CD Pipelines',
      ]
    );
  }

  stars(n: number): number[] {
    return Array(n).fill(0);
  }

  private setupScrollReveal(): void {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
              // Animate skill proficiency bar
              const bar = entry.target.querySelector('.sk-prof-fill') as HTMLElement;
              if (bar) setTimeout(() => (bar.style.width = bar.dataset['width'] || '80%'), 200);
            }, i * 80);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    }, 100);
  }

  private setupCounters(): void {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = +(el.dataset['target'] || 0);
            const suffix = el.dataset['suffix'] || '';
            let current = 0;
            const inc = target / 40;
            const timer = setInterval(() => {
              current += inc;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = Math.floor(current) + suffix;
            }, 40);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );
    setTimeout(() => {
      document.querySelectorAll('.stat-num[data-target]').forEach((el) => io.observe(el));
    }, 100);
  }

  sendMessage(): void {
    const { name, email, message } = this.contactForm;
    if (!name || !email || !message) {
      this.contactError = 'Please fill in all fields.';
      return;
    }
    this.contactSending = true;
    this.contactError = '';
    this.messagesService.sendMessage(this.contactForm).subscribe({
      next: () => {
        this.contactSending = false;
        this.contactSuccess = true;
        this.contactForm = { name: '', email: '', message: '' };
        this.contentService.trackEvent('contactSubmit');
        setTimeout(() => (this.contactSuccess = false), 6000);
      },
      error: (err) => {
        this.contactSending = false;
        this.contactError = err.error?.message || 'Failed to send. Please try again.';
      },
    });
  }

  retryLoad(): void {
    this.apiError = false;
    this.loading = true;
    this.loadingService.start('home-content');
    this.contentService.getAll().subscribe({
      next: (data) => {
        this.content = data;
        this.loading = false;
        this.apiError = false;
        this.refreshCaches();
        this.loadingService.stop('home-content');
        this.contentService.trackEvent('pageView');
      },
      error: () => {
        this.loading = false;
        this.apiError = true;
        this.loadingService.stop('home-content');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    this.observers.forEach((io) => io.disconnect());
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
