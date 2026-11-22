import { store } from './store';
import type { Project, Allocation, MaintenanceRecord, PendingRequest, AlertItem } from '@/types/models';
import { todayISO } from '@/lib/dateUtils';

export const projectService = {
  async list(): Promise<Project[]> {
    return store.projects;
  },
  async get(id: string): Promise<Project | undefined> {
    return store.getProject(id);
  },
  async active(): Promise<Project[]> {
    return store.projects.filter((p) => p.status === 'Active');
  },
  async critical(): Promise<Project[]> {
    return store.projects.filter((p) => p.priority === 'CRITICAL' && p.status === 'Active');
  },
  allocatedCount(projectId: string): number {
    return store.allocations.filter(
      (a) => a.project_id === projectId && (a.status === 'Active' || a.status === 'Scheduled'),
    ).length;
  },
  requiredCount(project: Project): number {
    const phase = project.phases.find((ph) => ph.name === project.current_phase)
      ?? project.phases.find((ph) => ph.status === 'In Progress');
    return phase ? phase.required_equipment_types.length : 0;
  },
  scheduleHealth(project: Project): 'On Track' | 'At Risk' | 'Delayed' {
    if (project.delay_reason) return 'Delayed';
    const phase = project.phases.find((ph) => ph.status === 'In Progress');
    if (phase && phase.end_date < todayISO()) return 'At Risk';
    return 'On Track';
  },
};

export const allocationService = {
  async list(): Promise<Allocation[]> {
    return [...store.allocations].sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
  },
  async create(input: Omit<Allocation, 'allocation_id' | 'status'>): Promise<Allocation> {
    return store.createAllocation(input);
  },
  conflictsFor(equipmentId: string, start: string, end: string) {
    return {
      allocations: store.conflictingAllocations(equipmentId, start, end),
      maintenance: store.conflictingMaintenance(equipmentId, start, end),
    };
  },
};

export const maintenanceService = {
  async list(): Promise<MaintenanceRecord[]> {
    return [...store.maintenance].sort((a, b) => (a.start_date < b.start_date ? -1 : 1));
  },
  async upcoming(): Promise<MaintenanceRecord[]> {
    const t = todayISO();
    return store.maintenance.filter((m) => m.status !== 'Completed' && m.end_date >= t);
  },
};

export const requestService = {
  async list(): Promise<PendingRequest[]> {
    return store.requests;
  },
  async pending(): Promise<PendingRequest[]> {
    return store.requests.filter((r) => r.status === 'Pending' || r.status === 'Waitlisted');
  },
  async setStatus(id: string, status: PendingRequest['status']) {
    store.updateRequestStatus(id, status);
  },
};

export const alertService = {
  async list(): Promise<AlertItem[]> {
    return [...store.alerts].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },
  async unacknowledged(): Promise<AlertItem[]> {
    return store.alerts.filter((a) => !a.acknowledged);
  },
  async acknowledge(id: string) {
    store.acknowledgeAlert(id);
  },
};
