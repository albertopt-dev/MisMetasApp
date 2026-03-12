// 📊 PANTALLA DE ESTADÍSTICAS - Web Version

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import goalService from '../services/goalService';
import { colors, spacing, borderRadius } from '../theme/colors';
import { IconButton, CircularProgress } from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';

export default function StatsScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userStats = await goalService.getUserStats(user.uid);
      setStats(userStats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div style={styles.loadingContainer}>
        <CircularProgress sx={{ color: colors.primary }} size={48} />
        <p style={{ color: colors.textLight, marginTop: spacing.lg }}>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <IconButton onClick={() => navigate('/')} sx={{ color: colors.primary }}>
          <ArrowBack />
        </IconButton>
        <h1 style={styles.headerTitle}>Estadísticas</h1>
        <IconButton onClick={loadStats} sx={{ color: colors.primary }}>
          <Refresh />
        </IconButton>
      </div>

      <div style={styles.scrollContent}>
        {/* Estadísticas principales */}
        <div style={styles.statsGrid}>
          <StatCard icon="🎯" title="Total Objetivos" value={stats.totalGoals} color={colors.primary} delay={0} />
          <StatCard icon="✅" title="Completados" value={stats.completedGoals} color="#10b981" delay={0.05} />
          <StatCard icon="📊" title="Tasa Éxito" value={`${stats.completionRate}%`} color={colors.secondary} delay={0.1} />
          <StatCard icon="🔥" title="Racha Actual" value={`${stats.streakDays} días`} color={colors.accent} delay={0.15} />
        </div>

        {/* Mejor racha */}
        {stats.bestStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.streakCard}
          >
            <div style={styles.streakIcon}>👑</div>
            <div style={styles.streakTitle}>Mejor Racha</div>
            <div style={styles.streakValue}>{stats.bestStreak} días consecutivos</div>
            <div style={styles.streakSubtext}>¡Sigue así para superar tu récord!</div>
          </motion.div>
        )}

        {/* Tendencias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={styles.section}
        >
          <h2 style={styles.sectionTitle}>📈 Tendencias</h2>
          
          <div style={styles.trendItem}>
            <span style={styles.trendLabel}>Últimos 7 días</span>
            <div style={styles.trendStats}>
              <span style={styles.trendValue}>
                {stats.trends.last7Days.completed}/{stats.trends.last7Days.total}
              </span>
              <span style={{ 
                ...styles.trendPercentage,
                color: stats.trends.last7Days.completionRate >= 70 ? '#10b981' : 
                       stats.trends.last7Days.completionRate >= 50 ? colors.accent : colors.textLight 
              }}>
                {Math.round(stats.trends.last7Days.completionRate)}%
              </span>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.trendItem}>
            <span style={styles.trendLabel}>Últimos 30 días</span>
            <div style={styles.trendStats}>
              <span style={styles.trendValue}>
                {stats.trends.last30Days.completed}/{stats.trends.last30Days.total}
              </span>
              <span style={{ 
                ...styles.trendPercentage,
                color: stats.trends.last30Days.completionRate >= 70 ? '#10b981' : 
                       stats.trends.last30Days.completionRate >= 50 ? colors.accent : colors.textLight 
              }}>
                {Math.round(stats.trends.last30Days.completionRate)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Mejor día */}
        {stats.bestDay !== 'N/A' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={styles.section}
          >
            <h2 style={styles.sectionTitle}>⭐ Mejor Día de la Semana</h2>
            <div style={styles.bestDayContainer}>
              <div style={styles.bestDayIcon}>📅</div>
              <div style={styles.bestDayName}>{stats.bestDay}</div>
              <div style={styles.bestDaySubtext}>Tu día más productivo</div>
            </div>
          </motion.div>
        )}

        {/* Objetivos por período */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={styles.section}
        >
          <h2 style={styles.sectionTitle}>📊 Objetivos por Período</h2>

          <ProgressBar label="📅 Diarios" value={stats.goalsByPeriod.day} total={stats.totalGoals} color={colors.goalColors[0]} />
          <ProgressBar label="📆 Semanales" value={stats.goalsByPeriod.week} total={stats.totalGoals} color={colors.goalColors[2]} />
          <ProgressBar label="🗓️ Mensuales" value={stats.goalsByPeriod.month} total={stats.totalGoals} color={colors.goalColors[4]} />
          <ProgressBar label="📊 Anuales" value={stats.goalsByPeriod.year} total ={stats.totalGoals} color={colors.goalColors[6]} />
        </motion.div>

        {/* Objetivos por prioridad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={styles.section}
        >
          <h2 style={styles.sectionTitle}>🎯 Objetivos por Prioridad</h2>

          <ProgressBar label="🔴 Alta" value={stats.completedByPriority.high} total={stats.goalsByPriority.high} color="#ef4444" />
          <ProgressBar label="🟡 Media" value={stats.completedByPriority.medium} total={stats.goalsByPriority.medium} color={colors.accent} />
          <ProgressBar label="🟢 Baja" value={stats.completedByPriority.low} total={stats.goalsByPriority.low} color="#10b981" />
        </motion.div>

        {/* Resumen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={styles.section}
        >
          <h2 style={styles.sectionTitle}>Resumen</h2>

          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Pendientes</span>
            <span style={styles.summaryValue}>{stats.totalGoals - stats.completedGoals}</span>
          </div>

          <div style={styles.divider} />

          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Tasa de Completitud</span>
            <div style={styles.summaryBadge}>
              <span style={styles.summaryBadgeText}>{stats.completionRate}%</span>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Estado</span>
            <span
              style={{
                ...styles.summaryValue,
                color:
                  stats.completionRate >= 70
                    ? '#10b981'
                    : stats.completionRate >= 50
                    ? colors.accent
                    : colors.textLight,
              }}
            >
              {stats.completionRate >= 70
                ? '¡Excelente!'
                : stats.completionRate >= 50
                ? 'En Progreso'
                : stats.completionRate >= 30
                ? 'Avanzando'
                : 'Comenzando'}
            </span>
          </div>
        </motion.div>

        {/* Motivación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={styles.motivationCard}
        >
          <div style={styles.motivationIcon}>
            {stats.completionRate >= 70 ? '👑' : stats.completionRate >= 50 ? '💎' : stats.completionRate >= 30 ? '🎯' : '🌱'}
          </div>
          <p style={styles.motivationText}>
            {stats.completionRate >= 70
              ? '¡Eres imparable! Tu constancia es admirable.'
              : stats.completionRate >= 50
              ? '¡Bien hecho! Estás construyendo buenos hábitos.'
              : stats.completionRate >= 30
              ? 'Cada pequeño paso cuenta. ¡Sigue adelante!'
              : '¡Comienza hoy! Cada gran logro empieza con un primer paso.'}
          </p>
        </motion.div>
        <div style={{ height: 40 }} />      </div>
    </div>
  );
}

// Componentes auxiliares
function StatCard({ icon, title, value, color, delay }: { icon: string; title: string; value: string | number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03 }}
      style={{
        ...styles.statCard,
        borderColor: color + '40',
        boxShadow: `0 0 20px ${color}20`,
      }}
    >
      <div style={{ ...styles.iconContainer, background: color + '20' }}>
        <span style={styles.icon}>{icon}</span>
      </div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </motion.div>
  );
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div style={styles.progressItem}>
      <div style={styles.progressHeader}>
        <span style={styles.progressLabel}>{label}</span>
        <span style={styles.progressValue}>{value} de {total}</span>
      </div>
      <div style={styles.progressBarContainer}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            ...styles.progressBarFill,
            background: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: colors.background,
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.background,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.xl + 20}px ${spacing.lg}px ${spacing.lg}px ${spacing.lg}px`,
    background: colors.surface,
    borderBottom: `1px solid ${colors.primary}30`,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    margin: 0,
    letterSpacing: 1,
  },
  scrollContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: spacing.lg,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    background: `linear-gradient(135deg, ${colors.surface}, ${colors.surfaceDark})`,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    border: '1px solid',
    textAlign: 'center' as any,
    display: 'flex',
    flexDirection: 'column' as any,
    alignItems: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: '0.5px',
  },
  statTitle: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center' as any,
    letterSpacing: '0.3px',
    lineHeight: '14px',
  },
  streakCard: {
    background: `linear-gradient(135deg, ${colors.surface}, ${colors.surfaceDark})`,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    textAlign: 'center' as any,
    border: `2px solid ${colors.accent}60`,
    boxShadow: `0 0 30px ${colors.accent}40`,
    marginBottom: spacing.lg,
  },
  streakIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  streakTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    marginBottom: spacing.sm,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.accent,
    margin: `${spacing.md}px 0`,
    textShadow: `0 0 20px ${colors.accent}80`,
  },
  streakSubtext: {
    fontSize: 12,
    color: colors.textLight,
  },
  trendItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  trendLabel: {
    fontSize: 14,
    color: colors.text,
    letterSpacing: '0.3px',
  },
  trendStats: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  trendPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bestDayContainer: {
    textAlign: 'center' as any,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  bestDayIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  bestDayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
    textShadow: `0 0 20px ${colors.primary}60`,
  },
  bestDaySubtext: {
    fontSize: 12,
    color: colors.textLight,
  },
  section: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    background: colors.surface,
    border: `1px solid ${colors.surfaceLight}`,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: '0.5px',
    margin: `0 0 ${spacing.lg}px 0`,
  },
  progressItem: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    letterSpacing: '0.3px',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 10,
    background: colors.surfaceDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    border: `1px solid ${colors.surfaceLight}`,
  },
  progressBarFill: {
    height: '100%',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text,
    letterSpacing: '0.3px',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryBadge: {
    background: `${colors.primary}20`,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderRadius: borderRadius.full,
    border: `1px solid ${colors.primary}40`,
  },
  summaryBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  divider: {
    height: 1,
    background: colors.surfaceLight,
    margin: 0,
  },
  motivationCard: {
    background: `linear-gradient(135deg, ${colors.surface}, ${colors.surfaceDark})`,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    textAlign: 'center' as any,
    border: `1px solid ${colors.surfaceLight}`,
  },
  motivationIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  motivationText: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: '24px',
    letterSpacing: '0.3px',
    margin: 0,
  },
};
