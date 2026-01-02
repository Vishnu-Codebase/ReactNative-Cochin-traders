import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCompany } from '../context/CompanyContext';

export default function CompanySelector() {
  const { companies, selected, setSelected, refresh } = useCompany();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => { refresh(); setOpen(true); }} style={styles.button}>
        <Text numberOfLines={1} style={styles.text}>{selected || 'Select Company'}</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Company</Text>
            <FlatList
              data={companies}
              keyExtractor={(i) => i.companyName}
              renderItem={({ item }) => (
                <Pressable onPress={() => { setSelected(item.companyName); setOpen(false); }} style={styles.item}>
                  <Text style={styles.itemText}>{item.companyName}</Text>
                  {item.lastSyncedAt ? <Text style={styles.itemSub}>{new Date(item.lastSyncedAt).toLocaleString()}</Text> : null}
                </Pressable>
              )}
            />
            <Pressable onPress={() => setOpen(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, minWidth: 120 },
  text: { color: '#fff', fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '70%', backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 15 },
  itemSub: { fontSize: 12, color: '#666' },
  closeButton: { marginTop: 10, alignSelf: 'flex-end' },
  closeText: { color: '#2563eb', fontWeight: '700' },
});
