
export interface TemplateListProps {
  searchQuery: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  downloadCount: number;
  viewCount: number;
  price?: number;
  demoUrl?: string;
}
