export interface Repository {
  id: number;
  github_url: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  open_issues: number;
  created_at: string;
  updated_at: string;
  languages: { [key: string]: number };
}

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
  repository?: Repository;
  analysisResults?: Array<{
    id: string;
    analysis_type_id: number;
    title: string;
    summary_description: string | null;
    overall_score: number | null;
    analysis_payload: Record<string, unknown>;
    analysis_type?: {
      id: number;
      name: string;
      slug: string;
      description: string | null;
    };
  }>;
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

export interface Category {
  id: number;
  name: string;
}
