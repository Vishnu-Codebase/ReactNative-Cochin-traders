import CompanySelector from '@/components/CompanySelector';
import { SkeletonLine } from '@/components/Skeleton';
import ThemeToggle from '@/components/ThemeToggle';
import { Text, View, useThemeColor } from '@/components/Themed';
import { useCompany } from '@/context/CompanyContext';
import { getCompanyLedgers } from '@/lib/api';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View as DefaultView, FlatList, StyleSheet, TextInput } from 'react-native';

export default function LedgersScreen() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<{ name: string }[]>([]);
  const { selected } = useCompany();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    getCompanyLedgers(selected).then((res: any) => {
      const rows = res && res.data ? res.data : [];
      const mapped = rows.map((s: any) => ({ name: s.$Name || s.Name || '' }));
      setItems(mapped);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selected]);

  const filtered = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Ledgers',
        headerRight: () => (
          <React.Fragment>
            <ThemeToggle />
            <CompanySelector />
          </React.Fragment>
        ),
      }} />
      {loading && (
        <DefaultView style={{ paddingHorizontal: 12 }}>
          {[...Array(10)].map((_, i) => (
            <DefaultView key={i} style={[styles.item, { borderBottomColor: borderColor }]}>
              <SkeletonLine width="70%" height={14} />
            </DefaultView>
          ))}
        </DefaultView>
      )}
      <TextInput
        style={[styles.searchBar, { color: textColor, borderColor: borderColor }]}
        placeholder="Search ledgers..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => item.name + index}
        renderItem={({ item }) => (
          <DefaultView style={[styles.item, { borderBottomColor: borderColor }]}>
            <Text style={styles.itemText}>{item.name}</Text>
          </DefaultView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: 16, padding: 12, borderWidth: 1, borderRadius: 8 },
  item: { padding: 16, borderBottomWidth: 1 },
  itemText: { fontSize: 16 },
});
