// 🔔 PANTALLA DE AJUSTES DE NOTIFICACIONES - WEB
//
// Permite al usuario configurar las notificaciones:
// - Activar/desactivar recordatorios
// - Elegir hora de recordatorio
// - Ver estado de permisos
// - Solicitar permisos del navegador

import React, { useState } from 'react';
import { Box, Typography, Switch, Button, Paper, Alert, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
// import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';

export default function NotificationSettingsScreen() {
  const navigate = useNavigate();
  const {
    settings,
    permissionStatus,
    isLoading,
    isSupported,
    token,
    registerForPush,
    requestPermissions,
    updateSettings,
    sendTestNotification,
  } = useNotifications();

  const [selectedTime, setSelectedTime] = useState(settings.reminderTime);

  /**
   * Activar/desactivar notificaciones
   */
  const handleToggleNotifications = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;

    try {
      if (value && permissionStatus !== 'granted') {
        // Si quiere activar y no tiene permisos, solicitarlos
        const granted = await requestPermissions();
        if (!granted) {
          alert(
            'Para recibir recordatorios, debes otorgar permisos de notificaciones en la configuración de tu navegador.'
          );
          return;
        }

        // Si se otorgaron permisos, registrar para push
        await registerForPush();
      }

      await updateSettings({ notificationsEnabled: value });
    } catch (error) {
      console.error('Error al cambiar estado de notificaciones:', error);
      alert('No se pudo actualizar la configuración');
    }
  };

  /**
   * Actualizar hora de recordatorio
   */
  const handleUpdateTime = async () => {
    try {
      await updateSettings({ reminderTime: selectedTime });
      alert(`✅ Hora guardada: ${selectedTime}`);
    } catch (error) {
      console.error('Error al actualizar hora:', error);
      alert('No se pudo guardar la hora');
    }
  };

  /**
   * Probar notificación local
   */
  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      alert('✅ Notificación enviada. Deberías verla en unos segundos.');
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
      alert('No se pudo enviar la notificación');
    }
  };

  /**
   * Solicitar permisos manualmente
   */
  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();

    if (granted) {
      alert('✅ Permisos otorgados. Ya puedes recibir notificaciones.');
      await registerForPush();
    } else {
      alert('Permisos denegados. Debes otorgarlos desde la configuración del navegador.');
    }
  };

  /**
   * Render estado de permisos
   */
  const renderPermissionStatus = () => {
    let statusText = '';
    // let statusColor = '#9ca3af'; // No se usa actualmente
    let StatusIcon = HelpIcon;

    switch (permissionStatus) {
      case 'granted':
        statusText = 'Permisos otorgados';
        // statusColor = '#10b981';
        StatusIcon = CheckCircleIcon;
        break;
      case 'denied':
        statusText = 'Permisos denegados';
        // statusColor = '#ef4444';
        StatusIcon = ErrorIcon;
        break;
      case 'default':
        statusText = 'Permisos no solicitados';
        // statusColor = '#f59e0b';
        StatusIcon = HelpIcon;
        break;
    }

    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <StatusIcon sx={{ fontSize: 40 }} />
          <Box flex={1}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
              Estado de permisos
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {statusText}
            </Typography>
          </Box>
        </Box>

        {permissionStatus !== 'granted' && (
          <Button
            variant="contained"
            onClick={handleRequestPermissions}
            fullWidth
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            Solicitar permisos
          </Button>
        )}

        {permissionStatus === 'denied' && (
          <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Typography variant="body2" color="white">
              Los permisos están bloqueados. Debes habilitarlos desde la configuración del
              navegador (icono de candado en la barra de direcciones).
            </Typography>
          </Alert>
        )}
      </Paper>
    );
  };

  if (!isSupported) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', p: 3 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mb={4}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon sx={{ color: '#667eea', fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold" color="#1f2937">
              Notificaciones
            </Typography>
          </Box>

          <Alert severity="error" sx={{ borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notificaciones no soportadas
            </Typography>
            <Typography>
              Tu navegador no soporta notificaciones push. Intenta usar Chrome, Firefox, Edge o
              Safari en su última versión.
            </Typography>
          </Alert>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 6,
          pb: 4,
          px: 3,
          color: 'white',
        }}
      >
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mb={2}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon sx={{ fontSize: 28 }} />
            <Typography variant="h4" fontWeight="bold" letterSpacing={1}>
              Notificaciones
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Configura tus recordatorios diarios
          </Typography>
        </motion.div>
      </Box>

      <Box sx={{ maxWidth: 600, mx: 'auto', px: 3, mt: -3 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Estado de permisos */}
          {renderPermissionStatus()}

          {/* Activar/Desactivar */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="flex-start" gap={2} flex={1}>
                <NotificationsIcon sx={{ color: '#667eea', fontSize: 28, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="#1f2937" gutterBottom>
                    Recordatorios diarios
                  </Typography>
                  <Typography variant="body2" color="#6b7280">
                    Recibe una notificación diaria para revisar tus objetivos
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={settings.notificationsEnabled}
                onChange={handleToggleNotifications}
                disabled={isLoading}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#667eea',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#667eea',
                  },
                }}
              />
            </Box>
          </Paper>

          {/* Hora de recordatorio */}
          {settings.notificationsEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                elevation={0}
                sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <AccessTimeIcon sx={{ color: '#667eea', fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="#1f2937">
                      Hora de recordatorio
                    </Typography>
                    <Typography variant="body2" color="#6b7280">
                      Elige a qué hora quieres recibir el recordatorio
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2} alignItems="center" mb={2}>
                  <TextField
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    fullWidth
                    InputProps={{
                      sx: {
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#667eea',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleUpdateTime}
                    disabled={isLoading || selectedTime === settings.reminderTime}
                    sx={{
                      bgcolor: '#667eea',
                      fontWeight: 'bold',
                      minWidth: 120,
                      '&:hover': { bgcolor: '#5568d3' },
                    }}
                  >
                    Guardar
                  </Button>
                </Box>

                <Typography variant="caption" color="#6b7280">
                  Hora actual configurada: {settings.reminderTime}
                </Typography>
              </Paper>
            </motion.div>
          )}

          {/* Información técnica */}
          {import.meta.env.DEV && (
            <Paper
              elevation={0}
              sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e5e7eb', bgcolor: '#f3f4f6' }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <SettingsIcon sx={{ color: '#6b7280' }} />
                <Typography variant="h6" fontWeight="bold" color="#4b5563">
                  Info técnica (solo desarrollo)
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #d1d5db">
                  <Typography variant="body2" color="#6b7280">
                    Token registrado:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="#1f2937">
                    {token ? 'Sí' : 'No'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #d1d5db">
                  <Typography variant="body2" color="#6b7280">
                    Timezone:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="#1f2937">
                    {settings.timezone}
                  </Typography>
                </Box>
                {token && (
                  <Box py={1}>
                    <Typography variant="body2" color="#6b7280" mb={0.5}>
                      Token (abreviado):
                    </Typography>
                    <Typography
                      variant="caption"
                      fontFamily="monospace"
                      color="#1f2937"
                      sx={{
                        wordBreak: 'break-all',
                        display: 'block',
                        bgcolor: 'white',
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      {token.substring(0, 40)}...{token.substring(token.length - 40)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          )}

          {/* Botón de prueba */}
          {permissionStatus === 'granted' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <SendIcon sx={{ color: '#667eea', fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="#1f2937">
                      Probar notificación
                    </Typography>
                    <Typography variant="body2" color="#6b7280">
                      Envía una notificación de prueba para ver cómo se vería
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  onClick={handleTestNotification}
                  disabled={isLoading}
                  fullWidth
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    fontWeight: 'bold',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: '#5568d3',
                      bgcolor: '#f3f4f6',
                    },
                  }}
                >
                  Enviar notificación de prueba
                </Button>
              </Paper>
            </motion.div>
          )}
        </motion.div>
      </Box>
    </Box>
  );
}
