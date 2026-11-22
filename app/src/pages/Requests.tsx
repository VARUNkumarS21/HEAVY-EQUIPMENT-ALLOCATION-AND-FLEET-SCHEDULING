import { useNavigate } from 'react-router';
import { BrainCircuit, CheckCircle2, Eye } from 'lucide-react';
import { PageHeader, Panel, EmptyState } from '@/components/common/Chrome';
import { RequestStatusBadge } from '@/components/common/Badges';
import { requestService } from '@/services/entityServices';
import { useStore } from '@/hooks/useStore';
import { formatDateFull } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';

export default function Requests() {
  const store = useStore();
  const navigate = useNavigate();

  const requests = store.requests;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Pending Requests" subtitle="Equipment demand raised by site teams, with AI-assisted resolution for every request." />

      {requests.length === 0 ? (
        <EmptyState title="No pending requests" message="All equipment demand is currently covered by the fleet schedule." />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const project = store.getProject(r.project_id);
            const suggested = r.suggested_equipment_id ? store.getEquipment(r.suggested_equipment_id) : null;
            return (
              <Panel key={r.request_id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-mono-tech text-sm text-primary">{r.request_id}</p>
                      <RequestStatusBadge status={r.status} />
                    </div>
                    <p className="mt-1 font-display text-xl font-semibold uppercase tracking-wide">{r.equipment_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.project_id} — {project?.project_name ?? 'Unassigned'} · requested {formatDateFull(r.requested_date)} · {r.duration_days} days
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-muted-foreground">Next available date</p>
                    <p className="font-mono-tech text-sm text-foreground">{r.next_available_date ? formatDateFull(r.next_available_date) : 'No unit available'}</p>
                  </div>
                </div>

                {r.ai_note && (
                  <div className="mt-3 flex items-start gap-2 rounded-sm border border-violet-500/25 bg-violet-500/5 px-3 py-2.5">
                    <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300">AI Status</p>
                      <p className="mt-0.5 text-sm text-foreground/85">{r.ai_note}</p>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {suggested && (
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => requestService.setStatus(r.request_id, 'Scheduled')}
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Accept Alternative ({suggested.equipment_id})
                    </Button>
                  )}
                  {suggested && (
                    <Button size="sm" variant="outline" className="border-border" onClick={() => navigate(`/fleet/${suggested.equipment_id}`)}>
                      <Eye className="mr-1.5 h-3.5 w-3.5" />View Equipment
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border"
                    onClick={() => navigate(`/ai-command-center?q=${encodeURIComponent(`Which ${r.equipment_type} is available for ${r.duration_days} days for Project ${r.project_id.replace('PRJ-', '')}?`)}`)}
                  >
                    <BrainCircuit className="mr-1.5 h-3.5 w-3.5" />Ask AI
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
