// AnimatedSplash.tsx
import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function AnimatedSplash() {
  const { theme } = useTheme();

  // Animated values
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameScale = useRef(new Animated.Value(0.8)).current;

  const colors = Colors[theme];

  // Splash screen fade/scale in
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out when component unmounts
    return () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    };
  }, [opacity, scale]);

  // Icon bounce loop
  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounce, {
          toValue: -20,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(iconBounce, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    bounceAnimation.start();

    // Stop bounce when splash unmounts
    return () => bounceAnimation.stop();
  }, [iconBounce]);

  // Company name fade/scale in
  useEffect(() => {
    Animated.parallel([
      Animated.timing(nameOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(nameScale, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [nameOpacity, nameScale]);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      pointerEvents="auto"
    >
      <LinearGradient
        colors={
          theme === "dark" ? ["#780206", "#061161"] : ["#4e54c8", "#8f94fb"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[styles.content, { opacity, transform: [{ scale }] }]}
      >
        <Animated.Image
          source={require("@/assets/images/icon1024.png")}
          style={[styles.logo, { transform: [{ translateY: iconBounce }] }]}
          resizeMode="contain"
        />
        <Animated.Text
          style={[
            styles.companyName,
            {
              color: colors.text,
              fontStyle: "italic",
              opacity: nameOpacity,
              transform: [{ scale: nameScale }],
            },
          ]}
        >
          Cochin Traders
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  companyName: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
    color: "#e0e0e0ff",
  },
});
