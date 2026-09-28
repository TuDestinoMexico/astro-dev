import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const whatsappHref = (number, message) => (
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`
);

export default function EventsHeroControls({ slides, whatsappNumber, autoplayMs = 7000 }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const firstRender = useRef(true);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);

        updateMotionPreference();
        mediaQuery.addEventListener?.('change', updateMotionPreference);

        return () => mediaQuery.removeEventListener?.('change', updateMotionPreference);
    }, []);

    useEffect(() => {
        if (isPaused || reducedMotion || slides.length < 2) return undefined;

        const timer = window.setTimeout(() => {
            setCurrentIndex((previous) => (previous + 1) % slides.length);
        }, autoplayMs);

        return () => window.clearTimeout(timer);
    }, [autoplayMs, currentIndex, isPaused, reducedMotion, slides.length]);

    useEffect(() => {
        let cancelled = false;
        let timeline;
        let cleanupImageEvents = () => {};

        const updateSlide = async () => {
            const hero = document.getElementById('home-hero');
            const slide = slides[currentIndex];
            if (!hero || !slide) return;

            if (firstRender.current) {
                firstRender.current = false;
                return;
            }

            const { default: gsap } = await import('gsap');
            if (cancelled) return;

            const image = hero.querySelector('[data-hero-image]');
            const eyebrow = hero.querySelector('[data-hero-eyebrow]');
            const index = hero.querySelector('[data-hero-index]');
            const location = hero.querySelector('[data-hero-location]');
            const locationText = hero.querySelector('[data-hero-location-text]');
            const meta = hero.querySelector('[data-hero-meta]');
            const title = hero.querySelector('[data-hero-title]');
            const description = hero.querySelector('[data-hero-description]');
            const cta = hero.querySelector('[data-hero-cta]');
            const ctaLabel = hero.querySelector('[data-hero-cta-label]');
            const secondary = hero.querySelector('[data-hero-secondary]');
            const secondaryLabel = hero.querySelector('[data-hero-secondary-label]');
            const revealElements = [eyebrow, title, description, cta, secondary].filter(Boolean);
            let animationStarted = false;

            const reveal = () => {
                if (animationStarted || cancelled) return;
                animationStarted = true;
                timeline = gsap.timeline()
                    .fromTo(image,
                        { scale: 1.08, opacity: 0, filter: 'saturate(0.7) brightness(0.55)' },
                        { scale: 1, opacity: 1, filter: 'saturate(1) brightness(0.85)', duration: 1, ease: 'power3.out' }
                    )
                    .fromTo(revealElements,
                        { y: 28, opacity: 0 },
                        { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: 'expo.out' },
                        '-=0.7'
                    )
                    .fromTo([location, meta],
                        { y: 10, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
                        '-=0.4'
                    );
            };

            gsap.killTweensOf([image, ...revealElements, location, meta]);
            gsap.set(revealElements, { y: 28, opacity: 0 });
            gsap.set([location, meta], { y: 10, opacity: 0 });

            eyebrow.textContent = slide.eyebrow;
            index.textContent = String(currentIndex + 1).padStart(2, '0');
            locationText.textContent = slide.location;
            meta.textContent = slide.meta;
            title.textContent = slide.title;
            description.textContent = slide.description;
            if (cta && ctaLabel) {
                cta.hidden = !(whatsappNumber && slide.whatsappMsg && slide.ctaLabel);
                cta.href = whatsappHref(whatsappNumber, slide.whatsappMsg);
                ctaLabel.textContent = slide.ctaLabel;
            }
            if (secondary && secondaryLabel) {
                secondary.hidden = !(slide.secondaryHref && slide.secondaryLabel);
                secondary.href = slide.secondaryHref;
                secondaryLabel.textContent = slide.secondaryLabel;
            }
            image.alt = slide.alt || slide.title;
            image.onload = reveal;
            image.onerror = reveal;
            image.src = slide.image;

            cleanupImageEvents = () => {
                image.onload = null;
                image.onerror = null;
            };

            if (image.complete) reveal();
        };

        updateSlide();

        return () => {
            cancelled = true;
            cleanupImageEvents();
            timeline?.kill();
        };
    }, [currentIndex, slides, whatsappNumber]);

    const nextSlide = () => setCurrentIndex((previous) => (previous + 1) % slides.length);
    const previousSlide = () => setCurrentIndex((previous) => (previous - 1 + slides.length) % slides.length);
    const togglePlayback = () => setIsPaused((previous) => !previous);

    return (
        <div className="absolute bottom-5 right-5 z-30 flex items-center gap-3 md:bottom-8 md:left-[18rem] md:right-auto md:gap-4">
            <div className="mr-1 flex gap-2" role="tablist" aria-label="Diapositivas del hero">
                {slides.map((slide, index) => (
                    <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-pill transition-all duration-300 ${index === currentIndex ? 'w-8 bg-brand-primary' : 'w-1.5 bg-white/50'}`}
                        aria-label={`Ir a la diapositiva ${index + 1}`}
                        aria-current={index === currentIndex ? 'true' : undefined}
                        role="tab"
                    />
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={togglePlayback}
                    aria-pressed={isPaused}
                    aria-label={isPaused ? 'Reanudar presentación' : 'Pausar presentación'}
                    title={isPaused ? 'Reanudar presentación' : 'Pausar presentación'}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-brand-ink/20 text-white backdrop-blur-md transition-all hover:bg-brand-primary hover:text-white active:scale-90 md:h-11 md:w-11"
                >
                    {isPaused ? <Play size={17} fill="currentColor" aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
                </button>
                <button
                    type="button"
                    onClick={previousSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-brand-ink/20 text-white backdrop-blur-md transition-all hover:bg-brand-primary hover:text-white active:scale-90 md:h-11 md:w-11"
                    aria-label="Diapositiva anterior"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-brand-ink/20 text-white backdrop-blur-md transition-all hover:bg-brand-primary hover:text-white active:scale-90 md:h-11 md:w-11"
                    aria-label="Siguiente diapositiva"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
