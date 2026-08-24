import { Patient, SpecialistKey, SpecialistInfo } from '../types';
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
      fechaProximaRevision: raw.fechaProximaRevision ?? null,
      cohorte: raw.cohorte ?? null,
      estado: raw.estado ?? null,
      riesgo: (rawRiesgo && ['Critical', 'High', 'Medium', 'Low'].includes(rawRiesgo) ? rawRiesgo : null) as any,
      etiqueta: raw.etiqueta ?? null,
      retroalimentacion: raw.retroalimentacion ?? null,
      fase: raw.fase ?? null,
      acta: raw.acta ?? null,
      actasHistory: Array.isArray(raw.actasHistory) ? raw.actasHistory : [],
      coordinador: raw.coordinador || raw.coordinador_nombre || null,
      numeroCarga: raw.numeroCarga ?? null,
      hasAlarm: Boolean(raw.hasAlarm),
      alarmReasons: Array.isArray(raw.alarmReasons) ? raw.alarmReasons : [],
      tasas: raw.tasas ?? null,
      cuadroMedico: Array.isArray(raw.cuadroMedico) ? raw.cuadroMedico : [],
      agenda: Array.isArray(raw.agenda) ? raw.agenda : [],
      specialists: raw.specialists ?? null,
      operationalNotes: Array.isArray(raw.operationalNotes) ? raw.operationalNotes : [],
      clinicalNotes: Array.isArray(raw.clinicalNotes) ? raw.clinicalNotes : [],
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
        if (data && Array.isArray(data.pacientes) && data.pacientes.length > 0) {
          const normalized = data.pacientes.map((p: any) => this.normalizePatient(p));
          this.patientsCache = normalized;
          return normalized;
        }
      }
    } catch (error) {
      console.warn('[PatientService] Error calling /api/patients, using local dataset fallback:', error);
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
