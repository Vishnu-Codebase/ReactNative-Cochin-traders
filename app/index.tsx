import { Text, useThemeColor, View } from '@/components/Themed';
import { getCompanyNames } from '@/lib/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function Index() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getCompanyNames()
      .then(() => {
        if (mounted) router.replace('/(tabs)/dashboard');
      })
      .catch((e) => {
        if (mounted) setError(e?.message || 'Error loading company names');
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 16,
      color: textColor,
    },
    errorText: {
      fontSize: 14,
      color: textColor,
    },
    errorContainer: {
      padding: 10,
      borderRadius: 5,
      backgroundColor: 'rgba(255, 0, 0, 0.5)',
    },
  });

  if (!error) {
    return <View style={styles.container}><Text style={styles.text}>Loading...</Text></View>;
  }

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        Error loading company names. Please check Server(Cochin Connect) is running. Error Still there Please contact developer.
      </Text>
    </View>
  );
}
