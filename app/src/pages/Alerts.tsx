import { useNavigate } from 'react-router';
import { Bell, CheckCheck } from 'lucide-react';
import { PageHeader, Panel, EmptyState } from '@/components/common/Chrome';
import { AlertSeverityBadge } from '@/components/common/Badges';
import { alertService } from '@/services/entityServices';
import { useStore } from '@/hooks/useStore';
import { formatDateTime } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

export default function Alerts() {
  const store = useStore();
  const navigate = useNavigate();
  const alerts = [...store.alerts].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  function openEntity(ref: string | null) {
    if (!ref) return;
    if (ref.startsWith('PRJ')) navigate(`/projects/${ref}`);
    else if (ref.startsWith('EQ')) navigate(`/fleet/${ref}`);
    else if (ref.startsWith('AL')) navigate('/allocations');
    else if (ref.startsWith('MT')) navigate('/maintenance');
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Alert Center" subtitle="Operational signals — equipment unavailability, maintenance conflicts, availability changes and AI advisories." />

      {alerts.length === 0 ? (
        <EmptyState title="All clear" message="No operational alerts. Fleet, schedule and maintenance are in sync." />
      ) : (
        <div className="space-y-2.5">
          {alerts.map((a) => (
            <Panel key={a.alert_id} className={cn('px-4 py-3.5 transition-opacity', a.acknowledged && 'opacity-55')}>
              <div className="flex flex-wrap items-start gap-3">
                <AlertSeverityBadge severity={a.severity} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    {a.entity_ref && (
                      <button onClick={() => openEntity(a.entity_ref)} className="font-mono-tech text-[11px] text-primary hover:underline">
                        {a.entity_ref} →
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.message}</p>
                  <p className="mt-1 font-mono-tech text-[11px] text-muted-foreground/70">{a.alert_id} · {formatDateTime(a.created_at)}</p>
                </div>
                {!a.acknowledged && (
                  <button
                    onClick={() => alertService.acknowledge(a.alert_id)}
                    className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />Acknowledge
                  </button>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Bell className="h-3.5 w-3.5" />
        Alerts are generated from allocation conflicts, maintenance overlaps and AI schedule analysis.
      </div>
    </div>
  );
}
