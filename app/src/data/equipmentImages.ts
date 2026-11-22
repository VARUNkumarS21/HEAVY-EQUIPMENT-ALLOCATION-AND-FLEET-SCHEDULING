// Centralized equipment image registry — maps equipment type → realistic imagery.
// Model-specific images can be registered in MODEL_IMAGES and take precedence.

const BASE = '/images/equipment';

export const EQUIPMENT_TYPE_IMAGES: Record<string, string> = {
  'Excavator': `${BASE}/excavator.png`,
  'Dump Truck': `${BASE}/dump-truck.png`,
  'Mobile Crane': `${BASE}/mobile-crane.png`,
  'Tower Crane': `${BASE}/tower-crane.png`,
  'Concrete Pump': `${BASE}/concrete-pump.png`,
  'Concrete Mixer': `${BASE}/concrete-mixer.png`,
  'Roller': `${BASE}/roller.png`,
  'Soil Compactor': `${BASE}/roller.png`,
  'Motor Grader': `${BASE}/grader.png`,
  'Grader': `${BASE}/grader.png`,
  'Bulldozer': `${BASE}/bulldozer.png`,
  'Backhoe Loader': `${BASE}/backhoe-loader.png`,
  'Piling Rig': `${BASE}/piling-rig.png`,
  'Boom Lift': `${BASE}/boom-lift.png`,
  'Scissor Lift': `${BASE}/scissor-lift.png`,
  'Scaffolding': `${BASE}/scaffolding.png`,
  'Ringlock Scaffolding': `${BASE}/scaffolding.png`,
  'Power Trowel': `${BASE}/power-trowel.png`,
  'Material Hoist': `${BASE}/tower-crane.png`,
  'Laser Screed': `${BASE}/power-trowel.png`,
  'Plastering Machine': `${BASE}/scaffolding.png`,
};

export const MODEL_IMAGES: Record<string, string> = {
  // model-specific overrides can be registered here
};

export function getEquipmentImage(equipmentType: string, model?: string): string {
  if (model && MODEL_IMAGES[model]) return MODEL_IMAGES[model];
  return EQUIPMENT_TYPE_IMAGES[equipmentType] ?? `${BASE}/excavator.png`;
}
