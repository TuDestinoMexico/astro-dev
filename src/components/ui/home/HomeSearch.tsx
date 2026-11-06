import { useEffect, useId, useRef, useState } from 'react';
import type { FocusEvent, FormEvent, KeyboardEvent, MouseEvent } from 'react';
import { CalendarDays, ChevronDown, Compass, Hotel, Minus, Palmtree, Plus, Search, Sparkles, Sun, Users, Waves, X } from 'lucide-react';

type Tipo = 'hotel' | 'tour';

interface Sugerencia {
    name: string;
    slug: string;
    destino: string;
    image: string;
}

const MAX_ADULTOS = 10;
const MAX_MENORES = 6;
const MIN_CARACTERES_SUGERENCIA = 2;
const RETRASO_SUGERENCIA_MS = 250;
const EDADES_MENOR = Array.from({ length: 18 }, (_, edad) => String(edad));

const todayInCancun = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Cancun' });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count === 1 ? singular : pluralForm}`;

const fieldClass = 'min-h-[48px] w-full rounded-card border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-primary/60 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';
const labelClass = 'mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-brand-muted';
const stepperButtonClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-border bg-white text-brand-ink transition hover:border-brand-primary hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 disabled:opacity-40';

interface StepperProps {
    titulo: string;
    descripcion: string;
    valor: number;
    min: number;
    max: number;
    onChange: (next: number) => void;
}

// Fila de un contador (adultos o menores). Los botones tienen 44 px para uso táctil.
function Stepper({ titulo, descripcion, valor, min, max, onChange }: StepperProps) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-card border border-brand-border bg-white px-4 py-3">
            <div>
                <p className="text-sm font-bold text-brand-ink">{titulo}</p>
                <p className="text-[11px] text-brand-muted">{descripcion}</p>
            </div>
            <div className="flex items-center gap-3">
                <button type="button" aria-label={`Quitar ${titulo.toLowerCase()}`} className={stepperButtonClass} disabled={valor <= min} onClick={() => onChange(clamp(valor - 1, min, max))}>
                    <Minus size={16} aria-hidden="true" />
                </button>
                <span className="w-6 text-center text-base font-black" aria-live="polite">{valor}</span>
                <button type="button" aria-label={`Agregar ${titulo.toLowerCase()}`} className={stepperButtonClass} disabled={valor >= max} onClick={() => onChange(clamp(valor + 1, min, max))}>
                    <Plus size={16} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}

const MENSAJES_BUSQUEDA = [
    { Icon: Sparkles, texto: 'Buscando algo especial para tus vacaciones' },
    { Icon: Waves, texto: 'Revisando el mar y las mejores zonas' },
    { Icon: Sun, texto: 'Preparando tus opciones de viaje' },
];

// Pantalla de espera mientras se envía la búsqueda: mensajes con íconos que cambian cada segundo.
function SearchLoader() {
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIndice((actual) => (actual + 1) % MENSAJES_BUSQUEDA.length), 1100);
        return () => clearInterval(timer);
    }, []);

    const { Icon, texto } = MENSAJES_BUSQUEDA[indice];

    return (
        <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/70 px-6 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-panel bg-white p-8 text-center shadow-card-hover">
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand-primary/20" aria-hidden="true" />
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-brand-ink">
                        <Icon size={30} aria-hidden="true" />
                    </span>
                </div>
                <p className="text-base font-black text-brand-ink" key={indice}>{texto}</p>
                <p className="mt-2 text-xs text-brand-muted">Esto toma solo un momento.</p>
                <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
                    <Palmtree size={16} className="text-brand-primary" />
                    <span className="h-1.5 w-40 overflow-hidden rounded-pill bg-brand-surface">
                        <span className="block h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-pill bg-brand-primary" />
                    </span>
                </div>
            </div>
        </div>
    );
}

// Valores con los que el buscador arranca. En los resultados llegan con la búsqueda actual.
export interface HomeSearchInitial {
    tipo?: Tipo;
    destino?: string;
    entrada?: string;
    salida?: string;
    fecha?: string;
    adultos?: number;
    menores?: number;
    edades?: string[];
}

export default function HomeSearch({ initial }: { initial?: HomeSearchInitial } = {}) {
    const [tipo, setTipo] = useState<Tipo>(initial?.tipo ?? 'hotel');
    const [destino, setDestino] = useState(initial?.destino ?? '');
    const [entrada, setEntrada] = useState(initial?.entrada ?? '');
    const [salida, setSalida] = useState(initial?.salida ?? '');
    const [fecha, setFecha] = useState(initial?.fecha ?? '');
    const [adultos, setAdultos] = useState(initial?.adultos ?? 2);
    const [menores, setMenores] = useState(initial?.menores ?? 0);
    const [edades, setEdades] = useState<string[]>(initial?.edades ?? []);
    const [viajerosAbiertos, setViajerosAbiertos] = useState(false);
    const [error, setError] = useState('');
    const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
    const [buscandoSugerencias, setBuscandoSugerencias] = useState(false);
    const [sugerenciasAbiertas, setSugerenciasAbiertas] = useState(false);
    const [indiceActivo, setIndiceActivo] = useState(-1);
    const [buscando, setBuscando] = useState(false);
    const idBase = useId();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const destinoWrapperRef = useRef<HTMLDivElement>(null);
    const minDate = todayInCancun();

    const listboxId = `${idBase}-sugerencias`;
    const mostrarSugerencias = sugerenciasAbiertas && destino.trim().length >= MIN_CARACTERES_SUGERENCIA;
    const IconoTipo = tipo === 'hotel' ? Hotel : Compass;

    // El modal es un <dialog> nativo: maneja foco, Escape y devuelve el foco al botón al cerrar.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (viajerosAbiertos && !dialog.open) dialog.showModal();
        if (!viajerosAbiertos && dialog.open) dialog.close();
    }, [viajerosAbiertos]);

    // Sugerencias mientras escribe: espera breve, cancela la petición anterior y se reinicia al cambiar de tipo.
    useEffect(() => {
        const term = destino.trim();
        if (term.length < MIN_CARACTERES_SUGERENCIA) {
            setSugerencias([]);
            setBuscandoSugerencias(false);
            setIndiceActivo(-1);
            return;
        }

        // "Buscando…" se muestra desde la primera tecla; "Sin coincidencias" solo tras la respuesta.
        setBuscandoSugerencias(true);
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/catalogo-buscar?tipo=${tipo}&q=${encodeURIComponent(term)}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                const data = await response.json();
                setSugerencias(Array.isArray(data.items) ? data.items : []);
                setIndiceActivo(-1);
            } catch (fetchError) {
                if (!controller.signal.aborted) setSugerencias([]);
            } finally {
                if (!controller.signal.aborted) setBuscandoSugerencias(false);
            }
        }, RETRASO_SUGERENCIA_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [destino, tipo]);

    const cerrarViajeros = () => setViajerosAbiertos(false);

    // Un clic sobre el fondo del modal (fuera de su caja) lo cierra.
    const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
        if (event.target === dialogRef.current) cerrarViajeros();
    };

    // Cierra la lista cuando el foco sale del campo de destino y sus sugerencias.
    const handleDestinoBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (!destinoWrapperRef.current?.contains(event.relatedTarget as Node | null)) {
            setSugerenciasAbiertas(false);
        }
    };

    const handleDestinoKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            setSugerenciasAbiertas(false);
            return;
        }
        if (!mostrarSugerencias || sugerencias.length === 0) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setIndiceActivo((actual) => (actual + 1) % sugerencias.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setIndiceActivo((actual) => (actual <= 0 ? sugerencias.length - 1 : actual - 1));
        } else if (event.key === 'Enter' && indiceActivo >= 0) {
            event.preventDefault();
            seleccionarSugerencia(sugerencias[indiceActivo]);
        }
    };

    const cambiarMenores = (next: number) => {
        const total = clamp(next, 0, MAX_MENORES);
        setMenores(total);
        setEdades((previas) => previas.slice(0, total));
    };

    const cambiarEdad = (index: number, value: string) => {
        setEdades((previas) => {
            const copia = [...previas];
            copia[index] = value;
            return copia;
        });
    };

    // Parámetros del buscador. Solo incluye fechas que ya fueron elegidas.
    const construirParametros = () => {
        const params = new URLSearchParams();
        if (destino.trim()) params.set('destino', destino.trim());
        if (tipo === 'hotel') {
            if (entrada) params.set('entrada', entrada);
            if (salida) params.set('salida', salida);
        } else if (fecha) {
            params.set('fecha', fecha);
        }
        params.set('adultos', String(adultos));
        params.set('menores', String(menores));
        if (menores > 0) params.set('edades', edades.slice(0, menores).join(','));
        return params;
    };

    // Elegir una sugerencia solo guarda el nombre en el campo. No navega: el usuario sigue
    // con fechas y viajeros, y la búsqueda se envía con el botón.
    const seleccionarSugerencia = (item: Sugerencia) => {
        setDestino(item.name);
        setSugerenciasAbiertas(false);
        setIndiceActivo(-1);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (tipo === 'hotel') {
            if (!entrada || !salida) {
                setError('Elige la fecha de entrada y la de salida.');
                return;
            }
            if (salida <= entrada) {
                setError('La fecha de salida debe ser posterior a la de entrada.');
                return;
            }
        } else if (!fecha) {
            setError('Elige una fecha para tu tour.');
            return;
        }

        const edadesMenores = edades.slice(0, menores);
        const edadesValidas = edadesMenores.length === menores && edadesMenores.every((edad) => edad !== undefined && edad !== '');
        if (!edadesValidas) {
            setError('Indica la edad de cada menor.');
            setViajerosAbiertos(true);
            return;
        }

        setSugerenciasAbiertas(false);
        setBuscando(true);
        const destinoBusqueda = `${tipo === 'hotel' ? '/hoteles' : '/tours'}?${construirParametros().toString()}`;
        // Breve pausa para que la pantalla de búsqueda se vea antes de cambiar de página.
        setTimeout(() => window.location.assign(destinoBusqueda), 600);
    };

    // Si el usuario regresa con el historial, la página puede volver desde caché con la pantalla abierta.
    useEffect(() => {
        const handlePageShow = () => setBuscando(false);
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    const resumenViajeros = `${plural(adultos, 'adulto', 'adultos')} · ${plural(menores, 'menor', 'menores')}`;
    const viajerosDialogId = `${idBase}-viajeros-dialog`;
    const viajerosLabelId = `${idBase}-viajeros-label`;
    const viajerosResumenId = `${idBase}-viajeros-resumen`;
    const viajerosTitleId = `${idBase}-viajeros-title`;

    return (
        <form
            onSubmit={handleSubmit}
            aria-label="Buscar hoteles o tours"
            className="rounded-panel border border-brand-border bg-white p-5 text-brand-ink shadow-card-hover md:p-8"
        >
            <div className="mb-5 inline-flex rounded-pill bg-brand-surface p-1" role="group" aria-label="Tipo de búsqueda">
                {([
                    { value: 'hotel', label: 'Hotel', Icon: Hotel },
                    { value: 'tour', label: 'Tour', Icon: Compass },
                ] as const).map(({ value, label, Icon }) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={tipo === value}
                        onClick={() => setTipo(value)}
                        className={`inline-flex items-center gap-2 rounded-pill px-4 py-2 text-xs font-black uppercase tracking-wider transition ${tipo === value ? 'bg-brand-primary text-brand-ink' : 'text-brand-muted hover:text-brand-ink'}`}
                    >
                        <Icon size={14} aria-hidden="true" /> {label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
                <div ref={destinoWrapperRef} onBlur={handleDestinoBlur} className="relative md:col-span-5">
                    <label htmlFor={`${idBase}-destino`} className={labelClass}>Destino o experiencia</label>
                    <div className="relative">
                        <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                        <input
                            id={`${idBase}-destino`}
                            type="text"
                            role="combobox"
                            autoComplete="off"
                            aria-autocomplete="list"
                            aria-expanded={mostrarSugerencias}
                            aria-controls={listboxId}
                            aria-activedescendant={indiceActivo >= 0 ? `${listboxId}-${indiceActivo}` : undefined}
                            value={destino}
                            onChange={(event) => {
                                setDestino(event.target.value);
                                setSugerenciasAbiertas(true);
                            }}
                            onFocus={() => setSugerenciasAbiertas(true)}
                            onKeyDown={handleDestinoKeyDown}
                            placeholder={tipo === 'hotel' ? 'Ej. Zona hotelera' : 'Ej. Isla Mujeres'}
                            className={`${fieldClass} pl-11`}
                        />
                    </div>

                    {mostrarSugerencias && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-card border border-brand-border bg-white shadow-card-hover">
                            {sugerencias.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-brand-muted" role="status">
                                    {buscandoSugerencias ? 'Buscando…' : 'Sin coincidencias. Prueba con otro nombre o destino.'}
                                </p>
                            ) : (
                                <ul id={listboxId} role="listbox" aria-label="Sugerencias" className="max-h-80 overflow-y-auto">
                                    {sugerencias.map((item, index) => (
                                        <li
                                            key={item.slug}
                                            id={`${listboxId}-${index}`}
                                            role="option"
                                            aria-selected={indiceActivo === index}
                                            onMouseDown={(event) => event.preventDefault()}
                                            onMouseEnter={() => setIndiceActivo(index)}
                                            onClick={() => seleccionarSugerencia(item)}
                                            className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition ${indiceActivo === index ? 'bg-brand-surface' : 'bg-white'}`}
                                        >
                                            {item.image ? (
                                                <img src={item.image} alt="" loading="lazy" decoding="async" className="h-10 w-14 shrink-0 rounded-lg object-cover" />
                                            ) : (
                                                <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-surface text-brand-muted">
                                                    <IconoTipo size={16} aria-hidden="true" />
                                                </span>
                                            )}
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-bold text-brand-ink">{item.name}</span>
                                                {item.destino && <span className="block truncate text-xs text-brand-muted">{item.destino}</span>}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {tipo === 'hotel' ? (
                    <>
                        <div className="md:col-span-2">
                            <label htmlFor={`${idBase}-entrada`} className={labelClass}>Entrada</label>
                            <input id={`${idBase}-entrada`} type="date" min={minDate} value={entrada} onChange={(event) => setEntrada(event.target.value)} className={fieldClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor={`${idBase}-salida`} className={labelClass}>Salida</label>
                            <input id={`${idBase}-salida`} type="date" min={entrada || minDate} value={salida} onChange={(event) => setSalida(event.target.value)} className={fieldClass} />
                        </div>
                    </>
                ) : (
                    <div className="md:col-span-4">
                        <label htmlFor={`${idBase}-fecha`} className={labelClass}>Fecha</label>
                        <div className="relative">
                            <CalendarDays size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                            <input id={`${idBase}-fecha`} type="date" min={minDate} value={fecha} onChange={(event) => setFecha(event.target.value)} className={`${fieldClass} pl-11`} />
                        </div>
                    </div>
                )}

                <div className="md:col-span-3">
                    <span id={viajerosLabelId} className={`${labelClass} block`}>Viajeros</span>
                    <button
                        type="button"
                        aria-haspopup="dialog"
                        aria-controls={viajerosDialogId}
                        aria-labelledby={`${viajerosLabelId} ${viajerosResumenId}`}
                        onClick={() => setViajerosAbiertos(true)}
                        className={`${fieldClass} flex items-center justify-between gap-3 text-left`}
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <Users size={16} aria-hidden="true" className="shrink-0 text-brand-muted" />
                            <span id={viajerosResumenId} className="truncate">{resumenViajeros}</span>
                        </span>
                        <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-brand-muted" />
                    </button>
                </div>
            </div>

            <dialog
                id={viajerosDialogId}
                ref={dialogRef}
                aria-labelledby={viajerosTitleId}
                onClose={cerrarViajeros}
                onClick={handleDialogClick}
                className="m-auto w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto rounded-panel border border-brand-border bg-white p-0 text-brand-ink shadow-card-hover backdrop:bg-brand-ink/60"
            >
                <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
                    <h2 id={viajerosTitleId} className="text-lg font-black tracking-tight">Viajeros</h2>
                    <button
                        type="button"
                        onClick={cerrarViajeros}
                        aria-label="Cerrar"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-surface hover:text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                <div className="space-y-3 px-6 py-5">
                    <Stepper titulo="Adultos" descripcion="13 años o más" valor={adultos} min={1} max={MAX_ADULTOS} onChange={setAdultos} />
                    <Stepper titulo="Menores" descripcion="De 0 a 17 años" valor={menores} min={0} max={MAX_MENORES} onChange={cambiarMenores} />

                    {menores > 0 && (
                        <div className="pt-3">
                            <p className={labelClass}>Edad de cada menor</p>
                            <div className="grid grid-cols-2 gap-3">
                                {Array.from({ length: menores }, (_, index) => (
                                    <div key={index}>
                                        <label htmlFor={`${idBase}-edad-${index}`} className="mb-1 block text-xs font-bold text-brand-muted">
                                            Menor {index + 1}
                                        </label>
                                        <select
                                            id={`${idBase}-edad-${index}`}
                                            value={edades[index] ?? ''}
                                            onChange={(event) => cambiarEdad(index, event.target.value)}
                                            className={fieldClass}
                                        >
                                            <option value="">Elige la edad</option>
                                            {EDADES_MENOR.map((edad) => (
                                                <option key={edad} value={edad}>{edad} {edad === '1' ? 'año' : 'años'}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end border-t border-brand-border px-6 py-4">
                    <button
                        type="button"
                        onClick={cerrarViajeros}
                        className="w-full rounded-card bg-brand-ink px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-brand-primary hover:text-brand-ink md:w-auto"
                    >
                        Listo
                    </button>
                </div>
            </dialog>

            {error && (
                <p role="alert" className="mt-4 text-sm font-bold text-red-600">{error}</p>
            )}

            <div className="mt-6 flex justify-stretch md:justify-end">
                <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-card bg-brand-primary px-8 py-4 text-sm font-black uppercase tracking-wider text-brand-ink shadow-card transition hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 md:w-auto"
                >
                    <Search size={16} aria-hidden="true" /> Buscar disponibilidad
                </button>
            </div>
            {buscando && <SearchLoader />}
        </form>
    );
}
