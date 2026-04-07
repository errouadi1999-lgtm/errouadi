export interface Channel {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
  streamUrl?: string;
  description?: string;
}

export type Category = 'All' | 'Sports' | 'Movies' | 'News' | 'Entertainment';
