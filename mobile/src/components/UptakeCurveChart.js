import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function UptakeCurveChart({ curvePoints = [], currentSize = 45 }) {
  if (!curvePoints || curvePoints.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Biophysical Uptake vs Diameter Curve</Text>
        <Text style={styles.optimalBadge}>Peak: 40-50nm</Text>
      </View>
      <Text style={styles.subtext}>
        Gaussian endocytosis model • Current selection: <Text style={styles.boldText}>{currentSize} nm</Text>
      </Text>

      {/* Chart visualization */}
      <View style={styles.chartArea}>
        {curvePoints.map((pt, idx) => {
          const heightPercent = Math.max(8, Math.min(100, pt.uptake));
          const isSelected = Math.abs(pt.size - currentSize) < 3.5;
          const isPeak = pt.size >= 40 && pt.size <= 50;

          return (
            <View key={idx} style={styles.barCol}>
              {isSelected ? (
                <View style={styles.markerContainer}>
                  <Text style={styles.markerText}>{pt.uptake}%</Text>
                </View>
              ) : null}

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPercent}%` },
                    isPeak ? styles.barPeak : null,
                    isSelected ? styles.barActive : null,
                  ]}
                />
              </View>

              {idx % 4 === 0 || isSelected ? (
                <Text style={[styles.xLabel, isSelected ? styles.xLabelActive : null]}>
                  {pt.size}
                </Text>
              ) : (
                <View style={styles.xSpacer} />
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Active ({currentSize}nm)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendText}>Optimal Endocytosis Window (40-50nm)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  optimalBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  boldText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  chartArea: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  barCol: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 1,
  },
  barTrack: {
    width: '100%',
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(99, 102, 241, 0.4)',
  },
  barPeak: {
    backgroundColor: 'rgba(16, 185, 129, 0.6)',
  },
  barActive: {
    backgroundColor: COLORS.primary,
    width: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  markerContainer: {
    position: 'absolute',
    top: 2,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  markerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
  },
  xLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  xLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  xSpacer: {
    height: 17,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
});
