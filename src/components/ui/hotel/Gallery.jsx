import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Images, X } from 'lucide-react';

const CATEGORY_LABELS = {
  hotels: {
    rooms: 'Habitaciones',
    bathrooms: 'Baños',
    pool_beach: 'Albercas y playa',
    restaurants_bars: 'Restaurantes y bares',
    facilities: 'Instalaciones y servicios',
    activities: 'Actividades y entretenimiento',
    exteriors: 'Exteriores y vistas',
    other: 'Otros',
    uncategorized: 'Sin clasificar',
  },
  tours: {
    cover: 'Portada',
    experience: 'Experiencia y actividad',
    destination: 'Destino y paisaje',
    transport: 'Transporte y punto de encuentro',
    included: 'Incluye y equipo',
    group: 'Grupo y participantes',
    safety: 'Seguridad',
    other: 'Otros',
    uncategorized: 'Sin clasificar',
  },
};

const CATEGORY_ORDER = {
  hotels: ['rooms', 'bathrooms', 'pool_beach', 'restaurants_bars', 'facilities', 'activities', 'exteriors', 'other', 'uncategorized'],
  tours: ['cover', 'experience', 'destination', 'transport', 'included', 'group', 'safety', 'other', 'uncategorized'],
};

function humanizeCategory(category) {
  return String(category || 'uncategorized')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function categoryButtonClass(selected, inDialog) {
  if (inDialog) return selected ? 'bg-white text-slate-900' : 'text-white/75 hover:bg-white/10 hover:text-white';
  return selected
    ? 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200'
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
}

function categoryCountClass(selected, inDialog) {
  if (inDialog) return selected ? 'bg-slate-200 text-slate-800' : 'bg-white/10 text-white';
  return selected ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500';
}

export default function Gallery({ images = [], hotelName, type = 'hotels' }) {
  const dialogRef = useRef(null);
  const touchStartX = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState(() => new Set());
  const categoryLabels = CATEGORY_LABELS[type] || CATEGORY_LABELS.hotels;

  const usableImages = useMemo(
    () => images.filter((image) => image?.url && !imageErrors.has(image.url)),
    [images, imageErrors],
  );

  const categories = useMemo(() => {
    const counts = new Map();
    for (const image of usableImages) {
      const category = image.category || 'uncategorized';
      counts.set(category, (counts.get(category) || 0) + 1);
    }

    const ordered = CATEGORY_ORDER[type] || CATEGORY_ORDER.hotels;
    const known = ordered.filter((category) => counts.has(category));
    const custom = [...counts.keys()].filter((category) => !ordered.includes(category)).sort();
    return [...known, ...custom].map((category) => ({
      id: category,
      label: categoryLabels[category] || humanizeCategory(category),
      count: counts.get(category),
    }));
  }, [usableImages, type, categoryLabels]);

  const visibleImages = useMemo(
    () => activeCategory === 'all'
      ? usableImages
      : usableImages.filter((image) => (image.category || 'uncategorized') === activeCategory),
    [usableImages, activeCategory],
  );
  const currentImage = visibleImages[activeIndex] || visibleImages[0];
  const coverImage = usableImages.find((image) => image.category === 'cover') || usableImages[0];
  const categoryLabel = activeCategory === 'all'
    ? 'Todas las fotos'
    : (categoryLabels[activeCategory] || humanizeCategory(activeCategory));

  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(visibleImages.length - 1, 0)));
  }, [visibleImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const handleKeyDown = (event) => {
      if (visibleImages.length < 2) return;
      if (event.key === 'ArrowRight') setActiveIndex((index) => (index + 1) % visibleImages.length);
      if (event.key === 'ArrowLeft') setActiveIndex((index) => (index - 1 + visibleImages.length) % visibleImages.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, visibleImages.length]);

  useEffect(() => {
    if (!lightboxOpen || !dialogRef.current || dialogRef.current.open) return;
    dialogRef.current.showModal();
  }, [lightboxOpen]);

  const move = (direction) => {
    if (visibleImages.length < 2) return;
    setActiveIndex((index) => (index + direction + visibleImages.length) % visibleImages.length);
  };

  const selectCategory = (category) => {
    setActiveCategory(category);
    setActiveIndex(0);
  };

  const openGallery = (category = 'all') => {
    selectCategory(category);
    setLightboxOpen(true);
  };

  const reportImageError = (url) => setImageErrors((current) => new Set(current).add(url));
  const mosaicGridClass = categories.length <= 1
    ? 'lg:grid-cols-2'
    : categories.length === 2
      ? 'lg:auto-rows-[11rem] lg:grid-cols-3'
      : 'lg:auto-rows-[11rem] lg:grid-cols-4';
  const coverTileClass = categories.length === 0
    ? 'lg:col-span-2'
    : categories.length === 1
      ? 'lg:col-span-1 lg:aspect-[4/3]'
      : 'lg:col-span-2 lg:row-span-2 lg:aspect-auto';

  const renderCategoryButtons = (inDialog = false) => (
    <>
      <button
        type="button"
        onClick={() => selectCategory('all')}
        aria-pressed={activeCategory === 'all'}
        className={`flex min-h-11 w-fit shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition lg:w-full lg:shrink ${categoryButtonClass(activeCategory === 'all', inDialog)}`}
      >
        <span>Todas las fotos</span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${categoryCountClass(activeCategory === 'all', inDialog)}`}>{usableImages.length}</span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => selectCategory(category.id)}
          aria-pressed={activeCategory === category.id}
          className={`flex min-h-11 w-fit shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition lg:w-full lg:shrink ${categoryButtonClass(activeCategory === category.id, inDialog)}`}
        >
          <span className="min-w-0 truncate">{category.label}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${categoryCountClass(activeCategory === category.id, inDialog)}`}>{category.count}</span>
        </button>
      ))}
    </>
  );

  if (!usableImages.length) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
        <div>
          <Images className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
          <p className="font-semibold text-slate-600">Aún no hay fotos disponibles</p>
          <p className="mt-1 text-sm text-slate-400">Las imágenes de este {type === 'tours' ? 'tour' : 'hotel'} aparecerán aquí.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="tdmx-gallery overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5" aria-label={`Galería de ${hotelName}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Descubre cada espacio</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Fotos por categoría</h2>
        </div>
        <button
          type="button"
          onClick={() => openGallery('all')}
          className="min-h-11 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
        >
          Abrir galería completa
        </button>
      </div>

      <div className={`grid grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 ${mosaicGridClass}`}>
        <button
          type="button"
          onClick={() => openGallery('all')}
          aria-label={`Abrir todas las fotos, ${usableImages.length} en total`}
          className={`group relative col-span-2 aspect-[2/1] overflow-hidden rounded-2xl bg-slate-200 text-left ${coverTileClass}`}
        >
          <img src={coverImage.url} alt={hotelName} fetchPriority="high" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={() => reportImageError(coverImage.url)} />
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent" />
          {coverImage.is_exclusive && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-700/95 px-2.5 py-1 text-[10px] font-bold text-white sm:right-4 sm:top-4 sm:text-xs"><BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />Exclusiva TDMX</span>}
          <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white sm:inset-x-5 sm:bottom-5">
            <span>
              <span className="block text-lg font-extrabold sm:text-2xl">Todas las fotos</span>
              <span className="mt-1 inline-flex rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800">{usableImages.length} fotos</span>
            </span>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur-sm transition group-hover:bg-white/30 sm:h-12 sm:w-12"><ArrowRight className="h-5 w-5" aria-hidden="true" /></span>
          </span>
        </button>

        {categories.map((category) => {
          const previewImage = usableImages.find((image) => (image.category || 'uncategorized') === category.id);
          if (!previewImage) return null;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => openGallery(category.id)}
              aria-label={`Abrir categoría ${category.label}, ${category.count} fotos`}
              className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 text-left ${categories.length === 1 ? 'lg:aspect-[4/3]' : 'lg:aspect-auto'}`}
            >
              <img src={previewImage.url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={() => reportImageError(previewImage.url)} />
              <span className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
              {previewImage.is_exclusive && <span className="absolute right-2 top-2 rounded-full bg-emerald-700/95 px-2 py-1 text-[9px] font-bold text-white sm:text-[10px]">Exclusiva</span>}
              <span className="absolute inset-x-2 bottom-2 flex flex-wrap items-end justify-between gap-1 text-white sm:inset-x-3 sm:bottom-3">
                <span className="min-w-0 rounded-lg bg-white/95 px-2 py-1 text-xs font-bold leading-tight text-slate-800 sm:text-sm">{category.label}</span>
                <span className="rounded-lg bg-slate-950/65 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">{category.count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setLightboxOpen(false)}
        aria-label={`Galería de ${hotelName}`}
        className="tdmx-gallery-dialog m-0 h-full max-h-none w-full max-w-none border-0 bg-slate-950 p-0 text-white backdrop:bg-slate-950/95"
      >
        <div className="flex h-full flex-col">
          <header className="tdmx-gallery-dialog__header flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-7">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold sm:text-base">{hotelName}</p>
              <p className="text-xs text-white/60">{categoryLabel} · {activeIndex + 1} de {visibleImages.length}</p>
            </div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Cerrar galería" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"><X className="h-5 w-5" /></button>
          </header>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[230px_minmax(0,1fr)]">
            <nav aria-label="Categorías de fotos" className="tdmx-gallery-scroll flex gap-2 overflow-x-auto border-b border-white/10 p-3 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-5">
              {renderCategoryButtons(true)}
            </nav>
            <div className="tdmx-gallery-dialog__content flex min-h-0 min-w-0 flex-col p-3 sm:p-5">
              <div
                className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center"
                onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
                onTouchEnd={(event) => {
                  const startX = touchStartX.current;
                  touchStartX.current = null;
                  if (startX === null) return;
                  const endX = event.changedTouches[0]?.clientX;
                  if (endX === undefined) return;
                  const delta = endX - startX;
                  if (Math.abs(delta) >= 48) move(delta < 0 ? 1 : -1);
                }}
              >
                {currentImage && <img src={currentImage.url} alt={currentImage.alt || hotelName} className="max-h-full max-w-full rounded-xl object-contain" onError={() => reportImageError(currentImage.url)} />}
                {visibleImages.length > 1 && (
                  <>
                    <button type="button" onClick={() => move(-1)} aria-label="Foto anterior" className="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg hover:bg-white sm:left-5"><ArrowLeft className="h-5 w-5" /></button>
                    <button type="button" onClick={() => move(1)} aria-label="Foto siguiente" className="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg hover:bg-white sm:right-5"><ArrowRight className="h-5 w-5" /></button>
                  </>
                )}
              </div>
              <div className="tdmx-gallery-dialog__caption flex items-center justify-between gap-3 py-3 text-sm">
                <p className="text-sm font-semibold text-emerald-300">{currentImage?.is_exclusive ? 'Foto exclusiva TDMX' : ''}</p>
                <p className="shrink-0 text-white/50">Desliza · ← →</p>
              </div>
              <div className="tdmx-gallery-dialog__thumbnails tdmx-gallery-scroll flex snap-x gap-2 overflow-x-auto pb-1" aria-label="Seleccionar foto">
                {visibleImages.map((image, index) => (
                  <button key={`${image.url}-dialog-${index}`} type="button" onClick={() => setActiveIndex(index)} aria-label={`Ver foto ${index + 1}`} aria-pressed={index === activeIndex} className={`h-14 w-20 shrink-0 snap-start overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-slate-950 ${index === activeIndex ? 'ring-indigo-400' : 'ring-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}
