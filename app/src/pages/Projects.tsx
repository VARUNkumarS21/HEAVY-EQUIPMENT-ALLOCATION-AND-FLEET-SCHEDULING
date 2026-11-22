import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowUpDown } from 'lucide-react';
import { PageHeader, Panel, EmptyState } from '@/components/common/Chrome';
import { ProjectPriorityBadge, PhaseStatusBadge } from '@/components/common/Badges';
import { projectService } from '@/services/entityServices';
import type { Project, ProjectPriority, ProjectStatus } from '@/types/models';
import { daysBetween, formatDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

type SortKey = 'priority' | 'start_date' | 'end_date' | 'demand';

const PRIORITY_ORDER: Record<ProjectPriority, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
const HEALTH_STYLES: Record<string, string> = { 'On Track': 'text-emerald-400', 'At Risk': 'text-amber-400', 'Delayed': 'text-red-400' };

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [priority, setPriority] = useState<ProjectPriority | 'All'>((searchParams.get('priority') as ProjectPriority) ?? 'All');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState<ProjectStatus | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('priority');

  useEffect(() => {
    projectService.list().then(setProjects);
  }, []);

  const types = useMemo(() => [...new Set(projects.map((p) => p.project_type))], [projects]);

  const filtered = useMemo(() => {
    let list = projects.filter((p) =>
      (priority === 'All' || p.priority === priority)
      && (type === 'All' || p.project_type === type)
      && (status === 'All' || p.status === status));
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'priority': return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case 'start_date': return a.start_date < b.start_date ? -1 : 1;
        case 'end_date': return a.end_date < b.end_date ? -1 : 1;
        case 'demand': return projectService.allocatedCount(b.project_id) - projectService.allocatedCount(a.project_id);
      }
    });
    return list;
  }, [projects, priority, type, status, sortKey]);

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Projects" subtitle="Project portfolio, construction phases and equipment demand across all sites." />

      <Panel className="mb-4 flex flex-wrap items-center gap-2 p-3">
        {(['All', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((p) => (
          <button key={p} onClick={() => setPriority(p)}
            className={cn('rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors',
              priority === p ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
            {p}
          </button>
        ))}
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by project type"
          className="h-8 rounded-sm border border-input bg-secondary/50 px-2 text-xs text-foreground focus:outline-none">
          <option>All</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus | 'All')} aria-label="Filter by status"
          className="h-8 rounded-sm border border-input bg-secondary/50 px-2 text-xs text-foreground focus:outline-none">
          {(['All', 'Active', 'Planning', 'On Hold', 'Completed'] as const).map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} aria-label="Sort projects"
            className="h-8 rounded-sm border border-input bg-secondary/50 px-2 text-xs text-foreground focus:outline-none">
            <option value="priority">Priority</option>
            <option value="start_date">Start Date</option>
            <option value="end_date">End Date</option>
            <option value="demand">Equipment Demand</option>
          </select>
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState title="No projects match" message="Adjust the filters to widen the portfolio view." />
      ) : (
        <Panel className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {['Project', 'Type', 'Priority', 'Timeline', 'Duration', 'Equipment', 'Current Phase', 'Schedule Health'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const health = projectService.scheduleHealth(p);
                return (
                  <tr key={p.project_id} onClick={() => navigate(`/projects/${p.project_id}`)}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <p className="font-mono-tech text-xs text-primary">{p.project_id}</p>
                      <p className="font-medium text-foreground">{p.project_name}</p>
                      <p className="text-xs text-muted-foreground">{p.location}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground/85">{p.project_type}</td>
                    <td className="px-4 py-3"><ProjectPriorityBadge priority={p.priority} /></td>
                    <td className="px-4 py-3 font-mono-tech text-xs text-foreground/85">{formatDate(p.start_date)} → {formatDate(p.end_date)}</td>
                    <td className="px-4 py-3 font-mono-tech text-xs text-foreground/85">{daysBetween(p.start_date, p.end_date)} d</td>
                    <td className="px-4 py-3 text-foreground/85">{projectService.allocatedCount(p.project_id)} / {projectService.requiredCount(p)} units</td>
                    <td className="px-4 py-3"><PhaseStatusBadge status={p.phases.find((ph) => ph.name === p.current_phase)?.status ?? 'Upcoming'} /></td>
                    <td className={cn('px-4 py-3 font-semibold', HEALTH_STYLES[health])}>{health}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
