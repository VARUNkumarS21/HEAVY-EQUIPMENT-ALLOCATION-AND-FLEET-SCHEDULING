import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, BrainCircuit, Calendar, Menu, Search, User, MapPin } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { LOCATIONS } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface SearchResult {
  group: string;
  id: string;
  label: string;
  sub: string;
  to: string;
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const store = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [site, setSite] = useState('All Sites');
  const searchRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const unreadAlerts = store.alerts.filter((a) => !a.acknowledged).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: SearchResult[] = [];
    store.equipment.forEach((e) => {
      if ([e.equipment_id, e.model, e.equipment_type, e.current_location].some((f) => f.toLowerCase().includes(q))) {
        out.push({ group: 'Equipment', id: `eq-${e.equipment_id}`, label: `${e.equipment_id} — ${e.equipment_type}`, sub: `${e.model} · ${e.status} · ${e.current_location}`, to: `/fleet/${e.equipment_id}` });
      }
    });
    store.projects.forEach((p) => {
      if ([p.project_id, p.project_name, p.project_type, p.location].some((f) => f.toLowerCase().includes(q))
        || q.replace('project ', 'prj-') === p.project_id.toLowerCase()) {
        out.push({ group: 'Projects', id: `pr-${p.project_id}`, label: `${p.project_id} — ${p.project_name}`, sub: `${p.project_type} · ${p.priority} · ${p.current_phase}`, to: `/projects/${p.project_id}` });
      }
    });
    store.allocations.forEach((a) => {
      if ([a.allocation_id, a.equipment_id, a.project_id, a.job_type].some((f) => f.toLowerCase().includes(q))) {
        out.push({ group: 'Allocations', id: `al-${a.allocation_id}`, label: `${a.allocation_id} — ${a.job_type}`, sub: `${a.equipment_id} → ${a.project_id} · ${a.status}`, to: '/allocations' });
      }
    });
    store.maintenance.forEach((m) => {
      if ([m.maintenance_id, m.equipment_id, m.maintenance_type].some((f) => f.toLowerCase().includes(q))) {
        out.push({ group: 'Maintenance', id: `mt-${m.maintenance_id}`, label: `${m.maintenance_id} — ${m.maintenance_type}`, sub: `${m.equipment_id} · ${m.status}`, to: '/maintenance' });
      }
    });
    store.requests.forEach((r) => {
      if ([r.request_id, r.equipment_type, r.project_id].some((f) => f.toLowerCase().includes(q))) {
        out.push({ group: 'Requests', id: `rq-${r.request_id}`, label: `${r.request_id} — ${r.equipment_type}`, sub: `${r.project_id} · ${r.status}`, to: '/requests' });
      }
    });
    return out.slice(0, 12);
  }, [query, store]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    results.forEach((r) => map.set(r.group, [...(map.get(r.group) ?? []), r]));
    return [...map.entries()];
  }, [results]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
      <button className="text-muted-foreground lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      {/* Global search */}
      <div ref={searchRef} className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder='Search equipment, projects, allocations… try "EQ002" or "Tower Crane"'
          className="h-9 w-full rounded-sm border border-input bg-secondary/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
          aria-label="Global search"
        />
        {open && results.length > 0 && (
          <div className="absolute left-0 right-0 top-11 max-h-96 overflow-y-auto rounded-sm border border-border bg-popover shadow-xl scrollbar-thin">
            {grouped.map(([group, items]) => (
              <div key={group}>
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{group}</p>
                {items.map((r) => (
                  <button
                    key={r.id}
                    className="block w-full px-3 py-2 text-left hover:bg-secondary/70"
                    onClick={() => { setOpen(false); setQuery(''); navigate(r.to); }}
                  >
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.sub}</p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Site selector */}
        <div className="hidden items-center gap-1.5 rounded-sm border border-input bg-secondary/50 px-2 md:flex">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <select
            value={site}
            onChange={(e) => { setSite(e.target.value); if (e.target.value !== 'All Sites') navigate('/site-map'); }}
            className="h-9 bg-transparent text-xs font-medium text-foreground focus:outline-none"
            aria-label="Active site"
          >
            <option className="bg-popover">All Sites</option>
            {LOCATIONS.map((l) => <option key={l.name} className="bg-popover">{l.name}</option>)}
          </select>
        </div>

        <span className="hidden items-center gap-1.5 px-2 font-mono-tech text-xs text-muted-foreground xl:flex">
          <Calendar className="h-3.5 w-3.5" />
          {today}
        </span>

        <button
          onClick={() => navigate('/ai-command-center')}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          title="AI Command Center"
          aria-label="Open AI Command Center"
        >
          <BrainCircuit className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={() => navigate('/alerts')}
          className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-input text-muted-foreground transition-colors hover:text-foreground"
          title="Alerts"
          aria-label="Open alert center"
        >
          <Bell className="h-4 w-4" />
          {unreadAlerts > 0 && (
            <span className={cn('absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono-tech text-[9px] font-bold text-white')}>
              {unreadAlerts}
            </span>
          )}
        </button>

        <button
          className="flex h-9 items-center gap-2 rounded-sm border border-input px-2 text-muted-foreground transition-colors hover:text-foreground"
          title="Operations Manager"
        >
          <User className="h-4 w-4" />
          <span className="hidden text-xs font-medium lg:block">Ops Manager</span>
        </button>
      </div>
    </header>
  );
}
