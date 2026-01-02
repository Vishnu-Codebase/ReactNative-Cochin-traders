import { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, Image, StyleSheet, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { employeeSignIn } from '@/lib/api';
import { signIn, setEmployeeName, getEmployeeName } from '@/lib/auth';

export default function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const [done, setDone] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [readyForInput, setReadyForInput] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start(async () => {
      const name = await getEmployeeName();
      setTimeout(() => {
        setReadyForInput(true);
        if (!name) {
          setTimeout(() => setShowInput(true), 2000);
        }
      }, 0);
    });
  }, []);

  useEffect(() => {
    const fn = async () => {
      const p = phone.replace(/\D+/g, '');
      if (p.length === 10) {
        try {
          const resp = await employeeSignIn(p);
          const token = resp?.token || resp?.employee?.token || resp?.id || p;
          const empName = resp?.employee?.name || p;
          await AsyncStorage.setItem('employee_phone', p);
          await signIn(String(token));
          await setEmployeeName(String(empName));
          setMessage(`Welcome ${empName}`);
          setTimeout(() => { setDone(true); onDone(); }, 500);
        } catch (e) {
          setMessage('Phone number is incorrect');
        }
      } else {
        setMessage(null);
      }
    };
    fn();
  }, [phone]);

  return (
    <View style={styles.overlay}>
      {showInput && <BlurView intensity={50} style={StyleSheet.absoluteFill} />}
      <Animated.View style={[styles.box, { opacity, transform: [{ scale }] }] }>
        <Image source={require('../assets/images/splash-icon.png')} style={styles.logo} />
        <Text style={styles.title}>Cochin Traders</Text>
        {message && <View style={styles.toast}><Text style={styles.toastText}>{message}</Text></View>}
        {showInput && (
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={14}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  box: { alignItems: 'center' },
  logo: { width: 160, height: 160, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginTop: 16, minWidth: 240 },
  toast: { position: 'absolute', top: -60, backgroundColor: '#111827', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  toastText: { color: '#fff' },
});
