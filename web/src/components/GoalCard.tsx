// 🎯 COMPONENTE DE TARJETA DE OBJETIVO - WEB VERSION

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, spacing, borderRadius } from '../theme/colors';
import { Goal } from '../types';
import { endOfWeek, endOfMonth, isSameDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton as MuiIconButton,
} from '@mui/material';

interface GoalCardProps {
  goal: Goal;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleSubGoal?: (subGoalId: string) => void;
  selectedDate?: string;
}

export default function GoalCard({
  goal,
  onToggle,
  onDelete,
  onEdit,
  onToggleSubGoal,
  selectedDate,
}: GoalCardProps) {
  const [showSubGoals, setShowSubGoals] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const allSubGoalsCompleted = goal.subGoals?.every((sg) => sg.completed) ?? true;
  const hasSubGoals = (goal.subGoals?.length ?? 0) > 0;

  const filteredSubGoals =
    selectedDate && goal.subGoals
      ? goal.subGoals.filter((sg) => sg.date === selectedDate)
      : goal.subGoals || [];

  const hasFilteredSubGoals = filteredSubGoals.length > 0;

  const isLastDayOfPeriod = () => {
    if (!selectedDate) return false;

    const currentDate = new Date(selectedDate + 'T00:00:00');
    const goalDate = new Date(goal.date + 'T00:00:00');

    if (goal.period === 'week') {
      const weekEnd = endOfWeek(goalDate, { weekStartsOn: 1 });
      return isSameDay(currentDate, weekEnd);
    } else if (goal.period === 'month') {
      const monthEnd = endOfMonth(goalDate);
      return isSameDay(currentDate, monthEnd);
    }

    return false;
  };

  const isMainCheckboxDisabled = () => {
    if (!hasSubGoals) return false;
    if (allSubGoalsCompleted) return false;
    return !isLastDayOfPeriod();
  };

  const getPriorityColor = () => {
    switch (goal.priority) {
      case 'high':
        return colors.priorityHigh;
      case 'medium':
        return colors.priorityMedium;
      case 'low':
        return colors.priorityLow;
      default:
        return colors.textDark;
    }
  };

  const getPriorityLabel = () => {
    switch (goal.priority) {
      case 'high':
        return 'ALTA';
      case 'medium':
        return 'MEDIA';
      case 'low':
        return 'BAJA';
      default:
        return '';
    }
  };

  const styles = getStyles(goal.color, isMainCheckboxDisabled());

  return (
    <>
      <motion.div
        whileHover={{ scale: goal.completed ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={styles.cardWrapper}
        onClick={() => setShowDetails(true)}
      >
        <motion.div
          animate={{
            boxShadow: [
              `0 0 15px ${goal.color}60`,
              `0 0 30px ${goal.color}90`,
              `0 0 15px ${goal.color}60`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={styles.container}
        >
          <div style={styles.neonBar} />

          <div style={styles.content}>
            {/* Checkbox */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (!isMainCheckboxDisabled()) onToggle();
              }}
              style={{
                ...styles.checkboxContainer,
                cursor: isMainCheckboxDisabled() ? 'not-allowed' : 'pointer',
              }}
            >
              <div style={{
                ...styles.checkbox,
                background: goal.completed ? goal.color : 'transparent',
              }}>
                {goal.completed && <span style={styles.checkmark}>✓</span>}
              </div>
            </div>

            {/* Content */}
            <div style={styles.textContainer}>
              <h3 style={styles.title}>{goal.title}</h3>

              {goal.description && (
                <p style={styles.description}>{goal.description}</p>
              )}

              <div style={styles.metadata}>
                <div
                  style={{
                    ...styles.badge,
                    background: `linear-gradient(90deg, ${getPriorityColor()}40, ${getPriorityColor()}20)`,
                    borderColor: getPriorityColor(),
                  }}
                >
                  <span style={{ ...styles.badgeText, color: getPriorityColor() }}>
                    ⚡ {getPriorityLabel()}
                  </span>
                </div>

                <div
                  style={{
                    ...styles.badge,
                    background: `linear-gradient(90deg, ${colors.primary}40, ${colors.primary}20)`,
                    borderColor: colors.primary,
                  }}
                >
                  <span style={{ ...styles.badgeText, color: colors.primary }}>
                    {goal.period === 'day'
                      ? '📅 DÍA'
                      : goal.period === 'week'
                      ? '📆 SEMANA'
                      : goal.period === 'month'
                      ? '🗓️ MES'
                      : '📋 AÑO'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                style={{ ...styles.editButton, borderColor: colors.accent }}
              >
                <span style={{ color: colors.accent }}>✎</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={{ ...styles.deleteButton, borderColor: colors.error }}
              >
                <span style={{ color: colors.error }}>✕</span>
              </button>
            </div>
          </div>

          {/* Sub-goals */}
          {hasFilteredSubGoals && (
            <div style={styles.subGoalsSection}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubGoals(!showSubGoals);
                }}
                style={styles.subGoalsHeader}
              >
                <span style={styles.subGoalsTitle}>
                  📋 Sub-objetivos del día (
                  {filteredSubGoals.filter((sg) => sg.completed).length}/
                  {filteredSubGoals.length})
                </span>
                <span style={styles.expandIcon}>{showSubGoals ? '▲' : '▼'}</span>
              </div>

              <AnimatePresence>
                {showSubGoals && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={styles.subGoalsList}
                  >
                    {filteredSubGoals.map((subGoal) => (
                      <div
                        key={subGoal.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSubGoal && onToggleSubGoal(subGoal.id);
                        }}
                        style={styles.subGoalItem}
                      >
                        <div
                          style={{
                            ...styles.subCheckbox,
                            borderColor: goal.color,
                            backgroundColor: subGoal.completed ? goal.color : 'transparent',
                          }}
                        >
                          {subGoal.completed && (
                            <span style={styles.subCheckmark}>✓</span>
                          )}
                        </div>
                        <span
                          style={{
                            ...styles.subGoalText,
                            ...(subGoal.completed && styles.subGoalTextCompleted),
                          }}
                        >
                          {subGoal.title}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Completed Bar */}
          {goal.completed && (
            <div style={styles.completedBar}>
              <div
                style={{
                  ...styles.completedBarFill,
                  background: `linear-gradient(90deg, ${goal.color}, ${goal.color}80)`,
                }}
              />
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modal Details */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        PaperProps={{
          style: {
            background: `linear-gradient(135deg, ${colors.surface}, ${colors.surfaceDark})`,
            borderRadius: borderRadius.xl,
            border: `2px solid ${goal.color}`,
            boxShadow: `0 0 40px ${goal.color}66`,
            minWidth: 320,
            maxWidth: 480,
          },
        }}
      >
        <div
          style={{
            background: `linear-gradient(90deg, ${goal.color}, ${goal.color}AA, ${goal.color})`,
            height: 8,
          }}
        />
        <DialogTitle sx={{ textAlign: 'center', paddingTop: 3 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `${goal.color}20`,
              border: `2px solid ${goal.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: spacing.md,
              fontSize: 32,
            }}
          >
            🎯
          </div>
          <h2
            style={{
              color: goal.color,
              fontSize: 26,
              fontWeight: 'bold',
              margin: 0,
              textShadow: `0 0 20px ${goal.color}66`,
            }}
          >
            {goal.title}
          </h2>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', paddingBottom: 3 }}>
          {goal.description && (
            <p
              style={{
                color: colors.textLight,
                fontSize: 16,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {goal.description}
            </p>
          )}
        </DialogContent>
        <div style={{ padding: spacing.md, textAlign: 'center' }}>
          <button
            onClick={() => setShowDetails(false)}
            style={{
              background: `${goal.color}15`,
              border: `1.5px solid ${goal.color}`,
              borderRadius: borderRadius.lg,
              padding: `${spacing.sm}px ${spacing.lg}px`,
              color: goal.color,
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            CERRAR
          </button>
        </div>
      </Dialog>
    </>
  );
}

const getStyles = (
  goalColor: string,
  isDisabled: boolean
): Record<string, React.CSSProperties> => ({
  cardWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
    cursor: 'pointer',
  },
  container: {
    borderRadius: borderRadius.lg,
    border: `1px solid ${goalColor}`,
    background: `linear-gradient(135deg, ${colors.surface}, ${colors.surfaceDark})`,
    position: 'relative',
    overflow: 'hidden',
  },
  neonBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: goalColor,
    boxShadow: `0 0 20px ${goalColor}`,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    padding: spacing.md,
    paddingLeft: spacing.md + 8,
  },
  checkboxContainer: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: `2px solid ${goalColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    opacity: isDisabled ? 0.5 : 1,
  },
  checkmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.text,
    margin: `0 0 ${spacing.xs}px 0`,
    letterSpacing: '0.5px',
  },
  description: {
    fontSize: 13,
    color: colors.textLight,
    margin: `0 0 ${spacing.sm}px 0`,
    lineHeight: 1.4,
  },
  metadata: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap' as any,
  },
  badge: {
    padding: `4px ${spacing.sm + 2}px`,
    borderRadius: borderRadius.sm,
    border: '1px solid',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.5px',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column' as any,
    gap: spacing.sm,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    border: '1.5px solid',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    border: '1.5px solid',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  subGoalsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTop: `1px solid ${colors.surfaceDark}`,
  },
  subGoalsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.xs}px ${spacing.sm}px`,
    cursor: 'pointer',
  },
  subGoalsTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.primary,
    letterSpacing: '0.5px',
  },
  expandIcon: {
    fontSize: 12,
    color: colors.primary,
  },
  subGoalsList: {
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  subGoalItem: {
    display: 'flex',
    alignItems: 'center',
    padding: `${spacing.sm}px ${spacing.md}px`,
    background: `${colors.surfaceDark}40`,
    marginBottom: 6,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
  },
  subCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  subCheckmark: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  subGoalText: {
    flex: 1,
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 1.4,
  },
  subGoalTextCompleted: {
    textDecoration: 'line-through',
    color: colors.textDark,
    opacity: 0.6,
  },
  completedBar: {
    height: 4,
    background: colors.surfaceDark,
  },
  completedBarFill: {
    height: '100%',
    width: '100%',
  },
});
