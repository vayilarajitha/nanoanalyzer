import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';

const screenWidth = Dimensions.get('window').width - 32;

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    total_predictions: 0,
    total_datasets: 0,
    total_experiments: 0,
    avg_uptake: null,
  });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [chartData, setChartData] = useState({
    uptake_vs_size: [],
    material_distribution: [],
  });

  const fetchDashboardData = async () => {
    try {
      const res = await api.getDashboard();
      if (res.status === 'success') {
        setMetrics(res.metrics || {});
        setRecentPredictions(res.recent_predictions || []);
        setChartData(res.charts || { uptake_vs_size: [], material_distribution: [] });
      }
    } catch (e) {
      // Fallback empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  // Format Mean Uptake Rate strictly: if null or undefined -> '—'
  const meanUptakeText = (metrics.avg_uptake !== null && metrics.avg_uptake !== undefined && metrics.avg_uptake !== '')
    ? `${metrics.avg_uptake}%`
    : '—';

  // Prepare Line Chart Data
  const sizeData = chartData.uptake_vs_size || [];
  const hasLineChartData = sizeData.length > 0;
  const lineChartLabels = hasLineChartData ? sizeData.map(d => `${d.size_nm}nm`) : ['0nm'];
  const lineChartValues = hasLineChartData ? sizeData.map(d => d.uptake) : [0];

  // Prepare Material Distribution Pie Data
  const matData = chartData.material_distribution || [];
  const hasPieChartData = matData.length > 0;
  const pieColors = [COLORS.cyan, COLORS.primary, COLORS.purple, COLORS.emerald, COLORS.amber, COLORS.rose];
  const pieChartFormatted = hasPieChartData
    ? matData.map((item, index) => ({
        name: item.material,
        population: item.count,
        color: pieColors[index % pieColors.length],
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 11,
      }))
    : [];

  return (
    <View style={styles.container}>
      <Header
        title="Research Dashboard"
        subtitle="Biophysical Simulation Summary"
        rightIcon="chatbubbles"
        onRightPress={() => navigation.navigate('AIAssistant')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />}
      >
        {/* Quick Action Buttons */}
        <TouchableOpacity
          style={styles.actionBanner}
          onPress={() => navigation.navigate('New Analysis')}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconBox}>
            <Ionicons name="hardware-chip" size={24} color={COLORS.background} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Run New Simulation</Text>
            <Text style={styles.actionSubtitle}>Predict uptake %, cytotoxicity & delivery score</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.cyan} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBanner, { borderColor: COLORS.border, marginBottom: 20 }]}
          onPress={() => navigation.navigate('DatasetManager')}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBox, { backgroundColor: COLORS.cyanGlow, borderColor: COLORS.borderCyan, borderWidth: 1 }]}>
            <Ionicons name="server-outline" size={22} color={COLORS.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Dataset Manager</Text>
            <Text style={styles.actionSubtitle}>Upload and manage experimental CSV datasets</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.cyan} />
        </TouchableOpacity>

        {/* 4 Stat Cards */}
        <Text style={styles.sectionHeader}>Summary Metrics</Text>
        {loading ? (
          <View style={styles.gridRow}>
            <LoadingSkeleton height={90} width="48%" borderRadius={16} />
            <LoadingSkeleton height={90} width="48%" borderRadius={16} />
          </View>
        ) : (
          <View style={styles.gridRow}>
            <StatCard
              title="Simulations Run"
              value={metrics.total_predictions ?? 0}
              icon="hardware-chip-outline"
              color="primary"
            />
            <StatCard
              title="Active Datasets"
              value={metrics.total_datasets ?? 0}
              icon="server-outline"
              color="cyan"
            />
          </View>
        )}

        {loading ? (
          <View style={styles.gridRow}>
            <LoadingSkeleton height={90} width="48%" borderRadius={16} />
            <LoadingSkeleton height={90} width="48%" borderRadius={16} />
          </View>
        ) : (
          <View style={styles.gridRow}>
            <StatCard
              title="Mean Uptake Rate"
              value={meanUptakeText}
              icon="pulse-outline"
              color="emerald"
            />
            <StatCard
              title="Experiments"
              value={metrics.total_experiments ?? 0}
              icon="flask-outline"
              color="amber"
            />
          </View>
        )}

        {/* Chart 1: Cellular Uptake vs Particle Size */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="analytics-outline" size={18} color={COLORS.cyan} />
            <Text style={styles.chartTitle}>Cellular Uptake vs Particle Size</Text>
          </View>

          {loading ? (
            <LoadingSkeleton height={180} borderRadius={12} />
          ) : hasLineChartData ? (
            <LineChart
              data={{
                labels: lineChartLabels,
                datasets: [{ data: lineChartValues }],
              }}
              width={screenWidth - 32}
              height={190}
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                style: { borderRadius: 12 },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: COLORS.cyan,
                },
              }}
              bezier
              style={styles.chartCanvas}
            />
          ) : (
            <View style={styles.emptyChartBox}>
              <Ionicons name="stats-chart-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyChartText}>No analysis data available</Text>
            </View>
          )}
        </View>

        {/* Chart 2: Core Material Share */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="pie-chart-outline" size={18} color={COLORS.emerald} />
            <Text style={styles.chartTitle}>Core Material Share</Text>
          </View>

          {loading ? (
            <LoadingSkeleton height={160} borderRadius={12} />
          ) : hasPieChartData ? (
            <PieChart
              data={pieChartFormatted}
              width={screenWidth - 32}
              height={170}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="12"
              absolute
            />
          ) : (
            <View style={styles.emptyChartBox}>
              <Ionicons name="pie-chart-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyChartText}>No data available</Text>
            </View>
          )}
        </View>

        {/* Recent Simulation History */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Simulations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentPredictions.length > 0 ? (
            recentPredictions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                onPress={() => navigation.navigate('Results', { result: item })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.analysis_name || 'Uptake Run'}</Text>
                  <Text style={styles.itemSub}>
                    {item.core_material} • {item.size_nm}nm • {item.cell_type}
                  </Text>
                </View>
                <View style={styles.uptakeBadge}>
                  <Text style={styles.uptakeValue}>{item.predicted_uptake_percent}%</Text>
                  <Text style={styles.uptakeLabel}>Uptake</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noHistoryText}>No recent simulation history found.</Text>
          )}
        </View>
      </ScrollView>

      {/* Floating AI Chatbot FAB */}
      <TouchableOpacity
        style={styles.fabChatbot}
        onPress={() => navigation.navigate('AIAssistant')}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubbles" size={24} color={COLORS.background} />
        <Text style={styles.fabText}>AI Bot</Text>
      </TouchableOpacity>
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
    paddingBottom: 30,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderCyan,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chartCanvas: {
    borderRadius: 12,
    marginVertical: 4,
  },
  emptyChartBox: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 13,
    color: COLORS.cyan,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  itemSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  uptakeBadge: {
    alignItems: 'flex-end',
    backgroundColor: COLORS.emeraldGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  uptakeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.emerald,
  },
  uptakeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  noHistoryText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  fabChatbot: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 6,
    elevation: 6,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  fabText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
