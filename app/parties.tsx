import CompanySelector from '@/components/CompanySelector';
import ErrorModal from '@/components/ErrorModal';
import { SkeletonLine } from '@/components/Skeleton';
import { Text, View, useThemeColor } from '@/components/Themed';
import ThemeToggle from '@/components/ThemeToggle';
import { useCompany } from '@/context/CompanyContext';
import { getCompanyParties } from '@/lib/api';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View as DefaultView, FlatList, StyleSheet, TextInput, AppState } from 'react-native';

export default function PartiesScreen() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const { selected } = useCompany();
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const fetchParties = async () => {
    if (!selected) return;
    setLoading(true);
    getCompanyParties(selected).then((res: any) => {
      const rows = res && res.data ? res.data : [];
      const filteredRows = rows.filter((p: any) => {
        const nm = String(p.$Name || p.MailingName || p.Name || '').trim().toLowerCase();
        return nm && !nm.startsWith('_');
      });
      const mapped = filteredRows.map((p: any) => {
        const addrRaw = p.$Address ?? p.Address ?? p.$ADDRESS;
        const address = Array.isArray(addrRaw) ? addrRaw.filter(Boolean).join(', ') : String(addrRaw || '');
        return {
          id: String(p.$Name || p.MailingName || p.Name || Math.random()),
          name: p.$Name || p.MailingName || p.Name || '',
          mailingName: p.MailingName || p.$MailingName || '',
          closingBalance: Number(p.$ClosingBalance ?? p.ClosingBalance ?? p.Balance ?? 0) || 0,
          openingBalance: Number(p.$OpeningBalance ?? p.OpeningBalance ?? 0) || 0,
          address,
          parent: p.$Parent || p.Parent || 'N/A',
          primaryGroup: p.$_PrimaryGroup || p._PrimaryGroup || p.PrimaryGroup || '',
          email: p.$Email || p.Email || '',
          phone: p.$Phone || p.Phone || '',
          contactPerson: p.$ContactPerson || p.ContactPerson || '',
          companyName: p.CompanyName || '',
        };
      });
      setItems(mapped);
    }).catch((err) => {
      const msg = String(err?.message || err);
      const code = typeof (err as any)?.status === 'number' ? (err as any).status : (msg.match(/(\d{3})/) ? Number(msg.match(/(\d{3})/)![1]) : null);
      if (code) setErrorCode(code);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchParties();
  }, [selected]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchParties();
    });
    return () => { sub.remove(); };
  }, [selected]);

  const filtered = items.filter((i) => (i.name || '').toLowerCase().includes(query.toLowerCase()));

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'card');

  return (
    <View style={styles.container}>
      <ErrorModal visible={!!errorCode} status={errorCode ?? undefined} onClose={() => setErrorCode(null)} onRetry={() => { setErrorCode(null); setLoading(true); getCompanyParties(selected as string).then((res: any) => { const rows = res && res.data ? res.data : []; const filteredRows = rows.filter((p: any) => { const nm = String(p.$Name || p.MailingName || p.Name || '').trim().toLowerCase(); return nm && !nm.startsWith('_'); }); const mapped = filteredRows.map((p: any) => { const addrRaw = p.$Address ?? p.Address ?? p.$ADDRESS; const address = Array.isArray(addrRaw) ? addrRaw.filter(Boolean).join(', ') : String(addrRaw || ''); return { id: String(p.$Name || p.MailingName || p.Name || Math.random()), name: p.$Name || p.MailingName || p.Name || '', mailingName: p.MailingName || p.$MailingName || '', closingBalance: Number(p.$ClosingBalance ?? p.ClosingBalance ?? p.Balance ?? 0) || 0, openingBalance: Number(p.$OpeningBalance ?? p.OpeningBalance ?? 0) || 0, address, parent: p.$Parent || p.Parent || 'N/A', primaryGroup: p.$_PrimaryGroup || p._PrimaryGroup || p.PrimaryGroup || '', email: p.$Email || p.Email || '', phone: p.$Phone || p.Phone || '', contactPerson: p.$ContactPerson || p.ContactPerson || '', companyName: p.CompanyName || '', }; }); setItems(mapped); }).catch(() => {}).finally(() => setLoading(false)); }} />
      <Stack.Screen options={{ 
        title: 'Parties',
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
            <DefaultView key={i} style={[styles.skeletonItem, { borderBottomColor: borderColor }]}>
              <SkeletonLine width="70%" height={14} />
            </DefaultView>
          ))}
        </DefaultView>
      )}
      <TextInput
        style={[styles.searchBar, { color: textColor, borderColor: borderColor }]}
        placeholder="Search parties..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => (item.id || item.name || index) + index}
        renderItem={({ item }) => (
          <DefaultView style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
            <DefaultView style={styles.cardHeader}>
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.debtorName, { color: textColor }]}>{item.name}</Text>
              <Text style={[styles.amount, { color: textColor }]}>₹{Math.abs(item.closingBalance || 0).toFixed(2)}</Text>
            </DefaultView>
            <DefaultView style={styles.cardDetails}>
              {item.address ? (
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Address:</Text>
                  <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>{item.address}</Text>
                </DefaultView>
              ) : null}
              <DefaultView style={styles.detailRow}>
                <Text style={[styles.label, { color: borderColor }]}>Parent:</Text>
                <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>{item.parent || 'N/A'}</Text>
              </DefaultView>
              {item.primaryGroup ? (
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Primary Group:</Text>
                  <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>{item.primaryGroup}</Text>
                </DefaultView>
              ) : null}
              <DefaultView style={styles.detailRow}>
                <Text style={[styles.label, { color: borderColor }]}>Opening Balance:</Text>
                <Text style={[styles.value, { color: textColor }]}>₹{Math.abs(item.openingBalance || 0).toFixed(2)}</Text>
              </DefaultView>
              {item.mailingName ? (
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Mailing Name:</Text>
                  <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>{item.mailingName}</Text>
                </DefaultView>
              ) : null}
              {item.email ? (
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Email:</Text>
                  <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>{item.email}</Text>
                </DefaultView>
              ) : null}
              {item.phone ? (
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Phone:</Text>
                  <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>{item.phone}</Text>
                </DefaultView>
              ) : null}
              {item.contactPerson ? (
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Contact:</Text>
                  <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>{item.contactPerson}</Text>
                </DefaultView>
              ) : null}
              {item.companyName ? (
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>Company:</Text>
                  <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>{item.companyName}</Text>
                </DefaultView>
              ) : null}
            </DefaultView>
          </DefaultView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 8 },
  searchBar: { margin: 16, padding: 12, borderWidth: 1, borderRadius: 8, fontSize: 16 },
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
  amount: { fontSize: 16, fontWeight: '700' },
  cardDetails: { gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '500', flex: 0.4 },
  value: { fontSize: 13, flex: 0.6, textAlign: 'right' },
  skeletonItem: { padding: 16, borderBottomWidth: 1 },
});
