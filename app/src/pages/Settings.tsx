import { CheckCircle2, Database, PlugZap, ShieldAlert } from 'lucide-react';
import { PageHeader, Panel, SectionHeader } from '@/components/common/Chrome';
import { N8N_WEBHOOK_URL, CURRENT_USER_ID, AI_TIMEOUT_MS, getAIProvider, getGeminiApiKey, setGeminiApiKey, getOllamaModel, setOllamaModel } from '@/services/config';
import { useState } from 'react';

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());
  const [ollamaModel, setOllamaModelName] = useState(getOllamaModel());
  const aiProvider = getAIProvider();

  const handleGeminiKeyChange = (val: string) => {
    setGeminiKey(val);
    setGeminiApiKey(val);
  };

  const handleOllamaModelChange = (val: string) => {
    setOllamaModelName(val);
    setOllamaModel(val);
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Settings" subtitle="Backend integration, data source mode and workspace configuration." />

      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <SectionHeader title="AI Backend (n8n)" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              {aiProvider === 'demo' && <span className="flex items-center gap-1.5 rounded-sm border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-300"><ShieldAlert className="h-3.5 w-3.5" />Demo Mode</span>}
              {aiProvider === 'n8n' && <span className="flex items-center gap-1.5 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />Live Backend</span>}
              {aiProvider === 'gemini' && <span className="flex items-center gap-1.5 rounded-sm border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-blue-300"><CheckCircle2 className="h-3.5 w-3.5" />Cloud (Gemini)</span>}
              {aiProvider === 'ollama' && <span className="flex items-center gap-1.5 rounded-sm border border-purple-500/40 bg-purple-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-purple-300"><CheckCircle2 className="h-3.5 w-3.5" />Local (Ollama)</span>}
            </div>
            
            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Ollama Model</p>
              <input 
                type="text" 
                value={ollamaModel} 
                onChange={(e) => handleOllamaModelChange(e.target.value)}
                placeholder="e.g. llama3.2"
                className="mt-1 w-full rounded-sm border border-border bg-secondary/40 px-3 py-2 font-mono-tech text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Gemini API Key</p>
              <input 
                type="password" 
                value={geminiKey} 
                onChange={(e) => handleGeminiKeyChange(e.target.value)}
                placeholder="AIzaSy..."
                className="mt-1 w-full rounded-sm border border-border bg-secondary/40 px-3 py-2 font-mono-tech text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Webhook URL (n8n)</p>
              <p className="mt-1 break-all rounded-sm border border-border bg-secondary/40 px-3 py-2 font-mono-tech text-xs text-foreground/85">
                {N8N_WEBHOOK_URL || 'Not configured'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Request timeout</p>
              <p className="mt-1 font-mono-tech text-xs text-foreground/85">{AI_TIMEOUT_MS / 1000} s</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Requests are posted as JSON: <code className="font-mono-tech text-primary">{'{ message, timestamp, user_id, project_id, context }'}</code>.
              Set <code className="font-mono-tech text-primary">VITE_N8N_WEBHOOK_URL</code> in the environment and rebuild — no UI changes required.
              Force a mode explicitly with <code className="font-mono-tech text-primary">VITE_USE_MOCK_DATA=true|false</code>.
            </p>
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHeader title="Data Sources" />
          <div className="space-y-2 text-sm">
            {[
              ['Equipment inventory', '46 units · typed registry'],
              ['Project portfolio', '8 projects · 5-phase model'],
              ['Allocations', 'Live booking register'],
              ['Maintenance', 'Workshop window register'],
              ['Pending requests', 'Demand queue with AI notes'],
              ['Equipment catalog', '15 classes · use-case knowledge base'],
            ].map(([name, detail]) => (
              <div key={name} className="flex items-center justify-between rounded-sm border border-border bg-secondary/30 px-3 py-2">
                <span className="flex items-center gap-2 text-foreground/90"><Database className="h-3.5 w-3.5 text-primary" />{name}</span>
                <span className="text-xs text-muted-foreground">{detail}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            All services read through the centralized API layer. When the live backend is connected, these sources hydrate from it instead of the seed dataset.
          </p>
        </Panel>

        <Panel className="p-5">
          <SectionHeader title="Workspace" />
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span className="text-muted-foreground">Signed in as</span><span className="font-mono-tech text-xs text-foreground">{CURRENT_USER_ID}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="text-foreground">Operations Manager</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Region</span><span className="text-foreground">Bengaluru operating region</span></p>
          </div>
        </Panel>

        <Panel className="border-primary/25 p-5">
          <SectionHeader title="Integration Contract" />
          <ul className="space-y-1.5 text-xs text-foreground/80">
            <li className="flex gap-2"><PlugZap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />n8n workflow receives the user query plus page context.</li>
            <li className="flex gap-2"><PlugZap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Workflow analyzes job type, phase, fleet status, location, allocation &amp; maintenance conflicts and project priority.</li>
            <li className="flex gap-2"><PlugZap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Response contract: recommended_equipment, alternatives, conflicts, schedule, explanation, confidence.</li>
            <li className="flex gap-2"><PlugZap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />The UI renders success, no-availability, conflict, invalid-request, error and timeout states.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
