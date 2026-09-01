import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

export default function CustomButton({
  title,
  onPress,
  variant = 'cyan', // 'cyan' | 'glass' | 'danger'
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) {
  const getBackgroundColor = () => {
    if (disabled) return 'rgba(255, 255, 255, 0.05)';
    switch (variant) {
      case 'glass': return COLORS.surfaceLight;
      case 'danger': return COLORS.rose;
      case 'cyan':
      default: return COLORS.cyan;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textMuted;
    switch (variant) {
      case 'glass': return COLORS.text;
      case 'danger': return COLORS.white;
      case 'cyan':
      default: return COLORS.background;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'cyan' && !disabled ? SHADOWS.cyan : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <Ionicons name={icon} size={18} color={getTextColor()} style={{ marginRight: 6 }} /> : null}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
