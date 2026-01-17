import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View as DefaultView } from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import ShopInput from '../components/trader/ShopInput';
import { useCompany } from '../context/CompanyContext';
import { getCompanyParties } from '../lib/api';

// Replace this with your Formspree (or webhook) endpoint. If left as null, falls back to mailto: behavior.
// Use local backend endpoint to send orders. Ensure your server is running at this address.
const FORM_ENDPOINT = 'http://localhost:3000/api/send-order'; // POST expects { shopName, items }

export default function CartScreen() {
  const cart = useCart();
  const [shopName, setShopName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const proceedScale = new Animated.Value(1);
  const [showParties, setShowParties] = useState(false);
  const [parties, setParties] = useState<{ name: string }[]>([]);
  const { selected } = useCompany();
  
  useEffect(() => {
    if (!selected) return;
    getCompanyParties(selected)
      .then((res: any) => {
        const rows = res && res.data ? res.data : [];
        const debtors = (rows || [])
          .filter((r: any) => {
            const grp = r.$_PrimaryGroup || r._PrimaryGroup || r.PrimaryGroup || '';
            return String(grp).toLowerCase().includes('sundry debtors');
          })
          .map((p: any) => ({ name: String(p.$Name || p.MailingName || p.Name || '') }));
        setParties(debtors.filter((d: any) => !!d.name));
      })
      .catch(() => setParties([]));
  }, [selected]);

  const proceed = async () => {
    if (!shopName || cart.items.length === 0) return;
    setSubmitting(true);
    try {
      const subject = `Order from ${shopName}`;
      const payload = {
        shopName,
        items: cart.items.map((it) => ({ name: it.name, pieces: it.pieces || 0, sets: it.sets || 0 })),
      };

      // Post to configured backend endpoint only
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      cart.clear();
    } catch (e) {
      // ignore or show a toast in future
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <ShopInput value={shopName} onChange={(v) => { setShopName(v); setShowParties(true); }} showClear={showParties || !!shopName} onClear={() => { setShopName(''); setShowParties(false); }} />
        {showParties && parties.length > 0 ? (
          <View style={styles.suggestions}>
            <FlatList
              data={parties.filter(p => p.name.toLowerCase().includes(shopName.toLowerCase())).slice(0,5)}
              keyExtractor={(i) => i.name}
              renderItem={({ item }) => (
                <Pressable onPress={() => { setShopName(item.name); setShowParties(false); }} style={styles.suggestionItem}>
                  <Text numberOfLines={1}>{item.name}</Text>
                </Pressable>
              )}
            />
          </View>
        ) : null}
      </View>
      <Text style={styles.title}>Cart</Text>
      <FlatList
        data={cart.items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text>{item.name}</Text>
              <Text>pieces: {item.pieces || 0}  sets: {item.sets || 0}</Text>
            </View>
            <TouchableOpacity onPress={() => cart.remove(item.id)}>
              <Text style={{ color: '#ff4d4f' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableWithoutFeedback onPress={() => {
        if (submitting) return;
        Animated.sequence([
          Animated.timing(proceedScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
          Animated.timing(proceedScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
        proceed();
      }}>
        <Animated.View style={[styles.proceedButton, { opacity: submitting ? 0.5 : 1, transform: [{ scale: proceedScale }] }] }>
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  inputWrap: { position: 'relative', marginVertical: 8, zIndex: 1 },
  suggestions: { position: 'absolute', top: 44, left: 0, right: 0, borderWidth: 1, borderRadius: 6, maxHeight: 200, zIndex: 1, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  suggestionItem: { paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1 },
  proceedButton: { backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  proceedButtonText: { color: '#fff', fontWeight: '600' },
});
