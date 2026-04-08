export type ProjectStatus = 'completed' | 'in-progress' | 'planned' | 'archived' | null;

export interface CompanyProject {
  id: string;
  number: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  displayOrder: number;
  status?: ProjectStatus;
  impact?: string;
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
  displayOrder: number;
  website?: string;
  teamSize?: string;
  startDate?: string;
  endDate?: string;
}
