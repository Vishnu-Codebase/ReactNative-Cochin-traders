import React, { memo } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  amount: string;
  onAmountChange: (v: string) => void;
  onSubmit: () => void;
};

export default memo(function CollectionForm({ amount, onAmountChange, onSubmit }: Props) {
  return (
    <View>
      <Text style={styles.title}>Record Collection</Text>
      <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={onAmountChange} />
      <Button title="Submit Collection" onPress={onSubmit} />
    </View>
  );
});

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 8 },
});
