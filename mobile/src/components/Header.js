import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function Header({ subtitle, activeTab, onNavigate }) {
  const isSubScreen = ['experiments', 'history', 'settings'].includes(activeTab);

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {isSubScreen ? (
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => onNavigate && onNavigate('dashboard')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
            <Text style={styles.backBtnText}>Dashboard</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="git-network-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.brandTitle}>
              Nano<Text style={styles.brandAccent}>Analyzer</Text>
            </Text>
          </View>
        )}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.actionsRow}>
        {/* Quick Protocols Icon */}
        <TouchableOpacity
          style={[styles.iconActionBtn, activeTab === 'experiments' && styles.iconActionBtnActive]}
          onPress={() => onNavigate && onNavigate('experiments')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'experiments' ? "flask" : "flask-outline"} 
            size={18} 
            color={activeTab === 'experiments' ? COLORS.primary : COLORS.textSecondary} 
          />
        </TouchableOpacity>

        {/* Quick History Icon */}
        <TouchableOpacity
          style={[styles.iconActionBtn, activeTab === 'history' && styles.iconActionBtnActive]}
          onPress={() => onNavigate && onNavigate('history')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'history' ? "time" : "time-outline"} 
            size={18} 
            color={activeTab === 'history' ? COLORS.primary : COLORS.textSecondary} 
          />
        </TouchableOpacity>

        {/* Quick Settings Icon */}
        <TouchableOpacity
          style={[styles.iconActionBtn, activeTab === 'settings' && styles.iconActionBtnActive]}
          onPress={() => onNavigate && onNavigate('settings')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'settings' ? "settings" : "settings-outline"} 
            size={18} 
            color={activeTab === 'settings' ? COLORS.primary : COLORS.textSecondary} 
          />
        </TouchableOpacity>

        <View style={styles.badge}>
          <View style={styles.statusDot} />
          <Text style={styles.badgeText}>STANDALONE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  titleContainer: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 5,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: COLORS.primary,
  },
});
