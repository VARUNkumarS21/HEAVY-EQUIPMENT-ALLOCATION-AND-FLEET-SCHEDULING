import { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BrainCircuit, FolderKanban, Truck, ArrowLeftRight,
  CalendarRange, Wrench, ClipboardList, BookOpen, BarChart3, Bell, Settings, HardHat, X, Map,
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/ai-command-center', label: 'AI Command Center', icon: BrainCircuit, highlight: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/fleet', label: 'Equipment Fleet', icon: Truck },
  { to: '/allocations', label: 'Equipment Allocation', icon: ArrowLeftRight },
  { to: '/scheduler', label: 'Project Scheduler', icon: CalendarRange },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/requests', label: 'Pending Requests', icon: ClipboardList },
  { to: '/catalog', label: 'Equipment Catalog', icon: BookOpen },
  { to: '/site-map', label: 'Site Map', icon: Map },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const store = useStore();
  const navigate = useNavigate();
  const pendingCount = useMemo(
    () => store.requests.filter((r) => r.status === 'Pending' || r.status === 'Waitlisted').length,
    [store.requests],
  );
  const alertCount = useMemo(() => store.alerts.filter((a) => !a.acknowledged).length, [store.alerts]);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar-background transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <HardHat className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold uppercase tracking-widest text-foreground">Construmind</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">AI Operations</p>
          </div>
          <button className="ml-auto text-muted-foreground lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="hazard-stripes h-1 w-full opacity-80" />

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3">
          {NAV.map(({ to, label, icon: Icon, end, highlight }) => {
            const badge = label === 'Pending Requests' ? pendingCount : label === 'Alerts' ? alertCount : 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) => cn(
                  'mb-0.5 flex items-center gap-3 rounded-sm border-l-2 px-3 py-2 text-[13px] font-medium tracking-wide transition-colors',
                  isActive
                    ? 'border-primary bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'border-transparent text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                  highlight && !isActive && 'text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 font-mono-tech text-[10px] font-semibold text-primary">
                    {badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={() => { navigate('/ai-command-center'); onClose(); }}
          className="m-3 flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
        >
          <BrainCircuit className="h-4 w-4" />
          Ask the AI Assistant
        </button>
      </aside>
    </>
  );
}
