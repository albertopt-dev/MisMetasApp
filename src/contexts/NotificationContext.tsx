// 🔔 CONTEXTO DE NOTIFICACIONES - NATIVO
//
// Proporciona funcionalidad de notificaciones en toda la app nativa
// Maneja el registro, permisos, configuración y listeners

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService.native';
import { NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS, NotificationPayload } from '../types/notification';

interface NotificationContextData {
  settings: NotificationSettings;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  isLoading: boolean;
  token: string | null;
  registerForPush: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  /**
   * Cargar configuración de notificaciones desde Firestore
   */
  const refreshSettings = useCallback(async () => {
    if (!user) {
      setSettings(DEFAULT_NOTIFICATION_SETTINGS);
      return;
    }

    try {
      setIsLoading(true);
      const userSettings = await notificationService.getNotificationSettings(user.uid);
      setSettings(userSettings);
      setToken(userSettings.expoPushToken);
    } catch (error) {
      console.error('Error al cargar configuración de notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Verificar estado de permisos
   */
  const checkPermissions = useCallback(async () => {
    const status = await notificationService.checkPermissionStatus();
    setPermissionStatus(status);
    return status;
  }, []);

  /**
   * Solicitar permisos de notificaciones
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      await checkPermissions();

      if (user && granted) {
        await notificationService.updateNotificationSettings(user.uid, {
          lastNotificationPermissionStatus: 'granted',
        });
        await refreshSettings();
      }

      return granted;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }, [user, checkPermissions, refreshSettings]);

  /**
   * Registrar para notificaciones push (completo: permisos + token + guardar)
   */
  const registerForPush = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.warn('No hay usuario autenticado');
      return false;
    }

    try {
      setIsLoading(true);

      // 1. Obtener token
      const pushToken = await notificationService.registerForPushNotificationsAsync();

      if (!pushToken) {
        console.warn('No se pudo obtener el token de push');
        return false;
      }

      // 2. Guardar en Firestore
      await notificationService.saveTokenToFirestore(user.uid, pushToken);

      // 3. Actualizar estado local
      setToken(pushToken);
      await checkPermissions();
      await refreshSettings();

      console.log('✅ Registro de push completado');
      return true;
    } catch (error) {
      console.error('Error al registrar para push:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, checkPermissions, refreshSettings]);

  /**
   * Actualizar configuración de notificaciones
   */
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      if (!user) return;

      try {
        setIsLoading(true);
        await notificationService.updateNotificationSettings(user.uid, newSettings);
        await refreshSettings();
      } catch (error) {
        console.error('Error al actualizar configuración:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, refreshSettings]
  );

  /**
   * Enviar notificación de prueba (local)
   */
  const sendTestNotification = useCallback(async () => {
    const payload: NotificationPayload = {
      title: '🎯 Tus objetivos te esperan',
      body: 'Revisa tus metas de hoy y mantén tu progreso',
      data: {
        screen: 'Home',
      },
    };

    await notificationService.sendLocalNotification(payload);
  }, []);

  /**
   * Configurar listeners de notificaciones al montar
   */
  useEffect(() => {
    if (!user) return;

    // Manejar notificación recibida (app en foreground)
    const handleNotificationReceived = (notification: Notifications.Notification) => {
      console.log('🔔 Notificación recibida:', notification);
      // Aquí podrías actualizar la UI, mostrar un banner, etc.
    };

    // Manejar tap en notificación
    const handleNotificationTapped = (response: Notifications.NotificationResponse) => {
      console.log('👆 Tap en notificación:', response);

      // Navegar a la pantalla indicada en los datos
      const screen = response.notification.request.content.data?.screen;
      if (screen) {
        // TODO: Implementar navegación
        console.log('Navegar a:', screen);
      }
    };

    // Configurar listeners
    notificationService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationTapped
    );

    // Limpiar listeners al desmontar
    return () => {
      notificationService.removeNotificationListeners();
    };
  }, [user]);

  /**
   * Cargar configuración al iniciar sesión
   */
  useEffect(() => {
    if (user) {
      refreshSettings();
      checkPermissions();
    }
  }, [user, refreshSettings, checkPermissions]);

  /**
   * Manejar cambios de estado de la app (background/foreground)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && user) {
        // App volvió a foreground, refrescar permisos
        checkPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user, checkPermissions]);

  return (
    <NotificationContext.Provider
      value={{
        settings,
        permissionStatus,
        isLoading,
        token,
        registerForPush,
        requestPermissions,
        updateSettings,
        refreshSettings,
        sendTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};
