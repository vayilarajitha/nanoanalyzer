import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ResultCard({ result }) {
  if (!result) return null;

  const predObj = result.prediction_result || {};
  const uptake = result.predicted_uptake_percent ?? result.uptake_percentage ?? predObj.uptake_percentage ?? '—';
  const toxicity = result.predicted_toxicity_index ?? predObj.predicted_toxicity_index ?? '—';
  const delivery = result.delivery_efficiency_score ?? predObj.delivery_efficiency_score ?? '—';
  const confidence = result.confidence_score ?? predObj.confidence_score ?? 96.5;
  const mechanism = result.primary_mechanism ?? predObj.primary_mechanism ?? 'Clathrin-Mediated Endocytosis';
  const recommendation = result.recommendations ?? result.optimization_recommendation ?? predObj.recommendation ?? 'N/A';

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{result.analysis_name || 'Uptake Simulation Run'}</Text>
          <Text style={styles.dateText}>{result.created_at_formatted || 'Recent Analysis'}</Text>
        </View>
        <View style={styles.confidenceBadge}>
          <Ionicons name="checkmark-seal-sharp" size={14} color={COLORS.cyan} />
          <Text style={styles.confidenceText}>{confidence}% Conf.</Text>
        </View>
      </View>

      {/* Main Highlights Grid */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricBox, { backgroundColor: COLORS.emeraldGlow, borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
          <Text style={styles.metricLabel}>Cellular Uptake</Text>
          <Text style={[styles.metricValue, { color: COLORS.emerald }]}>{uptake}%</Text>
        </View>

        <View style={[styles.metricBox, { backgroundColor: COLORS.roseGlow, borderColor: 'rgba(244, 63, 94, 0.3)' }]}>
          <Text style={styles.metricLabel}>Cytotoxicity Index</Text>
          <Text style={[styles.metricValue, { color: COLORS.rose }]}>{toxicity}</Text>
        </View>

        <View style={[styles.metricBox, { backgroundColor: COLORS.cyanGlow, borderColor: COLORS.borderCyan }]}>
          <Text style={styles.metricLabel}>Delivery Score</Text>
          <Text style={[styles.metricValue, { color: COLORS.cyan }]}>{delivery}</Text>
        </View>
      </View>

      {/* Pathway */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionLabel}>Primary Internalisation Pathway</Text>
        <View style={styles.pathwayBadge}>
          <Ionicons name="git-network-outline" size={16} color={COLORS.cyan} />
          <Text style={styles.pathwayText}>{mechanism}</Text>
        </View>
      </View>

      {/* Recommendation */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionLabel}>Optimization Recommendation</Text>
        <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>

      {/* Inputs Summary */}
      <View style={styles.inputsGrid}>
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>Material</Text>
          <Text style={styles.inputValue}>{result.core_material || 'N/A'}</Text>
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>Size</Text>
          <Text style={styles.inputValue}>{result.size_nm || 'N/A'} nm</Text>
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>Surface Charge</Text>
          <Text style={styles.inputValue}>{result.surface_charge_mv || 'N/A'} mV</Text>
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>Cell Line</Text>
          <Text style={styles.inputValue}>{result.cell_type || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cyanGlow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  confidenceText: {
    fontSize: 11,
    color: COLORS.cyan,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionBox: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pathwayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  pathwayText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  recommendationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    backgroundColor: COLORS.surfaceLight,
    padding: 10,
    borderRadius: 10,
  },
  inputsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  inputItem: {
    width: '50%',
    marginVertical: 4,
  },
  inputLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  inputValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
});
