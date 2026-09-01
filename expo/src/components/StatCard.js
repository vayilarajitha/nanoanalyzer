import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function StatCard({ title, value, icon, color = 'cyan', subtext }) {
  const getColor = () => {
    switch (color) {
      case 'primary': return COLORS.primary;
      case 'emerald': return COLORS.emerald;
      case 'amber': return COLORS.amber;
      case 'rose': return COLORS.rose;
      case 'cyan':
      default: return COLORS.cyan;
    }
  };

  const activeColor = getColor();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: activeColor + '20' }]}>
          <Ionicons name={icon} size={20} color={activeColor} />
        </View>
        {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
      </View>
      <Text style={[styles.valueText, { color: value === '—' ? COLORS.textMuted : COLORS.text }]}>
        {value ?? '—'}
      </Text>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: 140,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtext: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  valueText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
