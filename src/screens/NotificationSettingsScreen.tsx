// 🔔 PANTALLA DE AJUSTES DE NOTIFICACIONES - NATIVO
//
// Permite al usuario configurar las notificaciones:
// - Activar/desactivar recordatorios
// - Elegir hora de recordatorio
// - Ver estado de permisos
// - Solicitar permisos si están denegados

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Linking } from 'react-native';
import { Text, Surface, Switch, Button, IconButton } from 'react-native-paper';
import { useNotifications } from '../contexts/NotificationContext';
import { colors, spacing, borderRadius } from '../theme/colors';

export default function NotificationSettingsScreen({ navigation }: any) {
  const {
    settings,
    permissionStatus,
    isLoading,
    token,
    registerForPush,
    requestPermissions,
    updateSettings,
    sendTestNotification,
  } = useNotifications();

  const [selectedHour, setSelectedHour] = useState<number>(
    parseInt(settings.reminderTime.split(':')[0])
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    parseInt(settings.reminderTime.split(':')[1])
  );

  /**
   * Activar/desactivar notificaciones
   */
  const handleToggleNotifications = async (value: boolean) => {
    try {
      if (value && permissionStatus !== 'granted') {
        // Si quiere activar y no tiene permisos, solicitarlos
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permisos necesarios',
            'Para recibir recordatorios, debes otorgar permisos de notificaciones en la configuración de tu dispositivo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir Config.', onPress: openAppSettings },
            ]
          );
          return;
        }

        // Si se otorgaron permisos, registrar para push
        await registerForPush();
      }

      await updateSettings({ notificationsEnabled: value });
    } catch (error) {
      console.error('Error al cambiar estado de notificaciones:', error);
      Alert.alert('Error', 'No se pudo actualizar la configuración');
    }
  };

  /**
   * Actualizar hora de recordatorio
   */
  const handleUpdateTime = async () => {
    const time = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

    try {
      await updateSettings({ reminderTime: time });
      Alert.alert('✅ Guardado', `Hora de recordatorio: ${time}`);
    } catch (error) {
      console.error('Error al actualizar hora:', error);
      Alert.alert('Error', 'No se pudo guardar la hora');
    }
  };

  /**
   * Abrir configuración del sistema
   */
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  /**
   * Probar notificación local
   */
  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('✅ Enviada', 'Deberías ver la notificación en unos segundos');
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
      Alert.alert('Error', 'No se pudo enviar la notificación');
    }
  };

  /**
   * Solicitar permisos manualmente
   */
  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();

    if (granted) {
      Alert.alert('✅ Permisos otorgados', 'Ya puedes recibir notificaciones');
      await registerForPush();
    } else {
      Alert.alert(
        'Permisos denegados',
        'Debes otorgar permisos desde la configuración del dispositivo',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Config.', onPress: openAppSettings },
        ]
      );
    }
  };

  /**
   * Render estado de permisos
   */
  const renderPermissionStatus = () => {
    let statusText = '';
    let statusColor = colors.textLight;
    let statusIcon = 'help-circle';

    switch (permissionStatus) {
      case 'granted':
        statusText = 'Permisos otorgados';
        statusColor = '#10b981';
        statusIcon = 'check-circle';
        break;
      case 'denied':
        statusText = 'Permisos denegados';
        statusColor = '#ef4444';
        statusIcon = 'close-circle';
        break;
      case 'undetermined':
        statusText = 'Permisos no solicitados';
        statusColor = colors.accent;
        statusIcon = 'help-circle';
        break;
    }

    return (
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusIcon}>{statusIcon === 'check-circle' ? '✅' : statusIcon === 'close-circle' ? '❌' : '❓'}</Text>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Estado de permisos</Text>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        {permissionStatus !== 'granted' && (
          <Button
            mode="outlined"
            onPress={handleRequestPermissions}
            style={styles.permissionButton}
            labelStyle={{ color: colors.primary }}
          >
            Solicitar permisos
          </Button>
        )}

        {permissionStatus === 'denied' && (
          <Button
            mode="text"
            onPress={openAppSettings}
            style={styles.settingsButton}
            labelStyle={{ color: colors.textLight, fontSize: 12 }}
          >
            Abrir configuración del dispositivo
          </Button>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.primary}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <View style={{ width: 48 }} />
        </View>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado de permisos */}
        <Surface style={styles.section}>
          {renderPermissionStatus()}
        </Surface>

        {/* Activar/Desactivar */}
        <Surface style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>🔔 Recordatorios diarios</Text>
              <Text style={styles.settingDescription}>
                Recibe una notificación diaria para revisar tus objetivos
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              color={colors.primary}
              disabled={isLoading}
            />
          </View>
        </Surface>

        {/* Hora de recordatorio */}
        {settings.notificationsEnabled && (
          <Surface style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Hora de recordatorio</Text>
            <Text style={styles.sectionDescription}>
              Elige a qué hora quieres recibir el recordatorio
            </Text>

            <View style={styles.timePickerContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>Hora</Text>
                <View style={styles.timeControls}>
                  <IconButton
                    icon="chevron-up"
                    size={20}
                    iconColor={colors.primary}
                    onPress={() => setSelectedHour((prev) => (prev + 1) % 24)}
                  />
                  <Text style={styles.timeValue}>{String(selectedHour).padStart(2, '0')}</Text>
                  <IconButton
                    icon="chevron-down"
                    size={20}
                    iconColor={colors.primary}
                    onPress={() => setSelectedHour((prev) => (prev - 1 + 24) % 24)}
                  />
                </View>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>Minuto</Text>
                <View style={styles.timeControls}>
                  <IconButton
                    icon="chevron-up"
                    size={20}
                    iconColor={colors.primary}
                    onPress={() => setSelectedMinute((prev) => (prev + 5) % 60)}
                  />
                  <Text style={styles.timeValue}>{String(selectedMinute).padStart(2, '0')}</Text>
                  <IconButton
                    icon="chevron-down"
                    size={20}
                    iconColor={colors.primary}
                    onPress={() => setSelectedMinute((prev) => (prev - 5 + 60) % 60)}
                  />
                </View>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleUpdateTime}
              style={styles.saveButton}
              buttonColor={colors.primary}
              disabled={isLoading}
            >
              Guardar hora
            </Button>
          </Surface>
        )}

        {/* Información técnica */}
        {__DEV__ && (
          <Surface style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Info técnica (solo desarrollo)</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Token registrado:</Text>
              <Text style={styles.infoValue}>{token ? 'Sí' : 'No'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timezone:</Text>
              <Text style={styles.infoValue}>{settings.timezone}</Text>
            </View>
            {token && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Token (abreviado):</Text>
                <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                  {token.substring(0, 20)}...{token.substring(token.length - 20)}
                </Text>
              </View>
            )}
          </Surface>
        )}

        {/* Botón de prueba */}
        {permissionStatus === 'granted' && (
          <Surface style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 Probar notificación</Text>
            <Text style={styles.sectionDescription}>
              Envía una notificación de prueba para ver cómo se vería
            </Text>
            <Button
              mode="outlined"
              onPress={handleTestNotification}
              style={styles.testButton}
              labelStyle={{ color: colors.primary }}
              disabled={isLoading}
            >
              Enviar notificación de prueba
            </Button>
          </Surface>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '30',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  statusContainer: {
    gap: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusIcon: {
    fontSize: 32,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionButton: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  settingsButton: {
    marginTop: -spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  timeInputGroup: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  timeControls: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: -spacing.sm,
    minWidth: 60,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.xl,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  testButton: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  infoRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
  },
});
