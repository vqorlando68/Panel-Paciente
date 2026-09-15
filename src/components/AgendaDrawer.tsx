import React, { useState, useEffect, useMemo } from 'react';
import { Patient, AgendaItem, AtencionProgramadaDB } from '../types';
import {
  X,
  Calendar,
  Filter,
  ArrowUpDown,
  Clock,
  MapPin,
  Bell,
  AlertTriangle,
  CheckCircle2,
  UserX,
  RefreshCw,
  User,
  Database,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { PatientService } from '../services/patientService';

interface AgendaDrawerProps {
  patient: Patient;
  onClose: () => void;
}

// Spanish month mappings for robust chronological sorting
const SPANISH_MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

function parseAppointmentDate(str: string): number {
  if (!str) return 0;
  const clean = str.trim().replace(/\s+/g, ' ');
  // Pattern: "Diciembre 23 de 2026 11:50 AM" or "Noviembre 11 de 2026 10:40 AM"
  const regex = /^([a-záéíóúñ]+)\s+(\d{1,2})\s+de\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(am|pm)?)?/i;
  const match = clean.match(regex);
  if (match) {
    const monthName = match[1].toLowerCase();
    const month = SPANISH_MONTHS[monthName] ?? 0;
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    let hours = match[4] ? parseInt(match[4], 10) : 0;
    const minutes = match[5] ? parseInt(match[5], 10) : 0;
    const ampm = match[6]?.toLowerCase();
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    return new Date(year, month, day, hours, minutes).getTime();
  }
  const parsed = Date.parse(clean);
  return isNaN(parsed) ? 0 : parsed;
}

export const AgendaDrawer: React.FC<AgendaDrawerProps> = ({ patient, onClose }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'alerts'>('agenda');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'dateTime' | 'status' | 'specialty'>('dateTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Live Database Agenda State (pkgcn_cohortes.f_atenciones_programadas)
  const [agendaItems, setAgendaItems] = useState<AtencionProgramadaDB[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Fetch agenda from Oracle endpoint
  const fetchAgenda = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PatientService.getAtencionesProgramadas(patient.id);
      if (data && data.length > 0) {
        setAgendaItems(data);
      } else if (patient.agenda && patient.agenda.length > 0) {
        // Fallback to normalized patient agenda if DB returns empty
        const fallbackList: AtencionProgramadaDB[] = patient.agenda.map((a: any, idx: number) => ({
          codigo_cita: a.codigo_cita || a.id || `CITA-${idx + 1}`,
          fecha_cita: a.fecha_cita || (a.date ? `${a.date} ${a.time || ''}`.trim() : ''),
          nombre_especialidad: a.nombre_especialidad || a.specialty || 'Medicina General',
          id_profesional: a.id_profesional || null,
          nombre_profesional: a.nombre_profesional || a.professional || 'Profesional Sin Asignar',
          url_foto_profesional: a.url_foto_profesional || null,
          estado_cita: a.estado_cita || a.status || 'Programada',
        }));
        setAgendaItems(fallbackList);
      } else {
        setAgendaItems([]);
      }
    } catch (err: any) {
      console.warn('[AgendaDrawer] Error fetching agenda:', err);
      setError('No fue posible cargar la agenda programada desde Oracle.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, [patient.id]);

  // Unique list of specialties from current items for dropdown
  const availableSpecialties = useMemo(() => {
    const set = new Set<string>();
    agendaItems.forEach((item) => {
      if (item.nombre_especialidad) {
        set.add(item.nombre_especialidad.trim());
      }
    });
    return Array.from(set).sort();
  }, [agendaItems]);

  // Filter items
  const filtered = useMemo(() => {
    let list = [...agendaItems];

    if (selectedSpecialty !== 'Todas') {
      list = list.filter(
        (item) => item.nombre_especialidad?.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    if (dateFrom) {
      const fromTs = new Date(dateFrom).setHours(0, 0, 0, 0);
      list = list.filter((item) => parseAppointmentDate(item.fecha_cita) >= fromTs);
    }

    if (dateTo) {
      const toTs = new Date(dateTo).setHours(23, 59, 59, 999);
      list = list.filter((item) => parseAppointmentDate(item.fecha_cita) <= toTs);
    }

    // Sort items
    list.sort((a, b) => {
      if (sortBy === 'dateTime') {
        const timeA = parseAppointmentDate(a.fecha_cita);
        const timeB = parseAppointmentDate(b.fecha_cita);
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      } else if (sortBy === 'status') {
        const cmp = (a.estado_cita || '').localeCompare(b.estado_cita || '');
        return sortOrder === 'asc' ? cmp : -cmp;
      } else {
        const cmp = (a.nombre_especialidad || '').localeCompare(b.nombre_especialidad || '');
        return sortOrder === 'asc' ? cmp : -cmp;
      }
    });

    return list;
  }, [agendaItems, selectedSpecialty, dateFrom, dateTo, sortBy, sortOrder]);

  const toggleSortDateTime = () => {
    if (sortBy === 'dateTime') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('dateTime');
      setSortOrder('asc');
    }
  };

  const toggleSortStatus = () => {
    if (sortBy === 'status') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('status');
      setSortOrder('asc');
    }
  };

  // Helper for status badge styling
  const getStatusBadgeClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('realizada') || s.includes('atendida') || s.includes('completada')) {
      return 'bg-[#ebfef4] dark:bg-emerald-950 text-[#01ae6c] dark:text-emerald-300 border-[#01ae6c]/30';
    }
    if (s.includes('solicitud') || s.includes('pendiente')) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/50';
    }
    if (s.includes('cancelada') || s.includes('inasistida')) {
      return 'bg-rose-50 dark:bg-rose-950 text-[#e11d48] dark:text-rose-300 border-rose-200';
    }
    return 'bg-[#effaff] dark:bg-[#00aae1]/10 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]/30';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-[#e2e8eb] dark:border-[#334155] animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shadow-inner">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">Detalle de Atenciones y Agenda</h3>
                <span className="bg-white/20 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold backdrop-blur-xs flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  f_atenciones
                </span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                {patient.nombre}
                {patient.identificacion && (
                  <span className="opacity-75 font-mono ml-1.5">({patient.identificacion})</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Tabs Bar */}
        <div className="flex border-b border-[#e2e8eb] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a]">
          <button
            type="button"
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'agenda'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#1e293b] shadow-2xs'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-[#334155]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda Programada ({agendaItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#1e293b] shadow-2xs'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-[#334155]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alertas y Novedades</span>
            {patient.alarmReasons?.length || patient.hasRehuso ? (
              <span className="w-2 h-2 rounded-full bg-[#e11d48]"></span>
            ) : null}
          </button>
        </div>

        {/* Tab 1: Agenda Programada */}
        {activeTab === 'agenda' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] dark:bg-[#0f172a]">
            {/* Filters Section */}
            <div className="bg-[#f9fafb] dark:bg-[#0f172a] p-3.5 border-b border-[#e2e8eb] dark:border-[#334155] space-y-2.5 text-xs shrink-0">
              <div className="flex items-center justify-between text-[#035476] dark:text-[#94a3b8] font-bold">
                <span className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#00aae1]" />
                  Filtros de Agenda
                </span>
                <span className="text-[11px] text-[#035476]/70 dark:text-gray-400 font-normal">
                  {filtered.length} {filtered.length === 1 ? 'atención encontrada' : 'atenciones encontradas'}
                </span>
              </div>

              {/* Filtro por Especialidad y Rango de Fechas */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1">
                    Especialidad
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-2.5 py-1.5 text-xs text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                  >
                    <option value="Todas">Todas las Especialidades</option>
                    {availableSpecialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-1.5 py-1 text-xs text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-1.5 py-1 text-xs text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de Ordenamiento y Refrescar */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleSortDateTime}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                      sortBy === 'dateTime'
                        ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]'
                        : 'bg-white dark:bg-[#1e293b] text-[#035476] dark:text-[#94a3b8] border-[#e2e8eb] dark:border-[#334155] hover:bg-gray-50'
                    }`}
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>Fecha y Hora ({sortBy === 'dateTime' ? sortOrder.toUpperCase() : 'Asc'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleSortStatus}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                      sortBy === 'status'
                        ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]'
                        : 'bg-white dark:bg-[#1e293b] text-[#035476] dark:text-[#94a3b8] border-[#e2e8eb] dark:border-[#334155] hover:bg-gray-50'
                    }`}
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>Estado ({sortBy === 'status' ? sortOrder.toUpperCase() : 'Asc'})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchAgenda}
                  disabled={loading}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#035476] dark:text-[#38bdf8] bg-white dark:bg-[#1e293b] hover:bg-[#effaff] dark:hover:bg-[#00aae1]/10 border border-[#e2e8eb] dark:border-[#334155] rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  title="Recargar agenda desde Oracle"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-[#00aae1]' : ''}`} />
                  <span>Refrescar</span>
                </button>
              </div>
            </div>

            {/* Agenda Items List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {loading ? (
                // Skeletons de Carga
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                // Estado de Error
                <div className="p-6 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl my-4">
                  <AlertTriangle className="w-7 h-7 text-rose-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-2">{error}</p>
                  <button
                    type="button"
                    onClick={fetchAgenda}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                // Estado Vacío
                <div className="p-8 text-center bg-white dark:bg-[#1e293b] border border-dashed border-gray-300 dark:border-gray-700 rounded-xl space-y-2.5">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="font-bold text-xs text-[#033d59] dark:text-[#f8fafc]">
                    No hay citas o atenciones que coincidan con los filtros
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    ID Paciente: {patient.id} (pkgcn_cohortes.f_atenciones_programadas)
                  </p>
                </div>
              ) : (
                // Tarjetas de Citas Programadas
                filtered.map((item, idx) => {
                  const hasPhoto = Boolean(item.url_foto_profesional && !imgErrors[item.codigo_cita || idx]);
                  const isUnassigned =
                    !item.nombre_profesional ||
                    item.nombre_profesional.toLowerCase().includes('sin asignar');

                  return (
                    <div
                      key={item.codigo_cita || idx}
                      className="p-3.5 bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-xl hover:border-[#00aae1] transition-all space-y-2.5 shadow-2xs hover:shadow-xs group"
                    >
                      {/* Fila Superior: Especialidad + Código + Estado */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-bold text-xs text-[#033d59] dark:text-[#f8fafc] group-hover:text-[#00aae1] transition-colors truncate">
                            {item.nombre_especialidad}
                          </h4>
                          {item.codigo_cita && (
                            <span className="font-mono text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded shrink-0">
                              #{item.codigo_cita}
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getStatusBadgeClass(
                            item.estado_cita
                          )}`}
                        >
                          {item.estado_cita || 'Programada'}
                        </span>
                      </div>

                      {/* Fecha y Hora */}
                      <div className="flex items-center gap-3 text-xs font-mono text-[#035476] dark:text-[#94a3b8]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#00aae1] shrink-0" />
                          <span>{item.fecha_cita}</span>
                        </span>
                      </div>

                      {/* Profesional Asignado con Foto / Avatar */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {hasPhoto ? (
                            <img
                              src={item.url_foto_profesional!}
                              alt={item.nombre_profesional}
                              className="w-6 h-6 rounded-full object-cover border border-[#00aae1]/40 shrink-0"
                              onError={() =>
                                setImgErrors((prev) => ({ ...prev, [item.codigo_cita || idx]: true }))
                              }
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span
                            className={`text-xs truncate ${
                              isUnassigned
                                ? 'text-gray-400 dark:text-gray-500 italic'
                                : 'text-[#033d59] dark:text-[#f8fafc] font-medium'
                            }`}
                          >
                            {item.nombre_profesional || 'Profesional Sin Asignar'}
                          </span>
                        </div>

                        {item.id_profesional && (
                          <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 shrink-0">
                            ID: {item.id_profesional}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Alertas y Novedades */}
        {activeTab === 'alerts' && (
          <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-[#033d59] dark:text-[#f8fafc]">
            {patient.hasAlarm && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Alertas de Incumplimiento Activas</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  {patient.alarmReasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {patient.hasRehuso && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2 text-rose-900 dark:text-rose-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <UserX className="w-4 h-4 text-rose-600" />
                  <span>Novedad de Rehúso Registrada</span>
                </div>
                <p className="text-xs">
                  El paciente presenta rehúso explícito registrado en atención especializada. Se sugiere revisar informe en el acta del comité.
                </p>
              </div>
            )}

            {!patient.hasAlarm && !patient.hasRehuso && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#01ae6c] mx-auto" />
                <p className="font-bold text-sm">Sin Novedades Críticas</p>
                <p className="text-xs">El paciente se encuentra al día en sus controles de seguimiento.</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 dark:bg-[#0f172a] border-t border-[#e2e8eb] dark:border-[#334155] flex items-center justify-between">
          <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
            pkgcn_cohortes.f_atenciones_programadas({patient.id})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
