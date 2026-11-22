import { useState } from 'react';
import { MoreVertical, Info, Edit, ArrowRightLeft, Clock, Trash2, Power } from 'lucide-react';
import { useNavigate } from 'react-router';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { Equipment } from '@/types/models';

export function EquipmentActionMenu({
  equipment,
  onEdit,
  onChangeStatus,
  onEmergencyShift,
  onDelete,
}: {
  equipment: Equipment;
  onEdit: () => void;
  onChangeStatus: () => void;
  onEmergencyShift: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => { setOpen(false); navigate(`/fleet/${equipment.equipment_id}`); }}>
          <Info className="mr-2 h-4 w-4 text-sky-400" />
          View Details
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => { setOpen(false); onEdit(); }}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Equipment
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => { setOpen(false); onChangeStatus(); }}>
          <Power className="mr-2 h-4 w-4" />
          Change Status
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => { setOpen(false); onEmergencyShift(); }}>
          <ArrowRightLeft className="mr-2 h-4 w-4 text-amber-400" />
          Emergency Shift
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => { setOpen(false); navigate(`/allocations?equipment=${equipment.equipment_id}`); }}>
          <Clock className="mr-2 h-4 w-4 text-primary" />
          Allocation History
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => { setOpen(false); onDelete(); }}
          className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Equipment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
