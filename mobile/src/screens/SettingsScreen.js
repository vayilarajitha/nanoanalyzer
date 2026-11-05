import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { resetToDefaults, clearHistory } from '../services/storage';

export default function SettingsScreen() {
  const handleReset = () => {
    Alert.alert(
      'Reset Library',
      'Restore all default benchmark datasets and sample protocols?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetToDefaults();
            Alert.alert('Restored', 'Default formulation library loaded.');
          }
        }
      ]
    );
  };

  const handleClearSims = () => {
    Alert.alert(
      'Clear Simulation History',
      'Remove cached simulation runs from device storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Alert.alert('Cleared', 'Simulation history emptied.');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>App Configuration</Text>
      <Text style={styles.subheading}>Self-contained offline simulation runtime</Text>

      {/* Engine Architecture Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="hardware-chip-outline" size={18} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Biophysical Engine Specifications</Text>
        </View>

        <View style={styles.specRow}>
          <Text style={styles.specKey}>Simulation Engine</Text>
          <Text style={styles.specVal}>Deterministic Kinetic Model 2.0</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Kinetic Model</Text>
          <Text style={styles.specVal}>Gaussian Peak (µ=45nm, σ=18nm)</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Saturation Kinetics</Text>
          <Text style={styles.specVal}>Michaelis-Menten (Km=2.5h)</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Electrostatic Factor</Text>
          <Text style={styles.specVal}>Zeta Potential Scalar (120mV)</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Runtime Environment</Text>
          <Text style={styles.specVal}>Expo Go • Pure React Native</Text>
        </View>
      </View>

      {/* Standalone Status */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.success} />
          <Text style={styles.cardTitle}>Device Security & Privacy</Text>
        </View>
        <Text style={styles.infoText}>
          All biophysical calculations, datasets, and experiment protocols run 100% locally on your device. No data is transmitted to external servers or cloud APIs.
        </Text>
      </View>

      {/* Local Data Management */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="file-tray-full-outline" size={18} color={COLORS.warning} />
          <Text style={styles.cardTitle}>Local Data Management</Text>
        </View>

        <TouchableOpacity style={styles.btnSecondary} onPress={handleClearSims}>
          <Ionicons name="trash-bin-outline" size={16} color={COLORS.warning} />
          <Text style={[styles.btnText, { color: COLORS.warning }]}>Clear Simulation History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnSecondary, { marginTop: 10 }]} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
          <Text style={[styles.btnText, { color: COLORS.primary }]}>Restore Benchmark Formulations</Text>
        </TouchableOpacity>
      </View>

      {/* About Box */}
      <View style={styles.aboutBox}>
        <Text style={styles.aboutTitle}>NanoAnalyzer Mobile v2.0.0</Text>
        <Text style={styles.aboutText}>
          Nanoparticle Uptake & Drug Delivery Simulation Platform{'\n'}
          Engineered for high-throughput biophysical modeling on Expo Go.
        </Text>
      </View>
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
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  specKey: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  aboutBox: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 14,
  },
  aboutTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
