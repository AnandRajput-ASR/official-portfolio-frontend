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
  displayOrder: number;
}
