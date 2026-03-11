// 🏠 PANTALLA PRINCIPAL - CALENDARIO Y OBJETIVOS

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import goalService from '../services/goalService';
import { Goal, PeriodType } from '../types';
import { colors, spacing, borderRadius } from '../theme/colors';
import GoalCard from '../components/GoalCard';
import { IconButton, Menu, MenuItem, Fab, CircularProgress } from '@mui/material';
import { Add as AddIcon, Menu as MenuIcon, BarChart, Logout } from '@mui/icons-material';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadGoals();
  }, [selectedDate]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const allUserGoals = await goalService.getUserGoals(user.uid);
      setAllGoals(allUserGoals);
    } catch (error) {
      console.error('Error al cargar objetivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const getGoalsForDate = (period: PeriodType): Goal[] => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const date = new Date(dateStr + 'T00:00:00');

    return allGoals.filter((goal) => {
      if (goal.period !== period) return false;

      const goalDate = new Date(goal.date + 'T00:00:00');

      if (period === 'day') {
        return goal.date === dateStr;
      } else if (period === 'week') {
        const weekStart = startOfWeek(goalDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(goalDate, { weekStartsOn: 1 });
        return date >= weekStart && date <= weekEnd;
      } else if (period === 'month') {
        return (
          goalDate.getMonth() === date.getMonth() &&
          goalDate.getFullYear() === date.getFullYear()
        );
      } else if (period === 'year') {
        return goalDate.getFullYear() === date.getFullYear();
      }
      return false;
    });
  };

  const dayGoals = getGoalsForDate('day');
  const weekGoals = getGoalsForDate('week');
  const monthGoals = getGoalsForDate('month');
  const yearGoals = getGoalsForDate('year');

  const allCurrentGoals = [...dayGoals, ...weekGoals, ...monthGoals, ...yearGoals];
  const completedCount = allCurrentGoals.filter((g) => g.completed).length;
  const totalCount = allCurrentGoals.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const calculateProgress = (goals: Goal[], considerSubGoals: boolean = false) => {
    if (goals.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

    goals.forEach((goal) => {
      if (considerSubGoals && goal.subGoals && goal.subGoals.length > 0) {
        const todaySubGoals = goal.subGoals.filter((sg) => sg.date === selectedDateStr);
        if (todaySubGoals.length > 0) {
          total += todaySubGoals.length;
          completed += todaySubGoals.filter((sg) => sg.completed).length;
        }
      } else {
        total += 1;
        if (goal.completed) completed += 1;
      }
    });

    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const dayProgress = calculateProgress(dayGoals);
  const weekProgress = calculateProgress(weekGoals, true);
  const monthProgress = calculateProgress(monthGoals, true);
  const yearProgress = calculateProgress(yearGoals);

  const getCalendarMarkedDates = () => {
    const marked = new Map();
    const currentMonthDate = selectedDate;

    const periodColors: Record<PeriodType, string> = {
      day: colors.primary,
      week: colors.secondary,
      month: colors.accent,
      year: '#10b981',
    };

    allGoals.forEach((goal) => {
      const goalDate = new Date(goal.date + 'T00:00:00');
      let datesToMark: string[] = [];

      if (goal.period === 'day') {
        datesToMark = [goal.date];
      } else if (goal.period === 'week') {
        const weekStart = startOfWeek(goalDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(goalDate, { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
        datesToMark = daysInWeek
          .filter((day) => isSameMonth(day, currentMonthDate))
          .map((day) => format(day, 'yyyy-MM-dd'));
      } else if (goal.period === 'month') {
        const monthStart = startOfMonth(goalDate);
        const monthEnd = endOfMonth(goalDate);
        if (isSameMonth(goalDate, currentMonthDate)) {
          const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
          datesToMark = daysInMonth.map((day) => format(day, 'yyyy-MM-dd'));
        }
      } else if (goal.period === 'year') {
        if (goalDate.getFullYear() === currentMonthDate.getFullYear()) {
          const monthStart = startOfMonth(currentMonthDate);
          const monthEnd = endOfMonth(currentMonthDate);
          const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
          datesToMark = daysInMonth.map((day) => format(day, 'yyyy-MM-dd'));
        }
      }

      const periodColor = periodColors[goal.period];
      datesToMark.forEach((dateStr) => {
        if (!marked.has(dateStr)) {
          marked.set(dateStr, []);
        }
        const colors = marked.get(dateStr);
        if (!colors.includes(periodColor)) {
          colors.push(periodColor);
        }
      });
    });

    return marked;
  };

  const markedDates = getCalendarMarkedDates();

  const handleToggleGoal = async (goalId: string, completed: boolean) => {
    try {
      await goalService.toggleGoalCompletion(goalId, !completed);
      await loadGoals();
    } catch (error) {
      console.error('Error al actualizar objetivo:', error);
    }
  };

  const handleToggleSubGoal = async (goalId: string, subGoalId: string) => {
    try {
      await goalService.toggleSubGoal(goalId, subGoalId);
      await loadGoals();
    } catch (error) {
      console.error('Error al actualizar sub-objetivo:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await goalService.deleteGoal(goalId);
      await loadGoals();
    } catch (error) {
      console.error('Error al eliminar objetivo:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const tileContent = ({ date, view }: any) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dots = markedDates.get(dateStr);
      if (dots && dots.length > 0) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
            {dots.slice(0, 4).map((color: string, index: number) => (
              <div
                key={index}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 4px ${color}`,
                }}
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <CircularProgress sx={{ color: colors.primary }} size={48} />
        <p style={{ color: colors.textLight, marginTop: spacing.lg }}>Cargando objetivos...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div>
          <h1 style={styles.greeting}>¡Hola, {user?.displayName?.trim() || 'Usuario'}!</h1>
          <p style={styles.date}>
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: colors.primary }}>
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{
            style: {
              background: colors.surface,
              border: `1px solid ${colors.primary}40`,
              borderRadius: borderRadius.lg,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              navigate('/stats');
            }}
            sx={{ color: colors.primary, fontWeight: 'bold' }}
          >
            <BarChart sx={{ marginRight: 1 }} /> Estadísticas
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handleLogout();
            }}
            sx={{ color: colors.error, fontWeight: 'bold' }}
          >
            <Logout sx={{ marginRight: 1 }} /> Cerrar sesión
          </MenuItem>
        </Menu>
      </motion.div>

      <div style={styles.scrollContent}>
        {/* Calendario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.calendarContainer}
        >
          <Calendar
            value={selectedDate}
            onChange={(value) => setSelectedDate(value as Date)}
            locale="es-ES"
            tileContent={tileContent}
            className="custom-calendar"
          />
        </motion.div>

        {/* Leyenda */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={styles.legendContainer}
        >
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: colors.primary }} />
            <span style={styles.legendText}>Día</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: colors.secondary }} />
            <span style={styles.legendText}>Semana</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: colors.accent }} />
            <span style={styles.legendText}>Mes</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: '#10b981' }} />
            <span style={styles.legendText}>Año</span>
          </div>
        </motion.div>

        {/* Progress Bars */}
        {totalCount > 0 && (
          <div style={styles.progressWrapper}>
            <ProgressBar
              title="Progreso total"
              completed={completedCount}
              total={totalCount}
              percentage={completionPercentage}
              color={colors.primary}
            />

            {weekProgress.total > 0 && (
              <ProgressBar
                title="📆 Semanales"
                subtitle={`${weekProgress.completed}/${weekProgress.total} hoy`}
                completed={weekProgress.completed}
                total={weekProgress.total}
                percentage={weekProgress.percentage}
                color={colors.secondary}
              />
            )}

            {monthProgress.total > 0 && (
              <ProgressBar
                title="🗓️ Mensuales"
                subtitle={`${monthProgress.completed}/${monthProgress.total} hoy`}
                completed={monthProgress.completed}
                total={monthProgress.total}
                percentage={monthProgress.percentage}
                color={colors.accent}
              />
            )}

            {yearProgress.total > 0 && (
              <ProgressBar
                title="📋 Anuales"
                subtitle={`${yearProgress.completed}/${yearProgress.total} completados`}
                completed={yearProgress.completed}
                total={yearProgress.total}
                percentage={yearProgress.percentage}
                color="#10b981"
              />
            )}
          </div>
        )}

        {/* Goals Lists */}
        {dayGoals.length > 0 && (
          <GoalsList
            title="Objetivos del Día"
            goals={dayGoals}
            selectedDate={format(selectedDate, 'yyyy-MM-dd')}
            onToggle={handleToggleGoal}
            onDelete={handleDeleteGoal}
            onEdit={(goal) => navigate(`/edit-goal/${goal.id}`, { state: { goal } })}
            onToggleSubGoal={handleToggleSubGoal}
          />
        )}

        {weekGoals.length > 0 && (
          <GoalsList
            title="Objetivos de la Semana"
            goals={weekGoals}
            selectedDate={format(selectedDate, 'yyyy-MM-dd')}
            onToggle={handleToggleGoal}
            onDelete={handleDeleteGoal}
            onEdit={(goal) => navigate(`/edit-goal/${goal.id}`, { state: { goal } })}
            onToggleSubGoal={handleToggleSubGoal}
          />
        )}

        {monthGoals.length > 0 && (
          <GoalsList
            title="Objetivos del Mes"
            goals={monthGoals}
            selectedDate={format(selectedDate, 'yyyy-MM-dd')}
            onToggle={handleToggleGoal}
            onDelete={handleDeleteGoal}
            onEdit={(goal) => navigate(`/edit-goal/${goal.id}`, { state: { goal } })}
            onToggleSubGoal={handleToggleSubGoal}
          />
        )}

        {yearGoals.length > 0 && (
          <GoalsList
            title="Objetivos del Año"
            goals={yearGoals}
            selectedDate={format(selectedDate, 'yyyy-MM-dd')}
            onToggle={handleToggleGoal}
            onDelete={handleDeleteGoal}
            onEdit={(goal) => navigate(`/edit-goal/${goal.id}`, { state: { goal } })}
            onToggleSubGoal={handleToggleSubGoal}
          />
        )}

        {/* Empty State */}
        {totalCount === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.emptyState}
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={styles.emptyIcon}
            >
              🎯
            </motion.div>
            <h3 style={styles.emptyText}>No hay objetivos todavía</h3>
            <p style={styles.emptySubtext}>Toca el botón + para crear tu primer objetivo</p>
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={styles.fabWrapper}
      >
        <Fab
          onClick={() => navigate('/add-goal', { state: { date: format(selectedDate, 'yyyy-MM-dd') } })}
          sx={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 0 30px ${colors.primary}`,
            '&:hover': {
              boxShadow: `0 0 40px ${colors.primary}`,
            },
          }}
        >
          <AddIcon sx={{ color: colors.surface, fontSize: 32 }} />
        </Fab>
      </motion.div>
    </div>
  );
}

// Componentes auxiliares
function ProgressBar({
  title,
  subtitle,
  completed,
  total,
  percentage,
  color,
}: {
  title: string;
  subtitle?: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: `linear-gradient(135deg, ${colors.surface}, ${colors.surfaceDark})`,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.surfaceLight}`,
        marginBottom: spacing.md,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <div>
          <h4 style={{ color: colors.text, fontSize: 14, fontWeight: 'bold', margin: 0 }}>{title}</h4>
          {subtitle && <p style={{ color: colors.textLight, fontSize: 11, margin: '2px 0 0 0' }}>{subtitle}</p>}
        </div>
        <span style={{ color, fontSize: 20, fontWeight: 'bold' }}>{Math.round(percentage)}%</span>
      </div>
      <div style={{
        height: 10,
        background: colors.surfaceDark,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        border: `1px solid ${colors.surfaceLight}`,
      }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
      <p style={{ color: colors.textLight, fontSize: 12, textAlign: 'center', margin: `${spacing.xs}px 0 0 0` }}>
        {completed} de {total} objetivos completados
      </p>
    </motion.div>
  );
}

function GoalsList({
  title,
  goals,
  selectedDate,
  onToggle,
  onDelete,
  onEdit,
  onToggleSubGoal,
}: {
  title: string;
  goals: Goal[];
  selectedDate: string;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onToggleSubGoal: (goalId: string, subGoalId: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: spacing.lg }}
    >
      <h2 style={styles.goalsTitle}>{title}</h2>
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onToggle={() => onToggle(goal.id, goal.completed)}
          onDelete={() => onDelete(goal.id)}
          onEdit={() => onEdit(goal)}
          onToggleSubGoal={(subGoalId) => onToggleSubGoal(goal.id, subGoalId)}
          selectedDate={selectedDate}
        />
      ))}
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: colors.background,
    position: 'relative',
    paddingBottom: 100,
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
    padding: `${spacing.xl + 20}px ${spacing.lg}px ${spacing.lg}px ${spacing.lg}px`,
    background: colors.surface,
    borderBottom: `1px solid ${colors.primary}30`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    margin: 0,
    letterSpacing: '0.5px',
  },
  date: {
    fontSize: 14,
    color: colors.accent,
    margin: `${spacing.xs}px 0 0 0`,
    textTransform: 'capitalize' as any,
    letterSpacing: '0.3px',
    fontWeight: 600,
  },
  scrollContent: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
  calendarContainer: {
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    border: `1px solid ${colors.primary}40`,
    boxShadow: `0 0 30px ${colors.primary}33`,
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    margin: `${spacing.sm}px ${spacing.lg}px ${spacing.md}px ${spacing.lg}px`,
    padding: spacing.sm,
    background: `${colors.surface}80`,
    borderRadius: borderRadius.md,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: 600,
  },
  progressWrapper: {
    padding: spacing.lg,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    margin: `0 0 ${spacing.md}px 0`,
    letterSpacing: '0.5px',
  },
  emptyState: {
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    textAlign: 'center' as any,
    background: colors.surface,
    border: `1px solid ${colors.surfaceLight}`,
    margin: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    margin: `0 0 ${spacing.xs}px 0`,
    letterSpacing: '0.5px',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    margin: 0,
    letterSpacing: '0.3px',
  },
  fabWrapper: {
    position: 'fixed' as any,
    right: spacing.lg,
    bottom: spacing.lg,
  },
};
