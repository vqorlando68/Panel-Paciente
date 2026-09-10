/**
 * Template HTML para la impresión y visualización de Historias Clínicas / Actas de Equipo Multidisciplinario
 */
export function renderPrintableActaHtml(data: any, codigoCita?: string, idActa?: number): string {
  const actaNum = data?.id_acta || idActa || '—';
  const pacienteNombre = data?.nombre_completo || 'Paciente sin nombre registrado';
  const tipoId = data?.tipo_identificacion || 'ID';
  const idNum = data?.identificacion || '—';
  const edad = data?.edad || '—';
  const genero = data?.genero || '—';
  const fechaNac = data?.fecha_nacimiento || '—';
  const riesgo = data?.descripcion_riesgo || (data?.nivel_riesgo ? `Nivel ${data.nivel_riesgo}` : 'Estable');
  const proximaRev = data?.fecha_proxima_revision || 'No programada';
  const analisis = data?.analisis || 'Sin análisis o plan registrado en el acta.';
  
  const ant = data?.antecedentes || {};
  const metricas = data?.metricas_relevantes || {};
  const progEsp = Array.isArray(data?.prog_especialidad_acta) ? data.prog_especialidad_acta : [];
  const atencionesProg = Array.isArray(data?.atenciones_programadas) ? data.atenciones_programadas : [];

  const codDisplay = codigoCita || data?.codigo_cita || '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Equipo Multidisciplinario - Acta Médica de Atención</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter portrait;
      margin: 14mm 16mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background-color: #f8fafc;
      line-height: 1.45;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print {
      display: flex;
    }
    @media print {
      body {
        background-color: #ffffff;
        color: #000000;
      }
      .no-print {
        display: none !important;
      }
      .page-container {
        box-shadow: none !important;
        border: none !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .section-card {
        break-inside: avoid;
        border-color: #cbd5e1 !important;
      }
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #033d59;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .toolbar-title {
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .toolbar-actions {
      display: flex;
      gap: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn-primary {
      background: #00aae1;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #0196d4;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .page-container {
      max-width: 860px;
      margin: 24px auto 40px auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      padding: 32px 36px;
    }

    .header-table {
      width: 100%;
      border-bottom: 2px solid #00aae1;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }
    .header-logo {
      height: 52px;
      max-width: 190px;
      object-fit: contain;
    }
    .header-doc-title {
      font-size: 21px;
      font-weight: 800;
      color: #033d59;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .header-doc-sub {
      font-size: 13px;
      color: #00aae1;
      font-weight: 700;
      margin-top: 3px;
    }
    .header-meta-box {
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }
    .acta-pill {
      display: inline-block;
      background: #effaff;
      color: #00aae1;
      border: 1px solid #bae6fd;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #033d59;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-title::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 12px;
      background: #00aae1;
      border-radius: 2px;
    }

    .patient-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .patient-field-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .patient-field-value {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }

    .clinical-box {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 18px;
      background: #ffffff;
    }
    .clinical-box-text {
      font-size: 13px;
      line-height: 1.55;
      color: #1e293b;
      white-space: pre-wrap;
    }

    .antecedentes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 18px;
    }
    .ant-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .ant-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .ant-value {
      font-size: 12px;
      color: #0f172a;
      font-weight: 500;
      margin-top: 3px;
      white-space: pre-wrap;
    }

    .metrics-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 18px;
    }
    .metric-card {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }
    .metric-name {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .metric-val {
      font-size: 16px;
      font-weight: 800;
      color: #033d59;
      margin-top: 3px;
    }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 12px;
    }
    table.data-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 11px;
      text-transform: uppercase;
    }
    table.data-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }

    .footer {
      margin-top: 30px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 11px;
    }
  </style>
</head>
<body>

  <!-- Barra de Herramientas de Impresión (No visible en impresión física) -->
  <div class="toolbar no-print">
    <div class="toolbar-title">
      <span>Equipo Multidisciplinario</span>
      <span style="opacity: 0.85; font-size: 12px; font-weight: 500;">· Acta Médica de Atención</span>
      ${codDisplay ? `<span style="opacity: 0.8; font-family: monospace; font-size: 12px;">(Cita: ${codDisplay})</span>` : ''}
    </div>
    <div class="toolbar-actions">
      <button onclick="window.print()" class="btn btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        <span>Imprimir / Guardar PDF</span>
      </button>
      <button onclick="window.close()" class="btn btn-secondary">
        <span>Cerrar</span>
      </button>
    </div>
  </div>

  <!-- Contenedor Principal del Documento -->
  <div class="page-container">
    
    <!-- Encabezado con Logo Teker -->
    <table class="header-table">
      <tr>
        <td style="width: 220px; vertical-align: middle;">
          <img src="https://www.tekerapp.co/assets/logo.svg" alt="Teker Salud" class="header-logo" onerror="this.onerror=null; this.src='https://tekerapp.com/assets/logo.svg';">
        </td>
        <td style="vertical-align: middle; padding-left: 12px;">
          <div class="header-doc-title">Equipo Multidisciplinario</div>
          <div class="header-doc-sub">Acta Médica de Atención</div>
        </td>
        <td style="vertical-align: middle;" class="header-meta-box">
          <div class="acta-pill">ACTA #${actaNum}</div>
          ${codDisplay ? `<div>CÓDIGO CITA: <strong>${codDisplay}</strong></div>` : ''}
          <div style="color: #64748b; margin-top: 2px;">Fecha Emisión: ${new Date().toLocaleDateString('es-CO')}</div>
        </td>
      </tr>
    </table>

    <!-- 1. Datos del Paciente -->
    <div class="section-title">Datos Generales del Paciente</div>
    <div class="patient-grid">
      <div>
        <div class="patient-field-label">Nombre del Paciente</div>
        <div class="patient-field-value">${pacienteNombre}</div>
      </div>
      <div>
        <div class="patient-field-label">Identificación</div>
        <div class="patient-field-value">${tipoId}: ${idNum}</div>
      </div>
      <div>
        <div class="patient-field-label">Nivel de Riesgo</div>
        <div class="patient-field-value" style="color: #00aae1;">${riesgo}</div>
      </div>
      <div>
        <div class="patient-field-label">Edad / Género</div>
        <div class="patient-field-value">${edad} · ${genero}</div>
      </div>
      <div>
        <div class="patient-field-label">Fecha de Nacimiento</div>
        <div class="patient-field-value">${fechaNac}</div>
      </div>
      <div>
        <div class="patient-field-label">Próxima Revisión</div>
        <div class="patient-field-value" style="color: #033d59;">${proximaRev}</div>
      </div>
    </div>

    <!-- 2. Análisis y Plan de Manejo -->
    <div class="section-title">Análisis y Plan de Manejo Clínico</div>
    <div class="clinical-box">
      <p class="clinical-box-text">${analisis}</p>
    </div>

    <!-- 3. Antecedentes -->
    <div class="section-title">Antecedentes del Paciente</div>
    <div class="antecedentes-grid">
      <div class="ant-item">
        <div class="ant-label">Patológicos</div>
        <div class="ant-value">${ant.antecedentes_patologicos || 'No refiere'}</div>
      </div>
      <div class="ant-item">
        <div class="ant-label">Quirúrgicos</div>
        <div class="ant-value">${ant.antecedentes_quirurgicos || 'No refiere'}</div>
      </div>
      <div class="ant-item">
        <div class="ant-label">Farmacológicos</div>
        <div class="ant-value">${ant.antecedentes_farmacologicos || 'No refiere'}</div>
      </div>
      <div class="ant-item">
        <div class="ant-label">Familiares</div>
        <div class="ant-value">${ant.antecedentes_familiares || 'No refiere'}</div>
      </div>
      <div class="ant-item">
        <div class="ant-label">Traumáticos</div>
        <div class="ant-value">${ant.antecedentes_traumaticos || 'No refiere'}</div>
      </div>
      <div class="ant-item">
        <div class="ant-label">Personales</div>
        <div class="ant-value">${ant.antecedentes_personales || 'No refiere'}</div>
      </div>
    </div>

    <!-- 4. Métricas Relevantes -->
    <div class="section-title">Métricas Clave de Control</div>
    <div class="metrics-bar">
      <div class="metric-card">
        <div class="metric-name">Presión Arterial</div>
        <div class="metric-val">${metricas.presion_arterial || '—'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-name">Nivel de Azúcar</div>
        <div class="metric-val">${metricas.nivel_azucar ? `${metricas.nivel_azucar} mg/dL` : '—'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-name">HbA1c</div>
        <div class="metric-val">${metricas.hba1c ? `${metricas.hba1c}%` : '—'}</div>
      </div>
    </div>

    <!-- 5. Programación de Especialidades -->
    ${progEsp.length > 0 ? `
      <div class="section-title">Programación de Especialidades</div>
      <div class="clinical-box" style="padding: 0; overflow: hidden; margin-bottom: 18px;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Especialidad</th>
              <th>Días de Programación</th>
              <th>Fecha Estimada Inicio</th>
            </tr>
          </thead>
          <tbody>
            ${progEsp.map((pe: any) => `
              <tr>
                <td style="font-weight: 600;">${pe.nombre_especialidad || '—'}</td>
                <td>${pe.dias ? `${pe.dias} días` : '—'}</td>
                <td>${pe.fecha_inicio || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    <!-- 6. Atenciones Programadas (si aplican) -->
    ${atencionesProg.length > 0 ? `
      <div class="section-title">Atenciones Programadas Asociadas</div>
      <div class="clinical-box" style="padding: 0; overflow: hidden; margin-bottom: 18px;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha Cita</th>
              <th>Especialidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${atencionesProg.map((ap: any) => `
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: #00aae1;">${ap.codigo_cita || ap.id_hexadecimal || '—'}</td>
                <td>${ap.fecha_cita || '—'}</td>
                <td>${ap.nombre_especialidad || '—'}</td>
                <td>${ap.estado_cita || 'Programada'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    <!-- Pie de página -->
    <div class="footer">
      <div>Documento Clínico Confidencial · Teker Gestión de Riesgo</div>
      <div>Generado automáticamente por Teker Platform</div>
    </div>

  </div>

</body>
</html>`;
}
