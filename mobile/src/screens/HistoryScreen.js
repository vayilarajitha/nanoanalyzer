import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { getSimulationHistory, deleteSimulation, subscribeToStore } from '../services/storage';

export default function HistoryScreen({ onNavigate }) {
  const [history, setHistory] = useState(getSimulationHistory());
  const [search, setSearch] = useState('');
  const [selectedSim, setSelectedSim] = useState(null);

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setHistory(getSimulationHistory());
    });
    return unsub;
  }, []);

  const handleDelete = (id, title) => {
    Alert.alert(
      'Remove Simulation',
      `Delete "${title}" from history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteSimulation(id);
            if (selectedSim?.id === id) {
              setSelectedSim(null);
            }
          }
        }
      ]
    );
  };

  const filtered = history.filter(item => {
    const q = search.toLowerCase();
    const name = (item.inputs?.name || '').toLowerCase();
    const mat = (item.inputs?.material || '').toLowerCase();
    const cell = (item.inputs?.cell_type || '').toLowerCase();
    return name.includes(q) || mat.includes(q) || cell.includes(q);
  });

  return (
    <View style={styles.container}>
      {/* Top Search & Actions */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search simulation runs..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity 
          style={styles.newSimBtn}
          onPress={() => onNavigate && onNavigate('predict')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* History List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing <Text style={styles.boldText}>{filtered.length}</Text> simulation records
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="time-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Simulations Found</Text>
            <Text style={styles.emptySub}>
              Run a biophysical simulation from the studio to track cellular uptake records.
            </Text>
            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => onNavigate && onNavigate('predict')}
            >
              <Text style={styles.startBtnText}>Launch Simulator</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((item) => {
            const inputs = item.inputs || {};
            const title = inputs.name || 'Simulation Run';
            const mat = inputs.material || 'Gold (Au)';
            const size = inputs.size_nm || 45;
            const charge = inputs.charge_mv || 0;
            const cell = inputs.cell_type || 'HeLa';
            const uptake = item.predictedUptake ?? 0;
            const tox = item.predictedToxicity ?? 0;
            const score = item.deliveryScore ?? 0;

            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card}
                onPress={() => setSelectedSim(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <View style={styles.tagRow}>
                      <View style={styles.matBadge}>
                        <Text style={styles.matText}>{mat}</Text>
                      </View>
                      <View style={styles.cellBadge}>
                        <Text style={styles.cellText}>{cell}</Text>
                      </View>
                      <Text style={styles.timeTag}>{item.timestamp || 'Recent'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDelete(item.id, title)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>

                {/* Specs Grid */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricVal}>{size} nm</Text>
                    <Text style={styles.metricLbl}>Diameter</Text>
                  </View>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricVal}>{charge} mV</Text>
                    <Text style={styles.metricLbl}>Charge</Text>
                  </View>
                  <View style={styles.metricCol}>
                    <Text style={[styles.metricVal, { color: COLORS.primary }]}>{uptake}%</Text>
                    <Text style={styles.metricLbl}>Uptake</Text>
                  </View>
                  <View style={styles.metricCol}>
                    <Text style={[styles.metricVal, { color: COLORS.danger }]}>{tox}%</Text>
                    <Text style={styles.metricLbl}>Toxicity</Text>
                  </View>
                </View>

                {/* Pathway Footer */}
                <View style={styles.cardFooter}>
                  <Ionicons name="git-network-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.footerText} numberOfLines={1}>
                    {item.mechanism || 'Clathrin-Mediated Endocytosis'}
                  </Text>
                  <View style={styles.scorePill}>
                    <Text style={styles.scoreText}>Score: {score}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Full Analysis Detail Modal (matching results.php) */}
      <Modal
        visible={!!selectedSim}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedSim(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSim && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.modalIdBadge}>ID: #{selectedSim.id}</Text>
                      <Text style={styles.confBadge}>
                        Confidence: {selectedSim.confidenceScore || 96.8}%
                      </Text>
                    </View>
                    <Text style={styles.modalTitle}>
                      {selectedSim.inputs?.name || 'Simulation Results'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedSim(null)}>
                    <Ionicons name="close-circle" size={24} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Hero Uptake Gauge */}
                <View style={styles.heroGauge}>
                  <Text style={styles.gaugeLabel}>PREDICTED CELLULAR UPTAKE</Text>
                  <Text style={styles.gaugeVal}>{selectedSim.predictedUptake}%</Text>
                  <View style={styles.gaugeBarTrack}>
                    <View 
                      style={[
                        styles.gaugeBarFill, 
                        { 
                          width: `${Math.min(100, selectedSim.predictedUptake)}%`,
                          backgroundColor: selectedSim.predictedUptake > 70 ? COLORS.success : COLORS.primary
                        }
                      ]} 
                    />
                  </View>
                </View>

                {/* 3 Metric Summary */}
                <View style={styles.modalMetrics}>
                  <View style={styles.modalMetricBox}>
                    <Text style={[styles.mVal, { color: COLORS.danger }]}>{selectedSim.predictedToxicity}%</Text>
                    <Text style={styles.mLbl}>Cytotoxicity</Text>
                  </View>
                  <View style={styles.modalMetricBox}>
                    <Text style={[styles.mVal, { color: COLORS.primary }]}>{selectedSim.deliveryScore}</Text>
                    <Text style={styles.mLbl}>Delivery Score</Text>
                  </View>
                  <View style={styles.modalMetricBox}>
                    <Text style={[styles.mVal, { color: COLORS.success }]}>{selectedSim.confidenceScore || 96.8}%</Text>
                    <Text style={styles.mLbl}>Model Fit</Text>
                  </View>
                </View>

                {/* Mechanism Box */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Cellular Entry Pathway</Text>
                  <Text style={styles.sectionBody}>{selectedSim.mechanism}</Text>
                </View>

                {/* Recommendation Box */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Therapeutic Recommendation</Text>
                  <Text style={styles.sectionBody}>
                    {selectedSim.recommendation || `Formulation with ${selectedSim.inputs?.size_nm}nm core and ${selectedSim.inputs?.material} maintains optimal endocytic internalisation affinity.`}
                  </Text>
                </View>

                {/* Parameters List */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Simulation Parameters</Text>
                  <View style={styles.paramRow}>
                    <Text style={styles.paramKey}>Core Material</Text>
                    <Text style={styles.paramVal}>{selectedSim.inputs?.material}</Text>
                  </View>
                  <View style={styles.paramRow}>
                    <Text style={styles.paramKey}>Hydrodynamic Size</Text>
                    <Text style={styles.paramVal}>{selectedSim.inputs?.size_nm} nm</Text>
                  </View>
                  <View style={styles.paramRow}>
                    <Text style={styles.paramKey}>Zeta Potential</Text>
                    <Text style={styles.paramVal}>{selectedSim.inputs?.charge_mv} mV</Text>
                  </View>
                  <View style={styles.paramRow}>
                    <Text style={styles.paramKey}>Target Cell Line</Text>
                    <Text style={styles.paramVal}>{selectedSim.inputs?.cell_type}</Text>
                  </View>
                  <View style={styles.paramRow}>
                    <Text style={styles.paramKey}>Incubation Time</Text>
                    <Text style={styles.paramVal}>{selectedSim.inputs?.exposure_time} Hours</Text>
                  </View>
                  <View style={styles.paramRow}>
                    <Text style={styles.paramKey}>Concentration Dose</Text>
                    <Text style={styles.paramVal}>{selectedSim.inputs?.concentration} µg/mL</Text>
                  </View>
                </View>

                {/* Modal Close Button */}
                <TouchableOpacity 
                  style={styles.closeBtn} 
                  onPress={() => setSelectedSim(null)}
                >
                  <Text style={styles.closeBtnText}>Close Analysis</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    gap: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
  },
  newSimBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  countRow: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  boldText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  matBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  matText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cellBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cellText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  timeTag: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  metricLbl: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  scorePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  modalIdBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  heroGauge: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  gaugeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  gaugeVal: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    marginVertical: 4,
  },
  gaugeBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalMetrics: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modalMetricBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  mVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  mLbl: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionBox: {
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sectionBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  paramKey: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  paramVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
});

