import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import ResultCard from '../components/ResultCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';

export default function ResultsScreen({ route, navigation }) {
  const passedResult = route.params?.result || null;
  const resultId = route.params?.id || route.params?.resultId || null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resultsList, setResultsList] = useState(passedResult ? [passedResult] : []);

  const fetchResults = async () => {
    try {
      const res = await api.getResults(resultId);
      if (res.status === 'success') {
        const fetched = res.results || (res.data ? [res.data] : []);
        setResultsList(fetched);
      } else {
        setResultsList([]);
      }
    } catch (e) {
      setResultsList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (passedResult && !resultId) {
      setResultsList([passedResult]);
      setLoading(false);
    } else {
      fetchResults();
    }
  }, [passedResult, resultId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResults();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Simulation Results"
        subtitle="Biophysical Cellular Internalisation Analysis"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />}
      >
        {loading ? (
          <View>
            <LoadingSkeleton height={320} borderRadius={16} style={{ marginBottom: 16 }} />
          </View>
        ) : resultsList.length > 0 ? (
          resultsList.map((item, idx) => (
            <ResultCard key={item.id || idx} result={item} />
          ))
        ) : (
          <EmptyState
            title="No Analysis Results"
            message="No analysis has been performed yet. Start a new analysis to view your results."
            buttonTitle="New Run"
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
});
