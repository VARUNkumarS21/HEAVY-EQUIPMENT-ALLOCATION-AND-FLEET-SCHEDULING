import { useNavigate } from 'react-router';
import { Wrench } from 'lucide-react';
import { PageHeader, Panel, SectionHeader } from '@/components/common/Chrome';
import { MaintenanceStatusBadge } from '@/components/common/Badges';
import { useStore } from '@/hooks/useStore';
import { daysBetween, formatDateFull, todayISO } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

export default function Maintenance() {
  const store = useStore();
  const navigate = useNavigate();
  const today = todayISO();

  const active = store.maintenance.filter((m) => m.status === 'Under Maintenance');
  const upcoming = store.maintenance.filter((m) => m.status === 'Scheduled').sort((a, b) => (a.start_date < b.start_date ? -1 : 1));

  // Simple calendar strip: next 21 days with maintenance coverage per unit.
  const days = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(today + 'T00:00:00');
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const coveredUnits = [...new Set(store.maintenance.filter((m) => m.status !== 'Completed').map((m) => m.equipment_id))];

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Maintenance" subtitle="Workshop windows, certifications and service schedules. The scheduler and AI automatically exclude units under maintenance." />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Register */}
        <Panel className="p-4 lg:col-span-2">
          <SectionHeader title="Maintenance Register" subtitle={`${active.length} units in workshop · ${upcoming.length} windows scheduled`} />
          <div className="space-y-2">
            {store.maintenance.map((m) => {
              const unit = store.getEquipment(m.equipment_id);
              return (
                <div key={m.maintenance_id} className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-secondary/30 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-red-500/10 text-red-400">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      <button onClick={() => navigate(`/fleet/${m.equipment_id}`)} className="font-mono-tech text-primary hover:underline">{m.equipment_id}</button>
                      <span className="ml-2 text-muted-foreground">{unit?.equipment_type} {unit?.model}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{m.maintenance_type}</p>
                    <p className="mt-0.5 text-xs text-foreground/70">{m.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono-tech text-xs text-foreground/85">{formatDateFull(m.start_date)} → {formatDateFull(m.end_date)}</p>
                    <p className="font-mono-tech text-[11px] text-muted-foreground">{daysBetween(m.start_date, m.end_date) + 1} days</p>
                    <div className="mt-1"><MaintenanceStatusBadge status={m.status} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Upcoming panel */}
        <Panel className="p-4">
          <SectionHeader title="Upcoming Windows" />
          <div className="space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No scheduled maintenance.</p>}
            {upcoming.map((m) => {
              const startsIn = daysBetween(today, m.start_date);
              return (
                <div key={m.maintenance_id} className="rounded-sm border border-border bg-secondary/30 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-xs text-primary">{m.equipment_id}</span>
                    <span className={cn('font-mono-tech text-[11px]', startsIn <= 3 ? 'text-red-400' : 'text-muted-foreground')}>
                      {startsIn <= 0 ? 'starts now' : `in ${startsIn}d`}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground/80">{m.maintenance_type}</p>
                  <p className="font-mono-tech text-[11px] text-muted-foreground">{formatDateFull(m.start_date)} → {formatDateFull(m.end_date)}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* 21-day calendar strip */}
      <div className="mt-4">
        <SectionHeader title="Maintenance Calendar — Next 21 Days" />
        <Panel className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[900px] p-4">
            <div className="flex">
              <div className="w-24 shrink-0" />
              {days.map((d) => (
                <div key={d} className={cn('flex-1 text-center font-mono-tech text-[9px]', d === today ? 'text-primary font-bold' : 'text-muted-foreground/70')}>
                  {new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', weekday: undefined })}
                </div>
              ))}
            </div>
            {coveredUnits.map((eqId) => {
              const unitWindows = store.maintenance.filter((m) => m.equipment_id === eqId && m.status !== 'Completed');
              return (
                <div key={eqId} className="mt-1 flex items-center">
                  <button onClick={() => navigate(`/fleet/${eqId}`)} className="w-24 shrink-0 text-left font-mono-tech text-[11px] text-primary hover:underline">{eqId}</button>
                  <div className="relative h-5 flex-1">
                    {unitWindows.map((m) => {
                      const s = Math.max(0, daysBetween(days[0], m.start_date));
                      const e = Math.min(20, daysBetween(days[0], m.end_date));
                      if (e < 0 || s > 20) return null;
                      return (
                        <div
                          key={m.maintenance_id}
                          title={`${m.maintenance_type} (${formatDateFull(m.start_date)} → ${formatDateFull(m.end_date)})`}
                          className={cn('hazard-stripes absolute inset-y-0.5 rounded-sm opacity-80')}
                          style={{ left: `${(s / 21) * 100}%`, width: `${((e - s + 1) / 21) * 100}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
