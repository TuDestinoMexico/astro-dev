// src/middleware.js
import { db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";

let cachedMaintenanceMode = false;
let lastCacheTime = 0;
const CACHE_DURATION = 30000;

async function getMaintenanceStatus() {
    const now = Date.now();
    if (now - lastCacheTime < CACHE_DURATION) return cachedMaintenanceMode;

    try {
        const docSnap = await getDoc(doc(db, "config", "general"));
        if (docSnap.exists()) {
            cachedMaintenanceMode = !!docSnap.data().modoMantenimiento;
        }
        lastCacheTime = now;
    } catch (error) {
        return false;
    }
    return cachedMaintenanceMode;
}

export async function onRequest({ url, redirect }, next) {
    const isMaintenance = await getMaintenanceStatus();

    // 1. Excepción: Permitir siempre el panel de administración
    if (url.pathname.startsWith('/admin')) {
        return next();
    }

    // 2. Lógica para la ruta /mantenimiento
    if (url.pathname === '/mantenimiento') {
        // A. Si está desactivado: Redirigir a HOME (en lugar de 404)
        if (!isMaintenance) {
            return redirect('/');
        }
        // B. Si está activado: Permitir ver la página
        return next();
    }

    // 3. Si el mantenimiento está activo y NO estamos en la página de mantenimiento
    if (isMaintenance) {
        return redirect('/mantenimiento');
    }

    // 4. Flujo normal
    return next();
}