
import { GoogleGenAI } from "@google/genai";
import { ScanResult, LintRule } from "../types";

export interface AIExplanationResponse {
  text: string;
  sources: { title: string; uri: string }[];
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Helper to handle retries with exponential backoff for rate limiting
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 429;
      if (isRateLimit && retries > 0) {
        console.warn(`Rate limited. Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async getPrivacyExplanation(result: ScanResult, rule: LintRule): Promise<AIExplanationResponse> {
    const finding = result.findings.find(f => f.ruleId === rule.id);
    if (!finding || !finding.detected) return { text: "No privacy leak detected.", sources: [] };

    return this.withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this Solana privacy leak for a developer.
        
        Rule: ${rule.name}
        Severity: ${rule.severity}
        Description: ${rule.description}
        Evidence: ${finding.evidence}
        Impact: ${rule.impact}
        Address: ${result.targetAddress}
        
        Use Google Search to find recent (2024-2025) Solana security advisories or privacy best practices related to this specific finding.
        Identify if this is a known exploit pattern (like 'sandwiching' or 'account linking').
        Provide a concise, technical explanation and a direct link to documentation or a relevant fix.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "Unable to generate explanation.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Resource',
        uri: chunk.web?.uri || '#'
      })) || [];

      return { text, sources };
    }).catch((error) => {
      console.error("Gemini Final Error:", error);
      return { 
        text: "The AI assistant is temporarily rate-limited or unavailable. Please try again in a moment.", 
        sources: [] 
      };
    });
  }
}
