import { Hero } from './hero.model';
import { Skill } from './skill.model';
import { Company } from './company.model';
import { PersonalProject } from './project.model';
import { Experience } from './experience.model';
import { Stat } from './stat.model';
import { Certification } from './certification.model';
import { Testimonial } from './testimonial.model';
import { BlogPost } from './blog.model';
import { SiteSettings } from './settings.model';
import { Analytics } from './analytics.model';

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
