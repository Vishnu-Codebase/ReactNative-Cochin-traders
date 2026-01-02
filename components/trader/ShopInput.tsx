import React, { memo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = { value: string; onChange: (v: string) => void; onClear?: () => void; showClear?: boolean };

export default memo(function ShopInput({ value, onChange, onClear, showClear }: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput style={[styles.input, showClear ? { paddingRight: 36 } : null]} placeholder="Enter shop name" value={value} onChangeText={onChange} />
      {showClear ? (
        <Pressable style={styles.clear} onPress={onClear}>
          <Icon name="close" size={18} color="#333" />
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 8 },
  clear: { position: 'absolute', right: 8, top: 8, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', zIndex: 2 },
});
