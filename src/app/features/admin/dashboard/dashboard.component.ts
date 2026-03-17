import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from '@core/services/content.service';
import { AdminService } from '@core/services/admin.service';
import { CertBadgeService } from '@core/services/cert-badge.service';
import { DragListDirective } from '@core/directives/drag-list.directive';
import { AuthService } from '@core/services/auth.service';
import { MessagesService } from '@core/services/messages.service';
import { ResumeService, ResumeInfo, UploadProgress } from '@core/services/resume.service';
import { ThemeService } from '@core/services/theme.service';
import { ToastService } from '@shared/components/toast/toast.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import {
  ConfirmDialogComponent,
  ConfirmConfig,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import {
  PortfolioContent,
  Hero,
  Skill,
  Company,
  CompanyProject,
  PersonalProject,
  Experience,
  Message,
  Certification,
  Testimonial,
  BlogPost,
  SiteSettings,
  Analytics,
  Stat,
} from '@core/models';

type ActiveTab =
  | 'hero'
  | 'skills'
  | 'companies'
  | 'personal'
  | 'experience'
  | 'certifications'
  | 'testimonials'
  | 'blog'
  | 'analytics'
  | 'settings'
  | 'messages'
  | 'resume'
  | 'account'
  | 'stats';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragListDirective, ToastComponent, ConfirmDialogComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  content: PortfolioContent | null = null;
  sidebarOpen = false;
  activeTab: ActiveTab = 'hero';
  saving = false;

  // ── Dirty tracking ────────────────────────────────────────────────────────
  dirtyTabs = new Set<ActiveTab>();
  pendingTab: ActiveTab | null = null;

  // ── Confirm dialog ────────────────────────────────────────────────────────
  confirmVisible = false;
  confirmConfig: ConfirmConfig | null = null;
  private confirmResolve: ((v: boolean) => void) | null = null;

  // ── Editable data ─────────────────────────────────────────────────────────
  heroEdit!: Hero;
  skillsEdit!: Skill[];
  experienceEdit!: Experience[];
  companiesEdit: Company[] = [];
  personalProjectsEdit: PersonalProject[] = [];
  certificationsEdit: Certification[] = [];
  testimonialsEdit: Testimonial[] = [];
  pendingTestimonials: Testimonial[] = [];
  blogEdit: BlogPost[] = [];
  settingsEdit!: SiteSettings;
  analytics: Analytics | null = null;
  analyticsLoading = false;

  // ── Form state ───────────────────────────────────────────────────────────
  expandedCompany: string | null = null;
  showAddCompany = false;
  showAddCompanyProject: string | null = null;
  newCompany: Partial<Company> = this.emptyCompany();
  newCompanyProject: Partial<CompanyProject> = this.emptyCompanyProject();
  showAddPersonal = false;
  newPersonal: Partial<PersonalProject> = this.emptyPersonal();
  showAddSkill = false;
  showAddExp = false;
  newSkill: Partial<Skill> = this.emptySkill();
  newExp: Partial<Experience> = this.emptyExp();
  certificationsFullEdit = false;
  showAddCert = false;
  newCert: Partial<Certification> = this.emptyCert();
  certUploadPreview = '';
  showAddTestimonial = false;
  newTestimonial: Partial<Testimonial> = this.emptyTestimonial();
  testimonialAvatarPreview = '';
  showAddBlog = false;
  editingBlogId: string | null = null;
  newBlog: Partial<BlogPost> = this.emptyBlog();

  // ── Messages ─────────────────────────────────────────────────────────────
  messages: Message[] = [];
  unreadCount = 0;
  messagesLoading = false;
  selectedMessage: Message | null = null;
  messageFilter: 'all' | 'unread' | 'starred' = 'all';

  // ── Resume ────────────────────────────────────────────────────────────────
  resumeInfo: ResumeInfo | null = null;
  resumeDragOver = false;
  uploadProgress = 0;
  uploadState: 'idle' | 'reading' | 'uploading' | 'done' | 'error' = 'idle';
  uploadErrorMsg = '';

  // ── Account ───────────────────────────────────────────────────────────────
  accountForm = { currentPassword: '', newPassword: '', confirmPassword: '', newUsername: '' };
  accountSaving = false;
  forgotTokenResult: string | null = null;
  resetForm = { token: '', newPassword: '', confirm: '' };
  showResetForm = false;

  // ── Stats editing ────────────────────────────────────────────────────────
  statsEdit: Stat[] = [];

  // ── Settings freelance services (editable list) ───────────────────────────
  newFreelanceService = '';

  constructor(
    public contentService: ContentService,
    private adminService: AdminService,
    public auth: AuthService,
    private messagesService: MessagesService,
    public resumeService: ResumeService,
    public themeService: ThemeService,
    public certBadge: CertBadgeService,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.adminService.getAll().subscribe({
      next: (data) => {
        this.content = data;
        this.resetEdits();
      },
      error: () => this.toast.error('Failed to load content'),
    });
    this.loadResumeInfo();
    this.loadPendingTestimonials();
  }

  // ── Tab switching with dirty check ────────────────────────────────────────
  async setTab(tab: ActiveTab): Promise<void> {
    if (tab === this.activeTab) return;
    if (this.dirtyTabs.has(this.activeTab)) {
      const ok = await this.showConfirm({
        title: 'Unsaved Changes',
        message: `You have unsaved changes in <strong>${this.tabLabel(this.activeTab)}</strong>. If you leave now, your edits will be lost.`,
        confirmText: 'Leave Anyway',
        cancelText: 'Stay & Save',
        type: 'warning',
        icon: '⚠️',
      });
      if (!ok) return;
      // User chose to leave — revert that tab's edits back to saved state
      this.revertTab(this.activeTab);
      this.dirtyTabs.delete(this.activeTab);
    }
    this.activeTab = tab;
    if (tab === 'messages') this.loadMessages();
    if (tab === 'analytics') this.loadAnalytics();
  }

  revertTab(tab: ActiveTab): void {
    if (!this.content) return;
    switch (tab) {
      case 'hero':
        this.heroEdit = JSON.parse(JSON.stringify(this.content.hero));
        break;
      case 'skills':
        this.skillsEdit = JSON.parse(JSON.stringify(this.content.skills));
        break;
      case 'companies':
        this.companiesEdit = JSON.parse(JSON.stringify(this.content.companies || []));
        break;
      case 'personal':
        this.personalProjectsEdit = JSON.parse(JSON.stringify(this.content.personalProjects || []));
        break;
      case 'experience':
        this.experienceEdit = JSON.parse(JSON.stringify(this.content.experience));
        break;
      case 'certifications':
        this.certificationsEdit = JSON.parse(JSON.stringify(this.content.certifications || []));
        break;
      case 'testimonials':
        this.testimonialsEdit = JSON.parse(JSON.stringify(this.content.testimonials || []));
        break;
      case 'blog':
        this.blogEdit = JSON.parse(JSON.stringify(this.content.blogPosts || []));
        break;
      case 'settings': // Deep merge with defaults so any missing nested keys are filled in
        const rawSettings = this.content.siteSettings || {};
        const defaults = this.defaultSettings();
        this.settingsEdit = this.mergeWithDefaults(defaults, rawSettings);
        break;
      case 'stats':
        this.statsEdit = JSON.parse(JSON.stringify(this.content.stats || []));
        break;
    }
  }

  tabLabel(tab: ActiveTab): string {
    const map: Record<ActiveTab, string> = {
      hero: 'Hero Section',
      skills: 'Skills',
      companies: 'Work / Companies',
      personal: 'Side Projects',
      experience: 'Timeline',
      certifications: 'Certifications',
      testimonials: 'Testimonials',
      blog: 'Blog',
      analytics: 'Analytics',
      settings: 'Site Settings',
      messages: 'Messages',
      resume: 'Resume',
      account: 'Account',
      stats: 'Stats',
    };
    return map[tab] || tab;
  }

  markDirty(): void {
    this.dirtyTabs.add(this.activeTab);
  }
  clearDirty(): void {
    this.dirtyTabs.delete(this.activeTab);
  }

  /** Toggle a language code in settingsEdit.enabledLanguages. English is always kept. */
  toggleLang(code: string): void {
    const langs: string[] = this.settingsEdit.enabledLanguages ?? ['en', 'hi', 'jp'];
    const idx = langs.indexOf(code);
    if (idx === -1) {
      langs.push(code);
    } else if (code !== 'en') {
      // English cannot be removed — it's the fallback
      langs.splice(idx, 1);
    }
    this.settingsEdit.enabledLanguages = [...langs];
  }

  getDirtyTabsLabel(): string {
    return Array.from(this.dirtyTabs)
      .map((t) => this.tabLabel(t))
      .join(', ');
  }

  @HostListener('window:beforeunload', ['$event'])
  onUnload(e: BeforeUnloadEvent): void {
    if (this.dirtyTabs.size > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  }

  // ── Confirm dialog helper ─────────────────────────────────────────────────
  showConfirm(cfg: ConfirmConfig): Promise<boolean> {
    this.confirmConfig = cfg;
    this.confirmVisible = true;
    return new Promise((resolve) => {
      this.confirmResolve = resolve;
    });
  }
  onConfirmYes(): void {
    this.confirmVisible = false;
    this.confirmResolve?.(true);
  }
  onConfirmNo(): void {
    this.confirmVisible = false;
    this.confirmResolve?.(false);
  }

  resetEdits(): void {
    if (!this.content) return;
    this.heroEdit = JSON.parse(JSON.stringify(this.content.hero));
    this.skillsEdit = JSON.parse(JSON.stringify(this.content.skills));
    this.companiesEdit = JSON.parse(JSON.stringify(this.content.companies || []));
    this.personalProjectsEdit = JSON.parse(JSON.stringify(this.content.personalProjects || []));
    this.experienceEdit = JSON.parse(JSON.stringify(this.content.experience));
    this.certificationsEdit = JSON.parse(JSON.stringify(this.content.certifications || []));
    this.testimonialsEdit = JSON.parse(JSON.stringify(this.content.testimonials || []));
    this.blogEdit = JSON.parse(JSON.stringify(this.content.blogPosts || []));
    // Deep merge with defaults so any missing nested keys are filled in
    const rawSettings = this.content.siteSettings || {};
    const defaults = this.defaultSettings();
    this.settingsEdit = this.mergeWithDefaults(defaults, rawSettings);
    this.statsEdit = JSON.parse(JSON.stringify(this.content.stats || []));
    this.dirtyTabs.clear();
  }

  /** Deep-merge: fill in any missing keys from defaults into the loaded settings */
  mergeWithDefaults<T extends object>(defaults: T, loaded: Partial<T>): T {
    const result = JSON.parse(JSON.stringify(defaults)) as T;
    for (const key of Object.keys(loaded) as (keyof T)[]) {
      const v = loaded[key];
      if (v !== undefined && v !== null) {
        if (
          typeof v === 'object' &&
          !Array.isArray(v) &&
          typeof result[key] === 'object' &&
          !Array.isArray(result[key])
        ) {
          (result as any)[key] = this.mergeWithDefaults(result[key] as object, v as object);
        } else {
          result[key] = JSON.parse(JSON.stringify(v)) as T[keyof T];
        }
      }
    }
    return result;
  }

  defaultSettings(): SiteSettings {
    return {
      openToWork: false,
      openToWorkText: 'Open to Freelance',
      sections: {
        testimonials: true,
        blog: true,
        analytics: true,
        skills: true,
        certifications: true,
        personalProjects: true,
        experience: true,
        about: true,
        hero: true,
        stats: true,
        companies: true,
        contact: true,
        footer: true,
        ticker: true,
        resumeBanner: true,
      },
      freelance: {
        enabled: false,
        ctaTitle: 'Got a project in mind?',
        ctaSubtitle:
          'I take on Angular development, cloud integrations, and DevOps consulting projects.',
        services: ['Angular SPA Development', 'Azure Cloud Setup', 'CI/CD Pipeline Design'],
        showInHero: true,
        showInAbout: true,
        showCtaSection: true,
        showInContact: true,
      },
      hero: {
        badgeText: 'Available for Freelance · Pune, India',
        ctaPrimary: 'Hire Me →',
        ctaSecondary: 'See My Work',
        pills: [],
        cardTitle: '@ Accenture · Pune',
        cardStatusText: 'Open to work',
        cardStats: [
          { value: '5+', label: 'Years' },
          { value: '4', label: 'Azure Certs' },
          { value: '4', label: 'Projects' },
        ],
        cardSkills: ['Angular', 'TypeScript', 'Node.js', 'Azure DevOps', 'AWS', 'PostgreSQL'],
      },
      about: {
        heading: 'I build things that enterprises trust.',
        paragraphs: [],
        accentureBadge: {
          company: 'Accenture',
          role: 'Packaged App Development Analyst',
          period: 'Jan 2021 – Present · Pune, India',
          award: '🏆 2× Star of the Month',
        },
      },
      ticker: {
        items: [
          'Angular',
          'TypeScript',
          'Azure DevOps',
          'Node.js',
          'AWS Lambda',
          'RxJS',
          'NgRx',
          'PostgreSQL',
          'AZ-400 Expert',
          'CI/CD Pipelines',
        ],
      },
      contact: {
        heading: "Let's build<br><span>something great</span><br>together.",
        successMessage: "Message sent! I'll get back to you shortly.",
      },
      footer: {
        text: 'Anand Rajput — Angular Developer & Azure Engineer',
        copy: '© 2026 · Pune, India · Built with Angular & Node.js',
      },
      nav: { logoText: 'AR', showResume: true },
      siteUrl: 'https://anandrajput.dev',
      resumeProtected: false,
      enabledLanguages: ['en', 'hi', 'jp'],
      learning: {
        enabled: false,
        items: [
          { label: 'Designing Distributed Systems', icon: '📚', type: 'book' },
          { label: 'AWS Solutions Architect', icon: '🎓', type: 'course' },
          { label: 'Rust', icon: '⚙️', type: 'tech' },
        ],
      },
    };
  }

  // ── HERO ──────────────────────────────────────────────────────────────────
  saveHero(): void {
    this.saving = true;
    const payload = { ...this.heroEdit, updated_at: Date.now() };
    this.adminService.updateHeroSection(payload).subscribe({
      next: (res) => {
        this.content!.hero = res.data ?? this.heroEdit;
        this.saving = false;
        this.clearDirty();
        this.toast.success('Hero saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }

  // ── SKILLS ────────────────────────────────────────────────────────────────
  saveSkills(): void {
    this.saving = true;
    this.adminService.updateSkills(this.skillsEdit).subscribe({
      next: () => {
        this.content!.skills = JSON.parse(JSON.stringify(this.skillsEdit));
        this.saving = false;
        this.clearDirty();
        this.toast.success('Skills saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }
  addSkillTag(skill: Skill, e: Event): void {
    const v = (e.target as HTMLInputElement).value.trim();
    if (v && !skill.tags.includes(v)) {
      skill.tags.push(v);
      (e.target as HTMLInputElement).value = '';
      this.markDirty();
    }
  }
  removeSkillTag(skill: Skill, tag: string): void {
    skill.tags = skill.tags.filter((t) => t !== tag);
    this.markDirty();
  }
  async deleteSkill(id: string): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Delete Skill',
      message: 'This skill will be permanently removed from your portfolio.',
      confirmText: 'Delete',
      type: 'danger',
      icon: '🗑️',
    });
    if (!ok) return;
    this.skillsEdit = this.skillsEdit.filter((s) => s.id !== id);
    this.adminService.deleteSkill(id).subscribe({
      next: () => {
        this.content!.skills = JSON.parse(JSON.stringify(this.skillsEdit));
        this.toast.success('Skill deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  submitAddSkill(): void {
    const skill: Skill = {
      id: `skill_${Date.now()}`,
      name: this.newSkill.name || '',
      icon: this.newSkill.icon || '⚡',
      accentColor: this.newSkill.accentColor || '#f5a623',
      description: this.newSkill.description || '',
      tags: this.newSkill.tags || [],
      proficiency: this.newSkill.proficiency || 80,
      yearsExp: this.newSkill.yearsExp || '1+',
      displayOrder: this.skillsEdit.length,
    };
    this.adminService.addSkill(skill).subscribe({
      next: (res) => {
        this.skillsEdit.push(res.data || skill);
        this.content!.skills = JSON.parse(JSON.stringify(this.skillsEdit));
        this.showAddSkill = false;
        this.newSkill = this.emptySkill();
        this.toast.success('Skill added!');
      },
      error: () => this.toast.error('Add failed'),
    });
  }

  // ── COMPANIES ─────────────────────────────────────────────────────────────
  toggleExpandCompany(id: string): void {
    this.expandedCompany = this.expandedCompany === id ? null : id;
  }
  saveCompanies(): void {
    this.saving = true;
    this.adminService.updateCompanies(this.companiesEdit).subscribe({
      next: () => {
        this.content!.companies = JSON.parse(JSON.stringify(this.companiesEdit));
        this.saving = false;
        this.clearDirty();
        this.toast.success('Companies saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }
  submitAddCompany(): void {
    this.adminService.addCompany(this.newCompany).subscribe({
      next: (res) => {
        this.companiesEdit.push(res.data);
        this.content!.companies = JSON.parse(JSON.stringify(this.companiesEdit));
        this.showAddCompany = false;
        this.newCompany = this.emptyCompany();
        this.toast.success('Company added!');
      },
      error: () => this.toast.error('Add failed'),
    });
  }
  async deleteCompany(id: string): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Delete Company',
      message:
        'This will permanently delete the company <strong>and all its projects</strong>. This cannot be undone.',
      confirmText: 'Delete All',
      type: 'danger',
      icon: '⚠️',
    });
    if (!ok) return;
    this.adminService.deleteCompany(id).subscribe({
      next: () => {
        this.companiesEdit = this.companiesEdit.filter((c) => c.id !== id);
        this.content!.companies = JSON.parse(JSON.stringify(this.companiesEdit));
        this.toast.success('Company deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  submitAddCompanyProject(companyId: string): void {
    this.adminService.addCompanyProject(companyId, this.newCompanyProject).subscribe({
      next: (res) => {
        const co = this.companiesEdit.find((c) => c.id === companyId);
        if (co) co.projects.push(res.data);
        this.content!.companies = JSON.parse(JSON.stringify(this.companiesEdit));
        this.showAddCompanyProject = null;
        this.newCompanyProject = this.emptyCompanyProject();
        this.toast.success('Project added!');
      },
      error: () => this.toast.error('Add failed'),
    });
  }
  async deleteCompanyProject(companyId: string, projectId: string): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Delete Project',
      message: 'Are you sure you want to remove this project from the company?',
      confirmText: 'Delete Project',
      type: 'danger',
      icon: '🗑️',
    });
    if (!ok) return;
    this.adminService.deleteCompanyProject(projectId).subscribe({
      next: () => {
        const co = this.companiesEdit.find((c) => c.id === companyId);
        if (co) co.projects = co.projects.filter((p) => p.id !== projectId);
        this.content!.companies = JSON.parse(JSON.stringify(this.companiesEdit));
        this.toast.success('Project deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  addCompanyProjectTech(project: CompanyProject, e: Event): void {
    const v = (e.target as HTMLInputElement).value.trim();
    if (v && !project.tech.includes(v)) {
      project.tech.push(v);
      (e.target as HTMLInputElement).value = '';
    }
  }
  removeCompanyProjectTech(p: CompanyProject, tech: string): void {
    p.tech = p.tech.filter((t) => t !== tech);
  }

  // ── PERSONAL PROJECTS ────────────────────────────────────────────────────
  savePersonalProjects(): void {
    this.saving = true;
    this.adminService.updatePersonalProjects(this.personalProjectsEdit).subscribe({
      next: () => {
        this.content!.personalProjects = JSON.parse(JSON.stringify(this.personalProjectsEdit));
        this.saving = false;
        this.clearDirty();
        this.toast.success('Projects saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }
  submitAddPersonal(): void {
    const project: PersonalProject = {
      id: 'pp_' + Date.now(),
      title: this.newPersonal.title || '',
      description: this.newPersonal.description || '',
      tech: this.newPersonal.tech || [],
      githubUrl: this.newPersonal.githubUrl || '#',
      liveUrl: this.newPersonal.liveUrl || '#',
      status: (this.newPersonal.status as any) || 'wip',
      type: (this.newPersonal.type as any) || 'personal',
      featured: this.newPersonal.featured || false,
      year: this.newPersonal.year || String(new Date().getFullYear()),
      displayOrder: this.personalProjectsEdit.length,
    };
    this.adminService.addPersonalProject(project).subscribe({
      next: (res) => {
        this.personalProjectsEdit.push(res.data);
        this.content!.personalProjects = JSON.parse(JSON.stringify(this.personalProjectsEdit));
        this.showAddPersonal = false;
        this.newPersonal = this.emptyPersonal();
        this.toast.success('Project added!');
      },
      error: () => this.toast.error('Add failed'),
    });
  }
  async deletePersonalProject(id: string): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this personal project?',
      confirmText: 'Delete',
      type: 'danger',
      icon: '🗑️',
    });
    if (!ok) return;
    this.adminService.deletePersonalProject(id).subscribe({
      next: () => {
        this.personalProjectsEdit = this.personalProjectsEdit.filter((p) => p.id !== id);
        this.content!.personalProjects = JSON.parse(JSON.stringify(this.personalProjectsEdit));
        this.toast.success('Project deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  addPersonalTech(project: PersonalProject | Partial<PersonalProject>, e: Event): void {
    const v = (e.target as HTMLInputElement).value.trim();
    if (!project.tech) project.tech = [];
    if (v && !project.tech.includes(v)) {
      project.tech.push(v);
      (e.target as HTMLInputElement).value = '';
    }
  }
  removePersonalTech(project: PersonalProject | Partial<PersonalProject>, tech: string): void {
    if (project.tech) project.tech = project.tech.filter((t) => t !== tech);
  }

  // ── EXPERIENCE ───────────────────────────────────────────────────────────
  saveExperience(): void {
    this.saving = true;
    this.adminService.updateExperience(this.experienceEdit).subscribe({
      next: () => {
        this.content!.experience = JSON.parse(JSON.stringify(this.experienceEdit));
        this.saving = false;
        this.clearDirty();
        this.toast.success('Experience saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }
  async deleteExperience(id: string): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Delete Entry',
      message: 'Remove this experience/education entry from the timeline?',
      confirmText: 'Delete',
      type: 'danger',
      icon: '🗑️',
    });
    if (!ok) return;
    this.adminService.deleteExperience(id).subscribe({
      next: () => {
        this.experienceEdit = this.experienceEdit.filter((e) => e.id !== id);
        this.content!.experience = JSON.parse(JSON.stringify(this.experienceEdit));
        this.toast.success('Entry deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  submitAddExp(): void {
    const exp: Experience = {
      id: `exp_${Date.now()}`,
      period: this.newExp.period || '',
      role: this.newExp.role || '',
      company: this.newExp.company || '',
      location: this.newExp.location || '',
      description: this.newExp.description || '',
      displayOrder: this.experienceEdit.length,
    };
    this.adminService.addExperience(exp).subscribe({
      next: (res) => {
        this.experienceEdit.push(res.data);
        this.content!.experience = JSON.parse(JSON.stringify(this.experienceEdit));
        this.showAddExp = false;
        this.newExp = this.emptyExp();
        this.toast.success('Experience added!');
      },
      error: () => this.toast.error('Add failed'),
    });
  }

  // ── MESSAGES ─────────────────────────────────────────────────────────────
  loadMessages(): void {
    this.messagesLoading = true;
    this.messagesService.getMessages().subscribe({
      next: (res) => {
        this.messages = res.messages;
        this.unreadCount = res.unreadCount;
        this.messagesLoading = false;
      },
      error: () => {
        this.messagesLoading = false;
        this.toast.error('Failed to load messages');
      },
    });
  }
  get filteredMessages(): Message[] {
    if (this.messageFilter === 'unread') return this.messages.filter((m) => !m.read);
    if (this.messageFilter === 'starred') return this.messages.filter((m) => m.starred);
    return this.messages;
  }
  openMessage(msg: Message): void {
    this.selectedMessage = msg;
    if (!msg.read) {
      this.messagesService.markRead(msg.id).subscribe(() => {
        msg.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }
  closeMessage(): void {
    this.selectedMessage = null;
  }
  toggleStar(msg: Message, e: Event): void {
    e.stopPropagation();
    this.messagesService.toggleStar(msg.id).subscribe(() => {
      msg.starred = !msg.starred;
    });
  }
  async deleteMessage(id: string, e?: Event): Promise<void> {
    if (e) e.stopPropagation();
    const ok = await this.showConfirm({
      title: 'Delete Message',
      message: 'This message will be permanently deleted.',
      confirmText: 'Delete',
      type: 'danger',
      icon: '🗑️',
    });
    if (!ok) return;
    this.messagesService.deleteMessage(id).subscribe({
      next: () => {
        this.messages = this.messages.filter((m) => m.id !== id);
        if (this.selectedMessage?.id === id) this.selectedMessage = null;
        this.toast.success('Message deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  markAllRead(): void {
    this.messagesService.markAllRead().subscribe({
      next: () => {
        this.messages.forEach((m) => (m.read = true));
        this.unreadCount = 0;
        this.toast.success('All marked read');
      },
    });
  }
  getUnreadCount(): number {
    return this.messages.filter((m) => !m.read).length;
  }
  getStarredCount(): number {
    return this.messages.filter((m) => m.starred).length;
  }
  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso),
      now = new Date();
    const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ── RESUME ────────────────────────────────────────────────────────────────
  loadResumeInfo(): void {
    this.resumeService.getInfo().subscribe({ next: (i) => (this.resumeInfo = i), error: () => {} });
  }
  onResumeFileSelected(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) this.uploadResume(f);
    (e.target as HTMLInputElement).value = '';
  }
  onResumeDrop(e: DragEvent): void {
    e.preventDefault();
    this.resumeDragOver = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) this.uploadResume(f);
  }
  uploadResume(file: File): void {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.toast.error('Only PDF files allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('Max 10MB allowed.');
      return;
    }
    this.uploadState = 'reading';
    this.uploadProgress = 0;
    this.uploadErrorMsg = '';
    this.resumeService.uploadResumeWithProgress(file, this.auth.getToken() || '').subscribe({
      next: (ev: UploadProgress) => {
        if (ev.type === 'progress') {
          this.uploadState = 'uploading';
          this.uploadProgress = ev.percent ?? 0;
        } else if (ev.type === 'complete') {
          this.uploadState = 'done';
          this.uploadProgress = 100;
          this.loadResumeInfo();
          this.toast.success('Resume uploaded!');
          setTimeout(() => {
            this.uploadState = 'idle';
            this.uploadProgress = 0;
          }, 2500);
        } else if (ev.type === 'error') {
          this.uploadState = 'error';
          this.uploadErrorMsg = ev.error || 'Upload failed';
          this.toast.error(this.uploadErrorMsg);
        }
      },
    });
  }
  async deleteResume(): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Remove Resume',
      message: 'Visitors will no longer see a download button. You can re-upload at any time.',
      confirmText: 'Remove',
      type: 'warning',
      icon: '📄',
    });
    if (!ok) return;
    this.resumeService.deleteResume().subscribe({
      next: () => {
        this.resumeInfo = { available: false };
        this.toast.success('Resume removed.');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }

  // ── CERTIFICATIONS ────────────────────────────────────────────────────────
  saveCertifications(): void {
    this.saving = true;
    this.adminService.updateCertifications(this.certificationsEdit).subscribe({
      next: () => {
        this.content!.certifications = JSON.parse(JSON.stringify(this.certificationsEdit));
        this.saving = false;
        this.clearDirty();
        this.toast.success('Certifications saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }
  submitAddCert(): void {
    const cert: Certification = {
      id: `cert_${Date.now()}`,
      name: this.newCert.name || '',
      code: this.newCert.code || '',
      issuer: this.newCert.issuer || '',
      level: this.newCert.level || 'Associate',
      credlyLink: this.newCert.credlyLink || '',
      badgeLink: this.certUploadPreview || this.newCert.badgeLink || '',
      badgeType: (this.newCert.badgeType || 'auto') as any,
      accentColor: this.newCert.accentColor || '#0078d4',
      issueYear: this.newCert.issueYear || String(new Date().getFullYear()),
      expirationYear: '',
      displayOrder: this.certificationsEdit.length,
    };
    this.adminService.addCertification(cert).subscribe({
      next: (res) => {
        this.certificationsEdit.push(res.data);
        this.content!.certifications = JSON.parse(JSON.stringify(this.certificationsEdit));
        this.showAddCert = false;
        this.newCert = this.emptyCert();
        this.certUploadPreview = '';
        this.toast.success('Certification added!');
      },
      error: () => this.toast.error('Add failed'),
    });
  }
  async deleteCert(id: string): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Delete Certification',
      message: 'Remove this certification from your portfolio?',
      confirmText: 'Delete',
      type: 'danger',
      icon: '🏅',
    });
    if (!ok) return;
    this.adminService.deleteCertification(id).subscribe({
      next: () => {
        this.certificationsEdit = this.certificationsEdit.filter((c) => c.id !== id);
        this.content!.certifications = JSON.parse(JSON.stringify(this.certificationsEdit));
        this.toast.success('Certification deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  onCertBadgeUpload(cert: Partial<Certification>, e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      // Show preview immediately
      if (cert === this.newCert) this.certUploadPreview = dataUrl;
      // Upload to server → store URL path instead of base64
      this.contentService.uploadImage(file.name, base64).subscribe({
        next: ({ url }) => {
          cert.badgeLink = url;
          if (cert === this.newCert) this.certUploadPreview = url;
        },
        error: () => {
          cert.badgeLink = dataUrl;
        }, // fallback to base64 if upload fails
      });
    };
    reader.readAsDataURL(file);
  }
  setBadgeType(cert: Partial<Certification>, type: 'auto' | 'upload' | 'default'): void {
    cert.badgeType = type;
    if (type !== 'upload') cert.badgeLink = '';
    const idx = this.certificationsEdit.findIndex((c) => c.id === cert.id);
    if (idx !== -1)
      this.certificationsEdit[idx] = {
        ...this.certificationsEdit[idx],
        badgeType: type,
        badgeLink: type !== 'upload' ? '' : cert.badgeLink || '',
      };
  }
  onIssuerChange(cert: Partial<Certification>): void {
    if (!cert.accentColor || cert.accentColor === '#f5a623')
      cert.accentColor = this.certBadge.getIssuerColor(cert.issuer || '');
    if (this.certBadge.isKnownIssuer(cert.issuer || '')) {
      if (cert.badgeType !== 'upload') cert.badgeType = 'auto';
    } else {
      if (cert.badgeType === 'auto') cert.badgeType = 'default';
    }
  }

  // ── TESTIMONIALS ──────────────────────────────────────────────────────────
  loadPendingTestimonials(): void {
    this.adminService.getAllTestimonials().subscribe({
      next: (res) => {
        this.testimonialsEdit = res.approved;
        this.pendingTestimonials = res.pending;
      },
      error: () => {},
    });
  }
  saveTestimonials(): void {
    this.saving = true;
    this.adminService.updateTestimonials(this.testimonialsEdit).subscribe({
      next: () => {
        this.content!.testimonials = JSON.parse(JSON.stringify(this.testimonialsEdit));
        this.saving = false;
        this.clearDirty();
        this.toast.success('Testimonials saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }
  toggleTestimonialVisible(t: Testimonial): void {
    t.visible = !t.visible;
    this.adminService.updateTestimonial(t.id, { visible: t.visible }).subscribe({
      next: () =>
        this.toast.success(t.visible ? 'Now visible on portfolio' : 'Hidden from portfolio'),
      error: () => this.toast.error('Toggle failed'),
    });
  }
  submitAddTestimonial(): void {
    const t: Testimonial = {
      id: 't_' + Date.now(),
      name: this.newTestimonial.name || '',
      role: this.newTestimonial.role || '',
      company: this.newTestimonial.company || '',
      avatar: this.testimonialAvatarPreview || '',
      quote: this.newTestimonial.quote || '',
      rating: this.newTestimonial.rating || 5,
      visible: true,
      displayOrder: this.testimonialsEdit.length,
      status: 'approved',
    };
    this.adminService.addTestimonial(t).subscribe({
      next: (res) => {
        this.testimonialsEdit.push(res.data || t);
        this.content!.testimonials = JSON.parse(JSON.stringify(this.testimonialsEdit));
        this.showAddTestimonial = false;
        this.newTestimonial = this.emptyTestimonial();
        this.testimonialAvatarPreview = '';
        this.toast.success('Testimonial added!');
      },
      error: () => this.toast.error('Add failed'),
    });
  }
  async deleteTestimonial(id: string): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Delete Testimonial',
      message: 'Are you sure you want to permanently delete this testimonial?',
      confirmText: 'Delete',
      type: 'danger',
      icon: '💬',
    });
    if (!ok) return;
    this.adminService.deleteTestimonial(id).subscribe({
      next: () => {
        this.testimonialsEdit = this.testimonialsEdit.filter((t) => t.id !== id);
        this.content!.testimonials = JSON.parse(JSON.stringify(this.testimonialsEdit));
        this.toast.success('Testimonial deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  approveTestimonial(t: Testimonial): void {
    this.adminService.approveTestimonial(t.id).subscribe({
      next: (res) => {
        this.pendingTestimonials = this.pendingTestimonials.filter((p) => p.id !== t.id);
        this.testimonialsEdit.push({ ...t, ...(res.data || {}) });
        this.toast.success(`Approved! "${t.name}" is now visible.`);
      },
      error: () => this.toast.error('Approve failed'),
    });
  }
  rejectTestimonial(t: Testimonial): void {
    this.adminService.rejectTestimonial(t.id).subscribe({
      next: () => {
        t.status = 'rejected';
        this.toast.info(`"${t.name}" marked as rejected.`);
      },
      error: () => this.toast.error('Reject failed'),
    });
  }
  async deletePendingTestimonial(id: string): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Delete Submission',
      message: 'Permanently delete this pending testimonial submission?',
      confirmText: 'Delete',
      type: 'danger',
      icon: '🗑️',
    });
    if (!ok) return;
    this.adminService.deletePendingTestimonial(id).subscribe({
      next: () => {
        this.pendingTestimonials = this.pendingTestimonials.filter((t) => t.id !== id);
        this.toast.success('Deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  onAvatarUpload(t: Partial<Testimonial>, e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      if (t === this.newTestimonial) this.testimonialAvatarPreview = dataUrl;
      this.contentService.uploadImage(file.name, base64).subscribe({
        next: ({ url }) => {
          t.avatar = url;
          if (t === this.newTestimonial) this.testimonialAvatarPreview = url;
        },
        error: () => {
          t.avatar = dataUrl;
        },
      });
    };
    r.readAsDataURL(file);
  }
  ratingStars(n: number): number[] {
    return Array(n).fill(0);
  }

  // ── BLOG ──────────────────────────────────────────────────────────────────
  saveBlog(): void {
    this.saving = true;
    this.adminService.updateBlogPosts(this.blogEdit).subscribe({
      next: () => {
        this.content!.blogPosts = JSON.parse(JSON.stringify(this.blogEdit));
        this.saving = false;
        this.clearDirty();
        this.editingBlogId = null;
        this.toast.success('Blog saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }
  submitAddBlog(): void {
    const post: BlogPost = {
      id: 'b_' + Date.now(),
      title: this.newBlog.title || '',
      slug: (this.newBlog.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      excerpt: this.newBlog.excerpt || '',
      content: this.newBlog.content || '',
      tags: this.newBlog.tags || [],
      coverImage: this.newBlog.coverImage || '',
      published: this.newBlog.published || false,
      publishedAt: this.newBlog.publishedAt || new Date().toISOString().split('T')[0],
      readingTime: this.newBlog.readingTime || 5,
      displayOrder: this.blogEdit.length,
    };
    this.adminService.addBlogPost(post).subscribe({
      next: (res) => {
        this.blogEdit.push(res.data);
        this.content!.blogPosts = JSON.parse(JSON.stringify(this.blogEdit));
        this.showAddBlog = false;
        this.newBlog = this.emptyBlog();
        this.toast.success('Post added!');
      },
      error: () => this.toast.error('Add failed'),
    });
  }
  async deleteBlogPost(id: string): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Delete Blog Post',
      message: 'This article will be permanently deleted and no longer accessible.',
      confirmText: 'Delete Post',
      type: 'danger',
      icon: '✍️',
    });
    if (!ok) return;
    this.adminService.deleteBlogPost(id).subscribe({
      next: () => {
        this.blogEdit = this.blogEdit.filter((p) => p.id !== id);
        this.content!.blogPosts = JSON.parse(JSON.stringify(this.blogEdit));
        this.toast.success('Post deleted');
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
  saveSingleBlog(post: BlogPost): void {
    // Fix #9: keep slug in sync with title
    if (!post.slug || post.slug === '') {
      post.slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    this.saving = true;
    this.adminService.updateBlogPost(post.id, post).subscribe({
      next: () => {
        this.saving = false;
        this.editingBlogId = null;
        this.toast.success(`"${post.title}" saved!`);
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }
  toggleEditBlog(id: string): void {
    this.editingBlogId = this.editingBlogId === id ? null : id;
  }
  viewBlog(slug: string): void {
    window.open('/blog/' + slug, '_blank');
  }
  addBlogTag(p: Partial<BlogPost>, e: Event): void {
    if (!p.tags) p.tags = [];
    const v = (e.target as HTMLInputElement).value.trim();
    if (v && !p.tags.includes(v)) {
      p.tags.push(v);
      (e.target as HTMLInputElement).value = '';
    }
  }
  removeBlogTag(p: Partial<BlogPost>, t: string): void {
    p.tags = (p.tags || []).filter((x) => x !== t);
  }

  // ── ANALYTICS ────────────────────────────────────────────────────────────
  loadAnalytics(): void {
    this.analyticsLoading = true;
    this.adminService.getAnalytics().subscribe({
      next: (res: any) => {
        this.analytics = res.data ?? res;
        this.analyticsLoading = false;
      },
      error: () => {
        this.analyticsLoading = false;
        this.toast.error('Could not load analytics');
      },
    });
  }
  async resetAnalytics(): Promise<void> {
    const ok = await this.showConfirm({
      title: 'Reset Analytics',
      message:
        'All counters — page views, downloads, clicks — will be set back to zero. <br><br>This cannot be undone.',
      confirmText: 'Reset All',
      cancelText: 'Keep Data',
      type: 'warning',
      icon: '📊',
    });
    if (!ok) return;
    this.adminService.resetAnalytics().subscribe({
      next: () => {
        this.loadAnalytics();
        this.toast.success('Analytics reset to zero');
      },
      error: () => this.toast.error('Reset failed'),
    });
  }
  topProjectClicks(): { name: string; clicks: number }[] {
    if (!this.analytics?.projectClicks) return [];
    return Object.entries(this.analytics.projectClicks)
      .map(([name, clicks]) => ({ name, clicks: clicks as number }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }
  conversionRate(): string {
    const v = this.analytics?.contactFormViews || 0,
      s = this.analytics?.contactFormSubmissions || 0;
    if (!v) return '—';
    return ((s / v) * 100).toFixed(1) + '%';
  }

  // ── SITE SETTINGS ────────────────────────────────────────────────────────
  // ── STATS ────────────────────────────────────────────────────────────────
  saveStats(): void {
    this.saving = true;
    this.adminService.updateStats(this.statsEdit).subscribe({
      next: (res) => {
        this.content!.stats = JSON.parse(JSON.stringify(res.data));
        this.saving = false;
        this.clearDirty();
        this.toast.success('Stats saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }

  addStat(): void {
    this.statsEdit.push({ id: 's_' + Date.now(), value: 0, suffix: '+', label: 'New Stat' });
    this.markDirty();
  }
  deleteStat(id: string): void {
    this.statsEdit = this.statsEdit.filter((s) => s.id !== id);
    this.markDirty();
  }

  saveSettings(): void {
    this.saving = true;
    this.adminService.updateSettings(this.settingsEdit).subscribe({
      next: () => {
        this.content!.siteSettings = JSON.parse(JSON.stringify(this.settingsEdit));
        this.saving = false;
        this.clearDirty();
        this.toast.success('Settings saved!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed');
      },
    });
  }
  getSectionFlag(key: string): boolean {
    return (this.settingsEdit?.sections as Record<string, boolean>)?.[key] ?? true;
  }
  setSectionFlag(key: string, val: boolean): void {
    (this.settingsEdit.sections as Record<string, boolean>)[key] = val;
    this.markDirty();
  }

  addFreelanceService(): void {
    const v = this.newFreelanceService.trim();
    if (!v || this.settingsEdit.freelance.services.includes(v)) return;
    this.settingsEdit.freelance.services.push(v);
    this.newFreelanceService = '';
    this.markDirty();
  }
  removeFreelanceService(s: string): void {
    this.settingsEdit.freelance.services = this.settingsEdit.freelance.services.filter(
      (x) => x !== s,
    );
    this.markDirty();
  }
  addHeroPill(e: Event): void {
    const v = (e.target as HTMLInputElement).value.trim();
    if (v && !this.settingsEdit.hero.pills.includes(v)) {
      this.settingsEdit.hero.pills.push(v);
      (e.target as HTMLInputElement).value = '';
      this.markDirty();
    }
  }
  removeHeroPill(p: string): void {
    this.settingsEdit.hero.pills = this.settingsEdit.hero.pills.filter((x) => x !== p);
    this.markDirty();
  }
  addCardSkill(e: Event): void {
    const v = (e.target as HTMLInputElement).value.trim();
    if (!this.settingsEdit.hero.cardSkills) this.settingsEdit.hero.cardSkills = [];
    if (v && !this.settingsEdit.hero.cardSkills.includes(v)) {
      this.settingsEdit.hero.cardSkills.push(v);
      (e.target as HTMLInputElement).value = '';
      this.markDirty();
    }
  }
  removeCardSkill(s: string): void {
    this.settingsEdit.hero.cardSkills = this.settingsEdit.hero.cardSkills.filter((x) => x !== s);
    this.markDirty();
  }
  addTickerItem(e: Event): void {
    const v = (e.target as HTMLInputElement).value.trim();
    if (!this.settingsEdit.ticker) this.settingsEdit.ticker = { items: [] };
    if (v && !this.settingsEdit.ticker.items.includes(v)) {
      this.settingsEdit.ticker.items.push(v);
      (e.target as HTMLInputElement).value = '';
      this.markDirty();
    }
  }
  removeTickerItem(item: string): void {
    if (!this.settingsEdit.ticker) return;
    this.settingsEdit.ticker.items = this.settingsEdit.ticker.items.filter((x) => x !== item);
    this.markDirty();
  }
  addAboutParagraph(): void {
    this.settingsEdit.about.paragraphs.push('');
    this.markDirty();
  }
  removeAboutParagraph(i: number): void {
    this.settingsEdit.about.paragraphs.splice(i, 1);
    this.markDirty();
  }

  // ── ACCOUNT ───────────────────────────────────────────────────────────────
  readonly sectionList = [
    {
      key: 'hero',
      icon: '🏠',
      label: 'Hero Section',
      desc: 'Main landing area with name, bio, CTA',
    },
    { key: 'about', icon: '👤', label: 'About Section', desc: 'Story, stats, Accenture badge' },
    { key: 'ticker', icon: '📡', label: 'Skills Ticker', desc: 'Scrolling tech marquee bar' },
    { key: 'skills', icon: '⚡', label: 'Skills Grid', desc: 'Core skills with proficiency bars' },
    {
      key: 'companies',
      icon: '🏢',
      label: 'Work Experience',
      desc: 'Company-grouped work accordion',
    },
    {
      key: 'personalProjects',
      icon: '🔧',
      label: 'Side Projects',
      desc: 'Personal & freelance projects',
    },
    {
      key: 'certifications',
      icon: '🏅',
      label: 'Certifications',
      desc: 'Azure/cloud badges with Credly links',
    },
    { key: 'experience', icon: '📋', label: 'Timeline', desc: 'Career & education timeline' },
    { key: 'testimonials', icon: '💬', label: 'Testimonials', desc: 'Colleague & client quotes' },
    { key: 'blog', icon: '✍️', label: 'Blog / Writing', desc: 'Technical articles section' },
    {
      key: 'stats',
      icon: '📊',
      label: 'Stats Row',
      desc: 'Years, certifications, projects counter',
    },
    { key: 'contact', icon: '✉', label: 'Contact Form', desc: 'Contact section with form' },
    {
      key: 'resumeBanner',
      icon: '📄',
      label: 'Resume Download Banner',
      desc: 'Fixed bottom resume download strip',
    },
    { key: 'footer', icon: '🔻', label: 'Footer', desc: 'Footer links and copyright' },
  ];

  changeCredentials(): void {
    if (!this.accountForm.currentPassword || !this.accountForm.newPassword) {
      this.toast.error('Current and new password are required');
      return;
    }
    if (this.accountForm.newPassword !== this.accountForm.confirmPassword) {
      this.toast.error('New passwords do not match');
      return;
    }
    if (this.accountForm.newPassword.length < 8) {
      this.toast.error('Password must be at least 8 characters');
      return;
    }
    this.accountSaving = true;
    this.auth
      .changePassword(
        this.accountForm.currentPassword,
        this.accountForm.newPassword,
        this.accountForm.newUsername || undefined,
      )
      .subscribe({
        next: () => {
          this.accountSaving = false;
          this.accountForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            newUsername: '',
          };
          this.toast.success('Credentials updated! Please log in again.');
          setTimeout(() => this.auth.logout(), 2000);
        },
        error: (err) => {
          this.accountSaving = false;
          this.toast.error(err.error?.message || 'Update failed');
        },
      });
  }
  sendForgotPassword(): void {
    this.auth.forgotPassword().subscribe({
      next: (res) => {
        if (res.emailSent) {
          this.toast.info('Reset link sent to ' + res.email);
        } else {
          this.forgotTokenResult = res.resetToken;
          this.showResetForm = true;
          this.toast.warning('Email not configured — token shown below for manual reset');
        }
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to generate reset token'),
    });
  }
  resetPasswordWithToken(): void {
    if (this.resetForm.newPassword !== this.resetForm.confirm) {
      this.toast.error('Passwords do not match');
      return;
    }
    this.auth.resetPassword(this.resetForm.token, this.resetForm.newPassword).subscribe({
      next: () => {
        this.toast.success('Password reset! Please log in.');
        this.resetForm = { token: '', newPassword: '', confirm: '' };
        this.showResetForm = false;
        setTimeout(() => this.auth.logout(), 1500);
      },
      error: (err) => this.toast.error(err.error?.message || 'Reset failed'),
    });
  }

  // ── DRAG REORDER ─────────────────────────────────────────────────────────
  onReorder(section: string, newIds: string[]): void {
    const orderPayload = newIds.map((id, idx) => ({ id, displayOrder: idx }));
    const reorder = (arr: any[]) => {
      const map: Record<string, number> = {};
      orderPayload.forEach((o) => (map[o.id] = o.displayOrder));
      const sorted = [...arr].sort((a, b) => (map[a.id] ?? a.displayOrder) - (map[b.id] ?? b.displayOrder));
      // Sync the displayOrder property so Save All sends the correct values
      sorted.forEach((item, idx) => (item.displayOrder = idx));
      return sorted;
    };
    if (section === 'skills') this.skillsEdit = reorder(this.skillsEdit);
    else if (section === 'companies') this.companiesEdit = reorder(this.companiesEdit);
    else if (section === 'personalProjects')
      this.personalProjectsEdit = reorder(this.personalProjectsEdit);
    else if (section === 'experience') this.experienceEdit = reorder(this.experienceEdit);
    else if (section === 'certifications')
      this.certificationsEdit = reorder(this.certificationsEdit);
    else if (section === 'testimonials') this.testimonialsEdit = reorder(this.testimonialsEdit);
    else if (section === 'blogPosts') this.blogEdit = reorder(this.blogEdit);
    else if (section.startsWith('company-projects-')) {
      const co = this.companiesEdit.find((c) => c.id === section.replace('company-projects-', ''));
      if (co) co.projects = reorder(co.projects);
    }
    this.contentService.reorder(section, orderPayload).subscribe({
      next: () => this.toast.success('displayOrder saved'),
      error: () => this.toast.error('Reorder failed'),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  emptySkill(): Partial<Skill> {
    return {
      name: '',
      icon: '⚡',
      accentColor: '#f5a623',
      description: '',
      tags: [],
      proficiency: 80,
      yearsExp: '1+',
    };
  }
  emptyExp(): Partial<Experience> {
    return { period: '', role: '', company: '', location: '', description: '' };
  }
  emptyCert(): Partial<Certification> {
    return {
      name: '',
      code: '',
      issuer: 'Microsoft',
      level: 'Associate',
      credlyLink: '',
      badgeLink: '',
      badgeType: 'auto',
      accentColor: '#0078d4',
      issueYear: String(new Date().getFullYear()),
    };
  }
  emptyCompany(): Partial<Company> {
    return {
      name: '',
      role: '',
      period: '',
      location: '',
      logo: '🏢',
      accentColor: '#f5a623',
      current: false,
      description: '',
      projects: [],
    };
  }
  emptyCompanyProject(): Partial<CompanyProject> {
    return { title: '', description: '', tech: [], link: '#' };
  }
  emptyPersonal(): Partial<PersonalProject> {
    return {
      title: '',
      description: '',
      tech: [],
      githubUrl: '#',
      liveUrl: '#',
      status: 'wip',
      type: 'personal',
      featured: false,
      year: String(new Date().getFullYear()),
    };
  }
  emptyTestimonial(): Partial<Testimonial> {
    return {
      name: '',
      role: '',
      company: '',
      avatar: '',
      quote: '',
      rating: 5,
      visible: true,
      status: 'approved',
    };
  }
  emptyBlog(): Partial<BlogPost> {
    return {
      title: '',
      excerpt: '',
      content: '',
      tags: [],
      coverImage: '',
      published: false,
      publishedAt: new Date().toISOString().split('T')[0],
      readingTime: 5,
    };
  }
  addTagToNew(list: string[], e: Event): void {
    const v = (e.target as HTMLInputElement).value.trim();
    if (v && !list.includes(v)) {
      list.push(v);
      (e.target as HTMLInputElement).value = '';
    }
  }
  removeTagFromNew(list: string[], tag: string): void {
    const i = list.indexOf(tag);
    if (i > -1) list.splice(i, 1);
  }
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
  closeSidebar(): void {
    this.sidebarOpen = false;
  }
  mobileSetTab(tab: any): void {
    this.setTab(tab);
    this.closeSidebar();
  }
  hasSpecialChars(str: string): boolean {
    return /[^a-zA-Z0-9]/.test(str);
  }
  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
