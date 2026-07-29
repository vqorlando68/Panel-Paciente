import React, { useState, useMemo } from 'react';
import {
  Patient,
  UserRole,
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
  | 'esp_1'
  | 'esp_2'
  | 'esp_3'
  | 'esp_4';

export type SortDirection = 'asc' | 'desc';

interface PatientTableProps {
  patients: Patient[];
  activeRole: UserRole;
  onEditPatient: (patient: Patient) => void;
  onUpdatePrioridad?: (patientId: string, priority: number) => void;
  onUpdateStatus: (patientId: string, newStatus: EstadoPaciente) => void;
  onUpdateRisk: (patientId: string, newRisk: NivelRiesgo) => void;
  onUpdateCohorte?: (patientId: string, newCohorte: string) => void;
  onUpdateCoordinador?: (patientId: string, newCoordinador: string) => void;
  onOpenActa: (patient: Patient) => void;
  onOpenNotesDrawer: (patient: Patient, type: 'op' | 'cli') => void;
  onEditSpecialist: (patient: Patient, key: SpecialistKey, info: SpecialistInfo) => void;
  onOpenCostAnalysis: (patient: Patient) => void;
  onOpenCuadroMedico: (patient: Patient) => void;
  onOpenAgenda: (patient: Patient) => void;
  onOpenTasas: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  activeRole,
  onEditPatient,
  onUpdatePrioridad,
  onUpdateStatus,
  onUpdateRisk,
  onUpdateCohorte,
  onUpdateCoordinador,
  onOpenActa,
  onOpenNotesDrawer,
  onEditSpecialist,
  onOpenCostAnalysis,
  onOpenCuadroMedico,
  onOpenAgenda,
  onOpenTasas,
}) => {
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
          valA = a.nombre.toLowerCase();
          valB = b.nombre.toLowerCase();
          break;
        case 'prioridadInicial':
          valA = a.prioridadInicial ?? 99;
          valB = b.prioridadInicial ?? 99;
          break;
        case 'convenioNombre':
          valA = a.convenioNombre.toLowerCase();
          valB = b.convenioNombre.toLowerCase();
          break;
        case 'cohorte':
          valA = (a.cohorte || '').toLowerCase();
          valB = (b.cohorte || '').toLowerCase();
          break;
        case 'riesgo':
          const riesgoWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          valA = riesgoWeight[a.riesgo] || 0;
          valB = riesgoWeight[b.riesgo] || 0;
          break;
        case 'etiqueta':
          valA = (a.etiqueta || a.retroalimentacion || '').toLowerCase();
          valB = (b.etiqueta || b.retroalimentacion || '').toLowerCase();
          break;
        case 'fase':
          valA = a.fase.toLowerCase();
          valB = b.fase.toLowerCase();
          break;
        case 'coordinador':
          valA = a.coordinador.toLowerCase();
          valB = b.coordinador.toLowerCase();
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
        case 'esp_1':
        case 'esp_2':
        case 'esp_3':
        case 'esp_4':
          const specA = a.specialists[sortField];
          const specB = b.specialists[sortField];
          valA = (specA?.isOverdue ? '1_' : '0_') + (specA?.targetDate || '9999-99-99');
          valB = (specB?.isOverdue ? '1_' : '0_') + (specB?.targetDate || '9999-99-99');
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [patients, sortField, sortDirection]);

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
    let style = 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]/30 hover:bg-[#dff4ff]';
    if (['ACTIVO', 'ACEPTADO', 'ESTRATIFICADO'].includes(patient.cohorte)) {
      style = 'bg-[#ebfef4] dark:bg-emerald-950/40 text-[#01ae6c] dark:text-emerald-300 border-[#01ae6c]/30 hover:bg-[#d0fbe2]';
    } else if (['RECHAZADO', 'ERRORES', 'DESERTADO', 'FALLECIDO I', 'FALLECIDO II', 'FALLECIDOS III', 'RECHAZA EL SERVICIO'].includes(patient.cohorte)) {
      style = 'bg-[#fff1f2] dark:bg-rose-950/40 text-[#e11d48] dark:text-rose-300 border-[#e11d48]/30 hover:bg-[#ffe4e6]';
    } else if (['PROSPECTO', 'INTERESADO', 'PENDIENTE DE CONTACTO', 'NO RESPUESTA'].includes(patient.cohorte)) {
      style = 'bg-[#fffbeb] dark:bg-amber-950/40 text-[#b45309] dark:text-amber-300 border-[#fbbf24]/40 hover:bg-[#fef3c7]';
    }

    const currentOption = COHORTE_OPTIONS.find((c) => c.code === patient.cohorte || c.label === patient.cohorte);
    const displayCode = currentOption ? currentOption.code : patient.cohorte;

    return (
      <div className="relative font-sans inline-block">
        <button
          onClick={() => setCohorteMenuPatientId(cohorteMenuPatientId === patient.id ? null : patient.id)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${style}`}
          title={`Estado Cohorte: ${currentOption?.label || patient.cohorte}. Clic para cambiar.`}
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
                    onEditPatient({ ...patient, cohorte: coh.code });
                  }
                  setCohorteMenuPatientId(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] hover:bg-[#effaff] dark:hover:bg-[#0f172a] cursor-pointer transition-colors flex flex-col ${
                  patient.cohorte === coh.code ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] font-bold' : 'text-[#033d59] dark:text-[#f8fafc]'
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

  const renderHeader = (label: string, field: SortField, className: string = '') => {
    const isActive = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`px-3 h-10 cursor-pointer transition-colors hover:bg-[#effaff] dark:hover:bg-[#334155] select-none ${className}`}
        title={`Clic para ordenar por ${label}`}
      >
        <div className="flex items-center gap-1.5 justify-between">
          <span>{label}</span>
          <span className="text-[#00aae1] dark:text-[#38bdf8]">
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
      </th>
    );
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto touch-pan-x relative w-full bg-white dark:bg-[#1e293b] font-sans max-w-[1550px] mx-auto rounded-xl shadow-2xs border border-[#e2e8eb] dark:border-[#334155] my-2 transition-colors duration-200" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Toast Notification when SIAU tries to change Risk */}
      {showRoleAlert && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#fffbeb] dark:bg-amber-950 border border-[#fbbf24] dark:border-amber-600 text-[#b45309] dark:text-amber-200 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#fbbf24]" />
          <span>Acceso restringido: Solo el Comité Médico puede modificar el Nivel de Riesgo.</span>
        </div>
      )}

      {/* Main Table Structure (14 Main Columns) */}
      <table className="w-full text-left border-collapse min-w-[2100px]">
        {/* Table Header */}
        <thead>
          <tr className="bg-[#f9fafb] dark:bg-[#0f172a] border-b border-[#e2e8eb] dark:border-[#334155] text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider select-none h-10">
            {/* Col 1: ACCIONES (Sticky on sm+) */}
            <th className="sm:sticky sm:left-0 z-30 bg-[#f9fafb] dark:bg-[#0f172a] px-2 text-center border-r border-[#e2e8eb] dark:border-[#334155] min-w-[80px] sm:min-w-[100px] max-w-[80px] sm:max-w-[100px]">
              <span className="hidden sm:inline">ACCIONES</span>
              <span className="inline sm:hidden">ACC.</span>
            </th>

            {/* Col 2: PACIENTE (Sticky on sm+) */}
            <th
              onClick={() => handleSort('nombre')}
              className="sm:sticky sm:left-[100px] z-30 bg-[#f9fafb] dark:bg-[#0f172a] px-3 border-r border-[#e2e8eb] dark:border-[#334155] min-w-[240px] max-w-[240px] cursor-pointer hover:bg-[#effaff] dark:hover:bg-[#334155] transition-colors"
            >
              <div className="flex items-center gap-1.5 justify-between">
                <span>PACIENTE</span>
                <span className="text-[#00aae1] dark:text-[#38bdf8]">
                  {sortField === 'nombre' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-[#035476]/40 dark:text-gray-500" />
                  )}
                </span>
              </div>
            </th>

            {/* Col 4: CONVENIO */}
            {renderHeader('CONV.', 'convenioNombre', 'min-w-[120px] sm:min-w-[170px]')}

            {/* Col 5: ESTADO / COHORTE */}
            {renderHeader('ESTADO', 'cohorte', 'min-w-[100px] sm:min-w-[140px]')}

            {/* Col 6: RIESGO */}
            {renderHeader('RIESGO', 'riesgo', 'min-w-[90px] text-center')}

            {/* Col 7: ETIQUETA */}
            {renderHeader('ETIQUETA', 'etiqueta', 'min-w-[110px] text-center')}

            {/* Col 8: FASE */}
            {renderHeader('FASE', 'fase', 'min-w-[80px] text-center')}

            {/* Col 9: COORDINADOR */}
            {renderHeader('COORDINADOR', 'coordinador', 'min-w-[140px]')}

            {/* Col 10: N° CARGA */}
            {renderHeader('N° CARGA', 'numeroCarga', 'min-w-[110px] text-center')}

            {/* Col 11: FECHA PROX. REVISIÓN */}
            {renderHeader('FECHA PROX. REVISIÓN', 'fechaProximaRevision', 'min-w-[130px] text-center')}

            {/* Col 12: ESPECIALISTAS (7 Subcolumns) */}
            {renderHeader('MEDICO GEN.', 'med_gen', 'min-w-[155px] bg-[#f9fafb] dark:bg-[#0f172a] border-l border-[#e2e8eb] dark:border-[#334155] text-[#033d59] dark:text-[#f8fafc]')}
            {renderHeader('NUTRICIONISTA', 'nutri', 'min-w-[155px] bg-[#f9fafb] dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc]')}
            {renderHeader('PSICOLOGIA', 'psicol', 'min-w-[155px] bg-[#f9fafb] dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc]')}
            {renderHeader('ESP. 1', 'esp_1', 'min-w-[155px] bg-[#f9fafb] dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc]')}
            {renderHeader('ESP. 2', 'esp_2', 'min-w-[155px] bg-[#f9fafb] dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc]')}
            {renderHeader('ESP. 3', 'esp_3', 'min-w-[155px] bg-[#f9fafb] dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc]')}
            {renderHeader('ESP. 4', 'esp_4', 'min-w-[155px] bg-[#f9fafb] dark:bg-[#0f172a] border-r border-[#e2e8eb] dark:border-[#334155] text-[#033d59] dark:text-[#f8fafc]')}

            {/* Col 13: NOTA OP (Sticky on sm+) */}
            <th className="sm:sticky sm:right-[56px] z-20 bg-[#f9fafb] dark:bg-[#0f172a] px-2 text-center border-l border-[#e2e8eb] dark:border-[#334155] min-w-[56px] max-w-[56px]">
              NOTA OP
            </th>

            {/* Col 14: NOTA CLI (Sticky on sm+) */}
            <th className="sm:sticky sm:right-0 z-20 bg-[#f9fafb] dark:bg-[#0f172a] px-2 text-center border-l border-[#e2e8eb] dark:border-[#334155] min-w-[56px] max-w-[56px]">
              NOTA CLI
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#e2e8eb] dark:divide-[#334155] text-xs bg-white dark:bg-[#1e293b]">
          {sortedPatients.length === 0 ? (
            <tr>
              <td colSpan={19} className="py-12 text-center text-[#035476] dark:text-[#94a3b8] font-medium">
                No se encontraron pacientes que coincidan con los criterios de búsqueda.
              </td>
            </tr>
          ) : (
            sortedPatients.map((patient) => {
              const isMenuOpen = activeMenuPatientId === patient.id;
              const isAlarmOpen = activeAlarmTooltipPatientId === patient.id;
              const isAdherenciaOpen = adherenciaPatientId === patient.id;
              const isInconforme = patient.etiqueta === 'Inconforme' || patient.retroalimentacion === 'Inconforme';

              return (
                  <tr
                    key={patient.id}
                    className="hover:bg-[#f9fafb] dark:hover:bg-[#0f172a]/60 transition-colors group h-[72px]"
                  >
                  {/* Col 1: ACCIONES (Sticky on sm+) */}
                  <td className={`bg-white dark:bg-[#1e293b] sm:sticky sm:left-0 group-hover:bg-[#f9fafb] dark:group-hover:bg-[#0f172a] px-2 py-1 border-r border-[#e2e8eb] dark:border-[#334155] min-w-[80px] sm:min-w-[100px] max-w-[80px] sm:max-w-[100px] relative ${
                    isMenuOpen || isAlarmOpen || isAdherenciaOpen ? 'z-40' : 'z-30'
                  }`}>
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
                          onOpenEvolucion={(p) => onOpenNotesDrawer(p, 'cli')}
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
                  <td className="bg-white dark:bg-[#1e293b] sm:sticky sm:left-[100px] z-30 group-hover:bg-[#f9fafb] dark:group-hover:bg-[#0f172a] px-2 py-1.5 border-r border-[#e2e8eb] dark:border-[#334155] min-w-[240px] max-w-[240px] relative">
                    <PatientCard
                      patient={patient}
                      onClick={() => onEditPatient(patient)}
                    />
                  </td>

                  {/* Col 4: CONVENIO */}
                  <td className="px-3 py-2 text-[#033d59] dark:text-[#f8fafc] font-medium text-[11px] truncate min-w-[120px] max-w-[120px] sm:min-w-[170px] sm:max-w-[170px]">
                    {patient.convenioNombre}
                  </td>

                  {/* Col 5: ESTADO / COHORTE */}
                  <td className="px-3 py-2 min-w-[100px] sm:min-w-[140px]">
                    {renderCohorteBadge(patient)}
                  </td>

                  {/* Col 6: RIESGO */}
                  <td className="px-3 py-2 text-center relative">
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

                  {/* Col 7: ETIQUETA (Badge Inconforme) */}
                  <td className="px-3 py-2 text-center">
                    {isInconforme ? (
                      <span className="px-2 py-0.5 rounded bg-[#fff1f2] dark:bg-[#be123c]/20 text-[#e11d48] dark:text-[#fb7185] font-bold text-[10px] border border-[#fecdd3] dark:border-[#be123c]/40 inline-block shadow-2xs">
                        Inconforme
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-[10px]">—</span>
                    )}
                  </td>

                  {/* Col 8: FASE */}
                  <td className="px-3 py-2 text-center">
                    {renderFaseCell(patient)}
                  </td>

                  {/* Col 9: COORDINADOR */}
                  <td className="px-3 py-2">
                    {renderCoordinadorBadge(patient)}
                  </td>

                  {/* Col 10: N° CARGA */}
                  <td className="px-3 py-2 text-center font-mono text-[11px] text-[#033d59] dark:text-[#f8fafc] font-medium">
                    {patient.numeroCarga || '—'}
                  </td>

                  {/* Col 11: FECHA PROX. REVISIÓN */}
                  <td className="px-3 py-2 text-center font-mono text-[11px] text-[#033d59] dark:text-[#f8fafc]">
                    {patient.fechaProximaRevision || '—'}
                  </td>

                  {/* Cols 12: ESPECIALISTAS (7 Columns) */}
                  <td className="px-1.5 py-1 min-w-[155px]">
                    {renderSpecialistCell(patient, 'med_gen')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[155px]">
                    {renderSpecialistCell(patient, 'nutri')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[155px]">
                    {renderSpecialistCell(patient, 'psicol')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[155px]">
                    {renderSpecialistCell(patient, 'esp_1')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[155px]">
                    {renderSpecialistCell(patient, 'esp_2')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[155px]">
                    {renderSpecialistCell(patient, 'esp_3')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[155px]">
                    {renderSpecialistCell(patient, 'esp_4')}
                  </td>

                  {/* Col 13: NOTA OP (Sticky on sm+) */}
                  <td className="bg-white dark:bg-[#1e293b] sm:sticky sm:right-[56px] z-20 group-hover:bg-[#f9fafb] dark:group-hover:bg-[#0f172a] px-2 py-2 text-center border-l border-[#e2e8eb] dark:border-[#334155] min-w-[56px] max-w-[56px]">
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

                  {/* Col 14: NOTA CLI (Sticky on sm+) */}
                  <td className="bg-white dark:bg-[#1e293b] sm:sticky sm:right-0 z-20 group-hover:bg-[#f9fafb] dark:group-hover:bg-[#0f172a] px-2 py-2 text-center border-l border-[#e2e8eb] dark:border-[#334155] min-w-[56px] max-w-[56px]">
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
