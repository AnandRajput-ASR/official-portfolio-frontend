export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
  visible: boolean;
  displayOrder: number;
  status: 'approved' | 'pending' | 'rejected';
  submittedAt?: string;
}
