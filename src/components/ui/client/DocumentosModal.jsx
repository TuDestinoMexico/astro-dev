import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, Upload, FileText, Image, File, Eye, CheckCircle2, User, Building, Hash, AlertCircle, FolderOpen, Clock, XCircle } from 'lucide-react';

const TIPOS_LABELS = {
  'pre_confirmacion': 'Pre-confirmación',
  'carta_aceptacion': 'Carta de aceptación',
  'voucher': 'Voucher',
  'terminos_condiciones': 'Términos y condiciones',
  'ine': 'INE',
  'ine_frente': 'INE frente',
  'ine_vuelta': 'INE vuelta',
  'tarjetas_club': 'Tarjetas club',
  'tarjetas_pago': 'Tarjeta de pago',
  'ingresos': 'Ingresos',
  'reserva_hotel': 'Reserva Hotel',
  'boleto_avion': 'Boleto de Avión',
  'pasaporte': 'Pasaporte',
  'visa': 'Visa',
  'seguro_viaje': 'Seguro de Viaje',
  'contrato': 'Contrato',
  'comprobante_pago': 'Comprobante de Pago',
  'itinerario': 'Itinerario',
  'otro': 'Otro',
};

const MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const TAMANO_MAXIMO = 10 * 1024 * 1024;

const ESTADO_CHECKLIST = {
  falta: { caja: 'border-slate-200 bg-white', bola: 'bg-slate-200 text-slate-500', texto: 'text-slate-400', label: 'Pendiente', icono: Clock },
  revision: { caja: 'border-amber-200 bg-amber-50', bola: 'bg-amber-500 text-white', texto: 'text-amber-600', label: 'En revisión', icono: Clock },
  verificado: { caja: 'border-emerald-200 bg-emerald-50', bola: 'bg-emerald-500 text-white', texto: 'text-emerald-600', label: 'Tú', icono: CheckCircle2 },
  rechazado: { caja: 'border-red-200 bg-red-50', bola: 'bg-red-500 text-white', texto: 'text-red-600', label: 'Rechazado', icono: XCircle },
  agente: { caja: 'border-sky-200 bg-sky-50', bola: 'bg-sky-500 text-white', texto: 'text-sky-600', label: 'Agente', icono: User },
};

function estadoDeDoc(doc) {
  if (!doc) return 'falta';
  if (doc.estado === 'rechazado') return 'rechazado';
  if (doc.origen !== 'cliente') return 'agente';
  if (doc.estado === 'pendiente') return 'revision';
  return 'verificado';
}

function estadoLista(doc) {
  if (doc.estado === 'rechazado') return { label: 'Rechazado', color: 'bg-red-100 text-red-700' };
  if (doc.origen !== 'cliente') return { label: 'Agente', color: 'bg-sky-100 text-sky-700' };
  if (doc.estado === 'pendiente') return { label: 'En revisión', color: 'bg-amber-100 text-amber-700' };
  return { label: 'Verificado', color: 'bg-emerald-100 text-emerald-700' };
}

function getFileIcon(fileType) {
  if (fileType?.startsWith('image/')) return <Image class="w-4 h-4 text-blue-500" />;
  if (fileType === 'application/pdf') return <FileText class="w-4 h-4 text-red-500" />;
  return <File class="w-4 h-4 text-slate-500" />;
}

function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let size = bytes || 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }
  return `${size.toFixed(1)} ${units[index]}`;
}

function formatFecha(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DocumentosModal({ item, user, onClose }) {
  const tipo = item.tipo;
  const codigo = tipo === 'gb' ? item.gb : item.ct;
  const email = tipo === 'gb' ? item.correo_grupo : item.correo_reserva;
  const esGrupo = tipo === 'gb';

  const [documentos, setDocumentos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [tipoDoc, setTipoDoc] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef(null);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch('/api/crm-documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, codigo, email })
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'No se pudo cargar la información.');
        setCargando(false);
        return;
      }

      setDocumentos(data.data || []);
      setTipos(data.tipos_permitidos || []);
      setTipoDoc((prev) => prev || data.tipos_permitidos?.[0] || '');
      setCargando(false);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      setCargando(false);
    }
  };

  useEffect(() => {
    if (codigo && email) cargar();
  }, [tipo, codigo, email]);

  const handleFileSelect = (selectedFile) => {
    setError('');
    if (!MIME_TYPES.includes(selectedFile.type)) {
      setError('Tipo de archivo no permitido. Usa: JPG, PNG, PDF, DOC, DOCX');
      return;
    }
    if (selectedFile.size > TAMANO_MAXIMO) {
      setError('El archivo no debe exceder los 10MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecciona un archivo.');
      return;
    }
    setSubiendo(true);
    setError('');

    const fd = new FormData();
    fd.append('tipo', tipo);
    fd.append('codigo', codigo);
    fd.append('email', email);
    fd.append('tipo_documento', tipoDoc);
    fd.append('descripcion', descripcion);
    fd.append('archivo', file);

    try {
      const res = await fetch('/api/crm-documentos-upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al subir el archivo.');
      }

      setFile(null);
      setDescripcion('');
      cargar();
    } catch (err) {
      setError(err.message || 'Error al subir el archivo.');
    } finally {
      setSubiendo(false);
    }
  };

  const handlePreview = async (doc) => {
    setError('');
    try {
      const res = await fetch('/api/crm-documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, codigo, email, documentoId: doc.id })
      });
      const data = await res.json();

      if (!data.success || !data.data?.url) {
        throw new Error(data.message || 'No se pudo obtener el archivo.');
      }

      window.open(data.data.url, '_blank');
    } catch (err) {
      setError(err.message || 'No se pudo obtener el archivo.');
    }
  };

  const detalle = item.detalles || {};
  const reservationType = detalle.reservation_type;

  return (
    <div
      class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        class="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div class="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div class="flex items-center gap-2">
            <FolderOpen size={20} class="text-purple-600" />
            <div>
              <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Documentos</h2>
              <p class="text-xs text-slate-400">
                {esGrupo ? 'Grupo' : 'Reserva'} <span class="font-bold">{codigo}</span>
                {reservationType && <span class="ml-1 font-bold">· {reservationType}</span>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          {cargando ? (
            <div class="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 size={32} class="animate-spin text-purple-500 mb-3" />
              <span class="text-xs font-bold uppercase tracking-widest">Cargando documentos...</span>
            </div>
          ) : error && documentos.length === 0 ? (
            <div class="flex flex-col items-center justify-center py-16 text-slate-400">
              <AlertCircle size={32} class="text-red-400 mb-3" />
              <p class="text-sm font-medium text-red-600 text-center">{error}</p>
              <button onClick={cargar} class="mt-4 text-xs font-bold text-slate-500 underline hover:text-slate-700">
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* CHECKLIST */}
              {tipos.length > 0 && (
                <section>
                  <div class="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} class="text-emerald-600" />
                    <h3 class="text-xs font-black uppercase tracking-widest text-slate-700">Documentos solicitados</h3>
                    <span class="text-[10px] text-slate-400 font-medium">(opcionales)</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tipos.map((t) => {
                      const estado = estadoDeDoc(documentos.find((d) => d.tipo_documento === t));
                      const estilos = ESTADO_CHECKLIST[estado];
                      const Icono = estilos.icono;
                      return (
                        <div
                          key={t}
                          class={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${estilos.caja}`}
                        >
                          <div
                            class={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${estilos.bola}`}
                          >
                            <Icono size={14} />
                          </div>
                          <span class="text-xs font-bold text-slate-700">{TIPOS_LABELS[t] || t}</span>
                          <span
                            class={`ml-auto text-[9px] font-black uppercase tracking-wider ${estilos.texto}`}
                          >
                            {estilos.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ERROR GLOBAL */}
              {error && (
                <div class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* SUBIR */}
              <section class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div class="flex items-center gap-2 mb-4">
                  <Upload size={16} class="text-purple-600" />
                  <h3 class="text-xs font-black uppercase tracking-widest text-slate-700">Subir documento</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Tipo de documento *
                    </label>
                    <select
                      value={tipoDoc}
                      onChange={(e) => setTipoDoc(e.target.value)}
                      class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      {tipos.map((t) => (
                        <option key={t} value={t}>{TIPOS_LABELS[t] || t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Ej. Frente de mi INE"
                      class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  class={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-purple-500 bg-purple-50'
                      : file
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 hover:border-purple-500/50 hover:bg-white'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    class="hidden"
                  />

                  {file ? (
                    <div class="flex items-center justify-center gap-3">
                      {getFileIcon(file.type)}
                      <div class="text-left">
                        <p class="font-bold text-slate-800 text-sm truncate max-w-[260px]">{file.name}</p>
                        <p class="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        class="p-1 text-slate-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} class="text-slate-400 mx-auto mb-2" />
                      <p class="text-sm text-slate-600">
                        Arrastra un archivo aquí o <span class="text-purple-700 font-bold">selecciona</span>
                      </p>
                      <p class="text-xs text-slate-400 mt-1">JPG, PNG, PDF, DOC, DOCX (máx. 10MB)</p>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || subiendo}
                  class="mt-4 w-full flex items-center justify-center gap-2 bg-purple-800 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-purple-900 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subiendo ? (
                    <><Loader2 size={15} class="animate-spin" /> Subiendo...</>
                  ) : (
                    <><Upload size={15} /> Subir documento</>
                  )}
                </button>
              </section>

              {/* LISTA */}
              <section>
                <div class="flex items-center gap-2 mb-3">
                  <FileText size={16} class="text-slate-500" />
                  <h3 class="text-xs font-black uppercase tracking-widest text-slate-700">Documentos cargados</h3>
                  <span class="text-[10px] text-slate-400 font-medium">({documentos.length})</span>
                </div>

                {documentos.length === 0 ? (
                  <div class="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                    <p class="text-sm text-slate-500">Aún no hay documentos cargados.</p>
                  </div>
                ) : (
                  <div class="space-y-2">
                    {documentos.map((doc) => {
                      const estado = estadoLista(doc);
                      return (
                      <div key={doc.id} class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
                        {getFileIcon(doc.file_type)}
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            <p class="font-bold text-slate-800 text-sm truncate">{doc.file_name}</p>
                            <span class="shrink-0 bg-purple-100 text-purple-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              {TIPOS_LABELS[doc.tipo_documento] || doc.tipo_documento}
                            </span>
                            <span class={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold ${estado.color}`}>
                              {estado.label}
                            </span>
                          </div>
                          <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>·</span>
                            <span>{formatFecha(doc.created_at)}</span>
                          </div>
                          {doc.descripcion && (
                            <p class="text-[11px] text-slate-400 italic mt-0.5 truncate">{doc.descripcion}</p>
                          )}
                          {doc.estado === 'rechazado' && doc.motivo_rechazo && (
                            <p class="text-[11px] text-red-500 mt-0.5">Motivo: {doc.motivo_rechazo}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handlePreview(doc)}
                          class="p-2 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all shrink-0"
                          title="Ver documento"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
