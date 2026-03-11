// 🎯 COMPONENTE DE TARJETA DE OBJETIVO - DISEÑO FUTURISTA

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import { Goal } from '../types';

interface GoalCardProps {
  goal: Goal;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleSubGoal?: (subGoalId: string) => void;
  selectedDate?: string; // yyyy-MM-dd format
}

export default function GoalCard({ goal, onToggle, onDelete, onEdit, onToggleSubGoal, selectedDate }: GoalCardProps) {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [translateYAnim] = useState(new Animated.Value(22));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showSubGoals, setShowSubGoals] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [modalScaleAnim] = useState(new Animated.Value(0.8));
  const [modalFadeAnim] = useState(new Animated.Value(0));

  // Calcular si todos los sub-objetivos están completados
  const allSubGoalsCompleted = goal.subGoals?.every(sg => sg.completed) ?? true;
  const hasSubGoals = (goal.subGoals?.length ?? 0) > 0;

  // Filtrar sub-objetivos por fecha seleccionada (solo para día actual)
  const filteredSubGoals = selectedDate && goal.subGoals
    ? goal.subGoals.filter(sg => sg.date === selectedDate)
    : goal.subGoals || [];

  const hasFilteredSubGoals = filteredSubGoals.length > 0;

  // Animación de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  }, [fadeAnim, glowAnim, translateYAnim]);

  // Animación del modal
  useEffect(() => {
    if (showDetails) {
      Animated.parallel([
        Animated.timing(modalFadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalScaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showDetails, modalFadeAnim, modalScaleAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
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

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        marginBottom: spacing.md,
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => setShowDetails(true)}
        activeOpacity={0.9}
      >
        <View style={styles.cardWrapper}>
          {/* Efecto de brillo/glow animado */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowOpacity,
                shadowColor: goal.color,
                borderColor: goal.color,
              },
            ]}
          />

          {/* Tarjeta principal */}
          <LinearGradient
            colors={[colors.surface, colors.surfaceDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, { borderColor: goal.color }]}
          >
            {/* Barra lateral neón */}
            <View style={[styles.neonBar, { backgroundColor: goal.color }]} />

            <View style={styles.content}>
              {/* Checkbox personalizado */}
              <TouchableOpacity
                onPress={hasSubGoals && !allSubGoalsCompleted ? undefined : onToggle}
                style={styles.checkboxContainer}
                disabled={hasSubGoals && !allSubGoalsCompleted}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: goal.color },
                    goal.completed && { backgroundColor: goal.color },
                    hasSubGoals && !allSubGoalsCompleted && styles.checkboxDisabled,
                  ]}
                >
                  {goal.completed && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Contenido */}
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.title,
                    goal.completed && styles.completedTitle,
                  ]}
                  numberOfLines={2}
                >
                  {goal.title}
                </Text>

                {goal.description ? (
                  <Text
                    style={[
                      styles.description,
                      goal.completed && styles.completedText,
                    ]}
                    numberOfLines={2}
                  >
                    {goal.description}
                  </Text>
                ) : null}

                <View style={styles.metadata}>
                  {/* Badge de prioridad */}
                  <LinearGradient
                    colors={[getPriorityColor() + '40', getPriorityColor() + '20']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.badge, { borderColor: getPriorityColor() }]}
                  >
                    <Text style={[styles.badgeText, { color: getPriorityColor() }]}>
                      ⚡ {getPriorityLabel()}
                    </Text>
                  </LinearGradient>

                  {/* Badge de periodo */}
                  <LinearGradient
                    colors={[colors.primary + '40', colors.primary + '20']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.badge, { borderColor: colors.primary }]}
                  >
                    <Text style={[styles.badgeText, { color: colors.primary }]}>
                      {goal.period === 'day' ? '📅 DÍA' :
                       goal.period === 'week' ? '📆 SEMANA' :
                       goal.period === 'month' ? '🗓️ MES' : '📋 AÑO'}
                    </Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Botones Editar y Eliminar */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={onEdit}
                  style={[styles.editButton, { borderColor: colors.accent }]}
                >
                  <Text style={[styles.editIcon, { color: colors.accent }]}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onDelete}
                  style={[styles.deleteButton, { borderColor: colors.error }]}
                >
                  <Text style={[styles.deleteIcon, { color: colors.error }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sección de Sub-objetivos */}
            {hasFilteredSubGoals && (
              <View style={styles.subGoalsSection}>
                <TouchableOpacity
                  onPress={() => setShowSubGoals(!showSubGoals)}
                  style={styles.subGoalsHeader}
                >
                  <Text style={styles.subGoalsTitle}>
                    📋 Sub-objetivos del día ({filteredSubGoals.filter(sg => sg.completed).length}/{filteredSubGoals.length})
                  </Text>
                  <Text style={styles.expandIcon}>{showSubGoals ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showSubGoals && (
                  <View style={styles.subGoalsList}>
                    {filteredSubGoals.map((subGoal) => (
                      <TouchableOpacity
                        key={subGoal.id}
                        onPress={() => onToggleSubGoal && onToggleSubGoal(subGoal.id)}
                        style={styles.subGoalItem}
                      >
                        <View
                          style={[
                            styles.subCheckbox,
                            { borderColor: goal.color },
                            subGoal.completed && { backgroundColor: goal.color },
                          ]}
                        >
                          {subGoal.completed && (
                            <Text style={styles.subCheckmark}>✓</Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.subGoalText,
                            subGoal.completed && styles.subGoalTextCompleted,
                          ]}
                        >
                          {subGoal.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Barra de completado */}
            {goal.completed && (
              <View style={styles.completedBar}>
                <LinearGradient
                  colors={[goal.color, goal.color + '80']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.completedBarFill}
                />
              </View>
            )}
          </LinearGradient>
        </View>
      </TouchableOpacity>

      {/* Modal de Detalles */}
      <Modal
        visible={showDetails}
        transparent
        animationType="none"
        onRequestClose={() => setShowDetails(false)}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalFadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={1}
            onPress={() => setShowDetails(false)}
          >
            <Animated.View
              style={[
                styles.modalCard,
                {
                  transform: [{ scale: modalScaleAnim }],
                  opacity: modalFadeAnim,
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <LinearGradient
                colors={[colors.surface, colors.surfaceDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalContent}
              >
                {/* Barra de color animada */}
                <LinearGradient
                  colors={[goal.color, goal.color + 'AA', goal.color]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalColorBar}
                />

                {/* Borde de color exterior */}
                <View style={[styles.modalBorder, { borderColor: goal.color }]} />

                {/* Contenido del modal */}
                <View style={styles.modalBody}>
                  {/* Icono decorativo */}
                  <View style={[styles.modalIcon, { backgroundColor: goal.color + '20', borderColor: goal.color }]}>
                    <Text style={[styles.modalIconText, { color: goal.color }]}>🎯</Text>
                  </View>
                  
                  <Text style={[styles.modalTitle, { color: goal.color }]}>{goal.title}</Text>
                  {goal.description && (
                    <Text style={styles.modalDescription}>{goal.description}</Text>
                  )}
                </View>

                {/* Botón cerrar */}
                <TouchableOpacity
                  onPress={() => setShowDetails(false)}
                  style={[styles.modalCloseButton, { backgroundColor: goal.color + '15', borderColor: goal.color }]}
                >
                  <Text style={[styles.modalCloseIcon, { color: goal.color }]}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: borderRadius.lg + 2,
    borderWidth: 2,
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 8,
  },
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  neonBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
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
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
    opacity: 0.6,
  },
  description: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  completedText: {
    color: colors.textDark,
  },
  metadata: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  deleteIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedBar: {
    height: 4,
    backgroundColor: colors.surfaceDark,
  },
  completedBarFill: {
    height: '100%',
    width: '100%',
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  subGoalsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceDark,
  },
  subGoalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  subGoalsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.primary,
  },
  subGoalsList: {
    marginTop: spacing.sm,
  },
  subGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceDark + '40',
    marginBottom: 6,
    borderRadius: borderRadius.sm,
  },
  subCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
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
    lineHeight: 16,
  },
  subGoalTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textDark,
    opacity: 0.6,
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.md,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  editIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalCard: {
    width: '90%',
    maxWidth: 480,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  modalContent: {
    position: 'relative',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  modalColorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
  },
  modalBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
  },
  modalBody: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalIconText: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    lineHeight: 32,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});