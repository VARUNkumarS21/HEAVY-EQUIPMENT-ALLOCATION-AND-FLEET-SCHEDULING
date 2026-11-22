import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, BrainCircuit } from 'lucide-react';
import { PageHeader, Panel, SectionHeader } from '@/components/common/Chrome';
import { AllocationStatusBadge, EquipmentStatusBadge } from '@/components/common/Badges';
import { allocationService } from '@/services/entityServices';
import { store } from '@/services/store';
import { useStore } from '@/hooks/useStore';
import { addDays, formatDate, formatDateFull, todayISO } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const STEPS = ['Project', 'Equipment', 'Date Range', 'Conflict Check', 'Validation', 'Confirm'];

export default function Allocations() {
  useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState('All');

  // Wizard state
  const [open, setOpen] = useState(searchParams.get('new') === '1');
  const [step, setStep] = useState(0);
  const [projectId, setProjectId] = useState('');
  const [equipmentId, setEquipmentId] = useState(searchParams.get('equipment') ?? '');
  const [startDate, setStartDate] = useState(todayISO());
  const [duration, setDuration] = useState(5);
  const [done, setDone] = useState(false);

  const allocations = useMemo(
    () => store.allocations
      .filter((a) => statusFilter === 'All' || a.status === statusFilter)
      .sort((a, b) => (a.start_date < b.start_date ? 1 : -1)),
    [statusFilter, store.allocations],
  );

  const endDate = addDays(startDate, duration - 1);
  const conflicts = equipmentId
    ? allocationService.conflictsFor(equipmentId, startDate, endDate)
    : { allocations: [], maintenance: [] };
  const hasConflicts = conflicts.allocations.length > 0 || conflicts.maintenance.length > 0;
  const selectedUnit = store.getEquipment(equipmentId);

  function closeWizard() {
    setOpen(false);
    setStep(0);
    setProjectId('');
    setEquipmentId('');
    setStartDate(todayISO());
    setDuration(5);
    setDone(false);
    const next = new URLSearchParams(searchParams);
    next.delete('new'); next.delete('equipment');
    setSearchParams(next, { replace: true });
  }

  function confirm() {
    allocationService.create({
      equipment_id: equipmentId,
      project_id: projectId,
      job_type: 'General Works',
      start_date: startDate,
      end_date: endDate,
    });
    setDone(true);
  }

  const canNext =
    (step === 0 && !!projectId)
    || (step === 1 && !!equipmentId)
    || (step === 2 && duration > 0)
    || step >= 3;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Equipment Allocation"
        subtitle="Mobilisation register — every machine-to-project booking with conflict validation."
        actions={
          <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-1.5 h-4 w-4" />New Allocation
          </Button>
        }
      />

      <Panel className="mb-4 flex flex-wrap gap-2 p-3">
        {['All', 'Active', 'Scheduled', 'Completed', 'Cancelled'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors',
              statusFilter === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
            {s}
          </button>
        ))}
      </Panel>

      <Panel className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {['Allocation ID', 'Equipment', 'Project', 'Job Type', 'Start', 'End', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allocations.map((a) => (
              <tr key={a.allocation_id} className="border-b border-border/60 last:border-0 hover:bg-secondary/40">
                <td className="px-4 py-3 font-mono-tech text-xs text-primary">{a.allocation_id}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/fleet/${a.equipment_id}`)} className="font-mono-tech text-xs text-foreground hover:text-primary">{a.equipment_id}</button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/projects/${a.project_id}`)} className="font-mono-tech text-xs text-foreground hover:text-primary">{a.project_id}</button>
                </td>
                <td className="px-4 py-3 text-foreground/85">{a.job_type}</td>
                <td className="px-4 py-3 font-mono-tech text-xs text-foreground/85">{formatDate(a.start_date)}</td>
                <td className="px-4 py-3 font-mono-tech text-xs text-foreground/85">{formatDate(a.end_date)}</td>
                <td className="px-4 py-3"><AllocationStatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* New allocation wizard */}
      <Dialog open={open} onOpenChange={(o) => { if (!o) closeWizard(); }}>
        <DialogContent className="max-w-2xl border-border bg-popover">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold uppercase tracking-wide">New Equipment Allocation</DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="mb-4 flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col gap-1">
                <div className={cn('h-1 rounded-full', i < step ? 'bg-emerald-400' : i === step ? 'bg-primary' : 'bg-secondary')} />
                <span className={cn('text-[9px] font-semibold uppercase tracking-wider', i === step ? 'text-primary' : 'text-muted-foreground/60')}>{s}</span>
              </div>
            ))}
          </div>

          {done ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
              <p className="mt-3 font-display text-xl font-semibold uppercase tracking-wide">Allocation Confirmed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {equipmentId} is now booked to {projectId}, {formatDateFull(startDate)} → {formatDateFull(endDate)}.
                Fleet status and schedules have been updated.
              </p>
              <DialogFooter className="mt-5 sm:justify-center">
                <Button onClick={closeWizard} className="bg-primary text-primary-foreground hover:bg-primary/90">Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div>
                  <SectionHeader title="Step 1 — Select Project" />
                  <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 scrollbar-thin sm:grid-cols-2">
                    {store.projects.map((p) => (
                      <button key={p.project_id} onClick={() => setProjectId(p.project_id)}
                        className={cn('rounded-sm border p-3 text-left transition-colors',
                          projectId === p.project_id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}>
                        <p className="font-mono-tech text-xs text-primary">{p.project_id}</p>
                        <p className="text-sm font-medium text-foreground">{p.project_name}</p>
                        <p className="text-xs text-muted-foreground">{p.priority} · {p.location}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <SectionHeader title="Step 2 — Select Equipment" subtitle="Availability status is shown per unit" />
                  <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 scrollbar-thin sm:grid-cols-2">
                    {store.equipment.map((e) => (
                      <button key={e.equipment_id} onClick={() => setEquipmentId(e.equipment_id)}
                        className={cn('flex items-center justify-between rounded-sm border p-3 text-left transition-colors',
                          equipmentId === e.equipment_id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}>
                        <div>
                          <p className="font-mono-tech text-xs text-primary">{e.equipment_id}</p>
                          <p className="text-sm font-medium text-foreground">{e.equipment_type} {e.model}</p>
                          <p className="text-xs text-muted-foreground">{e.current_location}</p>
                        </div>
                        <EquipmentStatusBadge status={e.status} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <SectionHeader title="Step 3 — Date Range" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start date</span>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 h-10 w-full rounded-sm border border-input bg-secondary/50 px-3 text-sm text-foreground [color-scheme:dark] focus:border-primary/50 focus:outline-none" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration (days)</span>
                      <input type="number" min={1} max={90} value={duration} onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className="mt-1 h-10 w-full rounded-sm border border-input bg-secondary/50 px-3 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
                    </label>
                  </div>
                  <p className="mt-3 font-mono-tech text-sm text-foreground/90">Window: {formatDateFull(startDate)} → {formatDateFull(endDate)}</p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <SectionHeader title="Step 4 — Conflict Check" subtitle={`System validation for ${equipmentId}, ${formatDate(startDate)} → ${formatDate(endDate)}`} />
                  <div className="space-y-2">
                    {!hasConflicts && (
                      <div className="flex items-start gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/5 px-3 py-3 text-sm text-emerald-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4" />No allocation or maintenance conflicts detected. This window is clear.
                      </div>
                    )}
                    {conflicts.allocations.map((a) => (
                      <div key={a.allocation_id} className="flex items-start gap-2 rounded-sm border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <span className="text-foreground/85"><span className="font-semibold text-amber-300">ALLOCATION CONFLICT</span> — {a.allocation_id}: committed to {a.project_id} ({formatDate(a.start_date)} → {formatDate(a.end_date)}).</span>
                      </div>
                    ))}
                    {conflicts.maintenance.map((m) => (
                      <div key={m.maintenance_id} className="flex items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-xs">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        <span className="text-foreground/85"><span className="font-semibold text-red-300">MAINTENANCE CONFLICT</span> — {m.maintenance_type} ({formatDate(m.start_date)} → {formatDate(m.end_date)}).</span>
                      </div>
                    ))}
                    {selectedUnit && selectedUnit.status === 'Maintenance' && (
                      <div className="flex items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-xs">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        <span className="text-foreground/85">Unit is currently under maintenance, expected back {formatDateFull(selectedUnit.next_available_date)}.</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/ai-command-center?q=${encodeURIComponent(`Which ${selectedUnit?.equipment_type ?? 'equipment'} is available for ${duration} days?`)}`)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
                  >
                    <BrainCircuit className="h-3.5 w-3.5" />Ask AI for a conflict-free alternative
                  </button>
                </div>
              )}

              {step === 4 && (
                <div>
                  <SectionHeader title="Step 5 — Validation Summary" />
                  <div className="space-y-2 rounded-sm border border-border bg-secondary/30 p-4 text-sm">
                    <p className="flex justify-between"><span className="text-muted-foreground">Project</span><span className="font-medium text-foreground">{projectId} — {store.getProject(projectId)?.project_name}</span></p>
                    <p className="flex justify-between"><span className="text-muted-foreground">Equipment</span><span className="font-medium text-foreground">{equipmentId} — {selectedUnit?.equipment_type} {selectedUnit?.model}</span></p>
                    <p className="flex justify-between"><span className="text-muted-foreground">Window</span><span className="font-mono-tech text-foreground">{formatDateFull(startDate)} → {formatDateFull(endDate)}</span></p>
                    <p className="flex justify-between"><span className="text-muted-foreground">Conflicts</span>
                      <span className={hasConflicts ? 'font-semibold text-amber-400' : 'font-semibold text-emerald-400'}>
                        {hasConflicts ? `${conflicts.allocations.length + conflicts.maintenance.length} detected` : 'None'}
                      </span>
                    </p>
                  </div>
                  {hasConflicts && (
                    <p className="mt-3 text-xs text-amber-400">Conflicts detected. You may still proceed, but demobilisation of the conflicting booking is recommended first.</p>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="py-2">
                  <SectionHeader title="Step 6 — Confirm Allocation" />
                  <p className="text-sm text-foreground/85">
                    Confirming will book <span className="font-mono-tech text-primary">{equipmentId}</span> to <span className="font-mono-tech text-primary">{projectId}</span> from{' '}
                    <span className="font-mono-tech">{formatDateFull(startDate)}</span> to <span className="font-mono-tech">{formatDateFull(endDate)}</span> and update fleet status across the command center.
                  </p>
                </div>
              )}

              <DialogFooter className="mt-5">
                <Button variant="outline" className="border-border" onClick={() => (step === 0 ? closeWizard() : setStep(step - 1))}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />{step === 0 ? 'Cancel' : 'Back'}
                </Button>
                {step < 5 ? (
                  <Button disabled={!canNext} onClick={() => setStep(step + 1)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Next<ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={confirm} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />Confirm Allocation
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
