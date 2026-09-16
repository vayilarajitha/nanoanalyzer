import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import api from '../services/api';
import { getSession, saveSession, clearSession } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [existingUser, setExistingUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkCurrentSession();
  }, []);

  const checkCurrentSession = async () => {
    try {
      const user = await getSession();
      if (user && user.id) {
        setExistingUser(user);
      }
    } catch (e) {
      setExistingUser(null);
    }
  };

  const handleContinueAsExisting = () => {
    navigation.replace('Main');
  };

  const handleSwitchAccount = async () => {
    await clearSession();
    setExistingUser(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleLogin = async () => {
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(cleanEmail, password);
      setLoading(false);
      if (res.status === 'success' && res.user) {
        await saveSession(res.user);
        navigation.replace('Main');
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Unable to connect to NanoAnalyzer backend.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBox}>
          <View style={styles.logoCircle}>
            <Ionicons name="hardware-chip-outline" size={40} color={COLORS.cyan} />
          </View>
          <Text style={styles.brandTitle}>
            Nano<Text style={{ color: COLORS.cyan }}>Analyzer</Text>
          </Text>
          <Text style={styles.brandSubtitle}>Nanoparticle Cellular Uptake Analysis</Text>
        </View>

        {existingUser ? (
          <View style={styles.activeUserCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={styles.activeUserAvatar}>
                <Ionicons name="person" size={24} color={COLORS.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeUserLabel}>CURRENTLY SIGNED IN</Text>
                <Text style={styles.activeUserName}>{existingUser.name || existingUser.full_name || 'Researcher'}</Text>
                <Text style={styles.activeUserEmail}>{existingUser.email}</Text>
              </View>
            </View>

            <CustomButton
              title="Continue to Dashboard"
              onPress={handleContinueAsExisting}
              icon="arrow-forward-circle-outline"
            />

            <TouchableOpacity onPress={handleSwitchAccount} style={styles.switchAccountBtn} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={16} color={COLORS.rose} style={{ marginRight: 6 }} />
              <Text style={styles.switchAccountText}>Switch Account / Sign In with another ID</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Enter your credentials to access your simulations</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color={COLORS.rose} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Email Address"
              placeholder="researcher@lab.org"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <CustomInput
              label="Password"
              placeholder="••••••••"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              icon="log-in-outline"
              style={{ marginTop: 12 }}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.cyanGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderCyan,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.roseGlow,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.rose,
    flex: 1,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginVertical: 6,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.cyan,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  signupText: {
    fontSize: 13,
    color: COLORS.cyan,
    fontWeight: 'bold',
  },
  activeUserCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderCyan,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 24,
  },
  activeUserAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.cyanGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeUserLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.cyan,
    letterSpacing: 1,
    marginBottom: 2,
  },
  activeUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  activeUserEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  switchAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 10,
  },
  switchAccountText: {
    fontSize: 13,
    color: COLORS.rose,
    fontWeight: '600',
  },
});
