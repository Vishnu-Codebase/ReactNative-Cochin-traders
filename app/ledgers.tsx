import CompanySelector from '@/components/CompanySelector';
import { Text, View, useThemeColor } from '@/components/Themed';
import { useCompany } from '@/context/CompanyContext';
import { getCompanyLedgers } from '@/lib/api';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View as DefaultView, FlatList, StyleSheet, TextInput } from 'react-native';

export default function LedgersScreen() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<{ name: string }[]>([]);
  const { selected } = useCompany();

  useEffect(() => {
    if (!selected) return;
    getCompanyLedgers(selected).then((res: any) => {
      const rows = res && res.data ? res.data : [];
      const mapped = rows.map((s: any) => ({ name: s.$Name || s.Name || '' }));
      setItems(mapped);
    }).catch(() => {});
  }, [selected]);

  const filtered = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const clearBg = useThemeColor({}, 'card'); 

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Ledgers',
        headerRight: () => <CompanySelector />,
      }} />
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
          <DefaultView style={[styles.item, { borderBottomColor: 'transparent', backgroundColor: clearBg }]}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.itemText, { color: textColor }]}>{item.name}</Text>
            <Text style={{ position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -8 }], fontSize: 16, color: borderColor }}>1022</Text>
          </DefaultView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {paddingRight: 3, paddingLeft: 3},
  container: { flex: 1 },
  searchBar: { margin: 16, padding: 12, borderWidth: 1, borderRadius: 8 },
  item: { padding: 10, borderBottomWidth: 1, margin: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center', borderRadius:26 },
  itemText: { fontSize: 16, overflow: 'hidden' },
});
