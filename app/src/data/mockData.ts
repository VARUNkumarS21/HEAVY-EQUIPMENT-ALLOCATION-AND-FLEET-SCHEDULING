// Initial operational dataset — this stands in for the backend databases
// (equipment inventory, projects, allocations, maintenance). All dates are
// anchored relative to "today" so the schedule is always alive.
// When the live backend is connected, services read from the API instead.

import type {
  Equipment, Project, Allocation, MaintenanceRecord, PendingRequest, AlertItem, FleetLocation,
} from '@/types/models';
import { getEquipmentImage } from './equipmentImages';
import { rel } from '@/lib/dateUtils';

function eq(
  id: string, type: string, model: string, status: Equipment['status'],
  location: string, nextAvail: number, year: number, hours: number, capacity: string,
): Equipment {
  return {
    equipment_id: id, equipment_type: type, model, status,
    current_location: location, next_available_date: rel(nextAvail),
    image_url: getEquipmentImage(type, model), year, operating_hours: hours, capacity,
  };
}

export const LOCATIONS: FleetLocation[] = [
  { name: 'Depot', x: 50, y: 78, description: 'Central fleet depot & workshop' },
  { name: 'Electronic City', x: 30, y: 60, description: 'Southern IT corridor sites' },
  { name: 'Whitefield', x: 72, y: 30, description: 'Eastern development zone' },
  { name: 'Hoskote', x: 88, y: 52, description: 'Eastern logistics corridor' },
  { name: 'Airport Site', x: 46, y: 14, description: 'Northern infrastructure works' },
  { name: 'Yelahanka', x: 30, y: 26, description: 'Northern residential cluster' },
  { name: 'Hebbal', x: 52, y: 34, description: 'Central-north interchange works' },
];

// ─── Fleet: 46 machines ──────────────────────────────────────────────────────
export const EQUIPMENT_DATA: Equipment[] = [
  // Excavators × 8
  eq('EQ001', 'Excavator', 'EXC-100', 'Available', 'Electronic City', 0, 2022, 4120, '1.2 m³ bucket'),
  eq('EQ002', 'Excavator', 'EXC-101', 'Allocated', 'Whitefield', 6, 2021, 5880, '1.4 m³ bucket'),
  eq('EQ003', 'Excavator', 'EXC-102', 'Available', 'Hoskote', 0, 2023, 2140, '1.6 m³ bucket'),
  eq('EQ004', 'Excavator', 'EXC-103', 'Allocated', 'Airport Site', 12, 2020, 7430, '0.9 m³ bucket'),
  eq('EQ005', 'Excavator', 'EXC-104', 'Available', 'Depot', 0, 2024, 620, '2.1 m³ bucket'),
  eq('EQ006', 'Excavator', 'EXC-105', 'Maintenance', 'Depot', 11, 2019, 9210, '1.2 m³ bucket'),
  eq('EQ007', 'Excavator', 'EXC-106', 'Allocated', 'Yelahanka', 4, 2022, 3980, '1.4 m³ bucket'),
  eq('EQ008', 'Excavator', 'EXC-107', 'Available', 'Whitefield', 0, 2023, 1760, '1.6 m³ bucket'),
  // Dump Trucks × 9
  eq('EQ020', 'Dump Truck', 'DMP-210', 'Allocated', 'Whitefield', 6, 2021, 6010, '28 t payload'),
  eq('EQ021', 'Dump Truck', 'DMP-211', 'Available', 'Hoskote', 0, 2022, 4420, '28 t payload'),
  eq('EQ022', 'Dump Truck', 'DMP-212', 'Available', 'Electronic City', 0, 2023, 2890, '31 t payload'),
  eq('EQ023', 'Dump Truck', 'DMP-213', 'Allocated', 'Airport Site', 12, 2020, 8100, '25 t payload'),
  eq('EQ024', 'Dump Truck', 'DMP-214', 'Available', 'Depot', 0, 2024, 940, '31 t payload'),
  eq('EQ025', 'Dump Truck', 'DMP-215', 'Maintenance', 'Depot', 7, 2019, 11200, '25 t payload'),
  eq('EQ026', 'Dump Truck', 'DMP-216', 'Allocated', 'Hebbal', 9, 2022, 5330, '28 t payload'),
  eq('EQ027', 'Dump Truck', 'DMP-217', 'Available', 'Yelahanka', 0, 2023, 2610, '28 t payload'),
  eq('EQ028', 'Dump Truck', 'DMP-218', 'Unavailable', 'Depot', 20, 2018, 13450, '25 t payload'),
  // Mobile Cranes × 4
  eq('EQ040', 'Mobile Crane', 'MCR-300', 'Available', 'Depot', 0, 2022, 3120, '80 t lift'),
  eq('EQ041', 'Mobile Crane', 'MCR-301', 'Allocated', 'Airport Site', 15, 2021, 4760, '130 t lift'),
  eq('EQ042', 'Mobile Crane', 'MCR-302', 'Available', 'Hebbal', 0, 2023, 1980, '55 t lift'),
  eq('EQ043', 'Mobile Crane', 'MCR-303', 'Maintenance', 'Depot', 18, 2020, 6890, '100 t lift'),
  // Tower Cranes × 3
  eq('EQ050', 'Tower Crane', 'TCR-500', 'Allocated', 'Whitefield', 45, 2021, 5210, '8 t @ 60 m'),
  eq('EQ051', 'Tower Crane', 'TCR-501', 'Allocated', 'Electronic City', 60, 2022, 4470, '10 t @ 65 m'),
  eq('EQ052', 'Tower Crane', 'TCR-502', 'Available', 'Depot', 0, 2023, 1830, '12 t @ 70 m'),
  // Concrete Pumps × 4
  eq('EQ060', 'Concrete Pump', 'CBP-410', 'Available', 'Electronic City', 0, 2022, 3410, '42 m boom'),
  eq('EQ061', 'Concrete Pump', 'CBP-411', 'Allocated', 'Whitefield', 3, 2021, 5020, '38 m boom'),
  eq('EQ062', 'Concrete Pump', 'CBP-412', 'Available', 'Depot', 0, 2024, 780, '47 m boom'),
  eq('EQ063', 'Concrete Pump', 'CBP-413', 'Maintenance', 'Depot', 5, 2020, 7640, '36 m boom'),
  // Concrete Mixers × 5
  eq('EQ070', 'Concrete Mixer', 'CMX-220', 'Allocated', 'Whitefield', 3, 2022, 4980, '8 m³ drum'),
  eq('EQ071', 'Concrete Mixer', 'CMX-221', 'Available', 'Hoskote', 0, 2023, 2340, '9 m³ drum'),
  eq('EQ072', 'Concrete Mixer', 'CMX-222', 'Available', 'Depot', 0, 2021, 5620, '7 m³ drum'),
  eq('EQ073', 'Concrete Mixer', 'CMX-223', 'Allocated', 'Electronic City', 8, 2022, 4210, '8 m³ drum'),
  eq('EQ074', 'Concrete Mixer', 'CMX-224', 'Available', 'Yelahanka', 0, 2024, 1010, '9 m³ drum'),
  // Rollers × 4
  eq('EQ080', 'Roller', 'RLR-150', 'Available', 'Depot', 0, 2022, 3620, '11 t drum'),
  eq('EQ081', 'Roller', 'RLR-151', 'Allocated', 'Airport Site', 10, 2021, 4890, '11 t drum'),
  eq('EQ082', 'Roller', 'RLR-152', 'Available', 'Hebbal', 0, 2023, 2140, '13 t drum'),
  eq('EQ083', 'Roller', 'RLR-153', 'Maintenance', 'Depot', 14, 2019, 8730, '11 t drum'),
  // Motor Graders × 3
  eq('EQ090', 'Motor Grader', 'GRD-180', 'Available', 'Electronic City', 0, 2022, 3910, '3.7 m blade'),
  eq('EQ091', 'Motor Grader', 'GRD-181', 'Allocated', 'Airport Site', 10, 2021, 5240, '3.7 m blade'),
  eq('EQ092', 'Motor Grader', 'GRD-182', 'Available', 'Depot', 0, 2023, 1870, '4.3 m blade'),
  // Bulldozers × 3
  eq('EQ100', 'Bulldozer', 'BLZ-130', 'Available', 'Hoskote', 0, 2021, 5430, '4.5 m³ blade'),
  eq('EQ101', 'Bulldozer', 'BLZ-131', 'Allocated', 'Whitefield', 7, 2022, 4120, '5.8 m³ blade'),
  eq('EQ102', 'Bulldozer', 'BLZ-132', 'Unavailable', 'Depot', 25, 2018, 12870, '4.5 m³ blade'),
  // Backhoe Loaders × 3
  eq('EQ110', 'Backhoe Loader', 'BHL-120', 'Available', 'Yelahanka', 0, 2023, 1620, '1.0 m³ loader'),
  eq('EQ111', 'Backhoe Loader', 'BHL-121', 'Allocated', 'Hebbal', 5, 2022, 3380, '1.0 m³ loader'),
  eq('EQ112', 'Backhoe Loader', 'BHL-122', 'Available', 'Electronic City', 0, 2024, 540, '1.2 m³ loader'),
  // Piling Rigs × 2
  eq('EQ120', 'Piling Rig', 'PLG-600', 'Allocated', 'Whitefield', 21, 2021, 4890, '40 m depth'),
  eq('EQ121', 'Piling Rig', 'PLG-601', 'Available', 'Depot', 0, 2023, 1720, '32 m depth'),
  // Access & finishing × 2
  eq('EQ130', 'Boom Lift', 'BML-800', 'Available', 'Depot', 0, 2023, 1210, '26 m reach'),
  eq('EQ131', 'Scissor Lift', 'SCL-810', 'Available', 'Electronic City', 0, 2024, 430, '12 m platform'),
];

// ─── Projects ────────────────────────────────────────────────────────────────
function phases(
  base: number, spans: number[], statuses: Project['phases'][number]['status'][],
  req: string[][],
): Project['phases'] {
  const names = ['Site Preparation & Earthworks', 'Foundation Engineering', 'Superstructure & Concrete Logistics', 'Scaffolding, Facade & Safety', 'MEP & Finishing'];
  let cursor = base;
  return names.map((name, i) => {
    const start = cursor;
    const end = cursor + spans[i];
    cursor = end + 1;
    return {
      phase_id: `PH${i + 1}`,
      name,
      status: statuses[i],
      start_date: rel(start),
      end_date: rel(end),
      required_equipment_types: req[i],
      depends_on: i === 0 ? null : `PH${i}`,
    };
  });
}

export const PROJECTS_DATA: Project[] = [
  {
    project_id: 'PRJ-22', project_name: 'Prestige Commercial Complex', project_type: 'Commercial',
    priority: 'CRITICAL', status: 'Active', location: 'Whitefield',
    start_date: rel(-75), end_date: rel(310), current_phase: 'Foundation Engineering',
    phases: phases(-75, [30, 45, 160, 40, 60],
      ['Completed', 'In Progress', 'Upcoming', 'Upcoming', 'Upcoming'],
      [['Excavator', 'Bulldozer', 'Dump Truck'], ['Piling Rig', 'Excavator', 'Concrete Pump', 'Concrete Mixer'], ['Tower Crane', 'Concrete Pump', 'Concrete Mixer'], ['Scaffolding', 'Boom Lift'], ['Scissor Lift', 'Power Trowel']]),
  },
  {
    project_id: 'PRJ-08', project_name: 'Airport Expressway Widening', project_type: 'Infrastructure',
    priority: 'CRITICAL', status: 'Active', location: 'Airport Site',
    start_date: rel(-40), end_date: rel(140), current_phase: 'Site Preparation & Earthworks',
    delay_reason: 'Tower crane coverage gap — piling support lift capacity insufficient from 3 days out.',
    phases: phases(-40, [35, 40, 60, 20, 25],
      ['In Progress', 'Upcoming', 'Upcoming', 'Upcoming', 'Upcoming'],
      [['Motor Grader', 'Roller', 'Dump Truck', 'Excavator'], ['Mobile Crane', 'Piling Rig'], ['Mobile Crane', 'Concrete Pump'], ['Scaffolding'], ['Power Trowel']]),
  },
  {
    project_id: 'PRJ-15', project_name: 'Hebbal Flyover Interchange', project_type: 'Bridge Construction',
    priority: 'HIGH', status: 'Active', location: 'Hebbal',
    start_date: rel(-20), end_date: rel(95), current_phase: 'Foundation Engineering',
    phases: phases(-20, [18, 30, 40, 12, 15],
      ['Completed', 'In Progress', 'Upcoming', 'Upcoming', 'Upcoming'],
      [['Excavator', 'Dump Truck'], ['Mobile Crane', 'Concrete Pump', 'Concrete Mixer'], ['Mobile Crane', 'Concrete Pump'], ['Scaffolding'], ['Power Trowel']]),
  },
  {
    project_id: 'PRJ-31', project_name: 'Electronic City Tech Park Ph-2', project_type: 'Commercial',
    priority: 'HIGH', status: 'Active', location: 'Electronic City',
    start_date: rel(-55), end_date: rel(240), current_phase: 'Superstructure & Concrete Logistics',
    phases: phases(-55, [25, 35, 130, 45, 60],
      ['Completed', 'Completed', 'In Progress', 'Upcoming', 'Upcoming'],
      [['Excavator', 'Bulldozer'], ['Excavator', 'Concrete Pump', 'Concrete Mixer'], ['Tower Crane', 'Concrete Pump', 'Concrete Mixer'], ['Scaffolding', 'Boom Lift'], ['Scissor Lift', 'Power Trowel']]),
  },
  {
    project_id: 'PRJ-12', project_name: 'Yelahanka Lakeview Residences', project_type: 'Residential',
    priority: 'MEDIUM', status: 'Active', location: 'Yelahanka',
    start_date: rel(-10), end_date: rel(180), current_phase: 'Site Preparation & Earthworks',
    phases: phases(-10, [20, 30, 90, 25, 30],
      ['In Progress', 'Upcoming', 'Upcoming', 'Upcoming', 'Upcoming'],
      [['Excavator', 'Backhoe Loader', 'Dump Truck'], ['Excavator', 'Concrete Mixer'], ['Tower Crane', 'Concrete Mixer'], ['Scaffolding'], ['Scissor Lift']]),
  },
  {
    project_id: 'PRJ-27', project_name: 'Hoskote Logistics Park', project_type: 'Industrial',
    priority: 'HIGH', status: 'Active', location: 'Hoskote',
    start_date: rel(-30), end_date: rel(110), current_phase: 'Foundation Engineering',
    phases: phases(-30, [22, 28, 50, 15, 25],
      ['Completed', 'In Progress', 'Upcoming', 'Upcoming', 'Upcoming'],
      [['Bulldozer', 'Motor Grader', 'Excavator'], ['Excavator', 'Concrete Pump'], ['Mobile Crane', 'Concrete Mixer'], ['Scaffolding'], ['Power Trowel', 'Scissor Lift']]),
  },
  {
    project_id: 'PRJ-05', project_name: 'Koramangala Stormwater Drain', project_type: 'Drainage',
    priority: 'MEDIUM', status: 'Planning', location: 'Depot',
    start_date: rel(14), end_date: rel(75), current_phase: 'Site Preparation & Earthworks',
    phases: phases(14, [15, 18, 12, 6, 10],
      ['Upcoming', 'Upcoming', 'Upcoming', 'Upcoming', 'Upcoming'],
      [['Excavator', 'Dump Truck'], ['Excavator', 'Concrete Mixer'], ['Concrete Pump'], ['Scaffolding'], ['Power Trowel']]),
  },
  {
    project_id: 'PRJ-19', project_name: 'Sarjapur Road Resurfacing', project_type: 'Road Construction',
    priority: 'MEDIUM', status: 'Active', location: 'Electronic City',
    start_date: rel(-8), end_date: rel(22), current_phase: 'Road Construction',
    phases: phases(-8, [10, 8, 6, 2, 4],
      ['Completed', 'In Progress', 'Upcoming', 'Upcoming', 'Upcoming'],
      [['Motor Grader', 'Dump Truck'], ['Roller', 'Motor Grader'], ['Roller'], ['Scaffolding'], ['Power Trowel']]),
  },
];

// ─── Allocations ─────────────────────────────────────────────────────────────
function al(id: string, eqId: string, prjId: string, job: string, s: number, e: number, status: Allocation['status']): Allocation {
  return { allocation_id: id, equipment_id: eqId, project_id: prjId, job_type: job, start_date: rel(s), end_date: rel(e), status };
}

export const ALLOCATIONS_DATA: Allocation[] = [
  al('AL-101', 'EQ002', 'PRJ-22', 'Foundation Excavation', -6, 6, 'Active'),
  al('AL-102', 'EQ020', 'PRJ-22', 'Foundation Excavation', -6, 6, 'Active'),
  al('AL-103', 'EQ120', 'PRJ-22', 'Piling & Deep Foundation', -2, 21, 'Active'),
  al('AL-104', 'EQ061', 'PRJ-22', 'Concrete Pouring', -1, 3, 'Active'),
  al('AL-105', 'EQ070', 'PRJ-22', 'Concrete Pouring', -1, 3, 'Active'),
  al('AL-106', 'EQ004', 'PRJ-08', 'Site Grading', -9, 12, 'Active'),
  al('AL-107', 'EQ023', 'PRJ-08', 'Spoil Haulage', -9, 12, 'Active'),
  al('AL-108', 'EQ041', 'PRJ-08', 'Bridge Works', -5, 15, 'Active'),
  al('AL-109', 'EQ081', 'PRJ-08', 'Soil Compaction', -4, 10, 'Active'),
  al('AL-110', 'EQ091', 'PRJ-08', 'Road Formation', -4, 10, 'Active'),
  al('AL-111', 'EQ026', 'PRJ-15', 'Foundation Excavation', -7, 9, 'Active'),
  al('AL-112', 'EQ007', 'PRJ-12', 'Site Preparation', -3, 4, 'Active'),
  al('AL-113', 'EQ050', 'PRJ-22', 'Superstructure Lifting', -30, 45, 'Active'),
  al('AL-114', 'EQ051', 'PRJ-31', 'Superstructure Lifting', -20, 60, 'Active'),
  al('AL-115', 'EQ073', 'PRJ-31', 'Concrete Pouring', -2, 8, 'Active'),
  al('AL-116', 'EQ101', 'PRJ-22', 'Backfill & Grading', -4, 7, 'Active'),
  al('AL-117', 'EQ111', 'PRJ-15', 'Utility Trenching', -2, 5, 'Active'),
  al('AL-118', 'EQ001', 'PRJ-05', 'Drainage Installation', 14, 19, 'Scheduled'),
  al('AL-119', 'EQ021', 'PRJ-05', 'Drainage Installation', 14, 19, 'Scheduled'),
  al('AL-120', 'EQ090', 'PRJ-19', 'Fine Grading', -8, 6, 'Active'),
  al('AL-121', 'EQ080', 'PRJ-19', 'Soil Compaction', 2, 8, 'Scheduled'),
  al('AL-122', 'EQ003', 'PRJ-27', 'Foundation Excavation', -12, -1, 'Completed'),
  al('AL-123', 'EQ100', 'PRJ-27', 'Land Clearing', -28, -10, 'Completed'),
  al('AL-124', 'EQ005', 'PRJ-27', 'Foundation Excavation', 2, 9, 'Scheduled'),
];

// ─── Maintenance ─────────────────────────────────────────────────────────────
function mt(id: string, eqId: string, type: string, s: number, e: number, status: MaintenanceRecord['status'], notes: string): MaintenanceRecord {
  return { maintenance_id: id, equipment_id: eqId, maintenance_type: type, start_date: rel(s), end_date: rel(e), status, notes };
}

export const MAINTENANCE_DATA: MaintenanceRecord[] = [
  mt('MT-201', 'EQ006', 'Hydraulic system overhaul', -3, 11, 'Under Maintenance', 'Main pump replacement + hose kit. Depot workshop bay 2.'),
  mt('MT-202', 'EQ025', 'Brake & driveline service', -1, 7, 'Under Maintenance', 'Full driveline inspection after 11,200 operating hours.'),
  mt('MT-203', 'EQ043', 'Boom inspection & certification', 4, 18, 'Scheduled', 'Statutory 5-year structural inspection of telescopic boom.'),
  mt('MT-204', 'EQ063', 'Hydraulic valve block service', -2, 5, 'Under Maintenance', 'S-tube wear plate replacement.'),
  mt('MT-205', 'EQ083', 'Drum bearing replacement', 6, 14, 'Scheduled', 'Vibration analysis flagged drum bearing wear.'),
  mt('MT-206', 'EQ002', 'Scheduled 500h service', 7, 8, 'Scheduled', 'Engine oil, filters, track tension. One-day window at site.'),
  mt('MT-207', 'EQ052', 'Post-storage commissioning', -1, 2, 'Under Maintenance', 'Re-commissioning after depot storage; hoist brake test.'),
  mt('MT-208', 'EQ101', 'Scheduled 500h service', 12, 13, 'Scheduled', 'Blade cutting edge replacement included.'),
];

// ─── Pending requests ────────────────────────────────────────────────────────
export const REQUESTS_DATA: PendingRequest[] = [
  {
    request_id: 'REQ-001', project_id: 'PRJ-12', equipment_type: 'Excavator',
    requested_date: rel(2), duration_days: 5, next_available_date: rel(3),
    status: 'Pending', suggested_equipment_id: 'EQ005',
    ai_note: 'No excavator is currently free at Yelahanka on the requested date, but EQ005 becomes available at Depot in 0 days and EQ007 demobilises from PRJ-12 in 4 days.',
  },
  {
    request_id: 'REQ-002', project_id: 'PRJ-08', equipment_type: 'Tower Crane',
    requested_date: rel(3), duration_days: 30, next_available_date: null,
    status: 'Waitlisted', suggested_equipment_id: null,
    ai_note: 'All tower cranes are committed for 45+ days. EQ052 is at Depot but under commissioning until 2 days out — earliest feasible start is in 3 days if commissioning clears.',
  },
  {
    request_id: 'REQ-003', project_id: 'PRJ-27', equipment_type: 'Concrete Pump',
    requested_date: rel(1), duration_days: 3, next_available_date: rel(0),
    status: 'Matched', suggested_equipment_id: 'EQ060',
    ai_note: 'EQ060 (42 m boom) is available at Electronic City and suitable for the raft pour. EQ061 demobilises from PRJ-22 in 3 days as fallback.',
  },
  {
    request_id: 'REQ-004', project_id: 'PRJ-19', equipment_type: 'Roller',
    requested_date: rel(0), duration_days: 4, next_available_date: rel(2),
    status: 'Scheduled', suggested_equipment_id: 'EQ080',
    ai_note: 'EQ080 scheduled from 2 days out. EQ083 unavailable until drum bearing replacement completes in 14 days.',
  },
  {
    request_id: 'REQ-005', project_id: 'PRJ-15', equipment_type: 'Concrete Mixer',
    requested_date: rel(6), duration_days: 2, next_available_date: rel(6),
    status: 'Pending', suggested_equipment_id: 'EQ071',
    ai_note: 'EQ071 at Hoskote can cover the pier-cap pour. Recommend pairing with EQ042 mobile crane for skip placement.',
  },
  {
    request_id: 'REQ-006', project_id: 'PRJ-31', equipment_type: 'Boom Lift',
    requested_date: rel(9), duration_days: 12, next_available_date: rel(0),
    status: 'Pending', suggested_equipment_id: 'EQ130',
    ai_note: 'EQ130 available at Depot. Facade works at PRJ-31 begin after the superstructure reaches L8 — requested window aligns.',
  },
];

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const ALERTS_DATA: AlertItem[] = [
  {
    alert_id: 'ALT-301', severity: 'CRITICAL', entity_ref: 'PRJ-08',
    title: 'Equipment unavailable for critical project',
    message: 'PRJ-08 (Airport Expressway) requires a tower crane within 3 days. The current available fleet cannot meet the requested start date.',
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(), acknowledged: false,
  },
  {
    alert_id: 'ALT-302', severity: 'WARNING', entity_ref: 'EQ002',
    title: 'Maintenance window approaches active allocation',
    message: 'EQ002 has a scheduled 500h service starting in 7 days while allocated to PRJ-22. Confirm demobilisation or extend the allocation.',
    created_at: new Date(Date.now() - 5 * 3600_000).toISOString(), acknowledged: false,
  },
  {
    alert_id: 'ALT-303', severity: 'AI', entity_ref: 'PRJ-22',
    title: 'AI scheduling recommendation',
    message: 'Foundation Engineering at PRJ-22 can start 2 days earlier if EQ005 is mobilised from Depot instead of waiting for EQ002 demobilisation.',
    created_at: new Date(Date.now() - 8 * 3600_000).toISOString(), acknowledged: false,
  },
  {
    alert_id: 'ALT-304', severity: 'INFO', entity_ref: 'EQ003',
    title: 'Equipment becoming available',
    message: 'EQ003 (Excavator, Hoskote) completed its allocation at PRJ-27 and is now available for dispatch.',
    created_at: new Date(Date.now() - 26 * 3600_000).toISOString(), acknowledged: true,
  },
  {
    alert_id: 'ALT-305', severity: 'SUCCESS', entity_ref: 'AL-118',
    title: 'Allocation scheduled',
    message: 'Drainage works at PRJ-05 confirmed: EQ001 + EQ021 scheduled from 14 days out for 5 days.',
    created_at: new Date(Date.now() - 30 * 3600_000).toISOString(), acknowledged: true,
  },
  {
    alert_id: 'ALT-306', severity: 'WARNING', entity_ref: 'MT-205',
    title: 'Maintenance conflict risk',
    message: 'EQ083 drum bearing replacement (starts in 6 days) overlaps its tentative roadworks window at PRJ-19. Re-sequence recommended.',
    created_at: new Date(Date.now() - 34 * 3600_000).toISOString(), acknowledged: false,
  },
  {
    alert_id: 'ALT-307', severity: 'INFO', entity_ref: 'EQ006',
    title: 'Maintenance progressing on plan',
    message: 'EQ006 hydraulic overhaul is 60% complete at Depot workshop. Expected return to fleet in 11 days.',
    created_at: new Date(Date.now() - 50 * 3600_000).toISOString(), acknowledged: true,
  },
];
