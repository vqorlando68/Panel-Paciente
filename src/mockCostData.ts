import { CostAnalysisResponse } from './types';

export const DEFAULT_COST_ANALYSIS_DATA: CostAnalysisResponse = {
  job_id: "f2f93b44-1856-40bd-a512-70580067e43d",
  status: "completed",
  message: "Analysis completed successfully (cached).",
  analysis_option: "costos",
  artifacts: {
    normalized_xlsx: "gs://coomeva_giris_cohorts/normalized/Marzo_2026/6070110/203f54a9-4b36-47d2-b9b9-d40624ee1926/Data_Giris_Marzo_2026.xlsx",
    analisis_costos_html: "gs://coomeva_giris_cohorts/reports/Marzo_2026/6070110/203f54a9-4b36-47d2-b9b9-d40624ee1926/analisis_costos_Marzo_2026.html",
    result_json: "gs://coomeva_giris_cohorts/results/Marzo_2026/6070110/203f54a9-4b36-47d2-b9b9-d40624ee1926/result.json"
  },
  user_data: {
    ingresos_egresos: [
      {
        Cedula_Costos: 6070110,
        fecha_ingreso: "2025-08-13 00:00:00",
        fecha_egreso: "2025-09-17 00:00:00",
        riesgo: "moderado"
      }
    ],
    q1_q2: [
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Creatinina En Suero U Otros Fluidos",
        "Costo Total": 14500,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Colesterol Total",
        "Costo Total": 14600,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Albumina En Suero U Otros Fluidos",
        "Costo Total": 15700,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Colesterol De Alta Densidad",
        "Costo Total": 17000,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Transaminasa Glutámico Oxalacética [Aspartato Amino Transferasa]",
        "Costo Total": 17100,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Transaminasa Glutámico-Pirúvica [Alanino Amino Transferasa]",
        "Costo Total": 17100,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Fosfatasa Alcalina",
        "Costo Total": 17900,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Colesterol De Baja Densidad Semiautomatizado",
        "Costo Total": 18000,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Sodio En Suero U Otros Fluidos",
        "Costo Total": 19700,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Trigliceridos",
        "Costo Total": 20700,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Hormona Estimulante Del Tiroides Ultrasensible",
        "Costo Total": 54600,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/05/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Clinico",
        Des_CUPS_Unificado: "Hemograma Iv (Hemoglobina Hematocrito Recuento De Eritrocitos Índices Eritrocitarios Leucograma Recuento De Plaquetas Índices Plaquetarios Y Morfología Electrónica E Histograma) Automatizado",
        "Costo Total": 74000,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "ago. 2025",
        Mes_Reporte: "01/10/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 85.0,
        Nomenclador_C: "Consultas Sicologos",
        Des_CUPS_Unificado: "Atención (Visita) Domiciliaria, Por Psicología",
        "Costo Total": 132600,
        fecha_servicio: "2025-08-15 00:00:00"
      },
      {
        Mes_Emision: "ago. 2025",
        Mes_Reporte: "01/09/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Consul.Nutricionista",
        Des_CUPS_Unificado: "Atención (Visita) Domiciliaria, Por Nutrición Y Dietética",
        "Costo Total": 133500,
        fecha_servicio: "2025-08-15 00:00:00"
      },
      {
        Mes_Emision: "ago. 2025",
        Mes_Reporte: "01/09/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 85.0,
        Nomenclador_C: "Consul.Especialista",
        Des_CUPS_Unificado: "Teleconsulta Sincrónica",
        "Costo Total": 147500,
        fecha_servicio: "2025-08-15 00:00:00"
      },
      {
        Mes_Emision: "may. 2025",
        Mes_Reporte: "01/06/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Consul.Especialista",
        Des_CUPS_Unificado: "Consulta De Control O De Seguimiento Por Especialista En Dolor Y Cuidados Paliativos",
        "Costo Total": 147528,
        fecha_servicio: "2025-05-15 00:00:00"
      },
      {
        Mes_Emision: "ago. 2025",
        Mes_Reporte: "01/09/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Consulta Domiciliaria",
        Des_CUPS_Unificado: "Atención (Visita) Domiciliaria, Por Medicina General",
        "Costo Total": 157900,
        fecha_servicio: "2025-08-15 00:00:00"
      },
      {
        Mes_Emision: "mar. 2025",
        Mes_Reporte: "01/04/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Proced.Quirurgicos",
        Des_CUPS_Unificado: "Soporte De Sedación Para Consulta O Apoyo Diagnóstico",
        "Costo Total": 500000,
        fecha_servicio: "2025-03-15 00:00:00"
      },
      {
        Mes_Emision: "mar. 2025",
        Mes_Reporte: "01/04/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Laboratorio Radiologico",
        Des_CUPS_Unificado: "Arteriografía Coronaria Con Cateterismo Izquierdo",
        "Costo Total": 507800,
        fecha_servicio: "2025-03-15 00:00:00"
      },
      {
        Mes_Emision: "feb. 2025",
        Mes_Reporte: "01/03/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Paquete Proc. Quirúrgicos",
        Des_CUPS_Unificado: "Neurolisis Del Ganglio De Gasser O Esfenopalatino Por Radiofrecuencia",
        "Costo Total": 2335000,
        fecha_servicio: "2025-02-15 00:00:00"
      },
      {
        Mes_Emision: "mar. 2025",
        Mes_Reporte: "01/04/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Proced.Quirurgicos",
        Des_CUPS_Unificado: "Angioplastia Coronaria Percutánea (Endovascular) Uno O Dos Vasos",
        "Costo Total": 3314600,
        fecha_servicio: "2025-03-15 00:00:00"
      },
      {
        Mes_Emision: "mar. 2025",
        Mes_Reporte: "01/04/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Gastos Clinicos Por Hospitaliz",
        Des_CUPS_Unificado: "-",
        "Costo Total": 4768189,
        fecha_servicio: "2025-03-15 00:00:00"
      },
      {
        Mes_Emision: "mar. 2025",
        Mes_Reporte: "01/04/2025",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 84.0,
        Nomenclador_C: "Cirugia Ambulatoria",
        Des_CUPS_Unificado: "-",
        "Costo Total": 4934900,
        fecha_servicio: "2025-03-15 00:00:00"
      },
      {
        Mes_Emision: "sep. 2023",
        Mes_Reporte: "01/09/2024",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 83.0,
        Nomenclador_C: "Paquete Proc. Quirúrgicos",
        Des_CUPS_Unificado: "Angioplastia Coronaria Percutánea (Endovascular) Uno O Dos Vasos",
        "Costo Total": 7646214,
        fecha_servicio: "2023-09-15 00:00:00"
      },
      {
        Mes_Emision: "sep. 2023",
        Mes_Reporte: "01/09/2024",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 83.0,
        Nomenclador_C: "Proced.Quirurgicos",
        Des_CUPS_Unificado: "Soporte Anestésico Para Consulta O Apoyo Diagnóstico",
        "Costo Total": 531450,
        fecha_servicio: "2023-09-15 00:00:00"
      },
      {
        Mes_Emision: "sep. 2023",
        Mes_Reporte: "01/09/2024",
        Cedula_Costos: 6070110.0,
        "Nombre Afiliado": "Caicedo Jaramillo,Hernan",
        EdadC: 83.0,
        Nomenclador_C: "Suministro Insumos Y Servicios Coberturas Propias Mp",
        Des_CUPS_Unificado: "Suministro De Stent-Coills",
        "Costo Total": 5716980,
        fecha_servicio: "2023-09-15 00:00:00"
      }
    ]
  },
  user_calculated: {
    total_cost: 571500.0,
    total_services: 4,
    pre_cost: 0.0,
    post_cost: 571500.0,
    pre_services: 0,
    post_services: 4,
    monthly_costs: {
      "Mes +1": 571500.0
    },
    monthly_services: {
      "Mes +1": 4
    }
  },
  global_calculated: {
    cohort_patients: 61,
    total_cost: 1326169894.0,
    total_services: 2568,
    pre_cost: 1023238265.0,
    post_cost: 302931629.0,
    pre_services: 1238,
    post_services: 1330,
    pmpm_pre: 1858969.743278016,
    pmpm_post: 596282.2851803637
  },
  costos_data: {
    mes_corte: "Marzo_2026",
    general: {
      fecha_final: "2026-02-28 00:00:00",
      mes_maximo: 12,
      estadisticas_urgencias: {
        "-12": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 6, numero_servicios: 0, costo_promedio: 0.0 },
        "-11": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 13, numero_servicios: 0, costo_promedio: 0.0 },
        "-10": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 14, numero_servicios: 0, costo_promedio: 0.0 },
        "-9": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 24, numero_servicios: 0, costo_promedio: 0.0 },
        "-8": { costo_total: 143200.0, pacientes_con_consumo: 1, pacientes_activos: 27, numero_servicios: 0, costo_promedio: 5303.7037037037035 },
        "-7": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 36, numero_servicios: 0, costo_promedio: 0.0 },
        "-6": { costo_total: 3107509.0, pacientes_con_consumo: 4, pacientes_activos: 43, numero_servicios: 0, costo_promedio: 72267.6511627907 },
        "-5": { costo_total: 3166495.0, pacientes_con_consumo: 5, pacientes_activos: 43, numero_servicios: 0, costo_promedio: 73639.41860465116 },
        "-4": { costo_total: 6843602.0, pacientes_con_consumo: 2, pacientes_activos: 44, numero_servicios: 0, costo_promedio: 155536.4090909091 },
        "-3": { costo_total: 10775398.0, pacientes_con_consumo: 5, pacientes_activos: 44, numero_servicios: 0, costo_promedio: 244895.4090909091 },
        "-2": { costo_total: 13327352.0, pacientes_con_consumo: 7, pacientes_activos: 56, numero_servicios: 0, costo_promedio: 237988.42857142858 },
        "-1": { costo_total: 6603943.0, pacientes_con_consumo: 2, pacientes_activos: 61, numero_servicios: 0, costo_promedio: 108261.3606557377 },
        "1": { costo_total: 3935841.0, pacientes_con_consumo: 3, pacientes_activos: 61, numero_servicios: 0, costo_promedio: 64521.983606557376 },
        "2": { costo_total: 863437.0, pacientes_con_consumo: 1, pacientes_activos: 56, numero_servicios: 0, costo_promedio: 15418.517857142857 },
        "3": { costo_total: 1318350.0, pacientes_con_consumo: 1, pacientes_activos: 44, numero_servicios: 0, costo_promedio: 29962.5 },
        "4": { costo_total: 240125.0, pacientes_con_consumo: 1, pacientes_activos: 44, numero_servicios: 0, costo_promedio: 5457.386363636364 },
        "5": { costo_total: 585536.0, pacientes_con_consumo: 2, pacientes_activos: 43, numero_servicios: 0, costo_promedio: 13617.116279069767 },
        "6": { costo_total: 148600.0, pacientes_con_consumo: 1, pacientes_activos: 43, numero_servicios: 0, costo_promedio: 3455.813953488372 },
        "7": { costo_total: 1294430.0, pacientes_con_consumo: 2, pacientes_activos: 36, numero_servicios: 0, costo_promedio: 35956.38888888889 },
        "8": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 27, numero_servicios: 0, costo_promedio: 0.0 },
        "9": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 24, numero_servicios: 0, costo_promedio: 0.0 },
        "10": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 14, numero_servicios: 0, costo_promedio: 0.0 },
        "11": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 13, numero_servicios: 0, costo_promedio: 0.0 },
        "12": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 6, numero_servicios: 0, costo_promedio: 0.0 }
      },
      estadisticas_hospitalizacion: {
        "-12": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 6, numero_servicios: 0, costo_promedio: 0.0 },
        "-11": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 13, numero_servicios: 0, costo_promedio: 0.0 },
        "-10": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 14, numero_servicios: 0, costo_promedio: 0.0 },
        "-9": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 24, numero_servicios: 0, costo_promedio: 0.0 },
        "-8": { costo_total: 3835925.0, pacientes_con_consumo: 1, pacientes_activos: 27, numero_servicios: 0, costo_promedio: 142071.2962962963 },
        "-7": { costo_total: 18991910.0, pacientes_con_consumo: 3, pacientes_activos: 36, numero_servicios: 0, costo_promedio: 527553.0555555555 },
        "-6": { costo_total: 24325365.0, pacientes_con_consumo: 4, pacientes_activos: 43, numero_servicios: 0, costo_promedio: 565706.1627906977 },
        "-5": { costo_total: 32991120.0, pacientes_con_consumo: 4, pacientes_activos: 43, numero_servicios: 0, costo_promedio: 767235.3488372093 },
        "-4": { costo_total: 50559470.0, pacientes_con_consumo: 8, pacientes_activos: 44, numero_servicios: 0, costo_promedio: 1149078.8636363635 },
        "-3": { costo_total: 94418199.0, pacientes_con_consumo: 8, pacientes_activos: 44, numero_servicios: 0, costo_promedio: 2145868.159090909 },
        "-2": { costo_total: 22973054.0, pacientes_con_consumo: 3, pacientes_activos: 56, numero_servicios: 0, costo_promedio: 410233.10714285716 },
        "-1": { costo_total: 62815559.0, pacientes_con_consumo: 2, pacientes_activos: 61, numero_servicios: 0, costo_promedio: 1029763.262295082 },
        "1": { costo_total: 35990533.0, pacientes_con_consumo: 4, pacientes_activos: 61, numero_servicios: 0, costo_promedio: 590008.737704918 },
        "2": { costo_total: 13083766.0, pacientes_con_consumo: 1, pacientes_activos: 56, numero_servicios: 0, costo_promedio: 233638.67857142858 },
        "3": { costo_total: 4417451.0, pacientes_con_consumo: 1, pacientes_activos: 44, numero_servicios: 0, costo_promedio: 100396.61363636363 },
        "4": { costo_total: 15700711.0, pacientes_con_consumo: 1, pacientes_activos: 44, numero_servicios: 0, costo_promedio: 356834.3409090909 },
        "5": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 43, numero_servicios: 0, costo_promedio: 0.0 },
        "6": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 43, numero_servicios: 0, costo_promedio: 0.0 },
        "7": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 36, numero_servicios: 0, costo_promedio: 0.0 },
        "8": { costo_total: 6096400.0, pacientes_con_consumo: 1, pacientes_activos: 27, numero_servicios: 0, costo_promedio: 225792.59259259258 },
        "9": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 24, numero_servicios: 0, costo_promedio: 0.0 },
        "10": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 14, numero_servicios: 0, costo_promedio: 0.0 },
        "11": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 13, numero_servicios: 0, costo_promedio: 0.0 },
        "12": { costo_total: 0, pacientes_con_consumo: 0, pacientes_activos: 6, numero_servicios: 0, costo_promedio: 0.0 }
      },
      pacientes_activos_por_mes: {
        "-12": [31374688, 38967136, 29094709, 34547451, 17053868, 6070127],
        "-11": [31224128, 31374688, 38967136, 1105386208, 2415205, 14885543, 17053868, 38967917, 6070127, 16640949, 29094709, 66946742, 34547451],
        "-10": [31224128, 31374688, 38967136, 1105386208, 2415205, 14885543, 4313867, 17053868, 38967917, 6070127, 16640949, 29094709, 66946742, 34547451],
        "-9": [31224128, 19302148, 70118086, 4313867, 6186255, 16712925, 31374688, 38967136, 1105386208, 29071140, 2415205, 14885543, 17053868, 38967917, 1079179695, 6070127, 19092915, 16640949, 29094709, 66946742, 14932600, 34547451, 38998140, 59517],
        "-8": [31224128, 19302148, 70118086, 4313867, 6186255, 16712925, 94507294, 1107507230, 31374688, 38967136, 1105386208, 16637475, 29071140, 2415205, 14885543, 17053868, 38967917, 1079179695, 6070127, 19092915, 16640949, 29094709, 66946742, 14932600, 34547451, 38998140, 59517],
        "-7": [19302148, 1404169, 4313867, 6186255, 14444051, 94507294, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 31398483, 16732508, 16712925, 6070110, 31374688, 38967136, 1105386208, 2415205, 38967917, 6070127, 14932600, 34547451, 38998140, 59517],
        "-6": [19302148, 25259653, 1404169, 4313867, 6186255, 14444051, 94507294, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 31398483, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 38967917, 6070127, 14932600, 31865339, 38998140, 59517],
        "-5": [19302148, 25259653, 1404169, 4313867, 6186255, 14444051, 94507294, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 31398483, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 38967917, 6070127, 14932600, 31865339, 38998140, 59517],
        "-4": [19302148, 25259653, 31839620, 1404169, 4313867, 6186255, 14444051, 94507294, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 31398483, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 38967917, 6070127, 14932600, 31865339, 38998140, 59517],
        "-3": [19302148, 25259653, 31839620, 1404169, 4313867, 6186255, 14444051, 94507294, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 31398483, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 38967917, 6070127, 14932600, 31865339, 38998140, 59517],
        "-2": [19302148, 25259653, 31839620, 14955655, 66764296, 1404169, 4313867, 6186255, 14444051, 38982165, 94507294, 31282719, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 59517, 29094709, 66946742, 38969915, 14441279, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 2430290, 31398483, 6095066, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 16665193, 38967917, 6070127, 41519600, 94418420, 14932600, 31865339, 38998140, 6494973],
        "-1": [19302148, 25259653, 31839620, 14955655, 66764296, 1404169, 14988298, 4313867, 6186255, 14444051, 16355347, 38982165, 94507294, 31282719, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 59517, 16640949, 29094709, 66946742, 38969915, 14441279, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 2430290, 31398483, 6095066, 16732508, 16712925, 6070110, 41348189, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 16665193, 38967917, 66986350, 6070127, 41519600, 94418420, 14932600, 31865339, 38998140, 6494973, 29213182],
        "1": [19302148, 25259653, 31839620, 14955655, 66764296, 1404169, 14988298, 4313867, 6186255, 14444051, 16355347, 38982165, 94507294, 31282719, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 59517, 16640949, 29094709, 66946742, 38969915, 14441279, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 2430290, 31398483, 6095066, 16732508, 16712925, 6070110, 41348189, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 16665193, 38967917, 66986350, 6070127, 41519600, 94418420, 14932600, 31865339, 38998140, 6494973, 29213182],
        "2": [19302148, 25259653, 31839620, 14955655, 66764296, 1404169, 4313867, 6186255, 14444051, 38982165, 94507294, 31282719, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 59517, 29094709, 66946742, 38969915, 14441279, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 2430290, 31398483, 6095066, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 16665193, 38967917, 6070127, 41519600, 94418420, 14932600, 31865339, 38998140, 6494973],
        "3": [19302148, 25259653, 31839620, 1404169, 4313867, 6186255, 14444051, 94507294, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 31398483, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 38967917, 6070127, 14932600, 31865339, 38998140, 59517],
        "4": [19302148, 25259653, 31839620, 1404169, 4313867, 6186255, 14444051, 94507294, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 31398483, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 38967917, 6070127, 14932600, 31865339, 38998140, 59517],
        "5": [19302148, 25259653, 1404169, 4313867, 6186255, 14444051, 94507294, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 31398483, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 38967917, 6070127, 14932600, 31865339, 38998140, 59517],
        "6": [19302148, 25259653, 1404169, 4313867, 6186255, 14444051, 94507294, 34547451, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 29970635, 32760524, 16663631, 31398483, 16732508, 16712925, 6070110, 31374688, 37812065, 38967136, 1105386208, 2415205, 1018437607, 38967917, 6070127, 14932600, 31865339, 38998140, 59517],
        "7": [19302148, 1404169, 4313867, 6186255, 14444051, 94507294, 1107507230, 16637475, 29071140, 14885543, 17053868, 1006108333, 1079179695, 19092915, 16640949, 29094709, 66946742, 6050752, 31224128, 38981830, 70118086, 14978505, 31398483, 16732508, 16712925, 6070110, 31374688, 38967136, 1105386208, 2415205, 38967917, 6070127, 14932600, 34547451, 38998140, 59517],
        "8": [19302148, 4313867, 6186255, 94507294, 1107507230, 16637475, 29071140, 14885543, 17053868, 1079179695, 19092915, 16640949, 29094709, 66946742, 31224128, 70118086, 16712925, 31374688, 38967136, 1105386208, 2415205, 38967917, 6070127, 14932600, 34547451, 38998140, 59517],
        "9": [19302148, 4313867, 6186255, 29071140, 14885543, 17053868, 1079179695, 19092915, 16640949, 29094709, 66946742, 31224128, 70118086, 16712925, 31374688, 38967136, 1105386208, 2415205, 38967917, 6070127, 14932600, 34547451, 38998140, 59517],
        "10": [31224128, 31374688, 38967136, 1105386208, 2415205, 14885543, 4313867, 17053868, 38967917, 6070127, 16640949, 29094709, 66946742, 34547451],
        "11": [31224128, 31374688, 38967136, 1105386208, 2415205, 14885543, 17053868, 38967917, 6070127, 16640949, 29094709, 66946742, 34547451],
        "12": [31374688, 38967136, 17053868, 6070127, 29094709, 34547451]
      }
    },
    pmpm_pre: 1858969.743278016,
    pmpm_post: 596282.2851803637,
    diferencia_pmpm: -1262687.4580976525
  },
  requested_user_id: "6070110",
  errors: []
};
