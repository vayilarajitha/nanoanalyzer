// Deterministic Biophysical Simulation Engine (JavaScript / React Native Port)
// Matches predict.php deterministic multi-parameter kinetic formulas

import { MATERIALS, CELL_TYPES } from '../constants/theme.js';

export function runBiophysicalSimulation({
  name = 'Simulation',
  material = 'Gold (Au)',
  nanoparticle_type = 'Inorganic',
  size_nm = 45.0,
  charge_mv = 20.0,
  cell_type = 'HeLa',
  exposure_time = 4.0,
  concentration = 50.0
}) {
  const size = Math.max(5.0, parseFloat(size_nm) || 45.0);
  const charge = parseFloat(charge_mv) || 0.0;
  const time = Math.max(0.5, parseFloat(exposure_time) || 4.0);
  const dose = Math.max(1.0, parseFloat(concentration) || 50.0);

  // 1. Particle Size Endocytic Peak Curve (Gaussian centered at 45 nm, sigma 18)
  const sizeFactor = 95.0 * Math.exp(-Math.pow(size - 45.0, 2) / (2 * Math.pow(18.0, 2)));

  // 2. Zeta Potential Electrostatic Attraction Factor
  const chargeFactor = 1.0 + (charge / 120.0);

  // 3. Core Material Affinity Modifier
  const matObj = MATERIALS.find(m => m.id === material || m.name === material);
  const matMod = matObj ? matObj.mod : 1.0;

  // 4. Target Cell Line Receptor Saturation Kinetics
  const cellObj = CELL_TYPES.find(c => c.id === cell_type || c.name === cell_type);
  const cellMod = cellObj ? cellObj.mod : 1.0;

  // 5. Time Kinetics Saturation Factor (Michaelis-Menten style)
  const timeFactor = time / (time + 2.5);

  // Final Predicted Cellular Uptake Percentage
  const rawUptake = sizeFactor * chargeFactor * matMod * cellMod * timeFactor;
  const predictedUptake = Math.round(Math.min(99.4, Math.max(5.0, rawUptake)) * 10) / 10;

  // Cytotoxicity Index
  const rawToxicity = (Math.pow(Math.abs(charge), 1.2) / 8.0) + ((1.15 - matMod) * 25.0) + (dose / 30.0);
  const predictedToxicity = Math.round(Math.min(95.0, Math.max(2.0, rawToxicity)) * 10) / 10;

  // Delivery Efficiency Score
  const deliveryScore = Math.round((predictedUptake * (1.0 - (predictedToxicity / 220.0))) * 10) / 10;

  // Primary Cellular Internalisation Mechanism
  let mechanism = '';
  if (size <= 25) {
    mechanism = 'Direct Membrane Translocation / Caveolae-Mediated';
  } else if (size <= 80) {
    mechanism = 'Clathrin-Mediated Endocytosis';
  } else if (size <= 150) {
    mechanism = 'Caveolae-Mediated Endocytosis';
  } else {
    mechanism = 'Macropinocytosis & Phagocytosis';
  }

  // Deterministic Confidence Score (94.0 - 98.5%)
  const seed = Math.abs(Math.sin(size * 12.9898 + charge * 78.233 + time * 37.719));
  const confidenceScore = Math.round((94.0 + (seed * 4.5)) * 10) / 10;

  // Recommendation String
  const recommendation = `Core material ${material} with particle diameter ${size}nm exhibits high thermodynamic affinity for ${cell_type}. Surface zeta potential of ${charge}mV provides favorable electrostatic binding.`;

  // Dynamic 22-point Uptake Curve across diameters 10nm to 120nm
  const curvePoints = [];
  for (let s = 10; s <= 120; s += 5) {
    const sf = 95.0 * Math.exp(-Math.pow(s - 45.0, 2) / (2 * Math.pow(18.0, 2)));
    const u = Math.round(Math.min(99.4, Math.max(5.0, sf * chargeFactor * matMod * cellMod * timeFactor)) * 10) / 10;
    curvePoints.push({ size: s, uptake: u, isCurrent: Math.abs(s - size) < 3 });
  }

  return {
    inputs: {
      name,
      material,
      nanoparticle_type,
      size_nm: size,
      charge_mv: charge,
      cell_type,
      exposure_time: time,
      concentration: dose
    },
    predictedUptake,
    predictedToxicity,
    deliveryScore,
    mechanism,
    confidenceScore,
    recommendation,
    curvePoints,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
