// 📊 PANTALLA DE ESTADÍSTICAS

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import goalService from '../services/goalService';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

export default function StatsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    completionRate: 0,
    streakDays: 0,
    goalsByPeriod: {
      day: 0,
      week: 0,
      month: 0,
      year: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user) return;

    try {
      const userStats = await goalService.getUserStats(user.uid);
      setStats(userStats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color }: any) => (
    <Surface style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle} numberOfLines={2}>{title}</Text>
    </Surface>
  );

  const ProgressBar = ({ label, value, total, color }: any) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <View style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{value}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Estadísticas</Text>
          <IconButton
            icon="refresh"
            size={24}
            onPress={loadStats}
          />
        </View>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estadísticas principales */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="🎯"
            title="Total Objetivos"
            value={stats.totalGoals}
            color={colors.primary}
          />
          <StatCard
            icon="✅"
            title="Completados"
            value={stats.completedGoals}
            color={colors.success}
          />
          <StatCard
            icon="�"
            title="Tasa Éxito"
            value={`${stats.completionRate}%`}
            color={colors.secondary}
          />
          <StatCard
            icon="🔥"
            title="Racha"
            value={`${stats.streakDays} días`}
            color={colors.warning}
          />
        </View>

        {/* Objetivos por periodo */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivos por Periodo</Text>

          <ProgressBar
            label="📅 Diarios"
            value={stats.goalsByPeriod.day}
            total={stats.totalGoals}
            color={colors.goalColors[0]}
          />

          <ProgressBar
            label="📆 Semanales"
            value={stats.goalsByPeriod.week}
            total={stats.totalGoals}
            color={colors.goalColors[2]}
          />

          <ProgressBar
            label="🗓️ Mensuales"
            value={stats.goalsByPeriod.month}
            total={stats.totalGoals}
            color={colors.goalColors[4]}
          />

          <ProgressBar
            label="📊 Anuales"
            value={stats.goalsByPeriod.year}
            total={stats.totalGoals}
            color={colors.goalColors[6]}
          />
        </Surface>

        {/* Resumen */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pendientes</Text>
            <Text style={styles.summaryValue}>
              {stats.totalGoals - stats.completedGoals}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tasa de Completitud</Text>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>
                {stats.completionRate}%
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Estado</Text>
            <Text style={[
              styles.summaryValue,
              { color: stats.completionRate >= 70 ? colors.success : colors.warning }
            ]}>
              {stats.completionRate >= 70 ? '¡Excelente!' : 
               stats.completionRate >= 50 ? 'En Progreso' : 
               stats.completionRate >= 30 ? 'Avanzando' : 'Comenzando'}
            </Text>
          </View>
        </Surface>

        {/* Motivación */}
        <Surface style={[styles.section, styles.motivationCard]}>
          <Text style={styles.motivationIcon}>
            {stats.completionRate >= 70 ? '�' : 
             stats.completionRate >= 50 ? '💎' : 
             stats.completionRate >= 30 ? '🎯' : '🌱'}
          </Text>
          <Text style={styles.motivationText}>
            {stats.completionRate >= 70 ? '¡Eres imparable! Tu constancia es admirable.' : 
             stats.completionRate >= 50 ? '¡Bien hecho! Estás construyendo buenos hábitos.' : 
             stats.completionRate >= 30 ? 'Cada pequeño paso cuenta. ¡Sigue adelante!' : 
             '¡Comienza hoy! Cada gran logro empieza con un primer paso.'}
          </Text>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '30',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statTitle: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 14,
  },
  section: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: 0.5,
  },
  progressItem: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  progressBarFill: {
    height: '100%',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text,
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  summaryBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceLight,
  },
  motivationCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  motivationIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  motivationText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.3,
    fontWeight: '500',
  },
});
