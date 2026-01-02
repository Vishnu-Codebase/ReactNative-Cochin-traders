import React, { memo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

type Item = { id: string; shop: string; amount: number; address?: string; parent?: string };
type Props = { items: Item[] };

export default memo(function ReceivableList({ items }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View>
            <Text>{item.shop}</Text>
            {item.parent ? <Text>{item.parent}</Text> : null}
            {item.address ? <Text numberOfLines={1}>{item.address}</Text> : null}
          </View>
          <Text style={{ color: item.amount < 0 ? '#ef4444' : '#16a34a' }}>
            {item.amount < 0 ? 'Cr ' : 'Dr '}
            ₹{Math.abs(item.amount)}
          </Text>
        </View>
      )}
    />
  );
});

const styles = StyleSheet.create({
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
