import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Truck, CheckCircle2, ArrowLeftRight, Wrench, FolderKanban, AlertOctagon, ClipboardList, Gauge, ArrowRight } from 'lucide-react';
import { PageHeader, Panel, SectionHeader } from '@/components/common/Chrome';
import { KpiCard, ProjectCard } from '@/components/common/Cards';
import { projectService, requestService, alertService } from '@/services/entityServices';
import { equipmentService } from '@/services/equipmentService';
import type { FleetSummary } from '@/services/equipmentService';
import type { Project, AlertItem } from '@/types/models';
import { AlertSeverityBadge } from '@/components/common/Badges';
import { formatDateTime } from '@/lib/dateUtils';

const AVAIL_COLORS: Record<string, string> = {
  Available: '#34d399', Allocated: '#f5a524', Maintenance: '#f87171', Unavailable: '#64748b',
};
const PRIORITY_COLORS: Record<string, string> = { CRITICAL: '#f87171', HIGH: '#f5a524', MEDIUM: '#38bdf8' };

export default function Overview() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    equipmentService.summary().then(setSummary);
    projectService.active().then(setProjects);
    requestService.pending().then((r) => setPendingCount(r.length));
    alertService.list().then((a) => setAlerts(a.slice(0, 4)));
  }, []);

  if (!summary) return null;

  const availabilityData = [
    { name: 'Available', value: summary.available },
    { name: 'Allocated', value: summary.allocated },
    { name: 'Maintenance', value: summary.maintenance },
    { name: 'Unavailable', value: summary.unavailable },
  ].filter((d) => d.value > 0);

  const priorityData = (['CRITICAL', 'HIGH', 'MEDIUM'] as const).map((p) => ({
    name: p, value: projects.filter((pr) => pr.priority === p).length,
  }));

  const criticalProjects = projects.filter((p) => p.priority === 'CRITICAL');

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Construction Operations Command Center"
        subtitle="Monitor projects, equipment availability, allocations and AI-generated scheduling recommendations."
        actions={
          <button
            onClick={() => navigate('/ai-command-center')}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ask AI Assistant <ArrowRight className="h-3.5 w-3.5" />
          </button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <KpiCard label="Total Equipment" value={summary.total} trend={4.5} icon={<Truck className="h-4 w-4" />} onClick={() => navigate('/fleet')} />
        <KpiCard label="Available" value={summary.available} trend={8.4} icon={<CheckCircle2 className="h-4 w-4" />} accent onClick={() => navigate('/fleet?status=Available')} />
        <KpiCard label="Allocated" value={summary.allocated} trend={2.1} icon={<ArrowLeftRight className="h-4 w-4" />} onClick={() => navigate('/allocations')} />
        <KpiCard label="Maintenance" value={summary.maintenance} trend={-3.2} icon={<Wrench className="h-4 w-4" />} onClick={() => navigate('/maintenance')} />
        <KpiCard label="Active Projects" value={projects.length} trend={6.0} icon={<FolderKanban className="h-4 w-4" />} onClick={() => navigate('/projects')} />
        <KpiCard label="Critical Projects" value={criticalProjects.length} icon={<AlertOctagon className="h-4 w-4" />} onClick={() => navigate('/projects?priority=CRITICAL')} />
        <KpiCard label="Pending Requests" value={pendingCount} icon={<ClipboardList className="h-4 w-4" />} onClick={() => navigate('/requests')} />
        <KpiCard label="Utilization" value={`${summary.utilizationPct}%`} trend={1.8} icon={<Gauge className="h-4 w-4" />} onClick={() => navigate('/analytics')} />
      </div>

      {/* Operations overview charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="p-4">
          <SectionHeader title="Equipment Availability" subtitle="Live fleet status distribution" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={availabilityData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} strokeWidth={2} stroke="hsl(222 14% 10.5%)">
                  {availabilityData.map((d) => <Cell key={d.name} fill={AVAIL_COLORS[d.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222 16% 9%)', border: '1px solid hsl(218 13% 19%)', borderRadius: 4, fontSize: 12 }} itemStyle={{ color: '#e8eaed' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-1.5">
            {availabilityData.map((d) => (
              <p key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: AVAIL_COLORS[d.name] }} />
                {d.name} <span className="ml-auto font-mono-tech text-foreground">{d.value}</span>
              </p>
            ))}
          </div>
        </Panel>

        <Panel className="p-4">
          <SectionHeader title="Project Priority Overview" subtitle="Active project portfolio by priority" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid stroke="hsl(218 13% 17%)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} stroke="hsl(215 12% 58%)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="hsl(215 12% 58%)" fontSize={11} width={70} />
                <Tooltip contentStyle={{ background: 'hsl(222 16% 9%)', border: '1px solid hsl(218 13% 19%)', borderRadius: 4, fontSize: 12 }} itemStyle={{ color: '#e8eaed' }} cursor={{ fill: 'rgba(245,165,36,0.06)' }} />
                <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                  {priorityData.map((d) => <Cell key={d.name} fill={PRIORITY_COLORS[d.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-4">
          <SectionHeader title="Fleet Summary" subtitle="Units per equipment type — click to inspect" />
          <div className="scrollbar-thin max-h-64 space-y-1 overflow-y-auto pr-1">
            {summary.byType.map((t) => (
              <button
                key={t.type}
                onClick={() => navigate(`/fleet?type=${encodeURIComponent(t.type)}`)}
                className="flex w-full items-center justify-between rounded-sm border border-transparent px-2 py-1.5 text-left text-sm transition-colors hover:border-primary/30 hover:bg-secondary/50"
              >
                <span className="text-foreground/90">{t.type}</span>
                <span className="flex items-center gap-3">
                  <span className="text-[11px] text-emerald-400">{t.available} avail</span>
                  <span className="font-mono-tech text-base font-semibold text-foreground">{t.count}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {/* Active construction sites */}
      <div className="mt-6">
        <SectionHeader
          title="Active Construction Sites"
          subtitle={`${projects.length} projects in execution — click a project for the full detail view`}
          actions={<button onClick={() => navigate('/projects')} className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline">All projects →</button>}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.project_id} project={p} onClick={() => navigate(`/projects/${p.project_id}`)} />
          ))}
        </div>
      </div>

      {/* Latest alerts */}
      <div className="mt-6">
        <SectionHeader
          title="Operational Alerts"
          actions={<button onClick={() => navigate('/alerts')} className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline">Alert center →</button>}
        />
        <div className="space-y-2">
          {alerts.map((a) => (
            <Panel key={a.alert_id} className="flex items-start gap-3 px-4 py-3">
              <AlertSeverityBadge severity={a.severity} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="truncate text-xs text-muted-foreground">{a.message}</p>
              </div>
              <span className="shrink-0 font-mono-tech text-[11px] text-muted-foreground">{formatDateTime(a.created_at)}</span>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
