import { useThemeColor } from '@/components/Themed';
import React, { memo } from 'react';
import { StyleSheet, TextInput } from 'react-native';

type Props = { value: string; onChange: (v: string) => void };

export default memo(function StockSearch({ value, onChange }: Props) {
    const borderColor = useThemeColor({}, 'tabIconDefault'); 
    const textColor = useThemeColor({}, 'text');
    const clearBg = useThemeColor({}, 'card'); 
    const iconColor = useThemeColor({}, 'text');
  return <TextInput style={[styles.input, {color: textColor, borderColor: borderColor}]} placeholder="Search items" placeholderTextColor={useThemeColor({}, 'tabIconDefault')} value={value} onChangeText={onChange} />;
});

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 8, },
});
