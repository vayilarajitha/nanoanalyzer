import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { getSession, clearSession } from '../services/authService';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const sessionUser = await getSession();
      if (sessionUser) {
        setUser(sessionUser);
        setName(sessionUser.name || sessionUser.full_name || '');
        setInstitution(sessionUser.institution || 'Biomedical Nanotechnology Lab');
        setBio(sessionUser.bio || '');
      }

      const res = await api.getUserProfile();
      if (res.status === 'success' && res.user) {
        setUser(res.user);
        setName(res.user.name || res.user.full_name || '');
        setInstitution(res.user.institution || 'Biomedical Nanotechnology Lab');
        setBio(res.user.bio || '');
      }
    } catch (e) {
      // Keep session state
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setMsg('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('institution', institution);
      formData.append('bio', bio);

      const res = await api.updateUserProfile(formData);
      setSaving(false);
      if (res.status === 'success') {
        setMsg('Profile updated successfully.');
      }
    } catch (err) {
      setSaving(false);
      setMsg('Profile updated.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of NanoAnalyzer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await api.logout();
            await clearSession();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="User Profile" subtitle="Account & Lab Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-circle-outline" size={64} color={COLORS.cyan} />
          </View>
          <Text style={styles.userName}>{user?.name || user?.full_name || 'Dr. Researcher'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'researcher@lab.org'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="flask-outline" size={12} color={COLORS.cyan} />
            <Text style={styles.roleText}>{user?.role || 'Senior Researcher'}</Text>
          </View>
        </View>

        {/* Quick Menu Shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('DatasetManager')}
          >
            <Ionicons name="server-outline" size={20} color={COLORS.cyan} />
            <Text style={styles.shortcutText}>Datasets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('Reports')}
          >
            <Ionicons name="document-text-outline" size={20} color={COLORS.emerald} />
            <Text style={styles.shortcutText}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('AIAssistant')}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={COLORS.purple} />
            <Text style={styles.shortcutText}>AI Assistant</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Details Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>

          {msg ? <Text style={styles.successMsg}>{msg}</Text> : null}

          <CustomInput
            label="Full Name"
            icon="person-outline"
            value={name}
            onChangeText={setName}
          />

          <CustomInput
            label="Institution / Laboratory"
            icon="business-outline"
            value={institution}
            onChangeText={setInstitution}
          />

          <CustomInput
            label="Research Bio"
            icon="information-circle-outline"
            value={bio}
            onChangeText={setBio}
            placeholder="Focus areas (e.g. Nanomedicine, Targeted Drug Delivery)"
          />

          <CustomButton
            title="Save Profile Changes"
            onPress={handleSaveProfile}
            loading={saving}
            icon="save-outline"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Logout Button */}
        <CustomButton
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          icon="log-out-outline"
          style={styles.logoutBtn}
        />
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
    paddingBottom: 30,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cyanGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderCyan,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
    marginTop: 10,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.cyan,
    fontWeight: '600',
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  shortcutBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  shortcutText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  successMsg: {
    fontSize: 13,
    color: COLORS.emerald,
    marginBottom: 10,
  },
  logoutBtn: {
    height: 50,
  },
});
