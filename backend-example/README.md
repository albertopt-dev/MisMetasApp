# 🔧 Backend para Notificaciones Automáticas

Este directorio contiene ejemplos de código para implementar el envío automático de notificaciones push.

## 📁 Archivos

- **`sendDailyReminders.ts`** - Cloud Function para envío programado (Firebase Functions)

## 🚀 Opción 1: Firebase Cloud Functions (Recomendado)

### Requisitos previos
- Proyecto Firebase configurado
- Billing habilitado (plan Blaze - pago por uso)
- Firebase CLI instalado

### Instalación

1. **Instalar Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login en Firebase**:
   ```bash
   firebase login
   ```

3. **Inicializar Functions en tu proyecto**:
   ```bash
   cd "C:\Users\Alberto\Desktop\proyecto objetivos"
   firebase init functions
   ```
   
   Selecciona:
   - Usar proyecto existente: `objetivosapp-2ac48`
   - Lenguaje: **TypeScript**
   - ESLint: Sí (opcional)
   - Instalar dependencias: Sí

4. **Copiar el código**:
   ```bash
   cp backend-example/sendDailyReminders.ts functions/src/
   ```

5. **Instalar dependencias adicionales**:
   ```bash
   cd functions
   npm install
   ```

6. **Actualizar `functions/src/index.ts`**:
   ```typescript
   export { sendDailyReminders, sendRemindersManual } from './sendDailyReminders';
   ```

7. **Desplegar**:
   ```bash
   firebase deploy --only functions
   ```

### Configuración del Scheduler

La función se ejecuta automáticamente cada hora gracias a:
```typescript
.schedule('0 * * * *') // Cron: cada hora en punto
.timeZone('Europe/Madrid') // Ajusta tu zona horaria
```

Puedes cambiar el schedule:
- `0 * * * *` - Cada hora en punto
- `0 9 * * *` - Cada día a las 9:00 AM
- `0 9,18 * * *` - Dos veces al día (9 AM y 6 PM)
- `*/15 * * * *` - Cada 15 minutos

### Testing manual

Después del deploy, puedes probar manualmente:

```bash
# Endpoint HTTP
curl -X POST https://us-central1-objetivosapp-2ac48.cloudfunctions.net/sendRemindersManual
```

O desde la consola de Firebase:
1. Ve a Functions en Firebase Console
2. Busca `sendDailyReminders`
3. Click en "Ejecutar función"

---

## 🚀 Opción 2: Node.js Server (Alternativa)

Si prefieres no usar Cloud Functions, puedes crear un servidor Node.js simple:

### Crear servidor

```bash
mkdir notification-server
cd notification-server
npm init -y
npm install express node-cron firebase-admin
npm install --save-dev @types/node @types/express typescript
```

### Código del servidor

**`server.ts`**:
```typescript
import express from 'express';
import cron from 'node-cron';
import admin from 'firebase-admin';

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// Lógica de envío (copiar de sendDailyReminders.ts)
async function sendReminders() {
  console.log('🔔 Enviando recordatorios...');
  // ... código aquí ...
}

// Ejecutar cada hora
cron.schedule('0 * * * *', () => {
  sendReminders();
});

// Endpoint manual para testing
app.post('/send-reminders', async (req, res) => {
  await sendReminders();
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
```

### Obtener Service Account Key

1. Firebase Console > Configuración del proyecto
2. Service accounts > Generate new private key
3. Guardar como `serviceAccountKey.json`
4. **NO subir a Git** (añadir a `.gitignore`)

### Ejecutar

```bash
npx ts-node server.ts
```

### Desplegar en producción

Opciones:
- **Railway**: `railway up`
- **Heroku**: `git push heroku main`
- **VPS**: PM2 para mantener el proceso activo

---

## 🧪 Testing

### 1. Verificar configuración de usuario

En Firestore, comprueba:
```
users/{uid}/notificationSettings
{
  notificationsEnabled: true,
  reminderTime: "09:00",
  expoPushToken: "ExponentPushToken[xxx]",
  webPushToken: "xxx",
  timezone: "Europe/Madrid"
}
```

### 2. Verificar que tienes objetivos pendientes

En Firestore:
```
users/{uid}/goals
{
  completed: false,
  period: "day",
  date: Timestamp (hoy),
  title: "Hacer ejercicio"
}
```

### 3. Testing con Postman

**Endpoint**: `POST https://us-central1-objetivosapp-2ac48.cloudfunctions.net/sendRemindersManual`

**Headers**:
```
Content-Type: application/json
```

**Resultado esperado**:
```json
{
  "success": true,
  "sent": 2,
  "details": [
    { "userId": "abc123", "platform": "expo", "status": "sent" },
    { "userId": "abc123", "platform": "web", "status": "sent" }
  ]
}
```

### 4. Verificar logs

Firebase Console > Functions > Logs:
```
✅ Usuario abc123 - Hora coincide: 09:00
📋 Usuario abc123 tiene 3 objetivos pendientes
✅ Notificación nativa enviada a abc123
✅ Notificación web enviada a abc123
🎉 Proceso completado
```

---

## 🔐 Seguridad

### Variables de entorno

En Firebase Functions, configura:
```bash
firebase functions:config:set app.url="https://tu-dominio.com"
```

En el código:
```typescript
const appUrl = functions.config().app.url;
```

### Reglas de Firestore

Asegúrate de que solo Cloud Functions pueda leer todos los usuarios:

```javascript
// firestore.rules
match /users/{userId}/notificationSettings/{document=**} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

Para Cloud Functions, usa Firebase Admin SDK que tiene acceso completo.

---

## 📊 Monitoreo

### Firebase Console

Ve a **Functions** > **Logs** para ver:
- Ejecuciones exitosas
- Errores
- Número de notificaciones enviadas

### Cloud Scheduler

Ve a **Cloud Scheduler** en Google Cloud Console:
- Verifica que el job está activo
- Historial de ejecuciones
- Próxima ejecución programada

### Alertas

Configura alertas en Firebase Console:
1. Ir a **Monitoring**
2. Crear alerta para errores en Functions
3. Email cuando falle > 5% de ejecuciones

---

## 🐛 Troubleshooting

### "Billing account not configured"
- Necesitas habilitar el plan Blaze (pago por uso)
- Firebase Console > Upgrade plan

### "Function deployment failed"
- Verifica que package.json tenga todas las dependencias
- Comprueba versión de Node (14+)
- Revisa logs: `firebase functions:log`

### "Notifications not sent"
- Verifica que hay usuarios con `notificationsEnabled: true`
- Comprueba que la hora coincide (±5 min)
- Verifica tokens válidos en Firestore
- Revisa logs de la función

### "Invalid Expo Push Token"
- Token debe empezar con `ExponentPushToken[`
- Regenerar token desde la app

### "Invalid FCM token"
- Token debe ser válido de FCM
- Verificar que VAPID key está configurada
- Regenerar token desde la app web

---

## 💰 Costos estimados

**Firebase Cloud Functions** (Plan Blaze):
- Invocaciones: 2M gratis/mes, luego $0.40 por millón
- Tiempo de cómputo: 400K GB-seg gratis, luego $0.0000025/GB-seg
- Red: 5GB gratis/mes egress

**Estimación para 1000 usuarios**:
- 24 ejecuciones/día = 720/mes
- ~$0.01/mes en Functions
- **Prácticamente gratis** 🎉

---

## ✅ Checklist de implementación

- [ ] Firebase CLI instalado
- [ ] Plan Blaze habilitado
- [ ] Functions inicializadas
- [ ] Código copiado y desplegado
- [ ] Testing manual exitoso
- [ ] Scheduler configurado (cron)
- [ ] Zona horaria correcta
- [ ] Logs verificados
- [ ] Usuarios con tokens válidos
- [ ] Notificaciones recibidas correctamente

---

¿Tienes dudas? Consulta:
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)
- [FCM Admin SDK](https://firebase.google.com/docs/cloud-messaging/admin)
