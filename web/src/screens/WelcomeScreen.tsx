// 👋 PANTALLA DE BIENVENIDA

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { colors, spacing } from '../theme/colors';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.container}>
      {/* Orb brillante */}
      <motion.div
        style={styles.orb}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [0.9, 1.05, 0.9],
        }}
        transition={{
          duration: 3.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Logo */}
      <motion.div
        style={styles.logoBlock}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: [0, -4, 4, 0]
        }}
        transition={{
          opacity: { duration: 0.85 },
          scale: { type: "spring", tension: 28, friction: 7 },
          y: { 
            duration: 3.4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <div style={styles.logoWrapper}>
          <span style={styles.logo}>🎯</span>
        </div>
      </motion.div>

      {/* Texto */}
      <motion.div
        style={styles.textBlock}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.25 }}
      >
        <h1 style={styles.title}>MisMetas</h1>
        <p style={styles.subtitle}>Convierte tus objetivos en logros</p>
      </motion.div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.surface} 50%, ${colors.background} 100%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: '50%',
    backgroundColor: colors.primary,
    boxShadow: `0 0 70px ${colors.primary}`,
    filter: `blur(8px)`,
  },
  logoBlock: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoWrapper: {
    width: 116,
    height: 116,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.primary}40`,
    boxShadow: `0 0 44px ${colors.primary}aa`,
  },
  logo: {
    fontSize: 62,
  },
  textBlock: {
    marginTop: spacing.xl + 4,
    textAlign: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: 900,
    color: colors.text,
    letterSpacing: '1.2px',
    margin: 0,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textLight,
    letterSpacing: '0.4px',
    margin: `${spacing.sm}px 0 0 0`,
  },
};
