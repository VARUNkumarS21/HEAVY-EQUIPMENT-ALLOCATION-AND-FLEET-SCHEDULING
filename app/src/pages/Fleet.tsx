import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, GitCompareArrows, X, Plus } from 'lucide-react';
import { PageHeader, Panel, EmptyState } from '@/components/common/Chrome';
import { EquipmentCard } from '@/components/common/Cards';
import { equipmentService } from '@/services/equipmentService';
import type { Equipment, EquipmentStatus } from '@/types/models';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LOCATIONS } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import { store } from '@/services/store';
import { EquipmentActionMenu } from '@/components/fleet/EquipmentActionMenu';
import { AddEquipmentModal, EditEquipmentModal, ChangeStatusModal, EmergencyShiftModal, DeleteEquipmentModal } from '@/components/fleet/FleetModals';

const STATUS_TABS: (EquipmentStatus | 'All')[] = ['All', 'Available', 'Allocated', 'Maintenance', 'Unavailable'];

export default function Fleet() {
  useStore(); // live updates when allocations change fleet status
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') ?? 'All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | 'status' | 'shift' | 'delete' | null>(null);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);

  const statusFilter = (searchParams.get('status') as EquipmentStatus | null) ?? 'All';

  useEffect(() => {
    equipmentService.list().then(setEquipment);
  }, []);

  const types = useMemo(() => [...new Set(equipment.map((e) => e.equipment_type))].sort(), [equipment]);

  const filtered = useMemo(() => equipment.filter((e) => {
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (typeFilter !== 'All' && e.equipment_type !== typeFilter) return false;
    if (locationFilter !== 'All' && e.current_location !== locationFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const project = e.current_project_id ? store.getProject(e.current_project_id) : null;
      if (![e.equipment_id, e.model, e.equipment_type, e.manufacturer, project?.project_name].some((f) => f?.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [equipment, statusFilter, typeFilter, locationFilter, search]);

  function setStatus(s: EquipmentStatus | 'All') {
    const next = new URLSearchParams(searchParams);
    if (s === 'All') next.delete('status'); else next.set('status', s);
    setSearchParams(next, { replace: true });
  }

  function toggleCompare(id: string) {
    setCompareIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Equipment Fleet"
        subtitle={`${equipment.length} machines under fleet control across ${new Set(equipment.map((e) => e.current_location)).size} locations.`}
        actions={
          <Button onClick={() => setModal('add')} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-1.5 h-4 w-4" /> Add Equipment
          </Button>
        }
      />

      {/* Filters */}
      <Panel className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-sm border border-border">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
                  statusFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 rounded-sm border border-input bg-secondary/50 px-2 text-xs text-foreground focus:outline-none" aria-label="Filter by equipment type">
            <option>All</option>
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>

          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
            className="h-8 rounded-sm border border-input bg-secondary/50 px-2 text-xs text-foreground focus:outline-none" aria-label="Filter by location">
            <option>All</option>
            {LOCATIONS.map((l) => <option key={l.name}>{l.name}</option>)}
          </select>

          <div className="relative ml-auto w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment ID, model or type..."
              className="h-8 w-full rounded-sm border border-input bg-secondary/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
            />
          </div>
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState title="No equipment matches" message="Adjust the status, type or location filters, or clear the search." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((e) => (
            <EquipmentCard
              key={e.equipment_id}
              equipment={e}
              onClick={() => navigate(`/fleet/${e.equipment_id}`)}
              actionMenu={
                <EquipmentActionMenu
                  equipment={e}
                  onEdit={() => { setSelectedEq(e); setModal('edit'); }}
                  onChangeStatus={() => { setSelectedEq(e); setModal('status'); }}
                  onEmergencyShift={() => { setSelectedEq(e); setModal('shift'); }}
                  onDelete={() => { setSelectedEq(e); setModal('delete'); }}
                />
              }
              footer={
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">View details →</span>
                  <button
                    onClick={(ev) => { ev.stopPropagation(); toggleCompare(e.equipment_id); }}
                    className={cn(
                      'flex items-center gap-1 rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                      compareIds.includes(e.equipment_id)
                        ? 'border-primary/50 bg-primary/15 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                    aria-pressed={compareIds.includes(e.equipment_id)}
                  >
                    <GitCompareArrows className="h-3 w-3" />
                    {compareIds.includes(e.equipment_id) ? 'Selected' : 'Compare'}
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Compare tray */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-sm border border-primary/40 bg-popover px-4 py-2.5 shadow-2xl">
          <GitCompareArrows className="h-4 w-4 text-primary" />
          <div className="flex gap-1.5">
            {compareIds.map((id) => (
              <span key={id} className="flex items-center gap-1 rounded-sm bg-secondary px-2 py-1 font-mono-tech text-xs text-foreground">
                {id}
                <button onClick={() => toggleCompare(id)} aria-label={`Remove ${id}`}><X className="h-3 w-3 text-muted-foreground hover:text-red-400" /></button>
              </span>
            ))}
          </div>
          <Button
            size="sm"
            disabled={compareIds.length < 2}
            onClick={() => navigate(`/fleet/compare?ids=${compareIds.join(',')}`)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Compare {compareIds.length}/3
          </Button>
        </div>
      )}

      {/* Modals */}
      {modal === 'add' && <AddEquipmentModal onClose={() => setModal(null)} />}
      {modal === 'edit' && selectedEq && <EditEquipmentModal equipment={selectedEq} onClose={() => setModal(null)} />}
      {modal === 'status' && selectedEq && <ChangeStatusModal equipment={selectedEq} onClose={() => setModal(null)} />}
      {modal === 'shift' && selectedEq && <EmergencyShiftModal equipment={selectedEq} onClose={() => setModal(null)} />}
      {modal === 'delete' && selectedEq && <DeleteEquipmentModal equipment={selectedEq} onClose={() => setModal(null)} />}
    </div>
  );
}
