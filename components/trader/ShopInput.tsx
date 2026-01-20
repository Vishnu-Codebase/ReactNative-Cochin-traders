import { useThemeColor } from '@/components/Themed';
import React, { memo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = { value: string; onChange: (v: string) => void; onClear?: () => void; showClear?: boolean };

export default memo(function ShopInput({ value, onChange, onClear, showClear }: Props) {
  const textColor = useThemeColor({}, 'text');
  // Use a lighter color for border if possible, or just text with opacity if needed. 
  // For now, using text color but maybe we should define a border color in theme.
  // The original was #ccc. 
  // In dark mode #ccc is bright. #25282b is card. 
  // Let's use 'text' for now, or maybe 'tabIconDefault' if available. 
  // Checking Colors.ts in mind: text, background, tint, tabIconDefault, tabIconSelected, card.
  // 'tabIconDefault' might be good for borders (#ccc).
  const borderColor = useThemeColor({}, 'tabIconDefault'); 
  const clearBg = useThemeColor({}, 'card'); 
  const iconColor = useThemeColor({}, 'text');

  return (
    <View style={styles.wrap}>
      <TextInput 
        style={[
            styles.input, 
            { color: textColor, borderColor: borderColor }, 
            showClear ? { paddingRight: 36 } : null
        ]} 
        placeholder="Enter shop name" 
        placeholderTextColor="#999"
        value={value} 
        onChangeText={onChange} 
      />
      {showClear ? (
        <Pressable style={[styles.clear, { backgroundColor: clearBg }]} onPress={onClear}>
          <Icon name="close" size={18} color={iconColor} />
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  input: { borderWidth: 1, padding: 8, borderRadius: 6, marginBottom: 8 },
  clear: { position: 'absolute', right: 8, top: 8, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
});
