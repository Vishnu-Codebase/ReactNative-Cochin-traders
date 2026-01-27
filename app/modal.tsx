import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

import ErrorModal from '@/components/ErrorModal';
import { SkeletonCountCard } from '@/components/Skeleton';
import { Text, View, useThemeColor } from '@/components/Themed';
import { useCompany } from '@/context/CompanyContext';
import { getCompanyLedgers, getCompanyParties, getCompanyStocks } from '@/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
// LinearGradient

export default function ModalScreen() {
  const router = useRouter();
  const { companies, selected } = useCompany();
  const [counts, setCounts] = useState({
    stocks: 0,
    ledgers: 0,
    parties: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const fetchCounts = async () => {
    if (!selected) {
      setCounts({ stocks: 0, ledgers: 0, parties: 0 });
      return;
    }
    try {
      setLoading(true);
      const [stocksRes, ledgersRes, partiesRes] = await Promise.all([
        getCompanyStocks(selected).catch((e) => { const code = (e as any)?.status; if (typeof code === 'number') setErrorCode(code); return { data: [] }; }),
        getCompanyLedgers(selected).catch((e) => { const code = (e as any)?.status; if (typeof code === 'number') setErrorCode(code); return { data: [] }; }),
        getCompanyParties(selected).catch((e) => { const code = (e as any)?.status; if (typeof code === 'number') setErrorCode(code); return { data: [] }; }),
      ]);
      setCounts({
        stocks: stocksRes.data?.length || 0,
        ledgers: ledgersRes.data?.length || 0,
        parties: partiesRes.data?.length || 0,
      });
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [selected]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchCounts();
    });
    return () => { sub.remove(); };
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
      <ErrorModal visible={!!errorCode} status={errorCode ?? undefined} onClose={() => setErrorCode(null)} onRetry={() => { setErrorCode(null); const fetchCounts = async () => { try { setLoading(true); const [stocksRes, ledgersRes, partiesRes] = await Promise.all([ getCompanyStocks(selected as string).catch((e) => { const code = (e as any)?.status; if (typeof code === 'number') setErrorCode(code); return { data: [] }; }), getCompanyLedgers(selected as string).catch((e) => { const code = (e as any)?.status; if (typeof code === 'number') setErrorCode(code); return { data: [] }; }), getCompanyParties(selected as string).catch((e) => { const code = (e as any)?.status; if (typeof code === 'number') setErrorCode(code); return { data: [] }; }), ]); setCounts({ stocks: stocksRes.data?.length || 0, ledgers: ledgersRes.data?.length || 0, parties: partiesRes.data?.length || 0, }); } catch (e) { } finally { setLoading(false); } }; fetchCounts(); }} />
      <Text style={styles.title}>Data Overview</Text>
      <Text style={[styles.subtitle, { color: subColor }]}>Active Company: {selected || 'None'}</Text>
      
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.grid}>
        {loading ? (
          <>
            <SkeletonCountCard />
            <SkeletonCountCard />
            <SkeletonCountCard />
          </>
        ) : (
          cards.map((card, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.card, { backgroundColor: cardBg }]} 
              onPress={() => card.route && router.push(card.route as any)}
              disabled={!card.route}
            >
              <Text style={styles.cardCount}>{card.count}</Text>
              <Text style={[styles.cardTitle, { color: cardTitleColor }]}>{card.title}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <TouchableOpacity 
        style={styles.batchCardContainer}
        onPress={() => router.push('/batches')}
      >
        <LinearGradient
          colors={['#780206', '#061161']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.batchCard}
        >
          <Text style={styles.batchCardIcon}>📦</Text>
          <Text style={styles.batchCardTitle}>Create Batch</Text>
          <Text style={styles.batchCardSubtitle}>Add new stock batch</Text>
        </LinearGradient>
      </TouchableOpacity>

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
  batchCardContainer: {
    width: '90%',
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  batchCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  batchCardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  batchCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  batchCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
