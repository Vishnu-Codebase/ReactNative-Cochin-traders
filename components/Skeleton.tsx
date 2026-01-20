import { Text, View, useThemeColor } from "@/components/Themed";
import React from "react";
import { StyleSheet, View as DefaultView } from "react-native";

export function SkeletonLine({ width = "100%", height = 14, style = {} }: { width?: number | string; height?: number; style?: any }) {
  const cardBg = useThemeColor({}, "card");
  return <DefaultView style={[styles.line, { width, height, backgroundColor: cardBg }, style]} />;
}

export function SkeletonCardItem() {
  const borderColor = useThemeColor({}, "tabIconDefault");
  const cardBg = useThemeColor({}, "card");
  return (
    <DefaultView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <SkeletonLine width="60%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLine width="40%" height={14} />
      <DefaultView style={{ marginTop: 12 }}>
        <SkeletonLine width="90%" height={12} style={{ marginBottom: 6 }} />
        <SkeletonLine width="80%" height={12} />
      </DefaultView>
    </DefaultView>
  );
}

export function SkeletonCountCard() {
  const cardBg = useThemeColor({}, "card");
  return (
    <DefaultView style={[styles.countCard, { backgroundColor: cardBg }]}>
      <SkeletonLine width={40} height={24} style={{ marginBottom: 10 }} />
      <SkeletonLine width={80} height={14} />
    </DefaultView>
  );
}

const styles = StyleSheet.create({
  line: {
    borderRadius: 6,
  },
  card: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  countCard: {
    width: "45%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

