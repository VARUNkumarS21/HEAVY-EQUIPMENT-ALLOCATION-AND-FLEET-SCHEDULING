import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, BrainCircuit, ArrowRight, AlertTriangle } from 'lucide-react';
import { PageHeader, Panel, SectionHeader } from '@/components/common/Chrome';
import { ProjectPriorityBadge, PhaseStatusBadge, AllocationStatusBadge } from '@/components/common/Badges';
import { useStore } from '@/hooks/useStore';
import { formatDate, formatDateFull, daysBetween, todayISO } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useStore();
  const project = store.projects.find((p) => p.project_id === id);

  if (!project) {
    return (
      <div>
        <PageHeader title="Project not found" />
        <Button variant="outline" className="border-border" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to projects
        </Button>
      </div>
    );
  }

  const projectAllocations = store.allocations.filter((a) => a.project_id === project.project_id && a.status !== 'Cancelled');

  return (
    <div className="animate-fade-in-up">
      <button onClick={() => navigate('/projects')} className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" />Projects
      </button>

      {/* Header */}
      <Panel blueprint className="mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono-tech text-sm text-primary">{project.project_id}</p>
            <h1 className="font-display text-4xl font-semibold uppercase tracking-wide leading-none">{project.project_name}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{project.project_type} · {project.location}</p>
            <p className="mt-2 font-mono-tech text-sm text-foreground/90">
              {formatDateFull(project.start_date)} → {formatDateFull(project.end_date)}
              <span className="ml-2 text-muted-foreground">({daysBetween(project.start_date, project.end_date)} days)</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ProjectPriorityBadge priority={project.priority} className="text-xs" />
            <Button
              size="sm"
              onClick={() => navigate(`/ai-command-center?q=${encodeURIComponent(`Schedule equipment for Project ${project.project_id.replace('PRJ-', '').replace(/^0+/, '')}.`)}`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <BrainCircuit className="mr-1.5 h-4 w-4" />Ask AI to Schedule
            </Button>
          </div>
        </div>
        {project.delay_reason && (
          <div className="mt-4 flex items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-foreground/90"><span className="font-semibold text-red-300">Delay risk:</span> {project.delay_reason}</p>
          </div>
        )}
      </Panel>

      {/* Phase timeline */}
      <SectionHeader title="Project Timeline" subtitle="Construction phases with equipment demand and dependencies" />
      <Panel className="mb-6 p-4">
        <div className="space-y-0">
          {project.phases.map((phase, i) => {
            const phaseAllocations = projectAllocations.filter((a) =>
              a.start_date <= phase.end_date && a.end_date >= phase.start_date);
            const isActive = phase.name === project.current_phase;
            const total = daysBetween(project.start_date, project.end_date);
            const offset = (daysBetween(project.start_date, phase.start_date) / total) * 100;
            const width = Math.max(4, ((daysBetween(phase.start_date, phase.end_date) + 1) / total) * 100);
            return (
              <div key={phase.phase_id} className="relative border-b border-border/60 py-3 last:border-0">
                {i > 0 && (
                  <div className="absolute -top-3 left-5 text-muted-foreground"><ArrowRight className="h-3 w-3 rotate-90" /></div>
                )}
                <div className="grid gap-3 md:grid-cols-[260px_1fr_220px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech text-[10px] text-muted-foreground">{phase.phase_id}</span>
                      <PhaseStatusBadge status={phase.status} />
                      {isActive && <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">Current</span>}
                    </div>
                    <p className={cn('mt-1 font-display text-base font-semibold uppercase tracking-wide leading-tight', isActive && 'text-primary')}>
                      {phase.name}
                    </p>
                    <p className="font-mono-tech text-[11px] text-muted-foreground">
                      {formatDate(phase.start_date)} → {formatDate(phase.end_date)}
                      {phase.depends_on && <span className="ml-2">· after {phase.depends_on}</span>}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="relative h-6 w-full overflow-hidden rounded-sm bg-secondary/60">
                      <div
                        className={cn(
                          'absolute inset-y-1 rounded-sm',
                          phase.status === 'Completed' && 'bg-emerald-500/60',
                          phase.status === 'In Progress' && 'hazard-stripes-subtle border border-primary/50 bg-primary/20',
                          phase.status === 'Upcoming' && 'border border-border bg-secondary',
                          phase.status === 'Delayed' && 'border border-red-500/50 bg-red-500/20',
                        )}
                        style={{ left: `${offset}%`, width: `${width}%` }}
                      />
                      {phase.status === 'In Progress' && (() => {
                        const now = todayISO();
                        const progress = Math.min(100, Math.max(0, (daysBetween(phase.start_date, now) / (daysBetween(phase.start_date, phase.end_date) + 1)) * 100));
                        return (
                          <div className="absolute inset-y-1 rounded-sm bg-primary/70"
                            style={{ left: `${offset}%`, width: `${(width * progress) / 100}%` }} />
                        );
                      })()}
                    </div>
                  </div>
                  <div className="text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Required equipment</p>
                    <p className="mt-0.5 text-foreground/85">{phase.required_equipment_types.join(', ')}</p>
                    <p className="mt-1 text-muted-foreground">
                      Allocated: <span className="font-mono-tech text-foreground">{phaseAllocations.length} unit{phaseAllocations.length === 1 ? '' : 's'}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Allocations on this project */}
      <SectionHeader title="Equipment Allocations" subtitle={`${projectAllocations.length} bookings on this project`} />
      <Panel className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {['Allocation', 'Equipment', 'Job Type', 'Window', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projectAllocations.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">No equipment allocated yet — ask the AI to build an allocation plan.</td></tr>
            )}
            {projectAllocations.map((a) => {
              const unit = store.getEquipment(a.equipment_id);
              return (
                <tr key={a.allocation_id} className="border-b border-border/60 last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono-tech text-xs text-primary">{a.allocation_id}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/fleet/${a.equipment_id}`)} className="text-left hover:text-primary">
                      <span className="font-mono-tech text-xs">{a.equipment_id}</span>
                      <span className="ml-2 text-foreground/90">{unit?.equipment_type} {unit?.model}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-foreground/85">{a.job_type}</td>
                  <td className="px-4 py-3 font-mono-tech text-xs text-foreground/85">{formatDate(a.start_date)} → {formatDate(a.end_date)}</td>
                  <td className="px-4 py-3"><AllocationStatusBadge status={a.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
