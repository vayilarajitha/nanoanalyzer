import React, { useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const DEFAULT_WEB_URL = 'https://nanoanalyzer.onrender.com';
const WEB_APP_URL = (process.env.EXPO_PUBLIC_WEB_URL || process.env.EXPO_PUBLIC_API_URL || DEFAULT_WEB_URL).replace(/\/$/, '');

export default function WebViewScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);

  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const handleReloadPress = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleBackPress}
          disabled={!canGoBack}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={canGoBack ? COLORS.cyan : COLORS.textMuted}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Ionicons name="globe-outline" size={16} color={COLORS.cyan} />
          <Text style={styles.headerTitle}>NanoAnalyzer Web</Text>
        </View>

        <TouchableOpacity style={styles.headerBtn} onPress={handleReloadPress}>
          <Ionicons name="refresh" size={20} color={COLORS.cyan} />
        </TouchableOpacity>
      </View>

      {/* Main WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: WEB_APP_URL }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.cyan} />
              <Text style={styles.loadingText}>Loading Web Application...</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 10,
  },
});
