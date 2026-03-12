// 🔔 TIPOS DE NOTIFICACIONES - WEB VERSION

export interface NotificationSettings {
  notificationsEnabled: boolean;
  reminderTime: string; // Formato HH:mm (ej: "09:00")
  expoPushToken: string | null;
  webPushToken: string | null;
  timezone: string; // Timezone del usuario (ej: "Europe/Madrid")
  lastNotificationPermissionStatus: 'granted' | 'denied' | 'undetermined' | 'default';
  lastUpdated: string; // ISO timestamp
}

export interface UserNotificationData {
  uid: string;
  email: string;
  displayName: string;
  notificationSettings?: NotificationSettings;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    screen?: string;
    goalId?: string;
    [key: string]: any;
  };
}

export interface ScheduledNotification {
  userId: string;
  scheduledTime: string; // ISO timestamp
  payload: NotificationPayload;
  sent: boolean;
  error?: string;
}

// Valores por defecto para nuevos usuarios
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  notificationsEnabled: false,
  reminderTime: '09:00',
  expoPushToken: null,
  webPushToken: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  lastNotificationPermissionStatus: 'default',
  lastUpdated: new Date().toISOString(),
};
