// 📝 TIPOS Y INTERFACES DE LA APLICACIÓN

// Usuario
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

// Periodo de tiempo para objetivos
export type PeriodType = 'day' | 'week' | 'month' | 'year';

// Sub-objetivo diario para objetivos semanales/mensuales
export interface SubGoal {
  id: string;
  title: string;
  completed: boolean;
  date: string; // Fecha específica del día (YYYY-MM-DD)
}

// Objetivo
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  period: PeriodType;
  date: string; // ISO string (YYYY-MM-DD)
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  color: string; // Color hex para el objetivo
  subGoals?: SubGoal[]; // Sub-objetivos diarios (solo para week/month)
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Datos para crear un objetivo
export interface CreateGoalData {
  title: string;
  description?: string;
  period: PeriodType;
  date: string;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
  subGoals?: SubGoal[];
}

// Datos para actualizar un objetivo
export interface UpdateGoalData {
  title?: string;
  description?: string;
  period?: PeriodType;
  date?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
  subGoals?: SubGoal[];
}

// Estadísticas del usuario
export interface UserStats {
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  streakDays: number;
  goalsByPeriod: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
}

// Tema de colores
export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  error: string;
  success: string;
}
