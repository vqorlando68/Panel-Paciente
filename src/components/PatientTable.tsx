import React, { useState, useMemo, useEffect } from 'react';
import {
  Patient,
  UserRole,
  ColumnGroup,
  EstadoPaciente,
  NivelRiesgo,
  FasePaciente,
  SpecialistKey,
  SpecialistInfo,
  COHORTE_OPTIONS,
  COORDINADORES_LIST,
} from '../types';
import { PatientHoverPopover } from './PatientHoverPopover';
import { AdherencePopover } from './AdherencePopover';
import { PatientCard } from './PatientCard';
import { SpecialistCard } from './SpecialistCard';
import { ThreeDotsMenu } from './ThreeDotsMenu';
import {
  AlertTriangle,
  Circle,
  FileText,
  Pencil,
  Stethoscope,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Lock,
  Plus,
  Activity,
  Eye,
  BarChart3,
  Users,
  Calendar,
  Bell,
  Clock,
  X,
  BarChart2,
  Compass,
} from 'lucide-react';

export type SortField =
  | 'nombre'
  | 'prioridadInicial'
  | 'convenioNombre'
  | 'cohorte'
  | 'riesgo'
  | 'etiqueta'
  | 'fase'
  | 'coordinador'
  | 'numeroCarga'
  | 'fechaProximaRevision'
  | 'med_gen'
  | 'nutri'
  | 'psicol'
  | 'med_dep'
  | 'med_int'
  | 'esp_1'
  | 'esp_2'
  | 'esp_3'
  | 'esp_4'
  | 'psiq'
  | 'uro'
  | 'fisiat';

export type SortDirection = 'asc' | 'desc';

export interface SpecialtyColumnDef {
  key: SpecialistKey;
  label: string;
}

const ALL_SPECIALTY_COLUMNS: SpecialtyColumnDef[] = [
  { key: 'med_gen', label: 'MEDICO GEN.' },
  { key: 'nutri',   label: 'NUTRICIONISTA' },
  { key: 'psicol',  label: 'PSICOLOGIA' },
  { key: 'med_dep', label: 'MED. DEPORTE' },
  { key: 'med_int', label: 'MED. INTERNA' },
  { key: 'esp_1',   label: 'CARDIOLOGÍA' },
  { key: 'esp_2',   label: 'ENDOCRINOLOGÍA' },
  { key: 'esp_3',   label: 'NEFROLOGÍA' },
  { key: 'esp_4',   label: 'NEUROLOGÍA' },
  { key: 'psiq',    label: 'PSIQUIATRÍA' },
  { key: 'uro',     label: 'UROLOGÍA' },
  { key: 'fisiat',  label: 'FISIATRÍA' },
];

/**
 * Determina si una especialidad tiene información clínica/citas asignadas
 * para un paciente dado. Si no tiene citas ni profesional asignado ni fechas,
 * se considera vacía/sin asignar.
 */
const specialistHasInfo = (spec?: SpecialistInfo | null): boolean => {
  if (!spec) return false;
  if (spec.attentionsHistory && spec.attentionsHistory.length > 0) return true;
  if (typeof spec.attentionsCount === 'number' && spec.attentionsCount > 0) return true;
  if (spec.lastAttentionCode && spec.lastAttentionCode.trim() !== '') return true;
  if (spec.lastAttentionDate && spec.lastAttentionDate.trim() !== '' && spec.lastAttentionDate.trim() !== '—') return true;
  if (spec.targetDate && spec.targetDate.trim() !== '' && spec.targetDate.trim() !== '—') return true;
  if (
    spec.professionalName &&
    spec.professionalName.trim() !== '' &&
    spec.professionalName.trim() !== '—' &&
    spec.professionalName.toLowerCase() !== 'sin asignar' &&
    spec.professionalName.toLowerCase() !== 'sin rellenar'
  ) {
    return true;
  }
  return false;
};

const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  acciones: 100,
  nombre: 240,
  equipoMedico: 110,
  col360: 80,
  convenioNombre: 170,
  cohorte: 140,
  riesgo: 95,
  etiqueta: 115,
  fase: 85,
  coordinador: 145,
  numeroCarga: 110,
  fechaProximaRevision: 135,
  med_gen: 155,
  nutri: 155,
  psicol: 155,
  med_dep: 155,
  med_int: 155,
  esp_1: 155,
  esp_2: 155,
  esp_3: 155,
  esp_4: 155,
  psiq: 155,
  uro: 155,
  fisiat: 155,
  nota_op: 56,
  nota_cli: 56,
};

export interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

interface PatientTableProps {
  patients: Patient[];
  activeRole: UserRole;
  columnGroup?: ColumnGroup;
  isLoading?: boolean;
  serverPagination?: ServerPaginationProps;
  onEditPatient: (patient: Patient) => void;
  onUpdatePrioridad?: (patientId: string, priority: number) => void;
  onUpdateStatus: (patientId: string, newStatus: EstadoPaciente) => void;
  onUpdateRisk: (patientId: string, newRisk: NivelRiesgo) => void;
  onUpdateCohorte?: (patientId: string, newCohorte: string) => void;
  onUpdateCoordinador?: (patientId: string, newCoordinador: string) => void;
  onOpenActa: (patient: Patient) => void;
  onOpenNotesDrawer: (patient: Patient, type: 'op' | 'cli') => void;
  onOpenEvolucion?: (patient: Patient) => void;
  onEditSpecialist: (patient: Patient, key: SpecialistKey, info: SpecialistInfo) => void;
  onOpenCostAnalysis: (patient: Patient) => void;
  onOpenCuadroMedico: (patient: Patient) => void;
  onOpenAgenda: (patient: Patient) => void;
  onOpenTasas: (patient: Patient) => void;
  onOpen360?: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  activeRole,
  columnGroup = 'coordinador',
  isLoading = false,
  serverPagination,
  onEditPatient,
  onUpdatePrioridad,
  onUpdateStatus,
  onUpdateRisk,
  onUpdateCohorte,
  onUpdateCoordinador,
  onOpenActa,
  onOpenNotesDrawer,
  onOpenEvolucion,
  onEditSpecialist,
  onOpenCostAnalysis,
  onOpenCuadroMedico,
  onOpenAgenda,
  onOpenTasas,
  onOpen360,
}) => {
  // Column Widths State (with localStorage persistence)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('panel_pacientes_col_widths');
      if (saved) {
        return { ...DEFAULT_COLUMN_WIDTHS, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_COLUMN_WIDTHS;
  });

  const resizingRef = React.useRef<{
    columnKey: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleResizeStart = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = {
      columnKey,
      startX: e.clientX,
      startWidth: columnWidths[columnKey] || DEFAULT_COLUMN_WIDTHS[columnKey] || 100,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const deltaX = moveEvent.clientX - resizingRef.current.startX;
      const minW = resizingRef.current.columnKey.startsWith('nota') ? 45 : 60;
      const newWidth = Math.max(minW, Math.round(resizingRef.current.startWidth + deltaX));

      setColumnWidths((prev) => {
        const next = { ...prev, [resizingRef.current!.columnKey]: newWidth };
        try {
          localStorage.setItem('panel_pacientes_col_widths', JSON.stringify(next));
        } catch (err) {}
        return next;
      });
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResetColumnWidths = () => {
    setColumnWidths(DEFAULT_COLUMN_WIDTHS);
    try {
      localStorage.removeItem('panel_pacientes_col_widths');
    } catch (e) {}
  };

  // Sort State
  const [sortField, setSortField] = useState<SortField | null>('prioridadInicial');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Interactive Menus State
  const [hoveredPatient, setHoveredPatient] = useState<{
    patient: Patient;
    position: { top: number; left: number };
  } | null>(null);

  const [activeMenuPatientId, setActiveMenuPatientId] = useState<string | null>(null);
  const [adherenciaPatientId, setAdherenciaPatientId] = useState<string | null>(null);
  const [activeAlarmTooltipPatientId, setActiveAlarmTooltipPatientId] = useState<string | null>(null);
  const [riskMenuPatientId, setRiskMenuPatientId] = useState<string | null>(null);
  const [cohorteMenuPatientId, setCohorteMenuPatientId] = useState<string | null>(null);
  const [coordinadorMenuPatientId, setCoordinadorMenuPatientId] = useState<string | null>(null);
  const [faseMenuPatientId, setFaseMenuPatientId] = useState<string | null>(null);
  const [priorityMenuPatientId, setPriorityMenuPatientId] = useState<string | null>(null);
  const [showRoleAlert, setShowRoleAlert] = useState(false);

  const isComite = activeRole === 'comite_medico';

  // Toggle Header Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted Patients Computation
  const sortedPatients = useMemo(() => {
    if (!sortField) return patients;

    return [...patients].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortField) {
        case 'nombre':
          valA = (a.nombre || '').toLowerCase();
          valB = (b.nombre || '').toLowerCase();
          break;
        case 'prioridadInicial':
          valA = a.prioridadInicial ?? 99;
          valB = b.prioridadInicial ?? 99;
          break;
        case 'convenioNombre':
          valA = (a.convenioNombre || '').toLowerCase();
          valB = (b.convenioNombre || '').toLowerCase();
          break;
        case 'cohorte':
          valA = (a.cohorte || '').toLowerCase();
          valB = (b.cohorte || '').toLowerCase();
          break;
        case 'riesgo':
          const riesgoWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          valA = a.riesgo ? (riesgoWeight[a.riesgo] || 0) : 0;
          valB = b.riesgo ? (riesgoWeight[b.riesgo] || 0) : 0;
          break;
        case 'etiqueta':
          valA = (a.etiqueta || a.retroalimentacion || '').toLowerCase();
          valB = (b.etiqueta || b.retroalimentacion || '').toLowerCase();
          break;
        case 'fase':
          valA = (a.fase || '').toLowerCase();
          valB = (b.fase || '').toLowerCase();
          break;
        case 'coordinador':
          valA = (a.coordinador || '').toLowerCase();
          valB = (b.coordinador || '').toLowerCase();
          break;
        case 'numeroCarga':
          valA = (a.numeroCarga || '').toLowerCase();
          valB = (b.numeroCarga || '').toLowerCase();
          break;
        case 'fechaProximaRevision':
          valA = a.fechaProximaRevision || '';
          valB = b.fechaProximaRevision || '';
          break;
        case 'med_gen':
        case 'nutri':
        case 'psicol':
        case 'med_dep':
        case 'med_int':
        case 'esp_1':
        case 'esp_2':
        case 'esp_3':
        case 'esp_4':
        case 'psiq':
        case 'uro':
        case 'fisiat':
          const specA = a.specialists?.[sortField];
          const specB = b.specialists?.[sortField];
          valA = (specA?.isOverdue ? '1_' : '0_') + (specA?.targetDate || '9999-99-99');
          valB = (specB?.isOverdue ? '1_' : '0_') + (specB?.targetDate || '9999-99-99');
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [patients, sortField, sortDirection]);

  // Pagination State (fallback for client-only)
  const [clientCurrentPage, setClientCurrentPage] = useState(1);
  const [clientItemsPerPage, setClientItemsPerPage] = useState(10);

  const isServerPaged = Boolean(serverPagination);
  const activeCurrentPage = isServerPaged ? serverPagination!.currentPage : clientCurrentPage;
  const activeItemsPerPage = isServerPaged ? serverPagination!.itemsPerPage : clientItemsPerPage;
  const activeTotalPages = isServerPaged
    ? Math.max(1, serverPagination!.totalPages)
    : Math.max(1, Math.ceil(sortedPatients.length / clientItemsPerPage));
  const activeTotalRecords = isServerPaged ? serverPagination!.totalRecords : sortedPatients.length;

  const startIndex = activeTotalRecords === 0 ? 0 : (activeCurrentPage - 1) * activeItemsPerPage;
  const endIndex = Math.min(activeTotalRecords, activeCurrentPage * activeItemsPerPage);
  const paginatedPatients = isServerPaged ? sortedPatients : sortedPatients.slice(startIndex, endIndex);

  // Evaluar las especialidades que tienen información en los registros que se están visualizando en la página actual
  const visibleSpecialtyColumns = useMemo(() => {
    if (!paginatedPatients || paginatedPatients.length === 0) {
      return ALL_SPECIALTY_COLUMNS.slice(0, 3);
    }
    const colsWithData = ALL_SPECIALTY_COLUMNS.filter((col) =>
      paginatedPatients.some((patient) => specialistHasInfo(patient.specialists?.[col.key]))
    );
    // Si ninguna especialidad tiene datos en la página actual, mostramos al menos las 3 base
    return colsWithData.length > 0 ? colsWithData : ALL_SPECIALTY_COLUMNS.slice(0, 3);
  }, [paginatedPatients]);

  const totalColSpan = (columnGroup === 'clinico' ? 10 : 13) + visibleSpecialtyColumns.length;

  // Reset to page 1 if current page becomes out of bounds or filters change
  useEffect(() => {
    if (!isServerPaged && clientCurrentPage > activeTotalPages) {
      setClientCurrentPage(1);
    }
  }, [isServerPaged, sortedPatients.length, activeTotalPages, clientCurrentPage]);

  // Handle patient name click for popover toggle
  const handleNameClick = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    if (hoveredPatient?.patient.id === patient.id) {
      setHoveredPatient(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredPatient({
        patient,
        position: {
          top: rect.bottom + 8,
          left: rect.left,
        },
      });
    }
  };

  const handleRiskClick = (patient: Patient) => {
    if (!isComite) {
      setShowRoleAlert(true);
      setTimeout(() => setShowRoleAlert(false), 3500);
      return;
    }
    setRiskMenuPatientId(riskMenuPatientId === patient.id ? null : patient.id);
  };

  const renderRiskIcon = (risk: NivelRiesgo) => {
    switch (risk) {
      case 'Critical':
        return (
          <div className="flex items-center justify-center text-[#e11d48]" title="Riesgo Crítico">
            <AlertTriangle className="w-4 h-4 fill-[#e11d48]/20 stroke-[2.5]" />
          </div>
        );
      case 'High':
        return (
          <div className="flex items-center justify-center text-[#e11d48]" title="Riesgo Alto">
            <Circle className="w-3.5 h-3.5 fill-[#e11d48] stroke-none" />
          </div>
        );
      case 'Medium':
        return (
          <div className="flex items-center justify-center text-[#d97706]" title="Riesgo Medio">
            <Circle className="w-3.5 h-3.5 fill-[#fbbf24] stroke-none" />
          </div>
        );
      case 'Low':
        return (
          <div className="flex items-center justify-center text-[#01ae6c]" title="Riesgo Bajo">
            <Circle className="w-3.5 h-3.5 fill-[#01ae6c] stroke-none" />
          </div>
        );
    }
  };

  const renderPrioridadBadge = (patient: Patient) => {
    const val = patient.prioridadInicial ?? 1;

    return (
      <div className="relative font-sans text-center inline-block">
        {isComite ? (
          <button
            onClick={() => setPriorityMenuPatientId(priorityMenuPatientId === patient.id ? null : patient.id)}
            className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#effaff] text-[#00aae1] border border-[#00aae1]/30 hover:bg-[#dff4ff] transition-all flex items-center gap-1 cursor-pointer mx-auto"
            title="Cambiar Prioridad Inicial (1 - 10)"
          >
            <span>P-{val}</span>
            <ChevronDown className="w-3 h-3 text-[#00aae1] shrink-0" />
          </button>
        ) : (
          <span
            className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#f9fafb] text-[#035476] border border-[#e2e8eb] inline-flex items-center gap-1 cursor-default"
            title="Prioridad Inicial (Sólo editable por Comité Médico)"
          >
            <span>P-{val}</span>
            <Lock className="w-2.5 h-2.5 text-gray-400" />
          </span>
        )}

        {priorityMenuPatientId === patient.id && isComite && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-[#e2e8eb] dark:border-[#334155] p-1.5 w-28 text-xs font-medium space-y-0.5 max-h-48 overflow-y-auto">
            <div className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] px-2 py-1 uppercase tracking-wider border-b border-[#e2e8eb] dark:border-[#334155] mb-1">
              Prioridad
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pNum) => (
              <button
                key={pNum}
                onClick={() => {
                  if (onUpdatePrioridad) {
                    onUpdatePrioridad(patient.id, pNum);
                  } else {
                    onEditPatient({ ...patient, prioridadInicial: pNum });
                  }
                  setPriorityMenuPatientId(null);
                }}
                className={`w-full text-center px-2 py-1 rounded-md text-xs font-bold hover:bg-[#effaff] dark:hover:bg-[#0f172a] cursor-pointer transition-colors ${
                  val === pNum ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8]' : 'text-[#033d59] dark:text-[#f8fafc]'
                }`}
              >
                P-{pNum}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCoordinadorBadge = (patient: Patient) => {
    return (
      <div className="relative font-sans inline-block">
        <button
          onClick={() => setCoordinadorMenuPatientId(coordinadorMenuPatientId === patient.id ? null : patient.id)}
          className="px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer bg-[#effaff] dark:bg-[#00aae1]/20 text-[#033d59] dark:text-[#f8fafc] border-[#00aae1]/30 hover:bg-[#dff4ff]"
          title={`Coordinador: ${patient.coordinador}. Clic para cambiar.`}
        >
          <span className="truncate max-w-[125px]">{patient.coordinador || 'Sin asignar'}</span>
          <ChevronDown className="w-3 h-3 text-[#00aae1] dark:text-[#38bdf8] shrink-0" />
        </button>

        {coordinadorMenuPatientId === patient.id && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-[#e2e8eb] dark:border-[#334155] p-1.5 w-48 max-h-56 overflow-y-auto text-xs font-medium space-y-0.5">
            <div className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] px-2 py-1 uppercase tracking-wider border-b border-[#e2e8eb] dark:border-[#334155] mb-1">
              Coordinador
            </div>
            {COORDINADORES_LIST.map((coord) => (
              <button
                key={coord}
                onClick={() => {
                  if (onUpdateCoordinador) {
                    onUpdateCoordinador(patient.id, coord);
                  } else {
                    onEditPatient({ ...patient, coordinador: coord });
                  }
                  setCoordinadorMenuPatientId(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] hover:bg-[#effaff] dark:hover:bg-[#0f172a] cursor-pointer transition-colors ${
                  patient.coordinador === coord ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] font-bold' : 'text-[#033d59] dark:text-[#f8fafc]'
                }`}
              >
                {coord}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCohorteBadge = (patient: Patient) => {
    const rawVal = patient.cohorte || patient.estado || (patient.id_estado_cohorte === 7 ? 'ACTIVO' : '') || '';
    const estadoUpper = String(rawVal).toUpperCase().trim();

    let style = 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]/30 hover:bg-[#dff4ff]';
    if (['ACTIVO', 'ACEPTADO', 'ESTRATIFICADO'].some((s) => estadoUpper.includes(s))) {
      style = 'bg-[#ebfef4] dark:bg-emerald-950/40 text-[#01ae6c] dark:text-emerald-300 border-[#01ae6c]/30 hover:bg-[#d0fbe2]';
    } else if (['RECHAZADO', 'ERRORES', 'DESERTADO', 'FALLECIDO I', 'FALLECIDO II', 'FALLECIDOS III', 'RECHAZA EL SERVICIO'].some((s) => estadoUpper.includes(s))) {
      style = 'bg-[#fff1f2] dark:bg-rose-950/40 text-[#e11d48] dark:text-rose-300 border-[#e11d48]/30 hover:bg-[#ffe4e6]';
    } else if (['PROSPECTO', 'INTERESADO', 'PENDIENTE DE CONTACTO', 'NO RESPUESTA'].some((s) => estadoUpper.includes(s))) {
      style = 'bg-[#fffbeb] dark:bg-amber-950/40 text-[#b45309] dark:text-amber-300 border-[#fbbf24]/40 hover:bg-[#fef3c7]';
    }

    const currentOption = COHORTE_OPTIONS.find((c) => c.code.toUpperCase() === estadoUpper || c.label.toUpperCase() === estadoUpper);
    const displayCode = currentOption ? currentOption.code : (rawVal || 'Sin asignar');

    return (
      <div className="relative font-sans inline-block">
        <button
          onClick={() => setCohorteMenuPatientId(cohorteMenuPatientId === patient.id ? null : patient.id)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${style}`}
          title={`Estado Cohorte: ${currentOption?.label || rawVal || 'Sin asignar'}. Clic para cambiar.`}
        >
          <span className="truncate max-w-[110px]">{displayCode}</span>
          <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
        </button>

        {cohorteMenuPatientId === patient.id && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-[#e2e8eb] dark:border-[#334155] p-1.5 w-72 max-h-60 overflow-y-auto text-xs font-medium space-y-0.5">
            <div className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] px-2 py-1 uppercase tracking-wider border-b border-[#e2e8eb] dark:border-[#334155] mb-1">
              Estado Cohorte
            </div>
            {COHORTE_OPTIONS.map((coh) => (
              <button
                key={coh.code}
                onClick={() => {
                  if (onUpdateCohorte) {
                    onUpdateCohorte(patient.id, coh.code);
                  } else {
                    onEditPatient({ ...patient, cohorte: coh.code, estado: coh.code as any });
                  }
                  setCohorteMenuPatientId(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] hover:bg-[#effaff] dark:hover:bg-[#0f172a] cursor-pointer transition-colors flex flex-col ${
                  estadoUpper === coh.code.toUpperCase() ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] font-bold' : 'text-[#033d59] dark:text-[#f8fafc]'
                }`}
                title={coh.label}
              >
                <span className="font-bold">{coh.code}</span>
                <span className="text-[10px] text-[#035476]/70 dark:text-gray-400 font-normal leading-tight">
                  {coh.label.includes(' - ') ? coh.label.split(' - ')[1] : coh.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFaseCell = (patient: Patient) => {
    let color = 'bg-[#f9fafb] dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc] border-[#e2e8eb] dark:border-[#334155]';
    let label: string = patient.fase;
    if (patient.fase === 'E') { color = 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'; }
    if (patient.fase === 'D') { color = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'; }
    if (patient.fase === 'I') { color = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'; }
    if (patient.fase === 'M/E') { color = 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'; }

    return (
      <div className="relative font-sans text-center inline-block">
        {isComite ? (
          <button
            onClick={() => setFaseMenuPatientId(faseMenuPatientId === patient.id ? null : patient.id)}
            className={`px-2 py-0.5 rounded font-extrabold text-[10px] border whitespace-nowrap cursor-pointer transition-all ${color}`}
            title="Clic para cambiar la Fase del paciente (Comité Médico)"
          >
            {label}
          </button>
        ) : (
          <span
            className={`px-2 py-0.5 rounded font-extrabold text-[10px] border whitespace-nowrap cursor-default ${color}`}
            title="Fase del paciente (E, D, I, M/E)"
          >
            {label}
          </span>
        )}

        {faseMenuPatientId === patient.id && isComite && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-[#e2e8eb] dark:border-[#334155] p-1.5 w-28 space-y-1">
            {(['E', 'D', 'I', 'M/E'] as FasePaciente[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  onEditPatient({ ...patient, fase: f });
                  setFaseMenuPatientId(null);
                }}
                className={`w-full text-center px-2 py-1 rounded-md text-xs font-bold hover:bg-[#effaff] dark:hover:bg-[#0f172a] cursor-pointer ${
                  patient.fase === f ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8]' : 'text-[#033d59] dark:text-[#f8fafc]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSpecialistCell = (patient: Patient, key: SpecialistKey) => {
    const data = patient.specialists?.[key];
    return (
      <SpecialistCard
        data={data}
        patientHasRehuso={patient.hasRehuso}
        onClick={() => onEditSpecialist(patient, key, data || {
          specialistTitle: key,
          professionalName: '—',
          lastAttentionDate: '—',
          frequency: 'Sin definir',
          targetDate: '—'
        })}
      />
    );
  };

  const renderHeader = (label: string, field: SortField, colKey: string, className: string = '') => {
    const isActive = sortField === field;
    const w = columnWidths[colKey] || DEFAULT_COLUMN_WIDTHS[colKey] || 120;
    return (
      <th
        onClick={() => handleSort(field)}
        style={{ width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` }}
        className={`sticky top-0 z-30 bg-[#f9fafb] dark:bg-[#0f172a] border-b border-[#e2e8eb] dark:border-[#334155] px-3 h-10 cursor-pointer transition-colors hover:bg-[#effaff] dark:hover:bg-[#334155] select-none relative group/th bg-clip-padding ${className}`}
        title={`Clic para ordenar por ${label}. Arrastre el borde derecho para ajustar el ancho.`}
      >
        <div className="flex items-center gap-1.5 justify-between pr-1">
          <span className="truncate">{label}</span>
          <span className="text-[#00aae1] dark:text-[#38bdf8] shrink-0">
            {isActive ? (
              sortDirection === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5" />
              )
            ) : (
              <ArrowUpDown className="w-3 h-3 text-[#035476]/40 dark:text-gray-500 hover:text-[#00aae1]" />
            )}
          </span>
        </div>

        {/* Column Resize Handle */}
        <div
          onMouseDown={(e) => handleResizeStart(e, colKey)}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-[#00aae1] active:bg-[#00aae1] z-30 opacity-0 group-hover/th:opacity-100 transition-opacity flex items-center justify-center"
          title="Arrastrar para cambiar ancho de columna"
        >
          <div className="w-[1.5px] h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
      </th>
    );
  };

  const totalTableWidth = useMemo(() => {
    const fixedCols =
      columnGroup === 'clinico'
        ? [
            'acciones',
            'nombre',
            'equipoMedico',
            'cohorte',
            'riesgo',
            'etiqueta',
            'fase',
            'fechaProximaRevision',
            'nota_op',
            'nota_cli',
          ]
        : [
            'acciones',
            'nombre',
            'convenioNombre',
            'cohorte',
            'riesgo',
            'etiqueta',
            'fase',
            'coordinador',
            'numeroCarga',
            'fechaProximaRevision',
            'nota_op',
            'nota_cli',
          ];
    const fixedSum = fixedCols.reduce(
      (sum, k) => sum + (columnWidths[k] || DEFAULT_COLUMN_WIDTHS[k] || 120),
      0
    );
    const specSum = visibleSpecialtyColumns.reduce(
      (sum, col) => sum + (columnWidths[col.key] || DEFAULT_COLUMN_WIDTHS[col.key] || 155),
      0
    );
    return fixedSum + specSum;
  }, [columnWidths, visibleSpecialtyColumns, columnGroup]);

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto touch-pan-x relative w-full bg-white dark:bg-[#1e293b] font-sans max-w-[1550px] mx-auto rounded-xl shadow-2xs border border-[#e2e8eb] dark:border-[#334155] my-2 transition-colors duration-200" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Toast Notification when SIAU tries to change Risk */}
      {showRoleAlert && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#fffbeb] dark:bg-amber-950 border border-[#fbbf24] dark:border-amber-600 text-[#b45309] dark:text-amber-200 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#fbbf24]" />
          <span>Acceso restringido: Solo el Comité Médico puede modificar el Nivel de Riesgo.</span>
        </div>
      )}

      {/* Main Table Structure (Resizable Columns) */}
      <table
        style={{ width: `${totalTableWidth}px`, minWidth: '100%', tableLayout: 'fixed' }}
        className="text-left border-collapse"
      >
        {/* Table Header (Sticky vertically on top-0) */}
        <thead className="sticky top-0 z-40 bg-[#f9fafb] dark:bg-[#0f172a] shadow-xs">
          <tr className="bg-[#f9fafb] dark:bg-[#0f172a] border-b border-[#e2e8eb] dark:border-[#334155] text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider select-none h-10">
            {/* Col 1: ACCIONES (Sticky on sm+ horizontally & top-0 vertically) */}
            <th
              style={{
                width: `${columnWidths.acciones}px`,
                minWidth: `${columnWidths.acciones}px`,
                maxWidth: `${columnWidths.acciones}px`,
              }}
              className="sticky top-0 sm:left-0 z-50 bg-[#f9fafb] dark:bg-[#0f172a] px-2 text-center border-r border-b border-[#e2e8eb] dark:border-[#334155] relative group/th select-none bg-clip-padding"
            >
              <span className="hidden sm:inline">ACCIONES</span>
              <span className="inline sm:hidden">ACC.</span>
              <div
                onMouseDown={(e) => handleResizeStart(e, 'acciones')}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-[#00aae1] active:bg-[#00aae1] z-30 opacity-0 group-hover/th:opacity-100 transition-opacity flex items-center justify-center"
                title="Arrastrar para cambiar ancho de columna"
              >
                <div className="w-[1.5px] h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            </th>

            {/* Col 2: PACIENTE (Sticky on sm+ horizontally & top-0 vertically) */}
            <th
              onClick={() => handleSort('nombre')}
              style={{
                width: `${columnWidths.nombre}px`,
                minWidth: `${columnWidths.nombre}px`,
                maxWidth: `${columnWidths.nombre}px`,
                left: `${columnWidths.acciones}px`,
              }}
              className="sticky top-0 sm:sticky z-50 bg-[#f9fafb] dark:bg-[#0f172a] px-3 border-r border-b border-[#e2e8eb] dark:border-[#334155] cursor-pointer hover:bg-[#effaff] dark:hover:bg-[#334155] transition-colors relative group/th select-none bg-clip-padding"
              title="Clic para ordenar por PACIENTE. Arrastre el borde derecho para cambiar ancho."
            >
              <div className="flex items-center gap-1.5 justify-between pr-1">
                <span>PACIENTE</span>
                <span className="text-[#00aae1] dark:text-[#38bdf8] shrink-0">
                  {sortField === 'nombre' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-[#035476]/40 dark:text-gray-500" />
                  )}
                </span>
              </div>
              <div
                onMouseDown={(e) => handleResizeStart(e, 'nombre')}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-[#00aae1] active:bg-[#00aae1] z-30 opacity-0 group-hover/th:opacity-100 transition-opacity flex items-center justify-center"
                title="Arrastrar para cambiar ancho de columna"
              >
                <div className="w-[1.5px] h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            </th>

            {/* Col 3: EQ. MÉDICO (Visible solo en Grupo Clínico, inmediatamente después de PACIENTE) */}
            {columnGroup === 'clinico' && (
              <th
                style={{
                  width: `${columnWidths.equipoMedico || DEFAULT_COLUMN_WIDTHS.equipoMedico || 110}px`,
                  minWidth: `${columnWidths.equipoMedico || DEFAULT_COLUMN_WIDTHS.equipoMedico || 110}px`,
                  maxWidth: `${columnWidths.equipoMedico || DEFAULT_COLUMN_WIDTHS.equipoMedico || 110}px`,
                }}
                className="sticky top-0 z-30 bg-[#f9fafb] dark:bg-[#0f172a] border-b border-[#e2e8eb] dark:border-[#334155] px-2 h-10 text-center select-none relative group/th bg-clip-padding"
                title="Equipo Médico Asignado. Arrastre el borde derecho para cambiar ancho."
              >
                <div className="flex items-center justify-center gap-1 text-[#00aae1] dark:text-[#38bdf8]">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">EQ. MÉDICO</span>
                </div>
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'equipoMedico')}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-[#00aae1] active:bg-[#00aae1] z-30 opacity-0 group-hover/th:opacity-100 transition-opacity flex items-center justify-center"
                  title="Arrastrar para cambiar ancho de columna"
                >
                  <div className="w-[1.5px] h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              </th>
            )}

            {/* Col 360 (Visible solo en Grupo Coordinador, inmediatamente después de PACIENTE) */}
            {columnGroup === 'coordinador' && (
              <th
                style={{
                  width: `${columnWidths.col360 || DEFAULT_COLUMN_WIDTHS.col360 || 80}px`,
                  minWidth: `${columnWidths.col360 || DEFAULT_COLUMN_WIDTHS.col360 || 80}px`,
                  maxWidth: `${columnWidths.col360 || DEFAULT_COLUMN_WIDTHS.col360 || 80}px`,
                }}
                className="sticky top-0 z-30 bg-[#f9fafb] dark:bg-[#0f172a] border-b border-[#e2e8eb] dark:border-[#334155] px-2 h-10 text-center select-none relative group/th bg-clip-padding"
                title="Evolución 360° del Paciente. Arrastre el borde derecho para cambiar ancho."
              >
                <div className="flex items-center justify-center gap-1 text-[#00aae1] dark:text-[#38bdf8]">
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">360</span>
                </div>
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'col360')}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-[#00aae1] active:bg-[#00aae1] z-30 opacity-0 group-hover/th:opacity-100 transition-opacity flex items-center justify-center"
                  title="Arrastrar para cambiar ancho de columna"
                >
                  <div className="w-[1.5px] h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              </th>
            )}

            {/* Col CONVENIO (Solo visible en Grupo Coordinador) */}
            {columnGroup === 'coordinador' && renderHeader('CONV.', 'convenioNombre', 'convenioNombre')}

            {/* Col ESTADO / COHORTE (Visible en ambos grupos) */}
            {renderHeader('ESTADO', 'cohorte', 'cohorte')}

            {/* Col RIESGO (Visible en ambos grupos) */}
            {renderHeader('RIESGO', 'riesgo', 'riesgo', 'text-center')}

            {/* Col ETIQUETA (Visible en ambos grupos) */}
            {renderHeader('ETIQUETA', 'etiqueta', 'etiqueta', 'text-center')}

            {/* Col FASE (Visible en ambos grupos) */}
            {renderHeader('FASE', 'fase', 'fase', 'text-center')}

            {/* Col COORDINADOR (Solo visible en Grupo Coordinador) */}
            {columnGroup === 'coordinador' && renderHeader('COORDINADOR', 'coordinador', 'coordinador')}

            {/* Col N° CARGA (Solo visible en Grupo Coordinador) */}
            {columnGroup === 'coordinador' && renderHeader('N° CARGA', 'numeroCarga', 'numeroCarga', 'text-center')}

            {/* Col FECHA PROX. REVISIÓN (Visible en ambos grupos) */}
            {renderHeader('FECHA PROX. REVISIÓN', 'fechaProximaRevision', 'fechaProximaRevision', 'text-center')}

            {/* Columnas Dinámicas de Especialidades (solo las que tienen información en la página actual) */}
            {visibleSpecialtyColumns.map((col, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === visibleSpecialtyColumns.length - 1;
              const borderClasses = [
                isFirst ? 'border-l border-[#e2e8eb] dark:border-[#334155]' : '',
                isLast ? 'border-r border-[#e2e8eb] dark:border-[#334155]' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <React.Fragment key={col.key}>
                  {renderHeader(col.label, col.key as SortField, col.key, borderClasses)}
                </React.Fragment>
              );
            })}

            {/* Col NOTA OP (Visible en Grupo Coordinador y Clínico, Sticky on sm+) */}
            <th
              style={{
                width: `${columnWidths.nota_op}px`,
                minWidth: `${columnWidths.nota_op}px`,
                maxWidth: `${columnWidths.nota_op}px`,
                right: `${columnWidths.nota_cli}px`,
              }}
              className="sticky top-0 sm:sticky z-50 bg-[#f9fafb] dark:bg-[#0f172a] px-2 text-center border-l border-b border-[#e2e8eb] dark:border-[#334155] relative group/th select-none bg-clip-padding"
            >
              <span>NOTA OP</span>
              <div
                onMouseDown={(e) => handleResizeStart(e, 'nota_op')}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-[#00aae1] active:bg-[#00aae1] z-30 opacity-0 group-hover/th:opacity-100 transition-opacity flex items-center justify-center"
                title="Arrastrar para cambiar ancho de columna"
              >
                <div className="w-[1.5px] h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            </th>

            {/* Col NOTA CLI (Visible en Grupo Coordinador y Clínico, Sticky on sm+) */}
            <th
              style={{
                width: `${columnWidths.nota_cli}px`,
                minWidth: `${columnWidths.nota_cli}px`,
                maxWidth: `${columnWidths.nota_cli}px`,
              }}
              className="sticky top-0 sm:sticky right-0 z-50 bg-[#f9fafb] dark:bg-[#0f172a] px-2 text-center border-l border-b border-[#e2e8eb] dark:border-[#334155] relative group/th select-none bg-clip-padding"
            >
              <span>NOTA CLI</span>
              <div
                onMouseDown={(e) => handleResizeStart(e, 'nota_cli')}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-[#00aae1] active:bg-[#00aae1] z-30 opacity-0 group-hover/th:opacity-100 transition-opacity flex items-center justify-center"
                title="Arrastrar para cambiar ancho de columna"
              >
                <div className="w-[1.5px] h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#e2e8eb] dark:divide-[#334155] text-xs bg-white dark:bg-[#1e293b]">
          {isLoading ? (
            <tr>
              <td colSpan={totalColSpan} className="py-16 text-center text-[#00aae1] dark:text-[#38bdf8] font-medium">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-[#00aae1] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#035476] dark:text-[#94a3b8]">Cargando pacientes desde Oracle Database...</span>
                </div>
              </td>
            </tr>
          ) : sortedPatients.length === 0 ? (
            <tr>
              <td colSpan={totalColSpan} className="py-12 text-center text-[#035476] dark:text-[#94a3b8] font-medium">
                No se encontraron pacientes que coincidan con los criterios de búsqueda.
              </td>
            </tr>
          ) : (
            paginatedPatients.map((patient) => {
              const isMenuOpen = activeMenuPatientId === patient.id;
              const isAlarmOpen = activeAlarmTooltipPatientId === patient.id;
              const isAdherenciaOpen = adherenciaPatientId === patient.id;
              const isCriticoTag = patient.tag_retroalimentacion === 'C' || patient.etiqueta === 'Crítico' || patient.etiqueta === 'Critico';
              const isInconformeTag = patient.tag_retroalimentacion === 'I' || patient.etiqueta === 'Inconforme' || patient.retroalimentacion === 'Inconforme';

              return (
                  <tr
                    key={patient.id}
                    className="hover:bg-[#f9fafb] dark:hover:bg-[#0f172a]/60 transition-colors group h-[72px]"
                  >
                  {/* Col 1: ACCIONES (Sticky on sm+) */}
                  <td
                    style={{
                      width: `${columnWidths.acciones}px`,
                      minWidth: `${columnWidths.acciones}px`,
                      maxWidth: `${columnWidths.acciones}px`,
                    }}
                    className={`bg-white dark:bg-[#1e293b] sm:sticky sm:left-0 group-hover:bg-[#f9fafb] dark:group-hover:bg-[#0f172a] px-2 py-1 border-r border-[#e2e8eb] dark:border-[#334155] relative ${
                      isMenuOpen || isAlarmOpen || isAdherenciaOpen ? 'z-30' : 'z-20'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      {/* Mini-Chart Adherencia Toggle Button */}
                      <button
                        type="button"
                        data-adherence-toggle="true"
                        onClick={() => setAdherenciaPatientId((prev) => (prev === patient.id ? null : patient.id))}
                        className={`p-1 rounded-md transition-all cursor-pointer border ${
                          isAdherenciaOpen
                            ? 'bg-[#00aae1] text-white border-[#00aae1] shadow-xs'
                            : 'bg-[#effaff] text-[#00aae1] hover:bg-[#00aae1] hover:text-white border-[#00aae1]/40'
                        }`}
                        title={isAdherenciaOpen ? 'Ocultar Adherencia' : 'Ver Adherencia (Gráfico de Barras)'}
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center justify-center gap-1">
                        {/* Bell Icon if alarm active */}
                        {patient.hasAlarm ? (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveAlarmTooltipPatientId(isAlarmOpen ? null : patient.id)}
                              className="p-1 rounded-md bg-[#fffbeb] text-[#b45309] hover:bg-[#fef3c7] border border-[#fbbf24] transition-colors cursor-pointer"
                              title="Ver Alerta de Gestión"
                            >
                              <Bell className="w-3.5 h-3.5 fill-[#fbbf24] text-[#b45309]" />
                            </button>

                            {/* Alarm Tooltip */}
                            {isAlarmOpen && (
                              <div className="absolute top-full left-0 mt-1 z-50 bg-[#fffbeb] border border-[#fbbf24] text-[#b45309] p-2.5 rounded-lg shadow-xl w-56 text-[10px] space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                <span className="font-bold block text-[#b45309] uppercase">Motivo de Alerta:</span>
                                <ul className="list-disc pl-3 space-y-0.5">
                                  {patient.alarmReasons.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-5" /> // spacer
                        )}

                        {/* 3 Vertical Dots Menu Component */}
                        <ThreeDotsMenu
                          patient={patient}
                          activeRole={activeRole}
                          isOpen={isMenuOpen}
                          onToggle={() => setActiveMenuPatientId(isMenuOpen ? null : patient.id)}
                          onOpenActas={(p) => onOpenActa(p)}
                          onOpenEvolucion={(p) => (onOpenEvolucion ? onOpenEvolucion(p) : onOpenNotesDrawer(p, 'cli'))}
                          onOpenNuevaActa={(p) => onOpenActa(p)}
                          onOpenCostos={(p) => onOpenCostAnalysis(p)}
                          onOpenCuadroMedico={(p) => onOpenCuadroMedico(p)}
                          onOpenAgenda={(p) => onOpenAgenda(p)}
                        />
                      </div>
                    </div>

                    {/* Adherence Popover anchored directly to ACCIONES cell */}
                    {isAdherenciaOpen && (
                      <AdherencePopover
                        patient={patient}
                        onClose={() => setAdherenciaPatientId(null)}
                      />
                    )}
                  </td>

                  {/* Col 2: PACIENTE (Sticky on sm+) */}
                  <td
                    style={{
                      width: `${columnWidths.nombre}px`,
                      minWidth: `${columnWidths.nombre}px`,
                      maxWidth: `${columnWidths.nombre}px`,
                      left: `${columnWidths.acciones}px`,
                    }}
                    className="bg-white dark:bg-[#1e293b] sm:sticky z-20 group-hover:bg-[#f9fafb] dark:group-hover:bg-[#0f172a] px-2 py-1.5 border-r border-[#e2e8eb] dark:border-[#334155] relative overflow-hidden"
                  >
                    <PatientCard
                      patient={patient}
                      onClick={() => onEditPatient(patient)}
                    />
                  </td>

                  {/* Col EQ. MÉDICO (Visible solo en Grupo Clínico, inmediatamente después de PACIENTE) */}
                  {columnGroup === 'clinico' && (
                    <td
                      style={{
                        width: `${columnWidths.equipoMedico || DEFAULT_COLUMN_WIDTHS.equipoMedico || 110}px`,
                        minWidth: `${columnWidths.equipoMedico || DEFAULT_COLUMN_WIDTHS.equipoMedico || 110}px`,
                        maxWidth: `${columnWidths.equipoMedico || DEFAULT_COLUMN_WIDTHS.equipoMedico || 110}px`,
                      }}
                      className="px-2 py-2 text-center"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenCuadroMedico(patient)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#effaff] dark:bg-[#00aae1]/20 hover:bg-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] hover:text-white transition-all border border-[#00aae1]/30 hover:border-[#00aae1] cursor-pointer shadow-2xs group/btn"
                        title="Ver Equipo Médico Asignado"
                      >
                        <Users className="w-3.5 h-3.5 text-[#00aae1] dark:text-[#38bdf8] group-hover/btn:text-white transition-colors" />
                        <span className="text-[11px] font-bold">Equipo</span>
                      </button>
                    </td>
                  )}

                  {/* Col 360 (Solo visible en Grupo Coordinador, inmediatamente después de PACIENTE) */}
                  {columnGroup === 'coordinador' && (
                    <td
                      style={{
                        width: `${columnWidths.col360 || DEFAULT_COLUMN_WIDTHS.col360 || 80}px`,
                        minWidth: `${columnWidths.col360 || DEFAULT_COLUMN_WIDTHS.col360 || 80}px`,
                        maxWidth: `${columnWidths.col360 || DEFAULT_COLUMN_WIDTHS.col360 || 80}px`,
                      }}
                      className="px-2 py-2 text-center"
                    >
                      <button
                        type="button"
                        onClick={() => onOpen360?.(patient)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 hover:bg-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] hover:text-white transition-all border border-cyan-200/80 dark:border-cyan-800/60 hover:border-[#00aae1] cursor-pointer shadow-2xs group/btn"
                        title="Abrir Evolución 360° del Paciente"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#00aae1] dark:text-[#38bdf8] group-hover/btn:text-white transition-colors" />
                        <span className="text-[11px] font-black">360°</span>
                      </button>
                    </td>
                  )}

                  {/* Col CONVENIO (Solo visible en Grupo Coordinador) */}
                  {columnGroup === 'coordinador' && (
                    <td
                      style={{
                        width: `${columnWidths.convenioNombre}px`,
                        minWidth: `${columnWidths.convenioNombre}px`,
                        maxWidth: `${columnWidths.convenioNombre}px`,
                      }}
                      className="px-3 py-2 text-[#033d59] dark:text-[#f8fafc] font-medium text-[11px] truncate"
                      title={patient.convenioNombre || ''}
                    >
                      {patient.convenioNombre}
                    </td>
                  )}

                  {/* Col 4: ESTADO / COHORTE (Visible en ambos grupos) */}
                  <td
                    style={{
                      width: `${columnWidths.cohorte}px`,
                      minWidth: `${columnWidths.cohorte}px`,
                      maxWidth: `${columnWidths.cohorte}px`,
                    }}
                    className="px-3 py-2"
                  >
                    {renderCohorteBadge(patient)}
                  </td>

                  {/* Col 5: RIESGO (Visible en ambos grupos) */}
                  <td
                    style={{
                      width: `${columnWidths.riesgo}px`,
                      minWidth: `${columnWidths.riesgo}px`,
                      maxWidth: `${columnWidths.riesgo}px`,
                    }}
                    className="px-3 py-2 text-center relative"
                  >
                    <button
                      onClick={() => handleRiskClick(patient)}
                      className="p-1 rounded-md hover:bg-[#effaff] dark:hover:bg-[#334155] transition-colors inline-flex items-center justify-center cursor-pointer"
                      title="Clic para cambiar nivel de riesgo (Comité Médico)"
                    >
                      {renderRiskIcon(patient.riesgo)}
                    </button>

                    {/* Risk Selector Dropdown */}
                    {riskMenuPatientId === patient.id && isComite && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-[#e2e8eb] dark:border-[#334155] p-1.5 w-32 space-y-1">
                        {(['Critical', 'High', 'Medium', 'Low'] as NivelRiesgo[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              onUpdateRisk(patient.id, r);
                              setRiskMenuPatientId(null);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium hover:bg-[#effaff] dark:hover:bg-[#0f172a] cursor-pointer ${
                              patient.riesgo === r ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] font-bold' : 'text-[#033d59] dark:text-[#f8fafc]'
                            }`}
                          >
                            {renderRiskIcon(r)}
                            <span>{r}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Col 6: ETIQUETA (Crítico 'C' o Inconforme 'I', Visible en ambos grupos) */}
                  <td
                    style={{
                      width: `${columnWidths.etiqueta}px`,
                      minWidth: `${columnWidths.etiqueta}px`,
                      maxWidth: `${columnWidths.etiqueta}px`,
                    }}
                    className="px-2 py-2 text-center"
                  >
                    {isCriticoTag ? (
                      <span
                        className="px-2 py-0.5 rounded bg-[#fff1f2] dark:bg-rose-950/50 text-[#e11d48] dark:text-rose-300 font-bold text-[10px] border border-[#fecdd3] dark:border-rose-800/60 inline-block shadow-2xs"
                        title="Tag de Retroalimentación: Crítico"
                      >
                        Crítico
                      </span>
                    ) : isInconformeTag ? (
                      <span
                        className="px-2 py-0.5 rounded bg-[#fffbeb] dark:bg-amber-950/50 text-[#b45309] dark:text-amber-300 font-bold text-[10px] border border-[#fde68a] dark:border-amber-700/60 inline-block shadow-2xs"
                        title="Tag de Retroalimentación: Inconforme"
                      >
                        Inconforme
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-[10px]">—</span>
                    )}
                  </td>

                  {/* Col 7: FASE (Visible en ambos grupos) */}
                  <td
                    style={{
                      width: `${columnWidths.fase}px`,
                      minWidth: `${columnWidths.fase}px`,
                      maxWidth: `${columnWidths.fase}px`,
                    }}
                    className="px-2 py-2 text-center"
                  >
                    {renderFaseCell(patient)}
                  </td>

                  {/* Col COORDINADOR (Solo visible en Grupo Coordinador) */}
                  {columnGroup === 'coordinador' && (
                    <td
                      style={{
                        width: `${columnWidths.coordinador}px`,
                        minWidth: `${columnWidths.coordinador}px`,
                        maxWidth: `${columnWidths.coordinador}px`,
                      }}
                      className="px-3 py-2"
                    >
                      {renderCoordinadorBadge(patient)}
                    </td>
                  )}

                  {/* Col N° CARGA (Solo visible en Grupo Coordinador) */}
                  {columnGroup === 'coordinador' && (
                    <td
                      style={{
                        width: `${columnWidths.numeroCarga}px`,
                        minWidth: `${columnWidths.numeroCarga}px`,
                        maxWidth: `${columnWidths.numeroCarga}px`,
                      }}
                      className="px-2 py-2 text-center font-mono text-[11px] text-[#033d59] dark:text-[#f8fafc] font-medium truncate"
                    >
                      {patient.numeroCarga || '—'}
                    </td>
                  )}

                  {/* Col 10: FECHA PROX. REVISIÓN (Visible en ambos grupos) */}
                  <td
                    style={{
                      width: `${columnWidths.fechaProximaRevision}px`,
                      minWidth: `${columnWidths.fechaProximaRevision}px`,
                      maxWidth: `${columnWidths.fechaProximaRevision}px`,
                    }}
                    className="px-2 py-2 text-center font-mono text-[11px] text-[#033d59] dark:text-[#f8fafc] truncate"
                  >
                    {patient.fechaProximaRevision || '—'}
                  </td>

                  {/* Columnas Dinámicas de Especialistas (evaluadas según la página actual, Visible en ambos) */}
                  {visibleSpecialtyColumns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        width: `${columnWidths[col.key] || DEFAULT_COLUMN_WIDTHS[col.key] || 155}px`,
                        minWidth: `${columnWidths[col.key] || DEFAULT_COLUMN_WIDTHS[col.key] || 155}px`,
                        maxWidth: `${columnWidths[col.key] || DEFAULT_COLUMN_WIDTHS[col.key] || 155}px`,
                      }}
                      className="px-1.5 py-1"
                    >
                      {renderSpecialistCell(patient, col.key)}
                    </td>
                  ))}

                  {/* Col NOTA OP (Visible en Grupo Coordinador y Clínico, Sticky on sm+) */}
                  <td
                    style={{
                      width: `${columnWidths.nota_op}px`,
                      minWidth: `${columnWidths.nota_op}px`,
                      maxWidth: `${columnWidths.nota_op}px`,
                      right: `${columnWidths.nota_cli}px`,
                    }}
                    className="bg-white dark:bg-[#1e293b] sm:sticky z-20 group-hover:bg-[#f9fafb] dark:group-hover:bg-[#0f172a] px-2 py-2 text-center border-l border-[#e2e8eb] dark:border-[#334155]"
                  >
                    <button
                      onClick={() => onOpenNotesDrawer(patient, 'op')}
                      className="relative p-1.5 rounded-lg bg-[#f9fafb] dark:bg-[#0f172a] hover:bg-[#033d59] dark:hover:bg-[#00aae1] text-[#033d59] dark:text-[#f8fafc] hover:text-white transition-all border border-[#e2e8eb] dark:border-[#334155] cursor-pointer"
                      title="Ver/Agregar Nota Operativa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      {patient.operationalNotes.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#033d59] dark:bg-[#00aae1] text-white text-[8px] font-bold flex items-center justify-center border border-white">
                          {patient.operationalNotes.length}
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Col NOTA CLI (Visible en Grupo Coordinador y Clínico, Sticky on sm+) */}
                  <td
                    style={{
                      width: `${columnWidths.nota_cli}px`,
                      minWidth: `${columnWidths.nota_cli}px`,
                      maxWidth: `${columnWidths.nota_cli}px`,
                    }}
                    className="bg-white dark:bg-[#1e293b] sm:sticky sm:right-0 z-20 group-hover:bg-[#f9fafb] dark:group-hover:bg-[#0f172a] px-2 py-2 text-center border-l border-[#e2e8eb] dark:border-[#334155]"
                  >
                    <button
                      onClick={() => onOpenNotesDrawer(patient, 'cli')}
                      className="relative p-1.5 rounded-lg bg-[#effaff] dark:bg-[#00aae1]/10 hover:bg-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] hover:text-white transition-all border border-[#00aae1]/30 cursor-pointer"
                      title="Ver/Agregar Nota Clínica"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      {patient.clinicalNotes.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00aae1] text-white text-[8px] font-bold flex items-center justify-center border border-white">
                          {patient.clinicalNotes.length}
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination Controls Bar */}
      <div className="bg-white dark:bg-[#1e293b] border-t border-[#e2e8eb] dark:border-[#334155] px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-[#035476] dark:text-[#94a3b8] rounded-b-xl shadow-2xs">
        {/* Left Side: Items per page selector & counter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Mostrar</span>
            <select
              value={activeItemsPerPage}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                if (isServerPaged) {
                  serverPagination!.onItemsPerPageChange(newSize);
                } else {
                  setClientItemsPerPage(newSize);
                  setClientCurrentPage(1);
                }
              }}
              className="bg-[#f8fafc] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-lg px-2.5 py-1 text-xs font-bold text-[#033d59] dark:text-[#f8fafc] focus:outline-hidden focus:ring-2 focus:ring-[#00aae1] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-500 dark:text-gray-400">registros por página</span>
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

          <span>
            Mostrando <strong className="text-[#033d59] dark:text-[#f8fafc]">{activeTotalRecords === 0 ? 0 : startIndex + 1}</strong> -{' '}
            <strong className="text-[#033d59] dark:text-[#f8fafc]">{endIndex}</strong> de{' '}
            <strong className="text-[#033d59] dark:text-[#f8fafc]">{activeTotalRecords}</strong> pacientes
          </span>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

          <button
            type="button"
            onClick={handleResetColumnWidths}
            className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-[#00aae1] dark:hover:text-[#38bdf8] transition-colors cursor-pointer border border-transparent hover:border-[#e2e8eb] dark:hover:border-[#334155] px-2 py-1 rounded-md flex items-center gap-1"
            title="Restablecer el ancho predeterminado de todas las columnas"
          >
            <span>Restablecer anchos de columnas</span>
          </button>
        </div>

        {/* Right Side: Page navigation controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const newP = Math.max(1, activeCurrentPage - 1);
              if (isServerPaged) {
                serverPagination!.onPageChange(newP);
              } else {
                setClientCurrentPage(newP);
              }
            }}
            disabled={activeCurrentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a] font-bold text-[#033d59] dark:text-[#f8fafc] hover:bg-[#00aae1] hover:text-white disabled:opacity-40 disabled:hover:bg-[#f8fafc] disabled:hover:text-[#033d59] transition-all cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <span className="px-3 py-1 text-xs font-bold text-[#035476] dark:text-[#94a3b8]">
            Página <strong className="text-[#00aae1] dark:text-[#38bdf8]">{activeCurrentPage}</strong> de{' '}
            <strong className="text-[#033d59] dark:text-[#f8fafc]">{activeTotalPages}</strong>
          </span>

          <button
            type="button"
            onClick={() => {
              const newP = Math.min(activeTotalPages, activeCurrentPage + 1);
              if (isServerPaged) {
                serverPagination!.onPageChange(newP);
              } else {
                setClientCurrentPage(newP);
              }
            }}
            disabled={activeCurrentPage === activeTotalPages || activeTotalPages === 0}
            className="px-3 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a] font-bold text-[#033d59] dark:text-[#f8fafc] hover:bg-[#00aae1] hover:text-white disabled:opacity-40 disabled:hover:bg-[#f8fafc] disabled:hover:text-[#033d59] transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Patient Hover Popover */}
      {hoveredPatient && (
        <PatientHoverPopover
          patient={hoveredPatient.patient}
          position={hoveredPatient.position}
          onClose={() => setHoveredPatient(null)}
          onClickEdit={() => {
            onEditPatient(hoveredPatient.patient);
            setHoveredPatient(null);
          }}
        />
      )}
    </div>
  );
};
