import React, { useEffect, useState } from 'react';
import { Wallet, Loader2, AlertCircle, Landmark, CreditCard, Receipt, CalendarDays, CheckCircle2, Clock, Hash, Building2, TrendingUp, Users, ExternalLink } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

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

const formatMonto = (value) => {
  const n = Number(value);
  if (isNaN(n)) return value;
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
};

const formatMontoCompacto = (value) => {
  const n = Number(value);
  if (isNaN(n)) return value;

  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `$${(n / 1_000_000).toLocaleString('es-MX', { maximumFractionDigits: 1 })} M MXN`;
  }

  if (abs >= 1_000) {
    return `$${(n / 1_000).toLocaleString('es-MX', { maximumFractionDigits: 1 })} mil MXN`;
  }

  return formatMonto(n);
};

const formatFirestoreFecha = (value) => {
  const date = value?.toDate?.();
  return date ? formatFecha(date.toISOString()) : null;
};

const openpayMethodLabel = (method) => {
  if (method === 'card') return 'Tarjeta';
  if (method === 'store') return 'Tienda de conveniencia';
  if (method === 'bank_account') return 'Transferencia bancaria';
  return method || 'Openpay';
};

const openpayStatusLabel = (status) => {
  if (status === 'completed') return 'Completado';
  if (status === 'failed') return 'Fallido';
  if (status === 'cancelled') return 'Cancelado';
  return 'Pendiente';
};

function OpenpayHistory({ user }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!user) {
      setPayments([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const paymentsQuery = query(
      collection(db, 'users', user.uid, 'pagos'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      setPayments(snapshot.docs.map((paymentDoc) => ({ id: paymentDoc.id, ...paymentDoc.data() })));
      setError('');
      setLoading(false);
    }, (snapshotError) => {
      console.error('Error leyendo historial Openpay:', snapshotError);
      setError('No se pudo cargar el historial de vouchers.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, retryKey]);

  return (
    <section class="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-indigo-100 bg-indigo-50/60 flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={16} /> Historial de vouchers Openpay
          </h3>
          <p class="text-xs text-indigo-700/70 mt-1">Cargos generados desde tu cuenta, independientes de reservas CT o GB.</p>
        </div>
        {payments.length > 0 && <span class="text-xs font-black text-indigo-700">{payments.length}</span>}
      </div>

      {loading ? (
        <div role="status" aria-live="polite" aria-atomic="true" class="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
          <Loader2 size={18} class="animate-spin" /> Cargando vouchers...
        </div>
      ) : error ? (
        <div role="alert" aria-live="assertive" class="flex flex-col items-center justify-center gap-2 py-8 text-red-600 text-sm">
          <AlertCircle size={18} /> {error}
          <button type="button" onClick={() => setRetryKey((key) => key + 1)} class="text-xs font-bold text-slate-500 underline hover:text-slate-700">
            Reintentar
          </button>
        </div>
      ) : payments.length === 0 ? (
        <div role="status" aria-live="polite" class="py-8 px-6 text-center text-sm text-slate-400">Todavía no tienes vouchers Openpay.</div>
      ) : (
        <div class="divide-y divide-slate-100">
          {payments.map((payment) => {
            const voucher = payment.voucher || {};
            const voucherUrl = voucher.url || voucher.url_spei;
            const reference = voucher.reference || voucher.name;
            const status = payment.status || 'pending';
            const isCompleted = status === 'completed';

            return (
              <article key={payment.id} class="px-6 py-5 space-y-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-black text-slate-800">{payment.description}</p>
                    <p class="text-xs text-slate-400 mt-1">
                      {openpayMethodLabel(payment.method)} · {formatFirestoreFecha(payment.createdAt) || 'Fecha pendiente'}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-base font-black text-slate-800">{formatMonto(payment.amount)}</p>
                    <span class={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border mt-1 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : status === 'failed' || status === 'cancelled'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      {openpayStatusLabel(status)}
                    </span>
                  </div>
                </div>

                {reference && (
                  <div class="bg-slate-50 rounded-xl px-4 py-3">
                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Referencia</p>
                    <p class="font-mono font-bold text-slate-800 mt-1 break-all">{reference}</p>
                  </div>
                )}

                <div class="flex flex-wrap items-center gap-3">
                  {voucher.barcode_url && (
                    <img src={voucher.barcode_url} alt="Código de barras del voucher" class="h-12 w-auto border border-slate-200 rounded-lg p-1" />
                  )}
                  {voucherUrl && (
                    <a href={voucherUrl} target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                      <ExternalLink size={14} /> Ver voucher
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const methodIcon = (metodo) => {
  const m = (metodo || '').toLowerCase();
  if (m === 'openpay') return CreditCard;
  return Landmark;
};

const methodLabel = (metodo) => {
  const m = (metodo || '').toLowerCase();
  if (m === 'openpay') return 'Pago con tarjeta de débito y crédito';
  if (!metodo) return 'Pago';
  return metodo.charAt(0).toUpperCase() + metodo.slice(1);
};

const mergeLists = (a, b) => {
  return [...a, ...b].sort((x, y) => {
    const tx = x.fechaVinculacion?.toDate?.()?.getTime?.() || 0;
    const ty = y.fechaVinculacion?.toDate?.()?.getTime?.() || 0;
    return ty - tx;
  });
};

export default function ClientPagos({ user }) {
  const [vinculadas, setVinculadas] = useState([]);
  const [activo, setActivo] = useState(null);
  const [pagos, setPagos] = useState(null);
  const [loadingVinculadas, setLoadingVinculadas] = useState(true);
  const [vinculadasError, setVinculadasError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [paymentsRetryKey, setPaymentsRetryKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoadingVinculadas(true);
    setVinculadasError('');
    const qReservas = query(
      collection(db, 'users', user.uid, 'reservas'),
      orderBy('fechaVinculacion', 'desc')
    );
    const qGrupos = query(
      collection(db, 'users', user.uid, 'grupos'),
      orderBy('fechaVinculacion', 'desc')
    );
    const unsubReservas = onSnapshot(qReservas, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, tipo: 'ct', codigo: doc.data().ct, ...doc.data() }));
      setVinculadas((prev) => mergeLists(lista, prev.filter((p) => p.tipo === 'gb')));
      setLoadingVinculadas(false);
    }, () => {
      setVinculadasError('No se pudieron cargar tus reservas vinculadas.');
      setLoadingVinculadas(false);
    });
    const unsubGrupos = onSnapshot(qGrupos, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, tipo: 'gb', codigo: doc.data().gb, ...doc.data() }));
      setVinculadas((prev) => mergeLists(prev.filter((p) => p.tipo === 'ct'), lista));
      setLoadingVinculadas(false);
    }, () => {
      setVinculadasError('No se pudieron cargar tus grupos vinculados.');
      setLoadingVinculadas(false);
    });
    return () => {
      unsubReservas();
      unsubGrupos();
    };
  }, [user, retryKey]);

  useEffect(() => {
    if (vinculadas.length === 0) {
      setActivo(null);
      return;
    }
    setActivo((prev) => prev || { tipo: vinculadas[0].tipo, codigo: vinculadas[0].codigo });
  }, [vinculadas]);

  useEffect(() => {
    if (!activo || !activo.codigo) {
      setPagos(null);
      return;
    }
    let activoFlag = true;
    const load = async () => {
      setCargando(true);
      setError('');
      try {
        const endpoint = activo.tipo === 'gb' ? '/api/crm-grupo-pagos' : '/api/crm-pagos';
        const body = activo.tipo === 'gb' ? { gb: activo.codigo } : { ct: activo.codigo };
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!activoFlag) return;
        if (!data.success) {
          setError(data.message || 'No se encontraron pagos.');
          setPagos(null);
        } else {
          setPagos(data.data);
        }
      } catch (e) {
        if (activoFlag) {
          setError('Error de conexión. Intenta de nuevo.');
          setPagos(null);
        }
      }
      if (activoFlag) setCargando(false);
    };
    load();
    return () => { activoFlag = false; };
  }, [activo, paymentsRetryKey]);

  return (
    <div class="space-y-6 w-full">
      <div>
        <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Wallet class="text-amber-600" size={28} />
          Mis Pagos
        </h2>
        <p class="text-sm text-slate-500 mt-1">Historial de abonos de tus reservas y grupos vinculados</p>
      </div>

      <OpenpayHistory user={user} />

      {loadingVinculadas ? (
        <div role="status" aria-live="polite" aria-atomic="true" class="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 size={32} class="animate-spin text-amber-500 mb-3" />
          <span class="text-xs font-bold uppercase tracking-widest">Cargando reservas y grupos...</span>
        </div>
      ) : vinculadasError ? (
        <div role="alert" aria-live="assertive" class="flex flex-col items-center justify-center py-16 text-center">
          <p class="text-sm font-medium text-red-600">{vinculadasError}</p>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)} class="mt-4 text-xs font-bold text-slate-500 underline hover:text-slate-700">
            Reintentar
          </button>
        </div>
      ) : vinculadas.length === 0 ? (
        <div role="status" aria-live="polite" class="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
          <Wallet size={40} class="text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500 font-medium">No tienes reservas ni grupos vinculados.</p>
          <p class="text-sm text-slate-400 mt-1">Vincula una reserva o grupo desde "Mis Reservas" para ver sus pagos.</p>
        </div>
      ) : (
        <>
          <div class="flex flex-wrap gap-2">
            {vinculadas.map((r) => {
              const esGrupo = r.tipo === 'gb';
              const esActivo = activo?.tipo === r.tipo && activo?.codigo === r.codigo;
              return (
                <button
                  key={r.id}
                  onClick={() => setActivo({ tipo: r.tipo, codigo: r.codigo })}
                  class={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                    esActivo
                      ? esGrupo
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg'
                        : 'bg-amber-600 text-white border-amber-600 shadow-lg'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700'
                  }`}
                >
                  {esGrupo ? <Users size={12} /> : <Hash size={12} />} {esGrupo ? r.gb : r.ct}
                </button>
              );
            })}
          </div>

          {cargando && (
            <div class="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 size={32} class="animate-spin text-amber-500 mb-3" />
              <span class="text-xs font-bold uppercase tracking-widest">Cargando pagos...</span>
            </div>
          )}

          {error && (
            <div role="alert" aria-live="assertive" class="flex flex-col items-center justify-center py-16 text-slate-400">
              <AlertCircle size={32} class="text-red-400 mb-3" />
              <p class="text-sm font-medium text-red-600">{error}</p>
              <button type="button" onClick={() => setPaymentsRetryKey((key) => key + 1)} class="mt-4 text-xs font-bold text-slate-500 underline hover:text-slate-700">
                Reintentar
              </button>
            </div>
          )}

          {pagos && !cargando && (
            <div class="space-y-5">
              {pagos.length === 0 ? (
                <div role="status" aria-live="polite" class="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                  <Receipt size={40} class="text-slate-300 mx-auto mb-3" />
                  <p class="text-slate-500 font-medium">Sin pagos registrados para este CT.</p>
                </div>
              ) : (
                pagos.map((pago) => {
                  const abonos = pago.abonos || [];
                  const pagado = abonos.reduce((acc, a) => acc + (Number(a.cantidad) || 0), 0);
                  const total = Number(pago.precio_total) || 0;
                  const saldo = Math.max(total - pagado, 0);
                  const pct = total > 0 ? Math.min((pagado / total) * 100, 100) : 0;
                  const liquidado = pct >= 99.99;
                  return (
                    <div key={pago.id} class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div class="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                              <Building2 size={18} />
                            </div>
                            <p class="text-sm font-black text-slate-800 uppercase tracking-wide">
                              {activo?.tipo === 'gb' ? `GB ${pago.gb || activo.codigo}` : `CT ${pago.ct || activo.codigo}`}
                            </p>
                          </div>
                        <div class="flex flex-col items-end gap-1">
                          <span class={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                            liquidado
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {liquidado ? <CheckCircle2 size={12} /> : <Clock size={12} />} {liquidado ? 'Liquidado' : 'Pago pendiente'}
                          </span>
                          {!liquidado && (
                            <p class="text-[10px] font-medium text-amber-600 text-right">
                              Falta por cubrir <span class="font-black">{formatMonto(saldo)}</span> de {formatMonto(total)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div class="px-6 pt-4">
                        <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <div class="flex justify-between mt-2 text-[11px] text-slate-400 font-medium">
                          <span>{Math.round(pct)}% abonado</span>
                          <span>{abonos.length} abono{abonos.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div class="px-6 py-4 grid grid-cols-1 min-[390px]:grid-cols-2 sm:grid-cols-3 gap-3">
                        <div class="bg-emerald-50 rounded-xl p-3 text-center">
                          <p class="text-[9px] font-black uppercase tracking-widest leading-tight text-emerald-600">Pagado</p>
                          <p
                            class="text-xs sm:text-sm font-black leading-tight text-emerald-700 whitespace-nowrap"
                            title={formatMonto(pagado)}
                            aria-label={`Pagado: ${formatMonto(pagado)}`}
                          >
                            {formatMontoCompacto(pagado)}
                          </p>
                        </div>
                        <div class="bg-slate-50 rounded-xl p-3 text-center">
                          <p class="text-[9px] font-black uppercase tracking-widest leading-tight text-slate-400">Precio Total</p>
                          <p
                            class="text-xs sm:text-sm font-black leading-tight text-slate-700 whitespace-nowrap"
                            title={formatMonto(total)}
                            aria-label={`Precio total: ${formatMonto(total)}`}
                          >
                            {formatMontoCompacto(total)}
                          </p>
                        </div>
                        <div class={`rounded-xl p-3 text-center ${saldo > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                          <p class="text-[9px] font-black uppercase tracking-widest leading-tight text-slate-400">Saldo</p>
                          <p
                            class={`text-xs sm:text-sm font-black leading-tight whitespace-nowrap ${saldo > 0 ? 'text-amber-700' : 'text-emerald-700'}`}
                            title={formatMonto(saldo)}
                            aria-label={`Saldo: ${formatMonto(saldo)}`}
                          >
                            {formatMontoCompacto(saldo)}
                          </p>
                        </div>
                      </div>

                      <div class="px-6 pb-5">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                          <TrendingUp size={12} /> Abonos
                        </p>
                        {abonos.length === 0 ? (
                          <div class="bg-slate-50 rounded-xl p-4 text-center text-sm text-slate-400">Sin abonos registrados</div>
                        ) : (
                          <div class="space-y-2">
                            {abonos.map((a, i) => {
                              const Icon = methodIcon(a.tipo_pago?.metodo_pago);
                              return (
                                <div key={i} class="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                  <div class="w-9 h-9 rounded-lg bg-white border border-slate-200 text-amber-600 flex items-center justify-center shrink-0">
                                    <Icon size={16} />
                                  </div>
                                  <div class="min-w-0 flex-1">
                                    <p class="text-sm font-bold text-slate-800">{methodLabel(a.tipo_pago?.metodo_pago)}</p>
                                    <p class="text-[11px] text-slate-400 flex items-center gap-1">
                                      <CalendarDays size={11} /> {formatFecha(a.fecha_abono)}
                                      {a.tipo_pago?.referencia ? ` · ${a.tipo_pago.referencia}` : ''}
                                    </p>
                                  </div>
                                  <p class="text-sm font-black text-slate-800 shrink-0">{formatMonto(a.cantidad)}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
