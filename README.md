# 🎯 ObjetivosApp - Aplicación de Gestión de Objetivos

Una aplicación **multiplataforma** moderna con diseño futurista oscuro y neón para gestionar tus objetivos diarios, semanales, mensuales y anuales. Totalmente en español con sistema de sub-objetivos para un seguimiento detallado de tus metas.

## 🌐 Plataformas Disponibles

- **📱 App Nativa**: React Native (iOS/Android) - Listo para App Store y Play Store
- **🌐 PWA**: Aplicación web progresiva instalable - Funcional en cualquier navegador
- **☁️ Base de datos compartida**: Mismo Firebase Firestore para todas las plataformas

---

## 🔔 Estado de Notificaciones Push

### ✅ Sistema completo implementado
- **Infraestructura** lista en ambas plataformas (nativo + web)
- **Pantalla de configuración** funcional (activa/desactiva + elige hora)
- **Gestión automática** de permisos y tokens
- **Notificaciones de prueba** funcionando - Pruébalo desde la app
- **Backend listo**: Código de Cloud Functions implementado en `functions/`

## ✨ Características Principales

### 🎨 Diseño y Tema
- **Tema oscuro futurista** con efectos neón 
- Animaciones fluidas y efectos de brillo
- Gradientes personalizados por objetivo
- Interfaz completamente en **español**

### 📅 Sistema de Calendario Inteligente
- Calendario interactivo con indicadores visuales por periodo
- Marcadores de colores unificados:
  - 🔵 **Cyan**: Objetivos del día
  - 🟣 **Magenta**: Objetivos de la semana
  - 🟡 **Amarillo**: Objetivos del mes
  - 🟢 **Verde**: Objetivos del año
- Leyenda visual debajo del calendario
- Visualización simultánea de todos los periodos

### 🎯 Gestión Avanzada de Objetivos
- **4 tipos de periodos**: Día, Semana, Mes, Año
- **Sistema de prioridades**: Baja, Media, Alta
- **Colores personalizables** para cada objetivo
- **Descripción detallada** opcional
- Edición completa de objetivos existentes
- Eliminación con confirmación

### 📋 Sub-objetivos Diarios (Semana/Mes)
- **Generación automática**: Crea sub-objetivos para cada día de la semana/mes con un clic
- **Sub-objetivos personalizados**: Añade manualmente objetivos específicos con fecha
- **Formato de fecha**: DD/MM/YYYY (ej: 15/03/2026)
- **Seguimiento independiente**: Marca cada sub-objetivo por separado
- **Validación inteligente**: El objetivo principal solo se puede completar cuando TODOS los sub-objetivos están hechos
- **Sección expandible**: Visualiza u oculta los sub-objetivos con contador (ej: "📋 Sub-objetivos 3/7")
- **Indicador visual de fecha**: Cada sub-objetivo muestra su fecha específica 📅

### 🔐 Autenticación y Sesión
- Inicio de sesión con **Email y contraseña**
- Registro de nuevos usuarios
- **"Mantener sesión iniciada"**: Checkbox opcional que cierra sesión automáticamente cuando la app va a segundo plano si está desmarcado
- Persistencia de preferencias de sesión

### 🔔 Notificaciones Push
- **Recordatorios diarios programables**: Recibe notificaciones para revisar tus objetivos
- **Configuración por usuario**: Activa/desactiva y elige la hora del recordatorio
- **Multi-plataforma**: Funciona tanto en app nativa (Expo) como en PWA (FCM)
- **Notificaciones locales y remotas**: Soporte completo para ambos tipos
- **Permisos inteligentes**: Gestión automática de permisos del sistema/navegador
- **Tokens en la nube**: Sincronización segura de tokens en Firestore
- **Configuración desde la app**: Pantalla dedicada de ajustes accesible desde el menú

### ☁️ Sincronización en la Nube
- Backend completo con **Firebase Firestore**

## 🛠️ Tecnologías Utilizadas

### 📱 App Nativa (React Native)
- **React Native** + **Expo SDK 54.0.33**
- **TypeScript 5.3.0** - Tipado estático completo
- **Firebase 10.14.1** (Authentication + Firestore)
- **Expo Notifications** - Push notifications nativas
- **Expo Device** - Detección de dispositivo
- **Expo Constants** - Configuración de proyecto
- **React Navigation** - Navegación entre pantallas
- **React Native Paper** - Componentes Material Design
- **React Native Calendars 1.1306.0** - Calendario con localización española
- **date-fns 3.6.0** - Manipulación de fechas en español
- **Expo Linear Gradient** - Efectos visuales
- **AsyncStorage 2.2.0** - Almacenamiento local

### 🌐 PWA (Aplicación Web)
- **Vite 5.0** + **React 18.2** - Build rápido y moderno
- **TypeScript 5.3.0** - Tipado estático completo
- **Material-UI 5.15** - Componentes web modernos
- **Framer Motion 11.0** - Animaciones fluidas en web
- **React Calendar 5.0** - Calendario web interactivo
- **Firebase 10.14.1** - Mismo backend que la app nativa
- **Firebase Cloud Messaging** - Push notifications web
- **Service Worker** - Notificaciones en segundo plano
- **React Router 6.22** - Navegación web
- **Vite PWA Plugin** - Service Worker y manifest automático


## 📱 Cómo usar la App

### 1️⃣ Inicio de Sesión
- Regístrate con email y contraseña
- Marca "Mantener sesión iniciada" si quieres que la sesión persista
- Si desmarcas la opción, la sesión se cerrará al minimizar la app

### 2️⃣ Pantalla Principal (Home)
- **Calendario superior**: Visualiza todos tus objetivos marcados por colores
- **Leyenda**: Identifica cada tipo de periodo por su color
- **Listas agrupadas**: Objetivos organizados por Día/Semana/Mes/Año
- **Tarjetas de objetivos**: 
  - Toca para editar
  - Checkbox principal para marcar como completado
  - Si tiene sub-objetivos, se muestra el contador
  - Botón ✕ para eliminar

### 3️⃣ Crear Objetivo Nuevo
1. Toca el botón **+** flotante
2. Escribe un **título** (obligatorio)
3. Añade una **descripción** (opcional)
4. **Si eliges Semana o Mes**:
   - Aparece la sección "Objetivos diarios"
   - Toca **"Generar automáticamente"** para crear sub-objetivos para todos los días
   - O añade manualmente: escribe título + fecha (DD/MM/YYYY) + botón ➕
   - Visualiza la fecha de cada sub-objetivo: 📅 11/03/2026
   - Elimina cualquiera con el botón ✕
5. Selecciona el **periodo** (Día/Semana/Mes/Año)
6. Elige la **fecha** o periodo específico en el calendario
7. Selecciona la **prioridad** (Baja/Media/Alta)
8. Elige un **color** para tu objetivo
9. Toca **"Guardar Objetivo"**

### 4️⃣ Gestionar Sub-objetivos
Para objetivos semanales o mensuales:
- Toca el contador de sub-objetivos para expandir/colapsar
- Marca cada sub-objetivo individualmente con su checkbox
- **Importante**: El checkbox principal estará bloqueado (deshabilitado) hasta que completes TODOS los sub-objetivos
- Una vez todos los sub-objetivos estén completados, podrás marcar el objetivo principal

### 5️⃣ Editar Objetivos
- Toca cualquier tarjeta de objetivo
- Modifica los campos que necesites (título, descripción, sub-objetivos, etc.)
- Los sub-objetivos se pueden añadir, eliminar o editar
- Toca **"Actualizar Objetivo"**

### 6️⃣ Visualizar Progreso
- El calendario muestra con puntos de colores los días con objetivos
- Las tarjetas completadas tienen efectos visuales especiales
- Los sub-objetivos completados aparecen tachados

### 7️⃣ Configurar Notificaciones
1. Toca el menú (⋮) en la esquina superior derecha
2. Selecciona **"Notificaciones"**
3. **Activa el switch** "Recordatorios diarios"
4. Otorga los permisos cuando te lo solicite el sistema/navegador
5. **Elige la hora** del recordatorio usando los selectores
6. Toca **"Guardar hora"**
7. Opcional: Presiona **"Enviar notificación de prueba"** para verificar

**Importante**:
- **Nativo**: Las notificaciones push remotas requieren un Development Build (no funcionan en Expo Go)
- **Web**: Debes estar en HTTPS y tu navegador debe soportar notificaciones
- Los permisos pueden revocarse desde la configuración del sistema/navegador

**⚠️ Estado actual**: Las notificaciones de prueba funcionan perfectamente. El backend está implementado en `functions/`.


## 🔄 Mejoras y Roadmap

### ✅ Completado
- [x] **PWA instalable** - Funciona en Chrome, Edge, Safari
- [x] **Estadísticas detalladas de progreso** - Pantalla Stats con gráficos
- [x] **Sistema de notificaciones push completo**:
  - [x] Infraestructura nativa (Expo Notifications)
  - [x] Infraestructura web (FCM + Service Worker)
  - [x] UI de configuración (pantalla de ajustes)
  - [x] Gestión de permisos y tokens
  - [x] Notificaciones de prueba (locales)
  - [x] Documentación completa (NOTIFICACIONES.md)
  - [x] **Backend implementado** (functions/sendDailyReminders.ts) ✨ NUEVO
  - [x] Funciona para AMBAS plataformas automáticamente
  - [x] Serverless (Cloud Functions)


### 📅 Planificado
- [ ] Compartir objetivos con otros usuarios
- [ ] Temas personalizables (claro/oscuro)
- [ ] Exportar objetivos a PDF
- [ ] Modo offline con sincronización diferida mejorada
- [ ] Conversión iconos SVG → PNG para PWA

## 🐛 Problemas Conocidos

### PWA
- Streak calculation en StatsScreen retorna 0 (pendiente implementación)
- Service Worker puede requerir recarga manual en algunos navegadores

### App Nativa
- Build iOS bloqueado hasta aceptar términos en Apple Developer account

## 📚 Documentación Adicional


## 📝 Licencia

MIT License - Código abierto y libre para uso personal o comercial.

## 👨‍💻 Desarrollador

**Alberto** - [GitHub: albertopt-dev](https://github.com/albertopt-dev/ObjetivosApp)

Creado con ❤️ usando:
- 📱 React Native + Expo (App Nativa)
- 🌐 React + Vite (PWA)
- ☁️ Firebase (Backend compartido)

---

**Versión actual**: 1.0.0  
**Última actualización**: Marzo 2026  
**Plataformas**: iOS, Android, Web (PWA) Documentación PWA
│       ├── INSTALL.md             # Guía instalación
│       └── STATUS.md              # Estado del desarrollo
│
├── .gitignore
└── README.md                      # Este archivo
```


#### Instalación en iPhone (PWA)
1. Abrir la PWA en Safari
2. Tocar el botón "Compartir" (cuadrado con flecha)
3. Seleccionar "Añadir a pantalla de inicio"
4. La app se instala como nativa (sin App Store)

## 🐛 Solución de Problemas

### La app no se sincroniza
- Verifica tu configuración de Firebase
- Comprueba las reglas de Firestore
- Revisa la consola de Firebase para errores

### Sub-objetivos no se guardan
- Verifica el formato de fecha: DD/MM/YYYY (ej: 15/03/2026)
- Asegúrate de pulsar el botón ➕ después de escribir

### Calendario no muestra marcadores
- Comprueba que tienes objetivos creados para esas fechas
- Verifica que los objetivos tienen el campo `date` correcto

