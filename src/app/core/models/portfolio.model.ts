export interface Hero {
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  availableForWork: boolean;
}
export interface Skill {
  id: string;
  name: string;
  icon: string;
  accentColor: string;
  description: string;
  tags: string[];
  proficiency: number;
  yearsExp: string;
  order: number;
}
export interface CompanyProject {
  id: string;
  number: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  order: number;
}
export interface Company {
  id: string;
  name: string;
  role: string;
  period: string;
  location: string;
  logo: string;
  accentColor: string;
  current: boolean;
  description: string;
  projects: CompanyProject[];
  order: number;
}
export interface PersonalProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  githubUrl: string;
  liveUrl: string;
  status: 'live' | 'wip' | 'archived';
  type: 'personal' | 'freelance' | 'opensource';
  featured: boolean;
  year: string;
  order: number;
}
export interface Experience {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
  order: number;
}
export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
}
export interface Certification {
  id: string;
  name: string;
  code: string;
  issuer: string;
  level: string;
  credlyUrl: string;
  badgeUrl: string;
  badgeType: 'auto' | 'upload' | 'default';
  accentColor: string;
  year: string;
  order: number;
}
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
  visible: boolean;
  order: number;
  status: 'approved' | 'pending' | 'rejected';
  submittedAt?: string;
}
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  coverImage: string;
  published: boolean;
  publishedAt: string;
  readingTime: number;
  order: number;
}
export interface FreelanceConfig {
  enabled: boolean;
  ctaTitle: string;
  ctaSubtitle: string;
  services: string[];
  showInHero: boolean;
  showInAbout: boolean;
  showCtaSection: boolean;
  showInContact: boolean;
}
export interface SiteSettings {
  openToWork: boolean;
  openToWorkText: string;
  sections: {
    testimonials: boolean;
    blog: boolean;
    analytics: boolean;
    skills: boolean;
    certifications: boolean;
    personalProjects: boolean;
    experience: boolean;
    about: boolean;
    hero: boolean;
    stats: boolean;
    companies: boolean;
    contact: boolean;
    footer: boolean;
    ticker: boolean;
    resumeBanner: boolean;
  };
  freelance: FreelanceConfig;
  hero: {
    badgeText: string;
    ctaPrimary: string;
    ctaSecondary: string;
    pills: string[];
    cardTitle: string;
    cardStatusText: string;
    cardStats: { value: string; label: string }[];
    cardSkills: string[];
  };
  about: {
    heading: string;
    paragraphs: string[];
    accentureBadge: { company: string; role: string; period: string; award: string };
  };
  ticker: { items: string[] };
  contact: { heading: string; successMessage: string };
  footer: { text: string; copy: string };
  nav: { logoText: string; showResume: boolean };
}
export interface Analytics {
  resumeDownloads: number;
  contactFormViews: number;
  contactFormSubmissions: number;
  projectClicks: Record<string, number>;
  pageViews: number;
  lastReset: string;
}
export interface PortfolioContent {
  hero: Hero;
  skills: Skill[];
  companies: Company[];
  personalProjects: PersonalProject[];
  experience: Experience[];
  stats: Stat[];
  certifications: Certification[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  siteSettings: SiteSettings;
  analytics: Analytics;
}
export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}
export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  starred: boolean;
  receivedAt: string;
}
export interface MessagesResponse {
  messages: Message[];
  unreadCount: number;
}
