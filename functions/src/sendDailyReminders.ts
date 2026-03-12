// 🔔 CLOUD FUNCTION PARA ENVÍO AUTOMÁTICO DE RECORDATORIOS
//
// Esta función se ejecuta cada hora y envía notificaciones push
// a los usuarios que tienen recordatorios configurados para esa hora.
//
// CÓMO FUNCIONA:
// - Se ejecuta automáticamente cada hora (Cloud Scheduler)
// - NO necesitas tener el PC encendido (serverless)
// - Envía notificaciones a AMBAS plataformas (nativo + web)
// - Solo envía si: notificationsEnabled=true Y es la hora configurada

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin (solo una vez)
admin.initializeApp();

/**
 * Cloud Function ejecutada por Cloud Scheduler cada hora
 * Envía recordatorios a usuarios según su hora configurada
 */
export const sendDailyReminders = functions.pubsub
  .schedule('0 * * * *') // Cada hora en punto
  .timeZone('Europe/Madrid') // Ajusta según tu zona horaria
  .onRun(async () => {
    console.log('🔔 Iniciando envío de recordatorios...');

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      console.log(`⏰ Hora actual: ${currentTime}`);

      // 1. Buscar usuarios con notificaciones activadas
      const usersSnapshot = await admin
        .firestore()
        .collectionGroup('notificationSettings')
        .where('notificationsEnabled', '==', true)
        .get();

      console.log(`👥 Usuarios con notificaciones: ${usersSnapshot.size}`);

      const notifications: any[] = [];

      for (const doc of usersSnapshot.docs) {
        const settings = doc.data();
        const userId = doc.ref.parent.parent?.id;

        if (!userId) continue;

        // Verificar si es la hora del usuario (±5 minutos de tolerancia)
        const [userHour, userMinute] = settings.reminderTime.split(':').map(Number);
        const timeDiff = Math.abs(currentHour * 60 + currentMinute - (userHour * 60 + userMinute));

        if (timeDiff > 5) {
          // No es la hora de este usuario
          continue;
        }

        console.log(`✅ Usuario ${userId} - Hora coincide: ${settings.reminderTime}`);

        // 2. Obtener objetivos pendientes del usuario para HOY
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const goalsSnapshot = await admin
          .firestore()
          .collection('users')
          .doc(userId)
          .collection('goals')
          .where('completed', '==', false)
          .get();

        // Filtrar objetivos de hoy
        const todayGoals = goalsSnapshot.docs.filter((goalDoc) => {
          const goal = goalDoc.data();

          if (goal.period === 'day') {
            const goalDate = new Date(goal.date.toDate());
            goalDate.setHours(0, 0, 0, 0);
            return goalDate.getTime() === today.getTime();
          }

          if (goal.period === 'week') {
            const startOfWeek = new Date(goal.startDate.toDate());
            const endOfWeek = new Date(goal.endDate.toDate());
            return today >= startOfWeek && today <= endOfWeek;
          }

          if (goal.period === 'month') {
            const startOfMonth = new Date(goal.startDate.toDate());
            const endOfMonth = new Date(goal.endDate.toDate());
            return today >= startOfMonth && today <= endOfMonth;
          }

          return false;
        });

        if (todayGoals.length === 0) {
          console.log(`ℹ️ Usuario ${userId} no tiene objetivos pendientes para hoy`);
          continue;
        }

        console.log(`📋 Usuario ${userId} tiene ${todayGoals.length} objetivos pendientes`);

        // 3. Preparar mensaje de notificación
        const goalTitles = todayGoals.map((g) => g.data().title).join(', ');
        const title = '🎯 ObjetivosApp - Recordatorio';
        const body =
          todayGoals.length === 1
            ? `Tienes 1 objetivo pendiente: ${goalTitles}`
            : `Tienes ${todayGoals.length} objetivos pendientes para hoy`;

        // 4. Enviar notificación NATIVA (Expo) ✅ FUNCIONA PARA APP NATIVA
        if (settings.expoPushToken) {
          try {
            const expoMessage = {
              to: settings.expoPushToken,
              sound: 'default',
              title,
              body,
              data: {
                type: 'daily_reminder',
                userId,
                goalCount: todayGoals.length,
              },
            };

            const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(expoMessage),
            });

            const expoResult = await expoResponse.json();
            console.log(`✅ Notificación nativa enviada a ${userId}:`, expoResult);
            notifications.push({ userId, platform: 'expo', status: 'sent' });
          } catch (error) {
            console.error(`❌ Error enviando notificación nativa a ${userId}:`, error);
            notifications.push({ userId, platform: 'expo', status: 'error', error });
          }
        }

        // 5. Enviar notificación WEB (FCM) ✅ FUNCIONA PARA PWA
        if (settings.webPushToken) {
          try {
            const webMessage = {
              token: settings.webPushToken,
              notification: {
                title,
                body,
                icon: '/icon-192.svg',
              },
              data: {
                type: 'daily_reminder',
                userId,
                goalCount: String(todayGoals.length),
                url: '/home',
              },
              webpush: {
                fcmOptions: {
                  link: 'https://tu-dominio.com/home', // TODO: Cambia por tu URL cuando la tengas
                },
              },
            };

            await admin.messaging().send(webMessage);
            console.log(`✅ Notificación web enviada a ${userId}`);
            notifications.push({ userId, platform: 'web', status: 'sent' });
          } catch (error) {
            console.error(`❌ Error enviando notificación web a ${userId}:`, error);
            notifications.push({ userId, platform: 'web', status: 'error', error });
          }
        }
      }

      console.log('🎉 Proceso completado');
      console.log(`📊 Resumen: ${notifications.length} notificaciones procesadas`);

      return { success: true, sent: notifications.length, details: notifications };
    } catch (error) {
      console.error('❌ Error en sendDailyReminders:', error);
      throw error;
    }
  });

/**
 * HTTP Endpoint para testing manual
 * Llama a esta función con: 
 * curl -X POST https://us-central1-objetivosapp-2ac48.cloudfunctions.net/sendRemindersManual
 */
export const sendRemindersManual = functions.https.onRequest(async (req, res) => {
  try {
    console.log('🧪 Testing manual de envío de recordatorios...');
    
    // Aquí podrías hacer la misma lógica que sendDailyReminders
    // pero directamente llamada por HTTP para testing
    
    res.status(200).json({
      message: 'Para testing manual, usa la consola de Firebase o revisa los logs de la función scheduled',
      info: 'La función sendDailyReminders se ejecuta automáticamente cada hora'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: String(error) });
  }
});
