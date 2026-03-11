# 🎯 MisMetas - Aplicación de Gestión de Objetivos

Una aplicación moderna con diseño futurista oscuro y neón para gestionar tus objetivos diarios, semanales, mensuales y anuales. Totalmente en español con sistema de sub-objetivos para un seguimiento detallado de tus metas.

## ✨ Características Principales

### 🎨 Diseño y Tema
- **Tema oscuro futurista** con efectos neón (#00f0ff cyan, #ff00ff magenta, #ffea00 amarillo)
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
- Sincronización en tiempo real
- Datos seguros por usuario
- Sin necesidad de índices compuestos (queries optimizadas)

## 🛠️ Tecnologías

- **React Native** + **Expo SDK 54.0.33**
- **TypeScript 5.3.0** - Tipado estático completo
- **Firebase 10.14.1** (Authentication + Firestore)
- **React Navigation** - Navegación entre pantallas
- **React Native Paper** - Componentes Material Design
- **React Native Calendars 1.1306.0** - Calendario con localización española
- **date-fns 3.6.0** - Manipulación de fechas en español
- **Expo Linear Gradient** - Efectos visuales
- **AsyncStorage 2.2.0** - Almacenamiento local

## 📦 Instalación

### Requisitos previos
- Node.js (v16 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase

### Pasos de instalación

1. **Clonar el repositorio:**
```bash
git clone <url-del-repo>
cd proyecto-objetivos
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar Firebase:**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Activa **Authentication** (Email/Password)
   - Activa **Firestore Database**
   - Copia las credenciales de configuración
   - Actualiza `src/config/firebaseConfig.ts` con tus credenciales

4. **Configuración crítica (metro.config.js):**
   El proyecto incluye un archivo `metro.config.js` NECESARIO para que funcione en Expo Go:
   ```javascript
   config.resolver.unstable_enablePackageExports = false;
   ```
   **No eliminar este archivo** - resuelve incompatibilidad Firebase + Metro

5. **Iniciar el proyecto:**
```bash
npx expo start
```

6. **Ejecutar en tu dispositivo:**
   - **Móvil**: Descarga "Expo Go" y escanea el QR
   - **Web**: Presiona `w` en la terminal
   - **Android emulator**: Presiona `a`
   - **iOS simulator**: Presiona `i`

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
- 🔵 Cyan (#00f0ff)
- 🟣 Magenta (#ff00ff)  
- 🟡 Amarillo (#ffea00)
- 🟢 Verde (#00ff88)
- 🔴 Rojo (#ff3366)
- 🟠 Naranja (#ff6b35)

## 🏗️ Estructura del Proyecto

```
proyecto-objetivos/
├── assets/               # Iconos e imágenes
├── src/
│   ├── components/       # Componentes reutilizables
│   │   └── GoalCard.tsx  # Tarjeta de objetivo con sub-objetivos
│   ├── config/
│   │   └── firebaseConfig.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Pantalla principal
│   │   ├── AddGoalScreen.tsx    # Crear objetivo
│   │   ├── EditGoalScreen.tsx   # Editar objetivo
│   │   ├── LoginScreen.tsx      # Autenticación
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

### Error: "Component auth has not been registered yet"
**Solución**: Asegúrate de que existe el archivo `metro.config.js` con:
```javascript
config.resolver.unstable_enablePackageExports = false;
```

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

## 🚀 Compilar para Producción

### Android (APK)
```bash
eas build --platform android
```

### iOS (IPA)
```bash
eas build --platform ios
```

### Web
```bash
npx expo export:web
```

## 🔄 Futuras Mejoras

- [ ] Estadísticas detalladas de progreso
- [ ] Notificaciones push para recordatorios
- [ ] Compartir objetivos con otros usuarios
- [ ] Temas personalizables
- [ ] Exportar objetivos a PDF
- [ ] Modo offline con sincronización diferida

## 📝 Licencia

MIT

## 👨‍💻 Desarrollador

Creado con ❤️ usando React Native + Firebase

---

**Versión actual**: 1.0.0  
**Última actualización**: Marzo 2026
