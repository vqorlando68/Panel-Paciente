import { Patient, SpecialistKey, SpecialistInfo, ActaInfo } from '../types';
import { INITIAL_PATIENTS } from '../mockData';

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
};

/**
 * Service layer for Patient data operations.
 * Executes HTTP calls to Vercel Serverless API endpoints (`/api/patients`)
 * which in turn execute `pkgln_pacientes_giris.prc_obtener_pacientes`.
 */
export class PatientService {
  private static patientsCache: Patient[] = [...INITIAL_PATIENTS];

  private static buildSpecialistsFromAttentions(raw: any): Record<SpecialistKey, SpecialistInfo> {
    const defaultMap: Record<SpecialistKey, SpecialistInfo> = {
      med_gen: { specialistTitle: 'MEDICO GEN.', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      nutri:   { specialistTitle: 'NUTRICIONISTA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      psicol:  { specialistTitle: 'PSICOLOGIA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      esp_1:   { specialistTitle: 'CARDIOLOGÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      esp_2:   { specialistTitle: 'ENDOCRINOLOGÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      esp_3:   { specialistTitle: 'NEFROLOGÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
      esp_4:   { specialistTitle: 'NEUROLOGÍA', professionalName: 'Sin Asignar', lastAttentionDate: '—', frequency: 'Sin definir', targetDate: '—', attentionsHistory: [] },
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
      if (idNum === 101) return 'esp_1';
      if (idNum === 102) return 'esp_2';
      if (idNum === 103) return 'esp_3';
      if (idNum === 104) return 'esp_4';

      const s = (specName || '').toLowerCase().trim();
      if (s.includes('medicin') || s.includes('médic') || s.includes('gen') || s === 'med_gen') return 'med_gen';
      if (s.includes('nutri') || s === 'nutri') return 'nutri';
      if (s.includes('psico') || s === 'psicol') return 'psicol';
      if (s.includes('cardio') || s === 'esp_1') return 'esp_1';
      if (s.includes('endocrino') || s === 'esp_2') return 'esp_2';
      if (s.includes('nefro') || s === 'esp_3') return 'esp_3';
      if (s.includes('neuro') || s === 'esp_4') return 'esp_4';

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
      cohorte: raw.cohorte ?? null,
      estado: raw.estado ?? null,
      riesgo: (rawRiesgo && ['Critical', 'High', 'Medium', 'Low'].includes(rawRiesgo) ? rawRiesgo : null) as any,
      etiqueta: raw.etiqueta ?? null,
      retroalimentacion: raw.retroalimentacion ?? null,
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
   * Fetch all patients calling the Oracle PL/SQL Package endpoint /api/patients
   */
  static async getPatients(): Promise<Patient[]> {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        console.log('[PatientService] API Response:', data);
        if (data && data.codigo_respuesta === 0 && Array.isArray(data.pacientes) && data.pacientes.length > 0) {
          const normalized = data.pacientes.map((p: any) => this.normalizePatient(p));
          this.patientsCache = normalized;
          return normalized;
        } else if (data && data.mensaje_respuesta) {
          console.warn('[PatientService] Oracle Response:', data.mensaje_respuesta);
        }
      }
    } catch (error) {
      console.warn('[PatientService] Error calling /api/patients:', error);
    }
    if (!this.patientsCache || this.patientsCache.length === 0) {
      this.patientsCache = [...INITIAL_PATIENTS];
    }
    return [...this.patientsCache];
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
}
