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
} from '../types';
import { PatientHoverPopover } from './PatientHoverPopover';
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
} from 'lucide-react';

export type SortField =
  | 'nombre'
  | 'tasa_c'
  | 'tasa_i'
  | 'tasa_r'
  | 'identificacion'
  | 'convenioNombre'
  | 'cohorte'
  | 'riesgo'
  | 'etiqueta'
  | 'retroalimentacion'
  | 'fase'
  | 'acta'
  | 'coordinador'
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
  onUpdateStatus: (patientId: string, newStatus: EstadoPaciente) => void;
  onUpdateRisk: (patientId: string, newRisk: NivelRiesgo) => void;
  onUpdateCohorte?: (patientId: string, newCohorte: string) => void;
  onUpdateRetro?: (patientId: string, newRetro: string) => void;
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
  onUpdateStatus,
  onUpdateRisk,
  onUpdateCohorte,
  onUpdateRetro,
  onOpenActa,
  onOpenNotesDrawer,
  onEditSpecialist,
  onOpenCostAnalysis,
  onOpenCuadroMedico,
  onOpenAgenda,
  onOpenTasas,
}) => {
  // Sort State
  const [sortField, setSortField] = useState<SortField | null>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Interactive Menus State
  const [hoveredPatient, setHoveredPatient] = useState<{
    patient: Patient;
    position: { top: number; left: number };
  } | null>(null);

  const [activeMenuPatientId, setActiveMenuPatientId] = useState<string | null>(null);
  const [activeAlarmTooltipPatientId, setActiveAlarmTooltipPatientId] = useState<string | null>(null);
  const [riskMenuPatientId, setRiskMenuPatientId] = useState<string | null>(null);
  const [cohorteMenuPatientId, setCohorteMenuPatientId] = useState<string | null>(null);
  const [faseMenuPatientId, setFaseMenuPatientId] = useState<string | null>(null);
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
        case 'tasa_c':
          valA = a.tasas.cancelacionesPct;
          valB = b.tasas.cancelacionesPct;
          break;
        case 'tasa_i':
          valA = a.tasas.inasistenciasPct;
          valB = b.tasas.inasistenciasPct;
          break;
        case 'tasa_r':
          valA = a.tasas.reprogramacionesPct;
          valB = b.tasas.reprogramacionesPct;
          break;
        case 'identificacion':
          valA = a.identificacion.toLowerCase();
          valB = b.identificacion.toLowerCase();
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
          valA = (a.etiqueta || '').toLowerCase();
          valB = (b.etiqueta || '').toLowerCase();
          break;
        case 'retroalimentacion':
          valA = (a.retroalimentacion || '').toLowerCase();
          valB = (b.retroalimentacion || '').toLowerCase();
          break;
        case 'fase':
          valA = a.fase.toLowerCase();
          valB = b.fase.toLowerCase();
          break;
        case 'acta':
          valA = a.acta.numero;
          valB = b.acta.numero;
          break;
        case 'coordinador':
          valA = a.coordinador.toLowerCase();
          valB = b.coordinador.toLowerCase();
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
    setRiskMenuPatientId(riskMenuPatientId === patient.id ? null : patient.id);
  };

  const renderRiskIcon = (risk: NivelRiesgo) => {
    switch (risk) {
      case 'Critical':
        return (
          <div className="flex items-center justify-center text-[#e11d48]" title="Riesgo Crítico (Triángulo Rojo)">
            <AlertTriangle className="w-4 h-4 fill-[#e11d48]/20 stroke-[2.5]" />
          </div>
        );
      case 'High':
        return (
          <div className="flex items-center justify-center text-[#e11d48]" title="Riesgo Alto (Círculo Rojo)">
            <Circle className="w-3.5 h-3.5 fill-[#e11d48] stroke-none" />
          </div>
        );
      case 'Medium':
        return (
          <div className="flex items-center justify-center text-[#fbbf24]" title="Riesgo Medio (Círculo Amarillo)">
            <Circle className="w-3.5 h-3.5 fill-[#fbbf24] stroke-none" />
          </div>
        );
      case 'Low':
        return (
          <div className="flex items-center justify-center text-[#01ae6c]" title="Riesgo Bajo (Círculo Verde)">
            <Circle className="w-3.5 h-3.5 fill-[#01ae6c] stroke-none" />
          </div>
        );
    }
  };

  const renderCohorteBadge = (patient: Patient) => {
    let style = 'bg-[#effaff] text-[#00aae1] border-[#00aae1]/30 hover:bg-[#dff4ff]';
    if (['ACTIVO', 'ACEPTADO', 'ESTRATIFICADO'].includes(patient.cohorte)) {
      style = 'bg-[#ebfef4] text-[#01ae6c] border-[#01ae6c]/30 hover:bg-[#d0fbe2]';
    } else if (['RECHAZADO', 'ERRORES', 'DESERTADO', 'FALLECIDO I', 'FALLECIDO II', 'FALLECIDOS III', 'RECHAZA EL SERVICIO'].includes(patient.cohorte)) {
      style = 'bg-[#fff1f2] text-[#e11d48] border-[#e11d48]/30 hover:bg-[#ffe4e6]';
    } else if (['PROSPECTO', 'INTERESADO', 'PENDIENTE DE CONTACTO', 'NO RESPUESTA'].includes(patient.cohorte)) {
      style = 'bg-[#fffbeb] text-[#b45309] border-[#fbbf24]/40 hover:bg-[#fef3c7]';
    }

    const currentOption = COHORTE_OPTIONS.find((c) => c.code === patient.cohorte || c.label === patient.cohorte);
    const displayCode = currentOption ? currentOption.code : patient.cohorte;
    const interpretationText = currentOption
      ? (currentOption.label.includes(' - ') ? currentOption.label.split(' - ')[1] : currentOption.label)
      : '';

    return (
      <div className="relative font-sans flex flex-col items-start gap-0.5">
        <button
          onClick={() => setCohorteMenuPatientId(cohorteMenuPatientId === patient.id ? null : patient.id)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${style}`}
          title={`Estado Cohorte: ${currentOption?.label || patient.cohorte}. Clic para cambiar.`}
        >
          <span className="truncate max-w-[120px]">{displayCode}</span>
          <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
        </button>
        {interpretationText && (
          <span
            className="text-[9.5px] text-[#035476]/80 font-normal truncate max-w-[140px] leading-tight"
            title={`Interpretación: ${interpretationText}`}
          >
            {interpretationText}
          </span>
        )}

        {cohorteMenuPatientId === patient.id && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-lg shadow-xl border border-[#e2e8eb] p-1.5 w-72 max-h-60 overflow-y-auto text-xs font-medium space-y-0.5">
            <div className="text-[10px] font-bold text-[#035476] px-2 py-1 uppercase tracking-wider border-b border-[#e2e8eb] mb-1">
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
                className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] hover:bg-[#effaff] cursor-pointer transition-colors flex flex-col ${
                  patient.cohorte === coh.code ? 'bg-[#effaff] text-[#00aae1] font-bold' : 'text-[#033d59]'
                }`}
                title={coh.label}
              >
                <span className="font-bold">{coh.code}</span>
                <span className="text-[10px] text-[#035476]/70 font-normal leading-tight">
                  {coh.label.includes(' - ') ? coh.label.split(' - ')[1] : coh.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRetroBadge = (patient: Patient) => {
    const isInconforme = patient.retroalimentacion === 'Inconforme';

    const toggleRetro = () => {
      const newRetro = isInconforme ? '' : 'Inconforme';
      if (onUpdateRetro) {
        onUpdateRetro(patient.id, newRetro);
      } else {
        onEditPatient({ ...patient, retroalimentacion: newRetro });
      }
    };

    return (
      <button
        onClick={toggleRetro}
        className="group/retro focus:outline-none cursor-pointer"
        title={isInconforme ? "Retroalimentación Inconforme. Clic para desmarcar." : "Clic para marcar como Inconforme"}
      >
        {isInconforme ? (
          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300 hover:bg-rose-200 transition-colors inline-block">
            Inconforme
          </span>
        ) : (
          <span className="text-gray-400 text-[10px] px-2 py-0.5 rounded border border-transparent group-hover/retro:border-rose-200 group-hover/retro:bg-rose-50 group-hover/retro:text-rose-600 transition-colors">
            —
          </span>
        )}
      </button>
    );
  };

  const renderFaseCell = (patient: Patient) => {
    let color = 'bg-[#f9fafb] text-[#033d59] border-[#e2e8eb]';
    let label: string = patient.fase;
    if (patient.fase === 'E') { color = 'bg-purple-50 text-purple-700 border-purple-200'; label = 'E: Eval.'; }
    if (patient.fase === 'D') { color = 'bg-blue-50 text-blue-700 border-blue-200'; label = 'D: Diag.'; }
    if (patient.fase === 'I') { color = 'bg-amber-50 text-amber-800 border-amber-200'; label = 'I: Interv.'; }
    if (patient.fase === 'M/E') { color = 'bg-teal-50 text-teal-700 border-teal-200'; label = 'M/E: Monit.'; }

    return (
      <div className="relative font-sans text-center">
        {isComite ? (
          <button
            onClick={() => setFaseMenuPatientId(faseMenuPatientId === patient.id ? null : patient.id)}
            className={`px-2 py-0.5 rounded font-bold text-[10px] border whitespace-nowrap cursor-pointer transition-all ${color}`}
            title="Clic para cambiar la Fase del paciente (Comité Médico)"
          >
            {label}
          </button>
        ) : (
          <span
            className={`px-2 py-0.5 rounded font-bold text-[10px] border whitespace-nowrap cursor-default ${color}`}
            title="Fase del paciente (Sólo editable por Comité Médico)"
          >
            {label}
          </span>
        )}

        {faseMenuPatientId === patient.id && isComite && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 bg-white rounded-lg shadow-xl border border-[#e2e8eb] p-1.5 w-32 space-y-1">
            {(['E', 'D', 'I', 'M/E'] as FasePaciente[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  onEditPatient({ ...patient, fase: f });
                  setFaseMenuPatientId(null);
                }}
                className={`w-full text-left px-2 py-1 rounded-md text-xs font-semibold hover:bg-[#effaff] cursor-pointer ${
                  patient.fase === f ? 'bg-[#effaff] text-[#00aae1]' : 'text-[#033d59]'
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
    const data = patient.specialists[key];
    if (!data) return <div className="text-[#035476] text-[10px]">—</div>;

    const isOverdue = data.isOverdue;

    return (
      <div
        onClick={() => onEditSpecialist(patient, key, data)}
        className={`p-1.5 rounded-md transition-all cursor-pointer text-[10px] space-y-0.5 border font-sans ${
          isOverdue
            ? 'bg-[#fffbeb] border-l-[3px] border-l-[#b45309] border-t-[#fbbf24]/50 border-r-[#fbbf24]/50 border-b-[#fbbf24]/50 text-[#b45309]'
            : 'bg-white border-[#e2e8eb] hover:border-[#00aae1] text-[#033d59]'
        }`}
        title={`Atención de ${data.specialistTitle}. Clic para editar.`}
      >
        <div className="font-semibold truncate text-[10px] leading-tight text-[#033d59]">
          {data.professionalName}
        </div>

        <div className="text-[9px] flex items-center justify-between opacity-90">
          <span className="text-[#035476]">Última:</span>
          <span className="font-mono text-[#033d59]">{data.lastAttentionDate}</span>
        </div>

        <div className="text-[9px] flex items-center justify-between opacity-80">
          <span className="text-[#035476]">Frec:</span>
          <span className="truncate max-w-[80px] text-[#033d59]">{data.frequency}</span>
        </div>

        <div className={`text-[9px] flex items-center justify-between font-mono font-medium ${
          isOverdue ? 'text-[#b45309] font-bold' : 'text-[#035476]'
        }`}>
          <span>Obj:</span>
          <span>{data.targetDate}</span>
        </div>
      </div>
    );
  };

  const renderHeader = (label: string, field: SortField, className: string = '') => {
    const isActive = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`px-3 h-10 cursor-pointer transition-colors hover:bg-[#effaff] select-none ${className}`}
        title={`Clic para ordenar por ${label}`}
      >
        <div className="flex items-center gap-1.5 justify-between">
          <span>{label}</span>
          <span className="text-[#00aae1]">
            {isActive ? (
              sortDirection === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5" />
              )
            ) : (
              <ArrowUpDown className="w-3 h-3 text-[#035476]/40 hover:text-[#00aae1]" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="flex-1 overflow-auto relative w-full bg-white font-sans max-w-[1550px] mx-auto rounded-xl shadow-2xs border border-[#e2e8eb] my-2">
      {/* Toast Notification when SIAU tries to change Risk */}
      {showRoleAlert && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#fffbeb] border border-[#fbbf24] text-[#b45309] px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#fbbf24]" />
          <span>Acceso restringido: Solo el Comité Médico puede modificar el Nivel de Riesgo.</span>
        </div>
      )}

      {/* Main Table Structure (21 Columns) */}
      <table className="w-full text-left border-collapse min-w-[2500px]">
        {/* Table Header */}
        <thead>
          <tr className="bg-[#f9fafb] border-b border-[#e2e8eb] text-[10px] font-bold text-[#035476] uppercase tracking-wider select-none h-10">
            {/* Col 1: ACCIONES (Sticky Left) */}
            <th className="sticky left-0 z-20 bg-[#f9fafb] px-2 text-center border-r border-[#e2e8eb] min-w-[110px] max-w-[110px]">
              ACCIONES
            </th>

            {/* Col 2: TASA (Sticky Left-[110px]) */}
            <th className="sticky left-[110px] z-20 bg-[#f9fafb] px-2 py-1 border-r border-[#e2e8eb] min-w-[170px] max-w-[170px] select-none">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-[#035476] text-[10px]">TASA</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleSort('tasa_c')}
                  className={`px-1 py-0.5 rounded text-[9px] font-bold border flex items-center gap-0.5 cursor-pointer transition-colors ${
                    sortField === 'tasa_c'
                      ? 'bg-rose-100 border-rose-300 text-rose-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  }`}
                  title="Ordenar por % Cancelaciones"
                >
                  <span>%C</span>
                  {sortField === 'tasa_c' && (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />)}
                </button>
                <button
                  type="button"
                  onClick={() => handleSort('tasa_i')}
                  className={`px-1 py-0.5 rounded text-[9px] font-bold border flex items-center gap-0.5 cursor-pointer transition-colors ${
                    sortField === 'tasa_i'
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                  title="Ordenar por % Inasistencias"
                >
                  <span>%I</span>
                  {sortField === 'tasa_i' && (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />)}
                </button>
                <button
                  type="button"
                  onClick={() => handleSort('tasa_r')}
                  className={`px-1 py-0.5 rounded text-[9px] font-bold border flex items-center gap-0.5 cursor-pointer transition-colors ${
                    sortField === 'tasa_r'
                      ? 'bg-sky-100 border-sky-300 text-sky-900'
                      : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                  }`}
                  title="Ordenar por % Reprogramaciones"
                >
                  <span>%R</span>
                  {sortField === 'tasa_r' && (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />)}
                </button>
              </div>
            </th>

            {/* Col 3: NOMBRE DEL PACIENTE (Sticky Left-[280px]) */}
            <th
              onClick={() => handleSort('nombre')}
              className="sticky left-[280px] z-20 bg-[#f9fafb] px-3 border-r border-[#e2e8eb] min-w-[220px] max-w-[220px] cursor-pointer hover:bg-[#effaff] transition-colors"
            >
              <div className="flex items-center gap-1.5 justify-between">
                <span>NOMBRE DEL PACIENTE</span>
                <span className="text-[#00aae1]">
                  {sortField === 'nombre' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-[#035476]/40" />
                  )}
                </span>
              </div>
            </th>

            {/* Col 4: IDENTIFICACIÓN */}
            {renderHeader('IDENTIFICACIÓN', 'identificacion', 'min-w-[130px]')}

            {/* Col 5: NOMBRE CONVENIO */}
            {renderHeader('NOMBRE CONVENIO', 'convenioNombre', 'min-w-[180px]')}

            {/* Col 6: RIESGO */}
            {renderHeader('RIESGO', 'riesgo', 'min-w-[80px] text-center')}

            {/* Col 7: ESTADO COHORTE */}
            {renderHeader('ESTADO COHORTE', 'cohorte', 'min-w-[140px]')}

            {/* Col 8: ETIQUETA */}
            {renderHeader('ETIQUETA', 'etiqueta', 'min-w-[110px]')}

            {/* Col 9: RETROALIMENTACIÓN */}
            {renderHeader('RETROALIMENTACIÓN', 'retroalimentacion', 'min-w-[140px]')}

            {/* Col 10: FASE */}
            {renderHeader('FASE', 'fase', 'min-w-[130px] text-center')}

            {/* Col 11: ACTA */}
            {renderHeader('ACTA', 'acta', 'min-w-[85px] text-center')}

            {/* Col 12: COORDINADOR */}
            {renderHeader('COORDINADOR', 'coordinador', 'min-w-[130px]')}

            {/* Cols 13 to 19: ESPECIALISTAS (7 Columns) */}
            {renderHeader('MEDICO GEN.', 'med_gen', 'min-w-[160px] bg-[#f9fafb] border-l border-[#e2e8eb] text-[#033d59]')}
            {renderHeader('NUTRICIONISTA', 'nutri', 'min-w-[160px] bg-[#f9fafb] text-[#033d59]')}
            {renderHeader('PSICOLOGIA', 'psicol', 'min-w-[160px] bg-[#f9fafb] text-[#033d59]')}
            {renderHeader('ESP. 1', 'esp_1', 'min-w-[160px] bg-[#f9fafb] text-[#033d59]')}
            {renderHeader('ESP. 2', 'esp_2', 'min-w-[160px] bg-[#f9fafb] text-[#033d59]')}
            {renderHeader('ESP. 3', 'esp_3', 'min-w-[160px] bg-[#f9fafb] text-[#033d59]')}
            {renderHeader('ESP. 4', 'esp_4', 'min-w-[160px] bg-[#f9fafb] border-r border-[#e2e8eb] text-[#033d59]')}

            {/* Col 20: NOTA OP (Sticky Right) */}
            <th className="sticky right-[56px] z-20 bg-[#f9fafb] px-2 text-center border-l border-[#e2e8eb] min-w-[56px] max-w-[56px]">
              NOTA OP
            </th>

            {/* Col 21: NOTA CLI (Sticky Right) */}
            <th className="sticky right-0 z-20 bg-[#f9fafb] px-2 text-center border-l border-[#e2e8eb] min-w-[56px] max-w-[56px]">
              NOTA CLI
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#e2e8eb] text-xs bg-white">
          {sortedPatients.length === 0 ? (
            <tr>
              <td colSpan={21} className="py-12 text-center text-[#035476] font-medium">
                No se encontraron pacientes que coincidan con los criterios de búsqueda.
              </td>
            </tr>
          ) : (
            sortedPatients.map((patient) => {
              const isMenuOpen = activeMenuPatientId === patient.id;
              const isAlarmOpen = activeAlarmTooltipPatientId === patient.id;

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-[#f9fafb] transition-colors group h-[72px]"
                >
                  {/* Col 1: ACCIONES (Sticky Left) */}
                  <td className={`sticky left-0 bg-white group-hover:bg-[#f9fafb] px-2 py-2 border-r border-[#e2e8eb] min-w-[110px] max-w-[110px] ${
                    isMenuOpen || isAlarmOpen ? 'z-40' : 'z-20'
                  }`}>
                    <div className="flex items-center justify-center gap-1.5">
                      
                      {/* Bell Icon if alarm active */}
                      {patient.hasAlarm ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveAlarmTooltipPatientId(isAlarmOpen ? null : patient.id)}
                            className="p-1 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-300 transition-colors cursor-pointer"
                            title="Ver Alerta de Gestión"
                          >
                            <Bell className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                          </button>

                          {/* Alarm Tooltip */}
                          {isAlarmOpen && (
                            <div className="absolute top-full left-0 mt-1 z-50 bg-[#fffbeb] border border-[#fbbf24] text-[#b45309] p-2.5 rounded-lg shadow-xl w-56 text-[10px] space-y-1 animate-in fade-in zoom-in-95 duration-150">
                              <span className="font-bold block text-amber-900 uppercase">Motivo de Alerta:</span>
                              <ul className="list-disc pl-3 space-y-0.5">
                                {patient.alarmReasons.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-6" /> // spacer
                      )}

                      {/* 3 Vertical Dots Menu Button */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuPatientId(isMenuOpen ? null : patient.id)}
                          className={`p-1.5 rounded-lg text-[#035476] hover:text-[#00aae1] hover:bg-[#effaff] transition-colors cursor-pointer ${
                            isMenuOpen ? 'bg-[#effaff] text-[#00aae1]' : ''
                          }`}
                          title="Menú de Opciones"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-[#e2e8eb] p-1.5 w-48 text-xs font-semibold space-y-1 animate-in fade-in zoom-in-95 duration-150">
                            {/* Option 1: Ver Acta */}
                            <button
                              onClick={() => {
                                onOpenActa(patient);
                                setActiveMenuPatientId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#00aae1]" />
                              <span>📄 Ver Acta</span>
                            </button>

                            {/* Option 2: Evolución */}
                            <button
                              onClick={() => {
                                onOpenNotesDrawer(patient, 'cli');
                                setActiveMenuPatientId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
                            >
                              <Activity className="w-3.5 h-3.5 text-[#00aae1]" />
                              <span>Evolución</span>
                            </button>

                            {/* Option 3: Nueva Acta */}
                            {activeRole === 'coordinadora_siau' ? (
                              <button
                                disabled
                                title="Solo el Comité Médico puede crear actas"
                                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-gray-400 bg-gray-50 cursor-not-allowed text-left opacity-70"
                              >
                                <span className="flex items-center gap-2">
                                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                                  <span>➕ Nueva Acta</span>
                                </span>
                                <Lock className="w-3 h-3 text-amber-500" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  onOpenActa(patient);
                                  setActiveMenuPatientId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
                              >
                                <Plus className="w-3.5 h-3.5 text-[#00aae1]" />
                                <span>➕ Nueva Acta</span>
                              </button>
                            )}

                            {/* DIVIDER */}
                            <div className="border-t border-[#e2e8eb] my-1" />

                            {/* Option 4: Costos */}
                            <button
                              onClick={() => {
                                onOpenCostAnalysis(patient);
                                setActiveMenuPatientId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
                            >
                              <BarChart3 className="w-3.5 h-3.5 text-[#00aae1]" />
                              <span>💰 Costos</span>
                            </button>

                            {/* Option 5: Cuadro Médico */}
                            <button
                              onClick={() => {
                                onOpenCuadroMedico(patient);
                                setActiveMenuPatientId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
                            >
                              <Users className="w-3.5 h-3.5 text-[#00aae1]" />
                              <span>👥 Cuadro Médico</span>
                            </button>

                            {/* Option 6: Agenda */}
                            <button
                              onClick={() => {
                                onOpenAgenda(patient);
                                setActiveMenuPatientId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
                            >
                              <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
                              <span>📅 Agenda</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </td>

                  {/* Col 2: TASA (Sticky Left-[110px]) */}
                  <td className="sticky left-[110px] z-20 bg-white group-hover:bg-[#f9fafb] px-2 py-2 border-r border-[#e2e8eb] min-w-[170px] max-w-[170px]">
                    <button
                      type="button"
                      onClick={() => onOpenTasas(patient)}
                      className="flex items-center justify-center gap-1 w-full hover:opacity-80 transition-opacity cursor-pointer"
                      title="Ver Detalle de Tasas"
                    >
                      <span className="px-1 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                        %C {patient.tasas.cancelacionesPct}%
                      </span>
                      <span className="px-1 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                        %I {patient.tasas.inasistenciasPct}%
                      </span>
                      <span className="px-1 py-0.5 rounded bg-sky-50 text-[#0284c7] font-bold text-[10px] border border-sky-200">
                        %R {patient.tasas.reprogramacionesPct}%
                      </span>
                    </button>
                  </td>

                  {/* Col 3: NOMBRE DEL PACIENTE (Sticky Left-[280px]) */}
                  <td className="sticky left-[280px] z-20 bg-white group-hover:bg-[#f9fafb] px-3 py-2 border-r border-[#e2e8eb] min-w-[220px] max-w-[220px]">
                    <div className="overflow-hidden flex items-center justify-between gap-1">
                      <div className="overflow-hidden">
                        <button
                          onClick={(e) => handleNameClick(e, patient)}
                          className="font-bold text-[#033d59] hover:text-[#00aae1] text-xs text-left truncate block max-w-[165px] transition-colors cursor-pointer"
                          title="Clic para ver u ocultar los datos del paciente"
                        >
                          {patient.nombre}
                        </button>
                        <span className="text-[10px] text-[#035476] block font-mono">
                          {patient.identificacion}
                        </span>
                      </div>

                      <button
                        onClick={() => onEditPatient(patient)}
                        className="p-1 rounded hover:bg-[#effaff] text-[#035476] hover:text-[#00aae1] transition-colors shrink-0 cursor-pointer"
                        title="Editar datos del paciente"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Col 4: ID */}
                  <td className="px-3 py-2 font-mono text-[#033d59] font-semibold text-[11px]">
                    {patient.identificacion}
                  </td>

                  {/* Col 5: NOMBRE CONVENIO */}
                  <td className="px-3 py-2 text-[#033d59] font-medium text-[11px] truncate max-w-[180px]">
                    {patient.convenioNombre}
                  </td>

                  {/* Col 6: RIESGO */}
                  <td className="px-3 py-2 text-center relative">
                    <button
                      onClick={() => handleRiskClick(patient)}
                      className="p-1 rounded-md hover:bg-[#effaff] transition-colors inline-flex items-center justify-center cursor-pointer"
                      title="Clic para cambiar nivel de riesgo"
                    >
                      {renderRiskIcon(patient.riesgo)}
                    </button>

                    {/* Risk Selector Dropdown */}
                    {riskMenuPatientId === patient.id && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 bg-white rounded-lg shadow-xl border border-[#e2e8eb] p-1.5 w-32 space-y-1">
                        {(['Critical', 'High', 'Medium', 'Low'] as NivelRiesgo[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              onUpdateRisk(patient.id, r);
                              setRiskMenuPatientId(null);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium hover:bg-[#effaff] cursor-pointer ${
                              patient.riesgo === r ? 'bg-[#effaff] text-[#00aae1] font-bold' : 'text-[#033d59]'
                            }`}
                          >
                            {renderRiskIcon(r)}
                            <span>{r}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Col 7: ESTADO COHORTE */}
                  <td className="px-3 py-2">
                    {renderCohorteBadge(patient)}
                  </td>

                  {/* Col 8: ETIQUETA */}
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] border bg-[#f9fafb] text-[#033d59] border-[#e2e8eb]">
                      {patient.etiqueta}
                    </span>
                  </td>

                  {/* Col 9: RETROALIMENTACIÓN */}
                  <td className="px-3 py-2">
                    {renderRetroBadge(patient)}
                  </td>

                  {/* Col 10: FASE */}
                  <td className="px-3 py-2 text-center">
                    {renderFaseCell(patient)}
                  </td>

                  {/* Col 11: ACTA */}
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => onOpenActa(patient)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#effaff] hover:bg-[#00aae1] hover:text-white text-[#00aae1] border border-[#00aae1]/20 font-semibold text-[10px] transition-colors cursor-pointer"
                      title="Ver Acta del Comité Médico"
                    >
                      <FileText className="w-3 h-3" />
                      <span>#{patient.acta.numero}</span>
                    </button>
                  </td>

                  {/* Col 12: COORDINADOR */}
                  <td className="px-3 py-2 text-[#033d59] font-medium text-[11px]">
                    {patient.coordinador}
                  </td>

                  {/* Cols 13 to 19: ESPECIALISTAS (7 Columns) */}
                  <td className="px-1.5 py-1 min-w-[160px]">
                    {renderSpecialistCell(patient, 'med_gen')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[160px]">
                    {renderSpecialistCell(patient, 'nutri')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[160px]">
                    {renderSpecialistCell(patient, 'psicol')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[160px]">
                    {renderSpecialistCell(patient, 'esp_1')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[160px]">
                    {renderSpecialistCell(patient, 'esp_2')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[160px]">
                    {renderSpecialistCell(patient, 'esp_3')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[160px]">
                    {renderSpecialistCell(patient, 'esp_4')}
                  </td>

                  {/* Col 20: NOTA OP (Sticky Right) */}
                  <td className="sticky right-[56px] z-20 bg-white group-hover:bg-[#f9fafb] px-2 py-2 text-center border-l border-[#e2e8eb] min-w-[56px] max-w-[56px]">
                    <button
                      onClick={() => onOpenNotesDrawer(patient, 'op')}
                      className="relative p-1.5 rounded-lg bg-[#f9fafb] hover:bg-[#033d59] text-[#033d59] hover:text-white transition-all border border-[#e2e8eb] cursor-pointer"
                      title="Ver/Agregar Nota Operativa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      {patient.operationalNotes.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#033d59] text-white text-[8px] font-bold flex items-center justify-center border border-white">
                          {patient.operationalNotes.length}
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Col 21: NOTA CLI (Sticky Right) */}
                  <td className="sticky right-0 z-20 bg-white group-hover:bg-[#f9fafb] px-2 py-2 text-center border-l border-[#e2e8eb] min-w-[56px] max-w-[56px]">
                    <button
                      onClick={() => onOpenNotesDrawer(patient, 'cli')}
                      className="relative p-1.5 rounded-lg bg-[#effaff] hover:bg-[#00aae1] text-[#00aae1] hover:text-white transition-all border border-[#00aae1]/30 cursor-pointer"
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
