# 🎯 GUÍA RÁPIDA DE INSTALACIÓN - PWA

## 1️⃣ Instalar dependencias

```powershell
cd web
npm install
```

## 2️⃣ Ejecutar en desarrollo

```powershell
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## 3️⃣ Generar íconos de la app (IMPORTANTE)

Necesitas crear dos archivos de imagen:
- `web/public/icon-192.png` (192x192 pixels)
- `web/public/icon-512.png` (512x512 pixels)

**Opción rápida**: Usa un emoji grande 🎯 o un diseño simple con tu color favorito.

**Herramienta recomendada**: https://realfavicongenerator.net/

## 4️⃣ Build para producción

```powershell
npm run build
```

Esto genera la carpeta `web/dist/` con todos los archivos listos.

## 5️⃣ Dónde desplegar (elige una):

### A) Firebase Hosting (GRATIS, RECOMENDADO)

```powershell
# Instalar Firebase CLI (solo una vez)
npm install -g firebase-tools

# Login
firebase login

# Desde la carpeta WEB
cd web

# Inicializar
firebase init hosting
# Selecciona:
# - Public directory: dist
# - Single-page app: Yes  
# - Automatic builds: No

# Deploy
npm run build
firebase deploy --only hosting
```

Te dará una URL como: `https://tu-proyecto.web.app`

### B) Vercel (GRATIS, MUY FÁCIL)

```powershell
# Instalar Vercel CLI (solo una vez)
npm install -g vercel

# Desde la carpeta WEB
cd web

# Deploy
npm run build
vercel --prod
```

Te dará una URL como: `https://tu-app.vercel.app`

### C) Netlify (GRATIS, ARRASTRAR Y SOLTAR)

1. Ve a https://app.netlify.com/drop
2. Arrastra la carpeta `web/dist/` a la página
3. ¡Listo! Te da una URL instantáneamente

## 6️⃣ Instalar en iPhone

1. Abre Safari en tu iPhone
2. Ve a la URL de tu app (ej: `https://tu-proyecto.web.app`)
3. Toca el botón de compartir (cuadrado con flecha hacia arriba)
4. Toca "Añadir a pantalla de inicio"
5. Dale un nombre (ej: "ObjetivosApp")
6. Toca "Añadir"

**¡Ya está!** La app aparecerá en tu pantalla de inicio como una app nativa.

## 🔥 Verificar que funciona como PWA

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Application"
3. En el menú izquierdo, mira:
   - Manifest: Debe mostrar tu configuración
   - Service Workers: Debe estar registrado y activo

## ⚠️ Problemas comunes

**"No se puede instalar"**
- Asegúrate de estar usando Safari en iPhone (no Chrome)
- Verifica que la URL sea HTTPS (no HTTP)
- Limpia el caché y recarga

**"Los datos no guardan"**
- Verifica tu conexión a internet
- Revisa que Firebase esté configurado correctamente
- Mira la consola del navegador para errores

**"Build falla"**
```powershell
# Limpia e intenta de nuevo
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

## 📱 Próximos pasos

1. Personalizar los íconos (`icon-192.png`, `icon-512.png`)
2. Cambiar el nombre en `manifest.json` si quieres
3. Agregar tu propio logo en WelcomeScreen
4. Configurar notificaciones push (opcional)

---

**¿Todo listo?** Tu app web funcionará exactamente igual que la app nativa, compartiendo la misma base de datos Firebase. Los usuarios podrán usar ambas versiones indistintamente.
