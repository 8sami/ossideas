export interface IdeaData {
  id: string;
  title: string;
  tagline: string;
  description: string;
  ossProject: string;
  categories: string[];
  opportunityScore: number;
  license: string;
  marketSize: string;
  targetAudience: string;
  monetizationStrategy: string;
  techStack: string[];
  competitiveAdvantage: string;
  risks: string[];
  isSaved?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  communityPick?: boolean;
  isFromDatabase?: boolean;
  generatedAt?: string;
  repositoryStargazersCount?: number;
  industries?: string[];
}

export interface FilterOptions {
  categories: string[];
  industries: string[];
  opportunityScore: [number, number];
  license: string[];
  isNew: boolean;
  isTrending: boolean;
  communityPick: boolean;
}