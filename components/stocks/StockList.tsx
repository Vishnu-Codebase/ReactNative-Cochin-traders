import { Text, View } from '@/components/Themed';
import React, { memo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

type Item = { id: string; name: string; qty: number };
type Props = { items: Item[]; onAdd: (id: string, name: string) => void };

export default memo(function StockList({ items, onAdd }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View style={styles.left}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.name}>{item.name}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.qty}>Available: {item.qty}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => onAdd(item.id, item.name)}>
            <Text style={styles.addButtonText}>➕</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
});

const styles = StyleSheet.create({
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  left: { flex: 1, paddingRight: 8 },
  name: { fontSize: 16 },
  qty: { color: '#666' },
  addButton: { paddingVertical: 2 , paddingHorizontal: 12, borderRadius: 25, fontSize: 32, fontWeight: '600', justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#fff' },
});
