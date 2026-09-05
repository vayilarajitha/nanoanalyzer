import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';

export default function HistoryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await api.getResults(); // fetch all user simulation runs
      if (res.status === 'success') {
        setHistoryItems(res.results || []);
      }
    } catch (e) {
      // Keep empty array
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteItem = (id, name) => {
    Alert.alert(
      'Delete Analysis Record',
      `Are you sure you want to remove "${name}" from your history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.deleteHistory(id);
              if (res.status === 'success') {
                setHistoryItems((prev) => prev.filter((item) => item.id !== id));
              } else {
                Alert.alert('Delete Failed', res.message || 'Could not delete item.');
              }
            } catch (e) {
              Alert.alert('Error', 'Unable to delete history record.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const filteredHistory = historyItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    const name = (item.analysis_name || '').toLowerCase();
    const mat = (item.core_material || '').toLowerCase();
    const cell = (item.cell_type || '').toLowerCase();
    return name.includes(q) || mat.includes(q) || cell.includes(q);
  });

  return (
    <View style={styles.container}>
      <Header title="Simulation History" subtitle="Previous Analysis Logs" />

      <View style={styles.searchContainer}>
        <CustomInput
          placeholder="Search by analysis name, material, or cell line..."
          icon="search-outline"
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={{ marginVertical: 0 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />}
      >
        {loading ? (
          <View>
            <LoadingSkeleton height={90} borderRadius={16} style={{ marginBottom: 12 }} />
            <LoadingSkeleton height={90} borderRadius={16} style={{ marginBottom: 12 }} />
            <LoadingSkeleton height={90} borderRadius={16} style={{ marginBottom: 12 }} />
          </View>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate('Results', { result: item })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.cardTitle}>{item.analysis_name || 'Uptake Simulation Run'}</Text>
                  <Text style={styles.dateText}>{item.created_at_formatted || 'Recent'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteItem(item.id, item.analysis_name || 'Simulation')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.rose} />
                </TouchableOpacity>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.badge}>
                  <Ionicons name="cube-outline" size={12} color={COLORS.cyan} />
                  <Text style={styles.badgeText}>{item.core_material || 'Polymeric'}</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="resize-outline" size={12} color={COLORS.primary} />
                  <Text style={styles.badgeText}>{item.size_nm} nm</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="body-outline" size={12} color={COLORS.purple} />
                  <Text style={styles.badgeText}>{item.cell_type}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.statusText}>
                  Status: <Text style={{ color: COLORS.emerald, fontWeight: 'bold' }}>Completed</Text>
                </Text>

                <View style={styles.uptakeBox}>
                  <Text style={styles.uptakeText}>{item.predicted_uptake_percent || item.uptake_percentage}% Uptake</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            title="No history available"
            message={searchQuery ? 'No simulation matches your search criteria.' : 'No previous analysis records found.'}
            buttonTitle="Run New Simulation"
            onButtonPress={() => navigation.navigate('New Analysis')}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  uptakeBox: {
    backgroundColor: COLORS.emeraldGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  uptakeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.emerald,
  },
});
