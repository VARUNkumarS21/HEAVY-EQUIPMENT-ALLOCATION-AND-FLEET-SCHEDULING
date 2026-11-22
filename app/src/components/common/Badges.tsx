import { cn } from '@/lib/utils';
import type { EquipmentStatus, ProjectPriority, AllocationStatus, MaintenanceStatus, RequestStatus, PhaseStatus, AlertSeverity } from '@/types/models';

// Status is always communicated with color AND label text (accessibility).

const EQUIPMENT_STYLES: Record<EquipmentStatus, { dot: string; text: string; ring: string }> = {
  Available: { dot: 'bg-emerald-400', text: 'text-emerald-300', ring: 'border-emerald-500/30 bg-emerald-500/10' },
  Allocated: { dot: 'bg-amber-400', text: 'text-amber-300', ring: 'border-amber-500/30 bg-amber-500/10' },
  Maintenance: { dot: 'bg-red-400', text: 'text-red-300', ring: 'border-red-500/30 bg-red-500/10' },
  Unavailable: { dot: 'bg-slate-400', text: 'text-slate-400', ring: 'border-slate-500/30 bg-slate-500/10' },
};

export function EquipmentStatusBadge({ status, pulse = false, className }: { status: EquipmentStatus; pulse?: boolean; className?: string }) {
  const s = EQUIPMENT_STYLES[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-sm', s.ring, s.text, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot, pulse && status === 'Available' && 'animate-pulse-dot')} />
      {status}
    </span>
  );
}

const PRIORITY_STYLES: Record<ProjectPriority, string> = {
  CRITICAL: 'border-red-500/40 bg-red-500/10 text-red-300',
  HIGH: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  MEDIUM: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
};

export function ProjectPriorityBadge({ priority, className }: { priority: ProjectPriority; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-bold tracking-widest rounded-sm', PRIORITY_STYLES[priority], className)}>
      {priority === 'CRITICAL' && <span className="hazard-stripes inline-block h-2 w-3 rounded-[1px]" />}
      {priority}
    </span>
  );
}

const ALLOCATION_STYLES: Record<AllocationStatus, string> = {
  Active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  Scheduled: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  Completed: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  Cancelled: 'border-red-500/30 bg-red-500/10 text-red-300',
};

export function AllocationStatusBadge({ status, className }: { status: AllocationStatus; className?: string }) {
  return <span className={cn('inline-flex border px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-sm', ALLOCATION_STYLES[status], className)}>{status}</span>;
}

const MAINT_STYLES: Record<MaintenanceStatus, string> = {
  'Under Maintenance': 'border-red-500/30 bg-red-500/10 text-red-300',
  Scheduled: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  Completed: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
};

export function MaintenanceStatusBadge({ status, className }: { status: MaintenanceStatus; className?: string }) {
  return <span className={cn('inline-flex border px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-sm', MAINT_STYLES[status], className)}>{status}</span>;
}

const REQUEST_STYLES: Record<RequestStatus, string> = {
  Pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  Matched: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  Scheduled: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  Waitlisted: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  Rejected: 'border-red-500/30 bg-red-500/10 text-red-300',
};

export function RequestStatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return <span className={cn('inline-flex border px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-sm', REQUEST_STYLES[status], className)}>{status}</span>;
}

const PHASE_STYLES: Record<PhaseStatus, string> = {
  Completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  'In Progress': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  Upcoming: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  Delayed: 'border-red-500/30 bg-red-500/10 text-red-300',
};

export function PhaseStatusBadge({ status, className }: { status: PhaseStatus; className?: string }) {
  return <span className={cn('inline-flex border px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-sm', PHASE_STYLES[status], className)}>{status}</span>;
}

const ALERT_STYLES: Record<AlertSeverity, { cls: string; label: string }> = {
  CRITICAL: { cls: 'border-red-500/40 bg-red-500/10 text-red-300', label: 'CRITICAL' },
  WARNING: { cls: 'border-amber-500/40 bg-amber-500/10 text-amber-300', label: 'WARNING' },
  INFO: { cls: 'border-sky-500/40 bg-sky-500/10 text-sky-300', label: 'INFO' },
  SUCCESS: { cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', label: 'SUCCESS' },
  AI: { cls: 'border-violet-500/40 bg-violet-500/10 text-violet-300', label: 'AI' },
};

export function AlertSeverityBadge({ severity, className }: { severity: AlertSeverity; className?: string }) {
  const s = ALERT_STYLES[severity];
  return <span className={cn('inline-flex border px-2 py-0.5 text-[11px] font-bold tracking-widest rounded-sm', s.cls, className)}>{s.label}</span>;
}
