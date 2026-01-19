import React from 'react';
import { FlatList, Pressable, StyleSheet, View as DefaultView } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';

type Party = { name: string; closingBalance?: number };
type Props = {
  show: boolean;
  parties: Party[];
  query: string;
  onPick: (p: Party) => void;
};

export default function ShopSuggestions({ show, parties, query, onPick }: Props) {
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  if (!show || parties.length === 0) return null;
  const filtered = parties.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  return (
    <DefaultView style={[styles.suggestions, { backgroundColor: cardBg, borderColor }]}>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.name}
        renderItem={({ item }) => (
          <Pressable onPress={() => onPick(item)} style={[styles.suggestionItem, { borderBottomColor: borderColor }]}>
            <Text numberOfLines={1}>{item.name}</Text>
          </Pressable>
        )}
      />
    </DefaultView>
  );
}

const styles = StyleSheet.create({
  suggestions: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 6,
    maxHeight: 200,
    zIndex: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  suggestionItem: { paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1 },
});

