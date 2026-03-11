// 🏠 PANTALLA PRINCIPAL - CALENDARIO Y OBJETIVOS

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { Text, Surface, FAB, Chip, IconButton, Menu, Divider } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import goalService from '../services/goalService';
import { Goal, PeriodType } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';
import GoalCard from '../components/GoalCard';

// Configurar calendario en español
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ],
  dayNames: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fabScaleAnim = useRef(new Animated.Value(1)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentTranslateAnim = useRef(new Animated.Value(24)).current;
  const dayProgressAnim = useRef(new Animated.Value(0)).current;
  const weekProgressAnim = useRef(new Animated.Value(0)).current;
  const monthProgressAnim = useRef(new Animated.Value(0)).current;
  const yearProgressAnim = useRef(new Animated.Value(0)).current;
  const emptyPulseAnim = useRef(new Animated.Value(1)).current;

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

  // Filtrar objetivos que aplican a la fecha seleccionada
  const getGoalsForDate = (period: PeriodType): Goal[] => {
    const date = new Date(selectedDate + 'T00:00:00');
    
    return allGoals.filter(goal => {
      if (goal.period !== period) return false;
      
      const goalDate = new Date(goal.date + 'T00:00:00');
      
      if (period === 'day') {
        return goal.date === selectedDate;
      } else if (period === 'week') {
        const weekStart = startOfWeek(goalDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(goalDate, { weekStartsOn: 1 });
        return date >= weekStart && date <= weekEnd;
      } else if (period === 'month') {
        return goalDate.getMonth() === date.getMonth() && 
               goalDate.getFullYear() === date.getFullYear();
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
  const completedCount = allCurrentGoals.filter(g => g.completed).length;
  const totalCount = allCurrentGoals.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Calcular progreso por tipo de objetivo (incluyendo sub-objetivos)
  const calculateProgress = (goals: Goal[], considerSubGoals: boolean = false) => {
    if (goals.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;

    goals.forEach(goal => {
      if (considerSubGoals && goal.subGoals && goal.subGoals.length > 0) {
        // Filtrar sub-objetivos del día seleccionado
        const todaySubGoals = goal.subGoals.filter(sg => sg.date === selectedDate);
        if (todaySubGoals.length > 0) {
          total += todaySubGoals.length;
          completed += todaySubGoals.filter(sg => sg.completed).length;
        }
      } else {
        // Objetivo simple
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

  //Animar la barra de progreso al cambiar la fecha o el estado de los objetivos
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: completionPercentage,
      duration: 650,
      useNativeDriver: false,
    }).start();
  }, [completionPercentage, progressAnim]);

  // Animar barras de progreso individuales
  useEffect(() => {
    Animated.parallel([
      Animated.timing(dayProgressAnim, {
        toValue: dayProgress.percentage,
        duration: 650,
        useNativeDriver: false,
      }),
      Animated.timing(weekProgressAnim, {
        toValue: weekProgress.percentage,
        duration: 650,
        useNativeDriver: false,
      }),
      Animated.timing(monthProgressAnim, {
        toValue: monthProgress.percentage,
        duration: 650,
        useNativeDriver: false,
      }),
      Animated.timing(yearProgressAnim, {
        toValue: yearProgress.percentage,
        duration: 650,
        useNativeDriver: false,
      }),
    ]).start();
  }, [dayProgress.percentage, weekProgress.percentage, monthProgress.percentage, yearProgress.percentage]);

  //animación de pulso para el FAB
  useEffect(() => {
  const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fabScaleAnim, {
          toValue: 1.04,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(fabScaleAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [fabScaleAnim]);

  useEffect(() => {
    contentFadeAnim.setValue(0.9);
    contentTranslateAnim.setValue(8);

    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedDate, contentFadeAnim, contentTranslateAnim]);

  useEffect(() => {
    const emptyPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(emptyPulseAnim, {
          toValue: 1.06,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(emptyPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (totalCount === 0) {
      emptyPulse.start();
    }

    return () => {
      emptyPulse.stop();
    };
  }, [totalCount, emptyPulseAnim]);

  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const animatedSectionStyle = {
    opacity: contentFadeAnim,
    transform: [{ translateY: contentTranslateAnim }],
  };

  const animatedDayProgressWidth = dayProgressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const animatedWeekProgressWidth = weekProgressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const animatedMonthProgressWidth = monthProgressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const animatedYearProgressWidth = yearProgressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Generar fechas marcadas en el calendario con indicadores de objetivos
  const getCalendarMarkedDates = () => {
    const marked: any = {};
    const currentMonthDate = new Date(selectedDate);

    // Colores unificados por periodo
    const periodColors: Record<PeriodType, string> = {
      day: colors.primary,      // Cyan
      week: colors.secondary,   // Magenta
      month: colors.accent,     // Amarillo
      year: '#10b981',          // Verde
    };

    // Marcar fecha seleccionada
    marked[selectedDate] = {
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.background,
      dots: [],
    };

    // Agregar indicadores para cada objetivo
    allGoals.forEach(goal => {
      const goalDate = new Date(goal.date + 'T00:00:00');
      let datesToMark: string[] = [];

      if (goal.period === 'day') {
        datesToMark = [goal.date];
      } else if (goal.period === 'week') {
        const weekStart = startOfWeek(goalDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(goalDate, { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
        datesToMark = daysInWeek
          .filter(day => isSameMonth(day, currentMonthDate))
          .map(day => format(day, 'yyyy-MM-dd'));
      } else if (goal.period === 'month') {
        const monthStart = startOfMonth(goalDate);
        const monthEnd = endOfMonth(goalDate);
        if (isSameMonth(goalDate, currentMonthDate)) {
          const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
          datesToMark = daysInMonth.map(day => format(day, 'yyyy-MM-dd'));
        }
      } else if (goal.period === 'year') {
        // Para año, marcar todos los días del mes actual
        if (goalDate.getFullYear() === currentMonthDate.getFullYear()) {
          const monthStart = startOfMonth(currentMonthDate);
          const monthEnd = endOfMonth(currentMonthDate);
          const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
          datesToMark = daysInMonth.map(day => format(day, 'yyyy-MM-dd'));
        }
      }

      // Agregar puntos de colores unificados por tipo de periodo
      const periodColor = periodColors[goal.period];
      datesToMark.forEach(dateStr => {
        if (!marked[dateStr]) {
          marked[dateStr] = { dots: [] };
        }
        if (!marked[dateStr].dots) {
          marked[dateStr].dots = [];
        }
        // Solo agregar si no hay ya un punto para ese periodo
        if (!marked[dateStr].dots.some((dot: any) => dot.color === periodColor)) {
          marked[dateStr].dots.push({ color: periodColor });
        }
      });
    });

    // Asegurar que la fecha seleccionada tenga el marcador de selección
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = colors.primary;
      marked[selectedDate].selectedTextColor = colors.background;
    }

    return marked;
  };

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>¡Hola, {user?.displayName?.trim() || 'Usuario'}!</Text>
            <Text style={styles.date}>
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </Text>
          </View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="menu"
                size={24}
                iconColor={colors.primary}
                onPress={() => setMenuVisible(true)}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Stats');
              }}
              title="Estadísticas"
              leadingIcon="chart-line"
              titleStyle={{ color: colors.primary, fontWeight: 'bold' }}
              style={styles.menuItemStats}
            />
            <Divider style={{ backgroundColor: colors.surfaceLight }} />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}
              title="Cerrar sesión"
              leadingIcon="logout"
              titleStyle={{ color: colors.error, fontWeight: 'bold' }}
              style={styles.menuItemLogout}
            />
          </Menu>
        </View>
      </Surface>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Calendario */}
        <Animated.View style={animatedSectionStyle}>
          <Surface style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              hideExtraDays={true}
              markedDates={getCalendarMarkedDates()}
              markingType="multi-dot"
              locale="es"
              theme={{
                backgroundColor: colors.surfaceDark,
                calendarBackground: colors.surfaceDark,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.background,
                todayTextColor: colors.secondary,
                todayBackgroundColor: colors.secondary + '20',
                dayTextColor: colors.text,
                textDisabledColor: colors.textDark,
                monthTextColor: colors.primary,
                arrowColor: colors.primary,
                textMonthFontWeight: 'bold',
                textDayFontSize: 15,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 13,
                textDayHeaderFontWeight: '600',
              }}
            />
          </Surface>
        </Animated.View>

        {/* Leyenda de colores del calendario */}
        <Animated.View style={animatedSectionStyle}>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Día</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>Semana</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendText}>Mes</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Año</Text>
            </View>
          </View>
        </Animated.View>

        {/* Barras de Progreso por Tipo */}
        {totalCount > 0 && (
          <View style={styles.progressWrapper}>
            {/* Progreso Diario */}
            {dayProgress.total > 0 && (
              <Animated.View style={animatedSectionStyle}>
                <Surface style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>
                      Progreso total
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(completionPercentage)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        { width: animatedProgressWidth },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {completedCount} de {totalCount} objetivos completados
                  </Text>
                </Surface>
              </Animated.View>
            )}

            {/* Progreso Semanal (con sub-objetivos del día) */}
            {weekProgress.total > 0 && (
              <Animated.View style={animatedSectionStyle}>
                <Surface style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <View style={styles.progressTitleRow}>
                      <View style={[styles.progressDot, { backgroundColor: colors.secondary }]} />
                      <View>
                        <Text style={styles.progressTitle}>📆 Semanales</Text>
                        <Text style={styles.progressSubtext}>
                          {weekProgress.completed}/{weekProgress.total} hoy
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.progressPercentage, { color: colors.secondary }]}>
                      {Math.round(weekProgress.percentage)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        { 
                          width: animatedWeekProgressWidth,
                          backgroundColor: colors.secondary,
                        },
                      ]}
                    />
                  </View>
                </Surface>
              </Animated.View>
            )}

            {/* Progreso Mensual (con sub-objetivos del día) */}
            {monthProgress.total > 0 && (
              <Animated.View style={animatedSectionStyle}>
                <Surface style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <View style={styles.progressTitleRow}>
                      <View style={[styles.progressDot, { backgroundColor: colors.accent }]} />
                      <View>
                        <Text style={styles.progressTitle}>🗓️ Mensuales</Text>
                        <Text style={styles.progressSubtext}>
                          {monthProgress.completed}/{monthProgress.total} hoy
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.progressPercentage, { color: colors.accent }]}>
                      {Math.round(monthProgress.percentage)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        { 
                          width: animatedMonthProgressWidth,
                          backgroundColor: colors.accent,
                        },
                      ]}
                    />
                  </View>
                </Surface>
              </Animated.View>
            )}

            {/* Progreso Anual */}
            {yearProgress.total > 0 && (
              <Animated.View style={animatedSectionStyle}>
                <Surface style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <View style={styles.progressTitleRow}>
                      <View style={[styles.progressDot, { backgroundColor: '#10b981' }]} />
                      <View>
                        <Text style={styles.progressTitle}>📋 Anuales</Text>
                        <Text style={styles.progressSubtext}>
                          {yearProgress.completed}/{yearProgress.total} completados
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.progressPercentage, { color: '#10b981' }]}>
                      {Math.round(yearProgress.percentage)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        { 
                          width: animatedYearProgressWidth,
                          backgroundColor: '#10b981',
                        },
                      ]}
                    />
                  </View>
                </Surface>
              </Animated.View>
            )}
          </View>
        )}

        {/* Objetivos del Día */}
        {dayGoals.length > 0 && (
          <Animated.View style={animatedSectionStyle}>
            <View style={styles.goalsContainer}>
              <Text style={styles.goalsTitle}>Objetivos del Día</Text>
              {dayGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggle={() => handleToggleGoal(goal.id, goal.completed)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                  onEdit={() => navigation.navigate('EditGoal', { goal })}
                  onToggleSubGoal={(subGoalId) => handleToggleSubGoal(goal.id, subGoalId)}
                  selectedDate={selectedDate}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Objetivos de la Semana */}
        {weekGoals.length > 0 && (
          <Animated.View style={animatedSectionStyle}>
            <View style={styles.goalsContainer}>
              <Text style={styles.goalsTitle}>Objetivos de la Semana</Text>
              {weekGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggle={() => handleToggleGoal(goal.id, goal.completed)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                  onEdit={() => navigation.navigate('EditGoal', { goal })}
                  onToggleSubGoal={(subGoalId) => handleToggleSubGoal(goal.id, subGoalId)}
                  selectedDate={selectedDate}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Objetivos del Mes */}
        {monthGoals.length > 0 && (
          <Animated.View style={animatedSectionStyle}>
            <View style={styles.goalsContainer}>
              <Text style={styles.goalsTitle}>Objetivos del Mes</Text>
              {monthGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggle={() => handleToggleGoal(goal.id, goal.completed)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                  onEdit={() => navigation.navigate('EditGoal', { goal })}
                  onToggleSubGoal={(subGoalId) => handleToggleSubGoal(goal.id, subGoalId)}
                  selectedDate={selectedDate}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Objetivos del Año */}
        {yearGoals.length > 0 && (
          <Animated.View style={animatedSectionStyle}>
            <View style={styles.goalsContainer}>
              <Text style={styles.goalsTitle}>Objetivos del Año</Text>
              {yearGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggle={() => handleToggleGoal(goal.id, goal.completed)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                  onEdit={() => navigation.navigate('EditGoal', { goal })}
                  onToggleSubGoal={(subGoalId) => handleToggleSubGoal(goal.id, subGoalId)}
                  selectedDate={selectedDate}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Estado vacío */}
        {totalCount === 0 && (
          <Animated.View style={animatedSectionStyle}>
            <Surface style={styles.emptyState}>
              <Animated.Text
                style={[
                  styles.emptyIcon,
                  {
                    transform: [{ scale: emptyPulseAnim }],
                  },
                ]}
              >
                🎯
              </Animated.Text>
              <Text style={styles.emptyText}>No hay objetivos todavía</Text>
              <Text style={styles.emptySubtext}>
                Toca el botón + para crear tu primer objetivo
              </Text>
            </Surface>
          </Animated.View>
        )}
      </ScrollView>

      {/* Botón Flotante para Añadir Objetivo */}
      <Animated.View
        style={[
          styles.fabWrapper,
          {
            transform: [{ scale: fabScaleAnim }],
          },
        ]}
      >
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() =>
            navigation.navigate('AddGoal', {
              date: selectedDate,
            })
          }
          color={colors.surface}
        />
      </Animated.View>
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
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '30',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 14,
    color: colors.accent,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
    fontWeight: '600',
  },
  calendarContainer: {
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface + '80',
    borderRadius: borderRadius.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  progressWrapper: {
    gap: spacing.sm,
  },
  progressContainer: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 0.3,
  },
  progressSubtext: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  progressFill: {
    height: '100%',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  goalsContainer: {
    padding: spacing.lg,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  emptyState: {
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  fab: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 15,
  },
  menuContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  menuItemStats: {
    backgroundColor: colors.primary + '10',
  },
  menuItemLogout: {
    backgroundColor: colors.error + '10',
  },
  fabWrapper: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
});
