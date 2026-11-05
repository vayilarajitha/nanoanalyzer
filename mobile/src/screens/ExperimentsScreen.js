import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { 
  getExperiments, 
  createExperiment, 
  setExperimentStatus, 
  deleteExperiment, 
  subscribeToStore 
} from '../services/storage';

const STATUSES = ['Planned', 'In Progress', 'Completed', 'On Hold'];

export default function ExperimentsScreen() {
  const [experiments, setExperiments] = useState(getExperiments());
  const [modalVisible, setModalVisible] = useState(false);

  // New protocol form state
  const [title, setTitle] = useState('');
  const [material, setMaterial] = useState('Gold (Au)');
  const [size, setSize] = useState('45');
  const [cellLine, setCellLine] = useState('HeLa');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setExperiments(getExperiments());
    });
    return unsub;
  }, []);

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a laboratory protocol title.');
      return;
    }

    createExperiment({
      title,
      core_material: material,
      particle_size_nm: parseFloat(size) || 45,
      target_cell_line: cellLine,
      description: desc
    });

    setModalVisible(false);
    setTitle('');
    setDesc('');
  };

  const handleStatusCycle = (item) => {
    const currIdx = STATUSES.indexOf(item.status);
    const nextStatus = STATUSES[(currIdx + 1) % STATUSES.length];
    setExperimentStatus(item.id, nextStatus);
  };

  const handleDelete = (id, expTitle) => {
    Alert.alert(
      'Delete Protocol',
      `Delete "${expTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteExperiment(id)
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return COLORS.success;
      case 'In Progress': return COLORS.primary;
      case 'Planned': return COLORS.secondary;
      case 'On Hold': return COLORS.warning;
      default: return COLORS.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Laboratory Protocols</Text>
          <Text style={styles.subheading}>Track cellular uptake assay lifecycles</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {experiments.map((item) => {
          const statusCol = getStatusColor(item.status);
          const sizeVal = item.particle_size_nm || item.size_nm || 45;
          const mat = item.core_material || item.material || 'Gold';
          const cell = item.target_cell_line || item.cell_type || 'HeLa';

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.specsSub}>
                    {mat} • {sizeVal}nm • {cell}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDelete(item.id, item.title)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={17} color={COLORS.danger} />
                </TouchableOpacity>
              </View>

              {item.description ? (
                <Text style={styles.descText}>{item.description}</Text>
              ) : null}

              {/* Status Pill with Tap to Cycle */}
              <View style={styles.footerRow}>
                <TouchableOpacity 
                  style={[styles.statusBadge, { borderColor: statusCol, backgroundColor: `${statusCol}18` }]}
                  onPress={() => handleStatusCycle(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statusDot, { backgroundColor: statusCol }]} />
                  <Text style={[styles.statusText, { color: statusCol }]}>{item.status}</Text>
                  <Ionicons name="sync-outline" size={12} color={statusCol} style={{ marginLeft: 2 }} />
                </TouchableOpacity>

                <Text style={styles.cycleHint}>Tap to change status</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Protocol Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Laboratory Protocol</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Protocol Title *</Text>
              <TextInput
                style={styles.formInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. MDA-MB-231 Kinetic Assay"
                placeholderTextColor={COLORS.textMuted}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Core Material</Text>
                  <TextInput
                    style={styles.formInput}
                    value={material}
                    onChangeText={setMaterial}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Size (nm)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={size}
                    onChangeText={setSize}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Target Cell Line</Text>
              <TextInput
                style={styles.formInput}
                value={cellLine}
                onChangeText={setCellLine}
              />

              <Text style={styles.inputLabel}>Description / Objectives</Text>
              <TextInput
                style={[styles.formInput, { height: 70 }]}
                value={desc}
                onChangeText={setDesc}
                placeholder="Describe methodology, incubation timeline..."
                placeholderTextColor={COLORS.textMuted}
                multiline
              />
            </ScrollView>

            <TouchableOpacity 
              style={styles.saveBtn}
              onPress={handleCreate}
            >
              <Text style={styles.saveBtnText}>Create Protocol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  heading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 3,
  },
  specsSub: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  descText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginVertical: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cycleHint: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 10,
    color: COLORS.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
});
