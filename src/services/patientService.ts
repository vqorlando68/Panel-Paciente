import { Patient } from '../types';
import { INITIAL_PATIENTS } from '../mockData';

/**
 * Service layer for Patient data operations.
 * Executes HTTP calls to Vercel Serverless API endpoints (`/api/patients`)
 * which in turn execute `pkgln_pacientes_giris.prc_obtener_pacientes`.
 */
export class PatientService {
  private static patientsCache: Patient[] = [...INITIAL_PATIENTS];

  /**
   * Fetch all patients calling the Oracle PL/SQL Package endpoint /api/patients
   */
  static async getPatients(): Promise<Patient[]> {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.pacientes) && data.pacientes.length > 0) {
          this.patientsCache = data.pacientes;
          return data.pacientes;
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
