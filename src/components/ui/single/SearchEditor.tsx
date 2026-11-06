import { useId, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import HomeSearch from '../home/HomeSearch';
import type { HomeSearchInitial } from '../home/HomeSearch';

interface Props {
    initial: HomeSearchInitial;
}

// Botón "Cambiar búsqueda" de los resultados: despliega el mismo buscador de la portada
// debajo del resumen, ya con la búsqueda actual cargada.
export default function SearchEditor({ initial }: Props) {
    const [abierto, setAbierto] = useState(false);
    const panelId = useId();

    return (
        <div className="mb-10 mt-6">
            <div className="flex justify-end">
                <button
                    type="button"
                    aria-expanded={abierto}
                    aria-controls={panelId}
                    onClick={() => setAbierto((actual) => !actual)}
                    className="inline-flex items-center gap-2 rounded-pill border border-brand-border bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-brand-ink transition hover:border-brand-primary hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                    <SlidersHorizontal size={14} aria-hidden="true" />
                    {abierto ? 'Cerrar' : 'Cambiar búsqueda'}
                </button>
            </div>

            <div
                id={panelId}
                inert={!abierto}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${abierto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className={`min-h-0 ${abierto ? 'overflow-visible' : 'overflow-hidden'}`}>
                    <div className="pb-2 pt-5">
                        <HomeSearch initial={initial} />
                    </div>
                </div>
            </div>
        </div>
    );
}
