import { store } from './store';
import type { Equipment, EquipmentStatus } from '@/types/models';
import { todayISO } from '@/lib/dateUtils';
import { getEquipmentImage } from '@/data/equipmentImages';

export interface FleetSummary {
  total: number;
  available: number;
  allocated: number;
  maintenance: number;
  unavailable: number;
  utilizationPct: number;
  byType: { type: string; count: number; available: number }[];
  byLocation: { location: string; total: number; available: number; allocated: number; maintenance: number }[];
}

export interface CreateEquipmentInput {
  equipment_id?: string;
  equipment_type: string;
  model: string;
  status: EquipmentStatus;
  current_location: string;
  next_available_date: string;
  year: number;
  operating_hours: number;
  capacity: string;
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  current_project_id?: string | null;
  purchase_date?: string;
  notes?: string;
}

export type UpdateEquipmentInput = Partial<Omit<Equipment, 'equipment_id' | 'image_url'>>;

// ─── Validation helpers ─────────────────────────────────────────────────────

function generateId(): string {
  const existing = store.allEquipmentIncludingDeleted.map((e) => e.equipment_id);
  let seq = existing.length + 1;
  let id = `EQ${String(seq).padStart(3, '0')}`;
  while (existing.includes(id)) {
    seq++;
    id = `EQ${String(seq).padStart(3, '0')}`;
  }
  return id;
}

export class FleetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FleetValidationError';
  }
}

// ─── Service ────────────────────────────────────────────────────────────────

export const equipmentService = {
  async list(): Promise<Equipment[]> {
    return store.equipment;
  },

  async get(id: string): Promise<Equipment | undefined> {
    return store.getEquipment(id);
  },

  async byStatus(status: EquipmentStatus): Promise<Equipment[]> {
    return store.equipment.filter((e) => e.status === status);
  },

  // ─── CREATE ─────────────────────────────────────────────────────────────

  async create(input: CreateEquipmentInput): Promise<Equipment> {
    const id = input.equipment_id?.trim() || generateId();

    // Validate uniqueness
    if (store.allEquipmentIncludingDeleted.find((e) => e.equipment_id === id)) {
      throw new FleetValidationError(`Equipment ID "${id}" already exists.`);
    }

    // Required fields
    if (!input.equipment_type) throw new FleetValidationError('Equipment type is required.');
    if (!input.model) throw new FleetValidationError('Model name is required.');
    if (!input.current_location) throw new FleetValidationError('Location is required.');

    const eq: Equipment = {
      equipment_id: id,
      equipment_type: input.equipment_type,
      model: input.model,
      status: input.status || 'Available',
      current_location: input.current_location,
      next_available_date: input.next_available_date || todayISO(),
      image_url: getEquipmentImage(input.equipment_type, input.model),
      year: input.year || new Date().getFullYear(),
      operating_hours: input.operating_hours || 0,
      capacity: input.capacity || '',
      manufacturer: input.manufacturer,
      model_number: input.model_number,
      serial_number: input.serial_number,
      current_project_id: input.current_project_id ?? null,
      purchase_date: input.purchase_date,
      notes: input.notes,
    };

    store.addEquipment(eq);
    return eq;
  },

  // ─── UPDATE ─────────────────────────────────────────────────────────────

  async update(id: string, updates: UpdateEquipmentInput): Promise<Equipment> {
    const existing = store.getEquipment(id);
    if (!existing) throw new FleetValidationError(`Equipment "${id}" not found.`);

    // If type changed, update image
    const imageUpdate = updates.equipment_type && updates.equipment_type !== existing.equipment_type
      ? { image_url: getEquipmentImage(updates.equipment_type, updates.model ?? existing.model) }
      : {};

    store.updateEquipment(id, { ...updates, ...imageUpdate });
    return { ...existing, ...updates, ...imageUpdate };
  },

  // ─── DELETE ─────────────────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    const existing = store.getEquipment(id);
    if (!existing) throw new FleetValidationError(`Equipment "${id}" not found.`);

    // Check for active allocations
    const active = store.activeAllocationsFor(id);
    if (active.length > 0) {
      throw new FleetValidationError(
        `This equipment is currently allocated to an active project. Reassign or release the equipment before deleting it.`
      );
    }

    store.removeEquipment(id);
  },

  // ─── STATUS CHANGE ──────────────────────────────────────────────────────

  async changeStatus(id: string, newStatus: EquipmentStatus, reason?: string): Promise<void> {
    const existing = store.getEquipment(id);
    if (!existing) throw new FleetValidationError(`Equipment "${id}" not found.`);

    const activeAllocs = store.activeAllocationsFor(id);

    // Validation: if changing from Allocated to Available, must release allocations
    if (existing.status === 'Allocated' && newStatus === 'Available') {
      // Cancel all active allocations
      for (const alloc of activeAllocs) {
        store.cancelAllocation(alloc.allocation_id);
      }
    }

    // Validation: prevent setting to Available/Allocated if under active maintenance
    if (newStatus === 'Allocated' || newStatus === 'Available') {
      const activeMaint = store.maintenance.filter(
        (m) => m.equipment_id === id && m.status === 'Under Maintenance'
      );
      if (activeMaint.length > 0 && newStatus === 'Allocated') {
        throw new FleetValidationError('Cannot allocate equipment that is currently under maintenance.');
      }
    }

    const nextAvail = newStatus === 'Available' ? todayISO() : undefined;
    store.setEquipmentStatus(id, newStatus, nextAvail, reason ?? `Status changed to ${newStatus}`);

    // Update project reference if releasing
    if (newStatus === 'Available' || newStatus === 'Maintenance' || newStatus === 'Unavailable') {
      if (existing.current_project_id) {
        store.updateEquipment(id, { current_project_id: null });
      }
    }
  },

  // ─── EMERGENCY SHIFT ───────────────────────────────────────────────────

  async emergencyShift(
    equipmentId: string,
    toProjectId: string,
    toLocation: string,
    shiftDate: string,
    reason: string,
    expectedReturnDate?: string,
  ): Promise<void> {
    const existing = store.getEquipment(equipmentId);
    if (!existing) throw new FleetValidationError(`Equipment "${equipmentId}" not found.`);

    if (existing.status === 'Unavailable') {
      throw new FleetValidationError('Cannot shift unavailable equipment.');
    }

    const toProject = store.getProject(toProjectId);
    if (!toProject) throw new FleetValidationError(`Destination project "${toProjectId}" not found.`);

    // Cancel existing active allocations
    const activeAllocs = store.activeAllocationsFor(equipmentId);
    for (const alloc of activeAllocs) {
      store.cancelAllocation(alloc.allocation_id);
    }

    // Record the shift
    store.recordShift({
      equipment_id: equipmentId,
      from_project_id: existing.current_project_id ?? null,
      to_project_id: toProjectId,
      from_location: existing.current_location,
      to_location: toLocation,
      shift_date: shiftDate,
      expected_return_date: expectedReturnDate ?? null,
      reason,
    });

    // Create new allocation at the destination project
    const endDate = expectedReturnDate || addDaysStr(shiftDate, 30);
    store.createAllocation({
      equipment_id: equipmentId,
      project_id: toProjectId,
      job_type: `Emergency Shift: ${reason}`,
      start_date: shiftDate,
      end_date: endDate,
    });

    // Update equipment location and project
    store.updateEquipment(equipmentId, {
      current_location: toLocation,
      current_project_id: toProjectId,
      status: 'Allocated',
    });
  },

  // ─── SUMMARIES ──────────────────────────────────────────────────────────

  async summary(): Promise<FleetSummary> {
    const all = store.equipment;
    const count = (s: EquipmentStatus) => all.filter((e) => e.status === s).length;
    const available = count('Available');
    const allocated = count('Allocated');
    const maintenance = count('Maintenance');
    const unavailable = count('Unavailable');

    const typeMap = new Map<string, { count: number; available: number }>();
    all.forEach((e) => {
      const t = typeMap.get(e.equipment_type) ?? { count: 0, available: 0 };
      t.count += 1;
      if (e.status === 'Available') t.available += 1;
      typeMap.set(e.equipment_type, t);
    });

    const locMap = new Map<string, { total: number; available: number; allocated: number; maintenance: number }>();
    all.forEach((e) => {
      const l = locMap.get(e.current_location) ?? { total: 0, available: 0, allocated: 0, maintenance: 0 };
      l.total += 1;
      if (e.status === 'Available') l.available += 1;
      if (e.status === 'Allocated') l.allocated += 1;
      if (e.status === 'Maintenance') l.maintenance += 1;
      locMap.set(e.current_location, l);
    });

    return {
      total: all.length,
      available,
      allocated,
      maintenance,
      unavailable,
      utilizationPct: all.length ? Math.round((allocated / all.length) * 100) : 0,
      byType: [...typeMap.entries()].map(([type, v]) => ({ type, ...v })).sort((a, b) => b.count - a.count),
      byLocation: [...locMap.entries()].map(([location, v]) => ({ location, ...v })),
    };
  },

  /** Units of a type free to start on/after a date, considering bookings + maintenance. */
  async availableForWindow(type: string, start: string, durationDays: number): Promise<Equipment[]> {
    const end = addDaysStr(start, durationDays - 1);
    return store.equipment.filter((e) => {
      if (e.equipment_type !== type) return false;
      if (e.status === 'Unavailable') return false;
      if (e.status === 'Maintenance' && e.next_available_date > start) return false;
      if (e.next_available_date > start && e.status !== 'Available') return false;
      return (
        store.conflictingAllocations(e.equipment_id, start, end).length === 0
        && store.conflictingMaintenance(e.equipment_id, start, end).length === 0
      );
    });
  },

  async fleetHealthNote(): Promise<string> {
    const s = await this.summary();
    return `${s.available} of ${s.total} units deployable as of ${todayISO()}.`;
  },
};

function addDaysStr(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
