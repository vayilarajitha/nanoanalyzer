import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import api from '../services/api';
import { saveSession } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    const cleanName = name.trim();
    const rawEmail = email.trim();
    const cleanEmail = rawEmail.toLowerCase();

    if (!cleanName || !rawEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (/[A-Z]/.test(rawEmail)) {
      setError('Email address must be in lowercase.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(cleanName, cleanEmail, password);
      setLoading(false);
      if (res.status === 'success' && res.user) {
        await saveSession(res.user);
        navigation.replace('Main');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Database or connection error.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBox}>
          <Text style={styles.brandTitle}>
            Create <Text style={{ color: COLORS.cyan }}>Account</Text>
          </Text>
          <Text style={styles.brandSubtitle}>Join NanoAnalyzer to run biophysical uptake simulations</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.rose} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Full Name"
            placeholder="Dr. Researcher"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            required
          />

          <CustomInput
            label="Email Address"
            placeholder="researcher@lab.org (lowercase)"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            required
          />

          <CustomInput
            label="Password"
            placeholder="Min. 6 characters"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            required
          />

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            icon="person-add-outline"
            style={{ marginTop: 16 }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signupText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
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
});
