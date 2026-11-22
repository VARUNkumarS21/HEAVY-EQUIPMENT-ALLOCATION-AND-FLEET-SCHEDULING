import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { PageHeader, Panel, SectionHeader, EmptyState } from '@/components/common/Chrome';
import { EquipmentImage } from '@/components/common/Cards';
import { EQUIPMENT_CATALOG, CATALOG_CATEGORIES } from '@/data/catalog';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';

export default function Catalog() {
  const store = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const fleetCount = useMemo(() => {
    const map = new Map<string, number>();
    store.equipment.forEach((e) => map.set(e.equipment_type, (map.get(e.equipment_type) ?? 0) + 1));
    return map;
  }, [store.equipment]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CATALOG_CATEGORIES.map((cat) => ({
      category: cat,
      entries: EQUIPMENT_CATALOG.filter((e) => e.category === cat
        && (!q || e.type.toLowerCase().includes(q) || e.purpose.toLowerCase().includes(q) || e.primary_uses.some((u) => u.toLowerCase().includes(q)))),
    })).filter((g) => g.entries.length > 0);
  }, [search]);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Equipment Catalog"
        subtitle="The construction knowledge base — what each machine class does, which phase it belongs to, and how much of it the fleet owns."
      />

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search equipment type, purpose or use case..."
          className="h-10 w-full rounded-sm border border-input bg-secondary/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
        />
      </div>

      {filtered.length === 0 && <EmptyState title="No catalog entries match" message="Try a broader search term." />}

      {filtered.map((group) => (
        <div key={group.category} className="mb-8">
          <SectionHeader title={group.category} subtitle={`${group.entries.length} equipment class${group.entries.length === 1 ? '' : 'es'}`} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.entries.map((entry) => (
              <Panel key={entry.type} className="group overflow-hidden">
                <EquipmentImage src={entry.image_url} alt={entry.type} className="h-36" />
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-xl font-semibold uppercase tracking-wide">{entry.type}</h3>
                    <span className="rounded-sm border border-border bg-secondary/50 px-2 py-0.5 font-mono-tech text-[11px] text-muted-foreground">
                      fleet × {fleetCount.get(entry.type) ?? 0}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{entry.purpose}</p>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <p><span className="font-semibold uppercase tracking-wider text-primary">Used for: </span><span className="text-foreground/80">{entry.primary_uses.slice(0, 4).join(', ')}</span></p>
                    <p><span className="font-semibold uppercase tracking-wider text-sky-300">Phases: </span><span className="text-foreground/80">{entry.construction_phases.join(' · ')}</span></p>
                    <p><span className="font-semibold uppercase tracking-wider text-emerald-300">Scale: </span><span className="text-foreground/80">{entry.suitable_project_types.join(', ')}</span></p>
                  </div>
                  <button
                    onClick={() => navigate(`/fleet?type=${encodeURIComponent(entry.type)}`)}
                    className={cn('mt-3 text-[11px] font-semibold uppercase tracking-wider text-primary hover:underline')}
                  >
                    View fleet units →
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
