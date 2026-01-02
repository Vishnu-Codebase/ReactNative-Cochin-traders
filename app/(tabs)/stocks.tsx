import StockList from '@/components/stocks/StockList';
import StockSearch from '@/components/stocks/StockSearch';
import { useCart } from '@/context/CartContext';
import { useCompany } from '@/context/CompanyContext';
import { getCompanyStocks } from '@/lib/api';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function StocksScreen() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<{ id: string; name: string; qty: number }[]>([]);
  const cart = useCart();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState<{ id: string; name: string; qty: number } | null>(null);
  const [pieces, setPieces] = useState('');
  const [sets, setSets] = useState('');

  const { selected } = useCompany();

  useEffect(() => {
    if (!selected) return;
    getCompanyStocks(selected).then((res: any) => {
      const rows = res && res.data ? res.data : [];
      const mapped = rows.map((s: any) => ({ id: String(s.$Name || s.Name || Math.random()), name: s.$Name || s.Name || '', qty: Number(s.$ClosingBalance ?? s.ClosingBalance ?? s.ClosingQty ?? 0) || 0 }));
      setItems(mapped);
    }).catch(() => {});
  }, [selected]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!selected) return;
      // filter client-side by $Name
      getCompanyStocks(selected).then((res: any) => {
        const rows = res && res.data ? res.data : [];
        const filtered = rows.filter((r: any) => (String(r.$Name || r.Name || '').toLowerCase().includes(query.toLowerCase())));
        setItems(filtered.map((s: any) => ({ id: String(s.$Name || s.Name || Math.random()), name: s.$Name || s.Name || '', qty: Number(s.$ClosingBalance ?? s.ClosingBalance ?? s.ClosingQty ?? 0) || 0 })));
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [query, selected]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stocks</Text>
      <StockSearch value={query} onChange={useCallback((v: string) => setQuery(v), [])} />
      <StockList items={items} onAdd={useCallback((id: string, name: string) => {
        const it = items.find((i) => i.id === id);
        setModalItem(it || { id, name, qty: 0 });
        setPieces('');
        setSets('');
        setModalVisible(true);
      }, [items])} />
      <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
        <Text style={styles.cartButtonText}>Open Cart ({cart.items.length})</Text>
      </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalItem?.name}</Text>
              <Text style={{ marginBottom: 8 }}>Available: {modalItem?.qty ?? 0}</Text>
              <TextInput keyboardType="numeric" placeholder="Pieces" value={pieces} onChangeText={setPieces} style={styles.modalInput} />
              <TextInput keyboardType="numeric" placeholder="Sets" value={sets} onChangeText={setSets} style={styles.modalInput} />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                <Pressable onPress={() => setModalVisible(false)} style={styles.modalButton}><Text>Cancel</Text></Pressable>
                <Pressable onPress={() => {
                  if (!modalItem) return;
                  const p = Number(pieces || 0) || 0;
                  const s = Number(sets || 0) || 0;
                  if (p === 0 && s === 0) return setModalVisible(false);
                  cart.add({ id: modalItem.id, name: modalItem.name, pieces: p, sets: s });
                  setModalVisible(false);
                }} style={[styles.modalButton, { marginLeft: 8 }]}>
                  <Text style={{ color: '#2563eb', fontWeight: '700' }}>OK</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  input: { },
  listItem: { },
  addButton: { },
  addButtonText: { },
  cartButton: { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 9999 },
  cartButtonText: { color: '#fff', fontWeight: '600' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginBottom: 8 },
  modalButton: { paddingVertical: 8, paddingHorizontal: 12 },
});
