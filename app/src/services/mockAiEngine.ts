// Demo decision engine — used only when no live n8n webhook is configured.
// It replicates the backend contract: intent extraction, requirement parsing,
// fleet filtering, conflict detection, ranking and structured JSON output.
// Every figure it returns is computed from the operational store — nothing is
// canned. When N8N_WEBHOOK_URL is configured this engine is bypassed entirely.

import type {
  AIQueryRequest, AIRecommendationResponse, AIRecommendedEquipment, AIConflict, Equipment,
} from '@/types/models';
import { store } from './store';
import { JOB_TYPE_KNOWLEDGE } from '@/data/catalog';
import { addDays, daysBetween, todayISO } from '@/lib/dateUtils';

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7,
  august: 8, september: 9, october: 10, november: 11, december: 12,
};

const TYPE_ALIASES: [RegExp, string][] = [
  [/excavators?/i, 'Excavator'],
  [/dump\s?trucks?|tippers?/i, 'Dump Truck'],
  [/mobile\s?cranes?/i, 'Mobile Crane'],
  [/tower\s?cranes?/i, 'Tower Crane'],
  [/cranes?/i, 'Mobile Crane'],
  [/concrete\s?pumps?/i, 'Concrete Pump'],
  [/concrete\s?mixers?|mixers?|transit\s?mixers?/i, 'Concrete Mixer'],
  [/rollers?|compactors?/i, 'Roller'],
  [/(motor\s?)?graders?/i, 'Motor Grader'],
  [/bulldozers?|dozers?/i, 'Bulldozer'],
  [/backhoe|jcb/i, 'Backhoe Loader'],
  [/piling\s?rigs?|piling/i, 'Piling Rig'],
  [/boom\s?lifts?/i, 'Boom Lift'],
  [/scissor\s?lifts?/i, 'Scissor Lift'],
  [/scaffold(ing)?s?/i, 'Scaffolding'],
  [/power\s?trowels?/i, 'Power Trowel'],
];

interface ParsedQuery {
  jobKnowledge: (typeof JOB_TYPE_KNOWLEDGE)[number] | null;
  explicitTypes: string[];
  projectId: string | null;
  startDate: string;
  durationDays: number | null;
  location: string | null;
  equipmentRef: string | null;
  asksWhyDelayed: boolean;
  asksAvailabilityOnly: boolean;
}

function parseQuery(message: string): ParsedQuery {
  const msg = message.toLowerCase();

  const jobKnowledge = JOB_TYPE_KNOWLEDGE.find((j) => j.keywords.some((k) => msg.includes(k))) ?? null;

  const explicitTypes = TYPE_ALIASES.filter(([re]) => re.test(msg)).map(([, t]) => t);

  let projectId: string | null = null;
  const prjMatch = msg.match(/project\s*(\d+)/i) ?? msg.match(/prj-?(\d+)/i);
  if (prjMatch) {
    const candidate = `PRJ-${prjMatch[1].padStart(2, '0')}`;
    if (store.getProject(candidate)) projectId = candidate;
  }

  let startDate = todayISO();
  if (/tomorrow/.test(msg)) startDate = addDays(todayISO(), 1);
  else {
    const dateMatch = msg.match(/(?:from|starting|on|start(?:ing)?\s+on)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i);
    if (dateMatch) {
      const month = MONTHS[dateMatch[1].toLowerCase()];
      const day = parseInt(dateMatch[2], 10);
      const now = new Date(todayISO() + 'T00:00:00');
      let year = now.getFullYear();
      let candidate = new Date(year, month - 1, day);
      if (candidate.getTime() < now.getTime() - 86400_000) candidate = new Date(year + 1, month - 1, day);
      startDate = candidate.toISOString().slice(0, 10);
    }
    const inDays = msg.match(/in\s+(\d+)\s+days?/);
    if (inDays) startDate = addDays(todayISO(), parseInt(inDays[1], 10));
  }

  let durationDays: number | null = null;
  const durMatch = msg.match(/(?:for|duration(?:\s+of)?)\s+(\d+)\s+days?/);
  if (durMatch) durationDays = parseInt(durMatch[1], 10);

  let location: string | null = null;
  for (const loc of ['whitefield', 'hoskote', 'electronic city', 'airport', 'yelahanka', 'hebbal', 'depot']) {
    if (msg.includes(loc)) {
      location = loc === 'airport' ? 'Airport Site'
        : loc.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  const eqMatch = msg.match(/eq-?(\d{1,3})/i);
  const equipmentRef = eqMatch ? `EQ${eqMatch[1].padStart(3, '0')}` : null;

  return {
    jobKnowledge, explicitTypes, projectId, startDate, durationDays, location, equipmentRef,
    asksWhyDelayed: /why.*(delay|late|behind)|delay(ed)?/.test(msg) && projectId !== null,
    asksAvailabilityOnly: /which|available|availability|near/.test(msg) && !/schedule|allocate/.test(msg),
  };
}

function scoreUnit(unit: Equipment, start: string, end: string, location: string | null): { unit: AIRecommendedEquipment; conflicts: AIConflict[] } | null {
  const allocConflicts = store.conflictingAllocations(unit.equipment_id, start, end);
  const maintConflicts = store.conflictingMaintenance(unit.equipment_id, start, end);
  const conflicts: AIConflict[] = [
    ...allocConflicts.map((a) => ({
      conflict_type: 'ALLOCATION_CONFLICT' as const,
      equipment_id: unit.equipment_id,
      description: `${unit.equipment_id} is committed to ${a.project_id} (${a.job_type}) during the requested window.`,
      window: { start_date: a.start_date, end_date: a.end_date },
    })),
    ...maintConflicts.map((m) => ({
      conflict_type: 'MAINTENANCE_CONFLICT' as const,
      equipment_id: unit.equipment_id,
      description: `${unit.equipment_id} has a maintenance window (${m.maintenance_type}) overlapping the request.`,
      window: { start_date: m.start_date, end_date: m.end_date },
    })),
  ];

  const nextFree = store.nextFreeDate(unit.equipment_id, start);
  const availableOnTime = nextFree <= start && allocConflicts.length === 0 && maintConflicts.length === 0;

  let score = 50;
  const points: string[] = [];

  if (availableOnTime) {
    score += 30;
    points.push('Available before the requested start date');
  } else {
    const slip = daysBetween(start, nextFree);
    score -= Math.min(30, slip * 3);
    points.push(`Only free from ${nextFree} (${slip} day${slip === 1 ? '' : 's'} after requested start)`);
  }
  if (maintConflicts.length === 0) {
    score += 8;
    points.push('No maintenance conflict in the window');
  }
  if (allocConflicts.length === 0) {
    score += 8;
    points.push('No conflicting allocation');
  }
  if (location && unit.current_location.toLowerCase() === location.toLowerCase()) {
    score += 12;
    points.push(`Already positioned at ${location} — minimal mobilisation`);
  } else if (location) {
    score += 4;
    points.push(`Requires mobilisation from ${unit.current_location}`);
  } else {
    score += 6;
    points.push(`Currently at ${unit.current_location}`);
  }
  if (unit.year >= 2023) {
    score += 4;
    points.push('Late-model unit with low operating hours');
  }

  return {
    unit: {
      equipment_id: unit.equipment_id,
      equipment_type: unit.equipment_type,
      model: unit.model,
      status: unit.status,
      current_location: unit.current_location,
      next_available_date: nextFree,
      recommendation_score: Math.max(5, Math.min(99, score)),
      reason: points[0] ?? '',
      reason_points: points,
    },
    conflicts,
  };
}

export function runMockAiEngine(request: AIQueryRequest): AIRecommendationResponse {
  const parsed = parseQuery(request.message);

  // Intent: project delay explanation
  if (parsed.asksWhyDelayed && parsed.projectId) {
    const p = store.getProject(parsed.projectId)!;
    return {
      success: true,
      intent: 'project_status',
      job_type: null, construction_phase: p.current_phase,
      duration_days: null, requested_start_date: null,
      recommended_equipment: [], alternatives: [], conflicts: [], schedule: null,
      explanation: `${p.project_id} (${p.project_name}) is flagged ${p.priority}. ${p.delay_reason ?? 'Schedule health is driven by equipment coverage on the current phase.'} Current phase: ${p.current_phase}. Recommendation: review the allocation plan on the Scheduler and confirm coverage before the phase window opens.`,
      confidence: 0.88,
      project_id: p.project_id,
    };
  }

  // Intent: alternative lookup for a specific unit
  if (parsed.equipmentRef && /alternative|replace|instead/.test(request.message.toLowerCase())) {
    const unit = store.getEquipment(parsed.equipmentRef);
    if (unit) {
      const start = parsed.startDate;
      const dur = parsed.durationDays ?? 5;
      const end = addDays(start, dur - 1);
      const peers = store.equipment
        .filter((e) => e.equipment_type === unit.equipment_type && e.equipment_id !== unit.equipment_id)
        .map((e) => scoreUnit(e, start, end, parsed.location))
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.unit.recommendation_score - a.unit.recommendation_score);
      return {
        success: true,
        intent: 'alternative_lookup',
        job_type: null, construction_phase: null,
        duration_days: dur, requested_start_date: start,
        recommended_equipment: peers.slice(0, 2).map((p) => p.unit),
        alternatives: peers.slice(2, 5).map((p) => p.unit),
        conflicts: peers.flatMap((p) => p.conflicts),
        schedule: { start_date: start, end_date: end },
        explanation: `Alternatives to ${unit.equipment_id} (${unit.equipment_type} ${unit.model}) ranked by availability, conflict-free windows and mobilisation distance. ${unit.equipment_id} is currently ${unit.status.toLowerCase()} at ${unit.current_location}, next available ${unit.next_available_date}.`,
        confidence: 0.9,
      };
    }
  }

  const requiredTypes = parsed.explicitTypes.length > 0
    ? parsed.explicitTypes
    : parsed.jobKnowledge?.required_equipment_types ?? [];

  if (requiredTypes.length === 0) {
    return {
      success: false,
      intent: 'unclear',
      job_type: null, construction_phase: null, duration_days: null, requested_start_date: null,
      recommended_equipment: [], alternatives: [], conflicts: [], schedule: null,
      explanation: 'I could not determine the equipment requirement from that request. Try naming a job type (e.g. "foundation excavation", "road construction") or an equipment type (e.g. "excavator", "concrete pump"), plus a start date and duration.',
      confidence: 0.2,
      error: 'incomplete_request',
    };
  }

  const duration = parsed.durationDays ?? parsed.jobKnowledge?.estimated_duration_days ?? 5;
  const start = parsed.startDate;
  const end = addDays(start, duration - 1);
  const project = parsed.projectId ? store.getProject(parsed.projectId) ?? null : null;

  const recommended: AIRecommendedEquipment[] = [];
  const alternatives: AIRecommendedEquipment[] = [];
  const allConflicts: AIConflict[] = [];

  for (const type of requiredTypes) {
    let pool = store.equipment.filter((e) => e.equipment_type === type);
    if (parsed.location) {
      const atLocation = pool.filter((e) => e.current_location.toLowerCase() === parsed.location!.toLowerCase());
      if (atLocation.length > 0 && parsed.asksAvailabilityOnly) pool = atLocation;
    }
    const scored = pool
      .map((e) => scoreUnit(e, start, end, parsed.location ?? project?.location ?? null))
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.unit.recommendation_score - a.unit.recommendation_score);

    allConflicts.push(...scored.flatMap((s) => s.conflicts));
    if (scored.length > 0) {
      recommended.push(scored[0].unit);
      alternatives.push(...scored.slice(1, 3).map((s) => s.unit));
    }
  }

  const missingTypes = requiredTypes.filter((t) => !recommended.some((r) => r.equipment_type === t));

  if (recommended.length === 0) {
    return {
      success: true,
      intent: 'equipment_allocation',
      job_type: parsed.jobKnowledge?.job_type ?? null,
      construction_phase: parsed.jobKnowledge?.construction_phase ?? null,
      duration_days: duration, requested_start_date: start,
      recommended_equipment: [], alternatives: [], conflicts: allConflicts,
      schedule: { start_date: start, end_date: end },
      explanation: `No suitable ${requiredTypes.join(' / ')} is available for the requested period (${start} → ${end}). All matching units are committed, under maintenance, or flagged unavailable. Consider shifting the start date or reviewing the waitlisted requests.`,
      confidence: 0.72,
      error: 'no_equipment_available',
      project_id: project?.project_id ?? null,
    };
  }

  const avgScore = recommended.reduce((s, r) => s + r.recommendation_score, 0) / recommended.length;
  const criticalConflicts = allConflicts.filter((c) => recommended.some((r) => r.equipment_id === c.equipment_id));

  const explanationParts = [
    `${parsed.jobKnowledge ? parsed.jobKnowledge.job_type : 'Requested works'} requires ${requiredTypes.join(' + ')} for ${duration} day${duration === 1 ? '' : 's'} (${start} → ${end}).`,
  ];
  if (project) {
    explanationParts.push(`${project.project_id} (${project.project_name}) is ${project.priority} priority at ${project.location}, currently in ${project.current_phase}.`);
  }
  if (missingTypes.length > 0) {
    explanationParts.push(`No conflict-free unit found for: ${missingTypes.join(', ')} — see alternatives and conflicts below.`);
  }
  explanationParts.push(
    criticalConflicts.length === 0
      ? 'Recommended units are conflict-free across allocations and maintenance windows.'
      : 'Some recommended units carry conflicts — review before confirming allocation.',
  );

  return {
    success: true,
    intent: parsed.asksAvailabilityOnly ? 'availability_query' : 'equipment_allocation',
    job_type: parsed.jobKnowledge?.job_type ?? null,
    construction_phase: parsed.jobKnowledge?.construction_phase ?? null,
    duration_days: duration,
    requested_start_date: start,
    recommended_equipment: recommended,
    alternatives,
    conflicts: allConflicts,
    schedule: { start_date: start, end_date: end },
    explanation: explanationParts.join(' '),
    confidence: Math.round((avgScore / 100) * 100) / 100,
    project_id: project?.project_id ?? null,
  };
}
