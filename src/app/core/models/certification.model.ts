export interface Certification {
  id: string;
  name: string;
  code: string;
  issuer: string;
  level: string;
  credlyLink: string;
  badgeLink: string;
  badgeType: 'auto' | 'upload' | 'default';
  accentColor: string;
  issueYear: string;
  expirationYear: string;
  displayOrder: number;
}
