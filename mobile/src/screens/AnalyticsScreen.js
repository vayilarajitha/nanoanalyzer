import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { getAnalyticsData, subscribeToStore } from '../services/storage';
import UptakeCurveChart from '../components/UptakeCurveChart';
import { runBiophysicalSimulation } from '../services/biomodel';

export default function AnalyticsScreen({ onNavigate }) {
  const [data, setData] = useState(getAnalyticsData());

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setData(getAnalyticsData());
    });
    return unsub;
  }, []);

  // Standard reference curve
  const referenceSim = runBiophysicalSimulation({
    material: 'Gold (Au)',
    size_nm: 45,
    charge_mv: 18,
    cell_type: 'HeLa'
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Screen Title Banner */}
      <View style={styles.banner}>
        <View style={styles.badgeRow}>
          <View style={styles.liveDot} />
          <Text style={styles.badgeText}>Real-Time Local Data Aggregates</Text>
        </View>
        <Text style={styles.heading}>Advanced Analytics</Text>
        <Text style={styles.subheading}>
          Multi-parameter biophysical distributions computed natively on-device.
        </Text>
      </View>

      {/* 4 Summary KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Ionicons name="trending-up" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.kpiValue}>{data.avgUptake}%</Text>
          <Text style={styles.kpiLabel}>Mean Uptake</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Ionicons name="warning-outline" size={16} color={COLORS.danger} />
          </View>
          <Text style={[styles.kpiValue, { color: COLORS.danger }]}>{data.avgToxicity}%</Text>
          <Text style={styles.kpiLabel}>Mean Toxicity</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="flask-outline" size={16} color={COLORS.secondary} />
          </View>
          <Text style={styles.kpiValue}>{data.totalDatasets}</Text>
          <Text style={styles.kpiLabel}>Formulations</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="speedometer-outline" size={16} color={COLORS.success} />
          </View>
          <Text style={[styles.kpiValue, { color: COLORS.success }]}>45 nm</Text>
          <Text style={styles.kpiLabel}>Optimal Peak</Text>
        </View>
      </View>

      {/* Chart 1: Uptake vs Size Endocytosis Curve */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartIconWrap}>
            <Ionicons name="pulse" size={16} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chartTitle}>Cellular Uptake vs Size (nm)</Text>
            <Text style={styles.chartSub}>Endocytosis Gaussian Peak Model (µ=45nm, σ=18nm)</Text>
          </View>
        </View>

        <UptakeCurveChart curvePoints={referenceSim.curvePoints} currentSize={45} />
      </View>

      {/* Chart 2: Core Material Share */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={[styles.chartIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="pie-chart-outline" size={16} color={COLORS.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chartTitle}>Core Material Composition</Text>
            <Text style={styles.chartSub}>Share across library formulations & runs</Text>
          </View>
        </View>

        <View style={styles.distributionList}>
          {data.materialShare.map((item) => (
            <View key={item.name} style={styles.distRow}>
              <View style={styles.distNameCol}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <Text style={styles.distName} numberOfLines={1}>{item.name}</Text>
              </View>
              <View style={styles.distBarTrack}>
                <View 
                  style={[
                    styles.distBarFill, 
                    { width: `${Math.max(6, item.percent)}%`, backgroundColor: item.color }
                  ]} 
                />
              </View>
              <Text style={styles.distPercent}>{item.percent}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Chart 3: Mean Cytotoxicity Index by Material */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={[styles.chartIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Ionicons name="bar-chart-outline" size={16} color={COLORS.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chartTitle}>Mean Cytotoxicity by Material</Text>
            <Text style={styles.chartSub}>Relative membrane disruption index</Text>
          </View>
        </View>

        <View style={styles.distributionList}>
          {data.toxicityByMaterial.map((item) => (
            <View key={item.material} style={styles.distRow}>
              <View style={styles.distNameCol}>
                <Text style={styles.distName} numberOfLines={1}>{item.material}</Text>
              </View>
              <View style={styles.distBarTrack}>
                <View 
                  style={[
                    styles.distBarFill, 
                    { 
                      width: `${Math.min(100, Math.max(5, item.meanToxicity * 3))}%`, 
                      backgroundColor: item.meanToxicity > 15 ? COLORS.danger : (item.meanToxicity > 10 ? COLORS.warning : COLORS.success)
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.distPercent, { color: COLORS.danger }]}>{item.meanToxicity}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Chart 4: Internalisation by Target Cell Line */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={[styles.chartIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="git-network-outline" size={16} color={COLORS.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chartTitle}>Mean Internalisation by Cell Line</Text>
            <Text style={styles.chartSub}>Baseline endocytic receptor expression rates</Text>
          </View>
        </View>

        <View style={styles.distributionList}>
          {data.cellLineUptakeList.map((item) => (
            <View key={item.cellLine} style={styles.distRow}>
              <View style={styles.distNameCol}>
                <Text style={styles.distName} numberOfLines={1}>{item.cellLine}</Text>
              </View>
              <View style={styles.distBarTrack}>
                <View 
                  style={[
                    styles.distBarFill, 
                    { 
                      width: `${Math.min(100, Math.max(10, item.meanUptake))}%`, 
                      backgroundColor: COLORS.primary 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.distPercent, { color: COLORS.primary }]}>{item.meanUptake}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Jump Action */}
      <TouchableOpacity 
        style={styles.simCtaBtn}
        onPress={() => onNavigate && onNavigate('predict')}
        activeOpacity={0.85}
      >
        <Ionicons name="hardware-chip" size={18} color="#000" />
        <Text style={styles.simCtaText}>Run New Simulation</Text>
      </TouchableOpacity>
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
    paddingBottom: 110,
  },
  banner: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  kpiIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  chartIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  chartSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  distributionList: {
    gap: 12,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distNameCol: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  distName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  distBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  distPercent: {
    width: 38,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  simCtaBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  simCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
});

