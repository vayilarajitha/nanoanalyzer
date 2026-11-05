// NanoAnalyzer Theme & Design Tokens
export const COLORS = {
  background: '#0a0f1d',
  surface: '#111827',
  surfaceLight: '#1f293d',
  surfaceBorder: '#27354f',
  
  primary: '#06b6d4',      // Vibrant Cyan
  primaryGlow: 'rgba(6, 182, 212, 0.25)',
  secondary: '#6366f1',    // Indigo
  secondaryGlow: 'rgba(99, 102, 241, 0.25)',
  
  success: '#10b981',      // Emerald Green
  warning: '#f59e0b',      // Amber
  danger: '#ef4444',       // Crimson Red
  info: '#38bdf8',         // Sky Blue
  
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  accentGradient: ['#06b6d4', '#6366f1'],
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  radius: 14,
  radiusLg: 20,
};

export const MATERIALS = [
  { id: 'Gold (Au)', name: 'Gold (Au)', mod: 1.05, category: 'Inorganic', color: '#fbbf24' },
  { id: 'Liposome', name: 'Liposome', mod: 1.10, category: 'Lipid', color: '#ec4899' },
  { id: 'PLGA Polymer', name: 'PLGA Polymer', mod: 1.02, category: 'Polymeric', color: '#06b6d4' },
  { id: 'Silica (SiO2)', name: 'Silica (SiO2)', mod: 0.95, category: 'Inorganic', color: '#94a3b8' },
  { id: 'Iron Oxide (Fe3O4)', name: 'Iron Oxide (Fe3O4)', mod: 0.92, category: 'Magnetic', color: '#f97316' },
  { id: 'Carbon Nanotube', name: 'Carbon Nanotube', mod: 0.88, category: 'Carbon', color: '#6366f1' },
  { id: 'Quantum Dot', name: 'Quantum Dot', mod: 0.85, category: 'Nanocrystal', color: '#a855f7' }
];

export const CELL_TYPES = [
  { id: 'HeLa', name: 'HeLa (Cervical Carcinoma)', mod: 1.12, type: 'Human Epithelial' },
  { id: 'Cancer MDA-MB-231', name: 'MDA-MB-231 (Breast Cancer)', mod: 1.15, type: 'Adenocarcinoma' },
  { id: 'Macrophage', name: 'Macrophage (Immune)', mod: 1.08, type: 'Phagocytic' },
  { id: 'HEK293', name: 'HEK293 (Embryonic Kidney)', mod: 0.94, type: 'Non-Tumor' },
  { id: 'Endothelial', name: 'Endothelial (Vascular)', mod: 0.90, type: 'Vessel Wall' }
];
