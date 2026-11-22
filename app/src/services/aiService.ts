import type { AIQueryContext, AIQueryRequest, AIRecommendationResponse } from '@/types/models';
import { AI_TIMEOUT_MS, CURRENT_USER_ID, N8N_WEBHOOK_URL, getAIProvider, getGeminiApiKey, getOllamaModel } from './config';
import { runMockAiEngine } from './mockAiEngine';
import { store } from './store';
import { GoogleGenAI } from '@google/genai';

export function buildQueryRequest(message: string, context: AIQueryContext, projectId?: string | null): AIQueryRequest {
  return {
    message,
    timestamp: new Date().toISOString(),
    user_id: CURRENT_USER_ID,
    project_id: projectId ?? context.selected_project,
    context,
  };
}

function buildPrompt(request: AIQueryRequest): string {
  // We extract a simplified state to avoid token limits if the dataset grows.
  const context = {
    equipment: store.equipment,
    projects: store.projects,
    allocations: store.allocations,
    maintenance: store.maintenance
  };

  return `You are an AI Construction Operations Assistant. 
Analyze the following request and return a JSON object matching the exact schema below.

User Request: "${request.message}"

Current Fleet, Allocations & Project State:
${JSON.stringify(context, null, 2)}

Expected JSON format:
{
  "success": boolean,
  "intent": string (e.g., "equipment_allocation", "availability_query", "project_status", "alternative_lookup"),
  "job_type": string | null,
  "construction_phase": string | null,
  "duration_days": number | null,
  "requested_start_date": string (YYYY-MM-DD) | null,
  "recommended_equipment": [
    {
      "equipment_id": string,
      "equipment_type": string,
      "model": string,
      "status": "Available" | "Allocated" | "Maintenance" | "Unavailable",
      "current_location": string,
      "next_available_date": string (YYYY-MM-DD),
      "recommendation_score": number (0-100),
      "reason": string,
      "reason_points": ["point 1", "point 2"]
    }
  ],
  "alternatives": [ ... same as recommended_equipment ... ],
  "conflicts": [
    {
      "conflict_type": "ALLOCATION_CONFLICT" | "MAINTENANCE_CONFLICT" | "AVAILABILITY_CONFLICT",
      "equipment_id": string,
      "description": string,
      "window": { "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }
    }
  ],
  "schedule": { "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" } | null,
  "explanation": "A detailed explanation of the recommendation and any detected conflicts to present to the user.",
  "confidence": number (0.0 to 1.0),
  "project_id": string | null
}

Rules:
1. Identify any overlapping allocations or maintenance windows for the requested equipment and report them in "conflicts".
2. Use the Current State provided to accurately determine what is available.
3. If equipment is not available for the requested dates, try to find an alternative.
4. Response MUST be valid JSON only. Do not wrap in markdown \`\`\`json \`\`\`. Do not include any extra text.`;
}

async function postToGemini(payload: AIQueryRequest): Promise<AIRecommendationResponse> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please configure it in Settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(payload);

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text || '';
  try {
    return JSON.parse(text) as AIRecommendationResponse;
  } catch (err) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Invalid JSON response from Gemini");
  }
}

async function postToOllama(payload: AIQueryRequest): Promise<AIRecommendationResponse> {
  const model = getOllamaModel();
  const prompt = buildPrompt(payload);
  
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: 'json'
      }),
      signal: controller.signal,
    });
    
    if (!res.ok) {
      throw new Error(`Ollama responded with HTTP ${res.status}`);
    }
    
    const data = await res.json();
    return JSON.parse(data.response) as AIRecommendationResponse;
  } finally {
    clearTimeout(timer);
  }
}

async function postToN8n(payload: AIQueryRequest): Promise<AIRecommendationResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`n8n responded with HTTP ${res.status}`);
    }
    const data = (await res.json()) as AIRecommendationResponse;
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export const aiService = {
  isLiveBackend(): boolean {
    return getAIProvider() !== 'demo';
  },

  async sendQuery(message: string, context: AIQueryContext): Promise<AIRecommendationResponse> {
    const payload = buildQueryRequest(message, context);
    const provider = getAIProvider();

    if (provider === 'demo') {
      await new Promise((r) => setTimeout(r, 1400 + Math.random() * 900));
      return runMockAiEngine(payload);
    }

    try {
      if (provider === 'gemini') {
        return await postToGemini(payload);
      } else if (provider === 'ollama') {
        return await postToOllama(payload);
      } else {
        return await postToN8n(payload);
      }
    } catch (err: any) {
      console.error("AI Service Error:", err);
      const isTimeout = err instanceof DOMException && err.name === 'AbortError';
      return {
        success: false,
        intent: 'error',
        job_type: null, construction_phase: null, duration_days: null,
        requested_start_date: null, recommended_equipment: [], alternatives: [],
        conflicts: [], schedule: null,
        explanation: isTimeout
          ? 'The AI service did not respond in time.'
          : `The AI service is temporarily unavailable. Error: ${err.message || 'Unknown'}`,
        confidence: 0,
        error: isTimeout ? 'timeout' : 'backend_error',
      };
    }
  },
};
