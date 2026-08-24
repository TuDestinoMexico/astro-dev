import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

let favoritos = new Set();
let currentUser = null;
const listeners = new Set();
let unsubFavoritos = null;
let iniciado = false;

const notificar = () => {
  listeners.forEach((cb) => cb());
};

const iniciarEscucha = () => {
  if (unsubFavoritos || !currentUser) return;
  const q = collection(db, 'users', currentUser.uid, 'favoritos');
  unsubFavoritos = onSnapshot(
    q,
    (snapshot) => {
      favoritos = new Set(snapshot.docs.map((d) => d.id));
      notificar();
    },
    (error) => {
      console.error('[favoritosStore] Error leyendo favoritos:', error);
    }
  );
};

const detenerEscucha = () => {
  if (unsubFavoritos) {
    unsubFavoritos();
    unsubFavoritos = null;
  }
  favoritos = new Set();
};

if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    detenerEscucha();
    if (user) iniciarEscucha();
    notificar();
  });
  iniciado = true;
}

export const favoritosStore = {
  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getClaves() {
    return favoritos;
  },
  getUser() {
    return currentUser;
  },
  esFavorito(tipo, slug) {
    return favoritos.has(`${tipo}-${slug}`);
  },
  async guardar({ tipo, slug, nombre, imagen, destino }) {
    if (!currentUser) return false;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'favoritos', `${tipo}-${slug}`), {
        tipo,
        slug,
        nombre,
        imagen: imagen || '',
        destino: destino || '',
        fechaGuardado: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('[favoritosStore] Error guardando favorito:', err);
      return false;
    }
  },
  async quitar(tipo, slug) {
    if (!currentUser) return false;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'favoritos', `${tipo}-${slug}`));
      return true;
    } catch (err) {
      console.error('[favoritosStore] Error quitando favorito:', err);
      return false;
    }
  }
};
