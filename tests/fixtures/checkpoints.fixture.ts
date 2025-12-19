/**
 * Checkpoints Fixtures for Testing
 *
 * These are sample checkpoint data from checkpoints_v2.1.json
 * used in unit, integration, and E2E tests.
 */

export interface TestCheckpoint {
  id: string;
  name: string;
  category: string;
  description: string;
  tolerances: string;
  method: string;
  standard: string;
  photos?: string[];
  notes?: string[];
  status?: 'pass' | 'fail' | 'noncompliant' | null;
  room?: string;
  timestamp?: Date;
}

// ===========================
// Walls Category - Sample Checkpoints
// ===========================

const wallsCheckpoints: TestCheckpoint[] = [
  {
    id: 'wall-001',
    name: 'Wall Surface Condition',
    category: 'walls',
    description: 'Inspect overall wall surface for cracks, damage, moisture stains',
    tolerances: 'No cracks larger than 1mm, no moisture stains',
    method: 'Visual inspection + moisture meter',
    standard: 'Building Code Section 5.2',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'wall-002',
    name: 'Paint/Finish Quality',
    category: 'walls',
    description: 'Check paint condition, peeling, adhesion',
    tolerances: 'No peeling paint, finish must be intact',
    method: 'Visual inspection, adhesion test',
    standard: 'Interior Design Standard 4.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'wall-003',
    name: 'Wall Plumb and Level',
    category: 'walls',
    description: 'Check if walls are plumb (vertical) and level',
    tolerances: '±1/8" per 10 feet',
    method: 'Level and straightedge inspection',
    standard: 'Construction Standard 3.5',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'wall-004',
    name: 'Wallpaper/Covering Condition',
    category: 'walls',
    description: 'Inspect wallpaper, decals, or wall coverings for condition',
    tolerances: 'No peeling, bubbles, or loose edges',
    method: 'Visual inspection',
    standard: 'Decorative Standard 2.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'wall-005',
    name: 'Baseboard Condition',
    category: 'walls',
    description: 'Check baseboard for damage, loose nails, missing trim',
    tolerances: 'Securely attached, no gaps larger than 1/8"',
    method: 'Visual + tactile inspection',
    standard: 'Trim Standard 4.2',
    status: null,
    photos: [],
    notes: [],
  },
];

// ===========================
// Floors Category - Sample Checkpoints
// ===========================

const floorsCheckpoints: TestCheckpoint[] = [
  {
    id: 'floor-001',
    name: 'Floor Surface Condition',
    category: 'floors',
    description: 'Inspect floor for scratches, dents, water damage',
    tolerances: 'No deep scratches or dents larger than 1/4"',
    method: 'Visual inspection',
    standard: 'Floor Standard 5.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'floor-002',
    name: 'Floor Level and Flatness',
    category: 'floors',
    description: 'Check if floor is level and flat',
    tolerances: '±1/8" per 10 feet',
    method: 'Level and straightedge inspection',
    standard: 'Construction Standard 3.5',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'floor-003',
    name: 'Carpet/Flooring Material',
    category: 'floors',
    description: 'Inspect carpet or flooring for stains, tears, wear',
    tolerances: 'No stains larger than 2", no tears',
    method: 'Visual inspection',
    standard: 'Flooring Standard 6.2',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'floor-004',
    name: 'Transitions and Thresholds',
    category: 'floors',
    description: 'Check transitions between different floor materials',
    tolerances: 'Secure, no gaps larger than 1/8"',
    method: 'Visual + tactile inspection',
    standard: 'Installation Standard 4.3',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'floor-005',
    name: 'Subfloor Condition',
    category: 'floors',
    description: 'Check for bouncy areas, squeaks indicating issues',
    tolerances: 'No significant movement',
    method: 'Walking inspection, listening for squeaks',
    standard: 'Structural Standard 2.1',
    status: null,
    photos: [],
    notes: [],
  },
];

// ===========================
// Ceiling Category - Sample Checkpoints
// ===========================

const ceilingCheckpoints: TestCheckpoint[] = [
  {
    id: 'ceiling-001',
    name: 'Ceiling Surface Condition',
    category: 'ceiling',
    description: 'Inspect ceiling for water stains, cracks, sagging',
    tolerances: 'No water stains, cracks, or sagging',
    method: 'Visual inspection from floor level',
    standard: 'Ceiling Standard 5.3',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'ceiling-002',
    name: 'Ceiling Height and Level',
    category: 'ceiling',
    description: 'Check ceiling height and levelness',
    tolerances: 'Minimum 8 feet, ±1/4" per 10 feet',
    method: 'Tape measure and level',
    standard: 'Building Code Section 3.2',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'ceiling-003',
    name: 'Paint/Finish Quality',
    category: 'ceiling',
    description: 'Check paint condition, peeling, stains',
    tolerances: 'No peeling, stains, or damage',
    method: 'Visual inspection',
    standard: 'Interior Design Standard 4.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'ceiling-004',
    name: 'Insulation Visible',
    category: 'ceiling',
    description: 'Check for exposed insulation or deterioration',
    tolerances: 'No exposed insulation, proper installation',
    method: 'Visual inspection',
    standard: 'Energy Standard 2.5',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'ceiling-005',
    name: 'Light Fixtures and Hardware',
    category: 'ceiling',
    description: 'Inspect mounted fixtures for security and condition',
    tolerances: 'Securely mounted, functional',
    method: 'Visual + function test',
    standard: 'Electrical Standard 3.2',
    status: null,
    photos: [],
    notes: [],
  },
];

// ===========================
// Windows Category - Sample Checkpoints
// ===========================

const windowsCheckpoints: TestCheckpoint[] = [
  {
    id: 'window-001',
    name: 'Window Glass Condition',
    category: 'windows',
    description: 'Inspect for cracks, chips, or damage',
    tolerances: 'No cracks or chips',
    method: 'Visual inspection from inside and outside',
    standard: 'Glass Standard 2.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'window-002',
    name: 'Window Frame Condition',
    category: 'windows',
    description: 'Check frame for rot, damage, proper paint',
    tolerances: 'No rot, paint intact, no missing caulk',
    method: 'Visual + tactile inspection',
    standard: 'Building Material Standard 4.2',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'window-003',
    name: 'Window Operation',
    category: 'windows',
    description: 'Test window opening and closing smoothly',
    tolerances: 'Opens and closes smoothly',
    method: 'Function test',
    standard: 'Hardware Standard 3.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'window-004',
    name: 'Window Seals and Weatherstripping',
    category: 'windows',
    description: 'Check caulking and weatherstripping condition',
    tolerances: 'No gaps, intact weatherstripping',
    method: 'Visual inspection',
    standard: 'Energy Standard 2.5',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'window-005',
    name: 'Window Hardware',
    category: 'windows',
    description: 'Inspect locks, handles, hinges for proper function',
    tolerances: 'All hardware functional',
    method: 'Function test',
    standard: 'Hardware Standard 3.1',
    status: null,
    photos: [],
    notes: [],
  },
];

// ===========================
// Doors Category - Sample Checkpoints
// ===========================

const doorsCheckpoints: TestCheckpoint[] = [
  {
    id: 'door-001',
    name: 'Door Surface Condition',
    category: 'doors',
    description: 'Inspect door for dents, scratches, or damage',
    tolerances: 'No major damage',
    method: 'Visual inspection',
    standard: 'Door Standard 4.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'door-002',
    name: 'Door Frame Condition',
    category: 'doors',
    description: 'Check frame for warping, cracks, or damage',
    tolerances: 'Frame straight, no cracks',
    method: 'Visual + straightedge test',
    standard: 'Building Material Standard 4.2',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'door-003',
    name: 'Door Operation',
    category: 'doors',
    description: 'Test door opening and closing smoothly',
    tolerances: 'Opens and closes smoothly',
    method: 'Function test',
    standard: 'Hardware Standard 3.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'door-004',
    name: 'Door Locks and Hardware',
    category: 'doors',
    description: 'Inspect locks, handles, hinges for proper function',
    tolerances: 'All hardware functional and secure',
    method: 'Function test',
    standard: 'Security Standard 5.2',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'door-005',
    name: 'Door Weatherstripping',
    category: 'doors',
    description: 'Check weatherstripping around door',
    tolerances: 'Intact, no gaps',
    method: 'Visual inspection',
    standard: 'Energy Standard 2.5',
    status: null,
    photos: [],
    notes: [],
  },
];

// ===========================
// Plumbing Category - Sample Checkpoints
// ===========================

const plumbingCheckpoints: TestCheckpoint[] = [
  {
    id: 'plumb-001',
    name: 'Sink Operation',
    category: 'plumbing',
    description: 'Test sink for proper drainage and water pressure',
    tolerances: 'No leaks, good pressure and drainage',
    method: 'Function test',
    standard: 'Plumbing Code Section 2.3',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'plumb-002',
    name: 'Toilet Operation',
    category: 'plumbing',
    description: 'Test toilet flush, water level, leaks',
    tolerances: 'Flushes properly, no leaks',
    method: 'Function test',
    standard: 'Plumbing Code Section 3.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'plumb-003',
    name: 'Shower/Tub Operation',
    category: 'plumbing',
    description: 'Test water temperature, pressure, drainage',
    tolerances: 'Good pressure, proper temperature control, no leaks',
    method: 'Function test',
    standard: 'Plumbing Code Section 4.2',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'plumb-004',
    name: 'Visible Pipes',
    category: 'plumbing',
    description: 'Inspect visible pipes for leaks, corrosion, damage',
    tolerances: 'No leaks, corrosion, or damage',
    method: 'Visual inspection',
    standard: 'Material Standard 2.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'plumb-005',
    name: 'Water Heater',
    category: 'plumbing',
    description: 'Inspect water heater for condition and operation',
    tolerances: 'Functional, no leaks, proper temperature',
    method: 'Visual + function test',
    standard: 'Equipment Standard 3.2',
    status: null,
    photos: [],
    notes: [],
  },
];

// ===========================
// Electrical Category - Sample Checkpoints
// ===========================

const electricalCheckpoints: TestCheckpoint[] = [
  {
    id: 'elec-001',
    name: 'Outlets and Switches',
    category: 'electrical',
    description: 'Test outlets and switches for proper function',
    tolerances: 'All functional, proper grounding',
    method: 'Function test + tester',
    standard: 'Electrical Code Article 406',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'elec-002',
    name: 'Light Fixtures',
    category: 'electrical',
    description: 'Test all light fixtures for proper operation',
    tolerances: 'All functional, no flickering',
    method: 'Function test',
    standard: 'Electrical Code Article 410',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'elec-003',
    name: 'Smoke Detectors',
    category: 'electrical',
    description: 'Test smoke detectors for proper function',
    tolerances: 'Functional, batteries present',
    method: 'Function test',
    standard: 'Safety Code 101-101',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'elec-004',
    name: 'Circuit Breaker Panel',
    category: 'electrical',
    description: 'Inspect breaker panel for condition and labeling',
    tolerances: 'Properly labeled, no damage',
    method: 'Visual inspection',
    standard: 'Electrical Code Article 408',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'elec-005',
    name: 'Electrical Safety',
    category: 'electrical',
    description: 'Check for exposed wiring, missing outlet covers',
    tolerances: 'All outlets covered, no exposed wiring',
    method: 'Visual inspection',
    standard: 'Safety Code 104-105',
    status: null,
    photos: [],
    notes: [],
  },
];

// ===========================
// HVAC Category - Sample Checkpoints
// ===========================

const hvacCheckpoints: TestCheckpoint[] = [
  {
    id: 'hvac-001',
    name: 'Heating System Operation',
    category: 'hvac',
    description: 'Test heating system for proper operation',
    tolerances: 'Heats properly, no strange sounds',
    method: 'Function test',
    standard: 'HVAC Standard 2.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'hvac-002',
    name: 'Air Conditioning Operation',
    category: 'hvac',
    description: 'Test AC for proper cooling and operation',
    tolerances: 'Cools properly, no unusual sounds',
    method: 'Function test',
    standard: 'HVAC Standard 2.2',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'hvac-003',
    name: 'Ventilation System',
    category: 'hvac',
    description: 'Test ventilation fans for proper operation',
    tolerances: 'All fans functional',
    method: 'Function test',
    standard: 'HVAC Standard 3.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'hvac-004',
    name: 'Thermostat Operation',
    category: 'hvac',
    description: 'Test thermostat for proper temperature control',
    tolerances: 'Accurate temperature reading and control',
    method: 'Function test',
    standard: 'HVAC Standard 4.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'hvac-005',
    name: 'HVAC Unit Condition',
    category: 'hvac',
    description: 'Inspect unit for leaks, damage, cleanliness',
    tolerances: 'No leaks, clean filters',
    method: 'Visual inspection',
    standard: 'Maintenance Standard 2.1',
    status: null,
    photos: [],
    notes: [],
  },
];

// ===========================
// Gas Category - Sample Checkpoints
// ===========================

const gasCheckpoints: TestCheckpoint[] = [
  {
    id: 'gas-001',
    name: 'Gas Appliance Operation',
    category: 'gas',
    description: 'Test gas appliances for proper operation',
    tolerances: 'All functional, no gas smell',
    method: 'Function test',
    standard: 'Gas Code Section 2.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'gas-002',
    name: 'Gas Odor Check',
    category: 'gas',
    description: 'Check for gas leaks by smell',
    tolerances: 'No gas smell detected',
    method: 'Olfactory inspection',
    standard: 'Safety Code 102-101',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'gas-003',
    name: 'Gas Meter Condition',
    category: 'gas',
    description: 'Inspect gas meter for leaks and condition',
    tolerances: 'No leaks, properly secured',
    method: 'Visual inspection',
    standard: 'Utility Standard 1.1',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'gas-004',
    name: 'Gas Line Inspection',
    category: 'gas',
    description: 'Inspect gas lines for corrosion and damage',
    tolerances: 'No corrosion, no damage',
    method: 'Visual inspection',
    standard: 'Gas Code Section 1.2',
    status: null,
    photos: [],
    notes: [],
  },
  {
    id: 'gas-005',
    name: 'Gas Shut-off Valve',
    category: 'gas',
    description: 'Test gas shut-off valve for proper function',
    tolerances: 'Valve operational and accessible',
    method: 'Function test',
    standard: 'Safety Code 103-102',
    status: null,
    photos: [],
    notes: [],
  },
];

// ===========================
// Combined Categories Fixture
// ===========================

export const checkpointsFixture = {
  walls: wallsCheckpoints,
  floors: floorsCheckpoints,
  ceiling: ceilingCheckpoints,
  windows: windowsCheckpoints,
  doors: doorsCheckpoints,
  plumbing: plumbingCheckpoints,
  electrical: electricalCheckpoints,
  hvac: hvacCheckpoints,
  gas: gasCheckpoints,
};

// ===========================
// All Checkpoints Flat Array
// ===========================

export const allCheckpointsFlat: TestCheckpoint[] = [
  ...wallsCheckpoints,
  ...floorsCheckpoints,
  ...ceilingCheckpoints,
  ...windowsCheckpoints,
  ...doorsCheckpoints,
  ...plumbingCheckpoints,
  ...electricalCheckpoints,
  ...hvacCheckpoints,
  ...gasCheckpoints,
];

// ===========================
// Factory Functions
// ===========================

export function createTestCheckpoint(overrides?: Partial<TestCheckpoint>): TestCheckpoint {
  return {
    id: `checkpoint-${Date.now()}`,
    name: 'Test Checkpoint',
    category: 'walls',
    description: 'Auto-generated test checkpoint',
    tolerances: 'Standard tolerance',
    method: 'Visual inspection',
    standard: 'Test Standard 1.0',
    status: null,
    photos: [],
    notes: [],
    ...overrides,
  };
}

export default {
  checkpointsFixture,
  allCheckpointsFlat,
  wallsCheckpoints,
  floorsCheckpoints,
  ceilingCheckpoints,
  windowsCheckpoints,
  doorsCheckpoints,
  plumbingCheckpoints,
  electricalCheckpoints,
  hvacCheckpoints,
  gasCheckpoints,
  createTestCheckpoint,
};
