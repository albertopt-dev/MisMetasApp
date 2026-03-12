// 🔔 CONTEXTO DE NOTIFICACIONES - WEB
//
// Proporciona funcionalidad de notificaciones en toda la PWA
// Maneja el registro, permisos, configuración y listeners de FCM

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService.web';
import { NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS, NotificationPayload } from '../types/notification';

interface NotificationContextData {
  settings: NotificationSettings;
  permissionStatus: 'granted' | 'denied' | 'default';
  isLoading: boolean;
  token: string | null;
  isSupported: boolean;
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
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  /**
   * Verificar soporte de notificaciones en el navegador
   */
  const checkSupport = useCallback(async () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    return supported;
  }, []);

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
      setToken(userSettings.webPushToken);
    } catch (error) {
      console.error('Error al cargar configuración de notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Verificar estado de permisos
   */
  const checkPermissions = useCallback(() => {
    const status = notificationService.checkPermissionStatus();
    setPermissionStatus(status);
    return status;
  }, []);

  /**
   * Solicitar permisos de notificaciones
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      checkPermissions();

      if (user && granted) {
        await notificationService.updateNotificationSettings(user.uid, {
          lastNotificationPermissionStatus: 'granted',
        });
        await refreshSettings();
      } else if (user && !granted) {
        await notificationService.updateNotificationSettings(user.uid, {
          lastNotificationPermissionStatus: 'denied',
        });
      }

      return granted;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }, [user, checkPermissions, refreshSettings]);

  /**
   * Registrar para notificaciones push (completo: inicializar + permisos + token + guardar)
   */
  const registerForPush = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.warn('No hay usuario autenticado');
      return false;
    }

    if (!isSupported) {
      console.warn('Notificaciones no soportadas en este navegador');
      return false;
    }

    try {
      setIsLoading(true);

      // Usar el método completo del servicio
      const webToken = await notificationService.registerForPushNotifications(user.uid);

      if (!webToken) {
        console.warn('No se pudo obtener el token web');
        return false;
      }

      // Actualizar estado local
      setToken(webToken);
      checkPermissions();
      await refreshSettings();

      console.log('✅ Registro web de push completado');
      return true;
    } catch (error) {
      console.error('Error al registrar para push web:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, checkPermissions, refreshSettings]);

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
        screen: '',
      },
    };

    await notificationService.showLocalNotification(payload);
  }, []);

  /**
   * Configurar listener de mensajes foreground al montar
   */
  useEffect(() => {
    if (!user || !isSupported) return;

    // Inicializar servicio
    notificationService.initialize().then((initialized) => {
      if (initialized) {
        // Configurar listener para mensajes en foreground
        notificationService.setupForegroundMessageListener((payload) => {
          console.log('🔔 Mensaje recibido en foreground:', payload);
          // Aquí podrías mostrar un toast, actualizar la UI, etc.
        });
      }
    });

    // Limpiar listener al desmontar
    return () => {
      notificationService.removeForegroundMessageListener();
    };
  }, [user, isSupported]);

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
   * Verificar soporte al montar
   */
  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  /**
   * Verificar permisos cuando la ventana recibe foco
   */
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        checkPermissions();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, checkPermissions]);

  return (
    <NotificationContext.Provider
      value={{
        settings,
        permissionStatus,
        isLoading,
        token,
        isSupported,
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
