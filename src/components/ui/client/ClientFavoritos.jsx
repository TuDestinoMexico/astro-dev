import { Heart, MapPin, Star, Trash2 } from 'lucide-react';

const DUMMY_FAVORITES = [
  {
    id: 1,
    name: 'Hyatt Ziva Cancún',
    type: 'Hotel',
    location: 'Cancún, QR',
    price: '$4,200 MXN',
    rating: 4.8,
    image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/test/placeholder-hotel.jpg',
    tag: 'Todo incluido',
  },
  {
    id: 2,
    name: 'Xcaret Park',
    type: 'Tour',
    location: 'Playa del Carmen, QR',
    price: '$1,899 MXN',
    rating: 4.9,
    image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/test/placeholder-tour.jpg',
    tag: 'Entrada general',
  },
  {
    id: 3,
    name: 'Isla Mujeres Tour',
    type: 'Tour',
    location: 'Cancún, QR',
    price: '$850 MXN',
    rating: 4.6,
    image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/test/placeholder-tour.jpg',
    tag: 'Catamarán',
  },
  {
    id: 4,
    name: 'Secrets Maroma Beach',
    type: 'Hotel',
    location: 'Riviera Maya, QR',
    price: '$5,800 MXN',
    rating: 4.7,
    image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/test/placeholder-hotel.jpg',
    tag: 'Solo adultos',
  },
];

export default function ClientFavoritos({ user }) {
  return (
    <div>
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Heart class="text-rose-600" size={28} />
          Mis Favoritos
        </h2>
        <p class="text-sm text-slate-500 mt-1">Tus hoteles y tours guardados</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DUMMY_FAVORITES.map((fav) => (
          <div key={fav.id} class="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col md:flex-row">
            <div class="w-full md:w-40 h-40 md:h-auto bg-slate-100 shrink-0 flex items-center justify-center text-slate-300 text-xs font-medium">
              <img
                src={fav.image}
                alt={fav.name}
                class="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-slate-300 text-xs font-medium">Sin imagen</span>';
                }}
              />
            </div>

            <div class="flex-1 p-4 flex flex-col gap-2 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h3 class="text-base font-bold text-slate-800 truncate">{fav.name}</h3>
                  <div class="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <MapPin size={12} />
                    <span class="truncate">{fav.location}</span>
                  </div>
                </div>
                <button class="text-slate-300 hover:text-red-500 transition-colors cursor-pointer shrink-0 p-1">
                  <Trash2 size={15} />
                </button>
              </div>

              <div class="flex items-center gap-2 text-xs">
                <span class="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded tracking-wider uppercase text-[10px]">
                  {fav.type}
                </span>
                <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                  {fav.tag}
                </span>
              </div>

              <div class="flex items-center justify-between pt-1 mt-auto">
                <div class="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span class="text-xs font-bold text-slate-700">{fav.rating}</span>
                </div>
                <span class="text-sm font-black text-slate-800">{fav.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
