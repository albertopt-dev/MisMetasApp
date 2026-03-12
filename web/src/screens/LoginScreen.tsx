// 🔐 PANTALLA DE LOGIN Y REGISTRO - DISEÑO FUTURISTA

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors,spacing, borderRadius } from '../theme/colors';
import { 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel,
  Alert,
  CircularProgress 
} from '@mui/material';
import { motion } from 'framer-motion';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      localStorage.setItem('rememberMe', rememberMe.toString());
      
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

  return (
    <div style={styles.container}>
      <div style={styles.scrollContent}>
        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
          style={styles.card}
        >
          <motion.div
            animate={{
              boxShadow: [
                `0 0 30px ${colors.primary}aa`,
                `0 0 50px ${colors.secondary}aa`,
                `0 0 30px ${colors.primary}aa`,
              ],
            }}
            transition={{ duration: 6, repeat: Infinity }}
            style={styles.glowEffect}
          />

          <div style={styles.cardContent}>
            {/* Logo/Título */}
            <div style={styles.header}>
              <motion.span
                style={styles.logo}
                animate={{
                  textShadow: [
                    `0 0 20px ${colors.primary}`,
                    `0 0 40px ${colors.secondary}`,
                    `0 0 20px ${colors.primary}`,
                  ],
                }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                🎯
              </motion.span>
              <h1 style={styles.title}>OBJETIVOSAPP</h1>
              <div style={styles.titleUnderline} />
              <p style={styles.subtitle}>
                {isLogin ? 'Bienvenido de nuevo' : 'Tus objetivos, tus logros'}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={styles.form}>
              {!isLogin && (
                <TextField
                  label="Nombre"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: colors.surfaceDark,
                      '& fieldset': { borderColor: colors.surfaceLight },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              )}

              <TextField
                label="Correo"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.surfaceDark,
                    '& fieldset': { borderColor: colors.surfaceLight },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />

              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.surfaceDark,
                    '& fieldset': { borderColor: colors.surfaceLight },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ backgroundColor: colors.surfaceDark }}>
                  ⚠️ {error}
                </Alert>
              )}

              {isLogin && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ color: colors.primary }}
                    />
                  }
                  label="Mantener sesión iniciada"
                  sx={{ color: colors.textLight, marginLeft: 0 }}
                />
              )}

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  marginTop: spacing.md,
                  padding: `${spacing.md}px`,
                  borderRadius: `${borderRadius.lg}px`,
                  background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  color: colors.text,
                  fontWeight: 900,
                  fontSize: 16,
                  letterSpacing: '1.5px',
                  boxShadow: `0 0 30px ${colors.primary}aa`,
                  '&:hover': {
                    background: `linear-gradient(90deg, ${colors.primaryLight} 0%, ${colors.secondaryLight} 100%)`,
                    boxShadow: `0 0 40px ${colors.primary}`,
                  },
                  '&:disabled': {
                    background: colors.surfaceLight,
                    color: colors.textDark,
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: colors.text, marginRight: 1 }} />
                    PROCESANDO...
                  </>
                ) : isLogin ? (
                  '🚀 INICIAR SESIÓN'
                ) : (
                  '✨ REGISTRARSE'
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                style={styles.switchButton}
              >
                {isLogin
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </form>
          </div>
        </motion.div>

        <p style={styles.footer}>
          Gestiona tus objetivos diarios, semanales, mensuales y anuales
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundGradient2} 50%, ${colors.background} 100%)`,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 480,
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
    border: `2px solid ${colors.primary}40`,
    pointerEvents: 'none',
  },
  cardContent: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceDark} 100%)`,
    border: `1px solid ${colors.surfaceLight}`,
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 80,
    display: 'block',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    color: colors.text,
    margin: `0 0 ${spacing.xs}px 0`,
    letterSpacing: '2px',
    textShadow: `0 0 20px ${colors.primary}`,
  },
  titleUnderline: {
    width: 100,
    height: 3,
    borderRadius: 2,
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    margin: `${spacing.sm}px auto`,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    letterSpacing: '1px',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  switchButton: {
    textAlign: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    background: 'none',
    border: 'none',
    color: colors.primary,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.5px',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: spacing.xl,
    fontSize: 13,
    opacity: 0.7,
    letterSpacing: '0.5px',
  },
};
