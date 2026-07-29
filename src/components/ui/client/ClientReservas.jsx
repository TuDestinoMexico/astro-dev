import React, { useEffect, useState } from 'react';
import { Calendar, Mail, User, Search, Clock, CheckCircle, AlertCircle, Loader2, Trash2, Building, MapPin, DollarSign, Hash, Eye, X, FileText, Users, Phone, Home, Bed, Utensils, Star } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';

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

const statusColor = (estatus) => {
  const s = (estatus || '').toLowerCase();
  if (s.includes('confirm') || s.includes('pagada') || s.includes('activa')) return 'bg-emerald-100 text-emerald-700';
  if (s.includes('cancel') || s.includes('rechaz')) return 'bg-red-100 text-red-700';
  if (s.includes('pendiente') || s.includes('espera')) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-600';
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

export default function ClientReservas({ user }) {
  const [ct, setCt] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [reservas, setReservas] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [detalleReserva, setDetalleReserva] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'reservas'),
      orderBy('fechaVinculacion', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservas(lista);
    });
    return unsubscribe;
  }, [user]);

  const handleConsultar = async (e) => {
    e.preventDefault();
    setError('');
    setResultado(null);

    if (!ct || !email) {
      setError('Completa todos los campos.');
      return;
    }

    setConsultando(true);
    try {
      const res = await fetch('/api/crm-consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ct, email })
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'No se encontró la reserva.');
        setConsultando(false);
        return;
      }

      setResultado(data.data);
      setConsultando(false);

      setGuardando(true);
      try {
        const docData = {
          correo_reserva: email,
          ct: ct,
          ...(data.data?.pdf_url && { pdf_url: data.data.pdf_url }),
          detalles: data.data,
          fechaVinculacion: serverTimestamp()
        };
        await addDoc(collection(db, 'users', user.uid, 'reservas'), docData);
      } catch (fireErr) {
        console.error('Error guardando en Firebase:', fireErr);
      }
      setGuardando(false);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      setConsultando(false);
    }
  };

  const handleEliminar = async (resId, ctCode) => {
    if (!window.confirm(`¿Eliminar la reserva ${ctCode} de tu cuenta?`)) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'reservas', resId));
    } catch (err) {
      console.error('Error al eliminar reserva:', err);
    }
  };

  const handleVerDetalle = async (res) => {
    setDetalleReserva(null);
    setErrorDetalle('');
    setCargandoDetalle(true);

    try {
      const resApi = await fetch('/api/crm-consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ct: res.ct, email: res.correo_reserva })
      });
      const data = await resApi.json();

      if (!data.success) {
        setErrorDetalle(data.message || 'No se pudo consultar la reserva.');
        setCargandoDetalle(false);
        return;
      }

      setDetalleReserva(data.data);
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
            <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Consultar Reserva</h2>
          </div>

          <form onSubmit={handleConsultar} class="space-y-4 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Código de Reserva (CT)
                </label>
                <input
                  type="text"
                  value={ct}
                  onChange={(e) => setCt(e.target.value)}
                  placeholder="Ej: CT-12345"
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
                <><Search size={16} /> Consultar Reserva</>
              )}
            </button>
          </form>

          {resultado && (
            <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8">
              <div class="flex items-center gap-2 mb-4">
                <CheckCircle size={20} class="text-emerald-600" />
                <h3 class="font-black text-emerald-800 uppercase text-sm tracking-wider">Reserva Encontrada</h3>
              </div>
              {guardando && (
                <p class="text-xs text-emerald-600 flex items-center gap-1 mb-3">
                  <Loader2 size={12} class="animate-spin" /> Vinculando a tu cuenta...
                </p>
              )}
              <div class="text-sm text-slate-700 bg-white rounded-xl p-4 border border-emerald-100 space-y-1.5">
                <DetalleRow icon={Hash} label="CT" value={ct} />
                <DetalleRow icon={Building} label="Hotel" value={resultado.hotel} />
                <DetalleRow icon={MapPin} label="Destino" value={resultado.destino} />
                <DetalleRow icon={Calendar} label="Check-in" value={resultado.checkin} />
                <DetalleRow icon={Calendar} label="Check-out" value={resultado.checkout} />
                <DetalleRow icon={DollarSign} label="Total" value={resultado.precio_total ? `$${Number(resultado.precio_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : null} />
              </div>
            </div>
          )}
        </div>

        <div class="border-t border-slate-100 pt-8">
          <div class="flex items-center gap-2 mb-6">
            <Calendar size={20} class="text-purple-600" />
            <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Mis Reservas Vinculadas</h2>
          </div>

          {reservas.length === 0 ? (
            <div class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
              <Calendar size={40} class="text-slate-300 mx-auto mb-3" />
              <p class="text-slate-500 font-medium">No tienes reservas vinculadas.</p>
              <p class="text-sm text-slate-400 mt-1">Ingresa tu CT y correo para consultar y vincular tu reserva.</p>
            </div>
          ) : (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservas.map((res) => {
                const d = res.detalles || {};
                return (
                  <div key={res.id} class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <span class="inline-block bg-purple-100 text-purple-800 text-xs font-black px-2.5 py-1 rounded-md tracking-wide">
                          {res.ct}
                        </span>
                      </div>
                      {d.estatus && (
                        <span class={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${statusColor(d.estatus)}`}>
                          {d.estatus}
                        </span>
                      )}
                    </div>

                    <div class="space-y-1.5">
                      {(d.hotel || d.hotelName || d.nombre) && (
                        <div class="flex items-center gap-2 text-sm">
                          <Building size={14} class="text-slate-400 shrink-0" />
                          <span class="text-slate-800 font-semibold truncate">{d.hotel || d.hotelName || d.nombre}</span>
                        </div>
                      )}
                      {(d.destino || d.destination) && (
                        <div class="flex items-center gap-2 text-sm">
                          <MapPin size={14} class="text-slate-400 shrink-0" />
                          <span class="text-slate-600 truncate">{d.destino || d.destination}</span>
                        </div>
                      )}
                      {d.checkin && (
                        <div class="flex items-center gap-2 text-sm">
                          <Calendar size={14} class="text-slate-400 shrink-0" />
                          <span class="text-slate-600">
                            {d.checkin}
                            {d.checkout && <> — {d.checkout}</>}
                          </span>
                        </div>
                      )}
                      {(d.precio_total) && (
                        <div class="flex items-center gap-2 text-sm">
                          <DollarSign size={14} class="text-slate-400 shrink-0" />
                          <span class="text-slate-800 font-bold">${Number(d.precio_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                        </div>
                      )}
                    </div>

                    <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock size={11} />
                        Vinculada {res.fechaVinculacion?.toDate?.()?.toLocaleDateString?.('es-MX') || 'hoy'}
                      </div>
                      <div class="flex items-center gap-1">
                        <button
                          onClick={() => handleVerDetalle(res)}
                          class="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                        {(res.pdf_url || d.pdf_url) && (
                          <a
                            href={res.pdf_url || d.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
                            title="Descargar PDF"
                          >
                            <FileText size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => handleEliminar(res.id, res.ct)}
                          class="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          title="Eliminar reserva"
                        >
                          <Trash2 size={14} />
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

      {/* MODAL DETALLE DE RESERVA */}
      {(cargandoDetalle || detalleReserva || errorDetalle) && (
        <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setDetalleReserva(null); setErrorDetalle(''); }}>
          <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div class="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div class="flex items-center gap-2">
                <FileText size={20} class="text-purple-600" />
                <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Detalle de Reserva</h2>
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
                  <span class="text-xs font-bold uppercase tracking-widest">Consultando reserva...</span>
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
                <div class="space-y-6">

                  {detalleReserva.pdf_url && (
                    <div class="bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl p-6 text-center">
                      <a
                        href={detalleReserva.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-3 bg-white text-purple-900 font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-purple-50 transition-all shadow-xl"
                      >
                        <FileText size={20} />
                        Descargar PDF de la Reserva
                      </a>
                    </div>
                  )}

                  <div class="bg-slate-50 rounded-xl p-4 space-y-2">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Datos del Cliente</h3>
                    <DetalleRow icon={User} label="Nombre" value={detalleReserva.client_name} />
                    <DetalleRow icon={Phone} label="Teléfono" value={detalleReserva.phone_number} />
                    <DetalleRow icon={Phone} label="Tel. Sec." value={detalleReserva.phone_secondary} />
                    <DetalleRow icon={Mail} label="Email" value={detalleReserva.email} />
                    <DetalleRow icon={User} label="Edad" value={detalleReserva.client_age} />
                    <DetalleRow icon={User} label="Acompañante" value={detalleReserva.client_sub} />
                    <DetalleRow icon={User} label="Edad Acomp." value={detalleReserva.client_sub_age} />
                  </div>

                  {(detalleReserva.address || detalleReserva.city) && (
                    <div class="bg-slate-50 rounded-xl p-4 space-y-2">
                      <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dirección</h3>
                      <DetalleRow icon={Home} label="Dirección" value={detalleReserva.address} />
                      <DetalleRow icon={MapPin} label="CP / Ciudad" value={detalleReserva.cp ? `${detalleReserva.cp}, ${detalleReserva.city || ''}` : detalleReserva.city} />
                      <DetalleRow icon={MapPin} label="Estado" value={detalleReserva.state} />
                    </div>
                  )}

                  <div class="bg-slate-50 rounded-xl p-4 space-y-2">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Datos de la Reserva</h3>
                    <DetalleRow icon={Hash} label="CT" value={detalleReserva.ct} />
                    <DetalleRow icon={Hash} label="ID" value={detalleReserva.id} />
                    <DetalleRow icon={Calendar} label="Fecha Reserva" value={detalleReserva.date_reserva} />
                    <DetalleRow icon={Building} label="Hotel" value={detalleReserva.hotel} />
                    <DetalleRow icon={MapPin} label="Destino" value={detalleReserva.destino} />
                    <DetalleRow icon={Calendar} label="Check-in" value={detalleReserva.checkin} />
                    <DetalleRow icon={Calendar} label="Check-out" value={detalleReserva.checkout} />
                    <DetalleRow icon={Calendar} label="Noches" value={detalleReserva.cantidad_noches} />
                    <DetalleRow icon={Bed} label="Tipo Hab." value={detalleReserva.type_room} />
                    <DetalleRow icon={Bed} label="Habitaciones" value={detalleReserva.habitaciones} />
                    <DetalleRow icon={Utensils} label="Plan Alim." value={detalleReserva.plan_alimentos} />
                    <DetalleRow icon={Star} label="Tipo" value={detalleReserva.reservation_type} />
                    <DetalleRow icon={Users} label="PAX" value={formatPax(detalleReserva.pax)} />
                  </div>

                  <div class="bg-slate-50 rounded-xl p-4 space-y-2">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Financiero</h3>
                    <DetalleRow icon={DollarSign} label="Precio Total" value={detalleReserva.precio_total ? `$${Number(detalleReserva.precio_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : null} />
                  </div>

                  {detalleReserva.ninos && detalleReserva.ninos.length > 0 && (
                    <div class="bg-slate-50 rounded-xl p-4 space-y-2">
                      <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pasajeros</h3>
                      <div class="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-sm mb-3 space-y-1">
                        <p class="font-bold text-emerald-800">Adultos: {detalleReserva.cantidad_adultos || '—'}</p>
                        <p class="text-emerald-700"><span class="font-medium">Nombre:</span> {detalleReserva.client_name}</p>
                        {detalleReserva.client_sub && <p class="text-emerald-700"><span class="font-medium">Acompañante:</span> {detalleReserva.client_sub}</p>}
                      </div>
                      <div class="space-y-2">
                        {detalleReserva.ninos.map((nino, idx) => (
                          <div key={idx} class="bg-white rounded-xl p-3 border border-slate-200 text-sm flex items-center gap-3">
                            <Users size={16} class="text-slate-400 shrink-0" />
                            <span class="text-slate-800 font-semibold">{nino.nombre}</span>
                            <span class="text-slate-300">—</span>
                            <span class="text-slate-600">{nino.edad} años</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
