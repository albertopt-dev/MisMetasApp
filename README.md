# 🎯 MisMetas - Aplicación de Gestión de Objetivos

Una aplicación **multiplataforma** moderna con diseño futurista oscuro y neón para gestionar tus objetivos diarios, semanales, mensuales y anuales. Totalmente en español con sistema de sub-objetivos para un seguimiento detallado de tus metas.

## 🌐 Plataformas Disponibles

- **📱 App Nativa**: React Native (iOS/Android) - Listo para App Store y Play Store
- **🌐 PWA**: Aplicación web progresiva instalable - Funcional en cualquier navegador
- **☁️ Base de datos compartida**: Mismo Firebase Firestore para todas las plataformas

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

### ☁️ Sincronización en la Nube
- Backend completo con **Firebase Firestore**
### 📱 App Nativa (React Native)
- **React Native** + **Expo SDK 54.0.33**
- **TypeScript 5.3.0** - Tipado estático completo
- **Firebase 10.14.1** (Authentication + Firestore)
- **React Navigation** - Navegación entre pantallas
- **React Native Paper** - Componentes Material Design
- **React Native Calendars 1.1306.0** - Calendario con localización española
- **date-fns 3.6.0** - Manipulación de fechas en español
- **Expo Linear Gradient** - Efectos visuales
- **AsyncStorage 2.2.0** - Almacenamiento local

### 🌐 PWA (Aplicación Web)
- **Vite 5.0** + **React 18.2** - Build rápido y modern
- **TypeScript 5.3.0** - Tipado estático completo
- **Material-UI 5.15** - Componentes web modernos
- **Framer Motion 11.0** - Animaciones fluidas en web
- **React Calendar 5.0** - Calendario web interactivo
- **Firebase 10.14.1** - Mismo backend que la app nativa
- **React Router 6.22** - Navegación web
- **Vite PWA Plugin** - Service Worker y manifest automáticoore)
- **React Navigation** - Navegación entre pantallas
- **React Native Paper** - Componentes Material Design
- **React Native Calendars 1.1306.0** - Calendario con localización española
- **date-fns 3.6.0** - Manipulación de fechas en español
- **Expo Linear Gradient** - Efectos visuales
- **AsyncStorage 2.2.0** - Almacenamiento local


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

## 🎨 Personalización de Colores

Colores disponibles para objetivos:
│
├── 📱 REACT NATIVE (App Nativa iOS/Android)
│   ├── assets/               # Iconos e imágenes nativas
│   ├── src/
│   │   ├── components/       # Componentes React Native
│   │   │   └── GoalCard.tsx
│   │   ├── config/
│   │   │   └── firebaseConfig.ts
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── AddGoalScreen.tsx
│   │   │   ├── EditGoalScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── WelcomeScreen.tsx
│   │   │   └── StatsScreen.tsx
│   │   ├── services/
│   │   │   ├── goalService.ts
│   │   │   └── authService.ts
│   │   ├── theme/
│   │   │   └── colors.ts
│   │   └── types/
│   │       └── index.ts
│   ├── App.tsx
│   ├── app.json              # Configuración Expo
│   ├── eas.json              # Build para App/Play Store
│   ├── metro.config.js       # ⚠️ CRÍTICO - No eliminar
│   └── package.json          # Dependencias nativas
│
├── 🌐 PWA (Aplicación Web)
│   └── web/
│       ├── public/
│       │   ├── manifest.json      # PWA manifest
│       │   ├── icon-192.svg       # Icono PWA pequeño
│       │   └── icon-512.svg       # Icono PWA grande
│       ├── src/
│       │   ├── components/
│       │   │   └── GoalCard.tsx   # Versión web
│       │   ├── contexts/
│       │   │   └── AuthContext.tsx
│  🎯 Diferencias entre versiones

| Característica | App Nativa | PWA |
|----------------|------------|-----|
| **Plataforma** | iOS/Android | Cualquier navegador |
| **Instalación** | App Store/Play Store | Directo desde navegador |
| **Tamaño** | ~40-60 MB | ~2-3 MB |
| **Rendimiento** | Nativo (100%) | Web (95%) |
| **Animaciones** | React Native Animated | Framer Motion |
| **Componentes UI** | React Native Paper | Material-UI |
| **Calendario** | react-native-calendars | react-calendar |
| **Offline** | AsyncStorage | Service Worker |
| **Notificaciones** | Nativas | Web Push API |
| **Base de datos** |  Firebase (compartido) |  Firebase (compartido) |

## 🔄 Futuras Mejoras

- [x] **PWA instalable** 
- [ ] Estadísticas detalladas de progreso (en desarrollo - StatsScreen)
- [ ] Implementar cálculo de racha (streak) en getUserStats
- [ ] Notificaciones push para recordatorios
- [ ] Compartir objetivos con otros usuarios
- [ ] Temas personalizables (claro/oscuro)
- [ ] Exportar objetivos a PDF
- [ ] Modo offline con sincronización diferida mejorada
- [ ] Conversión iconos SVG → PNG para PWA

## 🐛 Problemas Conocidos

### PWA
- Iconos usando SVG temporalmente (funciona pero PNG es mejor para iOS)
- Streak calculation en StatsScreen retorna 0 (pendiente implementación)
- Service Worker puede requerir recarga manual en algunos navegadores

### App Nativa
- Build iOS bloqueado hasta aceptar términos en Apple Developer account

## 📝 Licencia

MIT License - Código abierto y libre para uso personal o comercial.

## 👨‍💻 Desarrollador

**Alberto** - [GitHub: albertopt-dev](https://github.com/albertopt-dev/MisMetasApp)

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
4. La app se instala como nativa (sin App Store) │   ├── LoginScreen.tsx      # Autenticación
│   │   └── StatsScreen.tsx      # Estadísticas
│   ├── services/
│   │   └── goalService.ts       # Lógica Firestore
│   ├── theme/
│   │   └── colors.ts            # Tema oscuro futurista
│   └── types/
│       └── index.ts             # Tipos TypeScript
├── metro.config.js       # ⚠️ CRÍTICO - No eliminar
├── package.json
└── README.md
```

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


## 📝 Licencia

MIT

## 👨‍💻 Desarrollador

Creado con ❤️ usando React Native + Firebase

---

**Versión actual**: 1.0.0  
**Última actualización**: Marzo 2026
