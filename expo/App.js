import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

const PRODUCTION_URL = 'https://nanoanalyzer.onrender.com/';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const onBackPress = () => {
      if (hasError) {
        setHasError(false);
        if (webViewRef.current) {
          webViewRef.current.reload();
        }
        return true;
      }
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack, hasError]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setLoadProgress(0.1);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadProgress = ({ nativeEvent }) => {
    setLoadProgress(nativeEvent.progress);
    if (nativeEvent.progress > 0.3) {
      setIsLoading(false);
    }
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    // Only show error for main frame failures
    if (nativeEvent && nativeEvent.isTopFrame) {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage(nativeEvent.description || 'Unable to connect to the NanoAnalyzer server.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#0b0f19" />
      <View style={styles.container}>
        
        {/* Top Progress Line */}
        {isLoading && loadProgress > 0 && loadProgress < 1 && (
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${loadProgress * 100}%` }]} />
          </View>
        )}

        {/* Main WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: PRODUCTION_URL }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          originWhitelist={['*']}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="compatibility"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={handleLoadStart}
          onLoadProgress={handleLoadProgress}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />

        {/* Loading Overlay for Cold Starts & Initial Load */}
        {isLoading && !hasError && (
          <View style={styles.loadingOverlay}>
            <View style={styles.brandContainer}>
              <Text style={styles.brandText}>
                Nano<Text style={styles.brandHighlight}>Analyzer</Text>
              </Text>
              <Text style={styles.brandSubtext}>Biophysical Nanoparticle Analytics Engine</Text>
            </View>

            <ActivityIndicator size="large" color="#06b6d4" style={styles.spinner} />

            <Text style={styles.loadingTitle}>Connecting to NanoAnalyzer...</Text>
            <Text style={styles.loadingSubtitle}>Initializing server instance on Render cloud</Text>
          </View>
        )}

        {/* Genuine Network Error Overlay */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Connection Failed</Text>
              <Text style={styles.errorMessage}>
                {errorMessage || 'Unable to reach the NanoAnalyzer server. Please check your internet connection and try again.'}
              </Text>

              <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
                <Text style={styles.retryButtonText}>Retry Connection</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0f19',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  progressBarBackground: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  brandText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandHighlight: {
    color: '#06b6d4',
  },
  brandSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  spinner: {
    marginBottom: 20,
    transform: [{ scale: 1.2 }],
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 6,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 30,
  },
  errorCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 42,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f87171',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#0b0f19',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
