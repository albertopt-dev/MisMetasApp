# 🎯 Próximos Pasos - Activar Notificaciones Automáticas

## 📊 Estado Actual

### ✅ Lo que ya funciona
- **Sistema de notificaciones completo**: Toda la infraestructura está lista
- **Configuración de usuario**: Pantalla funcional donde activas/desactivas y eliges la hora
- **Permisos y tokens**: Se gestionan automáticamente y se guardan en Firestore
- **Notificaciones de prueba**: El botón "Enviar notificación de prueba" funciona perfectamente
- **Multi-plataforma**: Todo funciona en nativo (Expo) y web (PWA)

### ❌ Lo que falta
- **Backend automático**: Un servidor/función que envíe las notificaciones cada día a la hora configurada

---

## 🚀 Para Activar Notificaciones Automáticas

Necesitas desplegar un **backend** que lea Firestore y envíe las notificaciones. Tienes 2 opciones:

### Opción 1: Firebase Cloud Functions ⭐ (Recomendado)

**Ventajas**:
- ✅ Serverless (no necesitas servidor propio)
- ✅ Escalable automáticamente
- ✅ Prácticamente gratis (1000 usuarios = $0.01/mes)
- ✅ Integración nativa con Firebase

**Pasos rápidos**:

1. **Instalar Firebase CLI** (si no lo tienes):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Inicializar Functions**:
   ```bash
   cd "C:\Users\Alberto\Desktop\proyecto objetivos"
   firebase init functions
   ```
   - Proyecto: `objetivosapp-2ac48`
   - Lenguaje: TypeScript
   - Instalar dependencias: Sí

3. **Copiar el código**:
   ```bash
   cp backend-example/sendDailyReminders.ts functions/src/
   ```

4. **Actualizar `functions/src/index.ts`**:
   ```typescript
   export { sendDailyReminders, sendRemindersManual } from './sendDailyReminders';
   ```

5. **Desplegar**:
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

6. **Activar billing**:
   - Ve a Firebase Console > Configuración
   - Upgrade a plan **Blaze** (pago por uso)
   - Necesario para Cloud Scheduler

7. **¡Listo!** 🎉
   - La función se ejecutará cada hora automáticamente
   - Revisa logs en Firebase Console > Functions

**Tiempo estimado**: 15-30 minutos

**Documentación completa**: [backend-example/README.md](backend-example/README.md)

---

### Opción 2: Servidor Node.js con Cron

**Ventajas**:
- ✅ Control total
- ✅ No requiere plan Blaze de Firebase

**Desventajas**:
- ❌ Necesitas un servidor 24/7 (Railway, Heroku, VPS)
- ❌ Más configuración

**Pasos**:

1. **Crear proyecto**:
   ```bash
   mkdir notification-server
   cd notification-server
   npm init -y
   npm install express node-cron firebase-admin
   ```

2. **Copiar lógica** de `backend-example/sendDailyReminders.ts`

3. **Configurar cron job** para ejecutar cada hora

4. **Desplegar** en Railway/Heroku/VPS

**Tiempo estimado**: 1-2 horas

**Documentación completa**: [backend-example/README.md](backend-example/README.md) sección "Opción 2"

---

## 🧪 Testing

### Antes de desplegar

Verifica que todo esté listo:

1. **Usuarios con configuración**:
   - Ve a Firestore Console
   - Busca: `users/{tu-uid}/notificationSettings`
   - Debe tener:
     ```
     notificationsEnabled: true
     reminderTime: "09:00"
     expoPushToken: "ExponentPushToken[xxx]" (si usas app nativa)
     webPushToken: "xxx" (si usas PWA)
     ```

2. **Objetivos pendientes**:
   - En `users/{tu-uid}/goals`
   - Debe haber al menos un objetivo de hoy sin completar

3. **Probarlo manualmente**:
   - Después del deploy, llama al endpoint HTTP
   - Verás en logs si se enviaron notificaciones

---

## 📋 Checklist Completo

- [ ] **Configuración en la app**:
  - [ ] Activar notificaciones en la app
  - [ ] Elegir hora del recordatorio
  - [ ] Otorgar permisos
  - [ ] Probar "Enviar notificación de prueba"

- [ ] **Firebase Console**:
  - [ ] Plan Blaze activado (para Cloud Functions)
  - [ ] Verificar token en Firestore

- [ ] **Backend** (elige una opción):
  - [ ] Opción 1: Firebase Cloud Functions desplegada
  - [ ] Opción 2: Servidor Node.js en Railway/Heroku

- [ ] **Testing**:
  - [ ] Llamar endpoint manual
  - [ ] Verificar logs
  - [ ] Recibir notificación de prueba

- [ ] **Producción**:
  - [ ] Scheduler configurado (cron)
  - [ ] Zona horaria correcta
  - [ ] Notificaciones recibidas a la hora configurada

---

## ❓ Preguntas Frecuentes

### ¿Cuánto cuesta?

**Firebase Cloud Functions** (Plan Blaze):
- Primeros 2M invocaciones/mes: **Gratis**
- Tu caso (24 ejecuciones/día): **$0.01/mes**
- Prácticamente gratis 🎉

### ¿Necesito servidor propio?

**No**, con Cloud Functions es serverless (Google lo maneja por ti).

### ¿Funciona sin internet?

No, las notificaciones push requieren conexión para:
- Leer Firestore
- Enviar a Expo API / FCM
- El usuario recibir la notificación

### ¿Puedo testear sin desplegar?

Sí, las **notificaciones de prueba locales** ya funcionan sin backend.

Para notificaciones automáticas, necesitas el backend.

### ¿Qué pasa si el usuario no tiene objetivos?

El backend verifica si hay objetivos pendientes. Si no hay, **no envía notificación** (ahorra costos).

---

## 📚 Recursos

- **Documentación completa**: [NOTIFICACIONES.md](NOTIFICACIONES.md)
- **Backend paso a paso**: [backend-example/README.md](backend-example/README.md)
- **Código de ejemplo**: [backend-example/sendDailyReminders.ts](backend-example/sendDailyReminders.ts)
- **Firebase Functions Docs**: https://firebase.google.com/docs/functions
- **Expo Push Notifications**: https://docs.expo.dev/push-notifications/

---

## 🎉 Resumen

**Para recibir notificaciones automáticas**:

1. ✅ Ya tienes toda la app configurada
2. 🚀 Solo falta desplegar el backend (15-30 min)
3. 🎯 Sigue los pasos de "Opción 1" arriba
4. ✨ ¡Listo! Recibirás recordatorios diarios

**¿Necesitas ayuda?** Consulta los README detallados o revisa los logs en Firebase Console.
