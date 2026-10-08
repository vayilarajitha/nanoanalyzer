import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';

const screenWidth = Dimensions.get('window').width - 32;

export default function VisualizationScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    uptake_vs_size: [],
    material_distribution: [],
    toxicity_by_material: [],
    cell_line_uptake: [],
  });

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      if (res && res.status === 'success') {
        setData({
          uptake_vs_size: res.uptake_vs_size || [],
          material_distribution: res.material_distribution || [],
          toxicity_by_material: res.toxicity_by_material || [],
          cell_line_uptake: res.cell_line_uptake || [],
        });
      } else {
        // Fallback to getDashboard
        const dash = await api.getDashboard();
        if (dash && dash.status === 'success') {
          setData({
            uptake_vs_size: dash.charts?.uptake_vs_size || [],
            material_distribution: dash.charts?.material_distribution || [],
            toxicity_by_material: [],
            cell_line_uptake: [],
          });
        }
      }
    } catch (e) {
      // Keep existing data or empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, []);

  // 1. Uptake vs Size Data
  const sizeData = data.uptake_vs_size || [];
  const hasLineData = sizeData.length > 0;
  const lineLabels = hasLineData ? sizeData.map(d => `${d.size_nm}nm`) : ['0nm'];
  const lineValues = hasLineData ? sizeData.map(d => d.uptake) : [0];

  // 2. Material Distribution Data
  const matData = data.material_distribution || [];
  const hasPieData = matData.length > 0;
  const pieColors = [COLORS.cyan, COLORS.primary, COLORS.purple, COLORS.emerald, COLORS.amber, COLORS.rose];
  const pieChartFormatted = hasPieData
    ? matData.map((item, index) => ({
        name: item.material,
        population: item.count,
        color: pieColors[index % pieColors.length],
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 11,
      }))
    : [];

  // 3. Toxicity by Material Data
  const toxData = data.toxicity_by_material || [];
  const hasToxData = toxData.length > 0;
  const toxLabels = hasToxData ? toxData.slice(0, 4).map(d => d.material.length > 8 ? d.material.slice(0, 7) + '..' : d.material) : ['None'];
  const toxValues = hasToxData ? toxData.slice(0, 4).map(d => Math.max(0, d.avg_toxicity)) : [0];

  // 4. Cell Line Uptake Data
  const cellData = data.cell_line_uptake || [];
  const hasCellData = cellData.length > 0;
  const cellLabels = hasCellData ? cellData.slice(0, 4).map(d => d.cell_line.length > 8 ? d.cell_line.slice(0, 7) + '..' : d.cell_line) : ['None'];
  const cellValues = hasCellData ? cellData.slice(0, 4).map(d => Math.max(0, d.avg_uptake)) : [0];

  const hasAnyData = hasLineData || hasPieData || hasToxData || hasCellData;

  return (
    <View style={styles.container}>
      <Header
        title="Visualizations"
        subtitle="Advanced Analytics & Biophysical Charts"
        rightIcon="refresh"
        onRightPress={onRefresh}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />}
      >
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconBox}>
            <Ionicons name="stats-chart" size={24} color={COLORS.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Advanced Analytics & Visualizations</Text>
            <Text style={styles.bannerSubtitle}>
              Real-time biophysical statistics driven directly by Supabase PostgreSQL database records.
            </Text>
          </View>
        </View>

        {/* 1. Cellular Uptake vs Size (nm) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={[styles.badgeIcon, { backgroundColor: COLORS.cyanGlow }]}>
              <Ionicons name="trending-up" size={16} color={COLORS.cyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chartTitle}>Cellular Uptake vs Size (nm)</Text>
              <Text style={styles.chartSub}>Endocytic efficiency curve across diameter</Text>
            </View>
          </View>

          {loading ? (
            <LoadingSkeleton height={190} borderRadius={12} />
          ) : hasLineData ? (
            <View>
              <LineChart
                data={{
                  labels: lineLabels,
                  datasets: [{ data: lineValues }],
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
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.cyan }]} />
                <Text style={styles.legendText}>Cellular Uptake Efficiency (%)</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="stats-chart-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No uptake vs size data available</Text>
            </View>
          )}
        </View>

        {/* 2. Core Material Composition */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={[styles.badgeIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="pie-chart" size={16} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chartTitle}>Core Material Composition</Text>
              <Text style={styles.chartSub}>Distribution of synthesized nanoparticles</Text>
            </View>
          </View>

          {loading ? (
            <LoadingSkeleton height={180} borderRadius={12} />
          ) : hasPieData ? (
            <PieChart
              data={pieChartFormatted}
              width={screenWidth - 32}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="pie-chart-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No material composition data available</Text>
            </View>
          )}
        </View>

        {/* 3. Mean Cytotoxicity Index by Material */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={[styles.badgeIcon, { backgroundColor: COLORS.roseGlow }]}>
              <Ionicons name="bar-chart" size={16} color={COLORS.rose} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chartTitle}>Mean Cytotoxicity Index by Material</Text>
              <Text style={styles.chartSub}>Predicted biophysical toxicity score (0-100)</Text>
            </View>
          </View>

          {loading ? (
            <LoadingSkeleton height={190} borderRadius={12} />
          ) : hasToxData ? (
            <View>
              <BarChart
                data={{
                  labels: toxLabels,
                  datasets: [{ data: toxValues }],
                }}
                width={screenWidth - 32}
                height={190}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                chartConfig={{
                  backgroundColor: COLORS.surface,
                  backgroundGradientFrom: COLORS.surface,
                  backgroundGradientTo: COLORS.surface,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(244, 63, 94, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                  barPercentage: 0.6,
                }}
                style={styles.chartCanvas}
              />
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.rose }]} />
                <Text style={styles.legendText}>Cytotoxicity Index (0-100)</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="bar-chart-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No cytotoxicity data available</Text>
            </View>
          )}
        </View>

        {/* 4. Mean Internalisation by Cell Line */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={[styles.badgeIcon, { backgroundColor: COLORS.emeraldGlow }]}>
              <Ionicons name="pulse" size={16} color={COLORS.emerald} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chartTitle}>Mean Internalisation by Cell Line</Text>
              <Text style={styles.chartSub}>Cellular membrane penetration by cell culture</Text>
            </View>
          </View>

          {loading ? (
            <LoadingSkeleton height={190} borderRadius={12} />
          ) : hasCellData ? (
            <View>
              <BarChart
                data={{
                  labels: cellLabels,
                  datasets: [{ data: cellValues }],
                }}
                width={screenWidth - 32}
                height={190}
                yAxisLabel=""
                yAxisSuffix="%"
                fromZero
                chartConfig={{
                  backgroundColor: COLORS.surface,
                  backgroundGradientFrom: COLORS.surface,
                  backgroundGradientTo: COLORS.surface,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                  barPercentage: 0.6,
                }}
                style={styles.chartCanvas}
              />
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.emerald }]} />
                <Text style={styles.legendText}>Mean Internalisation Rate (%)</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="analytics-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No cell line internalisation data available</Text>
            </View>
          )}
        </View>

        {/* Bottom Action */}
        {!loading && !hasAnyData ? (
          <TouchableOpacity
            style={styles.newAnalysisBtn}
            onPress={() => navigation.navigate('New Analysis')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.background} style={{ marginRight: 8 }} />
            <Text style={styles.newAnalysisText}>Run New Simulation to Generate Charts</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
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
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderCyan,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.cyanGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
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
    marginBottom: 14,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chartSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  chartCanvas: {
    marginVertical: 4,
    borderRadius: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  newAnalysisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cyan,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  newAnalysisText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.background,
  },
});
