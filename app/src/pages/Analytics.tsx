import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader, Panel, SectionHeader } from '@/components/common/Chrome';
import { computeAnalytics } from '@/services/analyticsService';
import { useStore } from '@/hooks/useStore';

const TOOLTIP_STYLE = {
  background: 'hsl(222 16% 9%)',
  border: '1px solid hsl(218 13% 19%)',
  borderRadius: 4,
  fontSize: 12,
};

export default function Analytics() {
  useStore();
  const data = computeAnalytics();

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Analytics" subtitle="Fleet utilization, allocation efficiency and maintenance downtime — derived from live operational data." />

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Panel className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Avg Allocation Duration</p>
          <p className="font-display mt-1 text-3xl font-semibold text-foreground">{data.avgAllocationDuration}<span className="ml-1 text-sm text-muted-foreground">days</span></p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Idle Units</p>
          <p className="font-display mt-1 text-3xl font-semibold text-emerald-400">{data.idleUnits}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Allocation / Maintenance Conflicts</p>
          <p className="font-display mt-1 text-3xl font-semibold text-red-400">{data.conflictCount}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Current Utilization</p>
          <p className="font-display mt-1 text-3xl font-semibold text-primary">{data.utilizationTrend.at(-1)?.utilization ?? 0}%</p>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <SectionHeader title="Equipment Utilization Trend" subtitle="% of fleet under active allocation, last 8 weeks" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.utilizationTrend} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="util" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5a524" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f5a524" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(218 13% 17%)" vertical={false} />
                <XAxis dataKey="week" stroke="hsl(215 12% 58%)" fontSize={11} />
                <YAxis stroke="hsl(215 12% 58%)" fontSize={11} unit="%" />
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e8eaed' }} />
                <Area type="monotone" dataKey="utilization" stroke="#f5a524" strokeWidth={2} fill="url(#util)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-4">
          <SectionHeader title="Equipment Status Distribution" subtitle="Live fleet composition" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.statusDistribution} dataKey="value" nameKey="name" outerRadius={88} innerRadius={46} strokeWidth={2} stroke="hsl(222 14% 10.5%)" label={({ name, value }) => `${name} ${value}`} fontSize={11}>
                  {data.statusDistribution.map((d) => <Cell key={d.name} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e8eaed' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-4">
          <SectionHeader title="Allocation by Project" subtitle="Active & scheduled bookings per site" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.allocationByProject} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid stroke="hsl(218 13% 17%)" vertical={false} />
                <XAxis dataKey="project" stroke="hsl(215 12% 58%)" fontSize={11} />
                <YAxis allowDecimals={false} stroke="hsl(215 12% 58%)" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e8eaed' }} cursor={{ fill: 'rgba(245,165,36,0.06)' }} />
                <Bar dataKey="allocations" fill="#f5a524" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-4">
          <SectionHeader title="Equipment Demand vs Fleet" subtitle="Booked units vs owned units per type" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.demandByType} layout="vertical" margin={{ left: 26, right: 16, top: 4 }}>
                <CartesianGrid stroke="hsl(218 13% 17%)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} stroke="hsl(215 12% 58%)" fontSize={11} />
                <YAxis type="category" dataKey="type" stroke="hsl(215 12% 58%)" fontSize={10} width={92} />
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e8eaed' }} cursor={{ fill: 'rgba(245,165,36,0.06)' }} />
                <Bar dataKey="demand" name="Demand" fill="#f5a524" radius={[0, 2, 2, 0]} />
                <Bar dataKey="fleet" name="Fleet size" fill="#38bdf8" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-4">
          <SectionHeader title="Maintenance Downtime" subtitle="Open window length per unit (days)" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.maintenanceDowntime} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid stroke="hsl(218 13% 17%)" vertical={false} />
                <XAxis dataKey="equipment" stroke="hsl(215 12% 58%)" fontSize={11} />
                <YAxis allowDecimals={false} stroke="hsl(215 12% 58%)" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e8eaed' }} cursor={{ fill: 'rgba(248,113,113,0.06)' }} />
                <Bar dataKey="days" fill="#f87171" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-4">
          <SectionHeader title="Project Priority Distribution" subtitle="Portfolio exposure by priority band" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.priorityDistribution} margin={{ left: -18, right: 16, top: 8 }}>
                <CartesianGrid stroke="hsl(218 13% 17%)" vertical={false} />
                <XAxis dataKey="priority" stroke="hsl(215 12% 58%)" fontSize={11} />
                <YAxis allowDecimals={false} stroke="hsl(215 12% 58%)" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e8eaed' }} />
                <Line type="monotone" dataKey="count" stroke="#f5a524" strokeWidth={2} dot={{ r: 5, fill: '#f5a524' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
