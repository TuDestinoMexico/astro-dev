import { useEffect, useId, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

export default function OfficialAnnouncementModal() {
    const [announcement, setAnnouncement] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const titleId = useId();

    useEffect(() => {
        let isMounted = true;

        async function loadAnnouncement() {
            try {
                const snapshot = await getDoc(doc(db, 'config', 'comunicado'));
                if (!isMounted || !snapshot.exists()) return;

                const data = snapshot.data();
                if (!data.activo || !data.titulo) return;

                setAnnouncement(data);
                setIsOpen(true);
            } catch (error) {
                console.warn('[OfficialAnnouncementModal] No se pudo cargar el comunicado:', error);
            }
        }

        loadAnnouncement();
        return () => {
            isMounted = false;
        };
    }, []);

    function close() {
        setIsOpen(false);
    }

    const { dialogRef } = useAccessibleDialog({ open: isOpen, onClose: close });

    if (!isOpen || !announcement) return null;

    return (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4 sm:p-6">
            <button
                type="button"
                aria-label="Cerrar comunicado"
                onClick={close}
                className="absolute inset-0 cursor-default bg-slate-950/70 backdrop-blur-sm"
            />

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl outline-none"
            >
                <button
                    type="button"
                    onClick={close}
                    aria-label="Cerrar comunicado"
                    className="absolute right-3 top-3 z-10 rounded-full bg-slate-950/70 p-2 text-white transition hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-white"
                >
                    <X size={18} aria-hidden="true" />
                </button>

                {announcement.imagenUrl && (
                    <img
                        src={announcement.imagenUrl}
                        alt=""
                        className="h-auto max-h-[62dvh] w-full object-contain object-top"
                        loading="eager"
                        decoding="async"
                    />
                )}

                <div className="space-y-4 p-6 sm:p-8">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Comunicado oficial</p>
                    <h2 id={titleId} className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                        {announcement.titulo}
                    </h2>
                    <button
                        type="button"
                        onClick={close}
                        className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
