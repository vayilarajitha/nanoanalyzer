"""
NanoAnalyzer Pure Unit Testing Suite
Verifies core biophysical formulas, mathematical models, internalisation mechanisms,
and input validation logic implemented in the NanoAnalyzer biophysical engine.
"""

import math
import unittest

# Implementation of the biophysical formulas matching api/predict.php
def calculate_biophysical_uptake(size_nm, material='Gold (Au)', shape='Spherical', 
                                 charge_mv=20.0, concentration=50.0, exposure_time_h=6.0):
    if size_nm <= 0:
        size_nm = 45.0
        
    # 1. Particle Size Endocytic Peak Curve (Gaussian centered at 45 nm, sigma=18.0)
    size_factor = 95.0 * math.exp(-math.pow(size_nm - 45.0, 2) / (2 * math.pow(18.0, 2)))
    
    # 2. Zeta Potential Electrostatic Attraction Factor
    charge_factor = 1.0 + (charge_mv / 120.0)
    
    # 3. Material Affinity Modifier
    material_mods = {
        'Gold (Au)': 1.05,
        'Liposome': 1.10,
        'PLGA Polymer': 1.02,
        'Silica (SiO2)': 0.95,
        'Iron Oxide (Fe3O4)': 0.92,
        'Carbon Nanotube': 0.88,
        'Quantum Dot': 0.85
    }
    mat_mod = material_mods.get(material, 1.0)
    
    # 4. Shape Factor Modifier
    shape_mods = {
        'Spherical': 1.08,
        'Rod / Nanorod': 0.96,
        'Cube / Cubic': 0.90,
        'Star / Nanostar': 1.04,
        'Disc / Platelet': 0.85
    }
    shape_mod = shape_mods.get(shape, 1.0)
    
    # 5. Time Kinetics Saturation Factor (Michaelis-Menten)
    time_factor = exposure_time_h / (exposure_time_h + 2.5)
    
    raw_uptake = size_factor * charge_factor * mat_mod * shape_mod * time_factor
    uptake_percentage = round(min(99.4, max(5.0, raw_uptake)), 1)
    
    return uptake_percentage

def calculate_diffusion_score(size_nm, concentration):
    diffusion_raw = (100.0 - (math.pow(size_nm, 0.6) * 4.5)) + (concentration / 5.0)
    return round(min(98.5, max(10.0, diffusion_raw)), 1)

def determine_internalization_mechanism(size_nm):
    if size_nm <= 25:
        return 'Direct Membrane Translocation / Caveolae-Mediated'
    elif size_nm <= 80:
        return 'Clathrin-Mediated Endocytosis'
    elif size_nm <= 150:
        return 'Caveolae-Mediated Endocytosis'
    else:
        return 'Macropinocytosis & Phagocytosis'

def calculate_toxicity_and_delivery(uptake_pct, charge_mv, material, concentration):
    mat_mods = {
        'Gold (Au)': 1.05,
        'Liposome': 1.10,
        'PLGA Polymer': 1.02,
        'Silica (SiO2)': 0.95,
        'Iron Oxide (Fe3O4)': 0.92
    }
    mat_mod = mat_mods.get(material, 1.0)
    raw_toxicity = (math.pow(abs(charge_mv), 1.2) / 8.0) + ((1.15 - mat_mod) * 25.0) + (concentration / 30.0)
    predicted_toxicity = round(min(95.0, max(2.0, raw_toxicity)), 1)
    delivery_score = round(uptake_pct * (1.0 - (predicted_toxicity / 220.0)), 1)
    return predicted_toxicity, delivery_score


# ==========================================
# UNIT TESTS (PURE CALCULATION & LOGIC)
# ==========================================

class TestNanoAnalyzerBiophysicalUnit(unittest.TestCase):

    def test_optimal_size_endocytic_peak(self):
        """TC_UNIT_01: Verify 45nm nanoparticle demonstrates maximum endocytic uptake compared to 15nm and 120nm."""
        uptake_optimal = calculate_biophysical_uptake(45.0)
        uptake_small = calculate_biophysical_uptake(15.0)
        uptake_large = calculate_biophysical_uptake(120.0)
        
        assert uptake_optimal > uptake_small, f"Expected 45nm ({uptake_optimal}) > 15nm ({uptake_small})"
        assert uptake_optimal > uptake_large, f"Expected 45nm ({uptake_optimal}) > 120nm ({uptake_large})"
        assert 70.0 <= uptake_optimal <= 99.4, "Optimal 45nm uptake should be in high physiological range"

    def test_surface_charge_electrostatic_effect(self):
        """TC_UNIT_02: Verify cationic nanoparticles (+25mV) have higher uptake than anionic nanoparticles (-25mV)."""
        uptake_cationic = calculate_biophysical_uptake(45.0, charge_mv=25.0)
        uptake_neutral = calculate_biophysical_uptake(45.0, charge_mv=0.0)
        uptake_anionic = calculate_biophysical_uptake(45.0, charge_mv=-25.0)
        
        assert uptake_cationic > uptake_neutral, "Cationic should exceed neutral uptake due to membrane attraction"
        assert uptake_neutral > uptake_anionic, "Neutral should exceed anionic uptake due to membrane repulsion"

    def test_material_affinity_hierarchy(self):
        """TC_UNIT_03: Verify Liposome and Gold exceed Silica affinity."""
        uptake_lipo = calculate_biophysical_uptake(45.0, material='Liposome')
        uptake_gold = calculate_biophysical_uptake(45.0, material='Gold (Au)')
        uptake_silica = calculate_biophysical_uptake(45.0, material='Silica (SiO2)')
        
        assert uptake_lipo > uptake_gold > uptake_silica, "Liposome > Gold > Silica material modifiers must be respected"

    def test_shape_endocytosis_modifier(self):
        """TC_UNIT_04: Verify Spherical particles enter cells more efficiently than Cubic particles."""
        uptake_spherical = calculate_biophysical_uptake(45.0, shape='Spherical')
        uptake_cubic = calculate_biophysical_uptake(45.0, shape='Cube / Cubic')
        
        assert uptake_spherical > uptake_cubic, "Spherical curvature enhances receptor wrapping over cubic geometry"

    def test_time_saturation_kinetics(self):
        """TC_UNIT_05: Verify uptake increases with exposure time and approaches saturation."""
        uptake_1h = calculate_biophysical_uptake(45.0, exposure_time_h=1.0)
        uptake_6h = calculate_biophysical_uptake(45.0, exposure_time_h=6.0)
        uptake_24h = calculate_biophysical_uptake(45.0, exposure_time_h=24.0)
        
        assert uptake_1h < uptake_6h < uptake_24h, "Uptake should increase with time"
        assert (uptake_24h - uptake_6h) < (uptake_6h - uptake_1h), "Rate of uptake increase should slow toward saturation"

    def test_internalization_mechanism_boundaries(self):
        """TC_UNIT_06: Verify mechanism assignment based on particle diameter."""
        assert determine_internalization_mechanism(15.0) == 'Direct Membrane Translocation / Caveolae-Mediated'
        assert determine_internalization_mechanism(50.0) == 'Clathrin-Mediated Endocytosis'
        assert determine_internalization_mechanism(100.0) == 'Caveolae-Mediated Endocytosis'
        assert determine_internalization_mechanism(250.0) == 'Macropinocytosis & Phagocytosis'

    def test_diffusion_score_inversely_related_to_size(self):
        """TC_UNIT_07: Verify smaller particles have higher diffusion scores."""
        diff_small = calculate_diffusion_score(20.0, 50.0)
        diff_large = calculate_diffusion_score(200.0, 50.0)
        
        assert diff_small > diff_large, "Smaller nanoparticles must exhibit greater extracellular matrix diffusion"
        assert 10.0 <= diff_small <= 98.5
        assert 10.0 <= diff_large <= 98.5

    def test_toxicity_and_delivery_efficiency(self):
        """TC_UNIT_08: Verify high absolute charge increases cytotoxicity index."""
        uptake = calculate_biophysical_uptake(45.0)
        tox_low_charge, eff_low_charge = calculate_toxicity_and_delivery(uptake, 5.0, 'Gold (Au)', 20.0)
        tox_high_charge, eff_high_charge = calculate_toxicity_and_delivery(uptake, 50.0, 'Gold (Au)', 20.0)
        
        assert tox_high_charge > tox_low_charge, "Higher zeta potential increases membrane disruption and toxicity"
        assert eff_low_charge > eff_high_charge, "Net delivery efficiency balances uptake against cytotoxicity"

    def test_uptake_bounds_clamping(self):
        """TC_UNIT_09: Verify uptake percentage never exceeds 99.4% or drops below 5.0%."""
        extreme_high = calculate_biophysical_uptake(45.0, material='Liposome', charge_mv=100.0, exposure_time_h=100.0)
        extreme_low = calculate_biophysical_uptake(1000.0, material='Carbon Nanotube', shape='Disc / Platelet', charge_mv=-100.0, exposure_time_h=0.01)
        
        assert extreme_high <= 99.4, "Uptake should not exceed 99.4%"
        assert extreme_low >= 5.0, "Uptake should not be below 5.0%"

    def test_input_sanitization_and_fallbacks(self):
        """TC_UNIT_10: Verify zero or negative size falls back safely to 45nm."""
        fallback_uptake = calculate_biophysical_uptake(0.0)
        normal_45_uptake = calculate_biophysical_uptake(45.0)
        
        assert fallback_uptake == normal_45_uptake, "Non-positive size must fall back safely to 45nm default"
