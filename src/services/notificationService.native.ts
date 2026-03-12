// 🔔 SERVICIO DE NOTIFICACIONES - NATIVO (EXPO)
//
// IMPORTANTE: Este servicio requiere 'expo-notifications', 'expo-device' y 'expo-constants'
// Instalar con: npx expo install expo-notifications expo-device expo-constants
//
// Para notificaciones push en dispositivos reales necesitas:
// 1. Development Build (no funciona en Expo Go para push real)
// 2. Credenciales de push configuradas en Expo

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { NotificationSettings, NotificationPayload, DEFAULT_NOTIFICATION_SETTINGS } from '../types/notification';

// Configurar cómo se manejan las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Registrar el dispositivo para recibir notificaciones push
   * y obtener el Expo Push Token
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      // Solo funciona en dispositivos físicos
      if (!Device.isDevice) {
        console.warn('⚠️ Las notificaciones push solo funcionan en dispositivos físicos, no en emulador');
        return null;
      }

      // Verificar permisos existentes
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Si no tiene permisos, solicitarlos
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Si no se otorgaron permisos, retornar null
      if (finalStatus !== 'granted') {
        console.warn('⚠️ Permisos de notificaciones denegados');
        return null;
      }

      // Obtener el Expo Push Token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.warn('⚠️ No se encontró projectId en la configuración. Verifica app.json > extra.eas.projectId');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('✅ Expo Push Token obtenido:', token.data);

      // Configuración específica de Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Recordatorios',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
        });
      }

      return token.data;
    } catch (error) {
      console.error('❌ Error al registrar para notificaciones push:', error);
      return null;
    }
  }

  /**
   * Guardar el token de push en Firestore (perfil del usuario)
   */
  async saveTokenToFirestore(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      const currentSettings = userDoc.data()?.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS;

      const updatedSettings: NotificationSettings = {
        ...currentSettings,
        expoPushToken: token,
        lastNotificationPermissionStatus: 'granted',
        lastUpdated: new Date().toISOString(),
      };

      await updateDoc(userRef, {
        notificationSettings: updatedSettings,
      });

      console.log('✅ Token guardado en Firestore');
    } catch (error) {
      console.error('❌ Error al guardar token en Firestore:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración de notificaciones del usuario
   */
  async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      const currentSettings = userDoc.data()?.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS;

      const updatedSettings: NotificationSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: new Date().toISOString(),
      };

      await updateDoc(userRef, {
        notificationSettings: updatedSettings,
      });

      console.log('✅ Configuración de notificaciones actualizada');
    } catch (error) {
      console.error('❌ Error al actualizar configuración:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración de notificaciones del usuario
   */
  async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return DEFAULT_NOTIFICATION_SETTINGS;
      }

      return userDoc.data()?.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS;
    } catch (error) {
      console.error('❌ Error al obtener configuración:', error);
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  /**
   * Verificar estado actual de permisos
   */
  async checkPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    const { status } = await Notifications.getPermissionsAsync();
    return status as 'granted' | 'denied' | 'undetermined';
  }

  /**
   * Solicitar permisos de notificaciones
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Configurar listeners para notificaciones
   * - Notificaciones recibidas mientras app está abierta
   * - Tap en notificación
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Listener para notificaciones recibidas (app en foreground)
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('🔔 Notificación recibida:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener para cuando el usuario hace tap en una notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Usuario hizo tap en notificación:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });
  }

  /**
   * Limpiar listeners cuando ya no se necesiten
   */
  removeNotificationListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Enviar notificación local (para testing)
   * NO requiere permisos de push, solo permisos locales
   */
  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: 'default',
        },
        trigger: null, // null = inmediata
      });

      console.log('✅ Notificación local enviada');
    } catch (error) {
      console.error('❌ Error al enviar notificación local:', error);
    }
  }

  /**
   * Programar notificación local para una hora específica
   */
  async scheduleLocalNotification(
    payload: NotificationPayload,
    triggerDate: Date
  ): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: 'default',
        },
        trigger: {
          date: triggerDate,
          repeats: false,
        },
      });

      console.log('✅ Notificación local programada con ID:', identifier);
      return identifier;
    } catch (error) {
      console.error('❌ Error al programar notificación local:', error);
      return null;
    }
  }

  /**
   * Cancelar todas las notificaciones programadas
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Todas las notificaciones programadas canceladas');
    } catch (error) {
      console.error('❌ Error al cancelar notificaciones:', error);
    }
  }

  /**
   * Obtener badge count (contador de notificaciones no leídas)
   */
  async getBadgeCount(): Promise<number> {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      console.error('❌ Error al obtener badge count:', error);
      return 0;
    }
  }

  /**
   * Establecer badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('❌ Error al establecer badge count:', error);
    }
  }
}

export default new NotificationService();
