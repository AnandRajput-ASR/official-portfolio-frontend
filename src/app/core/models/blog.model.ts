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
  displayOrder: number;
}
