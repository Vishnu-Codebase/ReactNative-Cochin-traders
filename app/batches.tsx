import CompanySelector from '@/components/CompanySelector';
import { Text, TextInput, View, useThemeColor } from '@/components/Themed';
import { useCompany } from '@/context/CompanyContext';
import { addBatches, getBatches, getCompanyStocks } from '@/lib/api';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View as DefaultView, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const SIZES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function BatchesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState<any[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const { selected } = useCompany();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'card');
  const buttonPrimary = useThemeColor({}, 'buttonPrimary');

  // Fetch stocks
  useEffect(() => {
    if (!selected) return;
    getCompanyStocks(selected)
      .then((res: any) => {
        const items = res?.data || [];
        setStocks(items);
        setFilteredStocks(items);
      })
      .catch(() => {
        setStocks([]);
        setFilteredStocks([]);
      });
  }, [selected]);

  // Filter stocks based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStocks(stocks);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = stocks.filter((stock) =>
      (stock.$Name || stock.Name || '').toLowerCase().includes(query)
    );
    setFilteredStocks(filtered);
  }, [searchQuery, stocks]);

  const handleSelectStock = (stock: any) => {
    setSelectedStock(stock);
    setQuantities({});
    
    // Fetch existing batches
    if (selected) {
      getBatches(selected, stock.$Name || stock.Name || '')
        .then((res: any) => {
          if (res.found && res.batches && res.batches.length > 0) {
            const newQuantities: Record<number, string> = {};
            res.batches.forEach((batch: { size: number; quantity: number }) => {
              newQuantities[batch.size] = batch.quantity.toString();
            });
            setQuantities(newQuantities);
          }
        })
        .catch((error) => {
          console.warn('Error fetching batches:', error);
        });
    }
  };

  const handleSizeChange = (size: number, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [size]: value.replace(/[^0-9]/g, ''),
    }));
  };

  const handleSubmitBatch = async () => {
    if (!selected || !selectedStock) {
      alert('Please select a stock');
      return;
    }

    const batchData = SIZES.filter((size) => quantities[size] && parseInt(quantities[size]) > 0).map((size) => ({
      size,
      quantity: parseInt(quantities[size]),
    }));

    if (batchData.length === 0) {
      alert('Please enter at least one quantity');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        companyName: selected,
        stockItem: selectedStock.$Name || selectedStock.Name || '',
        batches: batchData,
      };
      await addBatches(payload);

      alert('Batch created successfully!');
      setSelectedStock(null);
      setQuantities({});
      setSearchQuery('');
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Failed to create batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Create Batch',
          headerRight: () => <CompanySelector />,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Stock */}
        <DefaultView style={styles.section}>
          <Text style={styles.sectionTitle}>Select Stock</Text>
          <TextInput
            style={[styles.searchInput, { color: textColor, borderColor, backgroundColor: cardBg }]}
            placeholder="Search stock..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={!selectedStock}
          />

          {!selectedStock && filteredStocks.length > 0 && (
            <FlatList
              data={filteredStocks}
              scrollEnabled={false}
              keyExtractor={(item, index) => item.$Name + index}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.stockItem, { backgroundColor: cardBg, borderColor }]}
                  onPress={() => handleSelectStock(item)}
                >
                  <Text style={[styles.stockName, { color: textColor }]}>
                    {item.$Name || item.Name || ''}
                  </Text>
                  <Text style={[styles.stockQty, { color: borderColor }]}>
                    Available: {item.$ClosingBalance || item.ClosingBalance || 0}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          {selectedStock && (
            <DefaultView style={[styles.selectedStockCard, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.selectedStockName, { color: textColor }]}>
                {selectedStock.$Name || selectedStock.Name || ''}
              </Text>
              <TouchableOpacity
                style={[styles.changeButton, { backgroundColor: buttonPrimary }]}
                onPress={() => setSelectedStock(null)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </DefaultView>
          )}
        </DefaultView>

        {/* Sizes */}
        {selectedStock && (
          <DefaultView style={styles.section}>
            <Text style={styles.sectionTitle}>Enter Quantities by Size</Text>

            <DefaultView style={styles.sizesGrid}>
              {SIZES.map((size) => (
                <DefaultView key={size} style={styles.sizeInputContainer}>
                  <Text style={[styles.sizeLabel, { color: borderColor }]}>Size {size}</Text>
                  <TextInput
                    style={[styles.sizeInput, { color: textColor, borderColor, backgroundColor: cardBg }]}
                    placeholder="0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={quantities[size] || ''}
                    onChangeText={(value) => handleSizeChange(size, value)}
                  />
                </DefaultView>
              ))}
            </DefaultView>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: buttonPrimary, opacity: loading ? 0.6 : 1 }]}
              onPress={handleSubmitBatch}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Creating...' : 'Create Batch'}</Text>
            </TouchableOpacity>
          </DefaultView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 8 },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  section: { marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  searchInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  stockItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockName: { fontSize: 14, fontWeight: '500', flex: 1 },
  stockQty: { fontSize: 12 },
  selectedStockCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedStockName: { fontSize: 15, fontWeight: '600' },
  changeButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  changeButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sizeInputContainer: {
    width: '48%',
    marginBottom: 16,
  },
  sizeLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  sizeInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
