import React, { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, Bot, Sparkles } from 'lucide-react';
import {
  Patient,
  UserRole,
  ColumnGroup,
  FilterState,
  EstadoPaciente,
  NivelRiesgo,
  SpecialistKey,
  SpecialistInfo,
  ActaInfo,
  CuadroMedicoItem,
  COORDINADORES_LIST,
  COHORTE_OPTIONS,
} from './types';
import { INITIAL_PATIENTS } from './mockData';
import { PatientService } from './services/patientService';
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
import { OracleDocModal } from './components/OracleDocModal';
import { EpicrisisModal } from './components/EpicrisisModal';
import { Patient360Modal } from './components/Patient360Modal';
import { PatientChatModal } from './components/PatientChatModal';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>('comite_medico');

  // Column Group View: 'coordinador' (todas las columnas) | 'clinico' (vista clínica con Equipo Médico)
  const [columnGroup, setColumnGroup] = useState<ColumnGroup>(() => {
    return (localStorage.getItem('panel_pacientes_col_group') as ColumnGroup) || 'coordinador';
  });

  useEffect(() => {
    localStorage.setItem('panel_pacientes_col_group', columnGroup);
  }, [columnGroup]);

  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'light';
  });

  // Oracle Doc Modal State
  const [isOracleDocOpen, setIsOracleDocOpen] = useState(false);


  // Sync theme with html document element class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Global Keyboard Listener for Ctrl + Alt + D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setIsOracleDocOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
    soloAlarmas: false,
    fastFilter: 'Todos',
  });

  // Server-side Pagination & Search State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [paginationMeta, setPaginationMeta] = useState<{
    total_registros: number;
    total_base?: number;
    total_paginas: number;
    total_activos?: number;
    total_inconforme?: number;
  }>({
    total_registros: 0,
    total_base: 0,
    total_paginas: 1,
    total_activos: 0,
    total_inconforme: 0,
  });

  // Debounced search queries for Oracle DB
  const [debouncedIdentificacion, setDebouncedIdentificacion] = useState(filters.identificacion);
  const [debouncedNombre, setDebouncedNombre] = useState(filters.nombresApellidos);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedIdentificacion(filters.identificacion);
    }, 450);
    return () => clearTimeout(handler);
  }, [filters.identificacion]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNombre(filters.nombresApellidos);
    }, 450);
    return () => clearTimeout(handler);
  }, [filters.nombresApellidos]);

  const [dbCoordinators, setDbCoordinators] = useState<string[]>([]);

  // Load official coordinators list from Oracle on mount
  useEffect(() => {
    PatientService.getCoordinadores().then((list) => {
      if (list && list.length > 0) {
        setDbCoordinators(list);
      }
    });
  }, []);

  // Reset to page 1 when search filters or fast filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedIdentificacion,
    debouncedNombre,
    filters.coordinador,
    filters.convenioNombre,
    filters.estado,
    filters.fastFilter,
    filters.seguimiento,
    filters.soloVencidas,
  ]);

  // Load paginated patients from Oracle
  useEffect(() => {
    setIsLoading(true);
    PatientService.getPatientsPaged({
      pagina: currentPage,
      registros_por_pagina: itemsPerPage,
      identificacion: debouncedIdentificacion,
      nombresApellidos: debouncedNombre,
      coordinador: filters.coordinador,
      convenioNombre: filters.convenioNombre,
      estado: filters.estado,
      fastFilter: filters.fastFilter,
    })
      .then((res) => {
        setPatients(res.pacientes);
        setPaginationMeta({
          total_registros: res.paginacion.total_registros,
          total_base: res.paginacion.total_base,
          total_paginas: res.paginacion.total_paginas,
          total_activos: res.paginacion.total_activos,
          total_inconforme: res.paginacion.total_inconforme,
        });
      })
      .catch((err) => {
        console.error('[App] Error al cargar pacientes:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    currentPage,
    itemsPerPage,
    debouncedIdentificacion,
    debouncedNombre,
    filters.coordinador,
    filters.convenioNombre,
    filters.estado,
    filters.fastFilter,
  ]);

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
  const [epicrisisPatient, setEpicrisisPatient] = useState<Patient | null>(null);
  const [selected360Patient, setSelected360Patient] = useState<Patient | null>(null);

  // Chat Asistente IA (pkgln_big_query.p_chat_usuario_cohorte) State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInitialPatient, setChatInitialPatient] = useState<Patient | null>(null);

  // Helper: check if a patient has any overdue specialist
  const patientHasOverdueSpecialist = (patient: Patient): boolean => {
    if (!patient || !patient.specialists) return false;
    return Object.values(patient.specialists).some((spec) => Boolean(spec?.isOverdue));
  };

  // Extract unique coordinators list (only those who have records assigned)
  const coordinatorsList = useMemo(() => {
    const sourceList = dbCoordinators.length > 0
      ? dbCoordinators
      : Array.from(new Set([...COORDINADORES_LIST, ...patients.map((p) => p.coordinador).filter(Boolean)]));
    const list = Array.from(new Set(sourceList)).filter((item): item is string => Boolean(item));
    return list.sort();
  }, [patients, dbCoordinators]);

  // Extract unique convenios list
  const conveniosList = useMemo(() => {
    const list = Array.from(new Set(patients.map((p) => p.convenioNombre))).filter((item): item is string => Boolean(item));
    return list.sort();
  }, [patients]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Estado Filter
      if (filters.estado !== 'Todos') {
        if (filters.estado === 'Activo') {
          if (patient.id_estado_cohorte !== 7 && (patient.estado || '').toLowerCase() !== 'activo') {
            return false;
          }
        } else if (patient.estado !== filters.estado) {
          return false;
        }
      }

      // Cohorte Filter
      if (filters.cohorte !== 'Todos') {
        const patientCohorte = (patient.cohorte || '').toLowerCase();
        const selectedCohorteCode = filters.cohorte.toLowerCase();
        
        const selectedObj = COHORTE_OPTIONS.find(c => c.code.toLowerCase() === selectedCohorteCode || c.label.toLowerCase() === selectedCohorteCode);
        const selectedLabel = selectedObj ? selectedObj.label.toLowerCase() : selectedCohorteCode;
        
        const patientObj = COHORTE_OPTIONS.find(c => c.code.toLowerCase() === patientCohorte || c.label.toLowerCase() === patientCohorte);
        const patientFullLabel = patientObj ? patientObj.label.toLowerCase() : patientCohorte;

        const matchesCode = patientCohorte === selectedCohorteCode;
        const matchesInFullLabel = patientFullLabel.includes(selectedCohorteCode) || patientFullLabel.includes(selectedLabel);
        
        if (!matchesCode && !matchesInFullLabel) {
          return false;
        }
      }

      // Seguimiento Filter
      if (filters.seguimiento === 'Vencidos' && !patientHasOverdueSpecialist(patient)) {
        return false;
      }
      if (filters.seguimiento === 'Al Día' && patientHasOverdueSpecialist(patient)) {
        return false;
      }

      // Coordinador Filter
      if (filters.coordinador !== 'Todos') {
        const pCoord = (patient.coordinador || '').toLowerCase().trim();
        const fCoord = filters.coordinador.toLowerCase().trim();
        if (!pCoord || (!pCoord.includes(fCoord) && !fCoord.includes(pCoord))) {
          return false;
        }
      }

      // Convenio Nombre Filter (supports multi-select array or single string)
      if (filters.convenioNombre !== 'Todos') {
        const pConvenio = (patient.convenioNombre || '').toLowerCase().trim();
        if (Array.isArray(filters.convenioNombre)) {
          if (filters.convenioNombre.length > 0) {
            const hasMatch = filters.convenioNombre.some((c) => {
              const cleanC = c.toLowerCase().trim();
              return pConvenio.includes(cleanC) || cleanC.includes(pConvenio);
            });
            if (!hasMatch) return false;
          }
        } else {
          const cleanF = filters.convenioNombre.toLowerCase().trim();
          if (!pConvenio.includes(cleanF) && !cleanF.includes(pConvenio)) {
            return false;
          }
        }
      }

      // Identificacion Filter
      if (
        debouncedIdentificacion.trim() &&
        !(patient.identificacion || '').toLowerCase().includes(debouncedIdentificacion.toLowerCase().trim())
      ) {
        return false;
      }

      // Nombres y Apellidos Filter
      if (
        debouncedNombre.trim() &&
        !(patient.nombre || '').toLowerCase().includes(debouncedNombre.toLowerCase().trim())
      ) {
        return false;
      }

      // Numero de Carga Filter
      if (
        filters.numeroCarga.trim() &&
        !(patient.numeroCarga || '').toLowerCase().includes(filters.numeroCarga.toLowerCase().trim())
      ) {
        return false;
      }

      // Solo Vencidas Toggle
      if (filters.soloVencidas && !patientHasOverdueSpecialist(patient)) {
        return false;
      }

      // Solo Alarmas Filter
      if (filters.soloAlarmas && !patient.hasAlarm) {
        return false;
      }

      // Fast Filter Chips
      if (filters.fastFilter && filters.fastFilter !== 'Todos') {
        const ff = filters.fastFilter;
        if (ff === 'Activos' && patient.id_estado_cohorte !== 7 && (patient.estado || '').toLowerCase() !== 'activo') return false;
        if (ff === 'Vencidos' && !patientHasOverdueSpecialist(patient)) return false;
        if (ff === 'Inconforme' && patient.tag_retroalimentacion !== 'I' && patient.etiqueta !== 'Inconforme' && patient.retroalimentacion !== 'Inconforme') return false;
        if ((ff === 'Críticos' || ff === 'Criticos') && patient.tag_retroalimentacion !== 'C') return false;
        if (ff === '>90 días' || ff === '> 90 días') {
          const coreKeys: SpecialistKey[] = ['med_gen', 'med_int', 'psicol', 'nutri'];
          const hasRecentAppointment = coreKeys.some((k) => {
            const spec = patient.specialists?.[k];
            if (!spec || !spec.attentionsHistory || spec.attentionsHistory.length === 0) return false;
            return spec.attentionsHistory.some((att) => {
              if (!att.dateTime || att.dateTime === '—') return false;
              const parts = att.dateTime.split(' ')[0].split('/');
              if (parts.length === 3) {
                const attDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                const diffDays = (Date.now() - attDate.getTime()) / (1000 * 60 * 60 * 24);
                return diffDays >= 0 && diffDays <= 90;
              }
              return false;
            });
          });
          if (hasRecentAppointment) return false;
        }
        if (ff === 'Rehúso' || ff === 'Rehuso') {
          const hasRehuso = patient.hasRehuso || (patient.specialists ? Object.values(patient.specialists).some((s) => Boolean((s as SpecialistInfo)?.hasRehuso)) : false);
          if (!hasRehuso) return false;
        }
        if (ff === 'Aceptados' && patient.cohorte !== 'ACEPTADO' && (patient.estado || '').toUpperCase() !== 'ACEPTADO' && patient.id_estado_cohorte !== 6) return false;
        if ((ff === 'Sin Acta' || ff === 'Sin Actas') && ((patient.acta && patient.acta.numero > 0) || (patient.actasHistory && patient.actasHistory.length > 0))) return false;
      }

      return true;
    });
  }, [patients, filters, debouncedIdentificacion, debouncedNombre]);

  // Metrics Counters
  const totalPatients = (paginationMeta.total_base !== undefined && paginationMeta.total_base > 0)
    ? paginationMeta.total_base
    : (paginationMeta.total_registros > 0 ? paginationMeta.total_registros : patients.length);
  const overdueCount = patients.filter(patientHasOverdueSpecialist).length;
  const activeCount = paginationMeta.total_activos !== undefined && paginationMeta.total_activos > 0
    ? paginationMeta.total_activos
    : patients.filter((p) => p.id_estado_cohorte === 7 || (p.estado || '').toLowerCase() === 'activo').length;
  const inconformeCount = paginationMeta.total_inconforme !== undefined && paginationMeta.total_inconforme > 0
    ? paginationMeta.total_inconforme
    : patients.filter(
        (p) => p.tag_retroalimentacion === 'I' || p.etiqueta === 'Inconforme' || p.retroalimentacion === 'Inconforme'
      ).length;
  const alarmCount = patients.filter((p) => p.hasAlarm).length;

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
      soloAlarmas: false,
      fastFilter: 'Todos',
    });
    setCurrentPage(1);
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

  const handleUpdateCohorte = (patientId: string, newCohorte: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, cohorte: newCohorte } : p))
    );
  };

  const handleUpdateCoordinador = (patientId: string, newCoordinador: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, coordinador: newCoordinador } : p))
    );
  };

  const handleUpdateRetro = (patientId: string, newRetro: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, retroalimentacion: newRetro } : p))
    );
  };

  const handleUpdatePrioridad = (patientId: string, priority: number) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, prioridadInicial: priority } : p))
    );
  };

  const handleSaveActa = (patientId: string, newActa: ActaInfo) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const currentActa = p.acta;
        const existingHistory = p.actasHistory || [];

        // Build history: previous active acta goes to top of history if valid
        const previousActas = currentActa && currentActa.numero > 0
          ? [currentActa, ...existingHistory.filter((a) => a.numero !== currentActa.numero && a.numero !== newActa.numero)]
          : existingHistory.filter((a) => a.numero !== newActa.numero);

        const updatedP = {
          ...p,
          acta: newActa,
          actasHistory: previousActas,
        };

        if (actaModalPatient && actaModalPatient.id === patientId) {
          setActaModalPatient(updatedP);
        }

        return updatedP;
      })
    );
  };

  const handleAddNote = (
    patientId: string, 
    type: 'op' | 'cli', 
    noteContent: string,
    rehusoInfo?: { isRehuso: boolean; professional: string; specialty: string }
  ) => {
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
        const hasRehusoUpdated = rehusoInfo?.isRehuso ? true : p.hasRehuso;
        const rehusoInfoUpdated = rehusoInfo?.isRehuso 
          ? { professional: rehusoInfo.professional, specialty: rehusoInfo.specialty }
          : p.rehusoInfo;

        return {
          ...p,
          hasRehuso: hasRehusoUpdated,
          rehusoInfo: rehusoInfoUpdated,
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
            hasRehuso: rehusoInfo?.isRehuso ? true : updatedP.hasRehuso,
            rehusoInfo: rehusoInfo?.isRehuso 
              ? { professional: rehusoInfo.professional, specialty: rehusoInfo.specialty } 
              : updatedP.rehusoInfo,
            operationalNotes:
              type === 'op' ? [newNote, ...updatedP.operationalNotes] : updatedP.operationalNotes,
            clinicalNotes:
              type === 'cli' ? [newNote, ...updatedP.clinicalNotes] : updatedP.clinicalNotes,
          },
        });
      }
    }
  };

  const handleAddCohorte = (name: string, description: string) => {
    // Add new cohorte
    console.log('Nueva cohorte guardada:', name, description);
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

  const handleSaveCuadroMedico = (patientId: string, updatedItems: CuadroMedicoItem[]) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, cuadroMedico: updatedItems } : p
      )
    );
    if (cuadroMedicoPatient && cuadroMedicoPatient.id === patientId) {
      setCuadroMedicoPatient({
        ...cuadroMedicoPatient,
        cuadroMedico: updatedItems,
      });
    }
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
    setIsAddPatientOpen(false);
  };

  // Active Metric Card derived state
  const activeMetricCard = useMemo(() => {
    if (filters.fastFilter === 'Inconforme') return undefined;
    if (filters.fastFilter === 'Vencidos' || filters.seguimiento === 'Vencidos') return 'vencidos';
    if (filters.fastFilter === 'Activos' || filters.estado === 'Activo') return 'activos';
    if ((filters.fastFilter === 'Todos' || !filters.fastFilter) && filters.estado === 'Todos' && filters.seguimiento === 'Todos') return 'total';
    return undefined;
  }, [filters]);

  const handleSelectMetricCard = (metric: 'total' | 'activos' | 'vencidos') => {
    if (metric === 'total') {
      setFilters((prev) => ({ ...prev, estado: 'Todos', seguimiento: 'Todos', soloVencidas: false, fastFilter: 'Todos' }));
    } else if (metric === 'activos') {
      setFilters((prev) => ({ ...prev, estado: 'Activo', seguimiento: 'Todos', soloVencidas: false, fastFilter: 'Activos' }));
    } else if (metric === 'vencidos') {
      setFilters((prev) => ({ ...prev, seguimiento: 'Vencidos', estado: 'Todos', soloVencidas: false, fastFilter: 'Vencidos' }));
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#0b1329] font-sans text-[#033d59] dark:text-[#f8fafc] transition-colors duration-200">
      <div className="flex-1 flex flex-col overflow-hidden px-4 md:px-8 py-2 max-w-[1600px] w-full mx-auto">
        
        {/* Header */}
        <Header
          activeRole={activeRole}
          onRoleChange={setActiveRole}
          totalPatients={totalPatients}
          overdueCount={overdueCount}
          activeCount={activeCount}
          inconformeCount={inconformeCount}
          onSelectMetricCard={handleSelectMetricCard}
          activeMetricCard={activeMetricCard}
          fastFilter={filters.fastFilter || 'Todos'}
          onFastFilterChange={(filter) => setFilters((prev) => ({ ...prev, fastFilter: filter }))}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenOracleDoc={() => setIsOracleDocOpen(true)}
          onOpenChat={() => {
            setChatInitialPatient(null);
            setIsChatOpen(true);
          }}
        />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          coordinatorsList={coordinatorsList}
          conveniosList={conveniosList}
          onResetFilters={handleResetFilters}
          alarmCount={alarmCount}
          onAddCohorte={handleAddCohorte}
          columnGroup={columnGroup}
          onColumnGroupChange={setColumnGroup}
        />

        {/* Main Table Section */}
        <PatientTable
          patients={filteredPatients}
          activeRole={activeRole}
          columnGroup={columnGroup}
          isLoading={isLoading}
          serverPagination={{
            currentPage,
            totalPages: paginationMeta.total_paginas,
            totalRecords: paginationMeta.total_registros,
            itemsPerPage,
            onPageChange: (newPage) => setCurrentPage(newPage),
            onItemsPerPageChange: (newSize) => {
              setItemsPerPage(newSize);
              setCurrentPage(1);
            },
          }}
          onEditPatient={(patient) => setEditingPatient(patient)}
          onUpdatePrioridad={handleUpdatePrioridad}
          onUpdateStatus={handleUpdateStatus}
          onUpdateRisk={handleUpdateRisk}
          onUpdateCohorte={handleUpdateCohorte}
          onUpdateCoordinador={handleUpdateCoordinador}
          onUpdateRetro={handleUpdateRetro}
          onOpenActa={(patient) => setActaModalPatient(patient)}
          onOpenNotesDrawer={(patient, type) => setNotesDrawerState({ patient, type })}
          onOpenEvolucion={(patient) => setEpicrisisPatient(patient)}
          onEditSpecialist={(patient, key, info) => setEditingSpecialist({ patient, key, info })}
          onOpenCostAnalysis={(patient) => setCostAnalysisPatient(patient)}
          onOpenCuadroMedico={(patient) => setCuadroMedicoPatient(patient)}
          onOpenAgenda={(patient) => setAgendaPatient(patient)}
          onOpenTasas={(patient) => setTasasPatient(patient)}
          onOpen360={(patient) => setSelected360Patient(patient)}
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

          <div className="flex items-center gap-3.5 text-[11px] font-medium text-[#035476]">
            <span className="font-semibold text-[#033d59]">Nivel de Riesgo:</span>
            <span className="flex items-center gap-1" title="Crítico (Triángulo Rojo)">
              <AlertTriangle className="w-3.5 h-3.5 text-[#e11d48] fill-[#e11d48]/20 stroke-[2.5]" />
              Crítico
            </span>
            <span className="flex items-center gap-1" title="Alto (Círculo Rojo)">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
              Alto
            </span>
            <span className="flex items-center gap-1" title="Medio (Círculo Amarillo)">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
              Medio
            </span>
            <span className="flex items-center gap-1" title="Bajo (Círculo Verde)">
              <span className="w-2.5 h-2.5 rounded-full bg-[#01ae6c]" />
              Bajo
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
          activeRole={activeRole}
          onSaveActa={handleSaveActa}
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
          activeRole={activeRole}
          onSaveCuadroMedico={handleSaveCuadroMedico}
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

      {epicrisisPatient && (
        <EpicrisisModal
          patient={epicrisisPatient}
          onClose={() => setEpicrisisPatient(null)}
        />
      )}

      {selected360Patient && (
        <Patient360Modal
          patient={selected360Patient}
          onClose={() => setSelected360Patient(null)}
        />
      )}

      {/* Floating Action Button (FAB) para Chat Asistente IA */}
      {!isChatOpen && (
        <aside aria-label="Asistente IA Teker" className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => {
              setChatInitialPatient(null);
              setIsChatOpen(true);
            }}
            title="Iniciar conversación con el Asistente IA"
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#008cb9] via-[#00aae1] to-[#00c0f7] text-white font-bold shadow-xl shadow-[#00aae1]/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/20"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>
            <span className="text-xs tracking-wide">Chat IA</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          </button>
        </aside>
      )}

      {/* Asistente IA Chat Modal */}
      <PatientChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        patients={filteredPatients}
        initialPatient={chatInitialPatient}
        columnGroup={columnGroup}
      />

      {/* Oracle DB Documentation Modal */}
      <OracleDocModal
        isOpen={isOracleDocOpen}
        onClose={() => setIsOracleDocOpen(false)}
      />
    </div>
  );
}
