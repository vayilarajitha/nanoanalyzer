import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  Text, 
  Platform 
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/constants/theme';
import Header from './src/components/Header';
import ErrorBoundary from './src/components/ErrorBoundary';

import DashboardScreen from './src/screens/DashboardScreen';
import PredictScreen from './src/screens/PredictScreen';
import DatasetsScreen from './src/screens/DatasetsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import ExperimentsScreen from './src/screens/ExperimentsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setActiveTab} />;
      case 'predict':
        return <PredictScreen onNavigate={setActiveTab} />;
      case 'datasets':
        return <DatasetsScreen onNavigate={setActiveTab} />;
      case 'analytics':
        return <AnalyticsScreen onNavigate={setActiveTab} />;
      case 'chatbot':
        return <ChatbotScreen onNavigate={setActiveTab} />;
      case 'experiments':
        return <ExperimentsScreen onNavigate={setActiveTab} />;
      case 'history':
        return <HistoryScreen onNavigate={setActiveTab} />;
      case 'settings':
        return <SettingsScreen onNavigate={setActiveTab} />;
      default:
        return <DashboardScreen onNavigate={setActiveTab} />;
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Simulation & Formulation Center';
      case 'predict': return 'Biophysical Simulation Studio';
      case 'datasets': return 'Formulation Library';
      case 'analytics': return 'Visual Distributions & Analytics';
      case 'chatbot': return 'NanoBot AI Biomedical Specialist';
      case 'experiments': return 'Laboratory Protocol Tracker';
      case 'history': return 'Analysis Execution Records';
      case 'settings': return 'Runtime Architecture & Specs';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.surface} />
      
      <ErrorBoundary>
        {/* Native Biotech Header with Quick Shortcuts & Standalone Badge */}
        <Header 
          subtitle={getSubtitle()} 
          activeTab={activeTab} 
          onNavigate={setActiveTab} 
        />

        {/* Active Screen Content */}
        <View style={styles.screenContainer}>
          {renderScreen()}
        </View>

        {/* Native Android Bottom Tab Navigation Bar */}
        <View style={styles.bottomBar}>
          {/* 1. Dashboard */}
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('dashboard')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'dashboard' ? 'speedometer' : 'speedometer-outline'}
              size={22}
              color={activeTab === 'dashboard' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'dashboard' && styles.tabLabelActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          {/* 2. Simulate */}
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('predict')}
            activeOpacity={0.7}
          >
            <View style={styles.simIconBadge}>
              <Ionicons
                name={activeTab === 'predict' ? 'hardware-chip' : 'hardware-chip-outline'}
                size={22}
                color={activeTab === 'predict' ? COLORS.primary : COLORS.textMuted}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'predict' && styles.tabLabelActive,
              ]}
            >
              Simulate
            </Text>
          </TouchableOpacity>

          {/* 3. Datasets */}
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('datasets')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'datasets' ? 'server' : 'server-outline'}
              size={22}
              color={activeTab === 'datasets' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'datasets' && styles.tabLabelActive,
              ]}
            >
              Datasets
            </Text>
          </TouchableOpacity>

          {/* 4. Analytics */}
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('analytics')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'analytics' ? 'stats-chart' : 'stats-chart-outline'}
              size={22}
              color={activeTab === 'analytics' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'analytics' && styles.tabLabelActive,
              ]}
            >
              Analytics
            </Text>
          </TouchableOpacity>

          {/* 5. NanoBot AI */}
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('chatbot')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'chatbot' ? 'sparkles' : 'sparkles-outline'}
              size={22}
              color={activeTab === 'chatbot' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'chatbot' && styles.tabLabelActive,
              ]}
            >
              NanoBot AI
            </Text>
          </TouchableOpacity>
        </View>
      </ErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  simIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
