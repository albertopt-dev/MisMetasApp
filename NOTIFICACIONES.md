# 🔔 Configuración de Notificaciones Push

Este documento describe cómo configurar las notificaciones push para **ObjetivosApp** en ambas plataformas: nativa (Expo) y web (PWA).

---

## 📱 Configuración Nativa (Expo)

### Requisitos previos
- Proyecto configurado en Firebase (ya lo tenemos: `objetivosapp-2ac48`)
- EAS Project ID configurado en `app.json` (ya configurado: `ba2ecfe5-78ad-4678-8b3a-e64877bc6e71`)
- Dependencias instaladas:
  ```bash
  npx expo install expo-notifications expo-device expo-constants
  ```

### Plugin de Expo Notifications
El plugin ya está configurado en `app.json`:
```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/icon.png",
        "color": "#6366f1",
        "sounds": [],
        "mode": "production"
      }
    ]
  ]
}
```

### Permisos requeridos

**iOS**: Automáticamente gestionado por el plugin
- Muestra diálogo nativo de permisos
- Los permisos se solicitan en tiempo de ejecución

**Android**: Automáticamente gestionado por el plugin
- Android 13+ requiere permiso `POST_NOTIFICATIONS`
- Se maneja automáticamente con el plugin

### Testing en desarrollo

**IMPORTANTE**: Las notificaciones push remotas no funcionan en Expo Go. Necesitas crear un **Development Build**.

1. **Crear Development Build**:
   ```bash
   eas build --profile development --platform ios
   eas build --profile development --platform android
   ```

2. **Instalar el build en tu dispositivo**

3. **Probar notificaciones locales**:
   - Las notificaciones locales SÍ funcionan en Expo Go
   - Usa el botón "Enviar notificación de prueba" en la pantalla de ajustes

### Envío de notificaciones remotas

Para enviar notificaciones push desde el backend, usa el **Expo Push API**:

**Endpoint**: `https://exp.host/--/api/v2/push/send`

**Payload**:
```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxx]",
  "title": "¡Revisa tus objetivos!",
  "body": "No olvides marcar tu progreso de hoy",
  "data": { "type": "daily_reminder" }
}
```

**Ejemplo con fetch**:
```javascript
const sendPushNotification = async (expoPushToken: string) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: '🎯 ObjetivosApp',
    body: '¡Revisa tus objetivos de hoy!',
    data: { type: 'daily_reminder' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};
```

---

## 🌐 Configuración Web (PWA)

### Requisitos previos
- Firebase Cloud Messaging habilitado
- Certificado Web Push (VAPID) generado
- Service Worker registrado

### 1. Generar clave VAPID

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **objetivosapp-2ac48**
3. Ve a **⚙️ Configuración del proyecto** > **Cloud Messaging**
4. En la sección **"Certificados web push"**, haz clic en **"Generar par de claves"**
5. Copia la **"Clave pública"** (empieza con `B...`)

### 2. Configurar variable de entorno

Crea un archivo `.env` en la carpeta `web/`:

```bash
cd web
cp .env.example .env
```

Edita `web/.env` y pega tu clave VAPID:

```env
VITE_FIREBASE_VAPID_KEY=BKs...tu_clave_aqui...xyz
```

**IMPORTANTE**: 
- NO subas el archivo `.env` al repositorio
- Ya está incluido en `.gitignore`
- Cada desarrollador debe crear su propio `.env`

### 3. Service Worker

El Service Worker ya está configurado en `web/public/firebase-messaging-sw.js`.

**Requisitos**:
- Debe estar en la carpeta `/public/` (raíz del dominio)
- No puede estar en una subcarpeta
- Se registra automáticamente al inicializar FCM

### 4. Permisos del navegador

El usuario debe otorgar permisos de notificaciones:
- Chrome/Edge: Diálogo nativo del navegador
- Firefox: Diálogo nativo
- Safari: Requiere iOS 16.4+ o macOS Ventura+

Los permisos se solicitan automáticamente cuando el usuario activa las notificaciones en la app.

### 5. Testing en desarrollo

1. **Inicia el servidor de desarrollo**:
   ```bash
   cd web
   npm run dev
   ```

2. **Abre en HTTPS** (requerido para Service Workers):
   - Vite incluye HTTPS automáticamente en dev
   - O usa: `npm run dev -- --https`

3. **Prueba el flujo**:
   - Ve a "Notificaciones" en el menú
   - Activa las notificaciones
   - Otorga permisos del navegador
   - Presiona "Enviar notificación de prueba"

### 6. Envío de notificaciones remotas

Para enviar notificaciones desde el backend, usa **Firebase Admin SDK**:

```javascript
import admin from 'firebase-admin';

const sendWebPushNotification = async (webPushToken: string) => {
  const message = {
    token: webPushToken,
    notification: {
      title: '🎯 ObjetivosApp',
      body: '¡Revisa tus objetivos de hoy!',
      icon: '/icon-192.svg',
    },
    data: {
      type: 'daily_reminder',
      url: '/home',
    },
  };

  await admin.messaging().send(message);
};
```

### 7. Deployment en producción

**Requisitos**:
- HTTPS obligatorio (Service Workers no funcionan en HTTP)
- Dominio propio o hosting con SSL
- Variables de entorno configuradas

**Netlify/Vercel**:
1. Configura la variable de entorno `VITE_FIREBASE_VAPID_KEY` en el panel
2. Deploy como PWA normal
3. El Service Worker se servirá automáticamente desde `/firebase-messaging-sw.js`

---

## 🔐 Seguridad

### Variables de entorno

**NO incluir en el código**:
- ❌ No hardcodear claves VAPID
- ❌ No subir `.env` al repositorio
- ❌ No exponer claves en el frontend

**Buenas prácticas**:
- ✅ Usar variables de entorno
- ✅ Archivo `.env.example` para documentación
- ✅ `.env` en `.gitignore`
- ✅ Diferentes claves para dev/producción

### Tokens de usuario

Los tokens se almacenan en Firestore:
```
users/{userId}/notificationSettings
```

**Campos**:
- `expoPushToken`: Token de Expo (nativo)
- `webPushToken`: Token de FCM (web)
- `notificationsEnabled`: Boolean
- `reminderTime`: String (HH:mm)
- `timezone`: String automático

**Seguridad**:
- Reglas de Firestore: Solo el usuario puede leer/escribir sus tokens
- Tokens encriptados en tránsito (HTTPS/TLS)

---

## 🧪 Testing

### Checklist de pruebas

**Nativo**:
- [ ] Solicitar permisos funciona
- [ ] Token se guarda en Firestore
- [ ] Notificación de prueba local funciona
- [ ] Notificación de prueba remota funciona (requiere Development Build)
- [ ] Configuración de hora se guarda
- [ ] Toggle activar/desactivar funciona

**Web**:
- [ ] Detecta soporte del navegador
- [ ] Solicitar permisos funciona
- [ ] Token se guarda en Firestore
- [ ] Service Worker se registra
- [ ] Notificación de prueba funciona
- [ ] Mensajes en primer plano se muestran
- [ ] Mensajes en segundo plano se muestran
- [ ] Click en notificación abre la app

---

## 🐛 Troubleshooting

### Nativo

**"Push notifications are not supported in Expo Go"**
- Solución: Crear un Development Build con `eas build`

**"No devicePushToken available"**
- Verifica que tienes `projectId` en `app.json > extra.eas.projectId`
- Verifica que el dispositivo es físico (no emulador)

**Permisos denegados**
- iOS: Ve a Ajustes > ObjetivosApp > Notificaciones
- Android: Ve a Ajustes > Apps > ObjetivosApp > Notificaciones

### Web

**"Firebase messaging is not supported"**
- Verifica que estás en HTTPS
- Verifica soporte del navegador (Chrome/Firefox/Edge/Safari 16.4+)

**"No VAPID key configured"**
- Verifica que `.env` existe en `web/`
- Verifica que la clave empieza con `VITE_`
- Reinicia el servidor de desarrollo

**Service Worker no se registra**
- Verifica que `firebase-messaging-sw.js` está en `/public/`
- Verifica consola del navegador para errores
- Verifica que el navegador soporta Service Workers

**Notificaciones no aparecen**
- Verifica permisos del navegador (candado en barra de direcciones)
- Verifica que no estás en modo "No molestar"
- Verifica consola para errores de FCM

---

## 📚 Recursos

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## ✅ Estado actual

- [x] Tipos y modelos de datos (NotificationSettings)
- [x] Servicio nativo (Expo notifications)
- [x] Servicio web (FCM + Service Worker)
- [x] Contextos React (nativo y web)
- [x] Pantallas de configuración (UI)
- [x] Integración en App.tsx
- [x] Routing y navegación
- [x] Plugin configurado en app.json
- [ ] Backend para envío programado (Cloud Functions)
- [ ] Clave VAPID configurada por el usuario
- [ ] Testing completo en ambas plataformas

---

¿Necesitas ayuda? Revisa la sección de **Troubleshooting** o consulta la documentación oficial de Expo y Firebase.
