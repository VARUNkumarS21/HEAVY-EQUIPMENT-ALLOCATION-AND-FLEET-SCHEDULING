import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader, Panel } from '@/components/common/Chrome';
import { EquipmentStatusBadge } from '@/components/common/Badges';
import { EquipmentImage } from '@/components/common/Cards';
import { useStore } from '@/hooks/useStore';
import { formatDateFull } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EquipmentCompare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const store = useStore();
  const ids = (searchParams.get('ids') ?? '').split(',').filter(Boolean);
  const units = ids.map((id) => store.equipment.find((e) => e.equipment_id === id)).filter(Boolean);

  if (units.length < 2) {
    return (
      <div>
        <PageHeader title="Equipment Comparison" subtitle="Select at least two machines from the fleet page to compare." />
        <Button variant="outline" className="border-border" onClick={() => navigate('/fleet')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to fleet
        </Button>
      </div>
    );
  }

  // AI-style suitability score derived from status, availability, hours and age.
  function score(u: (typeof units)[number]): number {
    if (!u) return 0;
    let s = 50;
    if (u.status === 'Available') s += 30;
    if (u.status === 'Allocated') s += 5;
    if (u.status === 'Maintenance') s -= 25;
    if (u.status === 'Unavailable') s -= 35;
    if (u.year >= 2023) s += 10; else if (u.year >= 2021) s += 5;
    if (u.operating_hours < 3000) s += 10; else if (u.operating_hours > 8000) s -= 10;
    return Math.max(5, Math.min(99, s));
  }

  const rows: { label: string; render: (u: NonNullable<(typeof units)[number]>) => React.ReactNode }[] = [
    { label: 'Image', render: (u) => <EquipmentImage src={u.image_url} alt={u.equipment_type} className="h-28 w-full rounded-sm border border-border" /> },
    { label: 'Type', render: (u) => <span className="font-medium">{u.equipment_type}</span> },
    { label: 'Model', render: (u) => <span className="font-mono-tech">{u.model} ({u.year})</span> },
    { label: 'Status', render: (u) => <EquipmentStatusBadge status={u.status} /> },
    { label: 'Location', render: (u) => u.current_location },
    { label: 'Next Available', render: (u) => <span className="font-mono-tech">{formatDateFull(u.next_available_date)}</span> },
    { label: 'Operating Hours', render: (u) => <span className="font-mono-tech">{u.operating_hours.toLocaleString()} h</span> },
    { label: 'Capacity', render: (u) => u.capacity },
    {
      label: 'Availability Now', render: (u) => u.status === 'Available'
        ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" />Deployable today</span>
        : <span className="flex items-center gap-1 text-amber-400"><XCircle className="h-3.5 w-3.5" />Not immediately deployable</span>,
    },
    {
      label: 'Recommendation Score', render: (u) => {
        const s = score(u);
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
              <div className={cn('h-full', s >= 80 ? 'bg-emerald-400' : s >= 55 ? 'bg-primary' : 'bg-red-400')} style={{ width: `${s}%` }} />
            </div>
            <span className="font-mono-tech text-xs font-semibold">{s}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <button onClick={() => navigate('/fleet')} className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" />Equipment Fleet
      </button>
      <PageHeader title="Equipment Comparison" subtitle={`Comparing ${units.map((u) => u!.equipment_id).join(' vs ')} — suitability derived from live fleet status.`} />
      <Panel className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="w-40 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Attribute</th>
              {units.map((u) => (
                <th key={u!.equipment_id} className="px-4 py-3 text-left">
                  <button onClick={() => navigate(`/fleet/${u!.equipment_id}`)} className="font-mono-tech text-sm text-primary hover:underline">
                    {u!.equipment_id}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{row.label}</td>
                {units.map((u) => <td key={u!.equipment_id} className="px-4 py-3 text-foreground/90">{row.render(u!)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
