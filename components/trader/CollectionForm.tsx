import React, { memo } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';

type Props = {
  amount: string;
  onAmountChange: (v: string) => void;
  onSubmit: () => void;
};

export default memo(function CollectionForm({ amount, onAmountChange, onSubmit }: Props) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');

  return (
    <View>
      <Text style={styles.title}>Record Collection</Text>
      <TextInput 
        style={[styles.input, { color: textColor, borderColor: borderColor }]} 
        placeholder="Amount" 
        placeholderTextColor="#999"
        keyboardType="numeric" 
        value={amount} 
        onChangeText={onAmountChange} 
      />
      <Button title="Submit Collection" onPress={onSubmit} />
    </View>
  );
});

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, padding: 8, borderRadius: 6, marginBottom: 8 },
});
