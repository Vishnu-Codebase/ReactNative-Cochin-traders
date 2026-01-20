import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Pressable onPress={toggleTheme} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 8 })}>
      <Icon 
        name={theme === 'light' ? 'dark-mode' : 'light-mode'} 
        size={24} 
        color="#fff"
      />
    </Pressable>
  );
}
