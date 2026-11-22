import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, CalendarDays, Clock, Gauge, ArrowLeftRight, BrainCircuit, Edit, Power, ArrowRightLeft, Trash2 } from 'lucide-react';
import { PageHeader, Panel, SectionHeader } from '@/components/common/Chrome';
import { EquipmentStatusBadge, AllocationStatusBadge, MaintenanceStatusBadge } from '@/components/common/Badges';
import { EquipmentImage } from '@/components/common/Cards';
import { useStore } from '@/hooks/useStore';
import { EQUIPMENT_CATALOG } from '@/data/catalog';
import { formatDateFull, todayISO } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EditEquipmentModal, ChangeStatusModal, EmergencyShiftModal, DeleteEquipmentModal } from '@/components/fleet/FleetModals';

export default function EquipmentDetail() {
  useStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useStore();
  const unit = store.equipment.find((e) => e.equipment_id === id);

  if (!unit) {
    return (
      <div>
        <PageHeader title="Equipment not found" />
        <Button variant="outline" className="border-border" onClick={() => navigate('/fleet')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to fleet
        </Button>
      </div>
    );
  }

  const [modal, setModal] = useState<'edit' | 'status' | 'shift' | 'delete' | null>(null);

  const catalog = EQUIPMENT_CATALOG.find((c) => c.type === unit.equipment_type);
  const allocations = store.allocations.filter((a) => a.equipment_id === unit.equipment_id && a.status !== 'Cancelled');
  const maintenance = store.maintenance.filter((m) => m.equipment_id === unit.equipment_id);
  const audits = store.auditLog.filter((a) => a.equipment_id === unit.equipment_id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const currentAllocation = allocations.find((a) => a.status === 'Active');
  const currentProject = currentAllocation ? store.getProject(currentAllocation.project_id) : null;

  return (
    <div className="animate-fade-in-up">
      <button onClick={() => navigate('/fleet')} className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" />Equipment Fleet
      </button>

      {/* Hero */}
      <Panel className="mb-6 overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <EquipmentImage src={unit.image_url} alt={`${unit.equipment_type} ${unit.model}`} className="h-64 lg:h-80" />
          <div className="p-6">
            <p className="font-mono-tech text-sm text-primary">{unit.equipment_id}</p>
            <h1 className="font-display text-4xl font-semibold uppercase tracking-wide leading-none">{unit.equipment_type}</h1>
            <p className="mt-1 font-mono-tech text-sm text-muted-foreground">{unit.model} · {unit.year}</p>
            <div className="mt-4"><EquipmentStatusBadge status={unit.status} pulse /></div>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground"><MapPin className="h-3 w-3" />Current location</p>
                <p className="mt-0.5 font-medium text-foreground">{unit.current_location}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground"><CalendarDays className="h-3 w-3" />Next available</p>
                <p className="mt-0.5 font-mono-tech font-medium text-foreground">{formatDateFull(unit.next_available_date)}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground"><Clock className="h-3 w-3" />Operating hours</p>
                <p className="mt-0.5 font-mono-tech font-medium text-foreground">{unit.operating_hours.toLocaleString()} h</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground"><Gauge className="h-3 w-3" />Capacity</p>
                <p className="mt-0.5 font-medium text-foreground">{unit.capacity}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => setModal('edit')} variant="outline" className="border-border">
                <Edit className="mr-1.5 h-4 w-4" />Edit
              </Button>
              <Button onClick={() => setModal('status')} variant="outline" className="border-border">
                <Power className="mr-1.5 h-4 w-4" />Status
              </Button>
              <Button onClick={() => setModal('shift')} variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400">
                <ArrowRightLeft className="mr-1.5 h-4 w-4" />Emergency Shift
              </Button>
              <Button onClick={() => setModal('delete')} variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                <Trash2 className="mr-1.5 h-4 w-4" />Delete
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button onClick={() => navigate('/allocations?new=1&equipment=' + unit.equipment_id)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowLeftRight className="mr-1.5 h-4 w-4" />New Allocation
              </Button>
              <Button variant="outline" className="border-border" onClick={() => navigate(`/ai-command-center?q=${encodeURIComponent(`Find an alternative to ${unit.equipment_id}`)}`)}>
                <BrainCircuit className="mr-1.5 h-4 w-4" />Ask AI for Alternatives
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Operational status */}
        <Panel className="p-4">
          <SectionHeader title="Operational Status" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Current project</span>
              {currentProject ? (
                <button className="font-medium text-primary hover:underline" onClick={() => navigate(`/projects/${currentProject.project_id}`)}>
                  {currentProject.project_id} — {currentProject.project_name}
                </button>
              ) : <span className="text-foreground/80">—</span>}
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Allocation status</span>
              {currentAllocation ? <AllocationStatusBadge status={currentAllocation.status} /> : <span className="text-foreground/80">Not allocated</span>}
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Maintenance status</span>
              {maintenance.find((m) => m.status === 'Under Maintenance')
                ? <MaintenanceStatusBadge status="Under Maintenance" />
                : maintenance.find((m) => m.status === 'Scheduled')
                  ? <MaintenanceStatusBadge status="Scheduled" />
                  : <span className="text-emerald-400">Clear</span>}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upcoming availability</span>
              <span className="font-mono-tech text-foreground">{unit.next_available_date <= todayISO() ? 'Now' : formatDateFull(unit.next_available_date)}</span>
            </div>
          </div>
        </Panel>

        {/* Allocation history */}
        <Panel className="p-4">
          <SectionHeader title="Allocations" subtitle={`${allocations.length} records`} />
          <div className="scrollbar-thin max-h-56 space-y-2 overflow-y-auto pr-1">
            {allocations.length === 0 && <p className="text-sm text-muted-foreground">No allocation history.</p>}
            {allocations.map((a) => (
              <div key={a.allocation_id} className="rounded-sm border border-border bg-secondary/30 px-3 py-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-primary">{a.allocation_id}</span>
                  <AllocationStatusBadge status={a.status} />
                </div>
                <p className="mt-1 text-foreground/80">{a.job_type} · {a.project_id}</p>
                <p className="font-mono-tech text-muted-foreground">{formatDateFull(a.start_date)} → {formatDateFull(a.end_date)}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Maintenance history */}
        <Panel className="p-4">
          <SectionHeader title="Maintenance Windows" subtitle={`${maintenance.length} records`} />
          <div className="scrollbar-thin max-h-56 space-y-2 overflow-y-auto pr-1">
            {maintenance.length === 0 && <p className="text-sm text-muted-foreground">No maintenance records.</p>}
            {maintenance.map((m) => (
              <div key={m.maintenance_id} className="rounded-sm border border-border bg-secondary/30 px-3 py-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-primary">{m.maintenance_id}</span>
                  <MaintenanceStatusBadge status={m.status} />
                </div>
                <p className="mt-1 text-foreground/80">{m.maintenance_type}</p>
                <p className="font-mono-tech text-muted-foreground">{formatDateFull(m.start_date)} → {formatDateFull(m.end_date)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Audit history */}
        <Panel className="p-4">
          <SectionHeader title="Audit & Shift History" subtitle={`${audits.length} records`} />
          <div className="scrollbar-thin max-h-96 space-y-3 overflow-y-auto pr-1">
            {audits.length === 0 && <p className="text-sm text-muted-foreground">No audit history.</p>}
            {audits.map((a) => (
              <div key={a.id} className="rounded-sm border border-border bg-secondary/30 px-3 py-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className={cn('font-mono-tech uppercase tracking-wider', a.action === 'EMERGENCY_SHIFT' ? 'text-amber-400' : 'text-primary')}>{a.action}</span>
                  <span className="font-mono-tech text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</span>
                </div>
                <p className="mt-1 font-medium text-foreground/90">{a.details}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>
                    <span className="block text-[10px] uppercase">User</span>
                    <span>{a.operator}</span>
                  </div>
                  {(a.previous_status || a.new_status) && (
                    <div>
                      <span className="block text-[10px] uppercase">Status Change</span>
                      <span>{a.previous_status || '-'} → {a.new_status || '-'}</span>
                    </div>
                  )}
                  {(a.previous_project || a.new_project) && (
                    <div>
                      <span className="block text-[10px] uppercase">Project Change</span>
                      <span>{a.previous_project || '-'} → {a.new_project || '-'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Use-case profile */}
        {catalog && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <Panel className="p-4">
                <SectionHeader title="Primary Uses" />
                <ul className="space-y-1.5 text-sm text-foreground/85">
                  {catalog.primary_uses.map((u) => <li key={u} className="flex gap-2"><span className="mt-2 h-1 w-3 shrink-0 bg-primary" />{u}</li>)}
                </ul>
              </Panel>
              <Panel className="p-4">
                <SectionHeader title="Construction Phases" />
                <ul className="space-y-1.5 text-sm text-foreground/85">
                  {catalog.construction_phases.map((u) => <li key={u} className="flex gap-2"><span className="mt-2 h-1 w-3 shrink-0 bg-sky-400" />{u}</li>)}
                </ul>
              </Panel>
            </div>
            <Panel className="border-primary/25 p-4">
              <SectionHeader title="Why This Machine Matters" />
              <p className="text-sm leading-relaxed text-foreground/85">{catalog.why_it_matters}</p>
              <div className="mt-3 space-y-1">
                {catalog.key_characteristics.map((k) => (
                  <p key={k} className="font-mono-tech text-[11px] text-muted-foreground">▸ {k}</p>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>

      {modal === 'edit' && <EditEquipmentModal equipment={unit} onClose={() => setModal(null)} />}
      {modal === 'status' && <ChangeStatusModal equipment={unit} onClose={() => setModal(null)} />}
      {modal === 'shift' && <EmergencyShiftModal equipment={unit} onClose={() => setModal(null)} />}
      {modal === 'delete' && <DeleteEquipmentModal equipment={unit} onClose={() => { setModal(null); navigate('/fleet'); }} />}
    </div>
  );
}
