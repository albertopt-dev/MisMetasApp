# 🎯 Mis Metas - PWA (Progressive Web App)

Versión web de la aplicación de gestión de objetivos, completamente instalable en cualquier dispositivo.

## 🚀 Quick Start

### Instalación de Dependencias

```bash
cd web
npm install
```

### Desarrollo Local

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`

### Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en `web/dist/`

## 📱 Instalar en iPhone

### Opción 1: Desde el navegador (Safari)

1. Abre Safari en tu iPhone
2. Ve a la URL donde está desplegada la app (por ejemplo: `https://tu-app.web.app`)
3. Toca el botón de compartir (icono de cuadrado con flecha hacia arriba)
4. Desplázate hacia abajo y toca "Añadir a pantalla de inicio"
5. Cambia el nombre si quieres y toca "Añadir"
6. ¡Listo! La app aparecerá en tu pantalla de inicio como una app nativa

### Opción 2: Desplegar en Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login en Firebase
firebase login

# Inicializar proyecto
firebase init hosting

# Seleccionar:
# - Public directory: dist
# - Configure as single-page app: Yes
# - Set up automatic builds: No

# Build y deploy
npm run build
firebase deploy
```

Recibirás una URL como `https://tu-proyecto.web.app` que podrás abrir en cualquier dispositivo.

## 🌐 Desplegar en Vercel (Alternativa)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
npm run build
vercel --prod
```

## 🌟 Características PWA

✅ **Instalable**: Se puede añadir a la pantalla de inicio del iPhone
✅ **Offline**: Funciona sin conexión gracias al Service Worker  
✅ **Rápida**: Carga instantánea con caché optimizado
✅ **Actualizaciones automáticas**: Se actualiza sola
✅ **Push Notifications**: (Próximamente)
✅ **Comparte la misma base de datos**: Sincroniza con la app nativa vía Firebase

## 🔧 Tecnologías Utilizadas

- **React 18**: Framework UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool ultra-rápido
- **Material-UI**: Componentes UI
- **Framer Motion**: Animaciones
- **React Calendar**: Calendario interactivo
- **Firebase**: Auth + Firestore
- **PWA**: Service Worker + Manifest

## 📂 Estructura del Proyecto

```
web/
├── public/
│   ├── manifest.json        # Configuración PWA
│   ├── icon-192.png         # Icono app
│   └── icon-512.png         # Icono app (grande)
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── contexts/            # React Contexts (Auth)
│   ├── screens/             # Pantallas de la app
│   ├── services/            # Servicios Firebase
│   ├── theme/               # Colores y estilos
│   ├── types/               # Tipos TypeScript
│   ├── App.tsx             # App principal + routing
│   ├── index.tsx           # Entry point
│   └── index.css           # Estilos globales
├── package.json
├── tsconfig.json
└── vite.config.ts          # Configuración Vite + PWA
```

## 🎨 Temas y Estilos

La aplicación mantiene el mismo diseño oscuro futurista que la app nativa:
- Colores neón (Cyan, Magenta, Amarillo)
- Animaciones suaves
- Sombras con efecto glow
- Gradientes

## 🔐 Autenticación

Comparte el sistema de autenticación con la app nativa:
- Mismo email y contraseña
- Datos sincronizados en tiempo real
- Sesión persistente

## 📝 Notas Importantes

1. **HTTPS requerido**: Para instalar como PWA, la app debe estar en HTTPS
2. **Icons**: Necesitarás crear `icon-192.png` e `icon-512.png` en la carpeta `public/`
3. **Firebase Config**: Ya está configurado con las mismas credenciales que la app nativa
4. **Testing**: Prueba la instalación en iPhone usando Safari (Chrome no soporta "Add to Home Screen" en iOS)

## 🐛 Troubleshooting

### La app no se ofrece para instalar en iPhone
- Asegúrate de estar usando Safari (no Chrome)
- Verifica que la app esté en HTTPS
- Limpia el caché del navegador

### Los datos no se sincronizan
- Verifica la conexión a internet
- Revisa la consola de Firebase
- Asegúrate de que las reglas de Firestore permiten lectura/escritura

### Errores al hacer build
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🚀 Próximas Características

- [ ] Notificaciones push
- [ ] Modo offline completo
- [ ] Exportar objetivos PDF
- [ ] Compartir progreso
- [ ] Temas personalizados

## 📞 Soporte

Si encuentras algún problema, revisa:
1. La consola del navegador (F12)
2. Las reglas de Firebase
3. El estado del Service Worker en DevTools

---

**Desarrollado con ❤️ usando React + Firebase**
