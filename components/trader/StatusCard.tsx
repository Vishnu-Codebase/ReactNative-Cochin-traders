import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';

type Props = {
  status: 'off' | 'on';
  time: string;
  coords: { lat?: number; lng?: number } | null;
  locationName?: string | null;
};

export default memo(function StatusCard({ status, time, coords, locationName }: Props) {
  const locText = locationName || (coords?.lat ? `${coords.lat.toFixed(5)}, ${coords.lng?.toFixed(5)}` : '-');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'tabIconDefault');

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
      <View style={styles.row}><Text>On Duty</Text><Text>{status === 'on' ? 'Yes' : 'No'}</Text></View>
      <View style={styles.row}><Text>Punch Time</Text><Text>{time || '-'}</Text></View>
      <View style={styles.row}><Text>Location</Text><Text>{locText}</Text></View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  row: { marginVertical: 4, flexDirection: 'row', justifyContent: 'space-between' },
});
