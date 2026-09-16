import { Patient, SpecialistKey, SpecialistInfo, ActaInfo, ActaUsuarioDB, CostAnalysisResponse, ProfesionalEquipoMedico, AtencionProgramadaDB, AdherenciaData } from '../types';
import { INITIAL_PATIENTS } from '../mockData';
import { DEFAULT_COST_ANALYSIS_DATA } from '../mockCostData';

const DEFAULT_SPECIALISTS: Record<SpecialistKey, SpecialistInfo> = {
  med_gen: {
    specialistTitle: 'MEDICO GEN.',
    professionalName: 'Dr. Carlos Mendoza',
    lastAttentionDate: '10/01/2026 09:00 AM',
    frequency: 'Mensual',
    targetDate: '10/02/2026 09:00 AM',
    isOverdue: false,
    attentionsHistory: [],
  },
  nutri: {
    specialistTitle: 'NUTRICIONISTA',
    professionalName: 'Lic. Mariana Gómez',
    lastAttentionDate: '15/06/2026 10:30 AM',
    frequency: 'Bimensual',
    targetDate: '15/08/2026 10:30 AM',
    isOverdue: false,
    attentionsHistory: [],
  },
  psicol: {
    specialistTitle: 'PSICOLOGIA',
    professionalName: 'Dra. Claudia Ruiz',
    lastAttentionDate: '20/06/2026 02:00 PM',
    frequency: 'Quincenal',
    targetDate: '04/08/2026 02:00 PM',
    isOverdue: false,
    attentionsHistory: [],
  },
  med_dep: {
    specialistTitle: 'MED. DEPORTE',
    professionalName: 'Dr. Santiago Gómez',
    lastAttentionDate: '15/07/2026 10:00 AM',
    frequency: 'Trimestral',
    targetDate: '15/10/2026 10:00 AM',
    isOverdue: false,
    attentionsHistory: [],
  },
  med_int: {
    specialistTitle: 'MED. INTERNA',
    professionalName: 'Dra. Patricia Morales',
    lastAttentionDate: '01/08/2026 09:30 AM',
    frequency: 'Bimensual',
    targetDate: '01/10/2026 09:30 AM',
    isOverdue: false,
    attentionsHistory: [],
  },
  esp_1: {
    specialistTitle: 'ESP. 1',
    professionalName: 'Dr. Roberto Silva',
    lastAttentionDate: '01/07/2026 11:00 AM',
    frequency: 'Trimestral',
    targetDate: '01/10/2026 11:00 AM',
    isOverdue: false,
    attentionsHistory: [],
  },
  esp_2: {
    specialistTitle: 'ESP. 2',
    professionalName: 'Dr. Andrés Parra',
    lastAttentionDate: '12/03/2026 03:00 PM',
    frequency: 'Semestral',
    targetDate: '12/09/2026 03:00 PM',
    isOverdue: false,
    attentionsHistory: [],
  },
  esp_3: {
    specialistTitle: 'ESP. 3',
    professionalName: 'Dra. Beatriz Franco',
    lastAttentionDate: '14/06/2026 08:00 AM',
    frequency: 'Trimestral',
    targetDate: '15/09/2026 08:00 AM',
    isOverdue: false,
    attentionsHistory: [],
  },
  esp_4: {
    specialistTitle: 'ESP. 4',
    professionalName: 'Dr. Gabriel Restrepo',
    lastAttentionDate: '20/05/2026 02:00 PM',
    frequency: 'Bimensual',
    targetDate: '20/07/2026 02:00 PM',
    isOverdue: false,
    attentionsHistory: [],
  },
  psiq: {
    specialistTitle: 'PSIQUIATRÍA',
    professionalName: 'Dr. Pendiente',
    lastAttentionDate: '—',
    frequency: 'Sin definir',
    targetDate: '—',
    isOverdue: false,
    attentionsHistory: [],
  },
  uro: {
    specialistTitle: 'UROLOGÍA',
    professionalName: 'Dr. Pendiente',
    lastAttentionDate: '—',
    frequency: 'Sin definir',
    targetDate: '—',
    isOverdue: false,
    attentionsHistory: [],
  },
  fisiat: {
    specialistTitle: 'FISIATRÍA',
    professionalName: 'Dr. Pendiente',
    lastAttentionDate: '—',
    frequency: 'Sin definir',
    targetDate: '—',
    isOverdue: false,
    attentionsHistory: [],
  },
};

export interface PatientsPagination {
  pagina_actual: number;
  registros_por_pagina: number;
  total_registros: number;
  total_base?: number;
  total_paginas: number;
  total_activos?: number;
  total_inconforme?: number;
}

export interface GetPatientsResult {
  pacientes: Patient[];
  paginacion: PatientsPagination;
}

export class PatientService {
  private static patientsCache: Patient[] = [...INITIAL_PATIENTS];

  private static buildSpecialistsFromAttentions(raw: any): Record<SpecialistKey, SpecialistInfo> {
    const defaultMap: Record<SpecialistKey, SpecialistInfo> = {
      med_gen: { specialistTitle: 'MEDICO GEN.', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      nutri:   { specialistTitle: 'NUTRICIONISTA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      psicol:  { specialistTitle: 'PSICOLOGIA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      med_dep: { specialistTitle: 'MED. DEPORTE', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      med_int: { specialistTitle: 'MED. INTERNA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      esp_1:   { specialistTitle: 'CARDIOLOGÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      esp_2:   { specialistTitle: 'ENDOCRINOLOGÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      esp_3:   { specialistTitle: 'NEFROLOGÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      esp_4:   { specialistTitle: 'NEUROLOGÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      psiq:    { specialistTitle: 'PSIQUIATRÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      uro:     { specialistTitle: 'UROLOGÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      fisiat:  { specialistTitle: 'FISIATRÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
    };

    if (raw.specialists && typeof raw.specialists === 'object') {
      Object.keys(raw.specialists).forEach((k) => {
        const key = k as SpecialistKey;
        if (defaultMap[key]) {
          defaultMap[key] = { ...defaultMap[key], ...raw.specialists[key] };
        }
      });
    }

    const atenciones = Array.isArray(raw.atenciones_programadas)
      ? raw.atenciones_programadas
      : Array.isArray(raw.agenda)
      ? raw.agenda
      : [];

    const getKey = (specName: string, idSpec?: number | string): SpecialistKey | null => {
      const idNum = idSpec ? Number(idSpec) : 0;
      if (idNum === 17) return 'med_gen';
      if (idNum === 37) return 'nutri';
      if (idNum === 36) return 'psicol';
      if (idNum === 47) return 'med_dep';
      if (idNum === 18) return 'med_int';
      if (idNum === 2 || idNum === 101) return 'esp_1';
      if (idNum === 9 || idNum === 102) return 'esp_2';
      if (idNum === 20 || idNum === 103) return 'esp_3';
      if (idNum === 23 || idNum === 104) return 'esp_4';
      if (idNum === 31) return 'psiq';
      if (idNum === 35) return 'uro';
      if (idNum === 38) return 'fisiat';

      const s = (specName || '').toLowerCase().trim();
      if (s.includes('deporte') || s.includes('deport') || s === 'med_dep') return 'med_dep';
      if (s.includes('interna') || s === 'med_int') return 'med_int';
      if (s.includes('general') || s === 'med_gen') return 'med_gen';
      if (s.includes('nutri') || s === 'nutri') return 'nutri';
      if (s.includes('psico') || s === 'psicol') return 'psicol';
      if (s.includes('cardio') || s === 'esp_1') return 'esp_1';
      if (s.includes('endocrino') || s === 'esp_2') return 'esp_2';
      if (s.includes('nefro') || s === 'esp_3') return 'esp_3';
      if (s.includes('neuro') || s === 'esp_4') return 'esp_4';
      if (s.includes('psiquiat') || s === 'psiq') return 'psiq';
      if (s.includes('urolo') || s === 'uro') return 'uro';
      if (s.includes('fisiatr') || s.includes('rehabilitaci') || s === 'fisiat') return 'fisiat';

      // Fallback para mención genérica médica
      if (s.includes('medicin') || s.includes('médic') || s.includes('gen')) return 'med_gen';

      return null;
    };

    atenciones.forEach((item: any) => {
      const specName = item.nombre_especialidad || item.especialidad || item.specialty || '';
      const idSpec = item.id_especialidad;
      const key = getKey(specName, idSpec);

      if (key) {
        const profName = item.nombre_profesional || item.profesional || item.professional || item.medico || 'Sin Asignar';
        const fecha = item.fecha_cita || item.fecha || item.date || item.fecha_programada || '—';
        const estado = item.estado_cita || item.estado || item.status || 'Programada';
        const freq = item.frecuencia || item.frequency || 'Sin definir';
        const codCita = item.codigo_cita || item.codigo || item.id_cita || (item.id ? String(item.id) : undefined);

        const current = defaultMap[key];
        const history = current.attentionsHistory ? [...current.attentionsHistory] : [];
        history.push({
          id: String(item.id || item.codigo_cita || Math.random()),
          codigoCita: codCita ? String(codCita) : undefined,
          dateTime: fecha,
          professional: profName,
          status: estado,
        });

        const lastCod = codCita ? String(codCita) : undefined;

        defaultMap[key] = {
          ...current,
          professionalName: profName !== 'Sin Asignar' ? profName : current.professionalName,
          lastAttentionDate: fecha !== '—' ? fecha : current.lastAttentionDate,
          lastAttentionCode: lastCod || current.lastAttentionCode,
          targetDate: fecha !== '—' ? fecha : current.targetDate,
          frequency: freq !== 'Sin definir' ? freq : current.frequency,
          attentionsCount: history.length,
          attentionsHistory: history,
        };
      }
    });

    return defaultMap;
  }

  private static parseJsonSafely(input: any): any {
    if (!input) return null;
    if (typeof input === 'object') return input;
    if (typeof input === 'string') {
      try {
        let s = input.trim();
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
          s = JSON.parse(s);
        }
        return JSON.parse(s);
      } catch {
        return null;
      }
    }
    return null;
  }

  private static buildActasHistory(raw: any): ActaInfo[] {
    let rawActasArr: any[] = [];
    if (Array.isArray(raw.actas_medicas)) {
      rawActasArr = raw.actas_medicas;
    } else if (Array.isArray(raw.actas_registradas)) {
      rawActasArr = raw.actas_registradas;
    } else if (Array.isArray(raw.actas)) {
      rawActasArr = raw.actas;
    } else if (Array.isArray(raw.actasHistory)) {
      rawActasArr = raw.actasHistory;
    } else if (Array.isArray(raw.json_result)) {
      rawActasArr = raw.json_result;
    } else {
      const parsed =
        this.parseJsonSafely(raw.actas_medicas) ||
        this.parseJsonSafely(raw.actas_registradas) ||
        this.parseJsonSafely(raw.actas) ||
        this.parseJsonSafely(raw.json_result);
      if (Array.isArray(parsed)) {
        rawActasArr = parsed;
      }
    }

    return rawActasArr.map((a: any) => {
      let item = a;
      if (typeof a === 'string') {
        item = this.parseJsonSafely(a) || {};
      }
      const num = Number(item.numero_acta ?? item.numero ?? item.id ?? 101);
      const fecha = String(item.fecha_acta ?? item.fecha ?? item.fecha_acta_medica ?? '').trim();
      const obsClinicas = String(item.observaciones_clinicas ?? item.observaciones ?? item.resumen ?? '').trim();
      const obsOperativas = String(item.observaciones_operativas ?? '').trim();

      const resumenText = [obsClinicas, obsOperativas ? `\n[Observaciones Operativas]: ${obsOperativas}` : '']
        .filter(Boolean)
        .join('\n');

      return {
        numero: isNaN(num) ? 101 : num,
        fecha: fecha || '—',
        resumen: resumenText || 'Sin observaciones registradas',
        observaciones_clinicas: obsClinicas,
        observaciones_operativas: obsOperativas,
        integrantes: Array.isArray(item.integrantes) ? item.integrantes : undefined,
      };
    });
  }

  private static buildCurrentActa(raw: any): ActaInfo | null {
    const history = this.buildActasHistory(raw);
    if (history.length > 0) return history[0];
    if (raw.acta && typeof raw.acta === 'object') {
      return {
        numero: Number(raw.acta.numero || raw.acta.numero_acta || 101),
        fecha: String(raw.acta.fecha || raw.acta.fecha_acta || ''),
        resumen: String(raw.acta.resumen || raw.acta.observaciones_clinicas || raw.acta.observaciones || ''),
        observaciones_clinicas: raw.acta.observaciones_clinicas || raw.acta.observaciones,
        observaciones_operativas: raw.acta.observaciones_operativas,
        integrantes: Array.isArray(raw.acta.integrantes) ? raw.acta.integrantes : undefined,
      };
    }
    return null;
  }

  private static normalizePatient(raw: any): Patient {
    const rawRiesgo = raw.riesgo || (
      raw.id_nivel_riesgo === 1 ? 'High' :
      raw.id_nivel_riesgo === 4 ? 'Critical' :
      raw.id_nivel_riesgo === 3 ? 'Low' :
      raw.id_nivel_riesgo === 2 ? 'Medium' : null
    );

    const nombres = raw.nombres ?? null;
    const apellidos = raw.apellidos ?? null;
    const nombre = raw.nombre || [nombres, apellidos].filter(Boolean).join(' ') || 'Sin Nombre';

    const rawTag = raw.tag_retroalimentacion || raw.etiqueta || raw.retroalimentacion;
    let etiquetaVal: string | null = null;
    if (rawTag === 'C' || rawTag === 'Critico' || rawTag === 'Crítico') {
      etiquetaVal = 'Crítico';
    } else if (rawTag === 'I' || rawTag === 'Inconforme') {
      etiquetaVal = 'Inconforme';
    } else if (rawTag) {
      etiquetaVal = String(rawTag);
    }

    const rawEstadoId = raw.id_estado_cohorte !== undefined && raw.id_estado_cohorte !== null ? Number(raw.id_estado_cohorte) : null;
    const estadoNombre = raw.estado || raw.cohorte || (rawEstadoId === 7 ? 'ACTIVO' : null);
    const cohorteNombre = raw.cohorte || raw.estado || (rawEstadoId === 7 ? 'ACTIVO' : null);

    return {
      id: raw.id ? String(raw.id) : '',
      nombres,
      apellidos,
      nombre,
      identificacion: raw.identificacion ?? null,
      telefono: raw.telefono ?? null,
      email: raw.email || raw.correo_electronico || null,
      direccion: raw.direccion ?? null,
      idConvenio: raw.idConvenio ?? null,
      convenioNombre: raw.convenioNombre ?? null,
      prioridadInicial: typeof raw.prioridadInicial === 'number' ? raw.prioridadInicial : null,
      fechaProximaRevision: raw.fechaProximaRevision || raw.fecha_proxima_revision || null,
      cohorte: cohorteNombre ?? null,
      id_estado_cohorte: rawEstadoId,
      estado: estadoNombre as any,
      riesgo: (rawRiesgo && ['Critical', 'High', 'Medium', 'Low'].includes(rawRiesgo) ? rawRiesgo : null) as any,
      etiqueta: etiquetaVal,
      tag_retroalimentacion: raw.tag_retroalimentacion ?? (rawTag === 'C' || rawTag === 'I' ? rawTag : null),
      retroalimentacion: raw.retroalimentacion ?? etiquetaVal,
      fase: raw.fase ?? null,
      acta: this.buildCurrentActa(raw),
      actasHistory: this.buildActasHistory(raw),
      coordinador: raw.coordinador || raw.coordinador_nombre || null,
      numeroCarga: raw.numeroCarga ?? null,
      hasAlarm: Boolean(raw.hasAlarm),
      alarmReasons: Array.isArray(raw.alarmReasons) ? raw.alarmReasons : [],
      tasas: raw.tasas ?? null,
      cuadroMedico: Array.isArray(raw.cuadroMedico) ? raw.cuadroMedico : [],
      agenda: Array.isArray(raw.agenda || raw.atenciones_programadas)
        ? (raw.agenda || raw.atenciones_programadas).map((a: any) => ({
            id: a.id || a.codigo_cita ? String(a.id || a.codigo_cita) : String(Math.random()),
            date: a.date || a.fecha_cita || '',
            time: a.time || '',
            specialty: a.specialty || a.nombre_especialidad || '',
            professional: a.professional || a.nombre_profesional || '',
            status: a.status || a.estado_cita || 'Programada',
            type: a.type || 'Presencial',
          }))
        : [],
      specialists: this.buildSpecialistsFromAttentions(raw),
      operationalNotes: Array.isArray(raw.operationalNotes || raw.observaciones_operativas)
        ? (raw.operationalNotes || raw.observaciones_operativas).map((n: any) => ({
            id: n.id ? String(n.id) : String(Math.random()),
            author: n.author || n.nombre_usuario || 'Sistema',
            role: n.role || n.rol || 'Coordinador',
            timestamp: n.timestamp || n.fecha_observacion || '',
            content: n.content || n.observacion || '',
          }))
        : [],
      clinicalNotes: Array.isArray(raw.clinicalNotes || raw.observaciones_clinicas)
        ? (raw.clinicalNotes || raw.observaciones_clinicas).map((n: any) => ({
            id: n.id ? String(n.id) : String(Math.random()),
            author: n.author || n.nombre_usuario || 'Sistema',
            role: n.role || n.rol || 'Médico',
            timestamp: n.timestamp || n.fecha_observacion || '',
            content: n.content || n.observacion || '',
          }))
        : [],
      epicrisis: raw.epicrisis || raw.epicrisis_paciente || null,
    };
  }

  /**
   * Fetch paginated patients calling the Oracle PL/SQL Package endpoint /api/patients
   */
  static async getPatientsPaged(filters?: {
    pagina?: number;
    registros_por_pagina?: number;
    identificacion?: string;
    nombresApellidos?: string;
    coordinador?: string;
    convenioNombre?: string | string[];
    estado?: string;
    fastFilter?: string;
  }): Promise<GetPatientsResult> {
    try {
      const query = new URLSearchParams();
      if (filters?.pagina) query.set('pagina', String(filters.pagina));
      if (filters?.registros_por_pagina) query.set('registros_por_pagina', String(filters.registros_por_pagina));
      if (filters?.identificacion && filters.identificacion.trim()) {
        query.set('identificacion', filters.identificacion.trim());
      }
      if (filters?.nombresApellidos && filters.nombresApellidos.trim()) {
        query.set('nombresApellidos', filters.nombresApellidos.trim());
      }
      if (filters?.coordinador && filters.coordinador !== 'Todos' && filters.coordinador.trim()) {
        query.set('coordinador', filters.coordinador.trim());
      }
      if (filters?.convenioNombre && filters.convenioNombre !== 'Todos') {
        const val = Array.isArray(filters.convenioNombre)
          ? filters.convenioNombre.filter((c) => c && c !== 'Todos').join(',')
          : String(filters.convenioNombre).trim();
        if (val && val !== 'Todos') {
          query.set('convenioNombre', val);
        }
      }
      if (filters?.estado && filters.estado !== 'Todos') {
        query.set('estado', filters.estado);
      }
      if (filters?.fastFilter && filters.fastFilter !== 'Todos') {
        query.set('fastFilter', filters.fastFilter);
      }

      const url = `/api/patients${query.toString() ? '?' + query.toString() : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('[PatientService] API Response:', data);
        if (data && data.codigo_respuesta === 0 && Array.isArray(data.pacientes)) {
          const normalized = data.pacientes.map((p: any) => this.normalizePatient(p));
          this.patientsCache = normalized;
          const paginacion: PatientsPagination = {
            pagina_actual: data.paginacion?.pagina_actual || filters?.pagina || 1,
            registros_por_pagina: data.paginacion?.registros_por_pagina || filters?.registros_por_pagina || 10,
            total_registros: data.paginacion?.total_registros ?? normalized.length,
            total_base: data.paginacion?.total_base ?? data.paginacion?.total_registros ?? normalized.length,
            total_paginas: data.paginacion?.total_paginas ?? Math.max(1, Math.ceil(normalized.length / (filters?.registros_por_pagina || 10))),
            total_activos: data.paginacion?.total_activos !== undefined ? Number(data.paginacion.total_activos) : normalized.filter((p: any) => p.id_estado_cohorte === 7 || p.estado === 'Activo').length,
            total_inconforme: data.paginacion?.total_inconforme !== undefined ? Number(data.paginacion.total_inconforme) : normalized.filter((p: any) => p.tag_retroalimentacion === 'I' || p.etiqueta === 'Inconforme').length,
          };
          return { pacientes: normalized, paginacion };
        } else if (data && data.mensaje_respuesta) {
          console.warn('[PatientService] Oracle Response:', data.mensaje_respuesta);
        }
      }
    } catch (error) {
      console.warn('[PatientService] Error calling /api/patients:', error);
    }
    return {
      pacientes: [...this.patientsCache],
      paginacion: {
        pagina_actual: 1,
        registros_por_pagina: 10,
        total_registros: this.patientsCache.length,
        total_paginas: Math.max(1, Math.ceil(this.patientsCache.length / 10)),
        total_activos: this.patientsCache.filter((p: any) => p.id_estado_cohorte === 7 || p.estado === 'Activo').length,
        total_inconforme: this.patientsCache.filter((p: any) => p.tag_retroalimentacion === 'I' || p.etiqueta === 'Inconforme').length,
      },
    };
  }

  /**
   * Fetch all patients calling the Oracle PL/SQL Package endpoint /api/patients
   */
  static async getPatients(filters?: {
    pagina?: number;
    registros_por_pagina?: number;
    identificacion?: string;
    nombresApellidos?: string;
    coordinador?: string;
    convenioNombre?: string | string[];
  }): Promise<Patient[]> {
    const res = await this.getPatientsPaged(filters);
    return res.pacientes;
  }

  /**
   * Fetch real coordinators list from Oracle endpoint /api/patients?action=coordinadores
   */
  static async getCoordinadores(): Promise<string[]> {
    try {
      const response = await fetch('/api/patients?action=coordinadores');
      if (response.ok) {
        const data = await response.json();
        if (data && data.codigo_respuesta === 0 && Array.isArray(data.coordinadores)) {
          const names = data.coordinadores
            .map((c: any) => `${c.nombres || ''} ${c.apellidos || ''}`.trim())
            .filter(Boolean);
          if (names.length > 0) {
            return Array.from(new Set<string>(names)).sort();
          }
        }
      }
    } catch (err) {
      console.warn('[PatientService] Error loading coordinadores:', err);
    }
    return [];
  }

  /**
   * Update an existing patient record
   */
  static async updatePatient(updatedPatient: Patient): Promise<Patient> {
    this.patientsCache = this.patientsCache.map((p) =>
      p.id === updatedPatient.id ? updatedPatient : p
    );
    return updatedPatient;
  }

  /**
   * Add a new patient record
   */
  static async addPatient(newPatient: Patient): Promise<Patient> {
    this.patientsCache = [newPatient, ...this.patientsCache];
    return newPatient;
  }

  /**
   * Reset patients data state
   */
  static async resetData(): Promise<Patient[]> {
    this.patientsCache = [...INITIAL_PATIENTS];
    return this.patientsCache;
  }

  /**
   * Fetch Cost Analysis by calling Oracle function f_traer_costos(:mes_corte, :identificacion)
   */
  static async getCostAnalysis(mesCorte: string, identificacion: string): Promise<CostAnalysisResponse> {
    try {
      const cleanIdentificacion = String(identificacion || '').replace(/\D/g, '').trim() || String(identificacion || '').trim();
      const cleanMes = String(mesCorte || '').trim().replace(/\s+/g, '_');
      const params = new URLSearchParams({
        action: 'costos',
        mes_corte: cleanMes,
        identificacion: cleanIdentificacion,
      });

      const response = await fetch(`/api/patients?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data && (data.job_id || data.user_data || data.global_calculated || data.costos_data || data.user_calculated)) {
          return {
            ...data,
            requested_user_id: cleanIdentificacion,
          } as CostAnalysisResponse;
        }
      }
    } catch (error) {
      console.warn('[PatientService] Error calling /api/patients?action=costos:', error);
    }
    return DEFAULT_COST_ANALYSIS_DATA;
  }

  /**
   * Fetch registered committee actas for a specific patient
   * Invokes pkgcn_cohortes.p_actas_x_usuario through /api/patients?action=actas_x_usuario
   */
  static async getActasPorUsuario(idUsuario: string | number): Promise<ActaUsuarioDB[]> {
    try {
      const cleanId = String(idUsuario).replace(/\D/g, '') || String(idUsuario);
      const resp = await fetch(`/api/patients?action=actas_x_usuario&id_usuario=${encodeURIComponent(cleanId)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) {
          return data;
        }
        if (data && Array.isArray(data.actas)) {
          return data.actas;
        }
      }
    } catch (error) {
      console.warn('[PatientService] Error calling /api/patients?action=actas_x_usuario:', error);
    }
    return [];
  }

  /**
   * Fetch complete clinical details for an acta
   * Invokes pkgcn_cohortes.f_ver_acta through /api/patients?action=ver_acta
   */
  static async getDetalleActa(idActa: string | number): Promise<any> {
    try {
      const cleanId = String(idActa).replace(/\D/g, '') || String(idActa);
      const resp = await fetch(`/api/patients?action=ver_acta&id_acta=${encodeURIComponent(cleanId)}`);
      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.data) {
          return json.data;
        }
        if (json.data) {
          return json.data;
        }
      }
    } catch (error) {
      console.warn('[PatientService] Error calling /api/patients?action=ver_acta:', error);
    }
    return null;
  }

  /**
   * Fetches assigned medical team (Cuadro Médico Asignado) for a patient
   * by calling /api/patients?action=cuadro_medico&id_usuario=<id>
   * which executes pkgcn_citas.p_equipo_medico_paciente(v_id_usuario, v_json_salida)
   */
  static async getEquipoMedico(idUsuario: string | number): Promise<ProfesionalEquipoMedico[]> {
    try {
      const cleanId = String(idUsuario || '').replace(/\D/g, '') || String(idUsuario || '').trim();
      if (!cleanId) return [];
      const resp = await fetch(`/api/patients?action=cuadro_medico&id_usuario=${encodeURIComponent(cleanId)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.profesionales)) {
          return data.profesionales;
        }
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      console.warn('[PatientService] Error calling /api/patients?action=cuadro_medico:', error);
    }
    return [];
  }

  /**
   * Fetches programmed agenda / scheduled attentions for a patient
   * by calling /api/patients?action=agenda&id_usuario=<id>
   * which executes pkgcn_cohortes.f_atenciones_programadas(p_id_usuario)
   */
  static async getAtencionesProgramadas(idUsuario: string | number): Promise<AtencionProgramadaDB[]> {
    try {
      const cleanId = String(idUsuario || '').replace(/\D/g, '') || String(idUsuario || '').trim();
      if (!cleanId) return [];
      const resp = await fetch(`/api/patients?action=agenda&id_usuario=${encodeURIComponent(cleanId)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.atenciones_programadas)) {
          return data.atenciones_programadas;
        }
        if (data && Array.isArray(data.agenda)) {
          return data.agenda;
        }
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      console.warn('[PatientService] Error calling /api/patients?action=agenda:', error);
    }
    return [];
  }

  /**
   * Obtiene la adherencia de un paciente llamando
   * /api/patients?action=adherencia&id_usuario=<id>
   * que ejecuta pkgcn_cohortes.f_adherencia_usuario(id_usuario)
   * Retorna: { id_usuario, recomendadas, realizadas, porcentaje }
   */
  static async getAdherencia(idUsuario: string | number): Promise<AdherenciaData | null> {
    try {
      const cleanId = String(idUsuario || '').trim();
      if (!cleanId) return null;
      const resp = await fetch(`/api/patients?action=adherencia&id_usuario=${encodeURIComponent(cleanId)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && typeof data.recomendadas === 'number') {
          const recomendadas = Number(data.recomendadas);
          const realizadas = Number(data.realizadas);
          const porcentaje = recomendadas > 0 ? Math.round((realizadas / recomendadas) * 100) : 0;
          return { id_usuario: Number(data.id_usuario || idUsuario), recomendadas, realizadas, porcentaje };
        }
      }
    } catch (error) {
      console.warn('[PatientService] Error calling /api/patients?action=adherencia:', error);
    }
    return null;
  }
}

