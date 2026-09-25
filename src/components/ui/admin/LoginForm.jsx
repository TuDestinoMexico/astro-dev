import React, { useState, useEffect } from 'react';
import { auth } from '../../../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [hasNonAdminSession, setHasNonAdminSession] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true); // Nuevo estado para verificar sesión

    // NUEVO: Verificar si ya hay una sesión activa al cargar
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setHasNonAdminSession(false);
                setIsChecking(false);
                return;
            }

            try {
                const tokenResult = await user.getIdTokenResult(true);

                if (tokenResult.claims.admin === true) {
                    window.location.href = '/admin/dashboard';
                    return;
                }

                setHasNonAdminSession(true);
            } catch (err) {
                console.error('No se pudo validar el rol administrativo:', err);
                setError('No se pudo validar el acceso administrativo.');
            } finally {
                setIsChecking(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = '/admin/dashboard';
        } catch (err) {
            console.error(err);
            setError('Credenciales incorrectas. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Si estamos verificando la sesión, mostramos un pequeño spinner para evitar parpadeos
    if (isChecking) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Iniciar Sesión</h2>

            {hasNonAdminSession && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-xs font-bold space-y-3">
                    <p>La cuenta actual no tiene permisos administrativos. Puedes iniciar sesión con otra cuenta sin cerrar esta sesión de cliente.</p>
                    <button
                        type="button"
                        onClick={() => signOut(auth)}
                        className="text-amber-900 underline hover:no-underline"
                    >
                        Cerrar sesión actual
                    </button>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="tu@correo.com"
                    />
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Contraseña</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn size={16} />}
                    Entrar al panel
                </button>
            </form>
        </div>
    );
}
