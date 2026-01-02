import React, { memo } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

type Props = {
  status: 'off' | 'on';
  time: string;
  date?: string;
  coords: { lat?: number; lng?: number } | null;
  locationName?: string | null;
  onToggle: () => void;
  children?: React.ReactNode;
};

export default memo(function PunchCard({ status, time, date, coords, locationName, onToggle, children }: Props) {
  const locText = locationName || (coords?.lat ? `${coords.lat.toFixed(5)}, ${coords.lng?.toFixed(5)}` : '-');
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Punch In</Text>
      {children}
      <View style={styles.row}><Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{status === 'on' ? 'Punch In Date' : 'Date'}</Text><Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{date || '-'}</Text></View>
      <View style={styles.row}><Text style={styles.time} numberOfLines={1} ellipsizeMode="tail">{status === 'on' ? 'Punch In Time' : 'Time'}</Text><Text style={styles.time} numberOfLines={1} ellipsizeMode="tail">{time || '-'}</Text></View>
      <View style={styles.row}><Text style={styles.location}>Place: </Text><Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">{locText}</Text></View>
      <Button title={status === 'on' ? 'Punch Out' : 'Punch In'} onPress={onToggle} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  row: { marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', position: 'relative', zIndex: 0 },
  date: { maxWidth: '45%', marginLeft: 5 },
  time: { maxWidth: '45%', marginLeft: 5 },
  location: { maxWidth: '75%' },
});
