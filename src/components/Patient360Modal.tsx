import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Patient } from '../types';
import { Patient360FullPayload } from '../types360';
import { PatientService } from '../services/patientService';
import {
  X,
  RefreshCw,
  Compass,
  AlertTriangle,
  Heart,
  Activity,
  Calendar,
  MessageSquare,
  DollarSign,
  ClipboardList,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Phone,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Patient360ModalProps {
  patient: Patient | null;
  onClose: () => void;
}

type TabType =
  | 'consultas'
  | 'vitales'
  | 'engagement'
  | 'visitas'
  | 'costos'
  | 'encuestas'
  | 'completitud';

export const Patient360Modal: React.FC<Patient360ModalProps> = ({ patient, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('consultas');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Patient360FullPayload | null>(null);
  const [costSearch, setCostSearch] = useState('');
  const [visitStatusFilter, setVisitStatusFilter] = useState('Todos');
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth'
      });
    }
  };

  const handleTabClick = (tab: TabType, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tab);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  };

  const loadData = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const payload = await PatientService.getPatient360All(patient.identificacion);
      setData(payload);
    } catch (err) {
      console.error('Error loading 360 data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patient) {
      loadData();
    }
  }, [patient?.id, patient?.identificacion]);

  if (!patient) return null;

  const cleanIdentificacion = String(patient.identificacion || '').replace(/\D/g, '') || patient.identificacion;

  // Key Quick Metrics
  const riskLevel = data?.cambiosClave?.nivel_riesgo?.actual ?? patient.riesgo ?? 'N/A';
  const adherenciaHist = data?.consultas?.adherencia_historica;
  const nAtendidas = adherenciaHist?.n_atendidas ?? patient.adherencia?.realizadas;
  const nRecomendadas = adherenciaHist?.n_recomendadas ?? patient.adherencia?.recomendadas;
  const adherenciaPct = adherenciaHist?.porcentaje ?? (
    nRecomendadas && nAtendidas !== undefined
      ? Math.round((nAtendidas / nRecomendadas) * 100)
      : patient.adherencia?.porcentaje
  );
  const totalCost = data?.cost?.costo_total;
  const activeAlerts = data?.consultas?.alertas || [];
  const totalMessages = data?.engagement?.n_mensajes_total;
  const daysWithoutContact = data?.consultas?.dias_sin_contacto;

  // Format currency
  const formatCOP = (val?: number) => {
    if (val === undefined || val === null) return '$0';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  // Build aggregated specialty list with full status breakdown
  const specialtyCards = useMemo(() => {
    const summary = data?.visits?.specialty_summary || [];
    const visits = data?.visits?.visits || [];

    const map = new Map<string, {
      especialidad: string;
      visitas_atendidas: number;
      ultima_fecha: string;
      total: number;
      statusCounts: Record<string, number>;
    }>();

    // 1. Seed from summary
    summary.forEach((s) => {
      const key = s.especialidad.trim().toLowerCase();
      map.set(key, {
        especialidad: s.especialidad.trim(),
        visitas_atendidas: s.visitas_atendidas || 0,
        ultima_fecha: s.ultima_fecha || '',
        total: s.visitas_atendidas || 0,
        statusCounts: s.visitas_atendidas ? { 'Atendida': s.visitas_atendidas } : {}
      });
    });

    // 2. Scan full visits list to aggregate exact counts per status and latest date
    visits.forEach((v) => {
      if (!v.especialidad) return;
      const key = v.especialidad.trim().toLowerCase();
      const existing = map.get(key) || {
        especialidad: v.especialidad.trim(),
        visitas_atendidas: 0,
        ultima_fecha: v.fecha || '',
        total: 0,
        statusCounts: {}
      };

      const status = (v.estado || 'Sin Estado').trim();
      existing.statusCounts[status] = (existing.statusCounts[status] || 0) + 1;
      existing.total = Object.values(existing.statusCounts).reduce((a, b) => a + b, 0);

      if (status.toLowerCase().includes('atendid')) {
        if (!map.has(key)) {
          existing.visitas_atendidas += 1;
        }
      }

      if (v.fecha) {
        if (!existing.ultima_fecha || new Date(v.fecha) > new Date(existing.ultima_fecha)) {
          existing.ultima_fecha = v.fecha;
        }
      }

      map.set(key, existing);
    });

    return Array.from(map.values());
  }, [data?.visits]);

  // Unique visit statuses for filtering
  const availableVisitStatuses = useMemo(() => {
    const set = new Set<string>();
    (data?.visits?.visits || []).forEach((v) => {
      if (v.estado) set.add(v.estado.trim());
    });
    return Array.from(set);
  }, [data?.visits?.visits]);

  // Status badge styling helper
  const getVisitStatusBadgeClass = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('atendid')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70';
    }
    if (s.includes('cancel')) {
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/70';
    }
    if (s.includes('reprogram')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/70';
    }
    if (s.includes('programad')) {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/70';
    }
    if (s.includes('no asist') || s.includes('inasist')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70';
    }
    if (s.includes('comit')) {
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/70';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[90vh] max-h-[92vh] flex flex-col bg-white dark:bg-[#0b1329] border border-[#d0e5f2] dark:border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r from-[#003b5c] via-[#02567a] to-[#007ba8] text-white border-b border-cyan-800/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-cyan-200 shadow-inner">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {patient.nombre || `${patient.nombres || ''} ${patient.apellidos || ''}`.trim()}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
                  Visión 360° Coordinador
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-cyan-100/80 mt-0.5">
                <span className="font-mono">Doc: <strong className="text-white">{cleanIdentificacion}</strong></span>
                <span>•</span>
                <span>Convenio: <strong className="text-white">{patient.convenioNombre || 'Sin Convenio'}</strong></span>
                <span>•</span>
                <span>Cohorte: <strong className="text-white">{patient.cohorte || 'General'}</strong></span>
                <span>•</span>
                <span>Estado: <strong className="text-emerald-300">{data?.status?.current_status || patient.estado || 'Activo'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={loadData}
              disabled={loading}
              title="Actualizar datos desde BigQuery / Oracle"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/15 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-300' : ''}`} />
              <span>{loading ? 'Consultando...' : 'Sincronizar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUICK KPI HIGHLIGHT BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 px-6 py-2.5 bg-[#f8fafc] dark:bg-[#0e172e] border-b border-[#e2e8eb] dark:border-[#1e293b] shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131f3d] border border-gray-200/80 dark:border-gray-800">
            <Activity className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Nivel Riesgo</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Riesgo {riskLevel}</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131f3d] border border-gray-200/80 dark:border-gray-800"
            title={`Adherencia: ${adherenciaPct !== undefined ? `${adherenciaPct}%` : '100%'}${nAtendidas !== undefined && nRecomendadas !== undefined ? ` (${nAtendidas} atendidas de ${nRecomendadas} recomendadas)` : ''}`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Adherencia</p>
              <div className="flex items-baseline gap-1 truncate">
                <span className={`text-xs font-bold ${
                  adherenciaPct !== undefined && adherenciaPct < 50
                    ? 'text-rose-600 dark:text-rose-400'
                    : adherenciaPct !== undefined && adherenciaPct < 80
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {adherenciaPct !== undefined ? `${adherenciaPct}%` : '100%'}
                </span>
                {nAtendidas !== undefined && nRecomendadas !== undefined && (
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    ({nAtendidas}/{nRecomendadas})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131f3d] border border-gray-200/80 dark:border-gray-800">
            <MessageSquare className="w-4 h-4 text-[#00aae1] shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Mensajes Totales</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{totalMessages ?? 0} chats</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131f3d] border border-gray-200/80 dark:border-gray-800">
            <Clock className="w-4 h-4 text-purple-500 shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Sin Contacto</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {daysWithoutContact !== null && daysWithoutContact !== undefined ? `${daysWithoutContact} días` : 'Al día'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131f3d] border border-gray-200/80 dark:border-gray-800">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Costo Total</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate" title={formatCOP(totalCost)}>
                {formatCOP(totalCost)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131f3d] border border-gray-200/80 dark:border-gray-800">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${activeAlerts.length > 0 ? 'text-rose-500' : 'text-gray-400'}`} />
            <div className="truncate">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Alertas Activas</p>
              <p className={`text-xs font-bold ${activeAlerts.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                {activeAlerts.length} alerta{activeAlerts.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS WITH HORIZONTAL SCROLL CONTROLS */}
        <div className="relative flex items-center border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#0e172e] shrink-0">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="p-2 h-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800/80 border-r border-gray-200 dark:border-gray-800 transition-colors z-10 shrink-0 flex items-center justify-center cursor-pointer"
            title="Ver pestañas anteriores"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tabs */}
          <div
            ref={tabsContainerRef}
            className="flex-1 flex items-center gap-1 px-3 overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
          >
            <button
              onClick={(e) => handleTabClick('consultas', e)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'consultas'
                  ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#131f3d]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Consultas & Adherencia</span>
              {activeAlerts.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-black">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            <button
              onClick={(e) => handleTabClick('vitales', e)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'vitales'
                  ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#131f3d]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Vitales & Riesgo</span>
            </button>

            <button
              onClick={(e) => handleTabClick('engagement', e)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'engagement'
                  ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#131f3d]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contactos & Engagement</span>
            </button>

            <button
              onClick={(e) => handleTabClick('visitas', e)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'visitas'
                  ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#131f3d]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Citas & Especialidades</span>
            </button>

            <button
              onClick={(e) => handleTabClick('costos', e)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'costos'
                  ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#131f3d]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Costos de Salud</span>
            </button>

            <button
              onClick={(e) => handleTabClick('encuestas', e)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'encuestas'
                  ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#131f3d]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Encuestas & Percepción</span>
            </button>

            <button
              onClick={(e) => handleTabClick('completitud', e)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'completitud'
                  ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#131f3d]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Estado & Completitud</span>
            </button>
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="p-2 h-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800/80 border-l border-gray-200 dark:border-gray-800 transition-colors z-10 shrink-0 flex items-center justify-center cursor-pointer"
            title="Ver pestañas siguientes"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-white dark:bg-[#0b1329] text-gray-800 dark:text-gray-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-[#00aae1]/20 border-t-[#00aae1] animate-spin" />
                <Compass className="w-6 h-6 text-[#00aae1] absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Consultando base de datos BigQuery vía Oracle...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Invocando pkgln_big_query.p_datos_usuario_cohorte para cédula {cleanIdentificacion}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: CONSULTAS & ADHERENCIA */}
              {activeTab === 'consultas' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Coordinator, Adherence & Appointments Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs mb-1 uppercase tracking-wider">
                        <User className="w-4 h-4" />
                        Coordinador Asignado
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {data?.consultas?.coordinador_asignado || patient.coordinador || 'No asignado'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Responsable directo del plan
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-1 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Adherencia
                        </div>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {adherenciaPct !== undefined ? `${adherenciaPct}%` : '100%'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-gray-600 dark:text-gray-300">
                          Atendidas: <strong className="text-emerald-700 dark:text-emerald-300 font-bold font-mono">{nAtendidas ?? 0}</strong>
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          Recomendadas: <strong className="text-gray-800 dark:text-gray-200 font-bold font-mono">{nRecomendadas ?? 0}</strong>
                        </span>
                      </div>
                      <div className="w-full bg-emerald-200/60 dark:bg-emerald-950 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, adherenciaPct ?? 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Última Cita Atendida
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {data?.consultas?.ultima_cita_atendida?.especialidad || 'Sin registro'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {data?.consultas?.ultima_cita_atendida?.fecha
                          ? new Date(data.consultas.ultima_cita_atendida.fecha).toLocaleDateString('es-CO', {
                              dateStyle: 'long',
                            })
                          : 'No registra fecha'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/70 dark:border-cyan-900/40">
                      <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-bold text-xs mb-1 uppercase tracking-wider">
                        <Calendar className="w-4 h-4" />
                        Próxima Cita Programada
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {data?.consultas?.proxima_cita?.especialidad || 'Sin cita agendada'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {data?.consultas?.proxima_cita?.fecha
                          ? new Date(data.consultas.proxima_cita.fecha).toLocaleDateString('es-CO', {
                              dateStyle: 'long',
                            })
                          : 'Pendiente de agendamiento'}
                      </p>
                    </div>
                  </div>

                  {/* Operational Note */}
                  {data?.consultas?.nota_operativa_reciente?.nota && (
                    <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Nota Operativa de Coordinación
                        </span>
                        {data.consultas.nota_operativa_reciente.fecha_nota && (
                          <span className="text-[11px] text-gray-500">
                            {new Date(data.consultas.nota_operativa_reciente.fecha_nota).toLocaleDateString('es-CO')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium bg-white/70 dark:bg-black/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                        "{data.consultas.nota_operativa_reciente.nota}"
                      </p>
                    </div>
                  )}

                  {/* Alerts List */}
                  {activeAlerts.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        Alertas Detectadas por el Sistema ({activeAlerts.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                        {activeAlerts.map((al, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex items-start gap-3 ${
                              al.severidad === 'alta'
                                ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                                : al.severidad === 'media'
                                ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                                : 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200'
                            }`}
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 mt-0.5 ${
                                al.severidad === 'alta'
                                  ? 'bg-rose-500 text-white'
                                  : al.severidad === 'media'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              {al.severidad}
                            </span>
                            <p className="text-xs font-medium leading-tight">{al.mensaje}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Non-attended specialties */}
                  {data?.consultas?.especialidades_incumplidas && data.consultas.especialidades_incumplidas.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Especialidades con Inasistencias o Incumplimiento
                      </h3>
                      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-y-auto shadow-2xs max-h-60">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                            <tr>
                              <th className="px-4 py-2">Especialidad</th>
                              <th className="px-4 py-2 text-center">Atendidas</th>
                              <th className="px-4 py-2 text-center">No Asistidas</th>
                              <th className="px-4 py-2 text-center">Tasa Incumplimiento</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {data.consultas.especialidades_incumplidas.map((esp, i) => (
                              <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-gray-100">
                                  {esp.especialidad}
                                </td>
                                <td className="px-4 py-2.5 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                  {esp.atendidas}
                                </td>
                                <td className="px-4 py-2.5 text-center font-mono text-rose-600 dark:text-rose-400 font-bold">
                                  {esp.no_asistidas_por_paciente}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                                    {Math.round(esp.ratio_incumplimiento * 100)}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: VITALES & RIESGO */}
              {activeTab === 'vitales' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Risk card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/40">
                      <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-600" />
                        Nivel de Riesgo Clínico
                      </h3>
                      <div className="flex items-baseline gap-3 my-2">
                        <span className="text-4xl font-black text-amber-600 dark:text-amber-400">
                          {data?.cambiosClave?.nivel_riesgo?.actual ?? riskLevel}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {riskLevel === 1 ? 'Riesgo Controlado / Bajo' : riskLevel === 2 ? 'Riesgo Medio' : 'Riesgo Alto / Crítico'}
                        </span>
                      </div>
                      {data?.cambiosClave?.nivel_riesgo?.cambio_reciente && (
                        <div className="mt-3 text-xs p-2.5 rounded-lg bg-white/70 dark:bg-black/30 border border-amber-200/60 text-gray-700 dark:text-gray-300">
                          Cambio de nivel: de {data.cambiosClave.nivel_riesgo.cambio_reciente.de} a {data.cambiosClave.nivel_riesgo.cambio_reciente.a} el{' '}
                          {new Date(data.cambiosClave.nivel_riesgo.cambio_reciente.fecha).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Vitals card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200 dark:border-cyan-900/40">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                          <Heart className="w-4 h-4 text-cyan-600" />
                          Signos Vitales Recientes
                        </h3>
                        {data?.cambiosClave?.vitales_recientes?.fecha && (
                          <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono">
                            {new Date(data.cambiosClave.vitales_recientes.fecha).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="p-3 bg-white dark:bg-[#131f3d] rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                          <p className="text-[10px] text-gray-500 font-semibold uppercase">Presión Arterial</p>
                          <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                            {data?.cambiosClave?.vitales_recientes?.presion_arterial || '120/80'}
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-[#131f3d] rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                          <p className="text-[10px] text-gray-500 font-semibold uppercase">Glucosa / Nivel Azúcar</p>
                          <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                            {data?.cambiosClave?.vitales_recientes?.nivel_azucar || '95 mg/dL'}
                          </p>
                        </div>
                        {data?.cambiosClave?.vitales_recientes?.hba1c && (
                          <div className="p-3 bg-white dark:bg-[#131f3d] rounded-xl border border-cyan-100 dark:border-cyan-900/30 col-span-2">
                            <p className="text-[10px] text-gray-500 font-semibold uppercase">HbA1c (Hemoglobina Glicada)</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                              {data.cambiosClave.vitales_recientes.hba1c}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACTOS & ENGAGEMENT */}
              {activeTab === 'engagement' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Total Interacciones</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                        {data?.engagement?.n_mensajes_total ?? 0}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Mensajes vía WhatsApp/SMS</p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Enviados (Outbound)</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {data?.engagement?.por_direccion?.outbound ?? 0}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Comunicaciones del equipo</p>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
                      <p className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">Recibidos (Inbound)</p>
                      <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                        {data?.engagement?.por_direccion?.inbound ?? 0}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Respuestas del paciente</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#00aae1]" />
                      Historial Cronológico de Mensajes Recientes ({data?.engagement?.mensajes_recientes?.length || 0})
                    </h3>
                    {data?.engagement?.mensajes_recientes && data.engagement.mensajes_recientes.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl overflow-y-auto max-h-[380px] pr-1">
                        {data.engagement.mensajes_recientes.map((msg, i) => (
                          <div key={i} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  msg.direction === 'inbound'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                }`}
                              >
                                {msg.direction === 'inbound' ? 'Paciente' : 'Coordinación'}
                              </span>
                              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                Canal: {msg.tipo || 'WhatsApp'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                              <span>Estado: {msg.estado || 'Entregado'}</span>
                              <span>{new Date(msg.fecha).toLocaleString('es-CO')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed rounded-xl">
                        No se registran interacciones en mensajería para este paciente.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: VISITAS & ESPECIALIDADES */}
              {activeTab === 'visitas' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Specialty summary cards with status breakdown */}
                  {specialtyCards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                      {specialtyCards.map((sp, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-white dark:bg-[#131f3d] border border-gray-200/90 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:border-[#00aae1]/50 transition-all"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-gray-900 dark:text-white truncate" title={sp.especialidad}>
                                {sp.especialidad}
                              </p>
                              <span className="text-[11px] font-black text-[#00aae1] dark:text-[#38bdf8] bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800/60 shrink-0">
                                {sp.total} {sp.total === 1 ? 'cita' : 'citas'}
                              </span>
                            </div>
                            {sp.ultima_fecha && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                Última: {new Date(sp.ultima_fecha).toLocaleDateString('es-CO')}
                              </p>
                            )}
                          </div>

                          {/* Breakdown of other states with quantities */}
                          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/80">
                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                              Estados de Cita:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(sp.statusCounts).map(([status, count]) => (
                                <span
                                  key={status}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getVisitStatusBadgeClass(status)}`}
                                  title={`${count} ${count === 1 ? 'cita' : 'citas'} en estado ${status}`}
                                >
                                  <span>{status}:</span>
                                  <strong className="font-bold font-mono">{count}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Filter and Visits Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Historial de Visitas y Citas
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Filtrar estado:</span>
                        <select
                          value={visitStatusFilter}
                          onChange={(e) => setVisitStatusFilter(e.target.value)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 font-medium"
                        >
                          <option value="Todos">Todos los estados</option>
                          {availableVisitStatuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-y-auto shadow-2xs max-h-[380px]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-4 py-2">Fecha y Hora</th>
                            <th className="px-4 py-2">Especialidad</th>
                            <th className="px-4 py-2">Clase Cita</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {(data?.visits?.visits || [])
                            .filter((v) => visitStatusFilter === 'Todos' || v.estado === visitStatusFilter)
                            .map((v, i) => (
                              <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                <td className="px-4 py-2.5 font-mono text-gray-600 dark:text-gray-400">
                                  {new Date(v.fecha).toLocaleString('es-CO')}
                                </td>
                                <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">
                                  {v.especialidad}
                                </td>
                                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                                  {v.clase_cita || 'Control'}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getVisitStatusBadgeClass(v.estado)}`}
                                  >
                                    {v.estado || 'Atendida'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          {(!data?.visits?.visits || data.visits.visits.length === 0) && (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-xs text-gray-500 italic">
                                No hay visitas registradas para este paciente.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: COSTOS DE SALUD */}
              {activeTab === 'costos' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Top Total Cost Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-emerald-100 font-bold">Costo Total Acumulado en Salud</p>
                      <p className="text-3xl font-black mt-0.5">{formatCOP(totalCost)}</p>
                      <p className="text-xs text-emerald-200 mt-1">
                        Consolidado de facturación de servicios médicos para {cleanIdentificacion}
                      </p>
                    </div>
                    <div className="px-3.5 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 text-xs font-semibold">
                      Items Facturados: {data?.cost?.n_items ?? data?.cost?.items?.length ?? 0} registros
                    </div>
                  </div>

                  {/* Breakdown by Service Type */}
                  {data?.cost?.costo_por_tipo_servicio && Object.keys(data.cost.costo_por_tipo_servicio).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Desglose por Tipo de Servicio
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {Object.entries(data.cost.costo_por_tipo_servicio).map(([srv, val], i) => {
                          const numVal = Number(val) || 0;
                          return (
                            <div key={i} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{srv}</p>
                              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                {formatCOP(numVal)}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {totalCost ? `${Math.round((numVal / totalCost) * 100)}% del total` : ''}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Detailed Items Table */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Detalle Línea a Línea de Costos Facturados
                      </h3>
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar CUPS o descripción..."
                          value={costSearch}
                          onChange={(e) => setCostSearch(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-y-auto overflow-x-auto shadow-2xs max-h-[380px]">
                      <table className="w-full text-xs text-left">
                        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800 z-10">
                          <tr>
                            <th className="px-3 py-2">Mes</th>
                            <th className="px-3 py-2">CUPS / Código</th>
                            <th className="px-3 py-2">Descripción del Servicio</th>
                            <th className="px-3 py-2">Tipo Servicio</th>
                            <th className="px-3 py-2">Prestador</th>
                            <th className="px-3 py-2 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {(data?.cost?.items || [])
                            .filter((it) => {
                              if (!costSearch) return true;
                              const q = costSearch.toLowerCase();
                              return (
                                it.descripcion_servicio?.toLowerCase().includes(q) ||
                                it.codigo_cups?.toLowerCase().includes(q) ||
                                it.tipo_servicio?.toLowerCase().includes(q) ||
                                it.prestador?.toLowerCase().includes(q)
                              );
                            })
                            .map((it, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                <td className="px-3 py-2 font-mono text-gray-500 whitespace-nowrap">
                                  {it.mes_emision || it.mes_reporte || '-'}
                                </td>
                                <td className="px-3 py-2 font-mono text-blue-600 dark:text-blue-400 font-bold">
                                  {it.codigo_cups || '-'}
                                </td>
                                <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate" title={it.descripcion_servicio}>
                                  {it.descripcion_servicio || 'Servicio de consulta / atención'}
                                </td>
                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {it.tipo_servicio || '-'}
                                </td>
                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={it.prestador}>
                                  {it.prestador || '-'}
                                </td>
                                <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                  {formatCOP(it.costo)}
                                </td>
                              </tr>
                            ))}
                          {(!data?.cost?.items || data.cost.items.length === 0) && (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-xs text-gray-500 italic">
                                No se encontraron registros de costos para este paciente.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ENCUESTAS & PERCEPCIÓN */}
              {activeTab === 'encuestas' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* NPS Satisfaction Surveys */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#00aae1]" />
                      Encuestas de Satisfacción (NPS)
                    </h3>
                    {data?.surveys?.encuestas && data.surveys.encuestas.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                        {data.surveys.encuestas.map((enc, i) => (
                          <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-gray-800 dark:text-gray-200">Encuesta #{i + 1}</span>
                              <span className="font-mono text-gray-500">{new Date(enc.fecha).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-center">
                                <p className="text-[10px] text-gray-500">Recomienda</p>
                                <p className="text-sm font-black text-emerald-600">{enc.recomienda_servicio ?? 'N/A'}/10</p>
                              </div>
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-center">
                                <p className="text-[10px] text-gray-500">Satisfacción</p>
                                <p className="text-sm font-black text-blue-600">{enc.satisfaccion_medico ?? 'N/A'}/5</p>
                              </div>
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-center">
                                <p className="text-[10px] text-gray-500">Pudo Resolver</p>
                                <p className="text-sm font-black text-purple-600">{enc.pudo_resolver ?? 'Sí'}</p>
                              </div>
                            </div>
                            {enc.comentarios && (
                              <p className="text-xs italic text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-black/20 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                "{enc.comentarios}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed rounded-xl">
                        No se registran encuestas de satisfacción para este paciente.
                      </p>
                    )}
                  </div>

                  {/* Perception Questionnaires */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Cuestionarios de Perfilamiento y Escalas Clínicas
                    </h3>
                    {data?.perceptionSurvey?.cuestionarios && data.perceptionSurvey.cuestionarios.length > 0 ? (
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {data.perceptionSurvey.cuestionarios.map((cues, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/30">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{cues.nombre_cuestionario}</h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {cues.clasificacion_final || 'Completado'}
                              </span>
                            </div>
                            {cues.respuestas && cues.respuestas.length > 0 && (
                              <div className="divide-y divide-gray-100 dark:divide-gray-800 mt-2 text-xs">
                                {cues.respuestas.map((r, ri) => (
                                  <div key={ri} className="py-2 flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">{r.pregunta}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{r.respuesta_texto || r.valor_obtenido || '-'}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed rounded-xl">
                        No registra cuestionarios adicionales diligenciados.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: ESTADO & COMPLETITUD */}
              {activeTab === 'completitud' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Status transitions */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Historial de Transiciones de Estado en GIRIS
                    </h3>
                    {data?.status?.history && data.status.history.length > 0 ? (
                      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-y-auto max-h-[380px]">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                            <tr>
                              <th className="px-4 py-2">Fecha</th>
                              <th className="px-4 py-2">Estado Inicial</th>
                              <th className="px-4 py-2">Estado Final</th>
                              <th className="px-4 py-2">Observación</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {[...(data.status.history || [])]
                              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                              .map((h, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                <td className="px-4 py-2.5 font-mono text-gray-500 whitespace-nowrap">
                                  {new Date(h.fecha).toLocaleString('es-CO')}
                                </td>
                                <td className="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">
                                  {h.estado_inicial}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    {h.estado_final}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                                  {h.observacion || 'Cambio registrado en plataforma'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed rounded-xl">
                        No hay historial de transiciones registrado.
                      </p>
                    )}
                  </div>

                  {/* Completeness metrics */}
                  {data?.completeness && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Métricas de Diligenciamiento de la Historia Clínica
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Total Citas</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{data.completeness.n_citas ?? 0}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Con Epicrisis</p>
                          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{data.completeness.n_con_epicrisis ?? 0}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Tasa Epicrisis</p>
                          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {data.completeness.epicrisis_fill_rate !== undefined ? `${Math.round(data.completeness.epicrisis_fill_rate * 100)}%` : '0%'}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Actas Médicas</p>
                          <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{data.completeness.n_actas_medicas ?? 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-[#0e172e] border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Datos provistos por <strong>pkgln_big_query.p_datos_usuario_cohorte</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
