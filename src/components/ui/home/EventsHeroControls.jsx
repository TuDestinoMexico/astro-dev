import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_WHATSAPP_NUMBER } from '../../../data/homeHeroSlides';

const BASE_CTA_CLASSES = 'inline-flex items-center gap-2.5 text-white px-7 py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-[0.12em] hover:scale-105 active:scale-95 transition-all shadow-2xl';

const whatsappHref = (message) => (
    `https://wa.me/${HERO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
);

export default function EventsHeroControls({ slides }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const firstRender = useRef(true);

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
            const badge = hero.querySelector('[data-hero-badge]');
            const location = hero.querySelector('[data-hero-location]');
            const locationText = hero.querySelector('[data-hero-location-text]');
            const title = hero.querySelector('[data-hero-title]');
            const description = hero.querySelector('[data-hero-description]');
            const cta = hero.querySelector('[data-hero-cta]');
            const revealElements = [badge, title, description, cta].filter(Boolean);
            let animationStarted = false;

            const reveal = () => {
                if (animationStarted || cancelled) return;
                animationStarted = true;
                timeline = gsap.timeline()
                    .fromTo(image,
                        { scale: 1.05, opacity: 0, filter: 'brightness(0.25)' },
                        { scale: 1, opacity: 1, filter: 'brightness(0.55)', duration: 0.9, ease: 'power2.out' }
                    )
                    .fromTo(revealElements,
                        { y: 35, opacity: 0, skewY: 1 },
                        { y: 0, opacity: 1, skewY: 0, stagger: 0.08, duration: 0.65, ease: 'expo.out' },
                        '-=0.65'
                    )
                    .fromTo(location,
                        { scale: 0.8, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' },
                        '-=0.45'
                    );
            };

            gsap.killTweensOf([image, ...revealElements, location]);
            gsap.set(revealElements, { y: 35, opacity: 0, skewY: 1 });
            gsap.set(location, { scale: 0.8, opacity: 0 });

            badge.textContent = slide.badge;
            locationText.textContent = slide.location;
            title.textContent = slide.title;
            description.textContent = slide.description;
            cta.href = whatsappHref(slide.whatsappMsg);
            cta.className = `${BASE_CTA_CLASSES} ${slide.btnColor}`;
            image.alt = slide.title;
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
    }, [currentIndex, slides]);

    const nextSlide = () => setCurrentIndex((previous) => (previous + 1) % slides.length);
    const previousSlide = () => setCurrentIndex((previous) => (previous - 1 + slides.length) % slides.length);

    return (
        <div className="absolute bottom-10 right-6 md:right-12 z-30 flex items-center gap-4">
            <div className="flex gap-2 mr-2" role="tablist" aria-label="Diapositivas del hero">
                {slides.map((slide, index) => (
                    <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-orange-500' : 'w-2 bg-white/40'}`}
                        aria-label={`Ir a la diapositiva ${index + 1}`}
                        aria-current={index === currentIndex ? 'true' : undefined}
                        role="tab"
                    />
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={previousSlide}
                    className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all active:scale-90 shadow-lg"
                    aria-label="Diapositiva anterior"
                >
                    <ChevronLeft size={22} />
                </button>
                <button
                    type="button"
                    onClick={nextSlide}
                    className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all active:scale-90 shadow-lg"
                    aria-label="Siguiente diapositiva"
                >
                    <ChevronRight size={22} />
                </button>
            </div>
        </div>
    );
}
