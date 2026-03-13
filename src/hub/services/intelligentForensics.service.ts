// src/hub/services/intelligentForensics.service.ts
import { hubFetch } from './hub.fetcher';

export interface ForensicNarrative {
  title: string;
  summary: string;
  incidents: string[];
  riskAssessment: string;
  recommendation: string;
}

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const MODEL = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

export const IntelligentForensicsService = {
  async generateNarrative(data: { nodes: any[], edges: any[] }): Promise<ForensicNarrative> {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API Key not configured.");
    }

    const prompt = `
      You are ARIA, the Advanced Risk Intelligence Analyst for CryptoGuard. 
      Analyze the following blockchain transaction graph and provide a professional, cinematic forensic narrative.
      
      GRAPH DATA:
      Nodes: ${JSON.stringify(data.nodes)}
      Edges: ${JSON.stringify(data.edges)}

      FORMAT YOUR RESPONSE AS JSON:
      {
        "title": "A high-impact title for the investigation",
        "summary": "A 2-3 sentence cinematic overview of the fund movement",
        "incidents": ["List 3-4 specific behavioral signals or pattern matches detected"],
        "riskAssessment": "A technical assessment of the threat level and attribution",
        "recommendation": "Calculated investigative next steps"
      }
      
      Focus on patterns like "Peeling Chain", "Structuring", "Mixer Interaction", or "Whale Accumulation".
      Be concise, clinical, and futuristic.
    `;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://cryptoguard.ai", 
          "X-Title": "CryptoGuard Intelligence Hub"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "You are ARIA, a high-end blockchain forensic AI." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      const result = await response.json();
      const content = result.choices[0].message.content;
      return JSON.parse(content) as ForensicNarrative;
    } catch (error) {
      console.error("Narrative generation failed:", error);
      return {
        title: "FORENSIC_STREAM_INTERRUPTED",
        summary: "An error occurred during real-time AI synchronization. Heuristic fallback engaged.",
        incidents: ["API_LATENCY_DETECTED", "NULL_PTR_EXCEPTION", "NARRATIVE_DESYNC"],
        riskAssessment: "Indeterminate due to data stream interruption.",
        recommendation: "Re-initiate intelligence request via secondary uplink."
      };
    }
  }
};
