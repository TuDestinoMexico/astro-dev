import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

export class FirebaseAuthError extends Error {
    constructor(
        message: string,
        public readonly status = 401
    ) {
        super(message);
        this.name = 'FirebaseAuthError';
    }
}

function getFirebaseAdminApp(): App {
    const existingApp = getApps()[0];
    if (existingApp) return existingApp;

    const projectId = import.meta.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = import.meta.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = import.meta.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Faltan las credenciales privadas de Firebase Admin SDK');
    }

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
    });
}

const adminAuth = getAuth(getFirebaseAdminApp());
export const adminDb = getFirestore(getFirebaseAdminApp());
export { FieldValue };

interface RequireFirebaseUserOptions {
    requireVerifiedEmail?: boolean;
}

/** Verifies the Firebase ID token sent by a server-side API request. */
export async function requireFirebaseUser(
    request: Request,
    options: RequireFirebaseUserOptions = {}
): Promise<DecodedIdToken> {
    const authorization = request.headers.get('authorization');
    const tokenMatch = authorization?.match(/^Bearer\s+(.+)$/i);
    const idToken = tokenMatch?.[1]?.trim();

    if (!idToken) {
        throw new FirebaseAuthError('Se requiere autenticación');
    }

    let decodedToken: DecodedIdToken;

    try {
        decodedToken = await adminAuth.verifyIdToken(idToken, true);
    } catch (error) {
        console.warn('[Firebase Admin] Token inválido o revocado:', error);
        throw new FirebaseAuthError('La sesión no es válida');
    }

    if (options.requireVerifiedEmail && decodedToken.email_verified !== true) {
        throw new FirebaseAuthError('El correo debe estar verificado', 403);
    }

    return decodedToken;
}
