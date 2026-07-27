import { Patient } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PAT-001',
    nombre: 'Valeria Restrepo Montoya',
    identificacion: '10482',
    telefono: '+57 312 458 9012',
    email: 'valeria.restrepo@gmail.com',
    direccion: 'Calle 45 #28-14, Medellín',
    idConvenio: 'SURA-8492',
    convenioNombre: 'EPS Suramericana Cuidate360',
    cohorte: 'ACTIVO',
    estado: 'Activo',
    riesgo: 'Critical',
    etiqueta: 'Inconforme',
    retroalimentacion: 'Inconforme',
    fase: 'I',
    acta: {
      numero: 142,
      fecha: '2026-07-10',
      resumen: 'Aprobación de tratamiento anticoagulante orales de nueva generación y remisión prioritaria a Cardiología.',
      integrantes: ['Dr. Fernando Hoyos', 'Dra. Sofía López', 'Dra. María Paz']
    },
    coordinador: 'Anyeli Ledezma',
    numeroCarga: 'CARGA-104',
    hasAlarm: true,
    alarmReasons: [
      'Paciente lleva > 3 meses sin visita de Medicina General (Última: 10/05/2026)',
      'Cita de Nutricionista asignada con profesional fuera de cuadro médico (Lic. Mariana Gómez)'
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
        lastAttentionDate: '10/05/2026 09:00 AM',
        frequency: 'Cada 30 días',
        targetDate: '10/06/2026 09:00 AM',
        isOverdue: true,
        attentionsHistory: [
          { id: 'at-1', dateTime: '10/05/2026 09:00 AM', professional: 'Dr. Carlos Mendoza', status: 'Atendida' },
          { id: 'at-2', dateTime: '10/04/2026 08:30 AM', professional: 'Dr. Carlos Mendoza', status: 'Atendida' },
          { id: 'at-3', dateTime: '10/03/2026 10:00 AM', professional: 'Dr. Carlos Mendoza', status: 'Atendida' }
        ]
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Mariana Gómez',
        lastAttentionDate: '15/06/2026 10:30 AM',
        frequency: 'Cada 60 días',
        targetDate: '15/08/2026 10:30 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-nut-1', dateTime: '15/06/2026 10:30 AM', professional: 'Lic. Mariana Gómez', status: 'Atendida' }
        ]
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '20/06/2026 02:00 PM',
        frequency: 'Cada 45 días',
        targetDate: '04/08/2026 02:00 PM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-psi-1', dateTime: '20/06/2026 02:00 PM', professional: 'Dra. Claudia Ruiz', status: 'Atendida' }
        ]
      },
      esp_1: {
        specialistTitle: 'Cardiología',
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
        specialistTitle: 'Nefrología',
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
        specialistTitle: 'Endocrinología',
        professionalName: 'Dra. Beatriz Franco',
        lastAttentionDate: '14/06/2026 08:00 AM',
        frequency: 'Cada 90 días',
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
        frequency: 'Cada 60 días',
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
    identificacion: '80192',
    telefono: '+57 300 671 2234',
    email: 'sgomez.echeverri@hotmail.com',
    direccion: 'Carrera 70 #10-45, Bogotá',
    idConvenio: 'SANITAS-201',
    convenioNombre: 'CMP Caribe',
    cohorte: 'ACEPTADO',
    estado: 'Aceptado',
    riesgo: 'High',
    etiqueta: 'Activo 1',
    retroalimentacion: '',
    fase: 'D',
    acta: {
      numero: 138,
      fecha: '2026-06-28',
      resumen: 'Inclusión en programa de glucometrías continuas y monitoreo ambulatorio.',
      integrantes: ['Dr. Fernando Hoyos', 'Dra. Beatriz Franco']
    },
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
      { id: 'ag-22', date: '2026-08-26', time: '03:00 PM', specialty: 'Endocrinología', professional: 'Dra. Beatriz Franco', status: 'Programada', type: 'Teleconsulta' }
    ],
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Jorge Castro',
        lastAttentionDate: '05/07/2026 10:00 AM',
        frequency: 'Cada 30 días',
        targetDate: '05/08/2026 10:00 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-201', dateTime: '05/07/2026 10:00 AM', professional: 'Dr. Jorge Castro', status: 'Atendida' }
        ]
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Paola Tobón',
        lastAttentionDate: '10/06/2026 11:00 AM',
        frequency: 'Cada 60 días',
        targetDate: '10/08/2026 11:00 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-202', dateTime: '10/06/2026 11:00 AM', professional: 'Lic. Paola Tobón', status: 'Atendida' }
        ]
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Lic. Mateo Ríos',
        lastAttentionDate: '20/06/2026 09:00 AM',
        frequency: 'Cada 90 días',
        targetDate: '20/09/2026 09:00 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-203', dateTime: '20/06/2026 09:00 AM', professional: 'Lic. Mateo Ríos', status: 'Atendida' }
        ]
      },
      esp_1: {
        specialistTitle: 'Endocrinología',
        professionalName: 'Dra. Beatriz Franco',
        lastAttentionDate: '12/07/2026 02:00 PM',
        frequency: 'Cada 45 días',
        targetDate: '26/08/2026 02:00 PM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-204', dateTime: '12/07/2026 02:00 PM', professional: 'Dra. Beatriz Franco', status: 'Atendida' }
        ]
      },
      esp_2: {
        specialistTitle: 'Oftalmología',
        professionalName: 'Dr. Ricardo Velez',
        lastAttentionDate: '15/01/2026 08:00 AM',
        frequency: 'Anual',
        targetDate: '15/01/2027 08:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_3: {
        specialistTitle: 'Podología',
        professionalName: 'Dra. Luisa Fernanda',
        lastAttentionDate: '01/05/2026 10:00 AM',
        frequency: 'Cada 90 días',
        targetDate: '01/08/2026 10:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_4: {
        specialistTitle: 'ESP. 4',
        professionalName: 'Dra. Isabel Cristina',
        lastAttentionDate: '10/06/2026 09:00 AM',
        frequency: 'Cada 90 días',
        targetDate: '10/09/2026 09:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
    },
    operationalNotes: [],
    clinicalNotes: []
  },
  {
    id: 'PAT-003',
    nombre: 'Camila Esperanza Torres',
    identificacion: '52849',
    telefono: '+57 315 892 0192',
    email: 'ctorres.esperanza@yahoo.es',
    direccion: 'Transversal 15 #102-18, Cali',
    idConvenio: 'NUEVA_EPS-992',
    convenioNombre: 'CMP Salud Mental Cali',
    cohorte: 'INTERESADO',
    estado: 'Activo',
    riesgo: 'Critical',
    etiqueta: 'Activo 2',
    retroalimentacion: '',
    fase: 'E',
    acta: {
      numero: 145,
      fecha: '2026-07-15',
      resumen: 'Valoración de urgencia por síntomas de preeclampsia leve en semana 32.',
      integrantes: ['Dra. Sofía López', 'Dr. Felipe Morales', 'Dra. Paula Agudelo']
    },
    coordinador: 'Angela Valencia',
    numeroCarga: 'CARGA-108',
    hasAlarm: true,
    alarmReasons: [
      'Atención de Nutricionista vencida desde el 02/07/2026'
    ],
    tasas: {
      cancelacionesPct: 15,
      cancelacionesNum: 3,
      inasistenciasPct: 8,
      inasistenciasNum: 2,
      reprogramacionesPct: 12,
      reprogramacionesNum: 2,
      history: [
        { id: 't-31', date: '2026-07-18', specialty: 'Med. Gen.', professional: 'Dr. Carlos Mendoza', status: 'Atendida' },
        { id: 't-32', date: '2026-06-02', specialty: 'Nutrición', professional: 'Lic. Mariana Gómez', status: 'Atendida' }
      ]
    },
    cuadroMedico: [
      { id: 'cm-31', specialty: 'Medicina General', professional: 'Dr. Carlos Mendoza', inNetwork: true },
      { id: 'cm-32', specialty: 'Nutrición', professional: 'Lic. Mariana Gómez', inNetwork: true },
      { id: 'cm-33', specialty: 'Ginecobstetricia', professional: 'Dra. Paula Agudelo', inNetwork: true }
    ],
    agenda: [
      { id: 'ag-31', date: '2026-08-01', time: '08:00 AM', specialty: 'Medicina General', professional: 'Dr. Carlos Mendoza', status: 'Programada', type: 'Presencial' }
    ],
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Carlos Mendoza',
        lastAttentionDate: '18/07/2026 08:00 AM',
        frequency: 'Quincenal',
        targetDate: '01/08/2026 08:00 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-301', dateTime: '18/07/2026 08:00 AM', professional: 'Dr. Carlos Mendoza', status: 'Atendida' }
        ]
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Mariana Gómez',
        lastAttentionDate: '02/06/2026 09:00 AM',
        frequency: 'Cada 30 días',
        targetDate: '02/07/2026 09:00 AM',
        isOverdue: true,
        attentionsHistory: [
          { id: 'at-302', dateTime: '02/06/2026 09:00 AM', professional: 'Lic. Mariana Gómez', status: 'Atendida' }
        ]
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '02/05/2026 10:00 AM',
        frequency: 'Cada 30 días',
        targetDate: '02/06/2026 10:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_1: {
        specialistTitle: 'Ginecobstetricia',
        professionalName: 'Dra. Paula Agudelo',
        lastAttentionDate: '15/07/2026 03:00 PM',
        frequency: 'Semanal',
        targetDate: '22/07/2026 03:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_2: {
        specialistTitle: 'Perinatología',
        professionalName: 'Dr. Hernán Barrientos',
        lastAttentionDate: '10/07/2026 11:00 AM',
        frequency: 'Quincenal',
        targetDate: '25/07/2026 11:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_3: {
        specialistTitle: 'Anestesiología',
        professionalName: 'Dr. Samuel Varela',
        lastAttentionDate: '01/06/2026 02:00 PM',
        frequency: 'Pre-quirúrgico',
        targetDate: '15/08/2026 02:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_4: {
        specialistTitle: 'ESP. 4',
        professionalName: 'Dr. Alejandro Marín',
        lastAttentionDate: '15/05/2026 11:00 AM',
        frequency: 'Cada 60 días',
        targetDate: '15/07/2026 11:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
    },
    operationalNotes: [],
    clinicalNotes: []
  },
  {
    id: 'PAT-004',
    nombre: 'Jorge Enrique Benítez',
    identificacion: '19482',
    telefono: '+57 320 901 8832',
    email: 'jorge.benitez@outlook.com',
    direccion: 'Avenida 19 #134-22, Bucaramanga',
    idConvenio: 'SURA-8492',
    convenioNombre: 'CMP Vive al 100 Caribe',
    cohorte: 'ESTRATIFICADO',
    estado: 'Activo',
    riesgo: 'Medium',
    etiqueta: 'Activo 3',
    retroalimentacion: '',
    fase: 'M/E',
    acta: {
      numero: 120,
      fecha: '2026-05-10',
      resumen: 'Fin de ciclos de quimioterapia adjuvante. Pasa a fase de vigilancia clínica.',
      integrantes: ['Dr. Fernando Hoyos', 'Dr. Jaime Ospina']
    },
    coordinador: 'Anyeli Ledezma',
    numeroCarga: 'CARGA-104',
    hasAlarm: false,
    alarmReasons: [],
    tasas: {
      cancelacionesPct: 8,
      cancelacionesNum: 1,
      inasistenciasPct: 4,
      inasistenciasNum: 1,
      reprogramacionesPct: 6,
      reprogramacionesNum: 1,
      history: [
        { id: 't-41', date: '2026-06-25', specialty: 'Med. Gen.', professional: 'Dra. Karen Cepeda', status: 'Atendida' }
      ]
    },
    cuadroMedico: [
      { id: 'cm-41', specialty: 'Medicina General', professional: 'Dra. Karen Cepeda', inNetwork: true },
      { id: 'cm-42', specialty: 'Oncología', professional: 'Dr. Jaime Ospina', inNetwork: true }
    ],
    agenda: [
      { id: 'ag-41', date: '2026-08-10', time: '10:00 AM', specialty: 'Oncología', professional: 'Dr. Jaime Ospina', status: 'Programada', type: 'Presencial' }
    ],
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dra. Karen Cepeda',
        lastAttentionDate: '25/06/2026 09:00 AM',
        frequency: 'Cada 30 días',
        targetDate: '25/07/2026 09:00 AM',
        isOverdue: false,
        attentionsHistory: [
          { id: 'at-401', dateTime: '25/06/2026 09:00 AM', professional: 'Dra. Karen Cepeda', status: 'Atendida' }
        ]
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Esteban Marín',
        lastAttentionDate: '20/06/2026 11:00 AM',
        frequency: 'Cada 45 días',
        targetDate: '04/08/2026 11:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '15/06/2026 03:00 PM',
        frequency: 'Cada 60 días',
        targetDate: '15/08/2026 03:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_1: {
        specialistTitle: 'Oncología',
        professionalName: 'Dr. Jaime Ospina',
        lastAttentionDate: '10/05/2026 10:00 AM',
        frequency: 'Trimestral',
        targetDate: '10/08/2026 10:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_2: {
        specialistTitle: 'Gastroenterología',
        professionalName: 'Dra. Patricia Serna',
        lastAttentionDate: '18/04/2026 02:00 PM',
        frequency: 'Semestral',
        targetDate: '18/10/2026 02:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_3: {
        specialistTitle: 'Cirugía General',
        professionalName: 'Dr. Mario Henao',
        lastAttentionDate: '01/03/2026 09:00 AM',
        frequency: 'Semestral',
        targetDate: '01/09/2026 09:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_4: {
        specialistTitle: 'ESP. 4',
        professionalName: 'Dr. Esteban Jaramillo',
        lastAttentionDate: '01/06/2026 10:00 AM',
        frequency: 'Cada 90 días',
        targetDate: '01/09/2026 10:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
    },
    operationalNotes: [],
    clinicalNotes: []
  },
  {
    id: 'PAT-005',
    nombre: 'Elena María Villamizar',
    identificacion: '32901',
    telefono: '+57 311 234 5678',
    email: 'elena.villamizar@gmail.com',
    direccion: 'Calle 100 #15-30, Barranquilla',
    idConvenio: 'COMPENSAR-502',
    convenioNombre: 'EPS Suramericana Cuidate360',
    cohorte: 'PROSPECTO',
    estado: 'Rechazado',
    riesgo: 'Low',
    etiqueta: 'Inconforme',
    retroalimentacion: 'Inconforme',
    fase: 'I',
    acta: {
      numero: 112,
      fecha: '2026-04-05',
      resumen: 'Rechazo por inasistencia reiterada a controles dialíticos y cambio de domicilio fuera del área de cobertura.',
      integrantes: ['Dra. Sofía López', 'Dr. Andrés Parra']
    },
    coordinador: 'Katherine Mora',
    numeroCarga: 'CARGA-102',
    hasAlarm: true,
    alarmReasons: [
      'Atención de Psicología vencida desde mayo 2026'
    ],
    tasas: {
      cancelacionesPct: 18,
      cancelacionesNum: 4,
      inasistenciasPct: 12,
      inasistenciasNum: 3,
      reprogramacionesPct: 10,
      reprogramacionesNum: 2,
      history: [
        { id: 't-51', date: '2026-06-10', specialty: 'Med. Gen.', professional: 'Dr. Jorge Castro', status: 'Atendida' }
      ]
    },
    cuadroMedico: [
      { id: 'cm-51', specialty: 'Medicina General', professional: 'Dr. Jorge Castro', inNetwork: true },
      { id: 'cm-52', specialty: 'Nefrología', professional: 'Dr. Andrés Parra', inNetwork: true }
    ],
    agenda: [],
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Jorge Castro',
        lastAttentionDate: '10/06/2026 09:00 AM',
        frequency: 'Cada 30 días',
        targetDate: '10/07/2026 09:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Paola Tobón',
        lastAttentionDate: '15/04/2026 10:00 AM',
        frequency: 'Cada 30 días',
        targetDate: '15/05/2026 10:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Lic. Mateo Ríos',
        lastAttentionDate: '20/05/2026 02:00 PM',
        frequency: 'Cada 90 días',
        targetDate: '20/08/2026 02:00 PM',
        isOverdue: true,
        attentionsHistory: []
      },
      esp_1: {
        specialistTitle: 'Nefrología',
        professionalName: 'Dr. Andrés Parra',
        lastAttentionDate: '01/06/2026 11:00 AM',
        frequency: 'Mensual',
        targetDate: '01/07/2026 11:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_2: {
        specialistTitle: 'Vascular',
        professionalName: 'Dr. Thomas White',
        lastAttentionDate: '05/02/2026 08:00 AM',
        frequency: 'Semestral',
        targetDate: '05/08/2026 08:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_3: {
        specialistTitle: 'Trabajo Social',
        professionalName: 'Lic. Diana Cardona',
        lastAttentionDate: '01/05/2026 03:00 PM',
        frequency: 'Cada 60 días',
        targetDate: '01/07/2026 03:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_4: {
        specialistTitle: 'ESP. 4',
        professionalName: 'Dra. Mónica Silva',
        lastAttentionDate: '05/04/2026 08:00 AM',
        frequency: 'Cada 90 días',
        targetDate: '05/07/2026 08:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
    },
    operationalNotes: [],
    clinicalNotes: []
  },
  {
    id: 'PAT-006',
    nombre: 'Gonzalo Andrés Salamanca',
    identificacion: '79482',
    telefono: '+57 318 776 5432',
    email: 'gonzalo.salamanca@gmail.com',
    direccion: 'Carrera 43A #1S-150, Envigado',
    idConvenio: 'SURA-8492',
    convenioNombre: 'CMP Caribe',
    cohorte: 'VISITADO ESPECIALISTA',
    estado: 'Activo',
    riesgo: 'High',
    etiqueta: 'Activo 1',
    retroalimentacion: '',
    fase: 'I',
    acta: {
      numero: 140,
      fecha: '2026-07-02',
      resumen: 'Suministro de concentrador de oxígeno portátil y seguimiento por Neumología.',
      integrantes: ['Dra. Sofía López', 'Dr. Samuel Varela']
    },
    coordinador: 'Angela Valencia',
    numeroCarga: 'CARGA-108',
    hasAlarm: false,
    alarmReasons: [],
    tasas: {
      cancelacionesPct: 4,
      cancelacionesNum: 1,
      inasistenciasPct: 2,
      inasistenciasNum: 0,
      reprogramacionesPct: 5,
      reprogramacionesNum: 1,
      history: [
        { id: 't-61', date: '2026-07-08', specialty: 'Med. Gen.', professional: 'Dr. Carlos Mendoza', status: 'Atendida' }
      ]
    },
    cuadroMedico: [
      { id: 'cm-61', specialty: 'Medicina General', professional: 'Dr. Carlos Mendoza', inNetwork: true },
      { id: 'cm-62', specialty: 'Neumología', professional: 'Dr. Hernando Betancur', inNetwork: true }
    ],
    agenda: [
      { id: 'ag-61', date: '2026-08-08', time: '09:00 AM', specialty: 'Medicina General', professional: 'Dr. Carlos Mendoza', status: 'Programada', type: 'Presencial' }
    ],
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Carlos Mendoza',
        lastAttentionDate: '08/07/2026 09:00 AM',
        frequency: 'Cada 30 días',
        targetDate: '08/08/2026 09:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Mariana Gómez',
        lastAttentionDate: '01/06/2026 10:00 AM',
        frequency: 'Cada 60 días',
        targetDate: '01/08/2026 10:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '10/06/2026 02:00 PM',
        frequency: 'Cada 60 días',
        targetDate: '10/08/2026 02:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_1: {
        specialistTitle: 'Neumología',
        professionalName: 'Dr. Hernando Betancur',
        lastAttentionDate: '02/07/2026 11:00 AM',
        frequency: 'Trimestral',
        targetDate: '02/10/2026 11:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_2: {
        specialistTitle: 'Fisioterapia Resp.',
        professionalName: 'Ft. Camilo Cárdenas',
        lastAttentionDate: '18/07/2026 03:00 PM',
        frequency: 'Semanal',
        targetDate: '25/07/2026 03:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_3: {
        specialistTitle: 'Cardiología',
        professionalName: 'Dr. Roberto Silva',
        lastAttentionDate: '10/04/2026 09:00 AM',
        frequency: 'Semestral',
        targetDate: '10/10/2026 09:00 AM',
        isOverdue: false,
        attentionsHistory: []
      },
      esp_4: {
        specialistTitle: 'ESP. 4',
        professionalName: 'Dr. Fernando Botero',
        lastAttentionDate: '12/05/2026 03:00 PM',
        frequency: 'Cada 60 días',
        targetDate: '12/07/2026 03:00 PM',
        isOverdue: false,
        attentionsHistory: []
      },
    },
    operationalNotes: [],
    clinicalNotes: []
  }
];

