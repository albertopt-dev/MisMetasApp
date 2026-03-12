// 🔔 SERVICIO DE NOTIFICACIONES - WEB (FCM)
//
// IMPORTANTE: Requiere configurar Firebase Cloud Messaging
// 1. Ir a Firebase Console > Project Settings > Cloud Messaging
// 2. En "Web configuration", generar un par de claves (Web Push certificates)
// 3. Copiar el "Web Push certificate" (VAPID key) y añadirlo a .env como VITE_FIREBASE_VAPID_KEY
// 4. El Service Worker (firebase-messaging-sw.js) debe estar en /public/

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { app, db } from '../config/firebaseConfig';
import { NotificationSettings, NotificationPayload, DEFAULT_NOTIFICATION_SETTINGS } from '../types/notification';

class NotificationService {
  private messaging: any = null;
  private unsubscribeOnMessage: (() => void) | null = null;

  /**
   * Inicializar Firebase Messaging
   * NOTA: Solo funciona si el navegador soporta Service Workers y notificaciones
   */
  async initialize(): Promise<boolean> {
    try {
      // Verificar si el navegador soporta notificaciones
      if (!('Notification' in window)) {
        console.warn('⚠️ Este navegador no soporta notificaciones');
        return false;
      }

      // Verificar si FCM está soportado
      const supported = await isSupported();
      if (!supported) {
        console.warn('⚠️ Firebase Messaging no está soportado en este navegador');
        return false;
      }

      // Inicializar messaging
      this.messaging = getMessaging(app);
      console.log('✅ Firebase Messaging inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error al inicializar Firebase Messaging:', error);
      return false;
    }
  }

  /**
   * Solicitar permisos de notificaciones del navegador
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 Permisos de notificaciones:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Error al solicitar permisos:', error);
      return false;
    }
  }

  /**
   * Verificar estado actual de permisos
   */
  checkPermissionStatus(): 'granted' | 'denied' | 'default' {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission as 'granted' | 'denied' | 'default';
  }

  /**
   * Obtener token de FCM para notificaciones web push
   * Requiere VAPID key configurada en .env
   */
  async getWebPushToken(): Promise<string | null> {
    try {
      // Verificar que messaging esté inicializado
      if (!this.messaging) {
        await this.initialize();
        if (!this.messaging) {
          return null;
        }
      }

      // Verificar permisos
      const permission = this.checkPermissionStatus();
      if (permission !== 'granted') {
        console.warn('⚠️ Permisos de notificaciones no otorgados');
        return null;
      }

      // Obtener VAPID key desde variables de entorno
      // IMPORTANTE: Esta clave debe estar en tu archivo .env
      // VITE_FIREBASE_VAPID_KEY=tu_vapid_key_aqui
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        console.error(
          '❌ VAPID key no configurada. ' +
          'Añade VITE_FIREBASE_VAPID_KEY en tu archivo .env ' +
          'con la clave de Firebase Console > Cloud Messaging > Web Push certificates'
        );
        return null;
      }

      // Obtener token
      const token = await getToken(this.messaging, {
        vapidKey,
        serviceWorkerRegistration: await this.getServiceWorkerRegistration(),
      });

      if (token) {
        console.log('✅ FCM Token obtenido:', token);
        return token;
      } else {
        console.warn('⚠️ No se pudo obtener el token FCM');
        return null;
      }
    } catch (error) {
      console.error('❌ Error al obtener token FCM:', error);
      return null;
    }
  }

  /**
   * Obtener el Service Worker registration
   */
  private async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    try {
      if ('serviceWorker' in navigator) {
        // Esperar a que el SW esté listo
        const registration = await navigator.serviceWorker.ready;
        return registration;
      }
      return undefined;
    } catch (error) {
      console.error('❌ Error al obtener Service Worker registration:', error);
      return undefined;
    }
  }

  /**
   * Guardar el token web en Firestore
   */
  async saveTokenToFirestore(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      const currentSettings = userDoc.data()?.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS;

      const updatedSettings: NotificationSettings = {
        ...currentSettings,
        webPushToken: token,
        lastNotificationPermissionStatus: 'granted',
        lastUpdated: new Date().toISOString(),
      };

      await updateDoc(userRef, {
        notificationSettings: updatedSettings,
      });

      console.log('✅ Token web guardado en Firestore');
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
   * Configurar listener para mensajes en foreground
   */
  setupForegroundMessageListener(
    callback: (payload: NotificationPayload) => void
  ): void {
    if (!this.messaging) {
      console.warn('⚠️ Messaging no inicializado');
      return;
    }

    this.unsubscribeOnMessage = onMessage(this.messaging, (payload) => {
      console.log('🔔 Mensaje recibido en foreground:', payload);

      // Extraer título y cuerpo del mensaje
      const notification: NotificationPayload = {
        title: payload.notification?.title || 'Notificación',
        body: payload.notification?.body || '',
        data: payload.data,
      };

      // Llamar al callback
      callback(notification);

      // Mostrar notificación nativa del navegador
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/icon-192.svg', // Asegúrate de tener este icono en /public/
          badge: '/icon-192.svg',
          data: notification.data,
        });
      }
    });
  }

  /**
   * Remover listener de mensajes foreground
   */
  removeForegroundMessageListener(): void {
    if (this.unsubscribeOnMessage) {
      this.unsubscribeOnMessage();
      this.unsubscribeOnMessage = null;
    }
  }

  /**
   * Mostrar notificación local del navegador
   * (Solo funciona si se tienen permisos)
   */
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (Notification.permission !== 'granted') {
        console.warn('⚠️ Permisos de notificaciones no otorgados');
        return;
      }

      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: 'objetivosapp-notification',
        requireInteraction: false,
        data: payload.data,
      });

      // Click en la notificación
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();

        // Navegar si hay datos de navegación
        if (payload.data?.screen) {
          window.location.href = `/${payload.data.screen}`;
        }
      };

      console.log('✅ Notificación local mostrada');
    } catch (error) {
      console.error('❌ Error al mostrar notificación local:', error);
    }
  }

  /**
   * Registrar completo: inicializar, pedir permisos, obtener token y guardar
   */
  async registerForPushNotifications(userId: string): Promise<string | null> {
    try {
      // 1. Inicializar messaging
      const initialized = await this.initialize();
      if (!initialized) {
        return null;
      }

      // 2. Pedir permisos
      const granted = await this.requestPermissions();
      if (!granted) {
        console.warn('⚠️ Permisos denegados');
        await this.updateNotificationSettings(userId, {
          lastNotificationPermissionStatus: 'denied',
        });
        return null;
      }

      // 3. Obtener token
      const token = await this.getWebPushToken();
      if (!token) {
        return null;
      }

      // 4. Guardar en Firestore
      await this.saveTokenToFirestore(userId, token);

      return token;
    } catch (error) {
      console.error('❌ Error en registro completo de notificaciones:', error);
      return null;
    }
  }
}

export default new NotificationService();
