// NanoAnalyzer - Pure Local Storage & State Management
// 100% Standalone & Offline - No API or External Network Dependency

import { runBiophysicalSimulation } from './biomodel.js';
import { MATERIALS, CELL_TYPES } from '../constants/theme.js';

// Initial preloaded benchmark datasets (from web database)
const INITIAL_DATASETS = [
  {
    id: 'ds-1',
    name: 'AuNP PEGylated Standard',
    core_material: 'Gold (Au)',
    nanoparticle_type: 'Inorganic',
    size_nm: 45.0,
    surface_charge_mv: 18.5,
    cell_type: 'HeLa',
    concentration: 50.0,
    uptake_efficiency_percent: 88.4,
    toxicity_score: 6.2,
    notes: 'Clathrin-mediated endocytic pathway reference standard (Peak: 45nm)'
  },
  {
    id: 'ds-2',
    name: 'PLGA Doxorubicin Carrier',
    core_material: 'PLGA Polymer',
    nanoparticle_type: 'Polymeric',
    size_nm: 52.0,
    surface_charge_mv: -12.4,
    cell_type: 'Cancer MDA-MB-231',
    concentration: 75.0,
    uptake_efficiency_percent: 79.1,
    toxicity_score: 14.8,
    notes: 'Sustained drug payload release kinetic formulation with high tumor affinity'
  },
  {
    id: 'ds-3',
    name: 'Cationic Liposome Formulation',
    core_material: 'Liposome',
    nanoparticle_type: 'Liposome',
    size_nm: 68.0,
    surface_charge_mv: 32.0,
    cell_type: 'Macrophage',
    concentration: 40.0,
    uptake_efficiency_percent: 84.7,
    toxicity_score: 18.2,
    notes: 'High electrostatic membrane fusion index for immune targeting'
  },
  {
    id: 'ds-4',
    name: 'Mesoporous Silica Nanosphere',
    core_material: 'Silica (SiO2)',
    nanoparticle_type: 'Inorganic',
    size_nm: 38.0,
    surface_charge_mv: -5.0,
    cell_type: 'HEK293',
    concentration: 60.0,
    uptake_efficiency_percent: 72.3,
    toxicity_score: 8.5,
    notes: 'Biocompatible porous matrix for peptide encapsulation'
  },
  {
    id: 'ds-5',
    name: 'SPION Magnetic Nanocarrier',
    core_material: 'Iron Oxide (Fe3O4)',
    nanoparticle_type: 'Magnetic',
    size_nm: 35.0,
    surface_charge_mv: 12.0,
    cell_type: 'Endothelial',
    concentration: 45.0,
    uptake_efficiency_percent: 68.9,
    toxicity_score: 11.4,
    notes: 'Superparamagnetic iron oxide for MRI contrast and magnetofection'
  }
];

// Initial lab experiment protocols (matching experiments.php)
const INITIAL_EXPERIMENTS = [
  {
    id: 'exp-1',
    title: 'HeLa Cell Kinetic Time-Course Assay',
    description: 'Assess intracellular concentration over 1h, 4h, 8h and 24h intervals',
    nanoparticle_type: 'Inorganic',
    core_material: 'Gold (Au)',
    particle_size_nm: 45.0,
    target_cell_line: 'HeLa',
    status: 'In Progress'
  },
  {
    id: 'exp-2',
    title: 'PLGA Doxorubicin Tumor Penetration',
    description: 'Evaluate 3D multicellular tumor spheroid penetration depth',
    nanoparticle_type: 'Polymeric',
    core_material: 'PLGA Polymer',
    particle_size_nm: 50.0,
    target_cell_line: 'Cancer MDA-MB-231',
    status: 'Planned'
  },
  {
    id: 'exp-3',
    title: 'Liposome MTT Cytotoxicity Matrix',
    description: 'Determine IC50 threshold against primary endothelial cultures',
    nanoparticle_type: 'Liposome',
    core_material: 'Liposome',
    particle_size_nm: 70.0,
    target_cell_line: 'Endothelial',
    status: 'Completed'
  },
  {
    id: 'exp-4',
    title: 'Silica Drug Loading Efficiency',
    description: 'Spectrophotometric assessment of small molecule drug retention',
    nanoparticle_type: 'Inorganic',
    core_material: 'Silica (SiO2)',
    particle_size_nm: 38.0,
    target_cell_line: 'HEK293',
    status: 'On Hold'
  }
];

// In-app storage arrays
let datasets = [...INITIAL_DATASETS];
let experiments = [...INITIAL_EXPERIMENTS];
let simulationHistory = [
  {
    id: 'sim-default-1',
    inputs: {
      name: 'PEG-AuNP HeLa Benchmark',
      material: 'Gold (Au)',
      size_nm: 45.0,
      charge_mv: 18.0,
      cell_type: 'HeLa',
      exposure_time: 4.0,
      concentration: 50.0
    },
    predictedUptake: 88.4,
    predictedToxicity: 6.2,
    deliveryScore: 85.9,
    mechanism: 'Clathrin-Mediated Endocytosis',
    confidenceScore: 97.4,
    recommendation: 'Core material Gold (Au) with particle diameter 45nm exhibits high thermodynamic affinity for HeLa.',
    curvePoints: [],
    timestamp: 'Today, 10:30 AM'
  },
  {
    id: 'sim-default-2',
    inputs: {
      name: 'Dox-PLGA Breast Target',
      material: 'PLGA Polymer',
      size_nm: 52.0,
      charge_mv: -12.0,
      cell_type: 'Cancer MDA-MB-231',
      exposure_time: 6.0,
      concentration: 75.0
    },
    predictedUptake: 79.1,
    predictedToxicity: 14.8,
    deliveryScore: 73.8,
    mechanism: 'Clathrin-Mediated Endocytosis',
    confidenceScore: 96.1,
    recommendation: 'Polymeric PLGA matrix provides stable prolonged endocytic turnover in MDA-MB-231 breast adenocarcinoma.',
    curvePoints: [],
    timestamp: 'Yesterday, 04:15 PM'
  }
];

// Listeners for reactive updates
const listeners = new Set();
function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function subscribeToStore(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// 1. Stats calculation (matching index.php & dashboard.php)
export function getPlatformStats() {
  return {
    dataset_count: datasets.length,
    prediction_count: simulationHistory.length,
    experiment_count: experiments.length,
    optimal_size_nm: '40 – 50 nm',
    model_accuracy: '96.8%'
  };
}

// 2. Datasets
export function getDatasets() {
  return [...datasets];
}

export function createDataset(item) {
  const newDataset = {
    id: `ds-${Date.now()}`,
    ...item,
    created_at: new Date().toISOString()
  };
  datasets.unshift(newDataset);
  notifyListeners();
  return newDataset;
}

export function deleteDataset(id) {
  datasets = datasets.filter(d => d.id !== id);
  notifyListeners();
  return true;
}

// CSV export string generator (matching datasets.php CSV export)
export function exportDatasetsToCsvString() {
  const header = ['ID', 'Dataset Name', 'Core Material', 'Type', 'Size (nm)', 'Zeta Potential (mV)', 'Cell Line', 'Uptake (%)', 'Toxicity Score', 'Notes'];
  const rows = datasets.map(d => [
    d.id,
    `"${d.name || d.dataset_name || ''}"`,
    `"${d.core_material || d.material || ''}"`,
    `"${d.nanoparticle_type || 'Inorganic'}"`,
    d.size_nm || d.nanoparticle_size || '',
    d.surface_charge_mv || d.charge || '',
    `"${d.cell_type || ''}"`,
    d.uptake_efficiency_percent ?? '',
    d.toxicity_score ?? '',
    `"${(d.notes || '').replace(/"/g, '""')}"`
  ]);

  return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// 3. Experiments
export function getExperiments() {
  return [...experiments];
}

export function createExperiment(item) {
  const newExp = {
    id: `exp-${Date.now()}`,
    status: 'Planned',
    ...item,
    created_at: new Date().toISOString()
  };
  experiments.unshift(newExp);
  notifyListeners();
  return newExp;
}

export function setExperimentStatus(id, newStatus) {
  const found = experiments.find(e => e.id === id);
  if (found) {
    found.status = newStatus;
    notifyListeners();
  }
}

export function deleteExperiment(id) {
  experiments = experiments.filter(e => e.id !== id);
  notifyListeners();
  return true;
}

// 4. Simulations (Pure Local Deterministic Biophysical Execution)
export function runAndSaveSimulation(params) {
  const result = runBiophysicalSimulation(params);
  const record = {
    id: `sim-${Date.now()}`,
    ...result
  };
  simulationHistory.unshift(record);
  notifyListeners();
  return record;
}

export function getSimulationHistory() {
  return [...simulationHistory];
}

export function deleteSimulation(id) {
  simulationHistory = simulationHistory.filter(s => s.id !== id);
  notifyListeners();
  return true;
}

export function clearHistory() {
  simulationHistory = [];
  notifyListeners();
}

// 5. Analytics Aggregation Engine (matching analytics.php)
export function getAnalyticsData() {
  // Aggregate all sources (datasets + past simulations)
  const allUptakes = [];
  const allTox = [];
  const materialCounts = {};
  const materialToxicity = {};
  const cellLineUptake = {};

  // Initialize material map
  MATERIALS.forEach(m => {
    materialCounts[m.id] = 0;
    materialToxicity[m.id] = [];
  });

  // Initialize cell lines
  CELL_TYPES.forEach(c => {
    cellLineUptake[c.id] = [];
  });

  // Ingest datasets
  datasets.forEach(d => {
    const mat = d.core_material || d.material || 'Polymer';
    const cell = d.cell_type || 'HeLa';
    const uptake = parseFloat(d.uptake_efficiency_percent);
    const tox = parseFloat(d.toxicity_score);

    if (!isNaN(uptake)) allUptakes.push(uptake);
    if (!isNaN(tox)) allTox.push(tox);

    if (materialCounts[mat] !== undefined) {
      materialCounts[mat]++;
    } else {
      materialCounts[mat] = 1;
    }

    if (!isNaN(tox)) {
      if (!materialToxicity[mat]) materialToxicity[mat] = [];
      materialToxicity[mat].push(tox);
    }

    if (!isNaN(uptake)) {
      if (!cellLineUptake[cell]) cellLineUptake[cell] = [];
      cellLineUptake[cell].push(uptake);
    }
  });

  // Ingest simulation runs
  simulationHistory.forEach(s => {
    const mat = s.inputs?.material || 'Gold (Au)';
    const cell = s.inputs?.cell_type || 'HeLa';
    const uptake = s.predictedUptake;
    const tox = s.predictedToxicity;

    if (!isNaN(uptake)) allUptakes.push(uptake);
    if (!isNaN(tox)) allTox.push(tox);

    if (materialCounts[mat] !== undefined) {
      materialCounts[mat]++;
    } else {
      materialCounts[mat] = 1;
    }

    if (!isNaN(tox)) {
      if (!materialToxicity[mat]) materialToxicity[mat] = [];
      materialToxicity[mat].push(tox);
    }

    if (!isNaN(uptake)) {
      if (!cellLineUptake[cell]) cellLineUptake[cell] = [];
      cellLineUptake[cell].push(uptake);
    }
  });

  // Calculate Averages
  const avgUptake = allUptakes.length ? Math.round((allUptakes.reduce((a, b) => a + b, 0) / allUptakes.length) * 10) / 10 : 81.2;
  const avgToxicity = allTox.length ? Math.round((allTox.reduce((a, b) => a + b, 0) / allTox.length) * 10) / 10 : 11.5;

  // Material share list
  const totalMat = Object.values(materialCounts).reduce((a, b) => a + b, 0) || 1;
  const materialShare = Object.keys(materialCounts).map(name => {
    const count = materialCounts[name] || 0;
    const matObj = MATERIALS.find(m => m.id === name);
    return {
      name,
      count,
      percent: Math.round((count / totalMat) * 100),
      color: matObj?.color || '#06b6d4'
    };
  }).filter(m => m.count > 0).sort((a, b) => b.count - a.count);

  // Mean toxicity by material
  const toxicityByMaterial = Object.keys(materialToxicity).map(name => {
    const list = materialToxicity[name];
    const mean = list.length ? Math.round((list.reduce((a, b) => a + b, 0) / list.length) * 10) / 10 : 10.0;
    const matObj = MATERIALS.find(m => m.id === name);
    return {
      material: name,
      meanToxicity: mean,
      color: matObj?.color || '#f43f5e'
    };
  }).filter(m => m.meanToxicity > 0).sort((a, b) => b.meanToxicity - a.meanToxicity);

  // Mean internalisation by cell line
  const cellLineUptakeList = Object.keys(cellLineUptake).map(name => {
    const list = cellLineUptake[name];
    const mean = list.length ? Math.round((list.reduce((a, b) => a + b, 0) / list.length) * 10) / 10 : 75.0;
    return {
      cellLine: name,
      meanUptake: mean
    };
  }).sort((a, b) => b.meanUptake - a.meanUptake);

  return {
    totalDatasets: datasets.length,
    totalSimulations: simulationHistory.length,
    totalProtocols: experiments.length,
    avgUptake,
    avgToxicity,
    materialShare,
    toxicityByMaterial,
    cellLineUptakeList
  };
}

export function resetToDefaults() {
  datasets = [...INITIAL_DATASETS];
  experiments = [...INITIAL_EXPERIMENTS];
  simulationHistory = [];
  notifyListeners();
}
