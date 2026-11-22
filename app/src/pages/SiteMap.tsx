import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin } from 'lucide-react';
import { PageHeader, Panel, SectionHeader } from '@/components/common/Chrome';
import { useStore } from '@/hooks/useStore';
import { LOCATIONS } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Schematic fleet map — clean visual fallback designed to be swapped for
// Google Maps / Mapbox later (positions are stored per location).
export default function SiteMap() {
  const store = useStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const stats = LOCATIONS.map((loc) => {
    const units = store.equipment.filter((e) => e.current_location === loc.name);
    return {
      loc,
      total: units.length,
      available: units.filter((e) => e.status === 'Available').length,
      allocated: units.filter((e) => e.status === 'Allocated').length,
      maintenance: units.filter((e) => e.status === 'Maintenance').length,
      units,
    };
  });

  const active = stats.find((s) => s.loc.name === selected);

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Fleet Site Map" subtitle="Schematic view of equipment positioning across sites and the depot. Map-provider integration ready." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel blueprint className="relative h-[480px] overflow-hidden lg:col-span-2">
          {/* schematic terrain lines */}
          <div className="absolute inset-x-0 top-1/3 h-px bg-border/60" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-border/60" />
          <p className="absolute left-3 top-3 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Schematic — Bengaluru operating region
          </p>
          {stats.map(({ loc, total, available }) => (
            <button
              key={loc.name}
              onClick={() => setSelected(loc.name)}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            >
              <span className={cn(
                'flex flex-col items-center transition-transform group-hover:scale-110',
                selected === loc.name && 'scale-110',
              )}>
                <MapPin className={cn('h-6 w-6 drop-shadow', total > 0 ? 'text-primary' : 'text-muted-foreground/50')} />
                <span className={cn(
                  'mt-0.5 whitespace-nowrap rounded-sm border px-1.5 py-0.5 font-mono-tech text-[10px]',
                  selected === loc.name ? 'border-primary/50 bg-primary/15 text-primary' : 'border-border bg-popover/90 text-foreground/80',
                )}>
                  {loc.name} · {total} <span className="text-emerald-400">({available} free)</span>
                </span>
              </span>
            </button>
          ))}
        </Panel>

        <Panel className="p-4">
          {!active ? (
            <>
              <SectionHeader title="Select a Location" />
              <p className="text-sm text-muted-foreground">Click a pin to inspect the fleet positioned at that site.</p>
              <div className="mt-4 space-y-2">
                {stats.map(({ loc, total, available, allocated, maintenance }) => (
                  <button key={loc.name} onClick={() => setSelected(loc.name)}
                    className="flex w-full items-center justify-between rounded-sm border border-border bg-secondary/30 px-3 py-2 text-left text-sm transition-colors hover:border-primary/40">
                    <span className="text-foreground/90">{loc.name}</span>
                    <span className="font-mono-tech text-xs text-muted-foreground">
                      {total} · <span className="text-emerald-400">{available}a</span> / <span className="text-amber-400">{allocated}d</span> / <span className="text-red-400">{maintenance}m</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <SectionHeader title={active.loc.name} subtitle={active.loc.description} />
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-sm border border-emerald-500/25 bg-emerald-500/5 p-2">
                  <p className="font-display text-2xl font-semibold text-emerald-400">{active.available}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Available</p>
                </div>
                <div className="rounded-sm border border-amber-500/25 bg-amber-500/5 p-2">
                  <p className="font-display text-2xl font-semibold text-amber-400">{active.allocated}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Allocated</p>
                </div>
                <div className="rounded-sm border border-red-500/25 bg-red-500/5 p-2">
                  <p className="font-display text-2xl font-semibold text-red-400">{active.maintenance}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Maintenance</p>
                </div>
              </div>
              <div className="scrollbar-thin mt-4 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                {active.units.length === 0 && <p className="text-sm text-muted-foreground">No equipment positioned here.</p>}
                {active.units.map((u) => (
                  <button key={u.equipment_id} onClick={() => navigate(`/fleet/${u.equipment_id}`)}
                    className="flex w-full items-center justify-between rounded-sm border border-border bg-secondary/30 px-3 py-2 text-left text-xs transition-colors hover:border-primary/40">
                    <span><span className="font-mono-tech text-primary">{u.equipment_id}</span> <span className="text-foreground/85">{u.equipment_type}</span></span>
                    <span className={cn('font-semibold uppercase tracking-wider',
                      u.status === 'Available' ? 'text-emerald-400' : u.status === 'Allocated' ? 'text-amber-400' : u.status === 'Maintenance' ? 'text-red-400' : 'text-slate-400')}>
                      {u.status}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
