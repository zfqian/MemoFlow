import { Memo, AppSettings, AIReviewResult } from '../types';

const MEMO_KEY = 'memoflow_data_v1';
const SETTINGS_KEY = 'memoflow_settings_v1';
const REVIEWS_KEY = 'memoflow_reviews_v1';

// --- Memos ---

export const getMemos = (): Memo[] => {
  try {
    const data = localStorage.getItem(MEMO_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load memos", e);
    return [];
  }
};

export const saveMemo = (memo: Memo): Memo[] => {
  const current = getMemos();
  const updated = [memo, ...current]; // Newest first
  localStorage.setItem(MEMO_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteMemo = (id: string): Memo[] => {
  const current = getMemos();
  const updated = current.filter(m => m.id !== id);
  localStorage.setItem(MEMO_KEY, JSON.stringify(updated));
  return updated;
};

// --- Settings ---

const DEFAULT_SETTINGS: AppSettings = {
  reviewFrequency: 'daily',
  reviewTime: '20:00',
};

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): AppSettings => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
};

// --- Reviews ---

export const getReviews = (): AIReviewResult[] => {
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveReview = (review: AIReviewResult): AIReviewResult[] => {
  const current = getReviews();
  // Filter out any existing review for the exact same ID to avoid duplicates if re-saving
  const others = current.filter(r => r.id !== review.id);
  const updated = [review, ...others];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  return updated;
};
