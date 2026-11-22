// Fleet Management Modal Components
// Add, Edit, Delete, Change Status, Emergency Shift

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EquipmentStatusBadge } from '@/components/common/Badges';
import { equipmentService, FleetValidationError } from '@/services/equipmentService';
import type { Equipment, EquipmentStatus, Project } from '@/types/models';
import { useStore } from '@/hooks/useStore';
import { todayISO } from '@/lib/dateUtils';
import { LOCATIONS } from '@/data/mockData';

// ─── Shared styling ──────────────────────────────────────────────────────────

const OVERLAY_CLS = 'fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto pt-8 pb-8';
const MODAL_CLS = 'relative w-full max-w-lg rounded-md panel-steel border border-border shadow-2xl';
const HEADER_CLS = 'flex items-center justify-between border-b border-border px-5 py-4';
const BODY_CLS = 'px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin';
const FOOTER_CLS = 'flex items-center justify-end gap-2 border-t border-border px-5 py-3';
const LABEL_CLS = 'block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1';
const INPUT_CLS = 'w-full rounded-sm border border-border bg-secondary/40 px-3 py-2 font-mono-tech text-xs text-foreground focus:border-primary/50 focus:outline-none';
const SELECT_CLS = INPUT_CLS;

const EQUIPMENT_TYPES = [
  'Excavator', 'Crane', 'Mobile Crane', 'Tower Crane', 'Bulldozer', 'Loader', 'Backhoe Loader',
  'Dump Truck', 'Roller', 'Concrete Pump', 'Concrete Mixer', 'Motor Grader',
  'Piling Rig', 'Boom Lift', 'Scissor Lift', 'Forklift', 'Other',
];

const STATUSES: EquipmentStatus[] = ['Available', 'Allocated', 'Maintenance', 'Unavailable'];

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={OVERLAY_CLS} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={MODAL_CLS} onClick={(e) => e.stopPropagation()}>
        <div className={HEADER_CLS}>
          <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <span className="inline-block h-3.5 w-1 bg-primary" />
            {title}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADD EQUIPMENT
// ═════════════════════════════════════════════════════════════════════════════

export function AddEquipmentModal({ onClose }: { onClose: () => void }) {
  const storeData = useStore();
  const projects = storeData.projects;

  const [form, setForm] = useState({
    equipment_id: '',
    equipment_type: 'Excavator',
    model: '',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    current_location: LOCATIONS[0].name,
    current_project_id: '',
    status: 'Available' as EquipmentStatus,
    next_available_date: todayISO(),
    year: new Date().getFullYear(),
    operating_hours: 0,
    capacity: '',
    purchase_date: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, val: string | number) => setForm((f) => ({ ...f, [field]: val }));

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      await equipmentService.create({
        equipment_id: form.equipment_id || undefined,
        equipment_type: form.equipment_type,
        model: form.model,
        status: form.status,
        current_location: form.current_location,
        next_available_date: form.next_available_date || todayISO(),
        year: form.year,
        operating_hours: form.operating_hours,
        capacity: form.capacity,
        manufacturer: form.manufacturer || undefined,
        model_number: form.model_number || undefined,
        serial_number: form.serial_number || undefined,
        current_project_id: form.current_project_id || null,
        purchase_date: form.purchase_date || undefined,
        notes: form.notes || undefined,
      });
      toast.success('Equipment added to fleet successfully.');
      onClose();
    } catch (e) {
      const msg = e instanceof FleetValidationError ? e.message : 'Unable to add equipment. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Add Equipment" onClose={onClose}>
      <div className={BODY_CLS}>
        {error && <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Equipment ID</label>
            <input className={INPUT_CLS} value={form.equipment_id} onChange={(e) => set('equipment_id', e.target.value)} placeholder="Auto-generated if blank" />
          </div>
          <div>
            <label className={LABEL_CLS}>Equipment Type *</label>
            <select className={SELECT_CLS} value={form.equipment_type} onChange={(e) => set('equipment_type', e.target.value)}>
              {EQUIPMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL_CLS}>Equipment Name / Model *</label>
          <input className={INPUT_CLS} value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g. EXC-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Manufacturer</label>
            <input className={INPUT_CLS} value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} placeholder="e.g. CAT, Komatsu" />
          </div>
          <div>
            <label className={LABEL_CLS}>Model Number</label>
            <input className={INPUT_CLS} value={form.model_number} onChange={(e) => set('model_number', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Serial Number</label>
            <input className={INPUT_CLS} value={form.serial_number} onChange={(e) => set('serial_number', e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLS}>Year</label>
            <input className={INPUT_CLS} type="number" value={form.year} onChange={(e) => set('year', parseInt(e.target.value) || 2024)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Location / Site *</label>
            <select className={SELECT_CLS} value={form.current_location} onChange={(e) => set('current_location', e.target.value)}>
              {LOCATIONS.map((l) => <option key={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Status</label>
            <select className={SELECT_CLS} value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Current Project</label>
            <select className={SELECT_CLS} value={form.current_project_id} onChange={(e) => set('current_project_id', e.target.value)}>
              <option value="">— None —</option>
              {projects.map((p: Project) => <option key={p.project_id} value={p.project_id}>{p.project_id} — {p.project_name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Next Available Date</label>
            <input className={INPUT_CLS} type="date" value={form.next_available_date} onChange={(e) => set('next_available_date', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Operating Hours</label>
            <input className={INPUT_CLS} type="number" value={form.operating_hours} onChange={(e) => set('operating_hours', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className={LABEL_CLS}>Capacity</label>
            <input className={INPUT_CLS} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} placeholder="e.g. 1.2 m³ bucket" />
          </div>
        </div>

        <div>
          <label className={LABEL_CLS}>Purchase / Commission Date</label>
          <input className={INPUT_CLS} type="date" value={form.purchase_date} onChange={(e) => set('purchase_date', e.target.value)} />
        </div>

        <div>
          <label className={LABEL_CLS}>Notes</label>
          <textarea className={cn(INPUT_CLS, 'h-16 resize-none')} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional notes..." />
        </div>
      </div>

      <div className={FOOTER_CLS}>
        <Button variant="outline" className="border-border" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave} disabled={saving || !form.model}>
          {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving...</> : 'Add Equipment'}
        </Button>
      </div>
    </ModalShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EDIT EQUIPMENT
// ═════════════════════════════════════════════════════════════════════════════

export function EditEquipmentModal({ equipment, onClose }: { equipment: Equipment; onClose: () => void }) {
  const storeData = useStore();
  const projects = storeData.projects;

  const [form, setForm] = useState({
    model: equipment.model,
    equipment_type: equipment.equipment_type,
    manufacturer: equipment.manufacturer || '',
    model_number: equipment.model_number || '',
    serial_number: equipment.serial_number || '',
    current_location: equipment.current_location,
    current_project_id: equipment.current_project_id || '',
    status: equipment.status,
    next_available_date: equipment.next_available_date,
    year: equipment.year,
    operating_hours: equipment.operating_hours,
    capacity: equipment.capacity,
    purchase_date: equipment.purchase_date || '',
    notes: equipment.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, val: string | number) => setForm((f) => ({ ...f, [field]: val }));

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      await equipmentService.update(equipment.equipment_id, {
        model: form.model,
        equipment_type: form.equipment_type,
        manufacturer: form.manufacturer || undefined,
        model_number: form.model_number || undefined,
        serial_number: form.serial_number || undefined,
        current_location: form.current_location,
        current_project_id: form.current_project_id || null,
        status: form.status,
        next_available_date: form.next_available_date,
        year: form.year,
        operating_hours: form.operating_hours,
        capacity: form.capacity,
        purchase_date: form.purchase_date || undefined,
        notes: form.notes || undefined,
      });
      toast.success(`${equipment.equipment_id} updated successfully.`);
      onClose();
    } catch (e) {
      const msg = e instanceof FleetValidationError ? e.message : 'Unable to update equipment. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={`Edit ${equipment.equipment_id}`} onClose={onClose}>
      <div className={BODY_CLS}>
        {error && <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}

        <div className="rounded-sm border border-border bg-secondary/30 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Equipment ID</p>
          <p className="font-mono-tech text-sm text-primary">{equipment.equipment_id}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Equipment Type</label>
            <select className={SELECT_CLS} value={form.equipment_type} onChange={(e) => set('equipment_type', e.target.value)}>
              {EQUIPMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              {!EQUIPMENT_TYPES.includes(form.equipment_type) && <option>{form.equipment_type}</option>}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Model</label>
            <input className={INPUT_CLS} value={form.model} onChange={(e) => set('model', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Manufacturer</label>
            <input className={INPUT_CLS} value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLS}>Model Number</label>
            <input className={INPUT_CLS} value={form.model_number} onChange={(e) => set('model_number', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Serial Number</label>
            <input className={INPUT_CLS} value={form.serial_number} onChange={(e) => set('serial_number', e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLS}>Year</label>
            <input className={INPUT_CLS} type="number" value={form.year} onChange={(e) => set('year', parseInt(e.target.value) || 2024)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Location / Site</label>
            <select className={SELECT_CLS} value={form.current_location} onChange={(e) => set('current_location', e.target.value)}>
              {LOCATIONS.map((l) => <option key={l.name}>{l.name}</option>)}
              {!LOCATIONS.find((l) => l.name === form.current_location) && <option>{form.current_location}</option>}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Status</label>
            <select className={SELECT_CLS} value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Current Project</label>
            <select className={SELECT_CLS} value={form.current_project_id} onChange={(e) => set('current_project_id', e.target.value)}>
              <option value="">— None —</option>
              {projects.map((p: Project) => <option key={p.project_id} value={p.project_id}>{p.project_id} — {p.project_name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Next Available Date</label>
            <input className={INPUT_CLS} type="date" value={form.next_available_date} onChange={(e) => set('next_available_date', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Operating Hours</label>
            <input className={INPUT_CLS} type="number" value={form.operating_hours} onChange={(e) => set('operating_hours', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className={LABEL_CLS}>Capacity</label>
            <input className={INPUT_CLS} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={LABEL_CLS}>Purchase / Commission Date</label>
          <input className={INPUT_CLS} type="date" value={form.purchase_date} onChange={(e) => set('purchase_date', e.target.value)} />
        </div>

        <div>
          <label className={LABEL_CLS}>Notes</label>
          <textarea className={cn(INPUT_CLS, 'h-16 resize-none')} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>

      <div className={FOOTER_CLS}>
        <Button variant="outline" className="border-border" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving...</> : 'Save Changes'}
        </Button>
      </div>
    </ModalShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// DELETE EQUIPMENT
// ═════════════════════════════════════════════════════════════════════════════

export function DeleteEquipmentModal({ equipment, onClose }: { equipment: Equipment; onClose: () => void }) {
  const storeData = useStore();
  const activeAllocs = storeData.allocations.filter(
    (a) => a.equipment_id === equipment.equipment_id && (a.status === 'Active' || a.status === 'Scheduled')
  );
  const isAllocated = activeAllocs.length > 0;
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setError('');
    setDeleting(true);
    try {
      await equipmentService.delete(equipment.equipment_id);
      toast.success(`${equipment.equipment_id} removed from fleet.`);
      onClose();
    } catch (e) {
      const msg = e instanceof FleetValidationError ? e.message : 'Unable to delete equipment. Please try again.';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ModalShell title={`Delete ${equipment.equipment_id}?`} onClose={onClose}>
      <div className={BODY_CLS}>
        {error && <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}

        <div className="rounded-sm border border-red-500/20 bg-red-500/5 p-4 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <p className="text-sm text-foreground font-medium">This will permanently remove this equipment from the fleet.</p>
          <div className="mt-3 space-y-1">
            <p className="font-mono-tech text-xs text-primary">{equipment.equipment_id}</p>
            <p className="text-sm text-foreground">{equipment.equipment_type} — {equipment.model}</p>
            <EquipmentStatusBadge status={equipment.status} />
          </div>
        </div>

        {isAllocated && (
          <div className="rounded-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">This equipment is currently allocated to an active project.</p>
                <p className="mt-1 text-amber-200/80">Reassign or release the equipment before deleting it.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={FOOTER_CLS}>
        <Button variant="outline" className="border-border" onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={handleDelete}
          disabled={deleting || isAllocated}
        >
          {deleting ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Deleting...</> : 'Delete Equipment'}
        </Button>
      </div>
    </ModalShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CHANGE STATUS
// ═════════════════════════════════════════════════════════════════════════════

export function ChangeStatusModal({ equipment, onClose }: { equipment: Equipment; onClose: () => void }) {
  const storeData = useStore();
  const [newStatus, setNewStatus] = useState<EquipmentStatus>(equipment.status);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeAllocs = storeData.allocations.filter(
    (a) => a.equipment_id === equipment.equipment_id && (a.status === 'Active' || a.status === 'Scheduled')
  );

  const willAffectAllocation = equipment.status === 'Allocated' && newStatus !== 'Allocated' && activeAllocs.length > 0;
  const statusChanged = newStatus !== equipment.status;

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      await equipmentService.changeStatus(equipment.equipment_id, newStatus, reason || undefined);
      toast.success(`${equipment.equipment_id} status changed to ${newStatus}.`);
      onClose();
    } catch (e) {
      const msg = e instanceof FleetValidationError ? e.message : 'Unable to change equipment status.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Change Status" onClose={onClose}>
      <div className={BODY_CLS}>
        {error && <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}

        <div className="flex items-center gap-3 rounded-sm border border-border bg-secondary/30 px-4 py-3">
          <div>
            <p className="font-mono-tech text-xs text-primary">{equipment.equipment_id}</p>
            <p className="text-sm font-medium text-foreground">{equipment.equipment_type} — {equipment.model}</p>
          </div>
          <div className="ml-auto">
            <EquipmentStatusBadge status={equipment.status} />
          </div>
        </div>

        <div>
          <label className={LABEL_CLS}>New Status</label>
          <select className={SELECT_CLS} value={newStatus} onChange={(e) => setNewStatus(e.target.value as EquipmentStatus)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {willAffectAllocation && (
          <div className="rounded-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">This will affect {activeAllocs.length} active allocation(s).</p>
                <p className="mt-1 text-amber-200/80">Changing status from Allocated will cancel the current allocation records.</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className={LABEL_CLS}>Reason (optional)</label>
          <textarea
            className={cn(INPUT_CLS, 'h-16 resize-none')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for status change..."
          />
        </div>
      </div>

      <div className={FOOTER_CLS}>
        <Button variant="outline" className="border-border" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSave}
          disabled={saving || !statusChanged}
        >
          {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Updating...</> : 'Update Status'}
        </Button>
      </div>
    </ModalShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EMERGENCY SHIFT
// ═════════════════════════════════════════════════════════════════════════════

export function EmergencyShiftModal({ equipment, onClose }: { equipment: Equipment; onClose: () => void }) {
  const storeData = useStore();
  const projects = storeData.projects.filter((p) => p.status === 'Active' || p.status === 'Planning');
  const currentProject = equipment.current_project_id ? storeData.getProject(equipment.current_project_id) : null;
  const activeAllocs = storeData.allocations.filter(
    (a) => a.equipment_id === equipment.equipment_id && (a.status === 'Active' || a.status === 'Scheduled')
  );

  const [toProjectId, setToProjectId] = useState('');
  const [toLocation, setToLocation] = useState(LOCATIONS[0].name);
  const [shiftDate, setShiftDate] = useState(todayISO());
  const [returnDate, setReturnDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill location when project changes
  useEffect(() => {
    const proj = projects.find((p) => p.project_id === toProjectId);
    if (proj) setToLocation(proj.location);
  }, [toProjectId, projects]);

  async function handleShift() {
    if (!toProjectId) { setError('Please select a destination project.'); return; }
    if (!reason.trim()) { setError('Please provide a reason for the emergency shift.'); return; }
    setError('');
    setSaving(true);
    try {
      await equipmentService.emergencyShift(
        equipment.equipment_id,
        toProjectId,
        toLocation,
        shiftDate,
        reason,
        returnDate || undefined,
      );
      toast.success(`${equipment.equipment_id} emergency-shifted successfully.`);
      onClose();
    } catch (e) {
      const msg = e instanceof FleetValidationError ? e.message : 'Emergency shift could not be completed.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Emergency Shift" onClose={onClose}>
      <div className={BODY_CLS}>
        {error && <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}

        {/* Current state */}
        <div className="rounded-sm border border-border bg-secondary/30 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Current Assignment</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono-tech text-xs text-primary">{equipment.equipment_id}</p>
              <p className="text-sm font-medium text-foreground">{equipment.equipment_type} — {equipment.model}</p>
            </div>
            <EquipmentStatusBadge status={equipment.status} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <p>Location: <span className="text-foreground">{equipment.current_location}</span></p>
            <p>Project: <span className="text-foreground">{currentProject ? `${currentProject.project_id} — ${currentProject.project_name}` : '— None —'}</span></p>
          </div>
        </div>

        {/* Warning */}
        {activeAllocs.length > 0 && (
          <div className="rounded-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Emergency Shift</p>
                <p className="mt-1 text-amber-200/80">This equipment is currently allocated to another project. Shifting it will affect the existing allocation.</p>
              </div>
            </div>
          </div>
        )}

        {/* Arrow divider */}
        <div className="flex items-center justify-center">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
        </div>

        {/* Destination */}
        <div>
          <label className={LABEL_CLS}>Destination Project *</label>
          <select className={SELECT_CLS} value={toProjectId} onChange={(e) => setToProjectId(e.target.value)}>
            <option value="">— Select project —</option>
            {projects.filter((p) => p.project_id !== equipment.current_project_id).map((p) => (
              <option key={p.project_id} value={p.project_id}>{p.project_id} — {p.project_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLS}>Destination Site / Location</label>
          <select className={SELECT_CLS} value={toLocation} onChange={(e) => setToLocation(e.target.value)}>
            {LOCATIONS.map((l) => <option key={l.name}>{l.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Shift Date</label>
            <input className={INPUT_CLS} type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLS}>Expected Return Date</label>
            <input className={INPUT_CLS} type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
        </div>

        <div>
          <label className={LABEL_CLS}>Reason *</label>
          <textarea
            className={cn(INPUT_CLS, 'h-16 resize-none')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Emergency excavation requirement"
          />
        </div>
      </div>

      <div className={FOOTER_CLS}>
        <Button variant="outline" className="border-border" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={handleShift}
          disabled={saving || !toProjectId || !reason.trim()}
        >
          {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Shifting...</> : 'Confirm Emergency Shift'}
        </Button>
      </div>
    </ModalShell>
  );
}
