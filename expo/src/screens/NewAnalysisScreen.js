import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CORE_MATERIALS, NANOPARTICLE_TYPES, CELL_LINES } from '../constants/options';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import api from '../services/api';

export default function NewAnalysisScreen({ navigation }) {
  const [analysisName, setAnalysisName] = useState('Uptake Simulation Run');
  const [material, setMaterial] = useState(CORE_MATERIALS[0]);
  const [shape, setShape] = useState(NANOPARTICLE_TYPES[0]);
  const [sizeNm, setSizeNm] = useState('45');
  const [chargeMv, setChargeMv] = useState('20');
  const [cellType, setCellType] = useState(CELL_LINES[0]);
  const [exposureTime, setExposureTime] = useState('6.0');
  const [concentration, setConcentration] = useState('50');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunAnalysis = async () => {
    setError('');
    const size = parseFloat(sizeNm);
    const charge = parseFloat(chargeMv);
    const expTime = parseFloat(exposureTime);
    const conc = parseFloat(concentration);

    if (isNaN(size) || size <= 0 || size > 1000) {
      setError('Please enter a valid Particle Size (1 to 1000 nm).');
      return;
    }

    if (isNaN(charge) || charge < -150 || charge > 150) {
      setError('Please enter a valid Surface Charge (-150 to +150 mV).');
      return;
    }

    if (isNaN(expTime) || expTime <= 0 || expTime > 168) {
      setError('Please enter a valid Exposure Time (0.1 to 168 hours).');
      return;
    }

    if (isNaN(conc) || conc <= 0 || conc > 5000) {
      setError('Please enter a valid Concentration (1 to 5000 μg/mL).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        analysis_name: analysisName.trim() || 'Uptake Simulation Run',
        core_material: material,
        nanoparticle_type: shape,
        nanoparticle_size: size,
        surface_charge_mv: charge,
        cell_type: cellType,
        exposure_time_h: expTime,
        concentration_ug_ml: conc,
      };

      const res = await api.runAnalysis(payload);
      setLoading(false);

      if (res.status === 'success' || res.id || res.uptake_percentage) {
        navigation.navigate('Results', { result: res, freshRun: true });
      } else {
        setError(res.message || 'Simulation execution failed.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Error communicating with simulation backend API.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="New Biophysical Analysis" subtitle="Run Nanoparticle Uptake Simulation" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.rose} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Section 1: Run Name */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>1. Simulation Identifier</Text>
            <CustomInput
              label="Analysis Title"
              placeholder="e.g. AuNP HeLa Uptake Run 1"
              icon="bookmark-outline"
              value={analysisName}
              onChangeText={setAnalysisName}
            />
          </View>

          {/* Form Section 2: Nanoparticle Specifications */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>2. Nanoparticle Properties</Text>

            {/* Core Material Selector */}
            <Text style={styles.selectorLabel}>Core Material *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {CORE_MATERIALS.map((mat) => (
                <TouchableOpacity
                  key={mat}
                  style={[styles.chip, material === mat && styles.chipActive]}
                  onPress={() => setMaterial(mat)}
                >
                  <Text style={[styles.chipText, material === mat && styles.chipTextActive]}>{mat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Nanoparticle Shape/Type Selector */}
            <Text style={styles.selectorLabel}>Nanoparticle Type / Shape *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {NANOPARTICLE_TYPES.map((tp) => (
                <TouchableOpacity
                  key={tp}
                  style={[styles.chip, shape === tp && styles.chipActive]}
                  onPress={() => setShape(tp)}
                >
                  <Text style={[styles.chipText, shape === tp && styles.chipTextActive]}>{tp}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <CustomInput
                label="Particle Size (nm)"
                placeholder="45"
                icon="resize-outline"
                value={sizeNm}
                onChangeText={setSizeNm}
                keyboardType="numeric"
                containerStyle={{ flex: 1 }}
                required
              />
              <View style={{ width: 12 }} />
              <CustomInput
                label="Surface Charge (mV)"
                placeholder="20"
                icon="flash-outline"
                value={chargeMv}
                onChangeText={setChargeMv}
                keyboardType="numeric"
                containerStyle={{ flex: 1 }}
                required
              />
            </View>
          </View>

          {/* Form Section 3: Cellular & Experimental Environment */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>3. Experimental Conditions</Text>

            <Text style={styles.selectorLabel}>Target Cell Line *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {CELL_LINES.map((cl) => (
                <TouchableOpacity
                  key={cl}
                  style={[styles.chip, cellType === cl && styles.chipActive]}
                  onPress={() => setCellType(cl)}
                >
                  <Text style={[styles.chipText, cellType === cl && styles.chipTextActive]}>{cl}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <CustomInput
                label="Exposure Time (hours)"
                placeholder="6.0"
                icon="time-outline"
                value={exposureTime}
                onChangeText={setExposureTime}
                keyboardType="numeric"
                containerStyle={{ flex: 1 }}
                required
              />
              <View style={{ width: 12 }} />
              <CustomInput
                label="Concentration (μg/mL)"
                placeholder="50"
                icon="flask-outline"
                value={concentration}
                onChangeText={setConcentration}
                keyboardType="numeric"
                containerStyle={{ flex: 1 }}
                required
              />
            </View>
          </View>

          {/* Submit Button */}
          <CustomButton
            title={loading ? 'Running Analysis...' : 'Run Analysis'}
            onPress={handleRunAnalysis}
            loading={loading}
            icon="play-circle-outline"
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.cyan,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.cyanGlow,
    borderColor: COLORS.cyan,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: COLORS.cyan,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
  },
  submitBtn: {
    height: 52,
    marginTop: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.roseGlow,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.rose,
    flex: 1,
  },
});
