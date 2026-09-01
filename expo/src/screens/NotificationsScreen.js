import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.status === 'success') {
        setNotifications(res.notifications || []);
      }
    } catch (e) {
      // Keep state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications Center"
        subtitle="System Alerts & Simulation Updates"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />}
      >
        {loading ? (
          <View>
            <LoadingSkeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <LoadingSkeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
          </View>
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <View key={item.id} style={styles.noteCard}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={20} color={COLORS.cyan} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.cardHeader}>
                  <Text style={styles.noteTitle}>{item.title}</Text>
                  <Text style={styles.noteDate}>{item.created_at_formatted || 'Recent'}</Text>
                </View>
                <Text style={styles.noteMessage}>{item.message}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            message="You currently have no new notifications or alerts."
          />
        )}
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
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.cyanGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  noteDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  noteMessage: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
