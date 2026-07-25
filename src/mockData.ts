import { Patient } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PAT-001',
    nombre: 'Valeria Restrepo Montoya',
    identificacion: 'CC 1.020.482.910',
    telefono: '+57 312 458 9012',
    email: 'valeria.restrepo@gmail.com',
    direccion: 'Calle 45 #28-14, Medellín',
    idConvenio: 'SURA-8492',
    cohorte: 'Riesgo Cardiovascular',
    estado: 'Activo',
    riesgo: 'Critical',
    etiqueta: 'Prioritario',
    fase: 'I',
    acta: {
      numero: 142,
      fecha: '2026-07-10',
      resumen: 'Aprobación de tratamiento anticoagulante orales de nueva generación y remisión prioritaria a Cardiología.',
      integrantes: ['Dr. Fernando Hoyos', 'Dra. Sofía López', 'Dra. María Paz']
    },
    coordinador: 'Dra. Sofía López',
    numeroCarga: 'CARGA-104',
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Carlos Mendoza',
        lastAttentionDate: '2026-05-10',
        frequency: 'Cada 30 días',
        targetDate: '2026-06-10',
        isOverdue: true,
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Mariana Gómez',
        lastAttentionDate: '2026-06-15',
        frequency: 'Cada 60 días',
        targetDate: '2026-08-15',
        isOverdue: false,
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '2026-06-20',
        frequency: 'Cada 45 días',
        targetDate: '2026-08-04',
        isOverdue: false,
      },
      esp_1: {
        specialistTitle: 'Cardiología',
        professionalName: 'Dr. Roberto Silva',
        lastAttentionDate: '2026-07-01',
        frequency: 'Trimestral',
        targetDate: '2026-10-01',
        isOverdue: false,
      },
      esp_2: {
        specialistTitle: 'Nefrología',
        professionalName: 'Dr. Andrés Parra',
        lastAttentionDate: '2026-03-12',
        frequency: 'Semestral',
        targetDate: '2026-09-12',
        isOverdue: false,
      },
      esp_3: {
        specialistTitle: 'Endocrinología',
        professionalName: 'Dra. Beatriz Franco',
        lastAttentionDate: '2026-06-14',
        frequency: 'Cada 90 días',
        targetDate: '2026-09-15',
        isOverdue: false,
      },
    },
    operationalNotes: [
      {
        id: 'op-101',
        author: 'Dra. Sofía López',
        role: 'Coordinadora SIAU',
        timestamp: '2026-07-22 09:30',
        content: 'Se gestionó orden de transporte asistido para cita presencial con Nefrología.'
      },
      {
        id: 'op-102',
        author: 'Carlos Ruiz',
        role: 'Auxiliar Operativo',
        timestamp: '2026-07-18 14:15',
        content: 'Llamada de confirmación efectuada con el familiar responsable. Asistencia confirmada.'
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
    identificacion: 'CC 80.192.831',
    telefono: '+57 300 671 2234',
    email: 'sgomez.echeverri@hotmail.com',
    direccion: 'Carrera 70 #10-45, Bogotá',
    idConvenio: 'SANITAS-201',
    cohorte: 'Diabetes Mellitus II',
    estado: 'Aceptado',
    riesgo: 'High',
    etiqueta: 'Teleconsulta',
    fase: 'D',
    acta: {
      numero: 138,
      fecha: '2026-06-28',
      resumen: 'Inclusión en programa de glucometrías continuas y monitoreo ambulatorio.',
      integrantes: ['Dr. Fernando Hoyos', 'Dra. Beatriz Franco']
    },
    coordinador: 'Lic. Carlos Ruiz',
    numeroCarga: 'CARGA-104',
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Jorge Castro',
        lastAttentionDate: '2026-07-05',
        frequency: 'Cada 30 días',
        targetDate: '2026-08-05',
        isOverdue: false,
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Paola Tobón',
        lastAttentionDate: '2026-06-10',
        frequency: 'Cada 60 días',
        targetDate: '2026-08-10',
        isOverdue: false,
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Lic. Mateo Ríos',
        lastAttentionDate: '2026-06-20',
        frequency: 'Cada 90 días',
        targetDate: '2026-09-20',
        isOverdue: false,
      },
      esp_1: {
        specialistTitle: 'Endocrinología',
        professionalName: 'Dra. Beatriz Franco',
        lastAttentionDate: '2026-07-12',
        frequency: 'Cada 45 días',
        targetDate: '2026-08-26',
        isOverdue: false,
      },
      esp_2: {
        specialistTitle: 'Oftalmología',
        professionalName: 'Dr. Ricardo Velez',
        lastAttentionDate: '2026-01-15',
        frequency: 'Anual',
        targetDate: '2027-01-15',
        isOverdue: false,
      },
      esp_3: {
        specialistTitle: 'Podología',
        professionalName: 'Dra. Luisa Fernanda',
        lastAttentionDate: '2026-05-01',
        frequency: 'Cada 90 días',
        targetDate: '2026-08-01',
        isOverdue: false,
      },
    },
    operationalNotes: [
      {
        id: 'op-201',
        author: 'Lic. Carlos Ruiz',
        role: 'Coordinador SIAU',
        timestamp: '2026-07-24 16:20',
        content: 'Pendiente autorización EPS para kit de monitoreo de glucosa.'
      }
    ],
    clinicalNotes: [
      {
        id: 'cl-201',
        author: 'Dra. Beatriz Franco',
        role: 'Endocrinología',
        timestamp: '2026-07-12 10:45',
        content: 'HbA1c descendió de 8.4% a 7.6%. Mantener dosis de Metformina 850mg c/12h.'
      }
    ]
  },
  {
    id: 'PAT-003',
    nombre: 'Camila Esperanza Torres',
    identificacion: 'CC 52.849.102',
    telefono: '+57 315 892 0192',
    email: 'ctorres.esperanza@yahoo.es',
    direccion: 'Transversal 15 #102-18, Cali',
    idConvenio: 'NUEVA_EPS-992',
    cohorte: 'Gestante Alto Riesgo',
    estado: 'Activo',
    riesgo: 'Critical',
    etiqueta: 'Oxígeno',
    fase: 'E',
    acta: {
      numero: 145,
      fecha: '2026-07-15',
      resumen: 'Valoración de urgencia por síntomas de preeclampsia leve en semana 32.',
      integrantes: ['Dra. Sofía López', 'Dr. Felipe Morales', 'Dra. Paula Agudelo']
    },
    coordinador: 'Dra. Sofía López',
    numeroCarga: 'CARGA-108',
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Carlos Mendoza',
        lastAttentionDate: '2026-07-18',
        frequency: 'Quincenal',
        targetDate: '2026-08-01',
        isOverdue: false,
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Mariana Gómez',
        lastAttentionDate: '2026-06-02',
        frequency: 'Cada 30 días',
        targetDate: '2026-07-02',
        isOverdue: false,
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '2026-05-02',
        frequency: 'Cada 30 días',
        targetDate: '2026-06-02',
        isOverdue: true,
      },
      esp_1: {
        specialistTitle: 'Ginecobstetricia',
        professionalName: 'Dra. Paula Agudelo',
        lastAttentionDate: '2026-07-15',
        frequency: 'Semanal',
        targetDate: '2026-07-22',
        isOverdue: false,
      },
      esp_2: {
        specialistTitle: 'Perinatología',
        professionalName: 'Dr. Hernán Barrientos',
        lastAttentionDate: '2026-07-10',
        frequency: 'Quincenal',
        targetDate: '2026-07-25',
        isOverdue: false,
      },
      esp_3: {
        specialistTitle: 'Anestesiología',
        professionalName: 'Dr. Samuel Varela',
        lastAttentionDate: '2026-06-01',
        frequency: 'Pre-quirúrgico',
        targetDate: '2026-08-15',
        isOverdue: false,
      },
    },
    operationalNotes: [
      {
        id: 'op-301',
        author: 'Dra. Sofía López',
        role: 'Coordinadora SIAU',
        timestamp: '2026-07-23 08:00',
        content: 'Alerta prioritaria activada para reserva de cama en UCI Neonatal de la Clínica del Norte.'
      }
    ],
    clinicalNotes: [
      {
        id: 'cl-301',
        author: 'Dra. Paula Agudelo',
        role: 'Ginecobstetricia',
        timestamp: '2026-07-15 15:30',
        content: 'Perfil biofísico fetal 8/10. Monitoreo diario de presión arterial en casa.'
      }
    ]
  },
  {
    id: 'PAT-004',
    nombre: 'Jorge Enrique Benítez',
    identificacion: 'CC 19.482.019',
    telefono: '+57 320 901 8832',
    email: 'jorge.benitez@outlook.com',
    direccion: 'Avenida 19 #134-22, Bucaramanga',
    idConvenio: 'SURA-8492',
    cohorte: 'Oncología Digestiva',
    estado: 'Activo',
    riesgo: 'Medium',
    etiqueta: 'Revisión Especial',
    fase: 'M/E',
    acta: {
      numero: 120,
      fecha: '2026-05-10',
      resumen: 'Fin de ciclos de quimioterapia adjuvante. Pasa a fase de vigilancia clínica.',
      integrantes: ['Dr. Fernando Hoyos', 'Dr. Jaime Ospina']
    },
    coordinador: 'Dr. Felipe Morales',
    numeroCarga: 'CARGA-104',
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dra. Karen Cepeda',
        lastAttentionDate: '2026-06-25',
        frequency: 'Cada 30 días',
        targetDate: '2026-07-25',
        isOverdue: false,
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Esteban Marín',
        lastAttentionDate: '2026-06-20',
        frequency: 'Cada 45 días',
        targetDate: '2026-08-04',
        isOverdue: false,
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '2026-06-15',
        frequency: 'Cada 60 días',
        targetDate: '2026-08-15',
        isOverdue: false,
      },
      esp_1: {
        specialistTitle: 'Oncología',
        professionalName: 'Dr. Jaime Ospina',
        lastAttentionDate: '2026-05-10',
        frequency: 'Trimestral',
        targetDate: '2026-08-10',
        isOverdue: false,
      },
      esp_2: {
        specialistTitle: 'Gastroenterología',
        professionalName: 'Dra. Patricia Serna',
        lastAttentionDate: '2026-04-18',
        frequency: 'Semestral',
        targetDate: '2026-10-18',
        isOverdue: false,
      },
      esp_3: {
        specialistTitle: 'Cirugía General',
        professionalName: 'Dr. Mario Henao',
        lastAttentionDate: '2026-03-01',
        frequency: 'Semestral',
        targetDate: '2026-09-01',
        isOverdue: false,
      },
    },
    operationalNotes: [],
    clinicalNotes: [
      {
        id: 'cl-401',
        author: 'Dr. Jaime Ospina',
        role: 'Oncología',
        timestamp: '2026-05-10 11:20',
        content: 'TAC abdominal de control sin evidencia de recidiva tumoral. Mantener dieta hiperproteica.'
      }
    ]
  },
  {
    id: 'PAT-005',
    nombre: 'Elena María Villamizar',
    identificacion: 'CC 32.901.442',
    telefono: '+57 311 234 5678',
    email: 'elena.villamizar@gmail.com',
    direccion: 'Calle 100 #15-30, Barranquilla',
    idConvenio: 'COMPENSAR-502',
    cohorte: 'Renal Cronico III-B',
    estado: 'Rechazado',
    riesgo: 'Low',
    etiqueta: 'Post-quirúrgico',
    fase: 'I',
    acta: {
      numero: 112,
      fecha: '2026-04-05',
      resumen: 'Rechazo por inasistencia reiterada a controles dialíticos y cambio de domicilio fuera del área de cobertura.',
      integrantes: ['Dra. Sofía López', 'Dr. Andrés Parra']
    },
    coordinador: 'Lic. Carlos Ruiz',
    numeroCarga: 'CARGA-102',
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Jorge Castro',
        lastAttentionDate: '2026-06-10',
        frequency: 'Cada 30 días',
        targetDate: '2026-07-10',
        isOverdue: false,
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Paola Tobón',
        lastAttentionDate: '2026-04-15',
        frequency: 'Cada 30 días',
        targetDate: '2026-05-15',
        isOverdue: true,
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Lic. Mateo Ríos',
        lastAttentionDate: '2026-05-20',
        frequency: 'Cada 90 días',
        targetDate: '2026-08-20',
        isOverdue: false,
      },
      esp_1: {
        specialistTitle: 'Nefrología',
        professionalName: 'Dr. Andrés Parra',
        lastAttentionDate: '2026-06-01',
        frequency: 'Mensual',
        targetDate: '2026-07-01',
        isOverdue: false,
      },
      esp_2: {
        specialistTitle: 'Vascular',
        professionalName: 'Dr. Thomas White',
        lastAttentionDate: '2026-02-05',
        frequency: 'Semestral',
        targetDate: '2026-08-05',
        isOverdue: false,
      },
      esp_3: {
        specialistTitle: 'Trabajo Social',
        professionalName: 'Lic. Diana Cardona',
        lastAttentionDate: '2026-05-01',
        frequency: 'Cada 60 días',
        targetDate: '2026-07-01',
        isOverdue: false,
      },
    },
    operationalNotes: [
      {
        id: 'op-501',
        author: 'Lic. Carlos Ruiz',
        role: 'Coordinador SIAU',
        timestamp: '2026-04-10 10:00',
        content: 'Notificación de egreso administrativo enviada a la aseguradora Compensar.'
      }
    ],
    clinicalNotes: []
  },
  {
    id: 'PAT-006',
    nombre: 'Gonzalo Andrés Salamanca',
    identificacion: 'CC 79.482.119',
    telefono: '+57 318 776 5432',
    email: 'gonzalo.salamanca@gmail.com',
    direccion: 'Carrera 43A #1S-150, Envigado',
    idConvenio: 'SURA-8492',
    cohorte: 'EPOC Severo / Oxígeno',
    estado: 'Activo',
    riesgo: 'High',
    etiqueta: 'Oxígeno',
    fase: 'I',
    acta: {
      numero: 140,
      fecha: '2026-07-02',
      resumen: 'Suministro de concentrador de oxígeno portátil y seguimiento por Neumología.',
      integrantes: ['Dra. Sofía López', 'Dr. Samuel Varela']
    },
    coordinador: 'Dra. Sofía López',
    numeroCarga: 'CARGA-108',
    specialists: {
      med_gen: {
        specialistTitle: 'MEDICO GEN.',
        professionalName: 'Dr. Carlos Mendoza',
        lastAttentionDate: '2026-07-08',
        frequency: 'Cada 30 días',
        targetDate: '2026-08-08',
        isOverdue: false,
      },
      nutri: {
        specialistTitle: 'NUTRICIONISTA',
        professionalName: 'Lic. Mariana Gómez',
        lastAttentionDate: '2026-06-01',
        frequency: 'Cada 60 días',
        targetDate: '2026-08-01',
        isOverdue: false,
      },
      psicol: {
        specialistTitle: 'Psicologia',
        professionalName: 'Dra. Claudia Ruiz',
        lastAttentionDate: '2026-06-10',
        frequency: 'Cada 60 días',
        targetDate: '2026-08-10',
        isOverdue: false,
      },
      esp_1: {
        specialistTitle: 'Neumología',
        professionalName: 'Dr. Hernando Betancur',
        lastAttentionDate: '2026-07-02',
        frequency: 'Trimestral',
        targetDate: '2026-10-02',
        isOverdue: false,
      },
      esp_2: {
        specialistTitle: 'Fisioterapia Resp.',
        professionalName: 'Ft. Camilo Cárdenas',
        lastAttentionDate: '2026-07-18',
        frequency: 'Semanal',
        targetDate: '2026-07-25',
        isOverdue: false,
      },
      esp_3: {
        specialistTitle: 'Cardiología',
        professionalName: 'Dr. Roberto Silva',
        lastAttentionDate: '2026-04-10',
        frequency: 'Semestral',
        targetDate: '2026-10-10',
        isOverdue: false,
      },
    },
    operationalNotes: [
      {
        id: 'op-601',
        author: 'Dra. Sofía López',
        role: 'Coordinadora SIAU',
        timestamp: '2026-07-05 11:10',
        content: 'Entrega de cilindro de respaldo de 680L efectuada en domicilio por proveedor Linde.'
      }
    ],
    clinicalNotes: [
      {
        id: 'cl-601',
        author: 'Dr. Hernando Betancur',
        role: 'Neumología',
        timestamp: '2026-07-02 09:15',
        content: 'Saturación O2 ambiental en 88%. Con canula nasal a 2L/min alcanza 94%.'
      }
    ]
  }
];
