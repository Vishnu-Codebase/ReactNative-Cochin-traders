import { Text, useThemeColor, View } from '@/components/Themed';
import React, { memo } from 'react';
import { FlatList, StyleSheet } from 'react-native';

type Item = { id: string; shop: string; amount: number; address?: string; parent?: string };
type Props = { items: Item[] };

export default memo(function ReceivableList({ items }: Props) {
  const borderColor = useThemeColor({}, 'tabIconDefault'); 
  const textColor = useThemeColor({}, 'text');
  const clearBg = useThemeColor({}, 'card'); 
  const iconColor = useThemeColor({}, 'text');
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <View style={[styles.listItem, { borderBottomColor: borderColor }]}>
          <View style={styles.left}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.shop, {color: textColor}]}>{item.shop}</Text>
              {item.parent ? <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.parent, {color: textColor}]}>{item.parent}</Text> : null}
              {item.address ? <Text numberOfLines={1} ellipsizeMode="tail" style={styles.address}>{item.address}</Text> : null}
          </View>
          <Text style={[{ color: item.amount < 0 ? '#ef4444' : '#16a34a' }]}>
            {item.amount < 0 ? <Text style={{ fontSize: 16, paddingRight: 5, color: item.amount < 0 ? '#ef4444' : '#16a34a' }}>{'\u2193'}</Text> : <Text style={{ fontSize: 16, paddingRight: 5, color: item.amount < 0 ? '#ef4444' : '#16a34a' }}>{'\u2191'}</Text>}
            {item.amount < 0 ? 'Cr ' : 'Dr '}
            ₹{Math.abs(item.amount)}
          </Text>
        </View>
      )}
    />
  );
});

const styles = StyleSheet.create({
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1 },
  left: { flex: 1, paddingRight: 8 },
  shop: { fontSize: 16 },
  parent: { color: '#666' },
  address: { color: '#666' },
});
