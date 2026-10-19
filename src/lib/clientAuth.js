import {
    FacebookAuthProvider,
    GoogleAuthProvider,
    linkWithCredential,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import { auth } from './firebase';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const hasGoogleProvider = (user) => user?.providerData?.some(
    (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
);

const createAuthError = (code) => Object.assign(new Error(code), { code });

export async function signInWithFacebook() {
    const facebookProvider = new FacebookAuthProvider();
    facebookProvider.addScope('email');

    let result;
    try {
        result = await signInWithPopup(auth, facebookProvider);
    } catch (error) {
        if (error?.code !== 'auth/account-exists-with-different-credential') throw error;

        const pendingCredential = FacebookAuthProvider.credentialFromError(error);
        const email = error.customData?.email;
        if (!pendingCredential || !email) throw error;

        let googleUser = auth.currentUser;
        if (googleUser) {
            if (!hasGoogleProvider(googleUser) || normalizeEmail(googleUser.email) !== normalizeEmail(email)) {
                throw createAuthError('auth/account-link-email-mismatch');
            }
        } else {
            const googleResult = await signInWithPopup(auth, new GoogleAuthProvider());
            googleUser = googleResult.user;

            if (!hasGoogleProvider(googleUser) || normalizeEmail(googleUser.email) !== normalizeEmail(email)) {
                await signOut(auth);
                throw createAuthError('auth/account-link-email-mismatch');
            }
        }

        result = await linkWithCredential(googleUser, pendingCredential);
    }

    if (!result.user.email) {
        await signOut(auth);
        throw createAuthError('auth/facebook-email-unavailable');
    }

    return result;
}

export function getClientLoginErrorMessage(error) {
    switch (error?.code) {
        case 'auth/popup-closed-by-user':
            return '';
        case 'auth/account-link-email-mismatch':
            return 'Para conservar tus reservas, inicia sesión con Google usando el mismo correo de tu cuenta de Facebook.';
        case 'auth/facebook-email-unavailable':
            return 'Facebook no compartió un correo con nosotros. Prueba con otra cuenta o inicia sesión con Google.';
        case 'auth/credential-already-in-use':
            return 'Esta cuenta de Facebook ya está vinculada a otro perfil. Inicia sesión con esa cuenta o contáctanos para recibir ayuda.';
        case 'auth/popup-blocked':
            return 'Tu navegador bloqueó la ventana de acceso. Permite las ventanas emergentes e inténtalo de nuevo.';
        case 'auth/unauthorized-domain':
            return 'Este sitio todavía no está habilitado para iniciar sesión. Inténtalo desde el sitio principal.';
        case 'auth/operation-not-allowed':
            return 'Este método de inicio de sesión aún no está disponible. Intenta con Google.';
        default:
            return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
    }
}
