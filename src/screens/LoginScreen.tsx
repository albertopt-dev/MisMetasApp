// 🔐 PANTALLA DE LOGIN Y REGISTRO - DISEÑO FUTURISTA

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { TextInput, Button, Text, HelperText, Checkbox } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius } from '../theme/colors';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  }, []);

  const animateCardTransition = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!isLogin && !displayName) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Guardar preferencia de sesión
      await AsyncStorage.setItem('rememberMe', rememberMe.toString());
      
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message || 'Error al autenticarse');
    } finally {
      setLoading(false);
    }
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.secondary],
  });

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundGradient2, colors.background]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={isLogin ? 'login-mode' : 'register-mode'}
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Efecto de brillo animado */}
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  shadowColor: glowColor,
                  borderColor: glowColor,
                },
              ]}
            />

            <LinearGradient
              colors={[colors.surface, colors.surfaceDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardContent}
            >
              {/* Logo/Título */}
              <View style={styles.header}>
                <Animated.Text
                  style={[
                    styles.logo,
                    { color: glowColor },
                  ]}
                >
                  🎯
                </Animated.Text>
                <Text style={styles.title}>MISMETAS</Text>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.titleUnderline}
                />
                <Text style={styles.subtitle}>
                  {isLogin ? 'Bienvenido de nuevo' : 'Tus objetivos, tus logros'}
                </Text>
              </View>

              {/* Formulario */}
              <View style={styles.form}>
                {!isLogin && (
                  <View style={styles.inputWrapper}>
                    <TextInput
                      label="Nombre"
                      value={displayName}
                      onChangeText={setDisplayName}
                      mode="outlined"
                      style={styles.input}
                      outlineColor={colors.surfaceLight}
                      activeOutlineColor={colors.primary}
                      textColor={colors.text}
                      theme={{ colors: { onSurfaceVariant: colors.textLight } }}
                      left={<TextInput.Icon icon="account" color={colors.primary} />}
                    />
                  </View>
                )}

                <View style={styles.inputWrapper}>
                  <TextInput
                    label="Correo"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    outlineColor={colors.surfaceLight}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                    theme={{ colors: { onSurfaceVariant: colors.textLight } }}
                    left={<TextInput.Icon icon="email" color={colors.primary} />}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    label="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    outlineColor={colors.surfaceLight}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                    theme={{ colors: { onSurfaceVariant: colors.textLight } }}
                    left={<TextInput.Icon icon="lock" color={colors.primary} />}
                  />
                </View>

                {error ? (
                  <HelperText type="error" visible={true} style={styles.error}>
                    ⚠️ {error}
                  </HelperText>
                ) : null}

                {/* Checkbox para mantener sesión */}
                {isLogin && (
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    style={styles.rememberContainer}
                    activeOpacity={0.7}
                  >
                    <Checkbox
                      status={rememberMe ? 'checked' : 'unchecked'}
                      onPress={() => setRememberMe(!rememberMe)}
                      color={colors.primary}
                      uncheckedColor={colors.textLight}
                    />
                    <Text style={styles.rememberText}>Mantener sesión iniciada</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? '⏳ PROCESANDO...' : isLogin ? '🚀 INICIAR SESIÓN' : '✨ REGISTRARSE'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    animateCardTransition();
                  }}
                  style={styles.switchButton}
                >
                  <Text style={styles.switchText}>
                    {isLogin
                      ? '¿No tienes cuenta? Regístrate'
                      : '¿Ya tienes cuenta? Inicia sesión'}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          <Text style={styles.footer}>
            Gestiona tus objetivos diarios, semanales, mensuales y anuales
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: borderRadius.xl + 3,
    borderWidth: 2,
    shadowRadius: 30,
    shadowOpacity: 0.8,
    elevation: 15,
  },
  cardContent: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.md,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 2,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  titleUnderline: {
    width: 100,
    height: 3,
    borderRadius: 2,
    marginVertical: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    letterSpacing: 1,
  },
  form: {
    gap: spacing.md,
  },
  inputWrapper: {
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceDark,
  },
  error: {
    color: colors.error,
    fontSize: 13,
  },
  button: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  switchText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: spacing.xl,
    fontSize: 13,
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  rememberText: {
    color: colors.textLight,
    fontSize: 14,
    marginLeft: spacing.xs,
  },
});
