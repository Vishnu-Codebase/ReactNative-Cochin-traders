import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationSubscription } from 'expo-location';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Geocoder from 'react-native-geocoder';
import PunchCard from '../../components/trader/PunchCard';
import ShopInput from '../../components/trader/ShopInput';
import { useCompany } from '../../context/CompanyContext';
import { getCompanyParties, postTraderActivity } from '../../lib/api';
import { getEmployeeId, getEmployeeName } from '../../lib/auth';

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
      const id = await getEmployeeId();
      if (!isMounted) return;
      setEmpId(id || null);
      
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted || permissionStatus !== 'granted') return;
      
      const updateLocation = async (lat: number, lng: number) => {
        if (!isMounted) return;
        setCoords({ lat, lng });
        
        // Initial fallback
        setLocationName('Fetching address...');
        
        try {
          let addressName: string | null = null;
          
          // 1. Try react-native-geocoder (Google/Native wrapper)
          if (isMounted) {
            try {
              const res = await Geocoder.geocodePosition({ lat, lng }, { language: 'en' });
              if (res && res.length > 0) {
                 const r = res[0];
                 // Construct address from Name, Area, City (Skipping Street/Road)
                 const parts = [
                   r.feature,
                   r.subLocality, // Area/Neighbourhood (e.g. Ezhur)
                   r.locality     // City/Town (e.g. Tirur)
                 ].filter((part): part is string => !!part && part.trim().length > 0);
                 
                 const uniqueParts = [...new Set(parts)];
                 if (uniqueParts.length > 0) {
                   addressName = uniqueParts.join(', ');
                 }
              }
            } catch (rnErr) {
               console.warn('react-native-geocoder failed:', rnErr);
            }
          }

          // 2. Fallback to OpenStreetMap (Nominatim) if Step 1 failed
          if (!addressName && isMounted) {
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`, {
                headers: {
                  'User-Agent': 'CochinTradersApp/1.0'
                }
              });
              const data = await response.json();
              if (data && data.address) {
                const addr = data.address;
                
                // Strategy 1: Smart Parsing of display_name (Most Robust)
                // display_name is usually "Name, Street, Area, City, District, State, Postcode, Country"
                if (data.display_name) {
                  const blockedValues = new Set([
                    addr.country, 
                    addr.postcode, 
                    addr.state, 
                    addr.region, 
                    addr.state_district, 
                    addr.country_code,
                    // Block road names as requested
                    addr.road,
                    addr.street,
                    addr.path,
                    addr.residential
                  ].filter(Boolean).map(v => String(v).toLowerCase().trim()));

                  const allParts = data.display_name.split(',').map((p: string) => p.trim());
                  
                  // Filter out unwanted parts (Country, State, Postcode, Roads etc.)
                  const validParts = allParts.filter((p: string) => {
                    const lower = p.toLowerCase();
                    return !blockedValues.has(lower) && !/^\d{5,7}$/.test(p); // Basic postcode regex check
                  });

                  // Take the first 3 valid components (usually Name, Area, City)
                  const finalParts = validParts.slice(0, 3);
                  if (finalParts.length > 0) {
                    addressName = finalParts.join(', ');
                  }
                }

                // Strategy 2: Granular Fields (Fallback if Strategy 1 produced nothing)
                if (!addressName) {
                   const namePart = addr.amenity || addr.shop || addr.building || addr.office || addr.leisure || addr.tourism || addr.name || addr.house_number;
                   // const streetPart = addr.road || addr.street ... (Skipped)
                   const areaPart = addr.suburb || addr.neighbourhood || addr.residential || addr.hamlet;
                   const cityPart = addr.city || addr.town || addr.village || addr.municipality || addr.city_district;

                   const parts = [namePart, areaPart, cityPart].filter((part): part is string => !!part && part.trim().length > 0);
                   const uniqueParts = [...new Set(parts)];
                   if (uniqueParts.length > 0) {
                     addressName = uniqueParts.join(', ');
                   }
                }
              }
            } catch (osmErr) {
              console.warn('OSM geocoding failed:', osmErr);
            }
          }

          // 3. Fallback to Native Geocoder (Expo Location) if OSM failed
          if (!addressName && isMounted) {
            try {
              const address = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
              if (isMounted && address && address.length > 0) {
                const a = address[0];
                const parts = [
                  a.name !== a.street ? a.name : null,
                  a.street,
                  a.city || a.subregion // 'subregion' often contains city/town in some locales
                ].filter((part): part is string => !!part && part.trim().length > 0);
                
                const uniqueParts = [...new Set(parts)];
                if (uniqueParts.length > 0) {
                  addressName = uniqueParts.join(', ');
                }
              }
            } catch (nativeErr) {
              console.warn('Native geocoding failed as well:', nativeErr);
            }
          }

          if (isMounted) {
            if (addressName) {
              setLocationName(addressName);
            } else {
              // If all methods failed, show a friendly message instead of coordinates
              setLocationName('Address Unavailable');
            }
          }
        } catch (e) {
          console.warn('All geocoding attempts failed:', e);
          if (isMounted) setLocationName('Address Unavailable');
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

  useEffect(() => {
    getEmployeeName().then((name) => {
      employeeNameRef.current = name || undefined;
    });
  }, []);

  const employeeNameRef = useRef<string | undefined>(undefined);

  const toggleWithName = useCallback(async () => {
    const next = status === 'on' ? 'off' : 'on';
    if (next === 'on' && !employeeNameRef.current) {
      await AsyncStorage.setItem('force_splash', '1');
      return;
    }
    setStatus(next);
    if (next === 'on') setTime(new Date().toLocaleTimeString());
    if (next === 'on') setDate(new Date().toLocaleDateString());
    const type = next === 'on' ? 'punch_in' : 'punch_out';
    const position = coords ? { lat: coords.lat, lng: coords.lng } : undefined;
    const now = new Date();
    const payload: { type: string; shopName: string; amount: number; empId?: string; location?: { lat: number; lng: number }; employeeName?: string; place?: string; date?: string; time?: string; companyName?: string } = {
      type,
      shopName,
      amount: Number(amount || 0) || 0,
      empId: empId || undefined,
      employeeName: employeeNameRef.current,
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
      <PunchCard status={status} time={status === 'on' ? time : currentDate.toLocaleTimeString()} date={status === 'on' ? date : currentDate.toLocaleDateString()} coords={coords} locationName={locationName} onToggle={toggleWithName}>
        <View style={styles.inputWrap}>
          <ShopInput value={shopName} onChange={(v) => { setShopName(v); setShowParties(true); }} showClear={showParties || !!shopName} onClear={() => { setShopName(''); setShowParties(false); }} />
          {showParties && parties.length > 0 ? (
            <View style={styles.suggestions}>
              <FlatList
                data={parties.filter(p => p.name.toLowerCase().includes(shopName.toLowerCase())).slice(0,5)}
                keyExtractor={(i) => i.name}
                renderItem={({ item }) => (
                  <Pressable onPress={() => { setShopName(item.name); setAmount(String(Math.abs(item.closingBalance))); setShowParties(false); }} style={styles.suggestionItem}>
                    <Text numberOfLines={1}>{item.name}</Text>
                  </Pressable>
                )}
              />
            </View>
          ) : null}
        </View>
        <TextInput placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} style={styles.input} />
      </PunchCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  inputWrap: { position: 'relative', marginBottom: 8, zIndex: 1 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 8 },
  suggestions: { position: 'absolute', top: 44, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, maxHeight: 200, zIndex: 1, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  suggestionItem: { paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
