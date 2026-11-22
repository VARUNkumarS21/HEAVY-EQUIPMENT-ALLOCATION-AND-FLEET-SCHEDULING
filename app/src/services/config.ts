// Runtime configuration.

export const N8N_WEBHOOK_URL: string = (import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined) ?? '';
export const AI_TIMEOUT_MS = 60_000;
export const CURRENT_USER_ID = 'ops.manager@construmind.ai';

export type AIProvider = 'demo' | 'ollama' | 'gemini' | 'n8n';

export const getAIProvider = (): AIProvider => {
  const stored = localStorage.getItem('CONSTRUMIND_AI_PROVIDER');
  if (stored === 'ollama' || stored === 'gemini' || stored === 'n8n' || stored === 'demo') return stored;
  // Default fallback
  const forced = import.meta.env.VITE_USE_MOCK_DATA as string | undefined;
  if (forced === 'true' || N8N_WEBHOOK_URL.length === 0) return 'demo';
  return 'n8n';
};

export const setAIProvider = (provider: AIProvider) => {
  localStorage.setItem('CONSTRUMIND_AI_PROVIDER', provider);
};

export const getGeminiApiKey = (): string => {
  return localStorage.getItem('CONSTRUMIND_GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const setGeminiApiKey = (key: string) => {
  localStorage.setItem('CONSTRUMIND_GEMINI_API_KEY', key);
};

export const getOllamaModel = (): string => {
  return localStorage.getItem('CONSTRUMIND_OLLAMA_MODEL') || 'llama3';
};

export const setOllamaModel = (model: string) => {
  localStorage.setItem('CONSTRUMIND_OLLAMA_MODEL', model);
};
