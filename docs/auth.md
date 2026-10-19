# Authentication

> Sistema de autenticación del proyecto tdmx-astro.

## Resumen

Firebase Authentication con proveedores Google y Facebook para clientes, y email/contraseña para administradores. Todo el flujo de autenticación ocurre del lado del cliente (client-side). No hay validación server-side de sesiones ni middleware de autenticación.

---

## Proveedor

- **Firebase Auth** — Google y Facebook (clientes) y Email/Password (administradores)
- SDK: `firebase/auth`
- Singleton en `src/lib/firebase.js`
- Facebook solicita únicamente el permiso `email`; el App ID y App Secret se configuran en Firebase Console, y la URL de callback que indica Firebase se registra en Meta. Estas credenciales no se guardan en el código ni en variables del frontend.
- Los dominios de producción y de Preview usados para autenticar deben estar autorizados en Firebase Authentication.
- Mantener habilitada en Firebase la opción de una cuenta por dirección de correo: cuando Facebook entra con el correo de una cuenta Google, se solicita iniciar sesión con Google y se vincula la credencial de Facebook al mismo UID.

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
2. Se monta `GoogleLoginButton.tsx` o `ClientLoginButton.jsx` con `client:only="react"`; ambos presentan Google y Facebook.
3. El usuario inicia sesión mediante `signInWithPopup`. Facebook solicita el permiso `email`.
4. Si el correo de Facebook ya pertenece a una cuenta Google, el usuario inicia sesión con Google y el proveedor Facebook se vincula a esa misma cuenta Firebase, conservando UID y datos asociados.
5. Si Facebook no comparte un correo, se muestra una indicación para intentar con otra cuenta o Google.
6. Éxito → acceso al destino seguro solicitado o a `/cliente/dashboard`.
7. `ClientPanel.jsx` verifica el usuario con `onAuthStateChanged`; si no existe sesión, redirige a `/cliente/login`.

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
- `src/lib/firebaseAdmin.ts` verifica server-side los ID tokens usados por endpoints protegidos, incluido `openpay-cargo`.
- Los formularios Openpay obtienen el ID token desde la sesión Firebase vigente; el servidor continúa siendo la autoridad para validar identidad y email.

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

### Variables privadas server-side

| Variable | Propósito |
|---|---|
| `FIREBASE_ADMIN_PROJECT_ID` | Project ID usado por Firebase Admin SDK |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Email de la cuenta de servicio server-side |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Llave privada de la cuenta de servicio; nunca se expone al cliente |

---

## Archivos clave

| Archivo | Rol |
|---|---|
| `src/lib/firebase.js` | Inicialización Firebase (auth, db, storage) |
| `src/lib/firebaseAdmin.ts` | Inicialización Firebase Admin y verificación de ID tokens server-side |
| `src/pages/admin/login.astro` | Página login |
| `src/pages/admin/dashboard.astro` | Página dashboard |
| `src/components/ui/admin/LoginForm.jsx` | Formulario login |
| `src/components/ui/client/GoogleLoginButton.tsx` | Botones de login Google y Facebook de clientes |
| `src/components/ui/ClientLoginButton.jsx` | Botón de Área de Clientes y diálogo de login Google/Facebook |
| `src/lib/clientAuth.js` | Login Facebook, vinculación a la cuenta Google existente y mensajes de error amigables |
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
