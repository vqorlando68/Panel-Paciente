import { Patient360FullPayload } from './types360';

export const MOCK_360_FALLBACK: Patient360FullPayload = {
  identificacion: "1006108333",
  consultas: {
    coordinador_asignado: "Angela Valencia Alvares",
    perfil_riesgo_encuesta: null,
    notas_clave: [],
    nota_operativa_reciente: {
      tipo_nota: "OPERATIVA",
      fecha_nota: "2026-05-25T15:22:52+00:00",
      fecha_modificacion: null,
      nota: "La paciente por ahora informa que no quiere citas, llamar a mitad de junio."
    },
    adherencia_historica: {
      n_recomendadas: 5,
      n_atendidas: 8,
      porcentaje: 160
    },
    especialidades_incumplidas: [
      { especialidad: "Medicina Interna", atendidas: 2, no_asistidas_por_paciente: 2, ratio_incumplimiento: 0.5 },
      { especialidad: "Nutrición", atendidas: 2, no_asistidas_por_paciente: 2, ratio_incumplimiento: 0.5 },
      { especialidad: "Psicología", atendidas: 2, no_asistidas_por_paciente: 2, ratio_incumplimiento: 0.5 }
    ],
    ultima_cita_atendida: { fecha: "2026-07-16T14:00:00+00:00", especialidad: "Medicina Interna" },
    proxima_cita: { fecha: "2026-10-06T08:40:00+00:00", especialidad: "Psicología" },
    dias_sin_visita_atendida: 67,
    dias_sin_contacto: 114,
    escalas_clinicas: [],
    perfilamiento: {
      comprende_beneficio: true,
      ha_desertado_previamente: false,
      proxima_cita_confirmada: true,
      cambio_coordinadora_reciente: false
    },
    alertas: [
      { tipo: "sin_contacto_reciente", severidad: "baja", mensaje: "Sin contacto (WhatsApp/SMS/llamada) hace 114 días." },
      { tipo: "incumplimiento_especialidad", severidad: "media", mensaje: "Medicina Interna: el paciente no asistió a 2 de 4 citas (50%)." },
      { tipo: "incumplimiento_especialidad", severidad: "media", mensaje: "Nutrición: el paciente no asistió a 2 de 4 citas (50%)." },
      { tipo: "incumplimiento_especialidad", severidad: "media", mensaje: "Psicología: el paciente no asistió a 2 de 4 citas (50%)." }
    ]
  },
  cambiosClave: {
    estado_actual: "ACTIVO",
    nivel_riesgo: {
      actual: 1,
      cambio_reciente: null
    },
    vitales_recientes: {
      fecha: "2026-08-13T07:28:51+00:00",
      presion_arterial: "128/78 mmHg",
      nivel_azucar: "95 mg/dL",
      hba1c: "5.7%"
    }
  },
  perceptionSurvey: {
    n_cuestionarios: 1,
    cuestionarios: [
      {
        nombre_cuestionario: "Perfil Personal Giris",
        tipo_cuestionario: "PERFILAMIENTO",
        fecha_inicio: "2026-02-10T10:00:00+00:00",
        fecha_fin: "2026-02-10T10:15:00+00:00",
        puntaje_total: 14.0,
        clasificacion_final: "Aceptación Buena",
        completado: true,
        respuestas: [
          { pregunta: "Canal preferido de comunicación", respuesta_texto: "WhatsApp", valor_obtenido: 1 },
          { pregunta: "Disponibilidad para teleconsultas", respuesta_texto: "Tardes", valor_obtenido: 1 }
        ]
      }
    ]
  },
  engagement: {
    n_mensajes_total: 42,
    por_direccion: { outbound: 40, inbound: 2 },
    por_tipo: { whatsapp: 38, sms: 4 },
    ultimo_contacto: "2026-05-30T13:29:34+00:00",
    mensajes_recientes: [
      { fecha: "2026-05-30T13:29:34+00:00", direction: "outbound", tipo: "whatsapp", estado: "delivered" },
      { fecha: "2026-05-28T09:12:10+00:00", direction: "inbound", tipo: "whatsapp", estado: "read" },
      { fecha: "2026-05-20T14:45:00+00:00", direction: "outbound", tipo: "whatsapp", estado: "delivered" }
    ]
  },
  status: {
    current_status: "ACTIVO",
    history: [
      { fecha: "2025-03-11T19:40:00+00:00", estado_inicial: "ACEPTADO", estado_final: "ACTIVO", observacion: "Primera cita de medicina general o medicina interna" },
      { fecha: "2025-02-15T10:00:00+00:00", estado_inicial: "PROSPECTO", estado_final: "ACEPTADO", observacion: "Contacto inicial exitoso" }
    ]
  },
  visits: {
    visits: [
      { fecha: "2026-07-16T14:00:00+00:00", especialidad: "Medicina Interna", clase_cita: "Control", estado: "Atendida" },
      { fecha: "2026-05-10T10:00:00+00:00", especialidad: "Nutrición", clase_cita: "Seguimiento", estado: "Atendida" },
      { fecha: "2026-04-12T11:00:00+00:00", especialidad: "Psicología", clase_cita: "Control", estado: "No Asistió" },
      { fecha: "2025-03-11T19:40:00+00:00", especialidad: "Medicina Interna", clase_cita: "Atención Programada", estado: "Atendida" }
    ],
    specialty_summary: [
      { especialidad: "Medicina Interna", visitas_atendidas: 2, ultima_fecha: "2026-07-16T14:00:00+00:00" },
      { especialidad: "Nutrición", visitas_atendidas: 2, ultima_fecha: "2026-05-10T10:00:00+00:00" },
      { especialidad: "Psicología", visitas_atendidas: 2, ultima_fecha: "2026-04-12T11:00:00+00:00" }
    ]
  },
  cost: {
    disponible: true,
    costo_total: 118539207.0,
    costo_por_tipo_servicio: {
      "Consul. Especialista": 1859800.0,
      "Atención Por Urgencias": 1997658.0,
      "Laboratorio Radiológico": 4873984.0,
      "Honorarios Médicos Hospitalarios": 1245000.0
    },
    n_items: 4,
    items: [
      {
        mes_emision: "2026-06",
        mes_reporte: "2026-06-01",
        codigo_diagnostico: "I10X",
        diagnostico: "Hipertensión Esencial (Primaria)",
        prestador: "Clínica Teker Norte",
        tipo_servicio: "Consul. Especialista",
        codigo_cups: "890201",
        descripcion_servicio: "CONSULTA DE PRIMERA VEZ POR MEDICINA INTERNA",
        cantidad: 1,
        costo: 1859800
      },
      {
        mes_emision: "2026-05",
        mes_reporte: "2026-05-01",
        codigo_diagnostico: "E119",
        diagnostico: "Diabetes Mellitus Tipo 2",
        prestador: "Hospital Metropolitano",
        tipo_servicio: "Atención Por Urgencias",
        codigo_cups: "890701",
        descripcion_servicio: "CONSULTA DE URGENCIAS POR MEDICINA GENERAL",
        cantidad: 1,
        costo: 1997658
      }
    ]
  },
  surveys: {
    n_encuestas: 1,
    encuestas: [
      {
        fecha: "2025-03-14T18:15:35+00:00",
        recomienda_servicio: 9,
        satisfaccion_medico: 5,
        rating: 9,
        pudo_resolver: "Sí",
        dificultad: "Baja",
        comentarios: "Excelente atención y seguimiento oportuno por parte de la coordinadora."
      }
    ]
  },
  completeness: {
    n_citas: 26,
    n_consultas: 26,
    n_con_epicrisis: 8,
    epicrisis_fill_rate: 0.308,
    n_actas_medicas: 5,
    n_transiciones_estado: 7,
    primera_consulta: "2025-03-11T21:14:46+00:00",
    ultima_consulta: "2027-02-12T10:00:00+00:00"
  }
};
