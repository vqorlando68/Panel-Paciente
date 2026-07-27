import React, { useState, useMemo } from 'react';
import {
  Patient,
  UserRole,
  FilterState,
  EstadoPaciente,
  NivelRiesgo,
  SpecialistKey,
  SpecialistInfo,
  COORDINADORES_LIST,
} from './types';
import { INITIAL_PATIENTS } from './mockData';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PatientTable } from './components/PatientTable';
import { EditPatientModal } from './components/EditPatientModal';
import { NotesDrawer } from './components/NotesDrawer';
import { ActaModal } from './components/ActaModal';
import { SpecialistEditModal } from './components/SpecialistEditModal';
import { AddPatientModal } from './components/AddPatientModal';
import { AlarmBanner } from './components/AlarmBanner';
import { CostAnalysisModal } from './components/CostAnalysisModal';
import { CuadroMedicoDrawer } from './components/CuadroMedicoDrawer';
import { AgendaDrawer } from './components/AgendaDrawer';
import { TasasDrawer } from './components/TasasDrawer';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activeRole, setActiveRole] = useState<UserRole>('comite_medico');

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    estado: 'Todos',
    cohorte: 'Todos',
    seguimiento: 'Todos',
    coordinador: 'Todos',
    convenioNombre: 'Todos',
    identificacion: '',
    nombresApellidos: '',
    numeroCarga: '',
    soloVencidas: false,
  });

  // Modal / Drawer States
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [notesDrawerState, setNotesDrawerState] = useState<{
    patient: Patient;
    type: 'op' | 'cli';
  } | null>(null);
  const [actaModalPatient, setActaModalPatient] = useState<Patient | null>(null);
  const [editingSpecialist, setEditingSpecialist] = useState<{
    patient: Patient;
    key: SpecialistKey;
    info: SpecialistInfo;
  } | null>(null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  // New Modals/Drawers
  const [costAnalysisPatient, setCostAnalysisPatient] = useState<Patient | null>(null);
  const [cuadroMedicoPatient, setCuadroMedicoPatient] = useState<Patient | null>(null);
  const [agendaPatient, setAgendaPatient] = useState<Patient | null>(null);
  const [tasasPatient, setTasasPatient] = useState<Patient | null>(null);

  // Helper: check if a patient has any overdue specialist
  const patientHasOverdueSpecialist = (patient: Patient): boolean => {
    return Object.values(patient.specialists).some((spec) => Boolean(spec?.isOverdue));
  };

  // Extract unique coordinators list
  const coordinatorsList = useMemo(() => {
    const list = Array.from(new Set([...COORDINADORES_LIST, ...patients.map((p) => p.coordinador)])).filter(Boolean);
    return list.sort();
  }, [patients]);

  // Extract unique convenios list
  const conveniosList = useMemo(() => {
    const list = Array.from(new Set(patients.map((p) => p.convenioNombre))).filter(Boolean);
    return list.sort();
  }, [patients]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Estado Filter
      if (filters.estado !== 'Todos' && patient.estado !== filters.estado) {
        return false;
      }

      // Cohorte Filter
      if (filters.cohorte !== 'Todos' && patient.cohorte !== filters.cohorte) {
        return false;
      }

      // Seguimiento Filter
      if (filters.seguimiento === 'Vencidos' && !patientHasOverdueSpecialist(patient)) {
        return false;
      }
      if (filters.seguimiento === 'Al Día' && patientHasOverdueSpecialist(patient)) {
        return false;
      }

      // Coordinador Filter
      if (filters.coordinador !== 'Todos' && patient.coordinador !== filters.coordinador) {
        return false;
      }

      // Convenio Nombre Filter
      if (filters.convenioNombre !== 'Todos' && patient.convenioNombre !== filters.convenioNombre) {
        return false;
      }

      // Identificacion Filter
      if (
        filters.identificacion.trim() &&
        !patient.identificacion.toLowerCase().includes(filters.identificacion.toLowerCase().trim())
      ) {
        return false;
      }

      // Nombres y Apellidos Filter
      if (
        filters.nombresApellidos.trim() &&
        !patient.nombre.toLowerCase().includes(filters.nombresApellidos.toLowerCase().trim())
      ) {
        return false;
      }

      // Numero de Carga Filter
      if (
        filters.numeroCarga.trim() &&
        !patient.numeroCarga.toLowerCase().includes(filters.numeroCarga.toLowerCase().trim())
      ) {
        return false;
      }

      // Solo Vencidas Toggle
      if (filters.soloVencidas && !patientHasOverdueSpecialist(patient)) {
        return false;
      }

      return true;
    });
  }, [patients, filters]);

  // Metrics Counters
  const totalPatients = patients.length;
  const overdueCount = patients.filter(patientHasOverdueSpecialist).length;
  const activeCount = patients.filter((p) => p.estado === 'Activo').length;

  // Handlers for state updates
  const handleResetFilters = () => {
    setFilters({
      estado: 'Todos',
      cohorte: 'Todos',
      seguimiento: 'Todos',
      coordinador: 'Todos',
      convenioNombre: 'Todos',
      identificacion: '',
      nombresApellidos: '',
      numeroCarga: '',
      soloVencidas: false,
    });
  };

  const handleSavePatient = (updatedPatient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
    setEditingPatient(null);
  };

  const handleUpdateStatus = (patientId: string, newStatus: EstadoPaciente) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, estado: newStatus } : p))
    );
  };

  const handleUpdateRisk = (patientId: string, newRisk: NivelRiesgo) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, riesgo: newRisk } : p))
    );
  };

  const handleAddNote = (patientId: string, type: 'op' | 'cli', noteContent: string) => {
    const newNote = {
      id: `${type}-${Date.now()}`,
      author: activeRole === 'comite_medico' ? 'Comité Médico' : 'Coordinación SIAU',
      role: activeRole === 'comite_medico' ? 'Comité Médico' : 'Coordinadora SIAU',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      content: noteContent,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          operationalNotes:
            type === 'op' ? [newNote, ...p.operationalNotes] : p.operationalNotes,
          clinicalNotes:
            type === 'cli' ? [newNote, ...p.clinicalNotes] : p.clinicalNotes,
        };
      })
    );

    if (notesDrawerState) {
      const updatedP = patients.find((p) => p.id === patientId);
      if (updatedP) {
        setNotesDrawerState({
          ...notesDrawerState,
          patient: {
            ...updatedP,
            operationalNotes:
              type === 'op' ? [newNote, ...updatedP.operationalNotes] : updatedP.operationalNotes,
            clinicalNotes:
              type === 'cli' ? [newNote, ...updatedP.clinicalNotes] : updatedP.clinicalNotes,
          },
        });
      }
    }
  };

  const handleSaveSpecialist = (
    patientId: string,
    specialistKey: SpecialistKey,
    updatedInfo: SpecialistInfo
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          specialists: {
            ...p.specialists,
            [specialistKey]: updatedInfo,
          },
        };
      })
    );
    setEditingSpecialist(null);
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
    setIsAddPatientOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#fafafa] font-sans text-[#033d59]">
      <div className="flex-1 flex flex-col overflow-hidden px-4 md:px-8 py-2 max-w-[1600px] w-full mx-auto">
        
        {/* Header */}
        <Header
          activeRole={activeRole}
          onRoleChange={setActiveRole}
          totalPatients={totalPatients}
          overdueCount={overdueCount}
          activeCount={activeCount}
        />

        {/* Alarm Banner */}
        <AlarmBanner
          patients={patients}
          onActivateAlarmFilter={() => setFilters((f) => ({ ...f, soloVencidas: true }))}
        />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          coordinatorsList={coordinatorsList}
          conveniosList={conveniosList}
          onResetFilters={handleResetFilters}
        />

        {/* Main Table Section (19 Columns) */}
        <PatientTable
          patients={filteredPatients}
          activeRole={activeRole}
          onEditPatient={(patient) => setEditingPatient(patient)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateRisk={handleUpdateRisk}
          onOpenActa={(patient) => setActaModalPatient(patient)}
          onOpenNotesDrawer={(patient, type) => setNotesDrawerState({ patient, type })}
          onEditSpecialist={(patient, key, info) => setEditingSpecialist({ patient, key, info })}
          onOpenCostAnalysis={(patient) => setCostAnalysisPatient(patient)}
          onOpenCuadroMedico={(patient) => setCuadroMedicoPatient(patient)}
          onOpenAgenda={(patient) => setAgendaPatient(patient)}
          onOpenTasas={(patient) => setTasasPatient(patient)}
        />

        {/* Footer Status Bar */}
        <footer className="bg-white border border-[#e2e8eb] rounded-xl shadow-2xs px-6 py-2.5 shrink-0 flex items-center justify-between text-xs text-[#035476] max-w-[1550px] w-full mx-auto my-1">
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong className="text-[#033d59]">{filteredPatients.length}</strong> de{' '}
              <strong className="text-[#033d59]">{totalPatients}</strong> pacientes
            </span>
            {filters.soloVencidas && (
              <span className="px-2 py-0.5 rounded bg-[#fffbeb] text-[#b45309] font-bold text-[10px] border border-[#fbbf24]/50">
                Filtro Activo: Solo Vencidas
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#01ae6c]" />
              Activo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00aae1]" />
              Aceptado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
              Rechazado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#fffbeb] border-l-2 border-[#b45309]" />
              Alerta Vencido
            </span>
          </div>
        </footer>
      </div>

      {/* Modals & Drawers */}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          activeRole={activeRole}
          onSave={handleSavePatient}
          onClose={() => setEditingPatient(null)}
        />
      )}

      {notesDrawerState && (
        <NotesDrawer
          patient={notesDrawerState.patient}
          type={notesDrawerState.type}
          activeRole={activeRole}
          onAddNote={handleAddNote}
          onClose={() => setNotesDrawerState(null)}
        />
      )}

      {actaModalPatient && (
        <ActaModal
          patient={actaModalPatient}
          onClose={() => setActaModalPatient(null)}
        />
      )}

      {editingSpecialist && (
        <SpecialistEditModal
          patient={editingSpecialist.patient}
          specialistKey={editingSpecialist.key}
          specialistData={editingSpecialist.info}
          onSave={handleSaveSpecialist}
          onClose={() => setEditingSpecialist(null)}
        />
      )}

      {isAddPatientOpen && (
        <AddPatientModal
          onAdd={handleAddPatient}
          onClose={() => setIsAddPatientOpen(false)}
        />
      )}

      {/* New Feature Modals/Drawers */}
      {costAnalysisPatient && (
        <CostAnalysisModal
          patient={costAnalysisPatient}
          onClose={() => setCostAnalysisPatient(null)}
        />
      )}

      {cuadroMedicoPatient && (
        <CuadroMedicoDrawer
          patient={cuadroMedicoPatient}
          onClose={() => setCuadroMedicoPatient(null)}
        />
      )}

      {agendaPatient && (
        <AgendaDrawer
          patient={agendaPatient}
          onClose={() => setAgendaPatient(null)}
        />
      )}

      {tasasPatient && (
        <TasasDrawer
          patient={tasasPatient}
          onClose={() => setTasasPatient(null)}
        />
      )}
    </div>
  );
}
