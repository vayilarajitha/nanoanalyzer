import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';

export default function DatasetScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [material, setMaterial] = useState('Polymeric');
  const [sizeNm, setSizeNm] = useState('45');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchDatasets = async () => {
    try {
      const res = await api.getDatasets();
      if (res.status === 'success') {
        setDatasets(res.datasets || []);
      }
    } catch (e) {
      // Handle error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDatasets();
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv', '*/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
      }
    } catch (err) {
      Alert.alert('Document Picker Error', 'Unable to pick document file.');
    }
  };

  const handleUploadDataset = async () => {
    setError('');
    if (!datasetName.trim()) {
      setError('Please provide a dataset name.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('dataset_name', datasetName.trim());
      formData.append('material', material);
      formData.append('nanoparticle_size', sizeNm);

      if (selectedFile) {
        formData.append('csv_file', {
          uri: selectedFile.uri,
          name: selectedFile.name || 'dataset.csv',
          type: selectedFile.mimeType || 'text/csv',
        });
      }

      const res = await api.uploadDataset(formData);
      setUploading(false);

      if (res.status === 'success') {
        setShowUploadForm(false);
        setDatasetName('');
        setSelectedFile(null);
        fetchDatasets();
      } else {
        setError(res.message || 'Dataset upload failed.');
      }
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || 'Error uploading dataset to backend.');
    }
  };

  const handleDeleteDataset = async (id, name) => {
    Alert.alert(
      'Delete Dataset',
      `Are you sure you want to delete dataset "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.deleteDataset(id);
              if (res.status === 'success') {
                fetchDatasets();
              }
            } catch (e) {
              Alert.alert('Delete Failed', 'Unable to delete dataset.');
            }
          },
        },
      ]
    );
  };

  const filteredDatasets = datasets.filter((ds) => {
    const q = searchQuery.toLowerCase();
    const name = (ds.dataset_name || ds.name || '').toLowerCase();
    const mat = (ds.material || ds.core_material || '').toLowerCase();
    return name.includes(q) || mat.includes(q);
  });

  return (
    <View style={styles.container}>
      <Header
        title="Dataset Manager"
        subtitle="Manage Experimental CSV Datasets"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon={showUploadForm ? 'close' : 'cloud-upload-outline'}
        onRightPress={() => setShowUploadForm(!showUploadForm)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />}
      >
        {/* Upload Form Overlay/Section */}
        {showUploadForm ? (
          <View style={styles.uploadCard}>
            <Text style={styles.formTitle}>Upload New Experimental Dataset</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color={COLORS.rose} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Dataset Name"
              placeholder="e.g. Gold Nano-Spheres Study"
              icon="document-text-outline"
              value={datasetName}
              onChangeText={setDatasetName}
              required
            />

            <View style={styles.inputRow}>
              <CustomInput
                label="Material"
                placeholder="Gold (Au)"
                icon="cube-outline"
                value={material}
                onChangeText={setMaterial}
                containerStyle={{ flex: 1 }}
              />
              <View style={{ width: 10 }} />
              <CustomInput
                label="Size (nm)"
                placeholder="45"
                icon="resize-outline"
                value={sizeNm}
                onChangeText={setSizeNm}
                keyboardType="numeric"
                containerStyle={{ flex: 1 }}
              />
            </View>

            {/* Document Picker Trigger */}
            <TouchableOpacity style={styles.filePicker} onPress={handlePickDocument}>
              <Ionicons name="document-attach-outline" size={24} color={COLORS.cyan} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.filePickerTitle}>
                  {selectedFile ? selectedFile.name : 'Select CSV Dataset File'}
                </Text>
                <Text style={styles.filePickerSub}>
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supports .csv, .txt, .xlsx'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <CustomButton
              title="Upload to Supabase"
              onPress={handleUploadDataset}
              loading={uploading}
              icon="cloud-upload-outline"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : null}

        <CustomInput
          placeholder="Search datasets by name or material..."
          icon="search-outline"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <View>
            <LoadingSkeleton height={100} borderRadius={16} style={{ marginBottom: 12 }} />
            <LoadingSkeleton height={100} borderRadius={16} style={{ marginBottom: 12 }} />
          </View>
        ) : filteredDatasets.length > 0 ? (
          filteredDatasets.map((ds) => (
            <View key={ds.id} style={styles.datasetCard}>
              <View style={styles.datasetHeader}>
                <View style={styles.dsIconBox}>
                  <Ionicons name="server-outline" size={20} color={COLORS.cyan} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.dsName}>{ds.dataset_name || ds.name || 'Dataset'}</Text>
                  <Text style={styles.dsMeta}>
                    {ds.core_material || ds.material || 'Polymeric'} • {ds.size_nm || ds.nanoparticle_size || 45}nm
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteDataset(ds.id, ds.dataset_name || ds.name)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.rose} />
                </TouchableOpacity>
              </View>

              {ds.uploaded_file ? (
                <View style={styles.fileInfoBox}>
                  <Ionicons name="document-text-outline" size={14} color={COLORS.cyan} />
                  <Text style={styles.fileInfoText} numberOfLines={1}>
                    {ds.uploaded_file}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState
            icon="server-outline"
            title="No datasets found"
            message="No experimental nanoparticle datasets found in database."
            buttonTitle="Upload CSV Dataset"
            onButtonPress={() => setShowUploadForm(true)}
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
  uploadCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderCyan,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.cyan,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  filePickerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filePickerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  datasetCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  datasetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.cyanGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dsName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dsMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: COLORS.roseGlow,
    borderRadius: 8,
  },
  fileInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  fileInfoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
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
});
