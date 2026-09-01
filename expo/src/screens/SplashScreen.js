import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { getSession } from '../services/authService';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    try {
      // Small timeout for splash display
      await new Promise(r => setTimeout(r, 1600));
      const user = await getSession();
      if (user && user.id) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    } catch (e) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="hardware-chip-outline" size={54} color={COLORS.cyan} />
        </View>
        <Text style={styles.title}>
          Nano<Text style={styles.cyanText}>Analyzer</Text>
        </Text>
        <Text style={styles.subtitle}>Nanoparticle Cellular Uptake Analysis</Text>

        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={COLORS.cyan} />
          <Text style={styles.loaderText}>Initializing Biometrics Engine...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.cyanGlow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCyan,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: 6,
  },
  cyanText: {
    color: COLORS.cyan,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  loaderBox: {
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 12,
  },
});
