import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  FileText,
  Activity,
  AlertTriangle,
  Calendar,
  User,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Heart,
  Droplets,
  Stethoscope,
  ShieldAlert,
  FileCode,
  Sparkles,
  FolderOpen,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  TrendingUp,
  ListChecks,
  History,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Table,
  BarChart3,
  Pill,
} from 'lucide-react';
import { PatientService } from '../services/patientService';

// Paleta temática adaptada a los colores corporativos y complementarios de Panel-Paciente
const TIMELINE_PALETTES = [
  {
    color: '#00aae1', // Brand Primary
    bg: '#effaff',
    border: '#bae6fd',
    glow: 'rgba(0, 170, 225, 0.22)',
    Icon: Sparkles,
  },
  {
    color: '#e11d48', // Crimson / Rose
    bg: '#fff1f2',
    border: '#fecdd3',
    glow: 'rgba(225, 29, 72, 0.22)',
    Icon: Stethoscope,
  },
  {
    color: '#0284c7', // Sky Blue
    bg: '#f0f9ff',
    border: '#bae6fd',
    glow: 'rgba(2, 132, 199, 0.22)',
    Icon: BarChart3,
  },
  {
    color: '#01ae6c', // Teker Salud / Emerald
    bg: '#ebfef4',
    border: '#a7f3d0',
    glow: 'rgba(1, 174, 108, 0.22)',
    Icon: Activity,
  },
  {
    color: '#ff7a39', // Teker Creatividad / Orange
    bg: '#fff7ed',
    border: '#fed7aa',
    glow: 'rgba(255, 122, 57, 0.22)',
    Icon: Lightbulb,
  },
  {
    color: '#7c3aed', // Purple
    bg: '#f5f3ff',
    border: '#ddd6fe',
    glow: 'rgba(124, 58, 237, 0.22)',
    Icon: Heart,
  },
];

const SPANISH_MONTHS: Record<string, number> = {
  enero: 0, ene: 0, febrero: 1, feb: 1, marzo: 2, mar: 2, abril: 3, abr: 3, mayo: 4, may: 4,
  junio: 5, jun: 5, julio: 6, jul: 6, agosto: 7, ago: 7, septiembre: 8, sep: 8, setiembre: 8,
  octubre: 9, oct: 9, noviembre: 10, nov: 10, diciembre: 11, dic: 11,
};

// Parser para fechas de atenciones y citas
const parseAtencionDate = (dStr?: string | null): Date | null => {
  if (!dStr) return null;
  const str = String(dStr).trim();

  // Formato en español: "Diciembre 08 de 2026 11:50 AM" o "Septiembre 09 de 2026"
  const esMatch = str.match(/([A-Za-z]+)\s+(\d{1,2})(?:\s+de\s+|\s+)(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?)?/i);
  if (esMatch) {
    const monthName = esMatch[1].toLowerCase();
    const month = SPANISH_MONTHS[monthName];
    if (month !== undefined) {
      const day = parseInt(esMatch[2], 10);
      const year = parseInt(esMatch[3], 10);
      let hour = esMatch[4] ? parseInt(esMatch[4], 10) : 0;
      const min = esMatch[5] ? parseInt(esMatch[5], 10) : 0;
      const sec = esMatch[6] ? parseInt(esMatch[6], 10) : 0;
      const ampm = esMatch[7]?.toUpperCase();
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      return new Date(year, month, day, hour, min, sec);
    }
  }

  // DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return new Date(parseInt(dmyMatch[3], 10), parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10));
  }

  // ISO o nativo
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;

  return null;
};

// Parser para mostrar año y día/mes de forma destacada en la infografía
const parseDateDisplay = (dateStr?: string | null) => {
  if (!dateStr) return { year: '—', dayMonth: '—', fullDate: 'Sin fecha' };
  const str = String(dateStr).trim();
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  // Formato español: "Septiembre 09 de 2026 11:50 AM"
  const esMatch = str.match(/^([A-Za-z]+)\s+(\d{1,2})(?:\s+de\s+|\s+)(\d{4})(?:\s+(.+))?/i);
  if (esMatch) {
    const monthName = esMatch[1].toLowerCase();
    const mIdx = SPANISH_MONTHS[monthName];
    if (mIdx !== undefined) {
      const year = esMatch[3];
      const d = parseInt(esMatch[2], 10);
      const mName = months[mIdx];
      const timeStr = esMatch[4] ? ` ${esMatch[4]}` : '';
      return {
        year,
        dayMonth: `${d < 10 ? '0' + d : d} ${mName}`,
        fullDate: `${d < 10 ? '0' + d : d}/${String(mIdx + 1).padStart(2, '0')}/${year}${timeStr}`,
      };
    }
  }

  // YYYY-MM-DD
  const iso = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) {
    const year = iso[1];
    const m = parseInt(iso[2], 10);
    const d = parseInt(iso[3], 10);
    const mName = months[m - 1] || '';
    return {
      year,
      dayMonth: `${d < 10 ? '0' + d : d} ${mName}`,
      fullDate: `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    };
  }
  // DD/MM/YYYY
  const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    const d = parseInt(dmy[1], 10);
    const m = parseInt(dmy[2], 10);
    const year = dmy[3];
    const mName = months[m - 1] || '';
    return {
      year,
      dayMonth: `${d < 10 ? '0' + d : d} ${mName}`,
      fullDate: `${d < 10 ? '0' + d : d}/${String(m).padStart(2, '0')}/${year}`,
    };
  }
  return {
    year: str.length >= 4 ? str.substring(0, 4) : '—',
    dayMonth: str.length > 4 ? str.substring(5) : '',
    fullDate: str,
  };
};

export interface VerActaModalProps {
  isOpen: boolean;
  idActa: number | string | null;
  onClose: () => void;
}

export const VerActaModal: React.FC<VerActaModalProps> = ({
  isOpen,
  idActa,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'antecedentes' | 'metricas' | 'citas_archivos' | 'epicrisis'>('resumen');
  const [epicrisisSubTab, setEpicrisisSubTab] = useState<'evolucion' | 'antecedentes' | 'linea_tiempo' | 'diagnosticos' | 'medicamentos' | 'actas' | 'json_epicrisis'>('evolucion');
  const [copiedActaJson, setCopiedActaJson] = useState(false);
  const [copiedEpicrisisJson, setCopiedEpicrisisJson] = useState(false);
  const [citasExpanded, setCitasExpanded] = useState({
    historias: true,
    atenciones: true,
    especialidades: true,
  });

  const especialidadesRef = useRef<HTMLDivElement>(null);

  const toggleCitasSection = (key: 'historias' | 'atenciones' | 'especialidades') => {
    setCitasExpanded(prev => {
      const nextState = !prev[key];
      if (key === 'especialidades' && nextState) {
        setTimeout(() => {
          especialidadesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      }
      return {
        ...prev,
        [key]: nextState,
      };
    });
  };

  // Selector de vista y orden para Atenciones y Citas Programadas
  const [atencionesViewMode, setAtencionesViewMode] = useState<'timeline' | 'tabla'>('timeline');
  type AtencionSortField = 'fecha' | 'especialidad' | 'estado';
  const [atencionSortField, setAtencionSortField] = useState<AtencionSortField>('fecha');
  const [atencionSortDir, setAtencionSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSortAtenciones = (field: AtencionSortField) => {
    if (atencionSortField === field) {
      setAtencionSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setAtencionSortField(field);
      setAtencionSortDir('asc');
    }
  };

  const loadActaDetails = async (actaId: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await PatientService.getDetalleActa(actaId);
      if (result) {
        setData(result);
      } else {
        setError(`No se encontraron detalles para el Acta Médica #${actaId}`);
      }
    } catch (err: any) {
      console.error('Error cargando detalle de acta:', err);
      setError(err?.message || 'Error de conexión al cargar el acta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !idActa) {
      setData(null);
      setError(null);
      setActiveTab('resumen');
      setEpicrisisSubTab('evolucion');
      setCitasExpanded({ historias: true, atenciones: true, especialidades: true });
      return;
    }
    loadActaDetails(idActa);
  }, [isOpen, idActa]);

  // Parsear epicrisis si viene como string JSON
  const epicrisisData = useMemo(() => {
    if (!data?.epicrisis_paciente) return null;
    if (typeof data.epicrisis_paciente === 'object') return data.epicrisis_paciente;
    try {
      return JSON.parse(data.epicrisis_paciente);
    } catch (e) {
      return { resumen_evolucion: String(data.epicrisis_paciente) };
    }
  }, [data?.epicrisis_paciente]);

  // Parsear antecedentes de la epicrisis
  const epicrisisAntecedentes = useMemo(() => {
    if (!epicrisisData?.antecedentes) return null;
    if (typeof epicrisisData.antecedentes === 'object') return epicrisisData.antecedentes;
    try {
      return JSON.parse(epicrisisData.antecedentes);
    } catch (e) {
      return { otros: String(epicrisisData.antecedentes) };
    }
  }, [epicrisisData?.antecedentes]);

  // Medicamentos de la epicrisis (priorizar medicamentos_recientes)
  const medicamentosEpicrisis: any[] = useMemo(() => {
    if (!epicrisisData) return [];
    if (Array.isArray(epicrisisData.medicamentos_recientes) && epicrisisData.medicamentos_recientes.length > 0) {
      return epicrisisData.medicamentos_recientes;
    }
    if (Array.isArray(epicrisisData.medicamentos_historicos) && epicrisisData.medicamentos_historicos.length > 0) {
      return epicrisisData.medicamentos_historicos;
    }
    if (Array.isArray(epicrisisData.medicamentos)) {
      return epicrisisData.medicamentos;
    }
    return [];
  }, [epicrisisData]);

  // Línea de tiempo ordenada por fecha descendente
  const sortedTimeline = useMemo(() => {
    if (!epicrisisData?.linea_tiempo || !Array.isArray(epicrisisData.linea_tiempo)) return [];
    return [...epicrisisData.linea_tiempo].sort((a: any, b: any) => {
      const getTime = (d: any) => {
        if (!d) return 0;
        const str = String(d).trim();
        const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (dmy) {
          return new Date(`${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`).getTime() || 0;
        }
        return new Date(str).getTime() || 0;
      };
      return getTime(b.fecha) - getTime(a.fecha);
    });
  }, [epicrisisData?.linea_tiempo]);

  const handleCopyActaJson = () => {
    if (!data) return;
    const jsonStr = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedActaJson(true);
      setTimeout(() => setCopiedActaJson(false), 2000);
    });
  };

  const handleCopyEpicrisisJson = () => {
    if (!epicrisisData) return;
    const jsonStr = JSON.stringify(epicrisisData, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedEpicrisisJson(true);
      setTimeout(() => setCopiedEpicrisisJson(false), 2000);
    });
  };

  // Atenciones y Citas ordenadas según el modo de visualización y campos de ordenación
  const sortedAtenciones = useMemo(() => {
    const list: any[] = Array.isArray(data?.atenciones_programadas) ? data.atenciones_programadas : [];
    if (!list.length) return [];
    return [...list].sort((a: any, b: any) => {
      const timeA = parseAtencionDate(a.fecha_cita || a.fecha)?.getTime() || 0;
      const timeB = parseAtencionDate(b.fecha_cita || b.fecha)?.getTime() || 0;

      if (atencionesViewMode === 'timeline') {
        // Modo Línea de Tiempo: siempre cronológico de primero la más cercana (ascendente)
        return timeA - timeB;
      }

      // Modo Tabla: ordenable por fecha, especialidad o estado
      let cmp = 0;
      if (atencionSortField === 'fecha') {
        cmp = timeA - timeB;
      } else if (atencionSortField === 'especialidad') {
        const espA = String(a.nombre_especialidad || a.especialidad || '').toLowerCase();
        const espB = String(b.nombre_especialidad || b.especialidad || '').toLowerCase();
        cmp = espA.localeCompare(espB);
      } else if (atencionSortField === 'estado') {
        const estA = String(a.estado_cita || a.estado || '').toLowerCase();
        const estB = String(b.estado_cita || b.estado || '').toLowerCase();
        cmp = estA.localeCompare(estB);
      }
      return atencionSortDir === 'asc' ? cmp : -cmp;
    });
  }, [data?.atenciones_programadas, atencionesViewMode, atencionSortField, atencionSortDir]);

  if (!isOpen) return null;

  // Badge de riesgo adaptado
  const getRiskBadge = (nivel: any, descripcion?: string) => {
    const desc = descripcion || (nivel === 4 ? 'Crítico' : nivel === 3 ? 'Alto' : nivel === 2 ? 'Medio' : 'Bajo');
    const num = Number(nivel);
    if (num >= 4 || String(desc).toLowerCase().includes('crítico') || String(desc).toLowerCase().includes('critico')) {
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
        icon: <ShieldAlert className="w-3.5 h-3.5" />,
        text: `Riesgo ${desc} (Nivel ${nivel || 4})`,
      };
    }
    if (num === 3 || String(desc).toLowerCase().includes('alto')) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        text: `Riesgo ${desc} (Nivel ${nivel || 3})`,
      };
    }
    if (num === 2 || String(desc).toLowerCase().includes('medio')) {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/60',
        icon: <Activity className="w-3.5 h-3.5" />,
        text: `Riesgo ${desc} (Nivel ${nivel || 2})`,
      };
    }
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      text: `Riesgo ${desc || 'Estable'} (Nivel ${nivel || 1})`,
    };
  };

  const riskBadge = data ? getRiskBadge(data.nivel_riesgo, data.descripcion_riesgo) : null;
  const antecedentes = data?.antecedentes || {};
  const metricasRelevantes = data?.metricas_relevantes || {};
  const historicoMetricas: any[] = Array.isArray(data?.historico_metricas) ? data.historico_metricas : [];
  const historiasAnteriores: any[] = Array.isArray(data?.historias_anteriores) ? data.historias_anteriores : [];
  const atencionesProgramadas: any[] = Array.isArray(data?.atenciones_programadas) ? data.atenciones_programadas : [];
  const progEspecialidades: any[] = Array.isArray(data?.prog_especialidad_acta) ? data.prog_especialidad_acta : [];

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc] rounded-2xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] w-full max-w-6xl xl:max-w-7xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#00aae1] to-[#0177ab] text-white flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-bold text-base md:text-lg leading-tight tracking-tight">
                  Acta Médica #{data?.id_acta || idActa}
                </h3>
                {riskBadge && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskBadge.bg}`}>
                    {riskBadge.icon}
                    <span>{riskBadge.text}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Detalle Clínico Completo · <span className="font-mono text-white/80">pkgcn_cohortes.f_ver_acta</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyActaJson}
              disabled={!data}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer disabled:opacity-50"
              title="Copiar JSON completo del acta"
            >
              {copiedActaJson ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedActaJson ? 'Copiado' : 'Copiar JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4 bg-[#f8fafc] dark:bg-[#0b1329]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3.5 text-center">
              <div className="w-10 h-10 border-4 border-[#00aae1]/20 border-t-[#00aae1] rounded-full animate-spin" />
              <p className="text-sm font-semibold text-[#035476] dark:text-[#38bdf8]">
                Consultando información completa del Acta Médica #{idActa}...
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Llamando a pkgcn_cohortes.f_ver_acta(:p_json_entrada)
              </p>
            </div>
          ) : error ? (
            <div className="p-8 bg-white dark:bg-[#1e293b] border border-rose-200 dark:border-rose-900/60 rounded-2xl text-center flex flex-col items-center gap-3 my-8">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-rose-600 dark:text-rose-400 m-0">
                Error al consultar información del acta
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                {error}
              </p>
              <button
                onClick={() => idActa && loadActaDetails(idActa)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00aae1] hover:bg-[#0196d4] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar</span>
              </button>
            </div>
          ) : !data ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              No hay información disponible para esta acta médica.
            </div>
          ) : (
            <>
              {/* Tarjeta de Datos Principales del Paciente */}
              <div className="shrink-0 bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-xs">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                    Paciente
                  </div>
                  <div className="text-sm font-bold text-[#033d59] dark:text-[#f8fafc] leading-tight">
                    {data.nombre_completo || 'Sin nombre registrado'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    {data.tipo_identificacion || 'ID'}: {data.identificacion || '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                    Demografía
                  </div>
                  <div className="text-xs font-semibold text-[#033d59] dark:text-[#f8fafc]">
                    {data.edad || 'Edad no registrada'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {data.genero || 'Género no registrado'} · Nació: {data.fecha_nacimiento || '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                    Próxima Revisión
                  </div>
                  <div className="text-xs font-bold text-[#00aae1] dark:text-[#38bdf8] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{data.fecha_proxima_revision || 'No programada'}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ID Usuario: <span className="font-mono">{data.id_usuario_acta || '—'}</span>
                  </div>
                </div>

                {epicrisisData && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                      Última Epicrisis
                    </div>
                    <div className="text-xs font-bold text-[#0284c7] dark:text-[#38bdf8] flex items-center gap-1.5">
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>
                        {data.fecha_ultima_epicrisis_paciente ||
                          (epicrisisData.fecha_actualizacion ? String(epicrisisData.fecha_actualizacion).split(' ')[0] : 'Consolidada')}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('epicrisis')}
                      className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#effaff] dark:bg-[#00aae1]/10 text-[#00aae1] dark:text-[#38bdf8] border border-[#00aae1]/20 text-[11px] font-bold hover:bg-[#00aae1]/15 transition-colors cursor-pointer"
                    >
                      <span>Ver Sección Epicrisis →</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tarjetas de Métricas Clave */}
              <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Presión Arterial</div>
                    <div className="text-base font-extrabold text-[#033d59] dark:text-[#f8fafc]">
                      {metricasRelevantes.presion_arterial || '—'}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Nivel de Azúcar</div>
                    <div className="text-base font-extrabold text-[#033d59] dark:text-[#f8fafc]">
                      {metricasRelevantes.nivel_azucar !== null && metricasRelevantes.nivel_azucar !== undefined
                        ? `${metricasRelevantes.nivel_azucar} mg/dL`
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">HbA1c</div>
                    <div className="text-base font-extrabold text-[#033d59] dark:text-[#f8fafc]">
                      {metricasRelevantes.hba1c || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pestañas Principales */}
              <div className="shrink-0 flex items-center gap-1.5 border-b border-[#e2e8eb] dark:border-[#334155] overflow-x-auto pb-1 min-h-[44px]">
                {[
                  { id: 'resumen', label: 'Resumen Clínico', icon: <FileText className="w-4 h-4" /> },
                  { id: 'antecedentes', label: 'Antecedentes', icon: <Stethoscope className="w-4 h-4" /> },
                  { id: 'metricas', label: `Métricas (${historicoMetricas.length})`, icon: <Activity className="w-4 h-4" /> },
                  { id: 'citas_archivos', label: `Citas y Archivos (${historiasAnteriores.length + atencionesProgramadas.length})`, icon: <FolderOpen className="w-4 h-4" /> },
                  ...(epicrisisData ? [{ id: 'epicrisis', label: 'Última Epicrisis', icon: <ClipboardList className="w-4 h-4" />, highlight: true }] : []),
                ].map((tab: any) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#1e293b]'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                      {tab.highlight && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] border border-[#00aae1]/30">
                          Consolidado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contenido de la Pestaña Activa */}
              <div className="shrink-0 bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-xl p-4 sm:p-5 shadow-xs">
                {/* TAB 1: RESUMEN CLÍNICO */}
                {activeTab === 'resumen' && (
                  <div className="flex flex-col gap-4">
                    {/* Análisis Clínico y Plan */}
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#00aae1] dark:text-[#38bdf8] font-bold mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Análisis Clínico y Plan</span>
                      </div>
                      <div className="bg-[#effaff]/40 dark:bg-slate-900/60 border border-[#bae6fd]/50 dark:border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-[#033d59] dark:text-[#f8fafc] leading-relaxed whitespace-pre-wrap">
                        {data.analisis || 'Sin análisis registrado en el acta.'}
                      </div>
                    </div>

                    {/* Observaciones Clínicas y Operativas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                          Observaciones Clínicas
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 min-h-[68px]">
                          {data.observaciones_clinicas || 'Sin observaciones clínicas.'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                          Observaciones Operativas
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 min-h-[68px]">
                          {data.observaciones_operativas || 'Sin observaciones operativas.'}
                        </div>
                      </div>
                    </div>

                    {/* Diagnósticos / Medicamentos / Órdenes */}
                    {(data.diagnosticos || data.medicamentos_prescritos || data.ordenes_servicio) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        {data.diagnosticos && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-[11px] font-bold text-[#00aae1] mb-1">Diagnósticos</div>
                            <div className="text-xs text-slate-700 dark:text-slate-300">
                              {typeof data.diagnosticos === 'object' ? JSON.stringify(data.diagnosticos) : data.diagnosticos}
                            </div>
                          </div>
                        )}
                        {data.medicamentos_prescritos && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-[11px] font-bold text-[#00aae1] mb-1">Medicamentos Prescritos</div>
                            <div className="text-xs text-slate-700 dark:text-slate-300">
                              {typeof data.medicamentos_prescritos === 'object' ? JSON.stringify(data.medicamentos_prescritos) : data.medicamentos_prescritos}
                            </div>
                          </div>
                        )}
                        {data.ordenes_servicio && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-[11px] font-bold text-[#00aae1] mb-1">Órdenes de Servicio</div>
                            <div className="text-xs text-slate-700 dark:text-slate-300">
                              {typeof data.ordenes_servicio === 'object' ? JSON.stringify(data.ordenes_servicio) : data.ordenes_servicio}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: ANTECEDENTES */}
                {activeTab === 'antecedentes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {[
                      { title: 'Antecedentes Patológicos', val: antecedentes.antecedentes_patologicos || antecedentes.patologicos || epicrisisAntecedentes?.patologicos, isAlert: false },
                      { title: 'Antecedentes Quirúrgicos', val: antecedentes.antecedentes_quirurgicos || antecedentes.quirurgicos || epicrisisAntecedentes?.quirurgicos, isAlert: false },
                      { title: 'Antecedentes Farmacológicos', val: antecedentes.antecedentes_farmacologicos || antecedentes.farmacologicos || epicrisisAntecedentes?.farmacologicos, isAlert: false },
                      { title: 'Alergias / Intolerancias', val: antecedentes.alergias || epicrisisAntecedentes?.alergias, isAlert: true },
                      { title: 'Antecedentes Familiares', val: antecedentes.antecedentes_familiares || antecedentes.familiares || epicrisisAntecedentes?.familiares, isAlert: false },
                      { title: 'Antecedentes Personales', val: antecedentes.antecedentes_personales || antecedentes.personales || epicrisisAntecedentes?.personales, isAlert: false },
                      { title: 'Antecedentes Traumáticos', val: antecedentes.antecedentes_traumaticos || antecedentes.traumaticos || epicrisisAntecedentes?.traumaticos, isAlert: false },
                      { title: 'Otros Antecedentes', val: antecedentes.otros || epicrisisAntecedentes?.otros, isAlert: false },
                    ].map((item) => {
                      const hasVal = Boolean(item.val && String(item.val).trim());
                      return (
                        <div
                          key={item.title}
                          className={`rounded-xl p-3.5 border transition-all ${
                            item.isAlert && hasVal
                              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div
                              className={`text-xs font-bold ${
                                item.isAlert && hasVal
                                  ? 'text-amber-800 dark:text-amber-300 flex items-center gap-1.5'
                                  : 'text-[#033d59] dark:text-[#f8fafc]'
                              }`}
                            >
                              {item.isAlert && hasVal && <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                              <span>{item.title}</span>
                            </div>
                            {item.isAlert && hasVal && (
                              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                Alerta
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs leading-relaxed whitespace-pre-wrap ${
                              hasVal
                                ? item.isAlert
                                  ? 'text-amber-900 dark:text-amber-200 font-medium'
                                  : 'text-slate-700 dark:text-slate-300'
                                : 'text-slate-400 italic'
                            }`}
                          >
                            {hasVal ? item.val : 'Sin antecedentes registrados.'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 3: MÉTRICAS */}
                {activeTab === 'metricas' && (
                  <div>
                    {historicoMetricas.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        No hay métricas registradas en el historial de esta acta.
                      </div>
                    ) : (
                      <div className="max-h-[420px] overflow-y-auto border border-[#e2e8eb] dark:border-[#334155] rounded-xl">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Fecha</th>
                              <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Variable Clínica</th>
                              <th className="p-3 font-bold text-slate-600 dark:text-slate-300 text-right">Valor Registrado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {historicoMetricas.map((m: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="p-3 text-slate-500 font-mono">{m.fecha || '—'}</td>
                                <td className="p-3 font-semibold text-[#033d59] dark:text-[#f8fafc]">{m.nombre_variable || '—'}</td>
                                <td className="p-3 text-right">
                                  <span className="px-2.5 py-1 rounded-md bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] font-bold border border-[#00aae1]/30">
                                    {m.valor || '—'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: CITAS Y ARCHIVOS */}
                {activeTab === 'citas_archivos' && (
                  <div className="flex flex-col gap-3.5">
                    {/* Sección 1: Historias Anteriores / Archivos */}
                    <div className="border border-[#e2e8eb] dark:border-[#334155] rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => toggleCitasSection('historias')}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
                          citasExpanded.historias ? 'bg-[#effaff]/60 dark:bg-[#00aae1]/10' : 'bg-slate-50 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-[#033d59] dark:text-[#f8fafc]">
                          <FolderOpen className="w-4 h-4 text-[#00aae1]" />
                          <span>Historias Clínicas Anteriores / Archivos ({historiasAnteriores.length})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${citasExpanded.historias ? 'rotate-180' : ''}`} />
                      </button>
                      {citasExpanded.historias && (
                        <div className="p-4">
                          {historiasAnteriores.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">No hay historias anteriores registradas.</div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1.5">
                              {historiasAnteriores.map((h: any, i: number) => (
                                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                                  <div className="truncate">
                                    <div className="text-xs font-bold text-[#033d59] dark:text-[#f8fafc] truncate">{h.nombre_archivo || h.titulo || `Documento #${i + 1}`}</div>
                                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{h.fecha || 'Sin fecha'}</div>
                                  </div>
                                  {h.url_archivo && (
                                    <a href={h.url_archivo} target="_blank" rel="noreferrer" className="p-1.5 rounded bg-white dark:bg-slate-700 text-[#00aae1] hover:bg-[#00aae1] hover:text-white transition-colors">
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sección 2: Atenciones Programadas */}
                    <div className="border border-[#e2e8eb] dark:border-[#334155] rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => toggleCitasSection('atenciones')}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
                          citasExpanded.atenciones ? 'bg-[#effaff]/60 dark:bg-[#00aae1]/10' : 'bg-slate-50 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-[#033d59] dark:text-[#f8fafc]">
                          <Calendar className="w-4 h-4 text-[#00aae1]" />
                          <span>Atenciones y Citas Programadas ({atencionesProgramadas.length})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${citasExpanded.atenciones ? 'rotate-180' : ''}`} />
                      </button>
                      {citasExpanded.atenciones && (
                        <div className="p-4">
                          {atencionesProgramadas.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">No hay atenciones programadas registradas.</div>
                          ) : (
                            <div>
                              {/* Barra superior: Selector de vista */}
                              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    {atencionesViewMode === 'timeline'
                                      ? 'Orden cronológico (de primero la más cercana)'
                                      : 'Haz clic en los encabezados de columna para ordenar'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <button
                                    type="button"
                                    onClick={() => setAtencionesViewMode('timeline')}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                      atencionesViewMode === 'timeline'
                                        ? 'bg-white dark:bg-[#00aae1] text-[#00aae1] dark:text-white shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                    title="Ver como Línea de Tiempo cronológica"
                                  >
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>Línea de Tiempo</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setAtencionesViewMode('tabla')}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                      atencionesViewMode === 'tabla'
                                        ? 'bg-white dark:bg-[#00aae1] text-[#00aae1] dark:text-white shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                    title="Ver como Tabla ordenable"
                                  >
                                    <Table className="w-3.5 h-3.5" />
                                    <span>Tabla</span>
                                  </button>
                                </div>
                              </div>

                              {/* VISTA 1: LÍNEA DE TIEMPO (Cronológica: de primero la más cercana) */}
                              {atencionesViewMode === 'timeline' && (
                                <div className="max-h-[460px] overflow-y-auto px-2 py-4">
                                  <div className="relative max-w-4xl mx-auto">
                                    {/* Eje central vertical (Spine) */}
                                    <div className="absolute top-4 bottom-6 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-slate-600 via-slate-400 to-slate-200 dark:from-slate-500 dark:to-slate-800 rounded-full z-0" />

                                    {sortedAtenciones.map((ap: any, idx: number) => {
                                      const palette = TIMELINE_PALETTES[idx % TIMELINE_PALETTES.length];
                                      const IconComponent = palette.Icon;
                                      const dateInfo = parseDateDisplay(ap.fecha_cita || ap.fecha);
                                      const isLeft = idx % 2 === 0;

                                      return (
                                        <div
                                          key={idx}
                                          className="relative z-10 flex items-center mb-8 last:mb-2 w-full"
                                        >
                                          {/* Lado Izquierdo */}
                                          <div className="flex-1 flex items-center justify-end pr-6 sm:pr-8">
                                            {isLeft ? (
                                              /* Tarjeta a la Izquierda */
                                              <div
                                                className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border max-w-sm w-full text-right"
                                                style={{ borderColor: palette.border, borderRightWidth: '4px', borderRightColor: palette.color }}
                                              >
                                                <div className="text-[10px] font-extrabold tracking-wider uppercase mb-1" style={{ color: palette.color }}>
                                                  CITA {String(idx + 1).padStart(2, '0')}
                                                </div>
                                                <div className="text-xs text-slate-400 font-mono mb-1.5 flex items-center justify-end gap-1">
                                                  <Calendar className="w-3 h-3" style={{ color: palette.color }} />
                                                  <span>{dateInfo.fullDate}</span>
                                                </div>
                                                <div className="text-xs font-bold text-[#033d59] dark:text-[#f8fafc] mb-1">
                                                  {ap.nombre_especialidad || ap.especialidad || 'Cita médica'}
                                                </div>
                                                {ap.nombre_profesional && (
                                                  <div className="text-[11px] text-slate-500 mb-1.5">
                                                    Dr(a). {ap.nombre_profesional}
                                                  </div>
                                                )}
                                                <span className="inline-block text-[10px] px-2 py-0.5 rounded font-bold bg-[#effaff] text-[#00aae1] dark:bg-[#00aae1]/20 dark:text-[#38bdf8] border border-[#00aae1]/30">
                                                  {ap.estado_cita || ap.estado || 'Programada'}
                                                </span>
                                              </div>
                                            ) : (
                                              /* Fecha a la Izquierda */
                                              <div className="flex flex-col items-end">
                                                <span className="text-2xl sm:text-3xl font-black text-[#033d59] dark:text-[#f8fafc] leading-none">
                                                  {dateInfo.year}
                                                </span>
                                                <span className="text-xs font-bold tracking-wider uppercase mt-1" style={{ color: palette.color }}>
                                                  {dateInfo.dayMonth}
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          {/* Nodo Central */}
                                          <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 bg-white dark:bg-slate-900 z-20 shadow-md"
                                            style={{ borderColor: palette.color, boxShadow: `0 0 12px ${palette.glow}` }}
                                          >
                                            <IconComponent className="w-4 h-4" style={{ color: palette.color }} />
                                          </div>

                                          {/* Lado Derecho */}
                                          <div className="flex-1 flex items-center justify-start pl-6 sm:pl-8">
                                            {!isLeft ? (
                                              /* Tarjeta a la Derecha */
                                              <div
                                                className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border max-w-sm w-full text-left"
                                                style={{ borderColor: palette.border, borderLeftWidth: '4px', borderLeftColor: palette.color }}
                                              >
                                                <div className="text-[10px] font-extrabold tracking-wider uppercase mb-1" style={{ color: palette.color }}>
                                                  CITA {String(idx + 1).padStart(2, '0')}
                                                </div>
                                                <div className="text-xs text-slate-400 font-mono mb-1.5 flex items-center gap-1">
                                                  <Calendar className="w-3 h-3" style={{ color: palette.color }} />
                                                  <span>{dateInfo.fullDate}</span>
                                                </div>
                                                <div className="text-xs font-bold text-[#033d59] dark:text-[#f8fafc] mb-1">
                                                  {ap.nombre_especialidad || ap.especialidad || 'Cita médica'}
                                                </div>
                                                {ap.nombre_profesional && (
                                                  <div className="text-[11px] text-slate-500 mb-1.5">
                                                    Dr(a). {ap.nombre_profesional}
                                                  </div>
                                                )}
                                                <span className="inline-block text-[10px] px-2 py-0.5 rounded font-bold bg-[#effaff] text-[#00aae1] dark:bg-[#00aae1]/20 dark:text-[#38bdf8] border border-[#00aae1]/30">
                                                  {ap.estado_cita || ap.estado || 'Programada'}
                                                </span>
                                              </div>
                                            ) : (
                                              /* Fecha a la Derecha */
                                              <div className="flex flex-col items-start">
                                                <span className="text-2xl sm:text-3xl font-black text-[#033d59] dark:text-[#f8fafc] leading-none">
                                                  {dateInfo.year}
                                                </span>
                                                <span className="text-xs font-bold tracking-wider uppercase mt-1" style={{ color: palette.color }}>
                                                  {dateInfo.dayMonth}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* VISTA 2: TABLA ORDENABLE */}
                              {atencionesViewMode === 'tabla' && (
                                <div className="max-h-[380px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                                  <table className="w-full text-xs text-left border-collapse">
                                    <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[#033d59] dark:text-[#f8fafc]">
                                      <tr>
                                        <th
                                          onClick={() => handleSortAtenciones('fecha')}
                                          className="p-3 font-bold cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors select-none"
                                          title="Clic para ordenar por Fecha"
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
                                            <span>Fecha</span>
                                            {atencionSortField === 'fecha' ? (
                                              atencionSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00aae1]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00aae1]" />
                                            ) : (
                                              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                          </div>
                                        </th>
                                        <th
                                          onClick={() => handleSortAtenciones('especialidad')}
                                          className="p-3 font-bold cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors select-none"
                                          title="Clic para ordenar por Especialidad"
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <Stethoscope className="w-3.5 h-3.5 text-[#00aae1]" />
                                            <span>Especialidad</span>
                                            {atencionSortField === 'especialidad' ? (
                                              atencionSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00aae1]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00aae1]" />
                                            ) : (
                                              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                          </div>
                                        </th>
                                        <th
                                          onClick={() => handleSortAtenciones('estado')}
                                          className="p-3 font-bold cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors select-none text-right"
                                          title="Clic para ordenar por Estado de la Cita"
                                        >
                                          <div className="flex items-center justify-end gap-1.5">
                                            <Activity className="w-3.5 h-3.5 text-[#00aae1]" />
                                            <span>Estado de la Cita</span>
                                            {atencionSortField === 'estado' ? (
                                              atencionSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00aae1]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00aae1]" />
                                            ) : (
                                              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                          </div>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {sortedAtenciones.map((ap: any, idx: number) => {
                                        const dateInfo = parseDateDisplay(ap.fecha_cita || ap.fecha);
                                        return (
                                          <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">
                                              <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{ap.fecha_cita || ap.fecha || dateInfo.fullDate}</span>
                                              </div>
                                            </td>
                                            <td className="p-3">
                                              <span className="font-bold text-[#033d59] dark:text-[#f8fafc]">
                                                {ap.nombre_especialidad || ap.especialidad || 'Cita médica'}
                                              </span>
                                              {ap.nombre_profesional && (
                                                <div className="text-[11px] text-slate-500 mt-0.5">
                                                  Dr(a). {ap.nombre_profesional}
                                                </div>
                                              )}
                                            </td>
                                            <td className="p-3 text-right">
                                              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#effaff] text-[#00aae1] dark:bg-[#00aae1]/20 dark:text-[#38bdf8] border border-[#00aae1]/30">
                                                {ap.estado_cita || ap.estado || 'Programada'}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sección 3: Programación de Especialidades */}
                    <div ref={especialidadesRef} className="border border-[#e2e8eb] dark:border-[#334155] rounded-xl overflow-hidden bg-white dark:bg-slate-900 scroll-mt-3">
                      <button
                        type="button"
                        onClick={() => toggleCitasSection('especialidades')}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
                          citasExpanded.especialidades ? 'bg-[#effaff]/60 dark:bg-[#00aae1]/10' : 'bg-slate-50 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-[#033d59] dark:text-[#f8fafc]">
                          <ListChecks className="w-4 h-4 text-[#00aae1]" />
                          <span>Programación de Especialidades ({progEspecialidades.length})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${citasExpanded.especialidades ? 'rotate-180' : ''}`} />
                      </button>
                      {citasExpanded.especialidades && (
                        <div className="p-4">
                          {progEspecialidades.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">No hay programación de especialidades.</div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {progEspecialidades.map((pe: any, i: number) => (
                                <div key={i} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                                  <strong className="text-[#033d59] dark:text-[#f8fafc]">{pe.nombre_especialidad}</strong>
                                  <span className="text-slate-500 ml-1.5 font-mono">
                                    (Inicio: {pe.fecha_inicio || '—'} · {pe.dias} días)
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: ÚLTIMA EPICRISIS */}
                {activeTab === 'epicrisis' && epicrisisData && (
                  <div className="flex flex-col gap-4">
                    {/* Banner Consolidado de Epicrisis */}
                    <div className="shrink-0 p-4 bg-gradient-to-r from-[#effaff] to-[#e0f2fe] dark:from-[#00aae1]/10 dark:to-[#0284c7]/10 border border-[#bae6fd] dark:border-[#0284c7]/30 rounded-xl flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#00aae1] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#035476] dark:text-[#38bdf8]">
                            Última Epicrisis Consolidada
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Actualizada: {epicrisisData.fecha_actualizacion || '—'} · Última consulta: {epicrisisData.fecha_ultima_consulta_incluida || '—'} · Total consultas: {epicrisisData.total_consultas_historicas_incluidas || '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tabs de Epicrisis */}
                    <div className="shrink-0 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs font-semibold min-h-[38px]">
                      {[
                        { id: 'evolucion', label: 'Resumen Evolución', icon: <FileText className="w-3.5 h-3.5" /> },
                        { id: 'antecedentes', label: 'Antecedentes', icon: <Stethoscope className="w-3.5 h-3.5" /> },
                        { id: 'linea_tiempo', label: `Línea de Tiempo (${sortedTimeline.length})`, icon: <TrendingUp className="w-3.5 h-3.5" /> },
                        { id: 'diagnosticos', label: 'Diagnósticos', icon: <Stethoscope className="w-3.5 h-3.5" /> },
                        { id: 'medicamentos', label: `Medicamentos${medicamentosEpicrisis.length > 0 ? ` (${medicamentosEpicrisis.length})` : ''}`, icon: <Pill className="w-3.5 h-3.5" /> },
                        { id: 'actas', label: 'Actas Previas', icon: <History className="w-3.5 h-3.5" /> },
                        { id: 'json_epicrisis', label: 'JSON Epicrisis', icon: <FileCode className="w-3.5 h-3.5" /> },
                      ].map((sub: any) => {
                        const isSubActive = epicrisisSubTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setEpicrisisSubTab(sub.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                              isSubActive
                                ? 'bg-[#00aae1] text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {sub.icon}
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Sub-tab 1: Evolución */}
                    {epicrisisSubTab === 'evolucion' && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="text-xs font-bold text-[#033d59] dark:text-[#f8fafc] mb-1.5">
                            Resumen de Evolución Clínica
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {epicrisisData.resumen_evolucion || 'Sin resumen de evolución.'}
                          </div>
                        </div>
                        {epicrisisData.recomendaciones_consolidadas && (
                          <div>
                            <div className="text-xs font-bold text-[#033d59] dark:text-[#f8fafc] mb-1.5">
                              Recomendaciones Consolidadas
                            </div>
                            <div className="p-4 bg-[#effaff]/50 dark:bg-slate-900/60 border border-[#bae6fd]/50 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                              {epicrisisData.recomendaciones_consolidadas}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sub-tab: Antecedentes de Epicrisis */}
                    {epicrisisSubTab === 'antecedentes' && (
                      <div>
                        {!epicrisisAntecedentes ? (
                          <div className="py-12 text-center text-slate-400 text-xs">
                            No hay antecedentes registrados en la última epicrisis consolidada.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {[
                              { title: 'Antecedentes Patológicos', val: epicrisisAntecedentes.patologicos, isAlert: false },
                              { title: 'Antecedentes Quirúrgicos', val: epicrisisAntecedentes.quirurgicos, isAlert: false },
                              { title: 'Antecedentes Farmacológicos', val: epicrisisAntecedentes.farmacologicos, isAlert: false },
                              { title: 'Alergias / Intolerancias', val: epicrisisAntecedentes.alergias, isAlert: true },
                              { title: 'Antecedentes Familiares', val: epicrisisAntecedentes.familiares, isAlert: false },
                              { title: 'Antecedentes Personales', val: epicrisisAntecedentes.personales, isAlert: false },
                              { title: 'Antecedentes Traumáticos', val: epicrisisAntecedentes.traumaticos, isAlert: false },
                              { title: 'Otros Antecedentes', val: epicrisisAntecedentes.otros, isAlert: false },
                            ].map((item) => {
                              const hasVal = Boolean(item.val && String(item.val).trim());
                              return (
                                <div
                                  key={item.title}
                                  className={`rounded-xl p-3.5 border transition-all ${
                                    item.isAlert && hasVal
                                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 shadow-2xs'
                                      : 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div
                                      className={`text-xs font-bold ${
                                        item.isAlert && hasVal
                                          ? 'text-amber-800 dark:text-amber-300 flex items-center gap-1.5'
                                          : 'text-[#033d59] dark:text-[#f8fafc]'
                                      }`}
                                    >
                                      {item.isAlert && hasVal && <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                                      <span>{item.title}</span>
                                    </div>
                                    {item.isAlert && hasVal && (
                                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        Alerta
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className={`text-xs leading-relaxed whitespace-pre-wrap ${
                                      hasVal
                                        ? item.isAlert
                                          ? 'text-amber-900 dark:text-amber-200 font-medium'
                                          : 'text-slate-700 dark:text-slate-300'
                                        : 'text-slate-400 italic'
                                    }`}
                                  >
                                    {hasVal ? item.val : 'Sin antecedentes registrados.'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sub-tab 2: Infografía Línea de Tiempo */}
                    {epicrisisSubTab === 'linea_tiempo' && (
                      <div className="max-h-[560px] overflow-y-auto px-2 py-4">
                        {sortedTimeline.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs">
                            No hay eventos registrados en la línea de tiempo de la epicrisis.
                          </div>
                        ) : (
                          <div className="relative max-w-4xl mx-auto">
                            {/* Eje central vertical (Spine) */}
                            <div className="absolute top-4 bottom-6 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-slate-600 via-slate-400 to-slate-200 dark:from-slate-500 dark:to-slate-800 rounded-full z-0" />

                            {sortedTimeline.map((lt: any, idx: number) => {
                              const eventNum = sortedTimeline.length - idx;
                              const palette = TIMELINE_PALETTES[(eventNum - 1) % TIMELINE_PALETTES.length];
                              const IconComponent = palette.Icon;
                              const dateInfo = parseDateDisplay(lt.fecha);
                              const isLeft = idx % 2 === 0;

                              return (
                                <div
                                  key={idx}
                                  className="relative z-10 flex items-center mb-8 last:mb-2 w-full"
                                >
                                  {/* Lado Izquierdo */}
                                  <div className="flex-1 flex items-center justify-end pr-6 sm:pr-8">
                                    {isLeft ? (
                                      /* Tarjeta a la Izquierda */
                                      <div
                                        className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border max-w-sm w-full text-right"
                                        style={{ borderColor: palette.border, borderRightWidth: '4px', borderRightColor: palette.color }}
                                      >
                                        <div className="text-[10px] font-extrabold tracking-wider uppercase mb-1" style={{ color: palette.color }}>
                                          EVENTO {String(eventNum).padStart(2, '0')}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono mb-1.5 flex items-center justify-end gap-1">
                                          <Calendar className="w-3 h-3" style={{ color: palette.color }} />
                                          <span>{dateInfo.fullDate}</span>
                                        </div>
                                        <div className="text-xs font-bold text-[#033d59] dark:text-[#f8fafc] mb-1">
                                          {lt.titulo || lt.especialidad || lt.evento || 'Atención médica'}
                                        </div>
                                        {(lt.resumen || lt.descripcion || lt.observaciones) && (
                                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2 whitespace-pre-wrap">
                                            {lt.resumen || lt.descripcion || lt.observaciones}
                                          </p>
                                        )}
                                        {lt.especialidad && lt.especialidad !== (lt.titulo || lt.evento) && (
                                          <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                                            {lt.especialidad}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      /* Fecha a la Izquierda */
                                      <div className="flex flex-col items-end">
                                        <span className="text-2xl sm:text-3xl font-black text-[#033d59] dark:text-[#f8fafc] leading-none">
                                          {dateInfo.year}
                                        </span>
                                        <span className="text-xs font-bold tracking-wider uppercase mt-1" style={{ color: palette.color }}>
                                          {dateInfo.dayMonth}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Nodo Central */}
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 bg-white dark:bg-slate-900 z-20 shadow-md"
                                    style={{ borderColor: palette.color, boxShadow: `0 0 12px ${palette.glow}` }}
                                  >
                                    <IconComponent className="w-4 h-4" style={{ color: palette.color }} />
                                  </div>

                                  {/* Lado Derecho */}
                                  <div className="flex-1 flex items-center justify-start pl-6 sm:pr-8">
                                    {!isLeft ? (
                                      /* Tarjeta a la Derecha */
                                      <div
                                        className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border max-w-sm w-full text-left"
                                        style={{ borderColor: palette.border, borderLeftWidth: '4px', borderLeftColor: palette.color }}
                                      >
                                        <div className="text-[10px] font-extrabold tracking-wider uppercase mb-1" style={{ color: palette.color }}>
                                          EVENTO {String(eventNum).padStart(2, '0')}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono mb-1.5 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" style={{ color: palette.color }} />
                                          <span>{dateInfo.fullDate}</span>
                                        </div>
                                        <div className="text-xs font-bold text-[#033d59] dark:text-[#f8fafc] mb-1">
                                          {lt.titulo || lt.especialidad || lt.evento || 'Atención médica'}
                                        </div>
                                        {(lt.resumen || lt.descripcion || lt.observaciones) && (
                                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2 whitespace-pre-wrap">
                                            {lt.resumen || lt.descripcion || lt.observaciones}
                                          </p>
                                        )}
                                        {lt.especialidad && lt.especialidad !== (lt.titulo || lt.evento) && (
                                          <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                                            {lt.especialidad}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      /* Fecha a la Derecha */
                                      <div className="flex flex-col items-start">
                                        <span className="text-2xl sm:text-3xl font-black text-[#033d59] dark:text-[#f8fafc] leading-none">
                                          {dateInfo.year}
                                        </span>
                                        <span className="text-xs font-bold tracking-wider uppercase mt-1" style={{ color: palette.color }}>
                                          {dateInfo.dayMonth}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Viñeta final inferior */}
                            <div className="relative z-10 flex justify-center mt-6">
                              <span className="px-3.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold tracking-wider shadow-xs">
                                INICIO HISTÓRICO
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sub-tab 3: Diagnósticos */}
                    {epicrisisSubTab === 'diagnosticos' && (
                      <div>
                        {(!epicrisisData.diagnosticos_historicos || epicrisisData.diagnosticos_historicos.length === 0) ? (
                          <div className="py-12 text-center text-slate-400 text-xs">
                            No hay diagnósticos históricos registrados en la epicrisis.
                          </div>
                        ) : (
                          <div className="max-h-[380px] overflow-y-auto border border-[#e2e8eb] dark:border-[#334155] rounded-xl overflow-hidden">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Código</th>
                                  <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Descripción Diagnóstica</th>
                                  <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Fecha</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {epicrisisData.diagnosticos_historicos.map((d: any, i: number) => (
                                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                    <td className="p-3 font-mono font-bold text-[#00aae1]">{d.codigo_cie10 || d.codigo || '—'}</td>
                                    <td className="p-3 text-slate-700 dark:text-slate-200">{d.descripcion || '—'}</td>
                                    <td className="p-3 text-slate-500 font-mono">{d.fecha || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sub-tab 4: Medicamentos */}
                    {epicrisisSubTab === 'medicamentos' && (
                      <div>
                        {medicamentosEpicrisis.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs">
                            No hay medicamentos recientes o históricos registrados en la epicrisis.
                          </div>
                        ) : (
                          <div className="max-h-[400px] overflow-y-auto border border-[#e2e8eb] dark:border-[#334155] rounded-xl">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Medicamento</th>
                                  <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Dosis</th>
                                  <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Frecuencia</th>
                                  <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Duración</th>
                                  <th className="p-3 font-bold text-slate-600 dark:text-slate-300 text-center">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {medicamentosEpicrisis.map((m: any, i: number) => {
                                  const isActivo = String(m.estado || '').toLowerCase().includes('activ');
                                  return (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                      <td className="p-3 font-bold text-[#033d59] dark:text-[#f8fafc]">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-md bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] flex items-center justify-center shrink-0">
                                            <Pill className="w-3.5 h-3.5" />
                                          </div>
                                          <span>{m.nombre || m.nombre_medicamento || m.medicamento || '—'}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-300">
                                        {m.dosis || '—'} {m.via_administracion ? `(${m.via_administracion})` : ''}
                                      </td>
                                      <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                                        {m.frecuencia || '—'}
                                      </td>
                                      <td className="p-3 text-slate-500 font-mono">
                                        {m.duracion || '—'}
                                      </td>
                                      <td className="p-3 text-center">
                                        {m.estado ? (
                                          <span
                                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                              isActivo
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                            }`}
                                          >
                                            {m.estado}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sub-tab 5: Actas Médicas Consolidadas */}
                    {epicrisisSubTab === 'actas' && (
                      <div>
                        {(!epicrisisData.actas_medicas || epicrisisData.actas_medicas.length === 0) ? (
                          <div className="py-12 text-center text-slate-400 text-xs">
                            No hay actas médicas previas consolidadas en esta epicrisis.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto">
                            {epicrisisData.actas_medicas.map((am: any, i: number) => (
                              <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
                                <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
                                  <span className="font-bold text-[#00aae1] dark:text-[#38bdf8] text-xs flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
                                    <span>Acta fecha: {am.fecha_acta_medica || '—'}</span>
                                  </span>
                                  {am.nivel_riesgo && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#effaff] text-[#00aae1] dark:bg-[#00aae1]/20 dark:text-[#38bdf8] border border-[#00aae1]/30">
                                      Riesgo Nivel {am.nivel_riesgo}
                                    </span>
                                  )}
                                </div>

                                {/* Análisis y Plan */}
                                <div>
                                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#00aae1] dark:text-[#38bdf8] mb-1">
                                    Análisis y Plan:
                                  </div>
                                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                                    {am.analisis_plan || 'Sin análisis registrado.'}
                                  </div>
                                </div>

                                {/* Observaciones */}
                                <div>
                                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Observaciones:
                                  </div>
                                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                                    {am.observaciones || 'Sin observaciones registradas.'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sub-tab 6: JSON Epicrisis */}
                    {epicrisisSubTab === 'json_epicrisis' && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-500">
                            JSON estructurado de la epicrisis:
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyEpicrisisJson}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] text-xs font-bold border border-[#00aae1]/30 hover:bg-[#00aae1]/25 transition-colors cursor-pointer"
                          >
                            {copiedEpicrisisJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedEpicrisisJson ? 'Copiado!' : 'Copiar JSON'}</span>
                          </button>
                        </div>
                        <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[360px] border border-slate-800">
                          {JSON.stringify(epicrisisData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white dark:bg-[#0f172a] border-t border-[#e2e8eb] dark:border-[#334155] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#033d59] dark:text-[#f8fafc] text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
