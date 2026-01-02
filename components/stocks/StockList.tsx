import React, { memo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Item = { id: string; name: string; qty: number };
type Props = { items: Item[]; onAdd: (id: string, name: string) => void };

export default memo(function StockList({ items, onAdd }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View>
            <Text>{item.name}</Text>
            <Text>Available: {item.qty}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => onAdd(item.id, item.name)}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
});

const styles = StyleSheet.create({
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  addButton: { backgroundColor: '#10b981', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  addButtonText: { color: '#fff' },
});
