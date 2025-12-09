export interface Memo {
  id: string;
  content: string;
  createdAt: number;
}

export type ReviewFrequency = 'daily' | 'weekly' | 'monthly';

export interface AppSettings {
  reviewFrequency: ReviewFrequency;
  reviewTime: string; // e.g., "09:00"
}

export interface AnalysisDimensions {
  mood: string; // e.g., "Productive", "Anxious", "Creative"
  scores: {
    work: number;    // 0-100
    life: number;    // 0-100
    growth: number;  // 0-100
  };
}

export interface AIReviewResult {
  id: string;
  createdAt: number;
  periodStart: number;
  periodEnd: number;
  frequency: ReviewFrequency;
  summary: string;
  connections: string[];
  actionableItems: string[];
  tags: string[];
  dimensions: AnalysisDimensions;
}
