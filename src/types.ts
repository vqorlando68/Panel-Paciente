export type UserRole = 'comite_medico' | 'coordinadora_siau';

export type EstadoPaciente = 'Activo' | 'Aceptado' | 'Rechazado';

export type NivelRiesgo = 'Critical' | 'High' | 'Medium' | 'Low';

export type FasePaciente = 'E' | 'D' | 'I' | 'M/E';

export type SpecialistKey = 'med_gen' | 'nutri' | 'psicol' | 'esp_1' | 'esp_2' | 'esp_3';

export interface SpecialistInfo {
  specialistTitle: string; // e.g. "Med. Gen.", "Cardiología", etc.
  professionalName: string;
  lastAttentionDate: string; // YYYY-MM-DD
  frequency: string; // e.g. "Cada 30 días", "Trimestral"
  targetDate: string; // YYYY-MM-DD
  isOverdue?: boolean;
}

export interface NoteEntry {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
}

export interface ActaInfo {
  numero: number;
  fecha: string;
  resumen: string;
  integrantes?: string[];
}

export interface Patient {
  id: string;
  nombre: string;
  avatarUrl?: string;
  identificacion: string; // e.g., "CC 1029384756"
  telefono: string;
  email: string;
  direccion: string;
  idConvenio: string; // ID Convenio
  cohorte: string;
  estado: EstadoPaciente;
  riesgo: NivelRiesgo;
  etiqueta: string;
  fase: FasePaciente;
  acta: ActaInfo;
  coordinador: string;
  numeroCarga: string;
  specialists: Record<SpecialistKey, SpecialistInfo>;
  operationalNotes: NoteEntry[];
  clinicalNotes: NoteEntry[];
}

export interface FilterState {
  estado: string; // 'Todos' | EstadoPaciente
  seguimiento: string; // 'Todos' | 'Vencidos' | 'Al Día'
  coordinador: string; // 'Todos' | specific name
  identificacion: string;
  nombresApellidos: string;
  numeroCarga: string;
  soloVencidas: boolean;
}
