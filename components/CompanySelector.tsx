import React, { useEffect, useState } from 'react';
import { View as DefaultView, FlatList, Modal, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { useCompany } from '../context/CompanyContext';
import { Text, View, useThemeColor } from './Themed';

export default function CompanySelector() {
  const { companies, selected, setSelected, refresh } = useCompany();
  const [open, setOpen] = useState(false);
  
  const contentBg = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const subColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');
  const buttonPrimary = useThemeColor({}, 'buttonPrimary');

  useEffect(() => {
    // console.log('CompanySelector - selected:', selected);
    // console.log('CompanySelector - companies:', companies);
  }, [selected, companies]);

  return (
    <React.Fragment>
      <TouchableOpacity onPress={() => { refresh(); setOpen(true); }} style={styles.button}>
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="clip">{selected || 'Select Company'}</Text>
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
                    style={[styles.item]}
                >
                  <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{item.companyName}</Text>
                  {item.lastSyncedAt ? <Text style={[styles.itemSub, { color: subColor }]}>{new Date(item.lastSyncedAt).toLocaleString()}</Text> : null}
                </Pressable>
              )}
            />
            <Pressable onPress={() => setOpen(false)} style={styles.closeButton}>
              <Text style={[styles.closeText, { backgroundColor: buttonPrimary }]}>Close</Text>
            </Pressable>
          </View>
        </DefaultView>
      </Modal>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', maxWidth: 100, overflow: 'hidden' },
  text: { color: '#fff', fontWeight: '600', fontSize: 14, maxWidth: 100 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '70%', padding: 12, borderRadius: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  item: { paddingVertical: 10, borderBottomWidth: 1 },
  itemText: { fontSize: 15 },
  itemSub: { fontSize: 12 },
  closeButton: { marginTop: 10, alignSelf: 'flex-end' },
  closeText: {color: '#fff', fontSize: 14, fontWeight: '700', backgroundColor: '#2563eb', borderRadius: 16, paddingRight: 12, paddingLeft: 12, paddingTop: 6, paddingBottom: 6 },
  companySelector: { fontSize: 14, fontWeight: '600' },
});
