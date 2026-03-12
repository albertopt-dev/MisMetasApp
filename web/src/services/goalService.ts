// 🎯 SERVICIO DE GESTIÓN DE OBJETIVOS

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  // orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Goal, CreateGoalData, UpdateGoalData, PeriodType } from '../types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

class GoalService {
  private goalsCollection = 'goals';

  // Crear un nuevo objetivo
  async createGoal(userId: string, goalData: CreateGoalData): Promise<Goal> {
    try {
      const now = new Date();
      const newGoal: any = {
        userId,
        title: goalData.title,
        description: goalData.description || '',
        period: goalData.period,
        date: goalData.date,
        completed: false,
        priority: goalData.priority || 'medium',
        color: goalData.color || '#6366f1',
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      // Agregar subGoals si existen
      if (goalData.subGoals && goalData.subGoals.length > 0) {
        newGoal.subGoals = goalData.subGoals;
      }

      const docRef = await addDoc(collection(db, this.goalsCollection), newGoal);

      return {
        id: docRef.id,
        ...newGoal,
        createdAt: now,
        updatedAt: now,
      } as Goal;
    } catch (error) {
      throw new Error('Error al crear el objetivo');
    }
  }

  // Obtener objetivos del usuario
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const q = query(
        collection(db, this.goalsCollection),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const goals: Goal[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        goals.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Goal);
      });

      // Ordenar por fecha en el cliente
      goals.sort((a, b) => b.date.localeCompare(a.date));

      return goals;
    } catch (error) {
      console.error('Error detallado al obtener objetivos:', error);
      throw new Error('Error al obtener los objetivos');
    }
  }

  // Obtener objetivos por fecha y periodo
  async getGoalsByDateAndPeriod(
    userId: string,
    date: Date,
    period: PeriodType
  ): Promise<Goal[]> {
    try {
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(date);
          endDate = new Date(date);
          break;
        case 'week':
          startDate = startOfWeek(date, { weekStartsOn: 1 }); // Lunes
          endDate = endOfWeek(date, { weekStartsOn: 1 });
          break;
        case 'month':
          startDate = startOfMonth(date);
          endDate = endOfMonth(date);
          break;
        case 'year':
          startDate = startOfYear(date);
          endDate = endOfYear(date);
          break;
      }

      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      const q = query(
        collection(db, this.goalsCollection),
        where('userId', '==', userId),
        where('period', '==', period)
      );

      const querySnapshot = await getDocs(q);
      const goals: Goal[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrar por rango de fechas en el cliente
        if (data.date >= startDateStr && data.date <= endDateStr) {
          goals.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            completedAt: data.completedAt?.toDate(),
          } as Goal);
        }
      });

      // Ordenar por fecha
      goals.sort((a, b) => a.date.localeCompare(b.date));

      return goals;
    } catch (error) {
      console.error('Error detallado al obtener objetivos:', error);
      throw new Error('Error al obtener los objetivos por fecha');
    }
  }

  // Actualizar un objetivo
  async updateGoal(goalId: string, updates: UpdateGoalData): Promise<void> {
    try {
      const goalRef = doc(db, this.goalsCollection, goalId);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Si se marca como completado, añadir fecha de completado
      if (updates.completed === true) {
        updateData.completedAt = Timestamp.fromDate(new Date());
      } else if (updates.completed === false) {
        updateData.completedAt = null;
      }

      await updateDoc(goalRef, updateData);
    } catch (error) {
      throw new Error('Error al actualizar el objetivo');
    }
  }

  // Eliminar un objetivo
  async deleteGoal(goalId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.goalsCollection, goalId));
    } catch (error) {
      throw new Error('Error al eliminar el objetivo');
    }
  }

  // Actualizar el estado de un sub-objetivo específico
  async toggleSubGoal(goalId: string, subGoalId: string): Promise<void> {
    try {
      const goalRef = doc(db, this.goalsCollection, goalId);
      const goalSnapshot = await getDoc(goalRef);
      
      if (!goalSnapshot.exists()) {
        throw new Error('Objetivo no encontrado');
      }

      const goalData = goalSnapshot.data();
      const subGoals = goalData.subGoals || [];
      
      // Encontrar y toggle el sub-objetivo
      const updatedSubGoals = subGoals.map((sg: any) => 
        sg.id === subGoalId ? { ...sg, completed: !sg.completed } : sg
      );

      await updateDoc(goalRef, {
        subGoals: updatedSubGoals,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      throw new Error('Error al actualizar sub-objetivo');
    }
  }

  // Marcar objetivo como completado/incompleto
  async toggleGoalCompletion(goalId: string, completed: boolean): Promise<void> {
    await this.updateGoal(goalId, { completed });
  }

  // Escuchar cambios en tiempo real
  subscribeToGoals(
    userId: string,
    callback: (goals: Goal[]) => void
  ): () => void {
    const q = query(
      collection(db, this.goalsCollection),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const goals: Goal[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        goals.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Goal);
      });
      
      // Ordenar por fecha en el cliente
      goals.sort((a, b) => b.date.localeCompare(a.date));
      
      callback(goals);
    });
  }

  // Obtener estadísticas del usuario
  async getUserStats(userId: string) {
    try {
      const goals = await this.getUserGoals(userId);
      
      const totalGoals = goals.length;
      const completedGoals = goals.filter(g => g.completed).length;
      const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      // Objetivos por período
      const goalsByPeriod = {
        day: goals.filter(g => g.period === 'day').length,
        week: goals.filter(g => g.period === 'week').length,
        month: goals.filter(g => g.period === 'month').length,
        year: goals.filter(g => g.period === 'year').length,
      };

      // Objetivos por prioridad
      const goalsByPriority = {
        high: goals.filter(g => g.priority === 'high').length,
        medium: goals.filter(g => g.priority === 'medium').length,
        low: goals.filter(g => g.priority === 'low').length,
      };

      // Objetivos completados por prioridad
      const completedByPriority = {
        high: goals.filter(g => g.priority === 'high' && g.completed).length,
        medium: goals.filter(g => g.priority === 'medium' && g.completed).length,
        low: goals.filter(g => g.priority === 'low' && g.completed).length,
      };

      // Cálculo de racha (días consecutivos con al menos un objetivo completado)
      const dailyGoals = goals.filter(g => g.period === 'day' && g.completed);
      const sortedDates = [...new Set(dailyGoals.map(g => g.date))].sort().reverse();
      
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      const today = format(new Date(), 'yyyy-MM-dd');
      
      if (sortedDates.length > 0) {
        // Verificar si hay objetivos completados hoy o ayer
        const latestDate = sortedDates[0];
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        
        if (latestDate === today || latestDate === yesterday) {
          let currentDate = latestDate;
          
          for (let i = 0; i < sortedDates.length; i++) {
            if (sortedDates[i] === currentDate) {
              currentStreak++;
              tempStreak++;
              
              // Calcular siguiente día esperado
              const dateObj = new Date(currentDate);
              dateObj.setDate(dateObj.getDate() - 1);
              currentDate = format(dateObj, 'yyyy-MM-dd');
            } else {
              break;
            }
          }
        }
        
        // Calcular mejor racha histórica
        tempStreak = 0;
        for (let i = 0; i < sortedDates.length; i++) {
          if (i === 0) {
            tempStreak = 1;
          } else {
            const currentDate = new Date(sortedDates[i]);
            const prevDate = new Date(sortedDates[i - 1]);
            const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / 86400000);
            
            if (diffDays === 1) {
              tempStreak++;
            } else {
              if (tempStreak > bestStreak) bestStreak = tempStreak;
              tempStreak = 1;
            }
          }
        }
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      }

      // Tendencias (últimos 7 y 30 días)
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 86400000);
      const last30Days = new Date(now.getTime() - 30 * 86400000);
      
      const last7DaysStr = format(last7Days, 'yyyy-MM-dd');
      const last30DaysStr = format(last30Days, 'yyyy-MM-dd');
      
      const goalsLast7Days = goals.filter(g => g.date >= last7DaysStr);
      const goalsLast30Days = goals.filter(g => g.date >= last30DaysStr);
      
      const completedLast7Days = goalsLast7Days.filter(g => g.completed).length;
      const completedLast30Days = goalsLast30Days.filter(g => g.completed).length;
      
      const completionRateLast7Days = goalsLast7Days.length > 0 
        ? (completedLast7Days / goalsLast7Days.length) * 100 
        : 0;
      const completionRateLast30Days = goalsLast30Days.length > 0 
        ? (completedLast30Days / goalsLast30Days.length) * 100 
        : 0;

      // Mejor día de la semana
      const dayStats: { [key: string]: { total: number; completed: number } } = {};
      goals.forEach(g => {
        if (g.period === 'day') {
          const dayOfWeek = new Date(g.date + 'T00:00:00').getDay();
          const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek];
          
          if (!dayStats[dayName]) {
            dayStats[dayName] = { total: 0, completed: 0 };
          }
          dayStats[dayName].total++;
          if (g.completed) dayStats[dayName].completed++;
        }
      });
      
      let bestDay = { name: '', rate: 0 };
      Object.entries(dayStats).forEach(([day, stats]) => {
        const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        if (rate > bestDay.rate) {
          bestDay = { name: day, rate };
        }
      });

      return {
        totalGoals,
        completedGoals,
        completionRate: Math.round(completionRate),
        streakDays: currentStreak,
        bestStreak,
        goalsByPeriod,
        goalsByPriority,
        completedByPriority,
        trends: {
          last7Days: {
            total: goalsLast7Days.length,
            completed: completedLast7Days,
            completionRate: Math.round(completionRateLast7Days),
          },
          last30Days: {
            total: goalsLast30Days.length,
            completed: completedLast30Days,
            completionRate: Math.round(completionRateLast30Days),
          },
        },
        bestDay: bestDay.name || 'N/A',
        dayStats,
      };
    } catch (error) {
      throw new Error('Error al obtener estadísticas');
    }
  }
}

export default new GoalService();
