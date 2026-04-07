<script lang="ts" setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';

const slides = ref([
  {
    id: 1,
    src: 'https://picsum.photos/1920/1080?random=1',
    alt: 'Paisaje montañoso',
    title: 'Explora la Montaña',
    subtitle: 'Descubre senderos inexplorados y vistas increíbles en las cumbres más altas.',
    cta: 'Ver Rutas'
  },
  {
    id: 2,
    src: 'https://picsum.photos/1920/1080?random=2',
    alt: 'Océano azul',
    title: 'Profundidad Azul',
    subtitle: 'Sumérgete en la calma del océano infinito y explora la vida marina.',
    cta: 'Reservar Viaje'
  },
  {
    id: 3,
    src: 'https://picsum.photos/1920/1080?random=3',
    alt: 'Bosque verde',
    title: 'Naturaleza Viva',
    subtitle: 'Conecta con el entorno, respira aire puro y relájate bajo los árboles.',
    cta: 'Leer Más'
  }
]);

const currentSlide = ref(0);
let slideInterval: any = null;

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const handleButtonClick = (title: string) => {
  console.log('Click en:', title);
};

onMounted(() => {
  slideInterval = setInterval(nextSlide, 10000);
});

onBeforeUnmount(() => {
  if (slideInterval) clearInterval(slideInterval);
});
</script>

<template>
  <div
      class="mt-5 relative w-full h-[60vh] min-h-100 md:h-[calc(100vh-200px)] overflow-hidden bg-gray-900 text-white group">

    <div
        class="flex h-full w-full transition-transform duration-1000 ease-in-out"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
    >
      <div
          v-for="slide in slides"
          :key="slide.id"
          class="relative w-full overflow-hidden h-full shrink-0"
      >
        <img
            :src="slide.src"
            :alt="slide.alt"
            class="w-full h-full object-cover object-center"
        />

        <div class="absolute inset-0 bg-black/50"></div>

        <div
            class="absolute inset-y-0 left-0 w-full flex flex-col justify-center items-start text-left px-6 md:px-20 lg:px-32 z-10 box-border">

          <h2 class="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 drop-shadow-lg leading-tight w-full break-words">
            {{ slide.title }}
          </h2>

          <p class="text-base sm:text-lg md:text-xl text-gray-100 mb-6 md:mb-8 max-w-full md:max-w-2xl drop-shadow-md break-words whitespace-normal">
            {{ slide.subtitle }}
          </p>

          <button
              @click="handleButtonClick(slide.title)"
              class="bg-purple-600 hover:bg-purple-700 text-white text-sm md:text-base font-medium py-2.5 px-6 md:py-3 md:px-8 rounded-full transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
          >
            {{ slide.cta }}
          </button>
        </div>

      </div>
    </div>

    <div class="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 z-20">
      <button
          v-for="(slide, index) in slides"
          :key="index"
          @click="currentSlide = index"
          class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 focus:outline-none"
          :class="currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'"
      ></button>
    </div>

  </div>
</template>