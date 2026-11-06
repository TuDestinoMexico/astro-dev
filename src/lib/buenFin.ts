// Temporada Buen Fin 2026 en Cancún (UTC-5 todo el año, sin horario de verano).
// Para cambiar fechas o apagar la barra, edita solo estas constantes.
export const BUEN_FIN_TOPBAR = {
    enabled: true,
    // Antes de esta fecha la barra dice "EMPIEZA EN" y cuenta hasta aquí.
    start: new Date('2026-11-13T00:00:00-05:00'),
    // Desde start hasta end dice "TERMINA EN". Después de end la barra no se muestra.
    end: new Date('2026-11-17T23:59:59-05:00'),
    // Activa el botón de WhatsApp y el cupón durante la fase activa. Mientras sea false, muestra "Próximamente".
    ctaEnabled: false,
} as const;

// Cupón simbólico de la temporada. No indica un monto de descuento.
export const BUEN_FIN_COUPON = 'BUENFIN-TDMX';

// Tarjetas con los colores de la temporada (cinta roja y línea de fechas).
// Se apagan solas después del último día de la temporada.
export const BUEN_FIN_CARDS = {
    enabled: true,
    end: new Date('2026-11-17T23:59:59-05:00'),
} as const;

export function isBuenFinCardsActive(now: Date = new Date()): boolean {
    return BUEN_FIN_CARDS.enabled && now.getTime() <= BUEN_FIN_CARDS.end.getTime();
}

export type BuenFinPhase = 'before' | 'active' | 'ended';

export function getBuenFinPhase(now: Date = new Date()): BuenFinPhase {
    if (!BUEN_FIN_TOPBAR.enabled) return 'ended';
    if (now.getTime() > BUEN_FIN_TOPBAR.end.getTime()) return 'ended';
    if (now.getTime() < BUEN_FIN_TOPBAR.start.getTime()) return 'before';
    return 'active';
}
