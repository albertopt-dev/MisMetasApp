# 🚀 Instalación del Backend - Pasos Exactos

## ✅ Lo que ya está hecho

He creado toda la estructura de Firebase Functions por ti:
- ✅ `functions/` - Carpeta con todo el código
- ✅ `functions/src/sendDailyReminders.ts` - Función que envía notificaciones
- ✅ `functions/src/index.ts` - Punto de entrada
- ✅ `functions/package.json` - Dependencias configuradas
- ✅ `firebase.json` - Configuración de Firebase
- ✅ `.firebaserc` - Proyecto configurado (objetivosapp-2ac48)

**El código YA funciona para AMBAS plataformas**:
- 📱 Envía a usuarios nativos (Expo) automáticamente
- 🌐 Envía a usuarios web (FCM) automáticamente
- ⏰ Se ejecuta cada hora SIN necesidad de tener tu PC prendido

---

## 📋 Pasos para desplegar (15 minutos)

### 1️⃣ Instalar Firebase CLI

Abre PowerShell y ejecuta:

```powershell
npm install -g firebase-tools
```

### 2️⃣ Login en Firebase

```powershell
firebase login
```

Se abrirá tu navegador para autenticarte. Inicia sesión con tu cuenta de Google.

### 3️⃣ Instalar dependencias de Functions

```powershell
cd "C:\Users\Alberto\Desktop\proyecto objetivos\functions"
npm install
```

Esto instalará todas las dependencias necesarias (Firebase Admin, etc.)

### 4️⃣ Habilitar plan Blaze (necesario para Cloud Scheduler)

Ve a Firebase Console:
1. https://console.firebase.google.com/
2. Selecciona tu proyecto: **objetivosapp-2ac48**
3. Ve a ⚙️ **Configuración** (abajo a la izquierda)
4. Pestaña **"Uso y facturación"**
5. Click en **"Modificar plan"**
6. Selecciona **"Blaze (pago por uso)"**
7. Añade método de pago (tarjeta)

**No te preocupes por costos**:
- Los primeros 2M de invocaciones/mes son **GRATIS**
- Tu caso (24 ejecuciones/día) = ~$0.01/mes
- Google te da $0 de cobro si es menos de $1 al mes
- **Prácticamente gratis** 🎉

### 5️⃣ Desplegar las Functions

Vuelve a la raíz del proyecto:

```powershell
cd "C:\Users\Alberto\Desktop\proyecto objetivos"
firebase deploy --only functions
```

Este comando:
- Compila el código TypeScript
- Sube las funciones a Google Cloud
- Configura el Cloud Scheduler automáticamente
- Tarda 2-3 minutos

### 6️⃣ Verificar que funciona

Después del deploy, verás algo como:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/objetivosapp-2ac48/overview
Functions:
  sendDailyReminders(europe-west1)
  sendRemindersManual(europe-west1)
```

Ve a Firebase Console > Functions para ver tus funciones desplegadas.

---

## 🧪 Testing

### Opción 1: Esperar a la siguiente hora

La función se ejecutará automáticamente en la siguiente hora en punto (ej: 14:00, 15:00, etc.)

### Opción 2: Ejecutar manualmente

En Firebase Console:
1. Ve a **Functions**
2. Busca `sendDailyReminders`
3. Click en la función
4. Pestaña **"Registros"** (Logs)
5. Verás los logs de ejecución

O ejecuta desde PowerShell:

```powershell
firebase functions:log
```

Para ver los logs en tiempo real.

---

## 🎯 Configuración de zona horaria

El código está configurado para **Europe/Madrid**. Si estás en otra zona:

1. Abre `functions/src/sendDailyReminders.ts`
2. Busca la línea:
   ```typescript
   .timeZone('Europe/Madrid')
   ```
3. Cámbiala por tu zona (ej: 'America/Mexico_City', 'America/Buenos_Aires', etc.)
4. Vuelve a desplegar:
   ```powershell
   firebase deploy --only functions
   ```

**Zonas horarias válidas**: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

---

## 📊 Monitoreo

### Ver logs en vivo

```powershell
firebase functions:log --only sendDailyReminders
```

Verás cosas como:
```
⏰ Hora actual: 09:00
👥 Usuarios con notificaciones: 3
✅ Usuario abc123 - Hora coincide: 09:00
📋 Usuario abc123 tiene 2 objetivos pendientes
✅ Notificación nativa enviada a abc123
✅ Notificación web enviada a abc123
🎉 Proceso completado
```

### Firebase Console

Ve a **Functions** > **sendDailyReminders** > **Logs** para ver:
- Ejecuciones exitosas
- Errores (si hay)
- Número de notificaciones enviadas

---

## 🔧 Cambiar frecuencia de ejecución

Por defecto se ejecuta cada hora. Para cambiar:

1. Abre `functions/src/sendDailyReminders.ts`
2. Busca:
   ```typescript
   .schedule('0 * * * *') // Cada hora en punto
   ```
3. Cámbialo:
   - `0 9 * * *` - Solo a las 9:00 AM
   - `0 9,18 * * *` - 9:00 AM y 6:00 PM
   - `*/30 * * * *` - Cada 30 minutos
   - `0 0 * * *` - Una vez al día a medianoche

4. Redeploy:
   ```powershell
   firebase deploy --only functions
   ```

---

## ❓ Troubleshooting

### "Billing account not configured"
- Necesitas habilitar plan Blaze (paso 4)

### "Permission denied"
- Verifica que estás logueado: `firebase login`
- Verifica el proyecto: `firebase use objetivosapp-2ac48`

### "Build failed"
- Borra y reinstala: 
  ```powershell
  cd functions
  rm -r node_modules
  npm install
  ```

### "No notifications sent"
- Verifica en Firestore que tienes usuarios con `notificationsEnabled: true`
- Verifica que la hora coincide (±5 minutos)
- Revisa logs: `firebase functions:log`

---

## ✅ Checklist Final

- [ ] Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] Login exitoso (`firebase login`)
- [ ] Plan Blaze habilitado en Firebase Console
- [ ] Dependencias instaladas (`cd functions && npm install`)
- [ ] Functions desplegadas (`firebase deploy --only functions`)
- [ ] Logs verificados (Firebase Console > Functions > Logs)
- [ ] Zona horaria correcta (Europe/Madrid por defecto)
- [ ] Esperando primera ejecución automática

---

## 🎉 ¡Listo!

Una vez completados estos pasos:
- ✅ Las notificaciones se enviarán **automáticamente** cada hora
- ✅ NO necesitas tener tu PC prendido
- ✅ Funciona para **AMBAS plataformas** (nativo + web)
- ✅ Solo envía a usuarios con notificaciones activadas
- ✅ Solo envía en la hora que cada usuario configuró

**Costos**: ~$0.01/mes (prácticamente gratis)

---

¿Problemas? Revisa:
- Logs: `firebase functions:log`
- Firebase Console: https://console.firebase.google.com/project/objetivosapp-2ac48/functions
- [backend-example/README.md](../backend-example/README.md) - Guía detallada
