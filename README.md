# 🎫 Sistema de Tickets CDA - Guía de Instalación

## 📦 Lo que incluye este proyecto

✅ Sistema completo de tickets para Cremería del Ahorro  
✅ Extracción automática de datos de tickets con IA  
✅ Firebase para guardar todos los registros  
✅ WhatsApp para notificaciones  
✅ Reportes y gráficas en tiempo real  
✅ Listo para desplegar en Vercel GRATIS  

---

## 🎯 PASO 1: Obtener tu API Key de Anthropic

### 1.1 - Ir a Anthropic Console
1. Abre tu navegador
2. Ve a: **https://console.anthropic.com/**
3. Crea una cuenta o inicia sesión

### 1.2 - Crear API Key
1. En el menú lateral, haz clic en **"API Keys"**
2. Haz clic en **"Create Key"**
3. Ponle un nombre: "Sistema Tickets CDA"
4. Haz clic en **"Create Key"**
5. **COPIA LA KEY** (se ve así: `sk-ant-api03-...`)
6. **GUÁRDALA EN UN LUGAR SEGURO** (la necesitarás después)

💡 **Costo:** Anthropic cobra ~$3 USD por cada 1000 extracciones

---

## 🎯 PASO 2: Configurar Firebase

### 2.1 - Obtener tus credenciales de Firebase
1. Ve a: **https://console.firebase.google.com/**
2. Selecciona tu proyecto **"system-corps"**
3. Haz clic en el ⚙️ (Configuración) → **"Configuración del proyecto"**
4. Baja hasta **"Tus aplicaciones"**
5. Si no hay ninguna app web, haz clic en **"</>"** (Web)
6. Ponle nombre: "Sistema Tickets CDA"
7. Haz clic en **"Registrar app"**

### 2.2 - Copiar las credenciales
Verás un código que se ve así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "system-corps.firebaseapp.com",
  databaseURL: "https://system-corps-default-rtdb.firebaseio.com",
  projectId: "system-corps",
  storageBucket: "system-corps.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**COPIA TODOS ESTOS VALORES** (los necesitarás en el siguiente paso)

### 2.3 - Editar el archivo de configuración
1. En la carpeta del proyecto, abre: **src/firebaseConfig.js**
2. Reemplaza los valores con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",  // ← Pega aquí tu apiKey
  authDomain: "system-corps.firebaseapp.com",  // ← Ya está correcto
  databaseURL: "https://system-corps-default-rtdb.firebaseio.com",  // ← Ya está correcto
  projectId: "system-corps",  // ← Ya está correcto
  storageBucket: "system-corps.appspot.com",  // ← Ya está correcto
  messagingSenderId: "TU_MESSAGING_SENDER_ID",  // ← Pega aquí tu messagingSenderId
  appId: "TU_APP_ID"  // ← Pega aquí tu appId
};
```

3. **GUARDA EL ARCHIVO** (Ctrl+S o Cmd+S)

---

## 🎯 PASO 3: Subir el proyecto a GitHub

### 3.1 - Crear un nuevo repositorio
1. Ve a: **https://github.com/**
2. Haz clic en **"New"** (botón verde arriba a la derecha)
3. Ponle nombre: **"sistema-tickets-cda"**
4. Déjalo **Público** o **Privado** (como prefieras)
5. **NO marques** "Add a README file"
6. Haz clic en **"Create repository"**

### 3.2 - Subir los archivos
Hay 2 formas (elige la más fácil para ti):

#### Opción A: Desde la web (MÁS FÁCIL)
1. En la página del repositorio que acabas de crear
2. Haz clic en **"uploading an existing file"**
3. Arrastra **TODA la carpeta** del proyecto
4. Haz clic en **"Commit changes"**

#### Opción B: Desde la terminal (si sabes usar Git)
```bash
cd ruta/a/sistema-tickets-cda
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sistema-tickets-cda.git
git push -u origin main
```

---

## 🎯 PASO 4: Desplegar en Vercel

### 4.1 - Importar proyecto desde GitHub
1. Ve a: **https://vercel.com/**
2. Inicia sesión con tu cuenta
3. Haz clic en **"Add New..."** → **"Project"**
4. Busca tu repositorio **"sistema-tickets-cda"**
5. Haz clic en **"Import"**

### 4.2 - Configurar el proyecto
1. **Framework Preset:** Ya debe detectar "Vite" automáticamente
2. **Root Directory:** Deja el punto (.)
3. **Build Command:** Ya debe estar `npm run build`
4. **Output Directory:** Ya debe estar `dist`

### 4.3 - Agregar la API Key de Anthropic
🚨 **ESTE PASO ES CRÍTICO** 🚨

1. Antes de hacer clic en "Deploy", baja hasta **"Environment Variables"**
2. Haz clic en **"Add Environment Variable"**
3. En **"Key"** escribe: `ANTHROPIC_API_KEY`
4. En **"Value"** pega tu API Key de Anthropic (la del PASO 1)
5. En **"Environment"** deja marcado: **Production, Preview, Development**

### 4.4 - Deploy
1. Haz clic en **"Deploy"**
2. ¡Espera 2-3 minutos! ☕
3. Verás **"Congratulations!"** cuando termine
4. Haz clic en **"Continue to Dashboard"**
5. Copia la URL de tu proyecto (se ve así: `sistema-tickets-cda.vercel.app`)

---

## 🎉 ¡LISTO! Tu sistema ya está en línea

Tu sistema ahora está funcionando en:
**https://tu-proyecto.vercel.app**

### 👥 Usuarios predefinidos:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | zxc | Administrador |
| cancelaciones | 2026 | Cancelaciones |
| valle | 2024 | Tienda Valle |
| popular | 2025 | Tienda Popular |
| sanagustin | 2026 | Tienda San Agustín |
| progreso1 | 2027 | Tienda Progreso 1 |
| ... | ... | ... |

---

## 🔄 Actualizar el sistema

Si quieres hacer cambios:

1. Edita los archivos en tu computadora
2. Súbelos a GitHub (arrastra y suelta, o usa Git)
3. **Vercel los detectará automáticamente**
4. En 2-3 minutos, tu sitio se actualizará solo ✨

---

## ❓ Solución de Problemas

### "La extracción de tickets no funciona"
- Verifica que agregaste la **ANTHROPIC_API_KEY** en Vercel
- Verifica que la key empiece con `sk-ant-api03-`
- Verifica que tu cuenta de Anthropic tenga créditos

### "No se guardan los tickets"
- Verifica que editaste **src/firebaseConfig.js** con tus credenciales
- Verifica que tu Firebase Realtime Database esté activo
- Ve a Firebase Console → Realtime Database → Reglas
- Las reglas deben permitir lectura/escritura:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### "Error al hacer deploy"
- Verifica que todos los archivos estén en GitHub
- Verifica que **package.json** esté en la raíz del proyecto
- En Vercel, ve a Settings → General → Framework → Selecciona "Vite"

---

## 📞 Soporte

Si algo no funciona, revisa estos archivos:

1. **src/firebaseConfig.js** - Credenciales de Firebase
2. **Vercel Dashboard** → Tu proyecto → Settings → Environment Variables
3. **Firebase Console** → Realtime Database → Reglas

---

## 🎊 Características del Sistema

✅ **Login por rol:** Admin, Cancelaciones, Tiendas  
✅ **Extracción automática de datos** de tickets con IA  
✅ **WhatsApp:** Envío automático de notificaciones  
✅ **Firebase:** Todos los datos se sincronizan en tiempo real  
✅ **Reportes:** Gráficas y estadísticas completas  
✅ **100% Responsivo:** Funciona en celular, tablet y PC  
✅ **PWA Ready:** Se puede instalar como app  

---

🚀 **¡Disfruta tu sistema!**


