import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { useCompany } from '@/context/CompanyContext';
import { getCompanyLedgers, getCompanyParties, getCompanyStocks } from '@/lib/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function ModalScreen() {
  const router = useRouter();
  const { companies, selected } = useCompany();
  const [counts, setCounts] = useState({
    stocks: 0,
    ledgers: 0,
    parties: 0,
  });

  useEffect(() => {
    if (!selected) {
      setCounts({ stocks: 0, ledgers: 0, parties: 0 });
      return;
    }

    const fetchCounts = async () => {
      try {
        const [stocksRes, ledgersRes, partiesRes] = await Promise.all([
          getCompanyStocks(selected).catch(() => ({ data: [] })),
          getCompanyLedgers(selected).catch(() => ({ data: [] })),
          getCompanyParties(selected).catch(() => ({ data: [] })),
        ]);
        
        setCounts({
          stocks: stocksRes.data?.length || 0,
          ledgers: ledgersRes.data?.length || 0,
          parties: partiesRes.data?.length || 0,
        });
      } catch (e) {
        console.error(e);
      }
    };

    fetchCounts();
  }, [selected]);

  const cards = [
    { title: 'Total Stocks', count: counts.stocks, route: '/(tabs)/stocks' },
    { title: 'Total Ledgers', count: counts.ledgers, route: '/ledgers' },
    { title: 'Total Parties', count: counts.parties, route: '/parties' },
  ];

  const cardBg = useThemeColor({}, 'card'); 
  const cardTitleColor = useThemeColor({}, 'text'); 
  const subColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data Overview</Text>
      <Text style={[styles.subtitle, { color: subColor }]}>Active Company: {selected || 'None'}</Text>
      
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.card, { backgroundColor: cardBg }]} 
            onPress={() => card.route && router.push(card.route as any)}
            disabled={!card.route}
          >
            <Text style={styles.cardCount}>{card.count}</Text>
            <Text style={[styles.cardTitle, { color: cardTitleColor }]}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  card: {
    width: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
