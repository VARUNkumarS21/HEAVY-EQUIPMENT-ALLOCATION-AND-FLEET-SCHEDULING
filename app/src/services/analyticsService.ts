import { store } from './store';
import { addDays, daysBetween, todayISO } from '@/lib/dateUtils';

// Analytics are derived from allocations, maintenance and fleet status —
// nothing is hardcoded.

export interface AnalyticsData {
  utilizationTrend: { week: string; utilization: number }[];
  statusDistribution: { name: string; value: number; fill: string }[];
  allocationByProject: { project: string; allocations: number }[];
  demandByType: { type: string; demand: number; fleet: number }[];
  maintenanceDowntime: { equipment: string; days: number }[];
  priorityDistribution: { priority: string; count: number; fill: string }[];
  avgAllocationDuration: number;
  idleUnits: number;
  conflictCount: number;
}

export function computeAnalytics(): AnalyticsData {
  const equipment = store.equipment;
  const allocations = store.allocations;
  const maintenance = store.maintenance;
  const projects = store.projects;

  // Utilization trend: last 8 weeks, % of fleet under an active allocation each week.
  const trend: { week: string; utilization: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const day = addDays(todayISO(), -w * 7);
    const activeThatDay = allocations.filter(
      (a) => a.status !== 'Cancelled' && a.start_date <= day && a.end_date >= day,
    ).length;
    trend.push({
      week: w === 0 ? 'Now' : `-${w}w`,
      utilization: Math.min(100, Math.round((activeThatDay / equipment.length) * 100)),
    });
  }

  const statusColors: Record<string, string> = {
    Available: '#34d399', Allocated: '#f5a524', Maintenance: '#f87171', Unavailable: '#64748b',
  };
  const statusDistribution = (['Available', 'Allocated', 'Maintenance', 'Unavailable'] as const).map((s) => ({
    name: s,
    value: equipment.filter((e) => e.status === s).length,
    fill: statusColors[s],
  })).filter((d) => d.value > 0);

  const allocationByProject = projects
    .map((p) => ({
      project: p.project_id,
      allocations: allocations.filter((a) => a.project_id === p.project_id && a.status !== 'Cancelled').length,
    }))
    .filter((d) => d.allocations > 0)
    .sort((a, b) => b.allocations - a.allocations);

  const demandMap = new Map<string, number>();
  allocations.filter((a) => a.status !== 'Cancelled').forEach((a) => {
    const unit = equipment.find((e) => e.equipment_id === a.equipment_id);
    if (unit) demandMap.set(unit.equipment_type, (demandMap.get(unit.equipment_type) ?? 0) + 1);
  });
  const fleetMap = new Map<string, number>();
  equipment.forEach((e) => fleetMap.set(e.equipment_type, (fleetMap.get(e.equipment_type) ?? 0) + 1));
  const demandByType = [...fleetMap.entries()]
    .map(([type, fleet]) => ({ type, demand: demandMap.get(type) ?? 0, fleet }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 8);

  const maintenanceDowntime = maintenance
    .filter((m) => m.status !== 'Completed')
    .map((m) => ({
      equipment: m.equipment_id,
      days: daysBetween(m.start_date, m.end_date) + 1,
    }))
    .sort((a, b) => b.days - a.days);

  const priorityColors: Record<string, string> = { CRITICAL: '#f87171', HIGH: '#f5a524', MEDIUM: '#38bdf8' };
  const priorityDistribution = (['CRITICAL', 'HIGH', 'MEDIUM'] as const).map((p) => ({
    priority: p,
    count: projects.filter((pr) => pr.priority === p).length,
    fill: priorityColors[p],
  }));

  const durations = allocations.filter((a) => a.status !== 'Cancelled')
    .map((a) => daysBetween(a.start_date, a.end_date) + 1);
  const avgAllocationDuration = durations.length
    ? Math.round((durations.reduce((s, d) => s + d, 0) / durations.length) * 10) / 10
    : 0;

  const idleUnits = equipment.filter((e) => e.status === 'Available').length;

  const conflictCount = maintenance.filter((m) =>
    m.status !== 'Completed'
    && allocations.some((a) =>
      a.equipment_id === m.equipment_id
      && (a.status === 'Active' || a.status === 'Scheduled')
      && a.start_date <= m.end_date && m.start_date <= a.end_date),
  ).length;

  return {
    utilizationTrend: trend,
    statusDistribution,
    allocationByProject,
    demandByType,
    maintenanceDowntime,
    priorityDistribution,
    avgAllocationDuration,
    idleUnits,
    conflictCount,
  };
}
