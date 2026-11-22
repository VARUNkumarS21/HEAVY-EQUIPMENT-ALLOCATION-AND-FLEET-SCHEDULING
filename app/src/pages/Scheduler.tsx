import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { PageHeader, Panel, SectionHeader } from '@/components/common/Chrome';
import { useStore } from '@/hooks/useStore';
import { addDays, daysBetween, formatDate, overlaps, todayISO } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

// Window: 14 days back → 60 days forward.
const START_OFFSET = -14;
const END_OFFSET = 60;

type Zoom = 'day' | 'week';

export default function Scheduler() {
  const store = useStore();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState<Zoom>('day');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const start = useMemo(() => addDays(todayISO(), START_OFFSET), []);
  const totalDays = END_OFFSET - START_OFFSET;
  const today = todayISO();
  const todayPct = ((daysBetween(start, today)) / totalDays) * 100;

  const ticks = useMemo(() => {
    const arr: { label: string; pct: number; major: boolean }[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = addDays(start, i);
      const day = new Date(d + 'T00:00:00').getDay();
      if (zoom === 'day' || day === 1) {
        arr.push({
          label: zoom === 'day' ? formatDate(d) : `W/${formatDate(d)}`,
          pct: (i / totalDays) * 100,
          major: day === 1,
        });
      }
    }
    return arr;
  }, [start, totalDays, zoom]);

  function barStyle(s: string, e: string) {
    const left = (Math.max(0, daysBetween(start, s)) / totalDays) * 100;
    const width = (Math.max(1, Math.min(daysBetween(start, addDays(e, 1)), totalDays) - Math.max(0, daysBetween(start, s))) / totalDays) * 100;
    return { left: `${left}%`, width: `${width}%` };
  }

  function toggle(id: string) {
    setCollapsed((c) => {
      const next = new Set(c);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Project Scheduler"
        subtitle="Gantt timeline of phases, equipment mobilisation and maintenance windows. Conflicts are flagged inline."
        actions={
          <div className="flex rounded-sm border border-border">
            {(['day', 'week'] as Zoom[]).map((z) => (
              <button key={z} onClick={() => setZoom(z)}
                className={cn('px-3 py-1.5 text-xs font-semibold uppercase tracking-wider',
                  zoom === z ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                {z === 'day' ? 'Days' : 'Weeks'}
              </button>
            ))}
          </div>
        }
      />

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm bg-primary/70" />Active allocation</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm border border-sky-400/50 bg-sky-500/30" />Scheduled</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm bg-slate-500/40" />Completed</span>
        <span className="flex items-center gap-1.5"><span className="hazard-stripes inline-block h-2.5 w-6 rounded-sm" />Maintenance window</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm border border-red-500/60 bg-red-500/30" />Conflict</span>
      </div>

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[1100px]">
            {/* Time axis */}
            <div className="relative flex border-b border-border">
              <div className="w-56 shrink-0 border-r border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Project / Phase / Equipment
              </div>
              <div className="relative h-10 flex-1">
                {ticks.map((t, i) => (
                  <span key={i} className={cn('absolute top-1/2 -translate-y-1/2 -translate-x-1/2 font-mono-tech text-[9px]',
                    t.major ? 'text-foreground/70' : 'text-muted-foreground/50')} style={{ left: `${t.pct}%` }}>
                    {zoom === 'day' ? (t.major || i % 2 === 0 ? t.label : '') : t.label}
                  </span>
                ))}
                <div className="absolute inset-y-0 w-px bg-primary/70" style={{ left: `${todayPct}%` }} />
              </div>
            </div>

            {store.projects.map((project) => {
              const projectAllocs = store.allocations.filter((a) => a.project_id === project.project_id && a.status !== 'Cancelled');
              const isCollapsed = collapsed.has(project.project_id);
              return (
                <div key={project.project_id} className="border-b border-border/60 last:border-0">
                  {/* Project row */}
                  <div className="relative flex">
                    <button onClick={() => toggle(project.project_id)}
                      className="flex w-56 shrink-0 items-center gap-1.5 border-r border-border px-3 py-2.5 text-left hover:bg-secondary/40">
                      {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                      <div>
                        <p className="font-mono-tech text-xs text-primary">{project.project_id}</p>
                        <p className="max-w-[150px] truncate text-xs font-medium text-foreground">{project.project_name}</p>
                      </div>
                    </button>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 w-px bg-primary/40" style={{ left: `${todayPct}%` }} />
                      <div className="absolute inset-y-2 rounded-sm border border-border bg-secondary/60" style={barStyle(project.start_date, project.end_date)}>
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono-tech text-[9px] text-muted-foreground">
                          {formatDate(project.start_date)} → {formatDate(project.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <>
                      {/* Phase rows */}
                      {project.phases.map((phase) => (
                        <div key={phase.phase_id} className="relative flex border-t border-border/40">
                          <div className="w-56 shrink-0 border-r border-border px-3 py-1.5 pl-9">
                            <p className="truncate text-[11px] text-foreground/80">{phase.name}</p>
                          </div>
                          <div className="relative h-7 flex-1">
                            <div className="absolute inset-y-0 w-px bg-primary/40" style={{ left: `${todayPct}%` }} />
                            <div
                              className={cn('absolute inset-y-1.5 rounded-sm',
                                phase.status === 'Completed' && 'bg-emerald-500/40',
                                phase.status === 'In Progress' && 'border border-primary/50 bg-primary/30',
                                phase.status === 'Upcoming' && 'border border-border bg-secondary/80',
                                phase.status === 'Delayed' && 'border border-red-500/50 bg-red-500/25')}
                              style={barStyle(phase.start_date, phase.end_date)}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Equipment rows */}
                      {projectAllocs.map((a) => {
                        const unit = store.getEquipment(a.equipment_id);
                        const maintWindows = store.maintenance.filter(
                          (m) => m.equipment_id === a.equipment_id && m.status !== 'Completed' && overlaps(m.start_date, m.end_date, a.start_date, a.end_date));
                        const hasConflict = maintWindows.length > 0;
                        return (
                          <div key={a.allocation_id} className="relative flex border-t border-border/40">
                            <div className="flex w-56 shrink-0 items-center justify-between gap-2 border-r border-border px-3 py-1.5 pl-12">
                              <button onClick={() => navigate(`/fleet/${a.equipment_id}`)} className="truncate text-left font-mono-tech text-[11px] text-foreground/80 hover:text-primary">
                                {a.equipment_id} <span className="text-muted-foreground">{unit?.equipment_type}</span>
                              </button>
                              {hasConflict && (
                                <span className="flex items-center gap-1 rounded-sm border border-red-500/40 bg-red-500/10 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-red-300">
                                  <AlertTriangle className="h-2.5 w-2.5" />Maint. conflict
                                </span>
                              )}
                            </div>
                            <div className="relative h-7 flex-1">
                              <div className="absolute inset-y-0 w-px bg-primary/40" style={{ left: `${todayPct}%` }} />
                              {/* maintenance underlay */}
                              {store.maintenance
                                .filter((m) => m.equipment_id === a.equipment_id && m.status !== 'Completed')
                                .map((m) => (
                                  <div key={m.maintenance_id} className="hazard-stripes absolute inset-y-1 rounded-sm opacity-60" style={barStyle(m.start_date, m.end_date)} title={`Maintenance: ${m.maintenance_type}`} />
                                ))}
                              <div
                                className={cn('absolute inset-y-1.5 rounded-sm',
                                  hasConflict ? 'border border-red-500/70 bg-red-500/30'
                                    : a.status === 'Active' ? 'bg-primary/70'
                                    : a.status === 'Scheduled' ? 'border border-sky-400/50 bg-sky-500/30'
                                    : 'bg-slate-500/40')}
                                style={barStyle(a.start_date, a.end_date)}
                                title={`${a.job_type} · ${formatDate(a.start_date)} → ${formatDate(a.end_date)}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      <div className="mt-4">
        <SectionHeader title="How to read this board" />
        <p className="max-w-3xl text-sm text-muted-foreground">
          Amber bars are active mobilisations, blue outlines are scheduled bookings, and hazard-striped bands are maintenance windows.
          A red-outlined allocation bar means the booking overlaps a maintenance window — a <span className="font-semibold text-red-300">MAINTENANCE CONFLICT</span> that the AI will refuse to recommend until re-sequenced. The vertical amber line marks today.
        </p>
      </div>
    </div>
  );
}
