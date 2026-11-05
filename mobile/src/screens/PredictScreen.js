import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, MATERIALS, CELL_TYPES } from '../constants/theme';
import { runAndSaveSimulation, createDataset } from '../services/storage';
import UptakeCurveChart from '../components/UptakeCurveChart';

export default function PredictScreen({ onNavigate }) {
  const [name, setName] = useState('Nanoparticle_Sim_' + Math.floor(100 + Math.random() * 900));
  const [selectedMaterial, setSelectedMaterial] = useState('Gold (Au)');
  const [sizeNm, setSizeNm] = useState('45.0');
  const [chargeMv, setChargeMv] = useState('20.0');
  const [selectedCell, setSelectedCell] = useState('HeLa');
  const [exposureTime, setExposureTime] = useState('4.0');
  const [concentration, setConcentration] = useState('50.0');

  const [result, setResult] = useState(null);
  const [savedToLib, setSavedToLib] = useState(false);

  const handleSimulate = () => {
    const size = parseFloat(sizeNm);
    if (isNaN(size) || size <= 0) {
      Alert.alert('Invalid Parameter', 'Please provide a positive particle size in nanometers.');
      return;
    }

    const simResult = runAndSaveSimulation({
      name,
      material: selectedMaterial,
      size_nm: size,
      charge_mv: parseFloat(chargeMv) || 0,
      cell_type: selectedCell,
      exposure_time: parseFloat(exposureTime) || 4.0,
      concentration: parseFloat(concentration) || 50.0
    });

    setResult(simResult);
    setSavedToLib(false);
  };

  const handleSaveToLibrary = () => {
    if (!result) return;
    createDataset({
      name: name,
      core_material: selectedMaterial,
      nanoparticle_type: 'Inorganic',
      size_nm: parseFloat(sizeNm) || 45,
      surface_charge_mv: parseFloat(chargeMv) || 0,
      cell_type: selectedCell,
      uptake_efficiency_percent: result.predictedUptake,
      toxicity_score: result.predictedToxicity,
      notes: `Generated from biophysical simulation: ${result.mechanism}`
    });
    setSavedToLib(true);
    Alert.alert('Saved to Library', `Formulation "${name}" successfully saved to local dataset library.`);
  };

  const adjustSize = (delta) => {
    const curr = parseFloat(sizeNm) || 45;
    const next = Math.max(5, Math.min(200, curr + delta));
    setSizeNm(next.toFixed(1));
  };

  const adjustCharge = (delta) => {
    const curr = parseFloat(chargeMv) || 0;
    const next = Math.max(-60, Math.min(60, curr + delta));
    setChargeMv(next.toFixed(1));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Simulation Setup Box */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="hardware-chip" size={18} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Simulation Parameters</Text>
        </View>

        {/* Experiment Name */}
        <Text style={styles.label}>Analysis Title</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. PEG-AuNP HeLa Uptake"
          placeholderTextColor={COLORS.textMuted}
        />

        {/* Particle Size Input with Quick Adjusters */}
        <View style={styles.rowBetween}>
          <Text style={styles.label}>
            Hydrodynamic Diameter: <Text style={styles.highlight}>{sizeNm} nm</Text>
          </Text>
          <Text style={styles.optimalBadge}>Optimal 40–50nm</Text>
        </View>
        <View style={styles.stepperRow}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustSize(-5)}>
            <Ionicons name="remove" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.stepperInput]}
            value={sizeNm}
            onChangeText={setSizeNm}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustSize(+5)}>
            <Ionicons name="add" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Surface Charge Zeta Potential */}
        <View style={styles.rowBetween}>
          <Text style={styles.label}>
            Zeta Potential: <Text style={styles.highlight}>{chargeMv} mV</Text>
          </Text>
          <Text style={styles.noteText}>Negative or Positive</Text>
        </View>
        <View style={styles.stepperRow}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustCharge(-5)}>
            <Ionicons name="remove" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.stepperInput]}
            value={chargeMv}
            onChangeText={setChargeMv}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustCharge(+5)}>
            <Ionicons name="add" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Core Material Selector */}
        <Text style={styles.label}>Core Material Formulation</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {MATERIALS.map((mat) => {
            const isSelected = selectedMaterial === mat.id;
            return (
              <TouchableOpacity
                key={mat.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedMaterial(mat.id)}
              >
                <View style={[styles.chipDot, { backgroundColor: mat.color }]} />
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {mat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Target Cell Line */}
        <Text style={styles.label}>Target Cell Line</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {CELL_TYPES.map((cell) => {
            const isSelected = selectedCell === cell.id;
            return (
              <TouchableOpacity
                key={cell.id}
                style={[styles.chip, isSelected && styles.chipActiveCell]}
                onPress={() => setSelectedCell(cell.id)}
              >
                <Ionicons 
                  name="radio-button-on" 
                  size={12} 
                  color={isSelected ? COLORS.secondary : COLORS.textMuted} 
                />
                <Text style={[styles.chipText, isSelected && styles.chipTextActiveCell]}>
                  {cell.id}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Incubation Time & Concentration */}
        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Time (Hours)</Text>
            <TextInput
              style={styles.input}
              value={exposureTime}
              onChangeText={setExposureTime}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Dose (µg/mL)</Text>
            <TextInput
              style={styles.input}
              value={concentration}
              onChangeText={setConcentration}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.runButton}
          onPress={handleSimulate}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={18} color="#000" />
          <Text style={styles.runButtonText}>Execute Biophysical Simulation</Text>
        </TouchableOpacity>
      </View>

      {/* Result Display Box */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultBadgeRow}>
            <View style={styles.livePill}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.livePillText}>Simulation Complete</Text>
            </View>
            <Text style={styles.confidenceText}>Confidence: {result.confidenceScore}%</Text>
          </View>

          {/* Hero Uptake Gauge */}
          <View style={styles.heroMetricBox}>
            <Text style={styles.metricSuper}>PREDICTED CELLULAR UPTAKE</Text>
            <Text style={styles.metricHero}>{result.predictedUptake}%</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(100, result.predictedUptake)}%`,
                    backgroundColor: result.predictedUptake > 70 ? COLORS.success : (result.predictedUptake > 40 ? COLORS.primary : COLORS.warning)
                  }
                ]} 
              />
            </View>
          </View>

          {/* 3 Metric Grid */}
          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricSmallVal}>{result.predictedToxicity}%</Text>
              <Text style={styles.metricSmallLabel}>Cytotoxicity Index</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricSmallVal, { color: COLORS.primary }]}>{result.deliveryScore}</Text>
              <Text style={styles.metricSmallLabel}>Delivery Score</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricSmallVal, { color: COLORS.secondary }]}>96.8%</Text>
              <Text style={styles.metricSmallLabel}>Model R² Fit</Text>
            </View>
          </View>

          {/* Primary Mechanism */}
          <View style={styles.mechanismBox}>
            <View style={styles.mechHeader}>
              <Ionicons name="git-branch" size={16} color={COLORS.primary} />
              <Text style={styles.mechTitle}>Primary Internalisation Pathway</Text>
            </View>
            <Text style={styles.mechBadge}>{result.mechanism}</Text>
          </View>

          {/* Kinetic Curve Visualization */}
          <UptakeCurveChart 
            curvePoints={result.curvePoints} 
            currentSize={parseFloat(sizeNm) || 45} 
          />

          {/* Scientific Recommendation Box */}
          <View style={styles.recBox}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.info} />
            <Text style={styles.recText}>{result.recommendation}</Text>
          </View>

          {/* Quick Result Action Buttons */}
          <View style={styles.resultActionsRow}>
            <TouchableOpacity 
              style={[styles.saveLibBtn, savedToLib && styles.saveLibBtnDone]}
              onPress={handleSaveToLibrary}
              disabled={savedToLib}
            >
              <Ionicons name={savedToLib ? "checkmark-done" : "bookmark"} size={16} color="#000" />
              <Text style={styles.saveLibText}>{savedToLib ? 'Saved to Datasets' : 'Save to Datasets'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.askBotBtn}
              onPress={() => onNavigate && onNavigate('chatbot')}
            >
              <Ionicons name="sparkles" size={16} color={COLORS.primary} />
              <Text style={styles.askBotText}>Ask NanoBot</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  highlight: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optimalBadge: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  stepBtn: {
    backgroundColor: COLORS.surfaceLight,
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  chipsScroll: {
    marginTop: 4,
    marginBottom: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 6,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  chipActiveCell: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  chipTextActiveCell: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 18,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  runButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  resultBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  livePillText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  heroMetricBox: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    marginBottom: 14,
  },
  metricSuper: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  metricHero: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.text,
    marginVertical: 4,
  },
  progressBar: {
    width: '85%',
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricItem: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  metricSmallVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  metricSmallLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  mechanismBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  mechHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  mechTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  mechBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  recBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  recText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  resultActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  saveLibBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  saveLibBtnDone: {
    backgroundColor: COLORS.success,
  },
  saveLibText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  askBotBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  askBotText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
