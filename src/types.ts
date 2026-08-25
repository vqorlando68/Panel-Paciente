export type UserRole = 'comite_medico' | 'coordinadora_siau';

export type EstadoPaciente = 'Activo' | 'Aceptado' | 'Rechazado';

export type NivelRiesgo = 'Critical' | 'High' | 'Medium' | 'Low';

export type FasePaciente = 'E' | 'D' | 'I' | 'M/E';

export type SpecialistKey = 'med_gen' | 'nutri' | 'psicol' | 'esp_1' | 'esp_2' | 'esp_3' | 'esp_4';

export interface SpecialistAttentionItem {
  id: string;
  dateTime: string; // DD/MM/YYYY HH:MM AM/PM or YYYY-MM-DD HH:mm
  professional: string;
  status: string;
}

export interface SpecialistInfo {
  specialistTitle: string; // e.g. "Med. Gen.", "Cardiología", etc.
  professionalName: string;
  lastAttentionDate: string; // YYYY-MM-DD or DD/MM/YYYY HH:MM AM/PM
  frequency: string; // e.g. "Semanal", "Quincenal", "Mensual", "Bimensual", "Trimestral", "Semestral", "Anual"
  attentionsCount?: number; // Cantidad de atenciones
  targetDate: string; // YYYY-MM-DD or DD/MM/YYYY HH:MM AM/PM
  isOverdue?: boolean;
  hasRehuso?: boolean;
  attentionsHistory?: SpecialistAttentionItem[];
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

export interface TasasData {
  cancelacionesPct: number;
  cancelacionesNum: number;
  inasistenciasPct: number;
  inasistenciasNum: number;
  reprogramacionesPct: number;
  reprogramacionesNum: number;
  history: Array<{
    id: string;
    date: string;
    specialty: string;
    professional: string;
    status: 'Atendida' | 'Cancelada' | 'Inasistida' | 'Reprogramada';
  }>;
}

export interface CuadroMedicoItem {
  id: string;
  specialty: string;
  professional: string;
  inNetwork: boolean; // dentro o fuera de red
  phone?: string;
}

export interface AgendaItem {
  id: string;
  date: string;
  time: string;
  specialty: string;
  professional: string;
  status: 'Programada' | 'Completada' | 'Cancelada' | 'Pendiente';
  type: 'Presencial' | 'Teleconsulta' | 'Domiciliaria';
}

export interface Patient {
  id: string;
  nombres?: string | null;
  apellidos?: string | null;
  nombre: string;
  avatarUrl?: string;
  identificacion: string; // e.g., "CC 1.020.482.910"
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  idConvenio?: string | null; // ID Convenio
  convenioNombre?: string | null; // e.g. "EPS Suramericana Cuidate360"
  prioridadInicial?: number | null; // 1 to 10
  fechaProximaRevision?: string | null; // e.g. "18/08/2026"
  cohorte?: string | null;
  estado?: EstadoPaciente | null;
  riesgo?: NivelRiesgo | null;
  etiqueta?: string | null; // "Inconforme" or ""
  retroalimentacion?: string | null;
  fase?: FasePaciente | null;
  acta?: ActaInfo | null;
  actasHistory?: ActaInfo[];
  coordinador?: string | null;
  numeroCarga?: string | null;
  hasRehuso?: boolean;
  rehusoInfo?: { professional: string; specialty: string };
  tasas?: TasasData | null;
  hasAlarm?: boolean;
  alarmReasons?: string[];
  cuadroMedico?: CuadroMedicoItem[];
  agenda?: AgendaItem[];
  specialists?: Record<SpecialistKey, SpecialistInfo> | null;
  operationalNotes?: NoteEntry[];
  clinicalNotes?: NoteEntry[];
  epicrisis?: string | null;
}

export interface FilterState {
  estado: string; // 'Todos' | EstadoPaciente
  seguimiento: string; // 'Todos' | 'Vencidos' | 'Al Día'
  coordinador: string; // 'Todos' | specific name
  convenioNombre: string | string[]; // 'Todos' | specific convenio or array of convenios for multi-select
  cohorte: string; // 'Todos' | specific cohorte
  identificacion: string;
  nombresApellidos: string;
  numeroCarga: string;
  soloVencidas: boolean;
  soloAlarmas?: boolean;
  fastFilter?: string; // 'Todos' | 'Activos' | 'Vencidos' | 'Inconforme' | 'Críticos' | '>90 días' | 'Rehúso' | 'Aceptados' | 'Sin Acta'
}

export const COHORTE_OPTIONS = [
  { code: 'ERRORES', label: 'ERRORES - Enviado con errores' },
  { code: 'REPETIDO', label: 'REPETIDO - Enviado repetido por el asegurador' },
  { code: 'PROSPECTO', label: 'PROSPECTO - Paciente que se recibe de un asegurador' },
  { code: 'RECHAZADO', label: 'RECHAZADO - No acepta el programa' },
  { code: 'FALLECIDO I', label: 'FALLECIDO I - A la llamada ha fallecido' },
  { code: 'NO RESPUESTA', label: 'NO RESPUESTA - Se llama en múltiples ocasiones y no contesta' },
  { code: 'INTERESADO', label: 'INTERESADO - Es llamado y está interesado en el programa, pero por alguna razón no se activa al momento' },
  { code: 'ACEPTADO', label: 'ACEPTADO - Acepta el programa no está en maestro clínico, no tiene visita medicina general' },
  { code: 'ACTIVO', label: 'ACTIVO - Visto por medicina general' },
  { code: 'ESTRATIFICADO', label: 'ESTRATIFICADO - Estratificado' },
  { code: 'FALLECIDO II', label: 'FALLECIDO II - El paciente acepta y fallece antes de la primera consulta' },
  { code: 'FUERA DE AREA', label: 'FUERA DE AREA - Paciente fuera área temporalmente' },
  { code: 'DESERTADO', label: 'DESERTADO - Aceptó, pero luego se retiro' },
  { code: 'VISITADO ESPECIALISTA', label: 'VISITADO ESPECIALISTA - Visitado por especialista' },
  { code: 'FALLECIDOS III', label: 'FALLECIDOS III - Fallece durante el programa, después de la primera consulta' },
  { code: 'CONTACTO ERRADO', label: 'CONTACTO ERRADO - Los datos de contacto están errados' },
  { code: 'AFILIADO EN MORA', label: 'AFILIADO EN MORA - Afiliado en mora temporalmente sin servicio' },
  { code: 'NO CUMPLE CRITERIOS', label: 'NO CUMPLE CRITERIOS - No cumple con los criterios para pertenecer al programa' },
  { code: 'NO LOCALIZABLE', label: 'NO LOCALIZABLE - No contesta, número equivocado o no existe, fuera del país' },
  { code: 'PENDIENTE DE CONTACTO', label: 'PENDIENTE DE CONTACTO - Pide que lo llamen después' },
  { code: 'RECHAZA EL SERVICIO', label: 'RECHAZA EL SERVICIO - No acepta tele consulta, prefiere presencial, no acepta psicología, no quiere pagar el copago' },
  { code: 'SOLICITA RETIRO', label: 'SOLICITA RETIRO - No está interesado en el programa, solicita salir' },
  { code: 'NO DISPONIBLE TEMPORALMENTE', label: 'NO DISPONIBLE TEMPORALMENTE - De viaje, fuera de la ciudad, no tiene tiempo disponible' },
  { code: 'SITUACIÓN ESPECIAL', label: 'SITUACIÓN ESPECIAL - Hospitalizado, incapacitado, duelo o pérdida familiar' },
];

export const COORDINADORES_LIST = [
  'Anyeli Ledezma',
  'Katherine Mora',
  'Angela Valencia',
];


