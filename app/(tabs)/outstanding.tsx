import CompanySelector from '@/components/CompanySelector';
import { SkeletonCardItem } from '@/components/Skeleton';
import { Text, TextInput, View, useThemeColor } from '@/components/Themed';
import ThemeToggle from '@/components/ThemeToggle';
import { useCompany } from '@/context/CompanyContext';
import { getCompanyParties } from '@/lib/api';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View as DefaultView, FlatList, StyleSheet } from 'react-native';

export default function OutstandingScreen() {
  const [receivables, setReceivables] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const { selected } = useCompany();
  const [loading, setLoading] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'card');

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    getCompanyParties(selected)
      .then((res: any) => {
        const rows = res && res.data ? res.data : [];
        const debtors = (rows || [])
          .filter((r: any) => {
            const grp = r.$_PrimaryGroup || r._PrimaryGroup || r.PrimaryGroup || '';
            return String(grp).toLowerCase().includes('sundry debtors');
          })
          .map((p: any) => {
            const addrRaw = p.$Address ?? p.Address ?? p.$ADDRESS;
            const address = Array.isArray(addrRaw) ? addrRaw.filter(Boolean).join(', ') : String(addrRaw || '');
            return {
              id: String(p.$Name || p.MailingName || p.Name || Math.random()),
              name: p.$Name || p.MailingName || p.Name || '',
              closingBalance: Number(p.$ClosingBalance ?? p.ClosingBalance ?? p.Balance ?? 0) || 0,
              openingBalance: Number(p.$OpeningBalance ?? p.OpeningBalance ?? 0) || 0,
              address,
              parent: p.$Parent || p.Parent || 'N/A',
            };
          });
        setReceivables(debtors);
      })
      .catch(() => setReceivables([]))
      .finally(() => setLoading(false));
  }, [selected]);

  const filtered = receivables.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'Outstanding',
        headerRight: () => (
          <DefaultView style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemeToggle />
            <CompanySelector />
          </DefaultView>
        ),
      }} />
      <TextInput
        style={[styles.searchBar, { color: textColor, borderColor: borderColor, backgroundColor: cardBg }]}
        placeholder="Search debtors..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
      />
      {loading ? (
        <DefaultView style={{ paddingHorizontal: 12 }}>
          {[...Array(6)].map((_, i) => <SkeletonCardItem key={i} />)}
        </DefaultView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item }) => (
            <DefaultView style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
              <DefaultView style={styles.cardHeader}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.debtorName, { color: textColor }]}>
                  {item.name}
                </Text>
                <Text style={[styles.outstandingAmount, { color: textColor }]}>
                  ₹{Math.abs(item.closingBalance || 0).toFixed(2)}
                </Text>
              </DefaultView>

              <DefaultView style={styles.cardDetails}>
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Address:</Text>
                  <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>
                    {item.address}
                  </Text>
                </DefaultView>

                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Parent:</Text>
                  <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>
                    {item.parent}
                  </Text>
                </DefaultView>

                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Opening Balance:</Text>
                  <Text style={[styles.value, { color: textColor }]}>
                    ₹{Math.abs(item.openingBalance || 0).toFixed(2)}
                  </Text>
                </DefaultView>
              </DefaultView>
            </DefaultView>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 8 },
  searchBar: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  card: {
    margin: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  debtorName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  outstandingAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    flex: 0.4,
  },
  value: {
    fontSize: 13,
    flex: 0.6,
    textAlign: 'right',
  },
});
