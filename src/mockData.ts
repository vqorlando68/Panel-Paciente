import { Patient } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PAT-001',
    nombre: 'Valeria Restrepo Montoya',
    identificacion: 'CC 52.849.182',
    telefono: '+57 312 458 9012',
    email: 'valeria.restrepo@gmail.com',
    direccion: 'Calle 45 #28-14, Medellín',
    idConvenio: 'SURA-8492',
    convenioNombre: 'EPS Suramericana Cuidate360',
    prioridadInicial: 1,
    fechaProximaRevision: '18/08/2026',
    cohorte: 'ACTIVO',
    estado: 'Activo',
    riesgo: 'Critical',
    etiqueta: '',
    retroalimentacion: 'Satisfecho',
    fase: 'I',
    acta: {
      numero: 142,
      fecha: '16 jul 2026',
      resumen: 'Aprobación de tratamiento anticoagulante orales de nueva generación y remisión prioritaria a Cardiología.',
      integrantes: ['Dr. Fernando Hoyos', 'Dra. Sofía López', 'Dra. María Paz']
    },
    actasHistory: [
      {
        numero: 142,
        fecha: '16 jul 2026',
        resumen: 'Aprobación de tratamiento anticoagulante orales de nueva generación y remisión prioritaria a Cardiología.',
        integrantes: ['Dr. Fernando Hoyos', 'Dra. Sofía López', 'Dra. María Paz']
      },
      {
        numero: 110,
        fecha: '10 may 2026',
        resumen: 'Ajuste de dosis de antihipertensivos y control de función renal.',
        integrantes: ['Dr. Carlos Mendoza', 'Dra. Sofía López']
      },
      {
        numero: 85,
        fecha: '15 mar 2026',
        resumen: 'Evaluación de ingreso al programa de riesgo vascular.',
        integrantes: ['Dr. Fernando Hoyos']
      }
    ],
    coordinador: 'Anyeli Ledezma',
    numeroCarga: 'CARGA-104',
    hasAlarm: true,
    alarmReasons: [
      'Paciente lleva > 3 meses sin visita de Medicina General (Última: 10/01/2026)',
      'Cita de Nutricionista asignada con profesional fuera de cuadro médico'
    ],
    tasas: {
      cancelacionesPct: 22,
      cancelacionesNum: 4,
      inasistenciasPct: 15,
      inasistenciasNum: 3,
      reprogramacionesPct: 18,
      reprogramacionesNum: 3,
      history: [
        { id: 't-1', date: '2026-07-12', specialty: 'Med. Gen.', professional: 'Dr. Carlos Mendoza', status: 'Inasistida' },
        { id: 't-2', date: '2026-06-20', specialty: 'Nutrición', professional: 'Lic. Mariana Gómez', status: 'Cancelada' },
        { id: 't-3', date: '2026-05-10', specialty: 'Med. Gen.', professional: 'Dr. Carlos Mendoza', status: 'Atendida' },
        { id: 't-4', date: '2026-04-15', specialty: 'Cardiología', professional: 'Dr. Roberto Silva', status: 'Reprogramada' },
        { id: 't-5', date: '2026-03-01', specialty: 'Psicología', professional: 'Dra. Claudia Ruiz', status: 'Atendida' },
      ]
    },
    cuadroMedico: [
      { id: 'cm-1', specialty: 'Medicina General', professional: 'Dr. Carlos Mendoza', inNetwork: true, phone: '+57 300 123 4567' },
      { id: 'cm-2', specialty: 'Nutrición', professional: 'Lic. Mariana Gómez', inNetwork: false, phone: '+57 311 987 6543' },
      { id: 'cm-3', specialty: 'Cardiología', professional: 'Dr. Roberto Silva', inNetwork: true, phone: '+57 315 444 5566' },
      { id: 'cm-4', specialty: 'Nefrología', professional: 'Dr. Andrés Parra', inNetwork: true, phone: '+57 318 222 1100' }
    ],
    agenda: [
      { id: 'ag-1', date: '2026-08-05', time: '09:00 AM', specialty: 'Medicina General', professional: 'Dr. Carlos Mendoza', status: 'Programada', type: 'Presencial' },
      { id: 'ag-2', date: '2026-08-15', time: '11:30 AM', specialty: 'Nutrición', professional: 'Lic. Mariana Gómez', status: 'Programada', type: 'Teleconsulta' },
      { id: 'ag-3', date: '2026-09-12', time: '02:00 PM', specialty: 'Nefrología', professional: 'Dr. Andrés Parra', status: 'Programada', type: 'Presencial' },
      { id: 'ag-4', date: '2026-07-10', time: '08:00 AM', specialty: 'Cardiología', professional: 'Dr. Roberto Silva', status: 'Completada', type: 'Presencial' },
    ],
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Carlos Mendoza',
        lastAttentionDate: '10/01/2026 09:00 AM',
        frequency: 'Mensual',
        targetDate: '10/02/2026 09:00 AM',
        isOverdue: true,
        attentionsHistory: [
          { id: 'at-1', dateTime: '10/01/2026 09:00 AM', professional: 'Dr. Carlos Mendoza', status: 'Atendida' },
          { id: 'at-2', dateTime: '10/12/2025 08:30 AM', professional: 'Dr. Carlos Mendoza', status: 'Atendida' },
          { id: 'at-3', dateTime: '10/11/2025 10:00 AM', professional: 'Dr. Carlos Mendoza', status: 'Atendida' },
          { id: 'at-4', dateTime: '10/10/2025 09:00 AM', professional: 'Dr. Carlos Mendoza', status: 'Atendida' }
        ]
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Mariana Gómez',
        lastAttentionDate: '15/06/2026 10:30 AM',
        frequency: 'Bimensual',
        targetDate: '15/08/2026 10:30 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-nut-1', dateTime: '15/06/2026 10:30 AM', professional: 'Lic. Mariana Gómez', status: 'Atendida' }
        ]
      },
      psicol: {
        specialistTitle: 'PSICOLOGIA',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '20/06/2026 02:00 PM',
        frequency: 'Quincenal',
        targetDate: '04/08/2026 02:00 PM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-psi-1', dateTime: '20/06/2026 02:00 PM', professional: 'Dra. Claudia Ruiz', status: 'Atendida' }
        ]
      },
      esp_1: {
        specialistTitle: 'ESP. 1',
        professionalName: 'Dr. Roberto Silva',
        lastAttentionDate: '01/07/2026 11:00 AM',
        frequency: 'Trimestral',
        targetDate: '01/10/2026 11:00 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-car-1', dateTime: '01/07/2026 11:00 AM', professional: 'Dr. Roberto Silva', status: 'Atendida' }
        ]
      },
      esp_2: {
        specialistTitle: 'ESP. 2',
        professionalName: 'Dr. Andrés Parra',
        lastAttentionDate: '12/03/2026 03:00 PM',
        frequency: 'Semestral',
        targetDate: '12/09/2026 03:00 PM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-nef-1', dateTime: '12/03/2026 03:00 PM', professional: 'Dr. Andrés Parra', status: 'Atendida' }
        ]
      },
      esp_3: {
        specialistTitle: 'ESP. 3',
        professionalName: 'Dra. Beatriz Franco',
        lastAttentionDate: '14/06/2026 08:00 AM',
        frequency: 'Trimestral',
        targetDate: '15/09/2026 08:00 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-end-1', dateTime: '14/06/2026 08:00 AM', professional: 'Dra. Beatriz Franco', status: 'Atendida' }
        ]
      },
      esp_4: {
        specialistTitle: 'ESP. 4',
        professionalName: 'Dr. Gabriel Restrepo',
        lastAttentionDate: '20/05/2026 02:00 PM',
        frequency: 'Bimensual',
        targetDate: '20/07/2026 02:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
    },
    operationalNotes: [
      {
        id: 'op-101',
        author: 'Anyeli Ledezma',
        role: 'Coordinadora SIAU',
        timestamp: '2026-07-22 09:30',
        content: 'Se gestionó orden de transporte asistido para cita presencial con Nefrología.'
      }
    ],
    clinicalNotes: [
      {
        id: 'cl-101',
        author: 'Dr. Fernando Hoyos',
        role: 'Comité Médico',
        timestamp: '2026-07-20 11:00',
        content: 'Paciente refiere leve mejoría en disnea de esfuerzo. Presión arterial ajustada a 125/82 mmHg.'
      }
    ]
  },
  {
    id: 'PAT-002',
    nombre: 'Santiago Gómez Echeverri',
    identificacion: 'CC 80.192.410',
    telefono: '+57 300 671 2234',
    email: 'sgomez.echeverri@hotmail.com',
    direccion: 'Carrera 70 #10-45, Bogotá',
    idConvenio: 'SANITAS-201',
    convenioNombre: 'CMP Caribe',
    prioridadInicial: 3,
    fechaProximaRevision: '22/08/2026',
    cohorte: 'ACEPTADO',
    estado: 'Aceptado',
    riesgo: 'High',
    etiqueta: 'Inconforme',
    retroalimentacion: 'Inconforme',
    fase: 'D',
    acta: {
      numero: 138,
      fecha: '28 jun 2026',
      resumen: 'Inclusión en programa de glucometrías continuas y monitoreo ambulatorio.',
      integrantes: ['Dr. Fernando Hoyos', 'Dra. Beatriz Franco']
    },
    actasHistory: [
      {
        numero: 138,
        fecha: '28 jun 2026',
        resumen: 'Inclusión en programa de glucometrías continuas y monitoreo ambulatorio.',
        integrantes: ['Dr. Fernando Hoyos', 'Dra. Beatriz Franco']
      },
      {
        numero: 99,
        fecha: '12 abr 2026',
        resumen: 'Revisión por Inconformidad manifestada en atención domiciliaria.',
        integrantes: ['Dra. Sofía López']
      }
    ],
    coordinador: 'Katherine Mora',
    numeroCarga: 'CARGA-104',
    hasAlarm: false,
    alarmReasons: [],
    tasas: {
      cancelacionesPct: 5,
      cancelacionesNum: 1,
      inasistenciasPct: 3,
      inasistenciasNum: 1,
      reprogramacionesPct: 7,
      reprogramacionesNum: 2,
      history: [
        { id: 't-21', date: '2026-07-05', specialty: 'Med. Gen.', professional: 'Dr. Jorge Castro', status: 'Atendida' },
        { id: 't-22', date: '2026-06-10', specialty: 'Nutrición', professional: 'Lic. Paola Tobón', status: 'Atendida' }
      ]
    },
    cuadroMedico: [
      { id: 'cm-21', specialty: 'Medicina General', professional: 'Dr. Jorge Castro', inNetwork: true },
      { id: 'cm-22', specialty: 'Nutrición', professional: 'Lic. Paola Tobón', inNetwork: true },
      { id: 'cm-23', specialty: 'Endocrinología', professional: 'Dra. Beatriz Franco', inNetwork: true }
    ],
    agenda: [
      { id: 'ag-21', date: '2026-08-05', time: '10:00 AM', specialty: 'Medicina General', professional: 'Dr. Jorge Castro', status: 'Programada', type: 'Presencial' },
    ],
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Jorge Castro',
        lastAttentionDate: '05/07/2026 09:00 AM',
        frequency: 'Mensual',
        targetDate: '05/08/2026 09:00 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-201', dateTime: '05/07/2026 09:00 AM', professional: 'Dr. Jorge Castro', status: 'Atendida' }
        ]
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Paola Tobón',
        lastAttentionDate: '10/06/2026 10:00 AM',
        frequency: 'Trimestral',
        targetDate: '10/09/2026 10:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      psicol: {
        specialistTitle: 'PSICOLOGIA',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Mensual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_1: {
        specialistTitle: 'ESP. 1',
        professionalName: 'Dra. Beatriz Franco',
        lastAttentionDate: '15/05/2026 11:00 AM',
        frequency: 'Trimestral',
        targetDate: '15/08/2026 11:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_2: {
        specialistTitle: 'ESP. 2',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Semestral',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_3: {
        specialistTitle: 'ESP. 3',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Anual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_4: {
        specialistTitle: 'ESP. 4',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Anual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
    },
    operationalNotes: [],
    clinicalNotes: []
  },
  {
    id: 'PAT-003',
    nombre: 'Camila Andrea Rojas Ruiz',
    identificacion: 'CC 1.092.384.112',
    telefono: '+57 315 889 0011',
    email: 'camila.rojas@gmail.com',
    direccion: 'Calle 12 #4-50, Cali',
    idConvenio: 'CALI-552',
    convenioNombre: 'CMP Salud Mental Cali',
    prioridadInicial: 5,
    fechaProximaRevision: '10/09/2026',
    cohorte: 'RECHAZO EL SERVICIO',
    estado: 'Rechazado',
    riesgo: 'Medium',
    etiqueta: '',
    retroalimentacion: '',
    fase: 'E',
    hasRehuso: true,
    rehusoInfo: { professional: 'Dr. Roberto Silva', specialty: 'Cardiología' },
    acta: {
      numero: 121,
      fecha: '15 may 2026',
      resumen: 'Paciente rechaza atención por Cardiología argumentando que prefiere su médico particular.',
      integrantes: ['Dr. Fernando Hoyos', 'Angela Valencia']
    },
    actasHistory: [
      {
        numero: 121,
        fecha: '15 may 2026',
        resumen: 'Paciente rechaza atención por Cardiología argumentando que prefiere su médico particular.',
        integrantes: ['Dr. Fernando Hoyos', 'Angela Valencia']
      }
    ],
    coordinador: 'Angela Valencia',
    numeroCarga: 'CARGA-105',
    hasAlarm: true,
    alarmReasons: ['Registra Rehúso en atención especializada (Cardiología)'],
    tasas: {
      cancelacionesPct: 40,
      cancelacionesNum: 4,
      inasistenciasPct: 20,
      inasistenciasNum: 2,
      reprogramacionesPct: 10,
      reprogramacionesNum: 1,
      history: []
    },
    cuadroMedico: [],
    agenda: [],
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Carlos Mendoza',
        lastAttentionDate: '01/06/2026 08:00 AM',
        frequency: 'Mensual',
        targetDate: '01/07/2026 08:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Bimensual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      psicol: {
        specialistTitle: 'PSICOLOGIA',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '10/06/2026 03:00 PM',
        frequency: 'Quincenal',
        targetDate: '25/06/2026 03:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_1: {
        specialistTitle: 'ESP. 1',
        professionalName: 'Dr. Roberto Silva',
        lastAttentionDate: '12/04/2026 10:00 AM',
        frequency: 'Trimestral',
        targetDate: '12/07/2026 10:00 AM',
        isOverdue: false,
        hasRehuso: true,
        attentionsHistory: []
      },
      esp_2: {
        specialistTitle: 'ESP. 2',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Semestral',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_3: {
        specialistTitle: 'ESP. 3',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Anual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_4: {
        specialistTitle: 'ESP. 4',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Anual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
    },
    operationalNotes: [
      {
        id: 'op-301',
        author: 'Angela Valencia',
        role: 'Coordinadora SIAU',
        timestamp: '2026-05-15 14:20',
        content: 'Marcar Rehúso: Paciente indica que no desea consulta con Dr. Roberto Silva (Cardiología).'
      }
    ],
    clinicalNotes: []
  },
  {
    id: 'PAT-004',
    nombre: 'Hernán Darío Morales Paz',
    identificacion: 'CC 19.382.910',
    telefono: '+57 310 998 7766',
    email: 'hernan.morales@gmail.com',
    direccion: 'Avenida 6N #22-18, Barranquilla',
    idConvenio: 'CARIBE-90',
    convenioNombre: 'CMP Vive al 100 Caribe',
    prioridadInicial: 2,
    fechaProximaRevision: '05/08/2026',
    cohorte: 'PROSPECTO',
    estado: 'Activo',
    riesgo: 'Low',
    etiqueta: '',
    retroalimentacion: '',
    fase: 'M/E',
    acta: {
      numero: 0,
      fecha: '',
      resumen: ''
    },
    actasHistory: [],
    coordinador: 'Anyeli Ledezma',
    numeroCarga: 'CARGA-106',
    hasAlarm: false,
    alarmReasons: [],
    tasas: {
      cancelacionesPct: 0,
      cancelacionesNum: 0,
      inasistenciasPct: 0,
      inasistenciasNum: 0,
      reprogramacionesPct: 0,
      reprogramacionesNum: 0,
      history: []
    },
    cuadroMedico: [
      { id: 'cm-41', specialty: 'Medicina General', professional: 'Dr. Carlos Mendoza', inNetwork: true }
    ],
    agenda: [],
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Carlos Mendoza',
        lastAttentionDate: '10/07/2026 09:00 AM',
        frequency: 'Mensual',
        targetDate: '10/08/2026 09:00 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-401', dateTime: '10/07/2026 09:00 AM', professional: 'Dr. Carlos Mendoza', status: 'Atendida' }
        ]
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Mariana Gómez',
        lastAttentionDate: '12/07/2026 11:00 AM',
        frequency: 'Trimestral',
        targetDate: '12/10/2026 11:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      psicol: {
        specialistTitle: 'PSICOLOGIA',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Mensual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_1: {
        specialistTitle: 'ESP. 1',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Anual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_2: {
        specialistTitle: 'ESP. 2',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Anual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_3: {
        specialistTitle: 'ESP. 3',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Anual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_4: {
        specialistTitle: 'ESP. 4',
        professionalName: 'Sin asignar',
        lastAttentionDate: 'No registra',
        frequency: 'Anual',
        targetDate: 'Pendiente',
        isOverdue: false,
        attentionsHistory: []
      }
    },
    operationalNotes: [],
    clinicalNotes: []
  }
];
