import React, { useEffect, useState, useCallback } from 'react';
import { View as DefaultView, Dimensions, FlatList, Modal, Pressable, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCompany } from '@/context/CompanyContext';
import { Text, useThemeColor, View } from '@/components/Themed';
import { getCompanyNames } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';

export default function CompanySelector() {
  const { selectedCompany, setSelectedCompany } = useCompany();
  const [companies, setCompanies] = useState<Array<{ companyName: string; lastSyncedAt: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const SCREEN_WIDTH = Dimensions.get('window').width;

  const contentBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryButton = useThemeColor({}, 'buttonPrimary');

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCompanyNames();
      const list = response && response.success && Array.isArray(response.data) ? response.data : [];
      setCompanies(list);
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_COMPANIES, JSON.stringify(list));
      } catch {}
    } catch (err) {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleRefresh = async () => {
    await fetchCompanies();
  };

  const listData = Array.isArray(companies)
    ? companies.map((c: any) =>
        typeof c === 'string' ? { companyName: String(c), lastSyncedAt: null } : c,
      )
    : [];

  const displayText = selectedCompany || 'Select Company';

  return (
    <React.Fragment>
      <TouchableOpacity
        onPress={() => {
          console.log('Opening company selector');
          setOpen(true);
        }}
        style={[styles.button, { maxWidth: SCREEN_WIDTH * 0.3, backgroundColor: primaryButton }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.text}>
            {displayText}
          </Text>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <DefaultView style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: contentBg }]}>
            <DefaultView style={styles.headerRow}>
              <Text style={styles.modalTitle}>Companies</Text>
              <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                <Text style={{ color: primaryButton, fontSize: 18 }}>⭮</Text>
              </TouchableOpacity>
            </DefaultView>

            {loading ? (
              <DefaultView style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={primaryButton} />
                <Text style={{ marginTop: 10, color: textColor }}>Loading companies...</Text>
              </DefaultView>
            ) : (
              <FlatList
                data={listData}
                keyExtractor={(item, index) => `${item.companyName}-${index}`}
                style={styles.list}
                ListEmptyComponent={
                  <DefaultView style={{ paddingHorizontal: 12, paddingVertical: 20, alignItems: 'center' }}>
                    <Text style={{ color: textColor, marginBottom: 10 }}>No companies found</Text>
                    <TouchableOpacity onPress={handleRefresh} style={{ padding: 10 }}>
                      <Text style={{ color: primaryButton }}>Tap to refresh</Text>
                    </TouchableOpacity>
                  </DefaultView>
                }
                renderItem={({ item }) => {
                  const isSelected = selectedCompany === item.companyName;
                  console.log(`Rendering ${item.companyName}, isSelected: ${isSelected}`);
                  
                  return (
                    <Pressable
                      onPress={async () => {
                        console.log('Company selected:', item.companyName);
                        await setSelectedCompany(item.companyName);
                        setOpen(false);
                      }}
                      style={[
                        styles.item,
                        isSelected ? { backgroundColor: 'rgba(37,99,235,0.15)', borderLeftWidth: 3, borderLeftColor: primaryButton } : null,
                      ]}
                    >
                      <DefaultView style={styles.itemRow}>
                        <DefaultView style={{ flex: 1 }}>
                          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.itemText, isSelected && { fontWeight: '700', color: primaryButton }]}>
                            {item.companyName}
                          </Text>
                          {item.lastSyncedAt && (
                            <Text style={[styles.syncText, { color: textColor, opacity: 0.6 }]}>
                              Last synced: {new Date(item.lastSyncedAt).toLocaleDateString()}
                            </Text>
                          )}
                        </DefaultView>
                        {isSelected && (
                          <Text style={{ color: primaryButton, fontSize: 18, marginLeft: 8 }}>✓</Text>
                        )}
                      </DefaultView>
                    </Pressable>
                  );
                }}
              />
            )}

            <Pressable onPress={() => setOpen(false)} style={[styles.closeButton, { backgroundColor: primaryButton }]}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </DefaultView>
      </Modal>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  button: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 6, 
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 100,
    marginHorizontal: 8
  },
  text: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 12 
  },
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  modalContent: { 
    width: '90%', 
    maxWidth: 500,
    borderRadius: 10, 
    padding: 16,
    maxHeight: '80%',
  },
  headerRow: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8, 
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 8,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700' 
  },
  refreshButton: {
    padding: 4,
  },
  list: { 
    maxHeight: 400 
  },
  item: { 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    borderRadius: 6,
    marginVertical: 2,
  },
  itemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  itemText: { 
    fontSize: 15, 
    fontWeight: '500' 
  },
  syncText: {
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: { 
    marginTop: 12, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 6 
  },
  closeText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 14,
  },
});
