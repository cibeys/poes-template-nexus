
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  tags: string[];
  readTime: string;
  date: string;
  slug: string;
  author?: {
    name: string;
    avatarUrl: string;
    role: string;
  };
}

export interface Template {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  framework: string;
  tags: string[];
  downloads: number;
  featured: boolean;
  slug: string;
}

export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export type Theme = "dark" | "light" | "system";
