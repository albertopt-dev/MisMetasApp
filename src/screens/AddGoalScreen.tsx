// ➕ PANTALLA PARA AÑADIR OBJETIVO

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  Chip,
  HelperText,
  IconButton,
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import goalService from '../services/goalService';
import { PeriodType, SubGoal } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

export default function AddGoalScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { date, period } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(period || 'day');
  const [selectedDate, setSelectedDate] = useState(date || format(new Date(), 'yyyy-MM-dd'));
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedColor, setSelectedColor] = useState(colors.primary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [newSubGoalText, setNewSubGoalText] = useState('');
  const [newSubGoalDate, setNewSubGoalDate] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [showSubGoalDatePicker, setShowSubGoalDatePicker] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const periodScrollRef = useRef<ScrollView>(null);

  // Convertir DD/MM/YYYY a YYYY-MM-DD
  const convertToISODate = (dateStr: string): string => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  // Convertir YYYY-MM-DD a DD/MM/YYYY
  const convertToDisplayDate = (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };
  const priorityScrollRef = useRef<ScrollView>(null);
  const colorScrollRef = useRef<ScrollView>(null);
  // Obtener texto del selector de fecha según periodo
  const getDateSelectorLabel = () => {
    switch (selectedPeriod) {
      case 'day': return '¿Para qué día?';
      case 'week': return '¿Para qué semana?';
      case 'month': return '¿Para qué mes?';
      case 'year': return '¿Para qué año?';
    }
  };

  // Obtener fechas marcadas en el calendario según periodo y fecha seleccionada
  const getMarkedDates = () => {
    const marked: any = {};
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');

    if (selectedPeriod === 'day') {
      marked[selectedDate] = {
        selected: true,
        selectedColor: selectedColor,
      };
    } else if (selectedPeriod === 'week') {
      const weekStart = startOfWeek(selectedDateObj, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDateObj, { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      daysInWeek.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        marked[dateStr] = {
          selected: true,
          selectedColor: selectedColor + '80',
          startingDay: day.getTime() === weekStart.getTime(),
          endingDay: day.getTime() === weekEnd.getTime(),
          color: selectedColor,
        };
      });
    } else if (selectedPeriod === 'month') {
      const monthStart = startOfMonth(selectedDateObj);
      const monthEnd = endOfMonth(selectedDateObj);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      daysInMonth.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        marked[dateStr] = {
          selected: true,
          selectedColor: selectedColor + '40',
          color: selectedColor,
        };
      });
    }

    return marked;
  };

  // Manejar selección de fecha en el calendario
  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    if (selectedPeriod === 'day') {
      setShowCalendar(false);
    }
  };
  // Generar sub-objetivos automáticamente para semana/mes
  const generateSubGoals = () => {
    if (selectedPeriod === 'day' || selectedPeriod === 'year') {
      setSubGoals([]);
      return;
    }

    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const days: Date[] = [];

    if (selectedPeriod === 'week') {
      const weekStart = startOfWeek(selectedDateObj, { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
        days.push(addDays(weekStart, i));
      }
    } else if (selectedPeriod === 'month') {
      const monthStart = startOfMonth(selectedDateObj);
      const monthEnd = endOfMonth(selectedDateObj);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      days.push(...daysInMonth);
    }

    const generatedSubGoals: SubGoal[] = days.map((day, index) => ({
      id: `temp-${index}`,
      title: format(day, "EEEE d 'de' MMMM", { locale: es }),
      completed: false,
      date: format(day, 'yyyy-MM-dd'),
    }));

    setSubGoals(generatedSubGoals);
  };

  // Obtener fechas marcadas para el calendario de sub-objetivos (marcar la semana seleccionada)
  const getSubGoalCalendarMarkedDates = () => {
    const marked: any = {};
    
    if (selectedPeriod === 'week') {
      const selectedDateObj = new Date(selectedDate + 'T00:00:00');
      const weekStart = startOfWeek(selectedDateObj, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDateObj, { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      // Marcar toda la semana
      daysInWeek.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        marked[dateStr] = {
          selected: true,
          marked: true,
          selectedColor: colors.secondary + '40',
          dotColor: colors.secondary,
        };
      });
    } else if (selectedPeriod === 'month') {
      const selectedDateObj = new Date(selectedDate + 'T00:00:00');
      const monthStart = startOfMonth(selectedDateObj);
      const monthEnd = endOfMonth(selectedDateObj);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      // Marcar todo el mes
      daysInMonth.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        marked[dateStr] = {
          selected: true,
          marked: true,
          selectedColor: colors.accent + '40',
          dotColor: colors.accent,
        };
      });
    }

    // Marcar la fecha actual del sub-objetivo si está seleccionada
    const currentISODate = convertToISODate(newSubGoalDate);
    if (currentISODate && marked[currentISODate]) {
      marked[currentISODate] = {
        ...marked[currentISODate],
        selectedColor: colors.primary,
        selected: true,
      };
    } else if (currentISODate) {
      marked[currentISODate] = {
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return marked;
  };

  // Añadir sub-objetivo personalizado
  const addCustomSubGoal = () => {
    if (!newSubGoalText.trim()) return;

    const newSubGoal: SubGoal = {
      id: `temp-${Date.now()}`,
      title: newSubGoalText.trim(),
      completed: false,
      date: convertToISODate(newSubGoalDate),
    };

    setSubGoals([...subGoals, newSubGoal]);
    setNewSubGoalText('');
    setNewSubGoalDate(format(new Date(), 'dd/MM/yyyy'));
  };

  // Actualizar fecha de un sub-objetivo
  const updateSubGoalDate = (id: string, newDate: string) => {
    setSubGoals(subGoals.map(sg => 
      sg.id === id ? { ...sg, date: newDate } : sg
    ));
  };

  // Eliminar sub-objetivo
  const removeSubGoal = (id: string) => {
    setSubGoals(subGoals.filter(sg => sg.id !== id));
  };
    const handleSave = async () => {
    setError('');
    setTitleError(false);

    // Validar campos obligatorios
    if (!title.trim()) {
      setTitleError(true);
      setError('Por favor, completa el título del objetivo');
      return;
    }

    if (!user) return;

    setLoading(true);

    try {
      await goalService.createGoal(user.uid, {
        title: title.trim(),
        description: description.trim(),
        period: selectedPeriod,
        date: selectedDate,
        priority,
        color: selectedColor,
        subGoals: (selectedPeriod === 'week' || selectedPeriod === 'month') ? subGoals : undefined,
      });

      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Error al crear el objetivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Nuevo Objetivo</Text>
          <View style={{ width: 40 }} />
        </View>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Título */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Título</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Obligatorio</Text>
            </View>
          </View>
          <TextInput
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError(false);
            }}
            mode="outlined"
            placeholder="Ej: Hacer ejercicio 30 minutos"
            style={styles.input}
            outlineColor={titleError ? colors.error : colors.surfaceLight}
            activeOutlineColor={titleError ? colors.error : colors.primary}
            error={titleError}
            textColor={colors.text}
            placeholderTextColor={colors.textDark}
            theme={{ colors: { onSurfaceVariant: colors.textLight } }}
            maxLength={100}
          />
          {titleError && (
            <HelperText type="error" visible={titleError}>
              El título es necesario para crear el objetivo
            </HelperText>
          )}
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            placeholder="Añade detalles sobre tu objetivo..."
            multiline
            numberOfLines={4}
            style={styles.input}
            outlineColor={colors.surfaceLight}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            placeholderTextColor={colors.textDark}
            theme={{ colors: { onSurfaceVariant: colors.textLight } }}
            maxLength={500}
          />
        </View>

        {/* Sub-objetivos diarios para semana/mes */}
        {(selectedPeriod === 'week' || selectedPeriod === 'month') && (
          <View style={styles.section}>
            <View style={styles.subGoalsHeader}>
              <Text style={styles.label}>Objetivos diarios</Text>
              <Button
                mode="text"
                onPress={generateSubGoals}
                textColor={colors.primary}
                compact
              >
                Generar automáticamente
              </Button>
            </View>
            <Text style={styles.subGoalsHint}>
              {selectedPeriod === 'week' 
                ? 'Añade objetivos para cada día de la semana' 
                : 'Añade objetivos para cada día del mes'}
            </Text>

            {/* Lista de sub-objetivos */}
            {subGoals.map((subGoal) => (
              <Surface key={subGoal.id} style={styles.subGoalItem}>
                <View style={styles.subGoalContent}>
                  <View style={styles.subGoalTextContainer}>
                    <Text style={styles.subGoalText}>{subGoal.title}</Text>
                    <TouchableOpacity 
                      style={styles.subGoalDateButton}
                      onPress={() => {}}
                    >
                      <Text style={styles.subGoalDateText}>
                        📅 {convertToDisplayDate(subGoal.date)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeSubGoal(subGoal.id)}>
                    <IconButton icon="close" size={20} iconColor={colors.error} />
                  </TouchableOpacity>
                </View>
              </Surface>
            ))}

            {/* Añadir sub-objetivo personalizado */}
            <View style={styles.addSubGoalContainer}>
              <TextInput
                value={newSubGoalText}
                onChangeText={setNewSubGoalText}
                placeholder="Título del objetivo diario..."
                mode="outlined"
                style={styles.subGoalInput}
                outlineColor={colors.surfaceLight}
                activeOutlineColor={colors.primary}
                textColor={colors.text}
                placeholderTextColor={colors.textDark}
                theme={{ colors: { onSurfaceVariant: colors.textLight } }}
                onSubmitEditing={addCustomSubGoal}
              />
              <TouchableOpacity
                onPress={() => setShowSubGoalDatePicker(true)}
                style={styles.subGoalDateButton2}
              >
                <Text style={styles.subGoalDateButtonText}>
                  📅 {newSubGoalDate}
                </Text>
              </TouchableOpacity>
              <IconButton
                icon="plus"
                size={28}
                iconColor={colors.primary}
                onPress={addCustomSubGoal}
                style={styles.addSubGoalButton}
              />
            </View>
          </View>
        )}

        {/* Modal de selección de fecha para sub-objetivos */}
        <Modal
          visible={showSubGoalDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSubGoalDatePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSubGoalDatePicker(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar fecha</Text>
                <IconButton
                  icon="close"
                  iconColor={colors.text}
                  onPress={() => setShowSubGoalDatePicker(false)}
                />
              </View>
              <Calendar
                current={convertToISODate(newSubGoalDate)}
                onDayPress={(day) => {
                  const newDate = format(new Date(day.dateString), 'dd/MM/yyyy');
                  setNewSubGoalDate(newDate);
                  setShowSubGoalDatePicker(false);
                }}
                markedDates={getSubGoalCalendarMarkedDates()}
                theme={{
                  calendarBackground: colors.surface,
                  textSectionTitleColor: colors.textLight,
                  selectedDayBackgroundColor: colors.primary,
                  selectedDayTextColor: colors.background,
                  todayTextColor: colors.primary,
                  dayTextColor: colors.text,
                  textDisabledColor: colors.textDark,
                  monthTextColor: colors.text,
                  arrowColor: colors.primary,
                }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Periodo */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Periodo</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Obligatorio</Text>
            </View>
          </View>
          <View style={styles.scrollContainer}>
            <TouchableOpacity 
              style={styles.scrollIndicator}
              onPress={() => periodScrollRef.current?.scrollTo({ x: 0, animated: true })}
            >
              <Text style={styles.scrollArrow}>‹</Text>
            </TouchableOpacity>
            <ScrollView ref={periodScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
              <Chip
                selected={selectedPeriod === 'day'}
                onPress={() => setSelectedPeriod('day')}
                style={styles.chip}
                selectedColor={colors.primary}
              >
                📅 Día
              </Chip>
              <Chip
                selected={selectedPeriod === 'week'}
                onPress={() => setSelectedPeriod('week')}
                style={styles.chip}
                selectedColor={colors.primary}
              >
                📆 Semana
              </Chip>
              <Chip
                selected={selectedPeriod === 'month'}
                onPress={() => setSelectedPeriod('month')}
                style={styles.chip}
                selectedColor={colors.primary}
              >
                🗓️ Mes
              </Chip>
              <Chip
                selected={selectedPeriod === 'year'}
                onPress={() => setSelectedPeriod('year')}
                style={styles.chip}
                selectedColor={colors.primary}
              >
                📊 Año
              </Chip>
            </ScrollView>
            <TouchableOpacity 
              style={styles.scrollIndicator}
              onPress={() => periodScrollRef.current?.scrollTo({ x: 500, animated: true })}
            >
              <Text style={styles.scrollArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selector de Fecha */}
        {selectedPeriod !== 'year' && (
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{getDateSelectorLabel()}</Text>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>Obligatorio</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowCalendar(!showCalendar)}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>
                {selectedPeriod === 'day' && format(new Date(selectedDate), 'dd/MM/yyyy')}
                {selectedPeriod === 'week' && `Semana del ${format(startOfWeek(new Date(selectedDate), { weekStartsOn: 1 }), 'dd/MM')}`}
                {selectedPeriod === 'month' && format(new Date(selectedDate), 'MMMM yyyy', { locale: es })}
              </Text>
              <Text style={styles.dateButtonIcon}>📅</Text>
            </TouchableOpacity>

            {showCalendar && (
              <Surface style={styles.calendarContainer}>
                <Calendar
                  current={selectedDate}
                  onDayPress={handleDayPress}
                  markedDates={getMarkedDates()}
                  markingType={selectedPeriod === 'week' ? 'period' : 'simple'}
                  theme={{
                    backgroundColor: colors.surface,
                    calendarBackground: colors.surface,
                    textSectionTitleColor: colors.text,
                    selectedDayBackgroundColor: selectedColor,
                    selectedDayTextColor: colors.background,
                    todayTextColor: colors.secondary,
                    dayTextColor: colors.text,
                    textDisabledColor: colors.textDark,
                    monthTextColor: colors.primary,
                    textMonthFontWeight: 'bold',
                  }}
                />
              </Surface>
            )}
          </View>
        )}

        {selectedPeriod === 'year' && (
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Año</Text>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>Obligatorio</Text>
              </View>
            </View>
            <Text style={styles.yearText}>{new Date().getFullYear()}</Text>
          </View>
        )}

        {/* Prioridad */}
        <View style={styles.section}>
          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.scrollContainer}>
            <TouchableOpacity 
              style={styles.scrollIndicator}
              onPress={() => priorityScrollRef.current?.scrollTo({ x: 0, animated: true })}
            >
              <Text style={styles.scrollArrow}>‹</Text>
            </TouchableOpacity>
            <ScrollView ref={priorityScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
              <Chip
                selected={priority === 'low'}
                onPress={() => setPriority('low')}
                style={styles.chip}
                selectedColor={colors.priorityLow}
              >
                🟢 Baja
              </Chip>
              <Chip
                selected={priority === 'medium'}
                onPress={() => setPriority('medium')}
                style={styles.chip}
                selectedColor={colors.priorityMedium}
              >
                🟡 Media
              </Chip>
              <Chip
                selected={priority === 'high'}
                onPress={() => setPriority('high')}
                style={styles.chip}
                selectedColor={colors.priorityHigh}
              >
                🔴 Alta
              </Chip>
            </ScrollView>
            <TouchableOpacity 
              style={styles.scrollIndicator}
              onPress={() => priorityScrollRef.current?.scrollTo({ x: 500, animated: true })}
            >
              <Text style={styles.scrollArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Color */}
        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.scrollContainer}>
            <TouchableOpacity 
              style={styles.scrollIndicator}
              onPress={() => colorScrollRef.current?.scrollTo({ x: 0, animated: true })}
            >
              <Text style={styles.scrollArrow}>‹</Text>
            </TouchableOpacity>
            <ScrollView ref={colorScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
              {colors.goalColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                >
                  {selectedColor === color && (
                    <Text style={styles.colorCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.scrollIndicator}
              onPress={() => colorScrollRef.current?.scrollTo({ x: 500, animated: true })}
            >
              <Text style={styles.scrollArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <HelperText type="error" visible={true}>
            {error}
          </HelperText>
        ) : null}

        {/* Preview */}
        <Surface style={styles.preview}>
          <Text style={styles.previewLabel}>Vista Previa</Text>
          <View style={[styles.previewCard, { borderLeftColor: selectedColor }]}>
            <View style={styles.previewDot} />
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>{title || 'Tu objetivo aquí'}</Text>
              {description ? (
                <Text style={styles.previewDescription}>{description}</Text>
              ) : null}
            </View>
          </View>
        </Surface>
      </ScrollView>

      {/* Botón Guardar */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor={colors.primary}
          contentStyle={styles.buttonContent}
        >
          Guardar Objetivo
        </Button>
      </View>
    </KeyboardAvoidingView>
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
  section: {
    marginBottom: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.5,
  },
  requiredBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surfaceDark,
  },
  chip: {
    marginRight: spacing.sm,
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollIndicator: {
    width: 32,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface + 'AA',
  },
  scrollArrow: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.text,
    shadowRadius: 15,
  },
  colorCheck: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
  preview: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  previewCard: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
  },
  previewDot: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.textDark,
    marginRight: spacing.md,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  previewDescription: {
    fontSize: 14,
    color: colors.textLight,
    letterSpacing: 0.3,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  button: {
    borderRadius: borderRadius.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  dateButtonIcon: {
    fontSize: 20,
  },
  calendarContainer: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  yearText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  subGoalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  subGoalsHint: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  subGoalItem: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  subGoalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: spacing.md,
  },
  subGoalTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  subGoalText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  subGoalDateButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  subGoalDateText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  addSubGoalContainer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  subGoalInput: {
    backgroundColor: colors.surfaceDark,
    fontSize: 14,
    flex: 1,
  },
  subGoalDateInput: {
    backgroundColor: colors.surfaceDark,
    fontSize: 14,
    width: 160,
  },
  addSubGoalButton: {
    margin: 0,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subGoalDateButton2: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
});
