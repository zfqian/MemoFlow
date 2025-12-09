import { GoogleGenAI, Type } from "@google/genai";
import { Memo, AIReviewResult, ReviewFrequency } from '../types';

// Helper to initialize Gemini safely
const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateReview = async (
  memos: Memo[], 
  frequency: ReviewFrequency
): Promise<Omit<AIReviewResult, 'id' | 'createdAt'>> => {
  
  const now = Date.now();
  let periodStart = 0;
  
  // Determine time range based on frequency
  if (frequency === 'daily') {
    periodStart = now - 24 * 60 * 60 * 1000;
  } else if (frequency === 'weekly') {
    periodStart = now - 7 * 24 * 60 * 60 * 1000;
  } else {
    periodStart = now - 30 * 24 * 60 * 60 * 1000;
  }

  // Filter memos for the relevant period
  const relevantMemos = memos.filter(m => m.createdAt >= periodStart);

  if (relevantMemos.length === 0) {
    // If no memos in range, maybe fallback to last 10 memos regardless of time
    // or just return empty state. Let's return a "not enough data" state.
    // For this implementation, we will try to use the passed memos if relevantMemos is empty
    // to ensure the user sees something if they are forcing a review.
  }

  const memosToAnalyze = relevantMemos.length > 0 ? relevantMemos : memos.slice(0, 15);

  const ai = getGeminiClient();
  
  // Prepare the prompt content
  const memoText = memosToAnalyze.map(m => `- [${new Date(m.createdAt).toLocaleString()}] ${m.content}`).join('\n');

  const prompt = `
    You are a personal knowledge management assistant helping me perform a "${frequency} Review" of my fragmented notes.
    
    Here are my notes for this period:
    ${memoText}

    Please analyze these notes and provide:
    1. A concise summary of my thoughts.
    2. Hidden connections or patterns.
    3. Actionable items.
    4. Categorization tags.
    5. Emotional analysis (e.g., Anxious, Productive, Calm).
    6. A score from 0-100 indicating how much the content relates to Work, Life/Family, and Personal Growth.

    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            connections: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                mood: { type: Type.STRING },
                scores: {
                  type: Type.OBJECT,
                  properties: {
                    work: { type: Type.NUMBER },
                    life: { type: Type.NUMBER },
                    growth: { type: Type.NUMBER }
                  },
                  required: ["work", "life", "growth"]
                }
              },
              required: ["mood", "scores"]
            }
          },
          required: ["summary", "connections", "actionableItems", "tags", "dimensions"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        periodStart,
        periodEnd: now,
        frequency
      };
    }
    
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
