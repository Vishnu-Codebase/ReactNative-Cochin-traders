import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TouchableOpacity, View as DefaultView } from 'react-native';
import { useCompany } from '../context/CompanyContext';
import { Text, View, useThemeColor } from './Themed';

export default function CompanySelector() {
  const { companies, selected, setSelected, refresh } = useCompany();
  const [open, setOpen] = useState(false);
  
  const contentBg = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const subColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');

  return (
    <>
      <TouchableOpacity onPress={() => { refresh(); setOpen(true); }} style={styles.button}>
        <Text numberOfLines={1} style={styles.text}>{selected || 'Select Company'}</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <DefaultView style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: contentBg }]}>
            <Text style={styles.modalTitle}>Select Company</Text>
            <FlatList
              data={companies}
              keyExtractor={(i) => i.companyName}
              renderItem={({ item }) => (
                <Pressable 
                    onPress={() => { setSelected(item.companyName); setOpen(false); }} 
                    style={[styles.item, { borderBottomColor: borderColor }]}
                >
                  <Text style={styles.itemText}>{item.companyName}</Text>
                  {item.lastSyncedAt ? <Text style={[styles.itemSub, { color: subColor }]}>{new Date(item.lastSyncedAt).toLocaleString()}</Text> : null}
                </Pressable>
              )}
            />
            <Pressable onPress={() => setOpen(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </DefaultView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, minWidth: 120 },
  text: { color: '#fff', fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '70%', padding: 12, borderRadius: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  item: { paddingVertical: 10, borderBottomWidth: 1 },
  itemText: { fontSize: 15 },
  itemSub: { fontSize: 12 },
  closeButton: { marginTop: 10, alignSelf: 'flex-end' },
  closeText: { color: '#2563eb', fontWeight: '700' },
});
