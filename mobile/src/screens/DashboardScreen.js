import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { getPlatformStats, subscribeToStore, getSimulationHistory } from '../services/storage';
import UptakeCurveChart from '../components/UptakeCurveChart';
import { runBiophysicalSimulation } from '../services/biomodel';

export default function DashboardScreen({ onNavigate }) {
  const [stats, setStats] = useState(getPlatformStats());
  const [history, setHistory] = useState(getSimulationHistory());

  // Subscribe to storage changes
  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setStats(getPlatformStats());
      setHistory(getSimulationHistory());
    });
    return unsub;
  }, []);

  // Kinetic reference curve for 45nm standard gold
  const sampleSim = runBiophysicalSimulation({
    material: 'Gold (Au)',
    size_nm: 45,
    charge_mv: 18,
    cell_type: 'HeLa'
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.badgeRow}>
          <View style={styles.pillBadge}>
            <Ionicons name="flash" size={12} color={COLORS.primary} />
            <Text style={styles.pillText}>Biophysical Engine 2.0</Text>
          </View>
          <Text style={styles.accuracyTag}>Accuracy: {stats.model_accuracy}</Text>
        </View>

        <Text style={styles.heroTitle}>Biophysical Nanoparticle Simulation</Text>
        <Text style={styles.heroDesc}>
          Simulate size-dependent membrane endocytosis, evaluate surface zeta electrostatics, and predict cellular uptake kinetics deterministically on-device.
        </Text>

        <TouchableOpacity 
          style={styles.launchBtn}
          onPress={() => onNavigate && onNavigate('predict')}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={16} color="#000" />
          <Text style={styles.launchBtnText}>Start New AI Simulation</Text>
        </TouchableOpacity>
      </View>

      {/* 4 Interactive Stat Cards */}
      <View style={styles.statsGrid}>
        <TouchableOpacity 
          style={styles.statCard} 
          onPress={() => onNavigate && onNavigate('datasets')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Ionicons name="server-outline" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{stats.dataset_count}</Text>
          <Text style={styles.statLabel}>Formulation Datasets</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard} 
          onPress={() => onNavigate && onNavigate('history')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="hardware-chip-outline" size={18} color={COLORS.secondary} />
          </View>
          <Text style={styles.statValue}>{stats.prediction_count}</Text>
          <Text style={styles.statLabel}>Simulations Saved</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard} 
          onPress={() => onNavigate && onNavigate('experiments')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="flask-outline" size={18} color={COLORS.success} />
          </View>
          <Text style={styles.statValue}>{stats.experiment_count}</Text>
          <Text style={styles.statLabel}>Lab Protocols</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard} 
          onPress={() => onNavigate && onNavigate('analytics')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="stats-chart-outline" size={18} color={COLORS.warning} />
          </View>
          <Text style={[styles.statValue, { fontSize: 16 }]}>{stats.optimal_size_nm}</Text>
          <Text style={styles.statLabel}>Optimal Peak</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Launch Suite */}
      <View style={styles.suiteRow}>
        <TouchableOpacity 
          style={styles.suiteCard}
          onPress={() => onNavigate && onNavigate('analytics')}
          activeOpacity={0.7}
        >
          <View style={[styles.suiteIcon, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Ionicons name="stats-chart" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.suiteTitle}>Analytics</Text>
          <Text style={styles.suiteSub}>4 Visual Charts</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.suiteCard}
          onPress={() => onNavigate && onNavigate('chatbot')}
          activeOpacity={0.7}
        >
          <View style={[styles.suiteIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="sparkles" size={18} color={COLORS.success} />
          </View>
          <Text style={styles.suiteTitle}>NanoBot AI</Text>
          <Text style={styles.suiteSub}>Instant Offline Assistant</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.suiteCard}
          onPress={() => onNavigate && onNavigate('experiments')}
          activeOpacity={0.7}
        >
          <View style={[styles.suiteIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="flask" size={18} color={COLORS.secondary} />
          </View>
          <Text style={styles.suiteTitle}>Protocols</Text>
          <Text style={styles.suiteSub}>Lifecycles</Text>
        </TouchableOpacity>
      </View>

      {/* Kinetic Reference Chart */}
      <UptakeCurveChart curvePoints={sampleSim.curvePoints} currentSize={45} />

      {/* Recent Simulation History */}
      {history.length > 0 && (
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionHeader}>Recent Simulations</Text>
            <TouchableOpacity onPress={() => onNavigate && onNavigate('history')}>
              <Text style={styles.viewAllText}>View All History</Text>
            </TouchableOpacity>
          </View>

          {history.slice(0, 3).map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.historyItem}
              onPress={() => onNavigate && onNavigate('history')}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>{item.inputs?.name || 'Simulation'}</Text>
                <Text style={styles.historySub}>
                  {item.inputs?.material} • {item.inputs?.size_nm}nm • {item.inputs?.cell_type}
                </Text>
              </View>
              <View style={styles.historyBadge}>
                <Text style={styles.historyUptake}>{item.predictedUptake}%</Text>
                <Text style={styles.historyLabel}>Uptake</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Internalisation Mechanism Guide */}
      <View style={styles.guideCard}>
        <Text style={styles.sectionHeader}>Internalisation Mechanisms</Text>
        
        <View style={styles.mechanismItem}>
          <View style={[styles.mechanismDot, { backgroundColor: '#38bdf8' }]} />
          <View style={styles.mechanismContent}>
            <Text style={styles.mechTitle}>Direct Membrane Translocation</Text>
            <Text style={styles.mechDesc}>Size ≤ 25nm • Ultra-small particles bypass endosomes via passive lipid bilayer permeation.</Text>
          </View>
        </View>

        <View style={styles.mechanismItem}>
          <View style={[styles.mechanismDot, { backgroundColor: '#10b981' }]} />
          <View style={styles.mechanismContent}>
            <Text style={styles.mechTitle}>Clathrin-Mediated Endocytosis</Text>
            <Text style={styles.mechDesc}>Size 25 – 80nm • Optimal peak thermodynamic uptake regime with highest efficiency.</Text>
          </View>
        </View>

        <View style={styles.mechanismItem}>
          <View style={[styles.mechanismDot, { backgroundColor: '#fbbf24' }]} />
          <View style={styles.mechanismContent}>
            <Text style={styles.mechTitle}>Caveolae-Mediated Endocytosis</Text>
            <Text style={styles.mechDesc}>Size 80 – 150nm • Avoids lysosomal degradation, preferred for stealth polymeric vectors.</Text>
          </View>
        </View>

        <View style={styles.mechanismItem}>
          <View style={[styles.mechanismDot, { backgroundColor: '#ef4444' }]} />
          <View style={styles.mechanismContent}>
            <Text style={styles.mechTitle}>Macropinocytosis & Phagocytosis</Text>
            <Text style={styles.mechDesc}>Size &gt; 150nm • High uptake by macrophages, lower specific targeting in non-immune cells.</Text>
          </View>
        </View>
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
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  accuracyTag: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 18,
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  launchBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  suiteRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  suiteCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
  },
  suiteIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  suiteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  suiteSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginTop: 16,
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  historySub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyBadge: {
    alignItems: 'flex-end',
  },
  historyUptake: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  historyLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  guideCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  mechanismItem: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  mechanismDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  mechanismContent: {
    flex: 1,
  },
  mechTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  mechDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});
