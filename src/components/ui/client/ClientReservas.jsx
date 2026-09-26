import React, { useEffect, useState } from 'react';
import { Calendar, Mail, User, Search, Clock, CheckCircle, AlertCircle, Loader2, Trash2, Building, MapPin, DollarSign, Hash, Eye, X, FileText, Users, BedDouble, Utensils, CalendarDays, Plane, PlaneLanding, Moon, Cake, FolderOpen } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, setDoc, serverTimestamp, doc, deleteDoc, updateDoc, deleteField } from 'firebase/firestore';
import GrupoDetalle from './GrupoDetalle';
import DocumentosModal from './DocumentosModal';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatFecha = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  let d = null;
  let m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) {
    d = new Date(+m[1], +m[2] - 1, +m[3]);
  } else {
    m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (m) {
      d = new Date(+m[3], +m[2] - 1, +m[1]);
    } else {
      d = new Date(str);
    }
  }
  if (isNaN(d.getTime())) return null;
  return `${d.getDate()} de ${MESES[d.getMonth()]} del ${d.getFullYear()}`;
};

const formatPax = (pax) => {
  if (!pax) return null;
  const parts = String(pax).split('.');
  const adultos = parts[0];
  const ninos = parts[1];
  const infantes = parts[2];
  let result = `${adultos} Adulto${adultos !== '1' ? 's' : ''}`;
  if (ninos && ninos !== '0') result += `, ${ninos} Menor${ninos !== '1' ? 'es' : ''}`;
  if (infantes && infantes !== '0') result += `, ${infantes} Infante${infantes !== '1' ? 's' : ''}`;
  return result;
};

const mergeLists = (a, b) => {
  return [...a, ...b].sort((x, y) => {
    const tx = x.fechaVinculacion?.toDate?.()?.getTime?.() || 0;
    const ty = y.fechaVinculacion?.toDate?.()?.getTime?.() || 0;
    return ty - tx;
  });
};

function DetalleRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div class="flex items-center gap-2 text-sm">
      <Icon size={14} class="text-slate-400 shrink-0" />
      <span class="text-slate-500 font-medium min-w-[5rem]">{label}:</span>
      <span class="text-slate-800 font-semibold truncate">{value}</span>
    </div>
  );
}

const statusGradient = (estatus) => {
  const s = (estatus || '').toLowerCase();
  if (s.includes('confirm') || s.includes('pagada') || s.includes('activa')) return 'from-emerald-600 to-teal-900';
  if (s.includes('cancel') || s.includes('rechaz')) return 'from-rose-600 to-red-900';
  if (s.includes('pendiente') || s.includes('espera')) return 'from-amber-500 to-orange-800';
  return 'from-purple-700 to-purple-950';
};

const statusPill = (estatus) => {
  const s = (estatus || '').toLowerCase();
  if (s.includes('confirm') || s.includes('pagada') || s.includes('activa'))
    return { pill: 'bg-emerald-400/15 border-emerald-300/40 text-emerald-50', dot: 'bg-emerald-300' };
  if (s.includes('cancel') || s.includes('rechaz'))
    return { pill: 'bg-red-400/15 border-red-300/40 text-red-50', dot: 'bg-red-300' };
  if (s.includes('pendiente') || s.includes('espera'))
    return { pill: 'bg-amber-400/15 border-amber-300/40 text-amber-50', dot: 'bg-amber-300' };
  return { pill: 'bg-white/15 border-white/30 text-white', dot: 'bg-white' };
};

const authenticatedHeaders = async (user) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${await user.getIdToken()}`,
});

const cleanLegacyCrmFields = (snapshot) => {
  snapshot.docs.forEach((entry) => {
    const data = entry.data();
    const legacyFields = {};

    if (Object.prototype.hasOwnProperty.call(data, 'detalles')) legacyFields.detalles = deleteField();
    if (Object.prototype.hasOwnProperty.call(data, 'pdf_url')) legacyFields.pdf_url = deleteField();

    if (Object.keys(legacyFields).length > 0) {
      updateDoc(entry.ref, legacyFields).catch((error) => {
        console.error('Error limpiando datos CRM heredados:', error);
      });
    }
  });
};

function InfoChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div class="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-slate-100 shadow-sm">
      <div class="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
        <Icon size={14} />
      </div>
      <div class="min-w-0">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p class="text-xs font-bold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, delay }) {
  return (
    <div class={`bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm ${delay}`}>
      <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
        <Icon size={15} />
      </div>
      <p class="text-sm font-black text-slate-800 leading-tight">{value}</p>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function PriceCounter({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value);
    if (isNaN(target)) {
      setDisplay(0);
      return;
    }
    let raf;
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span>
      ${display.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
    </span>
  );
}

export default function ClientReservas({ user }) {
  const [tipo, setTipo] = useState('ct');
  const [ct, setCt] = useState('');
  const [gb, setGb] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [reservas, setReservas] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [detalleReserva, setDetalleReserva] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState('');

  const [documentosItem, setDocumentosItem] = useState(null);

  useEffect(() => {
    if (!user) return;
    const qReservas = query(
      collection(db, 'users', user.uid, 'reservas'),
      orderBy('fechaVinculacion', 'desc')
    );
    const qGrupos = query(
      collection(db, 'users', user.uid, 'grupos'),
      orderBy('fechaVinculacion', 'desc')
    );
    const unsubReservas = onSnapshot(qReservas, (snapshot) => {
      cleanLegacyCrmFields(snapshot);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, tipo: 'ct', ...doc.data() }));
      setReservas((prev) => mergeLists(lista, prev.filter((p) => p.tipo === 'gb')));
    });
    const unsubGrupos = onSnapshot(qGrupos, (snapshot) => {
      cleanLegacyCrmFields(snapshot);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, tipo: 'gb', ...doc.data() }));
      setReservas((prev) => mergeLists(prev.filter((p) => p.tipo === 'ct'), lista));
    });
    return () => {
      unsubReservas();
      unsubGrupos();
    };
  }, [user]);

  const handleConsultar = async (e) => {
    e.preventDefault();
    setError('');
    setResultado(null);

    const codigo = (tipo === 'gb' ? gb : ct).trim();
    if (!codigo || !email) {
      setError('Completa todos los campos.');
      return;
    }

    const yaVinculado = reservas.some((r) =>
      r.tipo === tipo &&
      String(r.tipo === 'gb' ? r.gb : r.ct || '').trim().toUpperCase() === codigo.toUpperCase()
    );
    if (yaVinculado) {
      setError(
        tipo === 'gb'
          ? `El grupo ${codigo} ya está vinculado a tu cuenta.`
          : `La reserva ${codigo} ya está vinculada a tu cuenta.`
      );
      return;
    }

    setConsultando(true);
    try {
      const endpoint = tipo === 'gb' ? '/api/crm-grupo-consultar' : '/api/crm-consultar';
      const body = tipo === 'gb' ? { gb: codigo, email } : { ct: codigo, email };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: await authenticatedHeaders(user),
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'No se encontró la información.');
        setConsultando(false);
        return;
      }

      setResultado({ ...data.data, tipo });
      setConsultando(false);

      setGuardando(true);
      try {
        const collectionName = tipo === 'gb' ? 'grupos' : 'reservas';
        const docData = {
          [tipo === 'gb' ? 'correo_grupo' : 'correo_reserva']: email,
          [tipo === 'gb' ? 'gb' : 'ct']: codigo,
          fechaVinculacion: serverTimestamp()
        };
        await setDoc(doc(db, 'users', user.uid, collectionName, codigo.toUpperCase()), docData);
      } catch (fireErr) {
        console.error('Error guardando en Firebase:', fireErr);
      }
      setGuardando(false);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      setConsultando(false);
    }
  };

  const handleEliminar = async (res) => {
    const label = res.tipo === 'gb' ? res.gb : res.ct;
    if (!window.confirm(`¿Eliminar ${res.tipo === 'gb' ? 'el grupo' : 'la reserva'} ${label} de tu cuenta?`)) return;
    try {
      const collectionName = res.tipo === 'gb' ? 'grupos' : 'reservas';
      await deleteDoc(doc(db, 'users', user.uid, collectionName, res.id));
    } catch (err) {
      console.error('Error al eliminar reserva:', err);
    }
  };

  const handleVerDetalle = async (res) => {
    setDetalleReserva(null);
    setErrorDetalle('');
    setCargandoDetalle(true);

    try {
      const endpoint = res.tipo === 'gb' ? '/api/crm-grupo-consultar' : '/api/crm-consultar';
      const body = res.tipo === 'gb' ? { gb: res.gb, detail: true } : { ct: res.ct, detail: true };
      const resApi = await fetch(endpoint, {
        method: 'POST',
        headers: await authenticatedHeaders(user),
        body: JSON.stringify(body)
      });
      const data = await resApi.json();

      if (!data.success) {
        setErrorDetalle(data.message || 'No se pudo consultar la información.');
        setCargandoDetalle(false);
        return;
      }

      setDetalleReserva({ ...data.data, tipo: res.tipo });
      setCargandoDetalle(false);
    } catch (err) {
      setErrorDetalle('Error de conexión. Intenta de nuevo.');
      setCargandoDetalle(false);
    }
  };

  return (
    <div class="space-y-6 animate-fade-in w-full">
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-10">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} class="w-20 h-20 rounded-full border-4 border-purple-100 object-cover shadow-md" />
          ) : (
            <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center border-4 border-purple-100">
              <User size={32} class="text-purple-800" />
            </div>
          )}
          <div>
            <h1 class="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
              {user.displayName || 'Cliente'}
            </h1>
            <div class="flex items-center gap-2 mt-1 text-slate-500 text-sm">
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-8">
          <div class="flex items-center gap-2 mb-6">
            <Search size={20} class="text-purple-600" />
            <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Consultar Reserva o Grupo</h2>
          </div>

          <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setTipo('ct'); setResultado(null); }}
              class={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                tipo === 'ct' ? 'bg-purple-800 text-white shadow' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Reserva (CT)
            </button>
            <button
              type="button"
              onClick={() => { setTipo('gb'); setResultado(null); }}
              class={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                tipo === 'gb' ? 'bg-cyan-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Grupo (GB)
            </button>
          </div>

          <form onSubmit={handleConsultar} class="space-y-4 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {tipo === 'gb' ? 'Código de Grupo (GB)' : 'Código de Reserva (CT)'}
                </label>
                <input
                  type="text"
                  value={tipo === 'gb' ? gb : ct}
                  onChange={(e) => (tipo === 'gb' ? setGb(e.target.value) : setCt(e.target.value))}
                  placeholder={tipo === 'gb' ? 'Ej: GB-12345' : 'Ej: CT-12345'}
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={consultando}
              class="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-800 text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-purple-900 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {consultando ? (
                <><Loader2 size={16} class="animate-spin" /> Consultando...</>
              ) : (
                <><Search size={16} /> {tipo === 'gb' ? 'Consultar Grupo' : 'Consultar Reserva'}</>
              )}
            </button>
          </form>

          {resultado && (
            <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8">
              <div class="flex items-center gap-2 mb-4">
                <CheckCircle size={20} class="text-emerald-600" />
                <h3 class="font-black text-emerald-800 uppercase text-sm tracking-wider">{resultado.tipo === 'gb' ? 'Grupo Encontrado' : 'Reserva Encontrada'}</h3>
              </div>
              {guardando && (
                <p class="text-xs text-emerald-600 flex items-center gap-1 mb-3">
                  <Loader2 size={12} class="animate-spin" /> Vinculando a tu cuenta...
                </p>
              )}
              {resultado.tipo === 'gb' ? (
                <div class="text-sm text-slate-700 bg-white rounded-xl p-4 border border-emerald-100 space-y-1.5">
                  <DetalleRow icon={Hash} label="GB" value={gb} />
                  <DetalleRow icon={Building} label="Hotel" value={resultado.hoteles?.[0]?.hotel} />
                  <DetalleRow icon={MapPin} label="Destino" value={resultado.hoteles?.[0]?.destino} />
                  <DetalleRow icon={Calendar} label="Check-in" value={resultado.hoteles?.[0]?.checkin} />
                  <DetalleRow icon={Calendar} label="Check-out" value={resultado.hoteles?.[0]?.checkout} />
                  <DetalleRow icon={DollarSign} label="Total" value={resultado.precio_total ? `$${Number(resultado.precio_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : null} />
                </div>
              ) : (
                <div class="text-sm text-slate-700 bg-white rounded-xl p-4 border border-emerald-100 space-y-1.5">
                  <DetalleRow icon={Hash} label="CT" value={ct} />
                  <DetalleRow icon={Building} label="Hotel" value={resultado.hotel} />
                  <DetalleRow icon={MapPin} label="Destino" value={resultado.destino} />
                  <DetalleRow icon={Calendar} label="Check-in" value={resultado.checkin} />
                  <DetalleRow icon={Calendar} label="Check-out" value={resultado.checkout} />
                  <DetalleRow icon={DollarSign} label="Total" value={resultado.precio_total ? `$${Number(resultado.precio_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : null} />
                </div>
              )}
            </div>
          )}
        </div>

        <div class="border-t border-slate-100 pt-8">
          <div class="flex items-center gap-2 mb-6">
            <Calendar size={20} class="text-purple-600" />
            <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Mis Reservas y Grupos Vinculados</h2>
          </div>

          {reservas.length === 0 ? (
            <div class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
              <Calendar size={40} class="text-slate-300 mx-auto mb-3" />
              <p class="text-slate-500 font-medium">No tienes reservas ni grupos vinculados.</p>
              <p class="text-sm text-slate-400 mt-1">Ingresa tu CT o GB y correo para consultar y vincular tu información.</p>
            </div>
          ) : (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservas.map((res) => {
                const esGrupo = res.tipo === 'gb';
                return (
                  <div key={res.id} class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <span class={`inline-block text-xs font-black px-2.5 py-1 rounded-md tracking-wide ${esGrupo ? 'bg-cyan-100 text-cyan-800' : 'bg-purple-100 text-purple-800'}`}>
                          {esGrupo ? res.gb : res.ct}
                        </span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 text-sm text-slate-500">
                      <FileText size={14} class="text-slate-400 shrink-0" />
                      <span>Consulta el detalle para ver la información actualizada.</span>
                    </div>

                    <div class="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock size={11} />
                        Vinculada {res.fechaVinculacion?.toDate?.()?.toLocaleDateString?.('es-MX') || 'hoy'}
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleVerDetalle(res)}
                          class="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all text-[11px] font-bold"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                          Detalle
                        </button>
                        <button
                          onClick={() => setDocumentosItem(res)}
                          class="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all text-[11px] font-bold"
                          title="Documentos"
                        >
                          <FolderOpen size={14} />
                          Documentos
                        </button>
                        <button
                          onClick={() => handleEliminar(res)}
                          class="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[11px] font-bold"
                          title={esGrupo ? 'Eliminar grupo' : 'Eliminar reserva'}
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DOCUMENTOS */}
      {documentosItem && (
        <DocumentosModal item={documentosItem} user={user} onClose={() => setDocumentosItem(null)} />
      )}

      {/* MODAL DETALLE DE RESERVA */}
      {(cargandoDetalle || detalleReserva || errorDetalle) && (
        <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setDetalleReserva(null); setErrorDetalle(''); }}>
          <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div class="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div class="flex items-center gap-2">
                <FileText size={20} class="text-purple-600" />
                <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">
                  {detalleReserva?.tipo === 'gb' ? 'Detalle de Grupo' : 'Detalle de Reserva'}
                </h2>
              </div>
              <button
                onClick={() => { setDetalleReserva(null); setErrorDetalle(''); }}
                class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div class="p-6 overflow-y-auto flex-1">
              {cargandoDetalle && (
                <div class="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Loader2 size={32} class="animate-spin text-purple-500 mb-3" />
                  <span class="text-xs font-bold uppercase tracking-widest">Consultando información...</span>
                </div>
              )}

              {errorDetalle && (
                <div class="flex flex-col items-center justify-center py-16 text-slate-400">
                  <AlertCircle size={32} class="text-red-400 mb-3" />
                  <p class="text-sm font-medium text-red-600">{errorDetalle}</p>
                  <button
                    onClick={() => { setDetalleReserva(null); setErrorDetalle(''); }}
                    class="mt-4 text-xs font-bold text-slate-500 underline hover:text-slate-700"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {detalleReserva && !cargandoDetalle && (
                detalleReserva.tipo === 'gb' ? (
                  <GrupoDetalle grupo={detalleReserva} />
                ) : (
                <div class="space-y-4">

                  {/* HERO */}
                  <div class={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${statusGradient(detalleReserva.estatus)} p-6 text-white animate-in fade-in slide-in-from-top-2 duration-500`}>
                    <div class="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 blur-2xl"></div>
                    <div class="pointer-events-none absolute -bottom-16 -left-8 w-44 h-44 rounded-full bg-black/10 blur-2xl"></div>

                    <div class="relative z-10 flex flex-col gap-4">
                      <div class="flex items-start justify-between gap-4">
                        <div class="min-w-0">
                          <div class="flex flex-wrap items-center gap-2 mb-2.5">
                            <span class={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusPill(detalleReserva.estatus).pill}`}>
                              <span class="relative flex h-2 w-2">
                                <span class={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusPill(detalleReserva.estatus).dot}`}></span>
                                <span class={`relative inline-flex rounded-full h-2 w-2 ${statusPill(detalleReserva.estatus).dot}`}></span>
                              </span>
                              {detalleReserva.estatus || 'Confirmada'}
                            </span>
                            <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                              <Hash size={11} /> {detalleReserva.ct}
                            </span>
                          </div>
                          <h3 class="text-xl md:text-2xl font-black leading-tight drop-shadow-sm truncate">
                            {detalleReserva.hotel || detalleReserva.hotelName || 'Reserva'}
                          </h3>
                          {detalleReserva.destino && (
                            <p class="flex items-center gap-1.5 text-sm text-white/80 mt-1">
                              <MapPin size={14} class="shrink-0" /> <span class="truncate">{detalleReserva.destino}</span>
                            </p>
                          )}
                        </div>

                        {detalleReserva.pdf_url && (
                          <a
                            href={detalleReserva.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="shrink-0 inline-flex items-center gap-2 bg-white text-slate-900 font-black text-xs uppercase tracking-widest px-4 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                          >
                            <FileText size={16} /> PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TIMELINE */}
                  <div class="bg-white border border-slate-200 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
                    <div class="relative flex items-start">
                      <div class="absolute top-4 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"></div>
                      {[
                        { icon: CalendarDays, label: 'Reserva', value: formatFecha(detalleReserva.date_reserva), delay: 'delay-0', color: 'bg-purple-100 text-purple-700' },
                        { icon: Plane, label: 'Check-in', value: formatFecha(detalleReserva.checkin), delay: 'delay-100', color: 'bg-emerald-100 text-emerald-700' },
                        { icon: PlaneLanding, label: 'Check-out', value: formatFecha(detalleReserva.checkout), delay: 'delay-200', color: 'bg-amber-100 text-amber-700' },
                      ].map((node, i) => (
                        <div key={i} class="flex-1 flex flex-col items-center text-center gap-1.5 relative z-10">
                          <div class={`w-8 h-8 rounded-full flex items-center justify-center ${node.color} shadow-sm animate-in zoom-in-95 duration-500 ${node.delay}`}>
                            <node.icon size={15} />
                          </div>
                          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">{node.label}</p>
                          <p class="text-xs font-bold text-slate-700 leading-tight">{node.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STATS */}
                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatTile icon={Moon} label="Noches" value={detalleReserva.cantidad_noches || '—'} delay="animate-in zoom-in-95 duration-500 delay-100" />
                    <StatTile icon={BedDouble} label="Habitaciones" value={detalleReserva.habitaciones || '—'} delay="animate-in zoom-in-95 duration-500 delay-150" />
                    <StatTile icon={Users} label="PAX" value={formatPax(detalleReserva.pax) || '—'} delay="animate-in zoom-in-95 duration-500 delay-200" />
                    <StatTile icon={DollarSign} label="Precio Total" value={detalleReserva.precio_total ? <PriceCounter value={detalleReserva.precio_total} /> : '—'} delay="animate-in zoom-in-95 duration-500 delay-250" />
                  </div>

                  {/* CLIENTE + RESERVA */}
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-slate-50 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                      <div class="flex items-center gap-2 mb-4">
                        <div class="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                          <User size={15} />
                        </div>
                        <h3 class="text-xs font-black uppercase tracking-widest text-slate-700">Datos del Cliente</h3>
                      </div>
                      <div class="space-y-2">
                        <InfoChip icon={User} label="Nombre" value={detalleReserva.client_name} />
                        <InfoChip icon={Mail} label="Email" value={detalleReserva.email} />
                        <InfoChip icon={Cake} label="Edad" value={detalleReserva.client_age} />
                        <InfoChip icon={User} label="Acompañante" value={detalleReserva.client_sub} />
                        <InfoChip icon={Cake} label="Edad Acomp." value={detalleReserva.client_sub_age} />
                      </div>
                    </div>

                    <div class="bg-slate-50 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                      <div class="flex items-center gap-2 mb-4">
                        <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                          <BedDouble size={15} />
                        </div>
                        <h3 class="text-xs font-black uppercase tracking-widest text-slate-700">Datos de la Reserva</h3>
                      </div>
                      <div class="space-y-2">
                        <InfoChip icon={Building} label="Hotel" value={detalleReserva.hotel} />
                        <InfoChip icon={MapPin} label="Destino" value={detalleReserva.destino} />
                        <InfoChip icon={BedDouble} label="Tipo Hab." value={detalleReserva.type_room} />
                        <InfoChip icon={BedDouble} label="Habitaciones" value={detalleReserva.habitaciones} />
                        <InfoChip icon={Utensils} label="Plan Alim." value={detalleReserva.plan_alimentos} />
                      </div>
                    </div>
                  </div>

                  {/* PASAJEROS */}
                  {((detalleReserva.ninos && detalleReserva.ninos.length > 0) || detalleReserva.client_sub) && (
                    <div class="bg-slate-50 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-250">
                      <div class="flex items-center gap-2 mb-4">
                        <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                          <Users size={15} />
                        </div>
                        <h3 class="text-xs font-black uppercase tracking-widest text-slate-700">Pasajeros</h3>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="bg-white rounded-xl p-3 border border-emerald-200 flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                            {(detalleReserva.client_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div class="min-w-0">
                            <p class="text-[9px] font-black uppercase tracking-widest text-emerald-600">Adulto</p>
                            <p class="text-sm font-bold text-slate-800 truncate">{detalleReserva.client_name || 'Titular'}</p>
                          </div>
                        </div>
                        {detalleReserva.client_sub && (
                          <div class="bg-white rounded-xl p-3 border border-sky-200 flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                              {detalleReserva.client_sub.charAt(0).toUpperCase()}
                            </div>
                            <div class="min-w-0">
                              <p class="text-[9px] font-black uppercase tracking-widest text-sky-600">Acompañante</p>
                              <p class="text-sm font-bold text-slate-800 truncate">{detalleReserva.client_sub}</p>
                            </div>
                          </div>
                        )}
                        {(detalleReserva.ninos || []).map((nino, idx) => (
                          <div key={idx} class="bg-white rounded-xl p-3 border border-violet-200 flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                              {(nino.nombre || '?').charAt(0).toUpperCase()}
                            </div>
                            <div class="min-w-0">
                              <p class="text-[9px] font-black uppercase tracking-widest text-violet-600">Menor {idx + 1}</p>
                              <p class="text-sm font-bold text-slate-800 truncate">{nino.nombre}</p>
                              <p class="text-xs text-slate-500">{nino.edad} años</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
