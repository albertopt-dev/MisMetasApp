import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';

type WelcomeScreenProps = {
  onFinish: () => void;
};

export default function WelcomeScreen({ onFinish }: WelcomeScreenProps) {
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const orbScale = useRef(new Animated.Value(0.92)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 850,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 28,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const breathingGlow = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.72,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.28,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(orbScale, {
            toValue: 1.05,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orbScale, {
            toValue: 0.94,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(floatY, {
            toValue: -4,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: 4,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    breathingGlow.start();

    const timer = setTimeout(() => {
      onFinish();
    }, 3200);

    return () => {
      clearTimeout(timer);
      breathingGlow.stop();
    };
  }, [floatY, glowOpacity, logoOpacity, logoScale, onFinish, orbScale, textOpacity]);

  return (
    <LinearGradient
      colors={[colors.background, colors.surface, colors.background]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.orb,
          {
            opacity: glowOpacity,
            transform: [{ scale: orbScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.logoBlock,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: floatY }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Text style={styles.logo}>🎯</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.textBlock,
          {
            opacity: textOpacity,
            transform: [{ translateY: floatY }],
          },
        ]}
      >
        <Text style={styles.title}>ObjetivosApp</Text>
        <Text style={styles.subtitle}>Convierte tus objetivos en logros</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  orb: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 35,
    elevation: 18,
  },
  logoBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 116,
    height: 116,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 22,
    elevation: 14,
  },
  logo: {
    fontSize: 62,
  },
  textBlock: {
    marginTop: spacing.xl + 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1.2,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});