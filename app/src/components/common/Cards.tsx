import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { Equipment, Project } from '@/types/models';
import { EquipmentStatusBadge, ProjectPriorityBadge } from './Badges';
import { formatDate, formatDateFull } from '@/lib/dateUtils';
import { projectService } from '@/services/entityServices';

export function KpiCard({
  label, value, trend, trendLabel, icon, to, accent = false, onClick,
}: {
  label: string;
  value: ReactNode;
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  to?: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={onClick ?? (to ? () => navigate(to) : undefined)}
      className={cn(
        'panel-steel group relative overflow-hidden rounded-md p-4 text-left transition-all hover:border-primary/40 hover:shadow-[0_0_24px_rgba(245,165,36,0.08)]',
        accent && 'border-primary/30',
      )}
    >
      <div className="absolute right-0 top-0 h-1 w-10 hazard-stripes-subtle" />
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground/70 group-hover:text-primary transition-colors">{icon}</span>}
      </div>
      <p className={cn('font-display mt-2 text-4xl font-semibold leading-none', accent ? 'text-primary text-glow-amber' : 'text-foreground')}>
        {value}
      </p>
      {trend !== undefined && (
        <p className={cn('mt-2 flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
          {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trend >= 0 ? '+' : ''}{trend}%
          <span className="text-muted-foreground font-normal">{trendLabel ?? 'vs previous period'}</span>
        </p>
      )}
    </button>
  );
}

export function EquipmentImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-secondary/60', className)}>
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 hazard-stripes-subtle" />
    </div>
  );
}

export function EquipmentCard({ equipment, onClick, actionMenu, footer }: { equipment: Equipment; onClick?: () => void; actionMenu?: ReactNode; footer?: ReactNode }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className="panel-steel group cursor-pointer overflow-hidden rounded-md transition-all hover:border-primary/40 hover:shadow-[0_0_24px_rgba(245,165,36,0.08)]"
    >
      <EquipmentImage src={equipment.image_url} alt={`${equipment.equipment_type} ${equipment.model}`} className="h-40" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono-tech text-xs text-primary">{equipment.equipment_id}</p>
            <h3 className="font-display text-lg font-semibold uppercase tracking-wide leading-tight">{equipment.equipment_type}</h3>
            <p className="text-xs text-muted-foreground font-mono-tech">{equipment.model}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <EquipmentStatusBadge status={equipment.status} pulse />
              {actionMenu}
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p className="flex justify-between"><span>Location</span><span className="text-foreground/90">{equipment.current_location}</span></p>
          <p className="flex justify-between"><span>Next available</span><span className="text-foreground/90 font-mono-tech">{formatDateFull(equipment.next_available_date)}</span></p>
        </div>
        {footer && <div className="mt-3 border-t border-border pt-3">{footer}</div>}
      </div>
    </div>
  );
}

const SCHEDULE_HEALTH_STYLES: Record<string, string> = {
  'On Track': 'text-emerald-400',
  'At Risk': 'text-amber-400',
  'Delayed': 'text-red-400',
};

export function ProjectCard({ project, onClick }: { project: Project; onClick?: () => void }) {
  const allocated = projectService.allocatedCount(project.project_id);
  const required = projectService.requiredCount(project);
  const health = projectService.scheduleHealth(project);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className="panel-steel cursor-pointer rounded-md p-4 transition-all hover:border-primary/40 hover:shadow-[0_0_24px_rgba(245,165,36,0.08)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono-tech text-xs text-primary">{project.project_id}</p>
          <h3 className="font-display text-xl font-semibold uppercase tracking-wide leading-tight">{project.project_name}</h3>
          <p className="text-xs text-muted-foreground">{project.project_type} · {project.location}</p>
        </div>
        <ProjectPriorityBadge priority={project.priority} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <p className="text-muted-foreground">Timeline</p>
        <p className="text-right font-mono-tech text-foreground/90">{formatDate(project.start_date)} → {formatDate(project.end_date)}</p>
        <p className="text-muted-foreground">Current phase</p>
        <p className="text-right text-foreground/90">{project.current_phase}</p>
        <p className="text-muted-foreground">Equipment</p>
        <p className="text-right text-foreground/90">{allocated} allocated / {required} required</p>
        <p className="text-muted-foreground">Schedule</p>
        <p className={cn('text-right font-semibold', SCHEDULE_HEALTH_STYLES[health])}>{health}</p>
      </div>
    </div>
  );
}
