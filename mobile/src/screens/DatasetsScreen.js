import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert,
  Share 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, MATERIALS, CELL_TYPES } from '../constants/theme';
import { getDatasets, createDataset, deleteDataset, subscribeToStore, exportDatasetsToCsvString } from '../services/storage';

export default function DatasetsScreen() {
  const [datasets, setDatasets] = useState(getDatasets());
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // New dataset form state
  const [newName, setNewName] = useState('');
  const [newMaterial, setNewMaterial] = useState('Gold (Au)');
  const [newSize, setNewSize] = useState('45');
  const [newCharge, setNewCharge] = useState('18');
  const [newCell, setNewCell] = useState('HeLa');
  const [newUptake, setNewUptake] = useState('85');
  const [newToxicity, setNewToxicity] = useState('10');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setDatasets(getDatasets());
    });
    return unsub;
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter a dataset formulation name.');
      return;
    }

    createDataset({
      name: newName,
      core_material: newMaterial,
      nanoparticle_type: 'Inorganic',
      size_nm: parseFloat(newSize) || 45,
      surface_charge_mv: parseFloat(newCharge) || 0,
      cell_type: newCell,
      uptake_efficiency_percent: parseFloat(newUptake) || 85,
      toxicity_score: parseFloat(newToxicity) || 10,
      notes: newNotes
    });

    setModalVisible(false);
    setNewName('');
    setNewNotes('');
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Dataset',
      `Are you sure you want to remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteDataset(id)
        }
      ]
    );
  };

  const handleExportCsv = async () => {
    const csv = exportDatasetsToCsvString();
    try {
      await Share.share({
        title: 'NanoAnalyzer Formulations CSV',
        message: csv,
      });
    } catch (error) {
      Alert.alert('CSV Export Data', csv);
    }
  };

  const filtered = datasets.filter(d => {
    const q = search.toLowerCase();
    const name = (d.name || d.dataset_name || '').toLowerCase();
    const mat = (d.core_material || d.material || '').toLowerCase();
    const cell = (d.cell_type || '').toLowerCase();
    return name.includes(q) || mat.includes(q) || cell.includes(q);
  });

  return (
    <View style={styles.container}>
      {/* Top Search & Action Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search material, cell line, name..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity 
          style={styles.csvBtn}
          onPress={handleExportCsv}
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Datasets List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing <Text style={styles.boldText}>{filtered.length}</Text> nanoparticle formulations
          </Text>
        </View>

        {filtered.map((item) => {
          const name = item.name || item.dataset_name || 'Nanoparticle Formulation';
          const size = item.size_nm || item.nanoparticle_size || 45;
          const charge = item.surface_charge_mv || item.charge || 0;
          const material = item.core_material || item.material || 'Polymer';
          const cell = item.cell_type || 'General';
          const uptake = item.uptake_efficiency_percent ?? '--';
          const toxicity = item.toxicity_score ?? '--';

          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{name}</Text>
                  <View style={styles.tagRow}>
                    <View style={styles.matBadge}>
                      <Text style={styles.matText}>{material}</Text>
                    </View>
                    <View style={styles.cellBadge}>
                      <Text style={styles.cellText}>{cell}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDelete(item.id, name)} 
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.specsGrid}>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Diameter</Text>
                  <Text style={styles.specVal}>{size} nm</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Zeta Potential</Text>
                  <Text style={styles.specVal}>{charge} mV</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Uptake</Text>
                  <Text style={[styles.specVal, { color: COLORS.success }]}>{uptake}%</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Toxicity</Text>
                  <Text style={[styles.specVal, { color: COLORS.warning }]}>{toxicity}%</Text>
                </View>
              </View>

              {item.notes ? (
                <Text style={styles.notesText} numberOfLines={2}>
                  "{item.notes}"
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      {/* Add Dataset Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Nanoparticle Dataset</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Formulation Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. PEG-GNP HeLa"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.inputLabel}>Core Material</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {MATERIALS.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.miniChip, newMaterial === m.id && styles.miniChipActive]}
                    onPress={() => setNewMaterial(m.id)}
                  >
                    <Text style={[styles.miniChipText, newMaterial === m.id && styles.miniChipTextActive]}>
                      {m.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Target Cell Line</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {CELL_TYPES.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.miniChip, newCell === c.id && styles.miniChipActive]}
                    onPress={() => setNewCell(c.id)}
                  >
                    <Text style={[styles.miniChipText, newCell === c.id && styles.miniChipTextActive]}>
                      {c.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Size (nm)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newSize}
                    onChangeText={setNewSize}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Charge (mV)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newCharge}
                    onChangeText={setNewCharge}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Observed Uptake (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newUptake}
                    onChangeText={setNewUptake}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Toxicity Score (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newToxicity}
                    onChangeText={setNewToxicity}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, { height: 60 }]}
                value={newNotes}
                onChangeText={setNewNotes}
                placeholder="Experimental conditions, cell passaging..."
                placeholderTextColor={COLORS.textMuted}
                multiline
              />
            </ScrollView>

            <TouchableOpacity 
              style={styles.saveBtn}
              onPress={handleCreate}
            >
              <Text style={styles.saveBtnText}>Save Dataset Entry</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 13,
  },
  csvBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  countRow: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  boldText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  matBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  matText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  cellBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cellText: {
    fontSize: 10,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  specsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-between',
  },
  specBox: {
    alignItems: 'center',
    flex: 1,
  },
  specLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  specVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  notesText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 10,
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
  miniChip: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  miniChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  miniChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  miniChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
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
