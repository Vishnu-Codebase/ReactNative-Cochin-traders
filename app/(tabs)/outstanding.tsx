import ReceivableList from '@/components/outstanding/ReceivableList';
import { TextInput, View } from '@/components/Themed';
import { getCompanyParties } from '@/lib/api';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useCompany } from '../../context/CompanyContext';

export default function OutstandingScreen() {
  const [receivables, setReceivables] = useState<{ id: string; shop: string; amount: number; address?: string; parent?: string }[]>([]);
  const [query, setQuery] = useState('');
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
          .map((p: any) => {
            const addrRaw = p.$Address ?? p.Address ?? p.$ADDRESS;
            const address = Array.isArray(addrRaw) ? addrRaw.filter(Boolean).join(', ') : String(addrRaw || '');
            return {
              id: String(p.$Name || p.MailingName || p.Name || Math.random()),
              shop: p.$Name || p.MailingName || p.Name || '',
              amount: Number(p.$ClosingBalance ?? p.ClosingBalance ?? p.Balance ?? 0) || 0,
              address,
              parent: p.$Parent || p.Parent || '',
            };
          });
        setReceivables(debtors);
      })
      .catch(() => setReceivables([]));
  }, [selected]);

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="Search debtors" value={query} onChangeText={setQuery} />
      <ReceivableList items={receivables.filter((r) => r.shop.toLowerCase().includes(query.toLowerCase()))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  search: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 12, marginBottom: 10 },
  listItem: { },
});
