import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';

export default function ReportsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await api.getReports();
      if (res.status === 'success') {
        setReports(res.results || []);
      }
    } catch (e) {
      // Keep empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  // Generate and Share PDF Report using Expo Print & Sharing
  const handleSharePDF = async (report) => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: Helvetica, Arial, sans-serif; background: #0b0f19; color: #f8fafc; padding: 20px; }
            h1 { color: #06b6d4; font-size: 24px; }
            .card { background: #151c2e; border: 1px solid #06b6d4; border-radius: 12px; padding: 20px; margin-top: 15px; }
            .metric-val { font-size: 20px; font-weight: bold; color: #10b981; }
            .label { color: #64748b; font-size: 12px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            td, th { padding: 10px; border-bottom: 1px solid #1e293b; text-align: left; }
          </style>
        </head>
        <body>
          <h1>NanoAnalyzer - Simulation Report</h1>
          <p>Biophysical Nanoparticle Cellular Uptake Analysis</p>

          <div class="card">
            <h2>${report.analysis_name || 'Uptake Simulation'}</h2>
            <p>Date: ${report.created_at_formatted || new Date().toLocaleString()}</p>
            <table>
              <tr><th>Core Material</th><td>${report.core_material}</td></tr>
              <tr><th>Particle Size</th><td>${report.size_nm} nm</td></tr>
              <tr><th>Surface Charge</th><td>${report.surface_charge_mv} mV</td></tr>
              <tr><th>Cell Line</th><td>${report.cell_type}</td></tr>
              <tr><th>Predicted Uptake</th><td><span class="metric-val">${report.predicted_uptake_percent}%</span></td></tr>
              <tr><th>Toxicity Index</th><td>${report.predicted_toxicity_index}</td></tr>
              <tr><th>Delivery Score</th><td>${report.delivery_efficiency_score}</td></tr>
              <tr><th>Primary Pathway</th><td>${report.primary_mechanism || 'Clathrin-Mediated'}</td></tr>
            </table>
            <p style="margin-top: 15px; font-style: italic; color: #cbd5e1;">${report.recommendations || ''}</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share PDF Report' });
      } else {
        Alert.alert('PDF Generated', `Report saved at: ${uri}`);
      }
    } catch (err) {
      Alert.alert('PDF Error', 'Unable to generate PDF report.');
    }
  };

  // Export CSV using Expo FileSystem & Sharing
  const handleExportCSV = async () => {
    if (reports.length === 0) {
      Alert.alert('Export CSV', 'No simulation report records available to export.');
      return;
    }

    try {
      let csvContent = 'ID,Analysis Name,Material,Size (nm),Charge (mV),Cell Line,Uptake %,Toxicity Index,Delivery Score,Date\n';
      reports.forEach((r) => {
        csvContent += `"${r.id}","${r.analysis_name || ''}","${r.core_material || ''}",${r.size_nm},${r.surface_charge_mv},"${r.cell_type}",${r.predicted_uptake_percent},${r.predicted_toxicity_index},${r.delivery_efficiency_score},"${r.created_at_formatted || ''}"\n`;
      });

      const fileUri = FileSystem.documentDirectory + 'NanoAnalyzer_Reports_Export.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export CSV Reports' });
      } else {
        Alert.alert('CSV Exported', `CSV file created at: ${fileUri}`);
      }
    } catch (err) {
      Alert.alert('CSV Error', 'Unable to export CSV file.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="PDF & CSV Reports"
        subtitle="Clinical & Analytical Reports Center"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="download-outline"
        onRightPress={handleExportCSV}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />}
      >
        <View style={styles.actionRow}>
          <CustomButton
            title="Export All CSV"
            onPress={handleExportCSV}
            variant="glass"
            icon="document-text-outline"
            style={{ flex: 1 }}
          />
        </View>

        {loading ? (
          <View>
            <LoadingSkeleton height={140} borderRadius={16} style={{ marginBottom: 12 }} />
            <LoadingSkeleton height={140} borderRadius={16} style={{ marginBottom: 12 }} />
          </View>
        ) : reports.length > 0 ? (
          reports.map((item) => (
            <View key={item.id} style={styles.reportCard}>
              <View style={styles.cardTop}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>PDF Report</Text>
                </View>
                <Text style={styles.dateText}>{item.created_at_formatted || 'Recent'}</Text>
              </View>

              <Text style={styles.reportTitle}>{item.analysis_name || 'Uptake Simulation Run'}</Text>

              <View style={styles.metricsBox}>
                <Text style={styles.metaLine}>
                  Material: <Text style={styles.boldText}>{item.core_material}</Text>
                </Text>
                <Text style={styles.metaLine}>
                  Uptake Rate: <Text style={{ color: COLORS.emerald, fontWeight: 'bold' }}>{item.predicted_uptake_percent}%</Text>
                </Text>
                <Text style={styles.metaLine}>
                  Toxicity Index: <Text style={{ color: COLORS.rose, fontWeight: 'bold' }}>{item.predicted_toxicity_index}</Text>
                </Text>
              </View>

              <CustomButton
                title="Generate & Share PDF"
                onPress={() => handleSharePDF(item)}
                variant="cyan"
                icon="share-outline"
                style={styles.shareBtn}
              />
            </View>
          ))
        ) : (
          <EmptyState
            icon="document-text-outline"
            title="No Reports Available"
            message="No simulation reports available to generate. Run a new analysis first!"
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: COLORS.cyanGlow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.cyan,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  metricsBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  metaLine: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  boldText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  shareBtn: {
    height: 40,
  },
});
