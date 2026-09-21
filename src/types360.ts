// Types for Patient Evolution 360 (Coordinator View)

export interface SummaryConsultasData {
  coordinador_asignado?: string | null;
  perfil_riesgo_encuesta?: any | null;
  notas_clave?: string[];
  nota_operativa_reciente?: {
    tipo_nota?: string;
    fecha_nota?: string;
    fecha_modificacion?: string | null;
    nota?: string;
  } | null;
  adherencia_historica?: {
    n_recomendadas: number;
    n_atendidas: number;
    porcentaje: number;
  } | null;
  especialidades_incumplidas?: Array<{
    especialidad: string;
    atendidas: number;
    no_asistidas_por_paciente: number;
    ratio_incumplimiento: number;
  }>;
  ultima_cita_atendida?: {
    fecha: string;
    especialidad: string;
  } | null;
  proxima_cita?: {
    fecha: string;
    especialidad: string;
  } | null;
  dias_sin_visita_atendida?: number | null;
  dias_sin_contacto?: number | null;
  escalas_clinicas?: any[];
  perfilamiento?: {
    comprende_beneficio?: boolean | null;
    ha_desertado_previamente?: boolean | null;
    proxima_cita_confirmada?: boolean | null;
    cambio_coordinadora_reciente?: boolean | null;
  } | null;
  alertas?: Array<{
    tipo: string;
    severidad: 'alta' | 'media' | 'baja' | string;
    mensaje: string;
  }>;
}

export interface SummaryCambiosClaveData {
  estado_actual?: string;
  nivel_riesgo?: {
    actual?: number;
    cambio_reciente?: {
      de: number;
      a: number;
      fecha: string;
    } | null;
  } | null;
  vitales_recientes?: {
    fecha?: string;
    presion_arterial?: string;
    nivel_azucar?: string;
    hba1c?: string;
  } | null;
  cambio_medicacion?: any | null;
}

export interface EngagementData {
  n_mensajes_total?: number;
  por_direccion?: {
    outbound: number;
    inbound: number;
  };
  por_tipo?: Record<string, number>;
  ultimo_contacto?: string | null;
  mensajes_recientes?: Array<{
    fecha: string;
    direction: 'outbound' | 'inbound' | string;
    tipo?: string | null;
    estado?: string | null;
  }>;
}

export interface StatusData {
  current_status?: string;
  history?: Array<{
    fecha: string;
    estado_inicial?: string;
    estado_final?: string;
    observacion?: string | null;
  }>;
}

export interface VisitsData {
  visits?: Array<{
    fecha: string;
    especialidad: string;
    clase_cita?: string;
    estado?: string;
  }>;
  specialty_summary?: Array<{
    especialidad: string;
    visitas_atendidas: number;
    ultima_fecha: string;
  }>;
}

export interface CostItem {
  mes_emision?: string;
  mes_reporte?: string;
  codigo_diagnostico?: string;
  diagnostico?: string;
  prestador?: string;
  tipo_servicio?: string;
  codigo_cups?: string | null;
  descripcion_servicio?: string;
  cantidad?: number;
  costo?: number;
}

export interface CostData {
  disponible?: boolean;
  costo_total?: number;
  costo_por_tipo_servicio?: Record<string, number>;
  n_items?: number;
  items?: CostItem[];
}

export interface SurveyItem {
  fecha: string;
  recomienda_servicio?: number;
  satisfaccion_medico?: number;
  rating?: number;
  pudo_resolver?: string | null;
  dificultad?: string;
  comentarios?: string;
}

export interface SurveysData {
  n_encuestas?: number;
  encuestas?: SurveyItem[];
}

export interface CompletenessData {
  n_citas?: number;
  n_consultas?: number;
  n_con_epicrisis?: number;
  epicrisis_fill_rate?: number;
  n_actas_medicas?: number;
  n_transiciones_estado?: number;
  primera_consulta?: string | null;
  ultima_consulta?: string | null;
}

export interface PerceptionSurveyData {
  n_cuestionarios?: number;
  cuestionarios?: Array<{
    nombre_cuestionario: string;
    tipo_cuestionario?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    puntaje_total?: number;
    clasificacion_final?: string;
    completado?: boolean;
    respuestas?: Array<{
      pregunta: string;
      respuesta_texto?: string;
      respuesta_numero?: number | null;
      respuesta_fecha?: string | null;
      valor_obtenido?: number;
      opciones_seleccionadas?: string[];
    }>;
  }>;
}

export interface Patient360FullPayload {
  identificacion: string;
  consultas?: SummaryConsultasData | null;
  cambiosClave?: SummaryCambiosClaveData | null;
  perceptionSurvey?: PerceptionSurveyData | null;
  engagement?: EngagementData | null;
  status?: StatusData | null;
  visits?: VisitsData | null;
  cost?: CostData | null;
  surveys?: SurveysData | null;
  completeness?: CompletenessData | null;
  rawErrors?: Record<string, string>;
}
