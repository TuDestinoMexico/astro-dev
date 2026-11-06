import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { BUEN_FIN_COUPON, BUEN_FIN_TOPBAR, getBuenFinPhase } from '../../lib/buenFin';
import type { BuenFinPhase } from '../../lib/buenFin';

interface Props {
    // Número de WhatsApp de la empresa, tomado de la configuración general en Layout.astro.
    whatsappNumber: string;
}

const PROMO_MESSAGE = `Hola Tu Destino México 👋, quiero aprovechar la promoción del Buen Fin en Riviera Maya (desde $15,990) y usar el cupón ${BUEN_FIN_COUPON}.`;

const pad = (value: number) => String(value).padStart(2, '0');

function getRemaining(target: Date, now: number) {
    const total = Math.max(0, Math.floor((target.getTime() - now) / 1000));
    return {
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
    };
}

const units = [
    { key: 'days', label: 'DÍAS' },
    { key: 'hours', label: 'HRS' },
    { key: 'minutes', label: 'MIN' },
    { key: 'seconds', label: 'SEG' },
] as const;

// Barra promocional de la temporada Buen Fin. Solo se monta en el navegador:
// la hora se lee al montar, así que no hay diferencias entre el HTML del servidor y el cliente.
export default function BuenFinTopbar({ whatsappNumber }: Props) {
    const [now, setNow] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setNow(Date.now());
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    if (now === null) return null;

    const phase: BuenFinPhase = getBuenFinPhase(new Date(now));
    if (phase === 'ended') return null;

    const target = phase === 'before' ? BUEN_FIN_TOPBAR.start : BUEN_FIN_TOPBAR.end;
    const label = phase === 'before' ? 'EMPIEZA EN' : 'TERMINA EN';
    const remaining = getRemaining(target, now);

    // El botón de WhatsApp y el cupón solo aparecen en la fase activa, y cuando la promoción está lista.
    const ctaActive = phase === 'active' && BUEN_FIN_TOPBAR.ctaEnabled && Boolean(whatsappNumber);
    const ctaHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(PROMO_MESSAGE)}`;

    const copyCoupon = async () => {
        try {
            await navigator.clipboard.writeText(BUEN_FIN_COUPON);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Sin permiso del portapapeles: el código sigue visible para copiarlo a mano.
        }
    };

    return (
        <section aria-label="Promoción Buen Fin" className="w-full border-b-2 border-[#E30613] bg-[#1E1E1E] text-white">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-3 text-center md:flex-row md:justify-between md:gap-6 md:px-6 md:py-2.5 md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                    <span className="shrink-0 rounded-full bg-[#E30613] px-3 py-1 text-xs font-black uppercase tracking-wide">
                        BUEN FIN :)
                    </span>
                    <p className="text-sm font-bold md:text-base">
                        <span className="hidden md:inline">Hoteles en </span>Riviera Maya desde $15,990
                    </p>
                </div>

                <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row md:gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">{label}</span>
                        <div
                            role="group"
                            aria-label={`${label} ${remaining.days} días, ${remaining.hours} horas, ${remaining.minutes} minutos`}
                            className="flex items-start gap-1.5"
                        >
                            {units.map(({ key, label: unitLabel }, index) => (
                                <div key={key} className="flex items-center gap-1.5">
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-base font-black tabular-nums text-black">
                                            {pad(remaining[key])}
                                        </span>
                                        <span aria-hidden="true" className="text-[9px] font-bold tracking-wide text-white/80">{unitLabel}</span>
                                    </div>
                                    {index < units.length - 1 && (
                                        <span aria-hidden="true" className="mb-4 text-base font-black text-[#E30613]">:</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {ctaActive ? (
                        <a
                            href={ctaHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full max-w-xs items-center justify-center gap-1 rounded-full bg-[#00C2A0] px-5 py-2.5 text-sm font-black text-black md:w-auto md:max-w-none md:shrink-0 transition-colors hover:bg-[#00AD8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1E1E]"
                        >
                            COTIZA AHORA
                            <ArrowUpRight size={16} aria-hidden="true" />
                        </a>
                    ) : (
                        <span
                            aria-disabled="true"
                            className="inline-flex w-full max-w-xs cursor-default items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white/70 md:w-auto md:max-w-none md:shrink-0"
                        >
                            Próximamente
                        </span>
                    )}
                </div>
            </div>

            {ctaActive && (
                <div className="border-t border-dashed border-white/20">
                    <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-2.5 text-center md:flex-row md:justify-center md:gap-4 md:px-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Cupón Buen Fin</span>
                        <div className="flex items-center gap-2 rounded-md border-2 border-dashed border-[#E30613] bg-white px-3 py-1.5">
                            <span className="font-mono text-sm font-black tracking-widest text-black">{BUEN_FIN_COUPON}</span>
                            <button
                                type="button"
                                onClick={copyCoupon}
                                aria-label={copied ? 'Cupón copiado' : `Copiar cupón ${BUEN_FIN_COUPON}`}
                                className="flex h-7 w-7 items-center justify-center rounded text-black transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
                            >
                                {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                            </button>
                        </div>
                        <span className="text-xs text-white/80">Menciónalo al cotizar con tu asesor.</span>
                    </div>
                </div>
            )}
        </section>
    );
}
