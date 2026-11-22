// Central operational store — the single source of truth for the running app.
// Entity services read/write through here; when the live backend is connected
// this store is hydrated from the API instead of the seed dataset.

import {
  EQUIPMENT_DATA, PROJECTS_DATA, ALLOCATIONS_DATA, MAINTENANCE_DATA, REQUESTS_DATA, ALERTS_DATA,
} from '@/data/mockData';
import type {
  Equipment, Project, Allocation, MaintenanceRecord, PendingRequest, AlertItem, EquipmentStatus,
  AuditEntry, ShiftRecord,
} from '@/types/models';
import { overlaps, todayISO } from '@/lib/dateUtils';
import { CURRENT_USER_ID } from './config';

// ─── localStorage persistence helpers ─────────────────────────────────────────
const LS_KEY = 'CONSTRUMIND_STORE_V1';

interface PersistedPatch {
  addedEquipment: Equipment[];
  updatedEquipment: Record<string, Partial<Equipment>>;
  deletedEquipmentIds: string[];
  addedAllocations: Allocation[];
  cancelledAllocationIds: string[];
  auditLog: AuditEntry[];
  shiftHistory: ShiftRecord[];
}

function emptyPatch(): PersistedPatch {
  return {
    addedEquipment: [],
    updatedEquipment: {},
    deletedEquipmentIds: [],
    addedAllocations: [],
    cancelledAllocationIds: [],
    auditLog: [],
    shiftHistory: [],
  };
}

function loadPatch(): PersistedPatch {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return emptyPatch();
    return { ...emptyPatch(), ...JSON.parse(raw) };
  } catch {
    return emptyPatch();
  }
}

function savePatch(patch: PersistedPatch) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(patch));
  } catch { /* quota exceeded — silent */ }
}

// ─── Build initial state from seed data + persisted patch ─────────────────────
function buildInitialState() {
  const patch = loadPatch();

  // Start with seed equipment, apply updates and deletions
  let equipment = [...EQUIPMENT_DATA].map((eq) => {
    const updates = patch.updatedEquipment[eq.equipment_id];
    if (updates) return { ...eq, ...updates };
    return eq;
  }).filter((eq) => !patch.deletedEquipmentIds.includes(eq.equipment_id));

  // Add newly created equipment
  equipment = [...equipment, ...patch.addedEquipment];

  // Apply allocation patches
  let allocations = [...ALLOCATIONS_DATA].map((a) => {
    if (patch.cancelledAllocationIds.includes(a.allocation_id)) {
      return { ...a, status: 'Cancelled' as Allocation['status'] };
    }
    return a;
  });
  allocations = [...allocations, ...patch.addedAllocations];

  return {
    equipment,
    projects: [...PROJECTS_DATA],
    allocations,
    maintenance: [...MAINTENANCE_DATA],
    requests: [...REQUESTS_DATA],
    alerts: [...ALERTS_DATA],
    auditLog: patch.auditLog,
    shiftHistory: patch.shiftHistory,
  };
}

// ─── State ────────────────────────────────────────────────────────────────────

interface StoreState {
  equipment: Equipment[];
  projects: Project[];
  allocations: Allocation[];
  maintenance: MaintenanceRecord[];
  requests: PendingRequest[];
  alerts: AlertItem[];
  auditLog: AuditEntry[];
  shiftHistory: ShiftRecord[];
}

let state: StoreState = buildInitialState();

// Persisted patch — tracks mutations on top of seed data
let patch: PersistedPatch = loadPatch();

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  savePatch(patch);
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── ID generation ────────────────────────────────────────────────────────────
let auditSeq = Date.now();
function nextAuditId() { return `AUD-${++auditSeq}`; }
function nextShiftId() { return `SHF-${++auditSeq}`; }
function nextAllocationId() {
  const max = state.allocations.reduce((m, a) => {
    const n = parseInt(a.allocation_id.replace('AL-', ''), 10);
    return n > m ? n : m;
  }, 100);
  return `AL-${max + 1}`;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = {
  get equipment() { return state.equipment.filter((e) => !e.deleted); },
  get allEquipmentIncludingDeleted() { return state.equipment; },
  get projects() { return state.projects; },
  get allocations() { return state.allocations; },
  get maintenance() { return state.maintenance; },
  get requests() { return state.requests; },
  get alerts() { return state.alerts; },
  get auditLog() { return state.auditLog; },
  get shiftHistory() { return state.shiftHistory; },

  getEquipment(id: string): Equipment | undefined {
    return state.equipment.find((e) => e.equipment_id === id && !e.deleted);
  },
  getProject(id: string): Project | undefined {
    return state.projects.find((p) => p.project_id === id);
  },

  // ─── Equipment CRUD ───────────────────────────────────────────────────────

  addEquipment(eq: Equipment): void {
    state = { ...state, equipment: [...state.equipment, eq] };
    patch.addedEquipment.push(eq);

    const entry: AuditEntry = {
      id: nextAuditId(), equipment_id: eq.equipment_id,
      action: 'EQUIPMENT_ADDED', new_status: eq.status,
      new_project: eq.current_project_id ?? null,
      details: `Added ${eq.equipment_type} ${eq.model}`,
      timestamp: new Date().toISOString(), operator: CURRENT_USER_ID,
    };
    state = { ...state, auditLog: [...state.auditLog, entry] };
    patch.auditLog.push(entry);
    emit();
  },

  updateEquipment(id: string, updates: Partial<Equipment>): void {
    const prev = state.equipment.find((e) => e.equipment_id === id);
    if (!prev) return;

    state = {
      ...state,
      equipment: state.equipment.map((e) =>
        e.equipment_id === id ? { ...e, ...updates } : e
      ),
    };

    // Persist: update the patch
    const addedIdx = patch.addedEquipment.findIndex((e) => e.equipment_id === id);
    if (addedIdx >= 0) {
      patch.addedEquipment[addedIdx] = { ...patch.addedEquipment[addedIdx], ...updates };
    } else {
      patch.updatedEquipment[id] = { ...(patch.updatedEquipment[id] ?? {}), ...updates };
    }

    const entry: AuditEntry = {
      id: nextAuditId(), equipment_id: id, action: 'EQUIPMENT_EDITED',
      previous_status: prev.status, new_status: updates.status ?? prev.status,
      previous_project: prev.current_project_id ?? null,
      new_project: updates.current_project_id !== undefined ? updates.current_project_id ?? null : prev.current_project_id ?? null,
      details: `Edited equipment fields`,
      timestamp: new Date().toISOString(), operator: CURRENT_USER_ID,
    };
    state = { ...state, auditLog: [...state.auditLog, entry] };
    patch.auditLog.push(entry);
    emit();
  },

  removeEquipment(id: string): void {
    const prev = state.equipment.find((e) => e.equipment_id === id);
    if (!prev) return;

    // Soft-delete
    state = {
      ...state,
      equipment: state.equipment.map((e) =>
        e.equipment_id === id ? { ...e, deleted: true } : e
      ),
    };

    // Persist
    const addedIdx = patch.addedEquipment.findIndex((e) => e.equipment_id === id);
    if (addedIdx >= 0) {
      patch.addedEquipment.splice(addedIdx, 1);
    } else {
      patch.deletedEquipmentIds.push(id);
    }

    const entry: AuditEntry = {
      id: nextAuditId(), equipment_id: id, action: 'EQUIPMENT_DELETED',
      previous_status: prev.status,
      details: `Removed ${prev.equipment_type} ${prev.model} (${prev.equipment_id})`,
      timestamp: new Date().toISOString(), operator: CURRENT_USER_ID,
    };
    state = { ...state, auditLog: [...state.auditLog, entry] };
    patch.auditLog.push(entry);
    emit();
  },

  // ─── Status management ────────────────────────────────────────────────────

  setEquipmentStatus(equipmentId: string, status: EquipmentStatus, nextAvailable?: string, reason?: string) {
    const prev = state.equipment.find((e) => e.equipment_id === equipmentId);
    if (!prev) return;

    state = {
      ...state,
      equipment: state.equipment.map((e) => e.equipment_id === equipmentId
        ? { ...e, status, next_available_date: nextAvailable ?? e.next_available_date }
        : e),
    };

    // Persist
    const addedIdx = patch.addedEquipment.findIndex((e) => e.equipment_id === equipmentId);
    if (addedIdx >= 0) {
      patch.addedEquipment[addedIdx] = { ...patch.addedEquipment[addedIdx], status, ...(nextAvailable ? { next_available_date: nextAvailable } : {}) };
    } else {
      patch.updatedEquipment[equipmentId] = {
        ...(patch.updatedEquipment[equipmentId] ?? {}),
        status,
        ...(nextAvailable ? { next_available_date: nextAvailable } : {}),
      };
    }

    if (reason !== undefined) {
      const entry: AuditEntry = {
        id: nextAuditId(), equipment_id: equipmentId, action: 'STATUS_CHANGED',
        previous_status: prev.status, new_status: status,
        reason,
        details: `Status changed from ${prev.status} to ${status}`,
        timestamp: new Date().toISOString(), operator: CURRENT_USER_ID,
      };
      state = { ...state, auditLog: [...state.auditLog, entry] };
      patch.auditLog.push(entry);
    }

    emit();
  },

  // ─── Allocation management ────────────────────────────────────────────────

  /** Allocations that block an equipment unit during a window. */
  conflictingAllocations(equipmentId: string, start: string, end: string): Allocation[] {
    return state.allocations.filter(
      (a) => a.equipment_id === equipmentId
        && (a.status === 'Active' || a.status === 'Scheduled')
        && overlaps(a.start_date, a.end_date, start, end),
    );
  },

  /** Maintenance windows that overlap a requested window. */
  conflictingMaintenance(equipmentId: string, start: string, end: string): MaintenanceRecord[] {
    return state.maintenance.filter(
      (m) => m.equipment_id === equipmentId
        && m.status !== 'Completed'
        && overlaps(m.start_date, m.end_date, start, end),
    );
  },

  /** Active allocations for a specific equipment. */
  activeAllocationsFor(equipmentId: string): Allocation[] {
    return state.allocations.filter(
      (a) => a.equipment_id === equipmentId && (a.status === 'Active' || a.status === 'Scheduled'),
    );
  },

  /** The first date from which the unit is clear of all bookings & maintenance. */
  nextFreeDate(equipmentId: string, fromDate: string): string {
    const unit = state.equipment.find((e) => e.equipment_id === equipmentId);
    if (!unit) return fromDate;
    let candidate = fromDate < todayISO() ? todayISO() : fromDate;
    if (unit.status === 'Maintenance' || unit.status === 'Unavailable') {
      candidate = unit.next_available_date > candidate ? unit.next_available_date : candidate;
    }
    const blocking = [
      ...state.allocations.filter((a) => a.equipment_id === equipmentId && (a.status === 'Active' || a.status === 'Scheduled')),
      ...state.maintenance.filter((m) => m.equipment_id === equipmentId && m.status !== 'Completed'),
    ];
    let moved = true;
    let guard = 0;
    while (moved && guard++ < 60) {
      moved = false;
      for (const b of blocking) {
        if (candidate >= b.start_date && candidate <= b.end_date) {
          const d = new Date(b.end_date + 'T00:00:00');
          d.setDate(d.getDate() + 1);
          candidate = d.toISOString().slice(0, 10);
          moved = true;
        }
      }
    }
    return candidate;
  },

  createAllocation(input: Omit<Allocation, 'allocation_id' | 'status'> & { status?: Allocation['status'] }): Allocation {
    const allocId = nextAllocationId();
    const allocation: Allocation = {
      allocation_id: allocId,
      status: input.status ?? (input.start_date <= todayISO() ? 'Active' : 'Scheduled'),
      ...input,
    };
    state = { ...state, allocations: [...state.allocations, allocation] };
    patch.addedAllocations.push(allocation);

    // Keep fleet status coherent with the new booking.
    const unit = state.equipment.find((e) => e.equipment_id === input.equipment_id);
    if (unit && allocation.status === 'Active') {
      this.setEquipmentStatus(unit.equipment_id, 'Allocated', input.end_date);
    }
    emit();
    return allocation;
  },

  cancelAllocation(allocationId: string): void {
    const alloc = state.allocations.find((a) => a.allocation_id === allocationId);
    if (!alloc) return;

    state = {
      ...state,
      allocations: state.allocations.map((a) =>
        a.allocation_id === allocationId ? { ...a, status: 'Cancelled' as Allocation['status'] } : a
      ),
    };

    // Persist
    const addedIdx = patch.addedAllocations.findIndex((a) => a.allocation_id === allocationId);
    if (addedIdx >= 0) {
      patch.addedAllocations[addedIdx] = { ...patch.addedAllocations[addedIdx], status: 'Cancelled' };
    } else {
      patch.cancelledAllocationIds.push(allocationId);
    }

    const entry: AuditEntry = {
      id: nextAuditId(), equipment_id: alloc.equipment_id, action: 'ALLOCATION_RELEASED',
      previous_project: alloc.project_id,
      details: `Allocation ${allocationId} cancelled for project ${alloc.project_id}`,
      timestamp: new Date().toISOString(), operator: CURRENT_USER_ID,
    };
    state = { ...state, auditLog: [...state.auditLog, entry] };
    patch.auditLog.push(entry);
    // Don't emit here — caller will handle status update and emit
  },

  // ─── Emergency shift ──────────────────────────────────────────────────────

  recordShift(record: Omit<ShiftRecord, 'id' | 'timestamp' | 'operator'>): ShiftRecord {
    const shift: ShiftRecord = {
      ...record,
      id: nextShiftId(),
      timestamp: new Date().toISOString(),
      operator: CURRENT_USER_ID,
    };
    state = { ...state, shiftHistory: [...state.shiftHistory, shift] };
    patch.shiftHistory.push(shift);

    const entry: AuditEntry = {
      id: nextAuditId(), equipment_id: record.equipment_id, action: 'EMERGENCY_SHIFT',
      previous_project: record.from_project_id,
      new_project: record.to_project_id,
      reason: record.reason,
      details: `Emergency shift from ${record.from_location} to ${record.to_location}`,
      timestamp: new Date().toISOString(), operator: CURRENT_USER_ID,
    };
    state = { ...state, auditLog: [...state.auditLog, entry] };
    patch.auditLog.push(entry);
    emit();
    return shift;
  },

  // ─── Existing mutations ───────────────────────────────────────────────────

  updateRequestStatus(requestId: string, status: PendingRequest['status']) {
    state = {
      ...state,
      requests: state.requests.map((r) => (r.request_id === requestId ? { ...r, status } : r)),
    };
    emit();
  },

  acknowledgeAlert(alertId: string) {
    state = {
      ...state,
      alerts: state.alerts.map((a) => (a.alert_id === alertId ? { ...a, acknowledged: true } : a)),
    };
    emit();
  },
};
