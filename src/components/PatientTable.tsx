import React, { useState, useMemo } from 'react';
import {
  Patient,
  UserRole,
  EstadoPaciente,
  NivelRiesgo,
  SpecialistKey,
  SpecialistInfo,
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
} from 'lucide-react';

export type SortField =
  | 'nombre'
  | 'identificacion'
  | 'cohorte'
  | 'estado'
  | 'riesgo'
  | 'etiqueta'
  | 'fase'
  | 'acta'
  | 'coordinador'
  | 'med_gen'
  | 'nutri'
  | 'psicol'
  | 'esp_1'
  | 'esp_2'
  | 'esp_3';

export type SortDirection = 'asc' | 'desc';

interface PatientTableProps {
  patients: Patient[];
  activeRole: UserRole;
  onEditPatient: (patient: Patient) => void;
  onUpdateStatus: (patientId: string, newStatus: EstadoPaciente) => void;
  onUpdateRisk: (patientId: string, newRisk: NivelRiesgo) => void;
  onOpenActa: (patient: Patient) => void;
  onOpenNotesDrawer: (patient: Patient, type: 'op' | 'cli') => void;
  onEditSpecialist: (patient: Patient, key: SpecialistKey, info: SpecialistInfo) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  activeRole,
  onEditPatient,
  onUpdateStatus,
  onUpdateRisk,
  onOpenActa,
  onOpenNotesDrawer,
  onEditSpecialist,
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
  const [riskMenuPatientId, setRiskMenuPatientId] = useState<string | null>(null);
  const [statusMenuPatientId, setStatusMenuPatientId] = useState<string | null>(null);
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
        case 'identificacion':
          valA = a.identificacion.toLowerCase();
          valB = b.identificacion.toLowerCase();
          break;
        case 'cohorte':
          valA = a.cohorte.toLowerCase();
          valB = b.cohorte.toLowerCase();
          break;
        case 'estado':
          // Sort order: Activo = 3, Aceptado = 2, Rechazado = 1
          const estadoWeight = { Activo: 3, Aceptado: 2, Rechazado: 1 };
          valA = estadoWeight[a.estado] || 0;
          valB = estadoWeight[b.estado] || 0;
          break;
        case 'riesgo':
          // Sort order: Critical = 4, High = 3, Medium = 2, Low = 1
          const riesgoWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          valA = riesgoWeight[a.riesgo] || 0;
          valB = riesgoWeight[b.riesgo] || 0;
          break;
        case 'etiqueta':
          valA = a.etiqueta.toLowerCase();
          valB = b.etiqueta.toLowerCase();
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
          const specA = a.specialists[sortField];
          const specB = b.specialists[sortField];
          // Sort by overdue status first, then by targetDate string
          valA = (specA?.isOverdue ? '1_' : '0_') + (specA?.targetDate || '9999-99-99');
          valB = (specB?.isOverdue ? '1_' : '0_') + (specB?.targetDate || '9999-99-99');
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [patients, sortField, sortDirection]);

  // Handle patient name mouse enter for popover
  const handleMouseEnterName = (e: React.MouseEvent, patient: Patient) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredPatient({
      patient,
      position: {
        top: rect.bottom + 8,
        left: rect.left,
      },
    });
  };

  const handleRiskClick = (patient: Patient) => {
    if (!isComite) {
      setShowRoleAlert(true);
      setTimeout(() => setShowRoleAlert(false), 3000);
      return;
    }
    setRiskMenuPatientId(riskMenuPatientId === patient.id ? null : patient.id);
  };

  const renderRiskIcon = (risk: NivelRiesgo) => {
    switch (risk) {
      case 'Critical':
        return (
          <div className="flex items-center justify-center text-[#e11d48]" title="Riesgo Crítico (Triángulo Rojo)">
            <AlertTriangle className="w-5 h-5 fill-[#e11d48]/20 stroke-[2.5]" />
          </div>
        );
      case 'High':
        return (
          <div className="flex items-center justify-center text-[#e11d48]" title="Riesgo Alto (Círculo Rojo)">
            <Circle className="w-4 h-4 fill-[#e11d48] stroke-none" />
          </div>
        );
      case 'Medium':
        return (
          <div className="flex items-center justify-center text-[#fbbf24]" title="Riesgo Medio (Círculo Amarillo)">
            <Circle className="w-4 h-4 fill-[#fbbf24] stroke-none" />
          </div>
        );
      case 'Low':
        return (
          <div className="flex items-center justify-center text-[#01ae6c]" title="Riesgo Bajo (Círculo Verde)">
            <Circle className="w-4 h-4 fill-[#01ae6c] stroke-none" />
          </div>
        );
    }
  };

  const renderEstadoBadge = (patient: Patient) => {
    let style = '';
    switch (patient.estado) {
      case 'Activo':
        style = 'bg-[#ebfef4] text-[#01ae6c] border-[#01ae6c]/30 hover:bg-[#d0fbe2]';
        break;
      case 'Aceptado':
        style = 'bg-[#effaff] text-[#00aae1] border-[#00aae1]/30 hover:bg-[#dff4ff]';
        break;
      case 'Rechazado':
        style = 'bg-[#fff1f2] text-[#e11d48] border-[#e11d48]/30 hover:bg-[#ffe4e6]';
        break;
    }

    return (
      <div className="relative font-sans">
        <button
          onClick={() => setStatusMenuPatientId(statusMenuPatientId === patient.id ? null : patient.id)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${style}`}
        >
          <span>{patient.estado}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {statusMenuPatientId === patient.id && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-lg shadow-lg border border-[#e2e8eb] p-1 w-28 text-xs font-semibold">
            {(['Activo', 'Aceptado', 'Rechazado'] as EstadoPaciente[]).map((st) => (
              <button
                key={st}
                onClick={() => {
                  onUpdateStatus(patient.id, st);
                  setStatusMenuPatientId(null);
                }}
                className={`w-full text-left px-2 py-1 rounded-md hover:bg-[#effaff] cursor-pointer ${
                  patient.estado === st ? 'text-[#00aae1] font-bold' : 'text-[#033d59]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFaseBadge = (fase: string) => {
    let color = 'bg-[#f9fafb] text-[#033d59] border-[#e2e8eb]';
    if (fase === 'E') color = 'bg-purple-50 text-purple-700 border-purple-200';
    if (fase === 'D') color = 'bg-blue-50 text-blue-700 border-blue-200';
    if (fase === 'I') color = 'bg-amber-50 text-amber-800 border-amber-200';
    if (fase === 'M/E') color = 'bg-teal-50 text-teal-700 border-teal-200';

    return (
      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${color}`}>
        {fase}
      </span>
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
        {/* Line 1: Professional Name */}
        <div className="font-semibold truncate text-[11px] leading-tight text-[#033d59]">
          {data.professionalName}
        </div>

        {/* Line 2: Last Attention Date */}
        <div className="text-[10px] flex items-center justify-between opacity-90">
          <span className="text-[#035476]">Última:</span>
          <span className="font-mono text-[#033d59]">{data.lastAttentionDate}</span>
        </div>

        {/* Line 3: Frequency */}
        <div className="text-[10px] flex items-center justify-between opacity-80">
          <span className="text-[#035476]">Frec:</span>
          <span className="truncate max-w-[80px] text-[#033d59]">{data.frequency}</span>
        </div>

        {/* Line 4: Target Date */}
        <div className={`text-[10px] flex items-center justify-between font-mono font-medium ${
          isOverdue ? 'text-[#b45309] font-bold' : 'text-[#035476]'
        }`}>
          <span>Obj:</span>
          <span>{data.targetDate}</span>
        </div>
      </div>
    );
  };

  // Render clickable header column with sorting indicator
  const renderHeader = (label: string, field: SortField, className: string = '') => {
    const isActive = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`px-3 h-11 cursor-pointer transition-colors hover:bg-[#effaff] select-none ${className}`}
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
    <div className="flex-1 overflow-auto relative w-full bg-white font-sans max-w-[1550px] mx-auto rounded-xl shadow-xs border border-[#e2e8eb] my-2">
      {/* Toast Notification when SIAU tries to change Risk */}
      {showRoleAlert && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#fffbeb] border border-[#fbbf24] text-[#b45309] px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#fbbf24]" />
          <span>Acceso restringido: Solo el Comité Médico puede modificar el Nivel de Riesgo.</span>
        </div>
      )}

      {/* Main Table Structure (18 Columns) */}
      <table className="w-full text-left border-collapse min-w-[2000px]">
        {/* Table Header */}
        <thead>
          <tr className="bg-[#f9fafb] border-b border-[#e2e8eb] text-[11px] font-bold text-[#035476] uppercase tracking-wider select-none h-11">
            {/* Col 1: Acciones (Sticky Left) */}
            <th className="sticky left-0 z-20 bg-[#f9fafb] px-2 text-center border-r border-[#e2e8eb] min-w-[110px] max-w-[110px]">
              Acciones
            </th>

            {/* Col 2: Nombre (Sticky Left) */}
            <th
              onClick={() => handleSort('nombre')}
              className="sticky left-[110px] z-20 bg-[#f9fafb] px-3 border-r border-[#e2e8eb] min-w-[220px] max-w-[220px] cursor-pointer hover:bg-[#effaff] transition-colors"
            >
              <div className="flex items-center gap-1.5 justify-between">
                <span>Nombre del Paciente</span>
                <span className="text-[#00aae1]">
                  {sortField === 'nombre' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-[#035476]/40" />
                  )}
                </span>
              </div>
            </th>

            {/* Col 2: ID */}
            {renderHeader('ID', 'identificacion', 'min-w-[110px]')}

            {/* Col 3: Cohorte */}
            {renderHeader('Cohorte', 'cohorte', 'min-w-[150px]')}

            {/* Col 4: Estado */}
            {renderHeader('Estado', 'estado', 'min-w-[110px]')}

            {/* Col 5: Riesgo */}
            {renderHeader('Riesgo', 'riesgo', 'min-w-[90px] text-center')}

            {/* Col 6: Etiqueta */}
            {renderHeader('Etiqueta', 'etiqueta', 'min-w-[120px]')}

            {/* Col 7: Fase */}
            {renderHeader('Fase', 'fase', 'min-w-[80px] text-center')}

            {/* Col 8: Acta */}
            {renderHeader('Acta', 'acta', 'min-w-[85px] text-center')}

            {/* Col 9: Coord */}
            {renderHeader('Coordinador', 'coordinador', 'min-w-[130px]')}

            {/* Columns 10 to 15 (Specialists) */}
            {renderHeader('MEDICO GEN.', 'med_gen', 'min-w-[165px] bg-[#f9fafb] border-l border-[#e2e8eb] text-[#033d59]')}
            {renderHeader('NUTRICIONISTA', 'nutri', 'min-w-[165px] bg-[#f9fafb] text-[#033d59]')}
            {renderHeader('Psicologia', 'psicol', 'min-w-[165px] bg-[#f9fafb] text-[#033d59]')}
            {renderHeader('Esp. 1', 'esp_1', 'min-w-[165px] bg-[#f9fafb] text-[#033d59]')}
            {renderHeader('Esp. 2', 'esp_2', 'min-w-[165px] bg-[#f9fafb] text-[#033d59]')}
            {renderHeader('Esp. 3', 'esp_3', 'min-w-[165px] bg-[#f9fafb] border-r border-[#e2e8eb] text-[#033d59]')}

            {/* Col 16: Nota Op. (Sticky Right) */}
            <th className="sticky right-[56px] z-20 bg-[#f9fafb] px-2 text-center border-l border-[#e2e8eb] min-w-[56px] max-w-[56px]">
              Nota Op.
            </th>

            {/* Col 17: Nota Clí. (Sticky Right) */}
            <th className="sticky right-0 z-20 bg-[#f9fafb] px-2 text-center border-l border-[#e2e8eb] min-w-[56px] max-w-[56px]">
              Nota Clí.
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#e2e8eb] text-xs bg-white">
          {sortedPatients.length === 0 ? (
            <tr>
              <td colSpan={18} className="py-12 text-center text-[#035476] font-medium">
                No se encontraron pacientes que coincidan con los criterios de búsqueda.
              </td>
            </tr>
          ) : (
            sortedPatients.map((patient) => {
              return (
                <tr
                  key={patient.id}
                  className="hover:bg-[#f9fafb] transition-colors group h-[72px]"
                >
                  {/* Col 1: Acciones (Sticky Left - 3 Buttons) */}
                  <td className="sticky left-0 z-20 bg-white group-hover:bg-[#f9fafb] px-2 py-2 border-r border-[#e2e8eb] min-w-[110px] max-w-[110px]">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Button 1: Ver Acta */}
                      <button
                        onClick={() => onOpenActa(patient)}
                        className="p-1.5 rounded-lg bg-[#effaff] hover:bg-[#00aae1] text-[#00aae1] hover:text-white transition-all border border-[#00aae1]/20 cursor-pointer shadow-2xs"
                        title="Ver Acta"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Button 2 (Mitad): Evolución */}
                      <button
                        onClick={() => onOpenNotesDrawer(patient, 'cli')}
                        className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white transition-all border border-teal-200 cursor-pointer shadow-2xs"
                        title="Evolución"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>

                      {/* Button 3 (Último): Nueva Acta */}
                      {activeRole === 'coordinadora_siau' ? (
                        <button
                          disabled
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
                          title="Nueva Acta (Deshabilitado para Coordinadora SIAU)"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenActa(patient)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-all border border-emerald-200 cursor-pointer shadow-2xs"
                          title="Nueva Acta"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Col 2: Nombre del Paciente (Sticky Left-[110px]) */}
                  <td className="sticky left-[110px] z-20 bg-white group-hover:bg-[#f9fafb] px-3 py-2 border-r border-[#e2e8eb] min-w-[220px] max-w-[220px]">
                    <div className="overflow-hidden">
                      <button
                        onClick={() => onEditPatient(patient)}
                        onMouseEnter={(e) => handleMouseEnterName(e, patient)}
                        className="font-bold text-[#033d59] hover:text-[#00aae1] text-xs text-left truncate block max-w-[200px] transition-colors cursor-pointer"
                      >
                        {patient.nombre}
                      </button>
                      <span className="text-[10px] text-[#035476] block font-mono">
                        {patient.identificacion}
                      </span>
                    </div>
                  </td>

                  {/* Col 2: ID Convenio */}
                  <td className="px-3 py-2 font-mono text-[#033d59] font-semibold">
                    {patient.idConvenio}
                  </td>

                  {/* Col 3: Cohorte */}
                  <td className="px-3 py-2 text-[#033d59] font-medium truncate max-w-[150px]">
                    {patient.cohorte}
                  </td>

                  {/* Col 4: Estado */}
                  <td className="px-3 py-2">
                    {renderEstadoBadge(patient)}
                  </td>

                  {/* Col 5: Riesgo (Icon Only) */}
                  <td className="px-3 py-2 text-center relative">
                    <button
                      onClick={() => handleRiskClick(patient)}
                      className="p-1 rounded-md hover:bg-[#effaff] transition-colors inline-flex items-center justify-center cursor-pointer"
                      title={isComite ? "Clic para cambiar nivel de riesgo" : "Solo Comité Médico puede cambiar riesgo"}
                    >
                      {renderRiskIcon(patient.riesgo)}
                    </button>

                    {/* Risk Selector Dropdown */}
                    {riskMenuPatientId === patient.id && isComite && (
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

                  {/* Col 6: Etiqueta */}
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded bg-[#f9fafb] text-[#033d59] font-medium border border-[#e2e8eb] text-[11px]">
                      {patient.etiqueta}
                    </span>
                  </td>

                  {/* Col 7: Fase */}
                  <td className="px-3 py-2 text-center">
                    {renderFaseBadge(patient.fase)}
                  </td>

                  {/* Col 8: Acta */}
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => onOpenActa(patient)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#effaff] hover:bg-[#00aae1] hover:text-white text-[#00aae1] border border-[#00aae1]/20 font-semibold text-[11px] transition-colors cursor-pointer"
                      title="Ver Acta del Comité Médico"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>#{patient.acta.numero}</span>
                    </button>
                  </td>

                  {/* Col 9: Coord */}
                  <td className="px-3 py-2 text-[#033d59] font-medium">
                    {patient.coordinador}
                  </td>

                  {/* Cols 10 to 15: Specialists */}
                  <td className="px-1.5 py-1 min-w-[165px]">
                    {renderSpecialistCell(patient, 'med_gen')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[165px]">
                    {renderSpecialistCell(patient, 'nutri')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[165px]">
                    {renderSpecialistCell(patient, 'psicol')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[165px]">
                    {renderSpecialistCell(patient, 'esp_1')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[165px]">
                    {renderSpecialistCell(patient, 'esp_2')}
                  </td>
                  <td className="px-1.5 py-1 min-w-[165px]">
                    {renderSpecialistCell(patient, 'esp_3')}
                  </td>

                  {/* Col 16: Nota Op. (Sticky Right) */}
                  <td className="sticky right-[56px] z-20 bg-white group-hover:bg-[#f9fafb] px-2 py-2 text-center border-l border-[#e2e8eb] min-w-[56px] max-w-[56px]">
                    <button
                      onClick={() => onOpenNotesDrawer(patient, 'op')}
                      className="relative p-2 rounded-lg bg-[#f9fafb] hover:bg-[#033d59] text-[#033d59] hover:text-white transition-all border border-[#e2e8eb] cursor-pointer"
                      title="Ver/Agregar Nota Operativa"
                    >
                      <Pencil className="w-4 h-4" />
                      {patient.operationalNotes.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#033d59] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                          {patient.operationalNotes.length}
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Col 17: Nota Clí. (Sticky Right) */}
                  <td className="sticky right-0 z-20 bg-white group-hover:bg-[#f9fafb] px-2 py-2 text-center border-l border-[#e2e8eb] min-w-[56px] max-w-[56px]">
                    <button
                      onClick={() => onOpenNotesDrawer(patient, 'cli')}
                      className="relative p-2 rounded-lg bg-[#effaff] hover:bg-[#00aae1] text-[#00aae1] hover:text-white transition-all border border-[#00aae1]/30 cursor-pointer"
                      title="Ver/Agregar Nota Clínica"
                    >
                      <Stethoscope className="w-4 h-4" />
                      {patient.clinicalNotes.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00aae1] text-white text-[9px] font-bold flex items-center justify-center border border-white">
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
