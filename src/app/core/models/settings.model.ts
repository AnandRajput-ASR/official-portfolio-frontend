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
