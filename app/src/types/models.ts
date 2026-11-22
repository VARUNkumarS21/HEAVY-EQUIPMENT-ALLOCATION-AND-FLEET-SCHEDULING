// ─── CONSTRUMIND AI — Core Domain Models ────────────────────────────────────

export type EquipmentStatus = 'Available' | 'Allocated' | 'Maintenance' | 'Unavailable';
export type ProjectPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM';
export type ProjectStatus = 'Active' | 'On Hold' | 'Completed' | 'Planning';
export type AllocationStatus = 'Active' | 'Scheduled' | 'Completed' | 'Cancelled';
export type MaintenanceStatus = 'Under Maintenance' | 'Scheduled' | 'Completed';
export type RequestStatus = 'Pending' | 'Matched' | 'Scheduled' | 'Waitlisted' | 'Rejected';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS' | 'AI';
export type PhaseStatus = 'Completed' | 'In Progress' | 'Upcoming' | 'Delayed';

export interface Equipment {
  equipment_id: string;
  equipment_type: string;
  model: string;
  status: EquipmentStatus;
  current_location: string;
  next_available_date: string; // ISO date
  image_url: string;
  year: number;
  operating_hours: number;
  capacity: string;
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  current_project_id?: string | null;
  purchase_date?: string;
  notes?: string;
  deleted?: boolean;
}

export type AuditAction =
  | 'EQUIPMENT_ADDED'
  | 'EQUIPMENT_EDITED'
  | 'EQUIPMENT_DELETED'
  | 'STATUS_CHANGED'
  | 'EMERGENCY_SHIFT'
  | 'ALLOCATION_RELEASED';

export interface AuditEntry {
  id: string;
  equipment_id: string;
  action: AuditAction;
  previous_status?: EquipmentStatus | null;
  new_status?: EquipmentStatus | null;
  previous_project?: string | null;
  new_project?: string | null;
  reason?: string;
  details?: string;
  timestamp: string;
  operator: string;
}

export interface ShiftRecord {
  id: string;
  equipment_id: string;
  from_project_id: string | null;
  to_project_id: string;
  from_location: string;
  to_location: string;
  shift_date: string;
  expected_return_date?: string | null;
  reason: string;
  timestamp: string;
  operator: string;
}

export interface ConstructionPhase {
  phase_id: string;
  name: string;
  status: PhaseStatus;
  start_date: string;
  end_date: string;
  required_equipment_types: string[];
  depends_on: string | null;
}

export interface Project {
  project_id: string;
  project_name: string;
  project_type: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  location: string;
  start_date: string;
  end_date: string;
  current_phase: string;
  phases: ConstructionPhase[];
  delay_reason?: string;
}

export interface Allocation {
  allocation_id: string;
  equipment_id: string;
  project_id: string;
  job_type: string;
  start_date: string;
  end_date: string;
  status: AllocationStatus;
}

export interface MaintenanceRecord {
  maintenance_id: string;
  equipment_id: string;
  maintenance_type: string;
  start_date: string;
  end_date: string;
  status: MaintenanceStatus;
  notes: string;
}

export interface PendingRequest {
  request_id: string;
  project_id: string;
  equipment_type: string;
  requested_date: string;
  duration_days: number;
  next_available_date: string | null;
  status: RequestStatus;
  ai_note: string | null;
  suggested_equipment_id: string | null;
}

export interface AlertItem {
  alert_id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  entity_ref: string | null;
  created_at: string;
  acknowledged: boolean;
}

// ─── AI / n8n contract ───────────────────────────────────────────────────────

export interface AIQueryContext {
  current_page: string;
  selected_project: string | null;
  selected_equipment: string | null;
}

export interface AIQueryRequest {
  message: string;
  timestamp: string;
  user_id: string;
  project_id?: string | null;
  context: AIQueryContext;
}

export interface AIRecommendedEquipment {
  equipment_id: string;
  equipment_type: string;
  model: string;
  status: EquipmentStatus;
  current_location: string;
  next_available_date: string;
  recommendation_score: number;
  reason: string;
  reason_points: string[];
}

export interface AIConflict {
  conflict_type: 'ALLOCATION_CONFLICT' | 'MAINTENANCE_CONFLICT' | 'AVAILABILITY_CONFLICT';
  equipment_id: string;
  description: string;
  window: { start_date: string; end_date: string };
}

export interface AIRecommendationResponse {
  success: boolean;
  intent: string;
  job_type: string | null;
  construction_phase: string | null;
  duration_days: number | null;
  requested_start_date: string | null;
  recommended_equipment: AIRecommendedEquipment[];
  alternatives: AIRecommendedEquipment[];
  conflicts: AIConflict[];
  schedule: { start_date: string; end_date: string } | null;
  explanation: string;
  confidence: number;
  error?: string;
  project_id?: string | null;
}

// ─── Catalog / knowledge base ────────────────────────────────────────────────

export interface CatalogEntry {
  type: string;
  category: string;
  purpose: string;
  primary_uses: string[];
  construction_phases: string[];
  suitable_project_types: string[];
  key_characteristics: string[];
  why_it_matters: string;
  image_url: string;
}

export interface JobTypeKnowledge {
  job_type: string;
  keywords: string[];
  required_equipment_types: string[];
  estimated_duration_days: number;
  construction_phase: string;
}

export interface FleetLocation {
  name: string;
  x: number; // schematic map position (0-100)
  y: number;
  description: string;
}
