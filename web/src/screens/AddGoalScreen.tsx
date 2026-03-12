// ➕ PANTALLA PARA AÑADIR OBJETIVO - Web Version

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import { format, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import goalService from '../services/goalService';
import { PeriodType, SubGoal } from '../types';
import { colors, spacing, borderRadius } from '../theme/colors';
import {
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Close as CloseIcon,
  Add as AddIcon,
  CalendarToday,
} from '@mui/icons-material';

export default function AddGoalScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { date, period } = (location.state as any) || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(period || 'day');
  const [selectedDate, setSelectedDate] = useState(date || format(new Date(), 'yyyy-MM-dd'));
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedColor, setSelectedColor] = useState(colors.goalColors[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [newSubGoalText, setNewSubGoalText] = useState('');
  const [newSubGoalDate, setNewSubGoalDate] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [showSubGoalDatePicker, setShowSubGoalDatePicker] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const convertToISODate = (dateStr: string): string => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  const convertToDisplayDate = (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getDateSelectorLabel = () => {
    switch (selectedPeriod) {
      case 'day': return '¿Para qué día?';
      case 'week': return '¿Para qué semana?';
      case 'month': return '¿Para qué mes?';
      case 'year': return '¿Para qué año?';
    }
  };

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

  const removeSubGoal = (id: string) => {
    setSubGoals(subGoals.filter((sg) => sg.id !== id));
  };

  const handleSave = async () => {
    setError('');
    setTitleError(false);

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
        subGoals: selectedPeriod === 'week' || selectedPeriod === 'month' ? subGoals : undefined,
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al crear el objetivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <IconButton onClick={() => navigate('/')} sx={{ color: colors.primary }}>
          <ArrowBack />
        </IconButton>
        <h1 style={styles.headerTitle}>Nuevo Objetivo</h1>
        <div style={{ width: 40 }} />
      </div>

      <div style={styles.scrollContent}>
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.section}
        >
          <div style={styles.labelRow}>
            <span style={styles.label}>Título</span>
            <div style={styles.requiredBadge}>
              <span style={styles.requiredText}>Obligatorio</span>
            </div>
          </div>
          <TextField
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(false);
            }}
            placeholder="Ej: Hacer ejercicio 30 minutos"
            fullWidth
            error={titleError}
            helperText={titleError ? 'El título es necesario para crear el objetivo' : ''}
            inputProps={{ maxLength: 100 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: colors.surfaceDark,
                color: colors.text,
                '& fieldset': { borderColor: titleError ? colors.error : colors.surfaceLight },
                '&:hover fieldset': { borderColor: titleError ? colors.error : colors.primary },
                '&.Mui-focused fieldset': { borderColor: titleError ? colors.error : colors.primary },
              },
            }}
          />
        </motion.div>

        {/* Descripción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={styles.section}
        >
          <span style={styles.label}>Descripción (opcional)</span>
          <TextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Añade detalles sobre tu objetivo..."
            multiline
            rows={4}
            fullWidth
            inputProps={{ maxLength: 500 }}
            sx={{
              marginTop: `${spacing.sm}px`,
              '& .MuiOutlinedInput-root': {
                background: colors.surfaceDark,
                color: colors.text,
                '& fieldset': { borderColor: colors.surfaceLight },
                '&:hover fieldset': { borderColor: colors.primary },
                '&.Mui-focused fieldset': { borderColor: colors.primary },
              },
            }}
          />
        </motion.div>

        {/* Periodo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.section}
        >
          <div style={styles.labelRow}>
            <span style={styles.label}>Periodo</span>
            <div style={styles.requiredBadge}>
              <span style={styles.requiredText}>Obligatorio</span>
            </div>
          </div>
          <div style={styles.chipsContainer}>
            {([
              { value: 'day', label: '📅 Día' },
              { value: 'week', label: '📆 Semana' },
              { value: 'month', label: '🗓️ Mes' },
              { value: 'year', label: '📊 Año' },
            ] as const).map((p) => (
              <Chip
                key={p.value}
                label={p.label}
                onClick={() => setSelectedPeriod(p.value)}
                sx={{
                  background: selectedPeriod === p.value ? colors.primary : colors.surface,
                  color: selectedPeriod === p.value ? colors.background : colors.text,
                  border: `1px solid ${selectedPeriod === p.value ? colors.primary : colors.surfaceLight}`,
                  fontWeight: 'bold',
                  '&:hover': {
                    background: selectedPeriod === p.value ? colors.primary : colors.surfaceLight,
                  },
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Selector de Fecha */}
        {selectedPeriod !== 'year' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={styles.section}
          >
            <div style={styles.labelRow}>
              <span style={styles.label}>{getDateSelectorLabel()}</span>
              <div style={styles.requiredBadge}>
                <span style={styles.requiredText}>Obligatorio</span>
              </div>
            </div>
            <button onClick={() => setShowCalendar(!showCalendar)} style={styles.dateButton}>
              <span style={styles.dateButtonText}>
                {selectedPeriod === 'day' && format(new Date(selectedDate), 'dd/MM/yyyy')}
                {selectedPeriod === 'week' &&
                  `Semana del ${format(startOfWeek(new Date(selectedDate), { weekStartsOn: 1 }), 'dd/MM')}`}
                {selectedPeriod === 'month' && format(new Date(selectedDate), 'MMMM yyyy', { locale: es })}
              </span>
              <CalendarToday sx={{ color: colors.primary }} />
            </button>

            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.calendarWrapper}
                >
                  <Calendar
                    value={new Date(selectedDate)}
                    onChange={(value) => {
                      const newDate = format(value as Date, 'yyyy-MM-dd');
                      setSelectedDate(newDate);
                      if (selectedPeriod === 'day') setShowCalendar(false);
                    }}
                    locale="es-ES"
                    className="custom-calendar"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {selectedPeriod === 'year' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={styles.section}
          >
            <div style={styles.labelRow}>
              <span style={styles.label}>Año</span>
              <div style={styles.requiredBadge}>
                <span style={styles.requiredText}>Obligatorio</span>
              </div>
            </div>
            <div style={styles.yearText}>{new Date().getFullYear()}</div>
          </motion.div>
        )}

        {/* Sub-objetivos */}
        {(selectedPeriod === 'week' || selectedPeriod === 'month') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.section}
          >
            <div style={styles.subGoalsHeader}>
              <span style={styles.label}>Objetivos diarios</span>
              <Button onClick={generateSubGoals} sx={{ color: colors.primary, textTransform: 'none' }}>
                Generar automáticamente
              </Button>
            </div>
            <p style={styles.subGoalsHint}>
              {selectedPeriod === 'week'
                ? 'Añade objetivos para cada día de la semana'
                : 'Añade objetivos para cada día del mes'}
            </p>

            {/* Lista de sub-objetivos */}
            <AnimatePresence>
              {subGoals.map((subGoal) => (
                <motion.div
                  key={subGoal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={styles.subGoalItem}
                >
                  <div style={{ flex: 1 }}>
                    <div style={styles.subGoalText}>{subGoal.title}</div>
                    <div style={styles.subGoalDate}>📅 {convertToDisplayDate(subGoal.date)}</div>
                  </div>
                  <IconButton onClick={() => removeSubGoal(subGoal.id)} size="small">
                    <CloseIcon sx={{ color: colors.error }} />
                  </IconButton>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Añadir sub-objetivo */}
            <div style={styles.addSubGoalContainer}>
              <TextField
                value={newSubGoalText}
                onChange={(e) => setNewSubGoalText(e.target.value)}
                placeholder="Título del objetivo diario..."
                size="small"
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === 'Enter') addCustomSubGoal();
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: colors.surfaceDark,
                    color: colors.text,
                    '& fieldset': { borderColor: colors.surfaceLight },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
              <button onClick={() => setShowSubGoalDatePicker(true)} style={styles.subGoalDateButton}>
                📅 {newSubGoalDate}
              </button>
              <IconButton onClick={addCustomSubGoal} sx={{ color: colors.primary, border: `1px solid ${colors.primary}` }}>
                <AddIcon />
              </IconButton>
            </div>
          </motion.div>
        )}

        {/* Modal de fecha de sub-objetivo */}
        <Dialog
          open={showSubGoalDatePicker}
          onClose={() => setShowSubGoalDatePicker(false)}
          PaperProps={{
            style: {
              background: colors.surface,
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.primary}40`,
            },
          }}
        >
          <DialogTitle sx={{ color: colors.primary, fontWeight: 'bold' }}>
            Seleccionar fecha
            <IconButton
              onClick={() => setShowSubGoalDatePicker(false)}
              sx={{ position: 'absolute', right: 8, top: 8, color: colors.text }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Calendar
              value={new Date(convertToISODate(newSubGoalDate))}
              onChange={(value) => {
                const newDate = format(value as Date, 'dd/MM/yyyy');
                setNewSubGoalDate(newDate);
                setShowSubGoalDatePicker(false);
              }}
              locale="es-ES"
              className="custom-calendar"
            />
          </DialogContent>
        </Dialog>

        {/* Prioridad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={styles.section}
        >
          <span style={styles.label}>Prioridad</span>
          <div style={styles.chipsContainer}>
            {([
              { value: 'low', label: '🟢 Baja', color: colors.priorityLow },
              { value: 'medium', label: '🟡 Media', color: colors.priorityMedium },
              { value: 'high', label: '🔴 Alta', color: colors.priorityHigh },
            ] as const).map((p) => (
              <Chip
                key={p.value}
                label={p.label}
                onClick={() => setPriority(p.value)}
                sx={{
                  background: priority === p.value ? p.color : colors.surface,
                  color: priority === p.value ? colors.background : colors.text,
                  border: `1px solid ${priority === p.value ? p.color : colors.surfaceLight}`,
                  fontWeight: 'bold',
                  '&:hover': {
                    background: priority === p.value ? p.color : colors.surfaceLight,
                  },
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Color */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.section}
        >
          <span style={styles.label}>Color</span>
          <div style={styles.colorsContainer}>
            {colors.goalColors.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedColor(color)}
                style={{
                  ...styles.colorOption,
                  background: color,
                  borderColor: selectedColor === color ? colors.text : 'transparent',
                  boxShadow: selectedColor === color ? `0 0 20px ${color}` : `0 0 10px ${color}66`,
                }}
              >
                {selectedColor === color && <span style={styles.colorCheck}>✓</span>}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={styles.preview}
        >
          <p style={styles.previewLabel}>Vista Previa</p>
          <div style={{ ...styles.previewCard, borderLeftColor: selectedColor }}>
            <div style={styles.previewDot} />
            <div style={styles.previewContent}>
              <h3 style={styles.previewTitle}>{title || 'Tu objetivo aquí'}</h3>
              {description && <p style={styles.previewDescription}>{description}</p>}
            </div>
          </div>
        </motion.div>

        {error && (
          <p style={{ color: colors.error, textAlign: 'center', marginTop: spacing.md }}>{error}</p>
        )}
      </div>

      {/* Footer Button */}
      <div style={styles.footer}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          fullWidth
          sx={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            padding: `${spacing.md}px`,
            fontSize: 16,
            fontWeight: 'bold',
            borderRadius: `${borderRadius.md}px`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
            },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: colors.surface }} /> : 'Guardar Objetivo'}
        </Button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: colors.background,
    paddingBottom: 100,
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
    maxWidth: 800,
    margin: '0 auto',
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.5,
  },
  requiredBadge: {
    background: `${colors.primary}20`,
    padding: `2px ${spacing.sm}px`,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.primary}40`,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as any,
  },
  chipsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as any,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dateButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    background: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.surfaceLight}`,
    cursor: 'pointer',
    marginTop: spacing.sm,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  calendarWrapper: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  yearText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center' as any,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  subGoalsHeader: {
    display: 'flex',
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
    display: 'flex',
    alignItems: 'center',
    background: colors.surfaceDark,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.surfaceLight}`,
    marginBottom: spacing.sm,
  },
  subGoalText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  subGoalDate: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  addSubGoalContainer: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  subGoalDateButton: {
    padding: `10px 16px`,
    background: colors.surface,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.accent}`,
    color: colors.text,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as any,
  },
  colorsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as any,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    border: '3px solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  colorCheck: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
  preview: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    background: colors.surface,
    border: `1px solid ${colors.surfaceLight}`,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  previewCard: {
    display: 'flex',
    padding: spacing.md,
    background: colors.surfaceDark,
    borderRadius: borderRadius.md,
    borderLeft: '4px solid',
  },
  previewDot: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    background: colors.textDark,
    marginRight: spacing.md,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    margin: `0 0 ${spacing.xs}px 0`,
    letterSpacing: 0.5,
  },
  previewDescription: {
    fontSize: 14,
    color: colors.textLight,
    margin: 0,
    letterSpacing: 0.3,
  },
  footer: {
    position: 'fixed' as any,
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    background: colors.surface,
    borderTop: `1px solid ${colors.surfaceLight}`,
    maxWidth: 800,
    margin: '0 auto',
  },
};
