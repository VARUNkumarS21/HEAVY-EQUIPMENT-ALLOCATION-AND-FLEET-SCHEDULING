import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BrainCircuit, Send, MapPin, CalendarDays, CheckCircle2, XCircle, RotateCcw, Truck, AlertTriangle } from 'lucide-react';
import { PageHeader, Panel, AnalyzingIndicator } from '@/components/common/Chrome';
import { EquipmentStatusBadge } from '@/components/common/Badges';
import { EquipmentImage } from '@/components/common/Cards';
import { aiService } from '@/services/aiService';
import { allocationService } from '@/services/entityServices';
import { getAIProvider, setAIProvider, N8N_WEBHOOK_URL, type AIProvider } from '@/services/config';
import type { AIRecommendationResponse, AIRecommendedEquipment } from '@/types/models';
import { formatDate, formatDateFull } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const STARTER_PROMPTS = [
  'Find equipment for foundation excavation.',
  'Schedule equipment for Project 22.',
  'Which excavator is available near Whitefield?',
  'Can I allocate a concrete pump tomorrow?',
  'Why is Project 8 delayed?',
  'Find an alternative to EQ006.',
  'Schedule equipment for road construction for 10 days.',
];

const ANALYSIS_STEPS = [
  'Analyzing project requirements...',
  'Checking fleet availability...',
  'Checking allocation conflicts...',
  'Evaluating maintenance windows...',
  'Generating optimal schedule...',
];

interface ChatTurn {
  id: number;
  role: 'user' | 'assistant';
  text?: string;
  response?: AIRecommendationResponse;
  error?: 'timeout' | 'backend_error' | null;
}

function ScoreMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div className={cn('h-full rounded-full', score >= 80 ? 'bg-emerald-400' : score >= 55 ? 'bg-primary' : 'bg-red-400')} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono-tech text-xs font-semibold text-foreground">{score}%</span>
    </div>
  );
}

import { getEquipmentImage } from '@/data/equipmentImages';

function RecommendationUnitCard({
  unit, onViewEquipment,
}: { unit: AIRecommendedEquipment; onViewEquipment: (id: string) => void }) {
  const img = getEquipmentImage(unit.equipment_type, unit.model);
  return (
    <div className="rounded-sm border border-border bg-secondary/30">
      <div className="flex gap-3 p-3">
        <EquipmentImage src={img} alt={unit.equipment_type} className="h-20 w-28 shrink-0 rounded-sm border border-border" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-mono-tech text-xs text-primary">{unit.equipment_id}</p>
              <p className="font-display text-base font-semibold uppercase tracking-wide leading-tight">{unit.equipment_type}</p>
              <p className="font-mono-tech text-[11px] text-muted-foreground">{unit.model}</p>
            </div>
            <EquipmentStatusBadge status={unit.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{unit.current_location}</span>
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />Available from {formatDate(unit.next_available_date)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Recommendation</p>
              <ScoreMeter score={unit.recommendation_score} />
            </div>
            <button onClick={() => onViewEquipment(unit.equipment_id)} className="text-[11px] font-semibold uppercase tracking-wider text-primary hover:underline">
              View equipment →
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-3 py-2">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Why this equipment?</p>
        <ul className="space-y-0.5">
          {unit.reason_points.map((p) => (
            <li key={p} className="flex items-start gap-1.5 text-xs text-foreground/80">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />{p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AiCommandCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [confirming, setConfirming] = useState<AIRecommendationResponse | null>(null);
  const [confirmedIds, setConfirmedIds] = useState<number[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessage = useRef('');
  const [aiProvider, setAiProviderState] = useState<AIProvider>(getAIProvider());

  const handleProviderChange = (newProvider: AIProvider) => {
    setAIProvider(newProvider);
    setAiProviderState(newProvider);
  };

  const prefill = searchParams.get('q');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, busy]);

  useEffect(() => () => { if (stepTimer.current) clearInterval(stepTimer.current); }, []);

  useEffect(() => {
    if (prefill) setInput(prefill);
  }, [prefill]);

  const modeLabel = useMemo(() => {
    switch (aiProvider) {
      case 'demo': return 'DEMO MODE — built-in decision engine';
      case 'ollama': return 'LOCAL — Ollama model';
      case 'gemini': return 'CLOUD — Gemini API';
      case 'n8n':
        try {
          return `LIVE — n8n workflow (${new URL(N8N_WEBHOOK_URL).host})`;
        } catch {
          return 'LIVE — n8n workflow';
        }
    }
  }, [aiProvider]);

  async function submit(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    lastMessage.current = message;
    setInput('');
    setTurns((t) => [...t, { id: ++idRef.current, role: 'user', text: message }]);
    setBusy(true);
    setStep(0);
    stepTimer.current = setInterval(() => setStep((s) => Math.min(s + 1, ANALYSIS_STEPS.length - 1)), 900);

    const response = await aiService.sendQuery(message, {
      current_page: 'ai-command-center',
      selected_project: null,
      selected_equipment: null,
    });

    if (stepTimer.current) clearInterval(stepTimer.current);
    setBusy(false);
    setTurns((t) => [...t, {
      id: ++idRef.current,
      role: 'assistant',
      response,
      error: response.error === 'timeout' ? 'timeout' : response.error === 'backend_error' ? 'backend_error' : null,
    }]);
  }

  function confirmAllocation(response: AIRecommendationResponse) {
    if (!response.schedule) return;
    response.recommended_equipment.forEach((unit) => {
      allocationService.create({
        equipment_id: unit.equipment_id,
        project_id: response.project_id ?? 'UNASSIGNED',
        job_type: response.job_type ?? 'General Works',
        start_date: response.schedule!.start_date,
        end_date: response.schedule!.end_date,
      });
    });
    setConfirming(null);
    setTurns((t) => [...t, {
      id: ++idRef.current,
      role: 'assistant',
      text: `Allocation confirmed and dispatched. ${response.recommended_equipment.map((u) => u.equipment_id).join(', ')} ${response.recommended_equipment.length === 1 ? 'is' : 'are'} now booked ${formatDate(response.schedule!.start_date)} → ${formatDate(response.schedule!.end_date)}. Fleet status, project schedules and the dashboard have been updated.`,
    }]);
  }

  return (
    <div className="animate-fade-in-up mx-auto flex h-full max-w-5xl flex-col">
      <PageHeader
        title="AI Construction Operations Assistant"
        subtitle="Describe your construction requirement. The AI will analyze equipment, availability, scheduling and project priority."
        actions={
          <div className="flex gap-2 items-center">
            <select
              value={aiProvider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              className="rounded-sm border border-input bg-secondary/50 px-2 py-1 text-xs text-foreground focus:border-primary/50 focus:outline-none"
            >
              <option value="demo">Demo Engine</option>
              <option value="ollama">Local (Ollama)</option>
              <option value="gemini">Cloud (Gemini)</option>
              <option value="n8n">n8n Backend</option>
            </select>
            <span className={cn('rounded-sm border px-2.5 py-1 font-mono-tech text-[10px] font-semibold uppercase tracking-widest',
              aiProvider === 'demo' ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' :
              aiProvider === 'ollama' ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' :
              aiProvider === 'gemini' ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' :
              'border-emerald-500/40 bg-emerald-500/10 text-emerald-300')}>
              {modeLabel}
            </span>
          </div>
        }
      />

      {/* Chat stream */}
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto pb-4">
        {turns.length === 0 && !busy && (
          <Panel blueprint className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary/15 text-primary">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold uppercase tracking-wide">Operations Intelligence Online</p>
                <p className="text-xs text-muted-foreground">Connected to fleet inventory, project schedules, allocation and maintenance registries.</p>
              </div>
            </div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Example requests</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => submit(p)}
                  className="rounded-sm border border-border bg-secondary/40 px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {p}
                </button>
              ))}
            </div>
          </Panel>
        )}

        {turns.map((turn) => (
          <div key={turn.id} className={cn('animate-fade-in-up flex', turn.role === 'user' ? 'justify-end' : 'justify-start')}>
            {turn.role === 'user' ? (
              <div className="max-w-[80%] rounded-sm border border-primary/30 bg-primary/10 px-4 py-2.5">
                <p className="text-sm text-foreground">{turn.text}</p>
              </div>
            ) : (
              <div className="w-full max-w-[92%] space-y-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <span className="font-mono-tech text-[10px] font-semibold uppercase tracking-widest text-primary">Construmind AI</span>
                </div>

                {/* Plain assistant message (e.g. confirmation) */}
                {turn.text && (
                  <Panel className="px-4 py-3"><p className="text-sm text-foreground/90">{turn.text}</p></Panel>
                )}

                {/* Backend failure */}
                {turn.response && (turn.error === 'timeout' || turn.error === 'backend_error') && (
                  <Panel className="border-red-500/40 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-red-400" />
                      <div>
                        <p className="font-display text-base font-semibold uppercase tracking-wide text-red-300">
                          {turn.error === 'timeout' ? 'AI request timed out' : 'AI service temporarily unavailable'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{turn.response.explanation}</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => submit(lastMessage.current)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />Retry
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate('/fleet')} className="border-border">
                            <Truck className="mr-1.5 h-3.5 w-3.5" />View Fleet Manually
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Panel>
                )}

                {/* Structured recommendation */}
                {turn.response && !turn.error && (
                  <Panel className="overflow-hidden">
                    <div className="border-b border-border bg-secondary/30 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Recommendation</p>
                          <p className="font-display text-xl font-semibold uppercase tracking-wide">
                            {turn.response.job_type ?? (turn.response.intent === 'project_status' ? 'Project Status Analysis' : 'Equipment Analysis')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          {turn.response.duration_days !== null && (
                            <span className="font-mono-tech text-foreground/90">{turn.response.duration_days} days</span>
                          )}
                          {turn.response.schedule && (
                            <span className="font-mono-tech text-foreground/90">
                              {formatDate(turn.response.schedule.start_date)} → {formatDate(turn.response.schedule.end_date)}
                            </span>
                          )}
                          <span className="rounded-sm border border-border px-2 py-1 font-mono-tech text-[11px] text-muted-foreground">
                            confidence {(turn.response.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      {turn.response.construction_phase && (
                        <p className="mt-1 text-xs text-muted-foreground">Phase: {turn.response.construction_phase}</p>
                      )}
                    </div>

                    <div className="space-y-4 p-4">
                      <p className="text-sm leading-relaxed text-foreground/90">{turn.response.explanation}</p>

                      {turn.response.recommended_equipment.length > 0 && (
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recommended equipment</p>
                          <div className="grid gap-3 lg:grid-cols-2">
                            {turn.response.recommended_equipment.map((u) => (
                              <RecommendationUnitCard key={u.equipment_id} unit={u} onViewEquipment={(id) => navigate(`/fleet/${id}`)} />
                            ))}
                          </div>
                        </div>
                      )}

                      {turn.response.alternatives.length > 0 && (
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Alternatives</p>
                          <div className="flex flex-wrap gap-2">
                            {turn.response.alternatives.map((u) => (
                              <button
                                key={u.equipment_id}
                                onClick={() => navigate(`/fleet/${u.equipment_id}`)}
                                className="flex items-center gap-2 rounded-sm border border-border bg-secondary/30 px-2.5 py-1.5 text-xs transition-colors hover:border-primary/40"
                              >
                                <span className="font-mono-tech text-primary">{u.equipment_id}</span>
                                <span className="text-foreground/80">{u.equipment_type}</span>
                                <span className="font-mono-tech text-muted-foreground">{u.recommendation_score}%</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {turn.response.conflicts.length > 0 && (
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conflict analysis — evaluated candidates</p>
                          <div className="space-y-1.5">
                            {turn.response.conflicts.slice(0, 6).map((c, i) => (
                              <div key={i} className="flex items-start gap-2 rounded-sm border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                                <div>
                                  <span className={cn('font-mono-tech font-semibold',
                                    c.conflict_type === 'MAINTENANCE_CONFLICT' ? 'text-red-300' : 'text-amber-300')}>
                                    {c.conflict_type.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-foreground/80"> — {c.description}</span>
                                  <span className="ml-1 font-mono-tech text-muted-foreground">({formatDate(c.window.start_date)} → {formatDate(c.window.end_date)})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {turn.response.intent === 'equipment_allocation' && turn.response.recommended_equipment.length > 0 && turn.response.schedule && !confirmedIds.includes(turn.id) && (
                        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                          <Button onClick={() => setConfirming(turn.response!)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />Review & Allocate Equipment
                          </Button>
                          <Button variant="outline" className="border-border" onClick={() => setConfirmedIds((c) => [...c, turn.id])}>
                            <XCircle className="mr-1.5 h-4 w-4" />Reject Recommendation
                          </Button>
                        </div>
                      )}
                      {confirmedIds.includes(turn.id) && (
                        <p className="border-t border-border pt-3 text-xs text-muted-foreground">Recommendation dismissed. Ask again with different dates or equipment types.</p>
                      )}
                    </div>
                  </Panel>
                )}
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="w-full max-w-[92%] space-y-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 animate-pulse text-primary" />
                <span className="font-mono-tech text-[10px] font-semibold uppercase tracking-widest text-primary">Construmind AI — analyzing construction requirements...</span>
              </div>
              <Panel className="p-4">
                <AnalyzingIndicator steps={ANALYSIS_STEPS} activeStep={step} />
              </Panel>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 pt-3 backdrop-blur">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(input); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='e.g. "Schedule an excavator and dump truck for foundation excavation at Whitefield from next week for 5 days"'
            className="h-11 flex-1 rounded-sm border border-input bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
            aria-label="Describe your construction requirement"
            disabled={busy}
          />
          <Button type="submit" disabled={busy || !input.trim()} className="h-11 bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="py-2 text-center font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground/60">
          {aiProvider === 'demo' ? 'Demo engine — set VITE_N8N_WEBHOOK_URL to connect your live n8n workflow' : 
           aiProvider === 'ollama' ? 'Local processing via Ollama' :
           aiProvider === 'gemini' ? 'Cloud processing via Google Gemini' :
           'Responses generated by your n8n AI workflow'}
        </p>
      </div>

      {/* Allocation confirmation */}
      <Dialog open={confirming !== null} onOpenChange={(o) => !o && setConfirming(null)}>
        <DialogContent className="border-border bg-popover">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold uppercase tracking-wide">Review Allocation</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Confirming will dispatch the recommended equipment and update fleet status, project schedules and dashboards.
            </DialogDescription>
          </DialogHeader>
          {confirming && (
            <div className="space-y-2">
              {confirming.recommended_equipment.map((u) => (
                <div key={u.equipment_id} className="flex items-center justify-between rounded-sm border border-border bg-secondary/30 px-3 py-2 text-sm">
                  <span><span className="font-mono-tech text-primary">{u.equipment_id}</span> — {u.equipment_type} {u.model}</span>
                  <span className="font-mono-tech text-xs text-muted-foreground">
                    {formatDateFull(confirming.schedule!.start_date)} → {formatDateFull(confirming.schedule!.end_date)}
                  </span>
                </div>
              ))}
              <p className="pt-1 text-xs text-muted-foreground">
                Conflict validation: {confirming.conflicts.filter((c) => confirming.recommended_equipment.some((r) => r.equipment_id === c.equipment_id)).length === 0
                  ? 'No allocation or maintenance conflicts detected for the recommended units.'
                  : 'Conflicts were detected — see the recommendation card before confirming.'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="border-border" onClick={() => setConfirming(null)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => confirming && confirmAllocation(confirming)}>
              Confirm Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
