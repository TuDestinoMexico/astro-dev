# Authentication

> Sistema de autenticación del proyecto tdmx-astro.

## Resumen

Firebase Authentication con dos flujos: Google para clientes y email/contraseña para administradores. Todo el flujo de autenticación ocurre del lado del cliente (client-side). No hay validación server-side de sesiones ni middleware de autenticación.

---

## Proveedor

- **Firebase Auth** — Google (clientes) y Email/Password (administradores)
- SDK: `firebase/auth`
- Singleton en `src/lib/firebase.js`

---

## Flujo de login

1. Usuario visita `/admin/login.astro`
2. Se renderiza `LoginForm.jsx` con `client:only="react"`
3. `LoginForm` verifica sesión existente via `onAuthStateChanged`:
   - Si hay sesión activa → redirige a `/admin/dashboard`
   - Si no → muestra formulario
4. Usuario ingresa email + password
5. `signInWithEmailAndPassword(auth, email, password)`
6. Éxito → `window.location.href = '/admin/dashboard'`
7. Error → muestra mensaje "Credenciales incorrectas"

### Login de clientes

1. Usuario visita `/cliente/login.astro`.
2. Se monta `GoogleLoginButton.tsx` o `ClientLoginButton.jsx` con `client:only="react"`.
3. Usuario inicia sesión con Google mediante `signInWithPopup`.
4. Éxito → acceso a `/cliente/dashboard`.
5. `ClientPanel.jsx` verifica el usuario con `onAuthStateChanged`; si no existe sesión, redirige a `/cliente/login`.

---

## Protección de rutas admin

- **Mecanismo visual:** `onAuthStateChanged` + custom claim `admin` en `DashboardLayout.jsx` y `LoginForm.jsx`
- **Comportamiento:**
  - `loading=true` → spinner "Cargando Panel..."
  - `user=null` → `window.location.href = '/admin/login'`
  - `user` sin `claims.admin === true` → se rechaza el panel y se redirige a `/admin/login` sin cerrar la sesión Firebase
  - `user` con `claims.admin === true` → renderiza contenido
- **Middleware:** No bloquea rutas `/admin`. Todo el tráfico admin pasa sin verificación server-side.
- **Seguridad efectiva:** las reglas de Firestore y Storage validan el mismo custom claim.
- Este guard visual no sustituye las reglas de Firebase: las operaciones directas contra Firebase deben ser rechazadas por las reglas.

---

## Logout

- Botón "Cerrar Sesión" en `Sidebar.jsx`
- `signOut(auth)` → `window.location.href = '/admin/login'`

---

## Variables de entorno requeridas

| Variable | Propósito |
|---|---|
| `PUBLIC_FIREBASE_API_KEY` | API Key Firebase |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain (ej: tdmx.firebaseapp.com) |
| `PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `PUBLIC_FIREBASE_APP_ID` | App ID |

---

## Archivos clave

| Archivo | Rol |
|---|---|
| `src/lib/firebase.js` | Inicialización Firebase (auth, db, storage) |
| `src/pages/admin/login.astro` | Página login |
| `src/pages/admin/dashboard.astro` | Página dashboard |
| `src/components/ui/admin/LoginForm.jsx` | Formulario login |
| `src/components/ui/client/GoogleLoginButton.tsx` | Login Google de clientes |
| `src/components/ui/ClientLoginButton.jsx` | Botón/login Google del sitio público |
| `src/components/ui/admin/DashboardLayout.jsx` | Guard de ruta admin |
| `src/middleware.js` | Solo maintenance mode (no auth) |

---

## Roles administrativos

- El rol se asigna mediante Firebase Admin SDK con el custom claim `{ "admin": true }`.
- La asignación se hace por UID, desde un entorno administrativo seguro; nunca desde el navegador.
- Después de asignar o revocar el claim, el usuario debe cerrar sesión y volver a iniciar sesión para renovar el ID token.
- Una cuenta cliente sin el claim puede conservar su sesión para el portal cliente; cerrar esa sesión desde el login admin es una acción explícita.
- El procedimiento operativo se mantiene fuera del cliente y no requiere guardar credenciales de servicio en el repositorio.

## Pendiente de documentar

- Registro de usuarios (no implementado)
- Recuperación de contraseña (no implementada)
- Tiempo de expiración de sesión Firebase
