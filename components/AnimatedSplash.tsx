import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { employeeSignIn } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type SplashState = 'splash' | 'signin' | 'done';

export default function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  
  const [state, setState] = useState<SplashState>('splash');
  const [employeeName, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const colors = Colors[theme];

  // Splash screen animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  // Check employee on mount and handle splash duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const init = async () => {
      try {
        const name = await AsyncStorage.getItem('employee_name');
        console.log('Employee name from storage:', name);
        if (name) {
          // Employee exists, stay on splash for 3 seconds then close
          timer = setTimeout(() => {
            onDone();
          }, 3000);
        } else {
          // No employee, show splash for 3 seconds then show signin
          timer = setTimeout(() => {
            setState('signin');
          }, 3000);
        }
      } catch (e) {
        console.error('Error checking employee:', e);
        // On error, show signin
        timer = setTimeout(() => {
          setState('signin');
        }, 3000);
      }
    };
    init();
    return () => clearTimeout(timer);
  }, [onDone]);

  const handleSignIn = async () => {
    if (!employeeName.trim()) {
      setError('Please enter employee name');
      return;
    }
    if (!phone.replace(/\D+/g, '').match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const phoneClean = phone.replace(/\D+/g, '');
      const resp = await employeeSignIn(phoneClean);
      const token = resp?.token || resp?.employee?.token || resp?.id || phoneClean;
      const empName = resp?.employee?.name || employeeName;
      
      // Save employee data to localStorage
      await AsyncStorage.setItem('employee_phone', phoneClean);
      await AsyncStorage.setItem('employee_token', String(token));
      await AsyncStorage.setItem('employee_name', String(empName));
      
      setState('done');
      setTimeout(() => {
        onDone();
      }, 500);
    } catch (e) {
      setError('Invalid phone number or sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  if (state === 'splash') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} pointerEvents="auto">
        <LinearGradient
          colors={theme === 'dark' ? ['#030712', '#1f2937', '#030712'] : ['#ffffff', '#f3f4f6', '#e5e7eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
          <Image
            source={require('../assets/images/splash-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.companyName, { color: colors.text, fontStyle: 'italic' }]}>
            Cochin Traders
          </Text>
        </Animated.View>
      </View>
    );
  }

  if (state === 'signin') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents="auto"
      >
        <LinearGradient
          colors={theme === 'dark' ? ['#030712', '#1f2937', '#030712'] : ['#ffffff', '#f3f4f6', '#e5e7eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.signinContent}>
          <Animated.View style={[styles.signinBox, { opacity, transform: [{ scale }] }]}>
            <Image
              source={require('../assets/images/splash-icon.png')}
              style={styles.signinLogo}
              resizeMode="contain"
            />
            <Text style={[styles.signinCompanyName, { color: colors.text, fontStyle: 'italic' }]}>
              Cochin Traders
            </Text>
            <Text style={[styles.signinSubtitle, { color: colors.tint }]}>
              Employee Sign In
            </Text>

            <TextInput
              style={[styles.input, { 
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card
              }]}
              placeholder="Employee Name"
              placeholderTextColor={colors.tabIconDefault}
              value={employeeName}
              onChangeText={setName}
              editable={!loading}
            />

            <TextInput
              style={[styles.input, { 
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card
              }]}
              placeholder="Phone Number"
              placeholderTextColor={colors.tabIconDefault}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={14}
              editable={!loading}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { 
                backgroundColor: colors.tint,
                opacity: loading ? 0.6 : 1
              }]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Signing In...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  companyName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  signinContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  signinBox: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  signinLogo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  signinCompanyName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  signinSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
