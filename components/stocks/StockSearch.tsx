import React, { memo } from 'react';
import { StyleSheet, TextInput } from 'react-native';

type Props = { value: string; onChange: (v: string) => void };

export default memo(function StockSearch({ value, onChange }: Props) {
  return <TextInput style={styles.input} placeholder="Search items" value={value} onChangeText={onChange} />;
});

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 8 },
});
