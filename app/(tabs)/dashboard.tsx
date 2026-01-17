import { Text, TextInput, View, useThemeColor } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationSubscription } from 'expo-location';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet } from 'react-native';
import PunchCard from '../../components/trader/PunchCard';
import ShopInput from '../../components/trader/ShopInput';
import { useCompany } from '../../context/CompanyContext';
import { getCompanyParties, postTraderActivity } from '../../lib/api';

export default function DashboardScreen() {
  const [status, setStatus] = useState<'off' | 'on'>('off');
  const [shopName, setShopName] = useState('');
  const [amount, setAmount] = useState('');
  const [parties, setParties] = useState<{ name: string; closingBalance: number }[]>([]);
  const [showParties, setShowParties] = useState(false);
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [empId, setEmpId] = useState<string | null>(null);
  const { refresh, selected } = useCompany();

  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'tabIconDefault');

  useEffect(() => {
    if (!selected) return;
    getCompanyParties(selected).then((res: any) => {
      const rows = res && res.data ? res.data : [];
      const debtors = (rows || []).filter((r: any) => {
        const grp = r.$_PrimaryGroup || r._PrimaryGroup || r.PrimaryGroup || '';
        return String(grp).toLowerCase().includes('sundry debtors');
      }).map((p: any) => ({
        name: String(p.$Name || p.MailingName || p.Name || ''),
        closingBalance: Number(p.$ClosingBalance ?? p.ClosingBalance ?? p.Balance ?? 0) || 0,
      }));
      setParties(debtors.filter((d: any) => !!d.name));
    }).catch(() => setParties([]));
  }, [selected]);

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let subscription: LocationSubscription | null = null;
    let isMounted = true;

    (async () => {
      // ensure company list refreshed when dashboard opens
      try { await refresh(); } catch (e) {}
      const id = await AsyncStorage.getItem('employee_phone');
      if (!isMounted) return;
      setEmpId(id || null);
      
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted || permissionStatus !== 'granted') return;
      
      const getAddressFromCoords = async (lat: number, lon: number) => {
        try {
          const isWeb = Platform.OS === 'web';

          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await response.json();

          console.log('Address:', data.address.village);
          const locationName = `${data.address.village}, ${data.address.state_district}`;
          return locationName;
        } catch (error) {
          console.error('Error fetching address:', error);
          return null;
        }
      };

      const updateLocation = async (lat: number, lng: number) => {
        if (!isMounted) return;
        setCoords({ lat, lng });

        // Initial fallback
        setLocationName('Fetching address...');

        try {
          let addressName: string | null = null;

          // Try Nominatim or proxy via helper
          try {
            addressName = await getAddressFromCoords(lat, lng);
          } catch (osmErr) {
            console.warn('Nominatim/proxy reverse geocode failed:', osmErr);
          }

          // Fallback to Expo reverse geocode if no result
          if (!addressName && isMounted) {
            try {
              const address = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
              if (isMounted && address && address.length > 0) {
                const a = address[0];
                const parts = [a.name !== a.street ? a.name : null, a.street, a.city || a.subregion].filter((p): p is string => !!p && p.trim().length > 0);
                const uniqueParts = [...new Set(parts)];
                if (uniqueParts.length > 0) addressName = uniqueParts.join(', ');
              }
            } catch (nativeErr) {
              console.warn('Expo reverse geocode failed:', nativeErr);
            }
          }

          if (isMounted) {
            if (addressName) setLocationName(addressName);
            else setLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
        } catch (e) {
          console.warn('All geocoding attempts failed:', e);
          if (isMounted) setLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      };

      try {
        const loc = await Location.getCurrentPositionAsync({});
        if (isMounted) updateLocation(loc.coords.latitude, loc.coords.longitude);
      } catch (e) {
        console.warn('Error getting initial location:', e);
      }
      
      if (!isMounted) return;

      const sub = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 10 }, (l) => {
        updateLocation(l.coords.latitude, l.coords.longitude);
      });
      
      if (!isMounted) {
        sub.remove();
      } else {
        subscription = sub;
      }
    })();

    return () => {
      isMounted = false;
      if (subscription) {
        try {
          subscription.remove();
        } catch (e) {
          console.warn('Error removing location subscription:', e);
        }
      }
    };
  }, []);

  const employeeNameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem('employee_name').then((name) => {
      employeeNameRef.current = name || undefined;
    });
  }, []);

  const toggleWithName = useCallback(async () => {
    const next = status === 'on' ? 'off' : 'on';
    // Always get the latest employee name from storage when the user toggles punch
    const storedEmployeeName = await AsyncStorage.getItem('employee_name');
    if (next === 'on' && !storedEmployeeName) {
      await AsyncStorage.setItem('force_splash', '1');
      return;
    }
    setStatus(next);
    if (next === 'on') setTime(new Date().toLocaleTimeString());
    if (next === 'on') setDate(new Date().toLocaleDateString());
    const type = next === 'on' ? 'punch_in' : 'punch_out';
    const position = coords ? { lat: coords.lat, lng: coords.lng } : undefined;
    const now = new Date();
    const payload: { 
      type: string; 
      shopName: string; 
      amount: number; 
      empId?: string; 
      location?: { lat: number; lng: number }; 
      employeeName?: string; 
      place?: string; 
      date?: string; 
      time?: string; 
      companyName?: string } = {
      type,
      shopName,
      amount: Number(amount || 0) || 0,
      empId: empId || undefined,
      employeeName: storedEmployeeName || undefined,
      time: next === 'on' ? now.toLocaleTimeString() : undefined,
      date: next === 'on' ? now.toLocaleDateString() : undefined,
      place: next === 'on' ? (locationName || undefined) : undefined,
      companyName: selected || undefined,
    };
    if (position) payload.location = position;
    postTraderActivity(payload).catch(() => {});
    if (next === 'on') {
      const place = locationName || undefined;
      const info = {
        shopName,
        amount: Number(amount || 0) || 0,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        place,
        employeeName: employeeNameRef.current,
      };
      try { await AsyncStorage.setItem('last_punch', JSON.stringify(info)); } catch (e) {}
    }
  }, [status, coords, empId, shopName, amount, selected]);

  return (
    <View style={styles.container}>
      <PunchCard status={status} time={status === 'on' ? time : currentDate.toLocaleTimeString()} date={status === 'on' ? date : currentDate.toLocaleDateString()} coords={coords} locationName={locationName} companyName={selected} onToggle={toggleWithName}>
        <View style={styles.inputWrap}>
          <ShopInput value={shopName} onChange={(v) => { setShopName(v); setShowParties(true); }} showClear={showParties || !!shopName} onClear={() => { setShopName(''); setShowParties(false); }} />
          {showParties && parties.length > 0 ? (
            <View style={[styles.suggestions, { backgroundColor: cardBg, borderColor: borderColor }]}>
              <FlatList
                data={parties.filter(p => p.name.toLowerCase().includes(shopName.toLowerCase())).slice(0,5)}
                keyExtractor={(i) => i.name}
                renderItem={({ item }) => (
                  <Pressable onPress={() => { setShopName(item.name); setAmount(String(Math.abs(item.closingBalance))); setShowParties(false); }} style={[styles.suggestionItem, { borderBottomColor: borderColor }]}>
                    <Text numberOfLines={1}>{item.name}</Text>
                  </Pressable>
                )}
              />
            </View>
          ) : null}
        </View>
        <TextInput placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} style={[styles.input, { borderColor: borderColor }]} />
      </PunchCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  inputWrap: { position: 'relative', marginBottom: 8, zIndex: 1, backgroundColor: 'transparent' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 8 },
  suggestions: { position: 'absolute', top: 44, left: 0, right: 0, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, maxHeight: 200, zIndex: 1, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  suggestionItem: { paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
