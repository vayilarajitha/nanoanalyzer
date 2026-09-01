import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import api from '../services/api';

export default function OTPVerificationScreen({ route, navigation }) {
  const emailParam = route.params?.email || '';
  const otpParam = route.params?.otpCode || '';

  const [email] = useState(emailParam);
  const [otpCode, setOtpCode] = useState(otpParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!otpCode || !newPassword || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.confirmResetPassword(email, otpCode, newPassword);
      setLoading(false);
      if (res.status === 'success') {
        setSuccess('Password changed successfully! Redirecting to login...');
        setTimeout(() => {
          navigation.replace('Login');
        }, 1800);
      } else {
        setError(res.message || 'Invalid verification code.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password reset could not be completed.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.brandBox}>
          <Text style={styles.brandTitle}>Verification & Reset</Text>
          <Text style={styles.brandSubtitle}>
            Enter the 6-digit code for <Text style={{ color: COLORS.cyan, fontWeight: 'bold' }}>{email}</Text>
          </Text>
        </View>

        {otpParam ? (
          <View style={styles.codeCard}>
            <Text style={styles.codeCardTitle}>Generated Verification Code</Text>
            <Text style={styles.codeCardValue}>{otpParam}</Text>
            <Text style={styles.codeCardSub}>Valid for 15 minutes</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.rose} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.emerald} style={{ marginRight: 6 }} />
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Verification Code (6-Digit)"
            placeholder="000000"
            icon="shield-checkmark-outline"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            required
          />

          <CustomInput
            label="New Password"
            placeholder="Min 6 characters"
            icon="lock-closed-outline"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            required
          />

          <CustomInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            icon="lock-closed-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            required
          />

          <CustomButton
            title="Change Password"
            onPress={handleResetPassword}
            loading={loading}
            icon="checkmark-circle-outline"
            style={{ marginTop: 16 }}
          />
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  codeCard: {
    backgroundColor: COLORS.cyanGlow,
    borderColor: COLORS.borderCyan,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeCardTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  codeCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.cyan,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginVertical: 4,
  },
  codeCardSub: {
    fontSize: 11,
    color: COLORS.textMuted,
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emeraldGlow,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  successText: {
    fontSize: 12,
    color: COLORS.emerald,
    flex: 1,
  },
});
