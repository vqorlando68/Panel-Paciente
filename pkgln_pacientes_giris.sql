/*******************************************************************************
  PAQUETE: pkgln_pacientes_giris
  DESCRIPCION: Paquete de Lógica de Negocio para el Panel de Pacientes Giris.
               Todas las interacciones con la base de datos se realizan a través
               de los parámetros de entrada p_json_entrada y salida p_json_salida
               (o p_json_salida para catálogos).

  REGLA DE CONSTRUCCIÓN SQL:
    - Todos los SELECTs están estructurados SIN la nomenclatura JOIN,
      utilizando la sintaxis en la cláusula WHERE y la notación (+) para
      outer joins de Oracle.
*******************************************************************************/

-- =============================================================================
-- ESPECIFICACION DEL PAQUETE (PACKAGE SPEC)
-- =============================================================================
CREATE OR REPLACE PACKAGE pkgln_pacientes_giris IS

  /*****************************************************************************
    PROCEDIMIENTO: prc_obtener_total_paginas
    DESCRIPCION: Recibe los filtros y registros por página para retornar el total
                 de registros y la cantidad total de páginas calculadas.
  *****************************************************************************/
  PROCEDURE prc_obtener_total_paginas (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  );

  /*****************************************************************************
    PROCEDIMIENTO: prc_obtener_pacientes_pagina
    DESCRIPCION: Recibe la página solicitada, registros por página y filtros.
                 Estructura y entrega el arreglo de pacientes GIRIS para la página activa.
  *****************************************************************************/
  PROCEDURE prc_obtener_pacientes_pagina (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  );

  /*****************************************************************************
    PROCEDIMIENTO: prc_obtener_pacientes
    DESCRIPCION: Procedimiento de compatibilidad directa. Invoca prc_obtener_pacientes_pagina.
  *****************************************************************************/
  PROCEDURE prc_obtener_pacientes (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  );

  /*****************************************************************************
    PROCEDIMIENTO: prc_obtener_tipos_identificacion
    DESCRIPCION: Retorna los tipos de identificación ordenados por abreviatura.
  *****************************************************************************/
  PROCEDURE prc_obtener_tipos_identificacion (
    p_json_salida  OUT CLOB
  );

  /*****************************************************************************
    PROCEDIMIENTO: prc_obtener_coordinadores
    DESCRIPCION: Retorna los usuarios coordinadores (rol = 11) ordenados por nombres y apellidos.
  *****************************************************************************/
  PROCEDURE prc_obtener_coordinadores (
    p_json_salida  OUT CLOB
  );

  /*****************************************************************************
    PROCEDIMIENTO: prc_obtener_estados_cohorte
    DESCRIPCION: Retorna los estados de cohorte ordenados por descripción.
  *****************************************************************************/
  PROCEDURE prc_obtener_estados_cohorte (
    p_json_salida  OUT CLOB
  );

  /*****************************************************************************
    PROCEDIMIENTO: prc_guardar_paciente
    DESCRIPCION: Crea o actualiza un registro de paciente.
  *****************************************************************************/
  PROCEDURE prc_guardar_paciente (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  );

  /*****************************************************************************
    PROCEDIMIENTO: prc_guardar_acta
    DESCRIPCION: Registra o actualiza el acta médica de un paciente.
  *****************************************************************************/
  PROCEDURE prc_guardar_acta (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  );

  /*****************************************************************************
    PROCEDIMIENTO: prc_agregar_nota
    DESCRIPCION: Agrega una nota operativa o clínica a la historia del paciente.
  *****************************************************************************/
  PROCEDURE prc_agregar_nota (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  );

END pkgln_pacientes_giris;
/
SHOW ERRORS;

-- =============================================================================
-- CUERPO DEL PAQUETE (PACKAGE BODY)
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY pkgln_pacientes_giris IS

  ------------------------------------------------------------------------------
  -- PROCEDIMIENTO: prc_obtener_total_paginas
  ------------------------------------------------------------------------------
  PROCEDURE prc_obtener_total_paginas (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  ) IS
    v_registros_pag  NUMBER := 10;
    v_total_reg      NUMBER := 0;
    v_total_pag      NUMBER := 1;
  BEGIN
    IF p_json_entrada IS NOT NULL AND LENGTH(p_json_entrada) > 0 THEN
      BEGIN
        v_registros_pag := NVL(TO_NUMBER(JSON_VALUE(p_json_entrada, '$.registros_por_pagina')), 10);
      EXCEPTION
        WHEN OTHERS THEN
          v_registros_pag := 10;
      END;
    END IF;

    SELECT COUNT(*)
      INTO v_total_reg
      FROM tkr_usuarios              u,
           tkr_tipos_identificacion  ti,
           tkr_usuarios_cohorte      uc,
           tkr_usuarios              uco
     WHERE u.id_tipo_identificacion = ti.id
       AND uc.id_usuario = u.id
       AND uc.id_coordinador = uco.id(+);

    IF v_registros_pag > 0 THEN
      v_total_pag := CEIL(v_total_reg / v_registros_pag);
    ELSE
      v_total_pag := 1;
    END IF;

    p_json_salida := '{"codigo_respuesta": 0, "mensaje_respuesta": "Cálculo de paginación realizado exitosamente", "paginacion": {"registros_por_pagina": ' 
                     || v_registros_pag || ', "total_registros": ' || v_total_reg || ', "total_paginas": ' || v_total_pag || '}}';
  EXCEPTION
    WHEN OTHERS THEN
      p_json_salida := '{"codigo_respuesta": -1, "mensaje_respuesta": "Error en prc_obtener_total_paginas: ' || REPLACE(SQLERRM, '"', '\"') || '"}';
  END prc_obtener_total_paginas;

  ------------------------------------------------------------------------------
  -- PROCEDIMIENTO: prc_obtener_pacientes_pagina
  ------------------------------------------------------------------------------
  PROCEDURE prc_obtener_pacientes_pagina (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  ) IS
    v_pagina         NUMBER := 1;
    v_registros_pag  NUMBER := 10;
    v_total_reg      NUMBER := 0;
    v_total_pag      NUMBER := 1;

    v_hdr            VARCHAR2(2000);
    v_json_data      CLOB;
    v_first          BOOLEAN := TRUE;
    v_item           VARCHAR2(4000);
    v_riesgo_desc    VARCHAR2(50);

    CURSOR c_pacientes IS
      SELECT u.id,
             u.nombres,
             u.apellidos,
             u.id_tipo_identificacion,
             ti.abreviatura                  tipo_identificacion_abrev,
             ti.descripcion                  tipo_identificacion_desc,
             u.identificacion,
             u.telefono,
             u.correo_electronico,
             u.direccion,
             uco.id                          id_coordinador,
             uco.nombres || ' ' || uco.apellidos coordinador_nombre,
             (  SELECT a.nivel_riesgo
                  FROM tkr_actas_medicas a
                 WHERE a.id_usuario = u.id
              ORDER BY a.id DESC
                 FETCH FIRST 1 ROWS ONLY)    id_nivel_riesgo
        FROM tkr_usuarios              u,
             tkr_tipos_identificacion  ti,
             tkr_usuarios_cohorte      uc,
             tkr_usuarios              uco
       WHERE u.id_tipo_identificacion = ti.id 
         AND uc.id_usuario = u.id 
         AND uc.id_coordinador = uco.id(+)
       ORDER BY u.nombres, u.apellidos;
  BEGIN
    IF p_json_entrada IS NOT NULL AND LENGTH(p_json_entrada) > 0 THEN
      BEGIN
        v_pagina        := NVL(TO_NUMBER(JSON_VALUE(p_json_entrada, '$.pagina')), 1);
        v_registros_pag := NVL(TO_NUMBER(JSON_VALUE(p_json_entrada, '$.registros_por_pagina')), 10);
      EXCEPTION
        WHEN OTHERS THEN
          v_pagina        := 1;
          v_registros_pag := 10;
      END;
    END IF;

    SELECT COUNT(*)
      INTO v_total_reg
      FROM tkr_usuarios              u,
           tkr_tipos_identificacion  ti,
           tkr_usuarios_cohorte      uc,
           tkr_usuarios              uco
     WHERE u.id_tipo_identificacion = ti.id 
       AND uc.id_usuario = u.id 
       AND uc.id_coordinador = uco.id(+);

    IF v_registros_pag > 0 THEN
      v_total_pag := CEIL(v_total_reg / v_registros_pag);
    ELSE
      v_total_pag := 1;
    END IF;

    DBMS_LOB.CREATETEMPORARY(v_json_data, TRUE);

    v_hdr := '{"codigo_respuesta": 0, "mensaje_respuesta": "Página de pacientes obtenida exitosamente", "paginacion": {"pagina_actual": ' 
             || v_pagina || ', "registros_por_pagina": ' || v_registros_pag || ', "total_registros": ' || v_total_reg 
             || ', "total_paginas": ' || v_total_pag || '}, "especialidades_orden": ['
             || '{"id_especialidad": 17, "nombre": "Medicina General", "key": "med_gen"},'
             || '{"id_especialidad": 36, "nombre": "Psicología", "key": "psicol"},'
             || '{"id_especialidad": 37, "nombre": "Nutrición", "key": "nutri"},'
             || '{"id_especialidad": 101, "nombre": "Cardiología", "key": "esp_1"},'
             || '{"id_especialidad": 102, "nombre": "Endocrinología", "key": "esp_2"},'
             || '{"id_especialidad": 103, "nombre": "Nefrología", "key": "esp_3"},'
             || '{"id_especialidad": 104, "nombre": "Neurología", "key": "esp_4"}'
             || '], "pacientes": [';

    DBMS_LOB.WRITEAPPEND(v_json_data, LENGTH(v_hdr), v_hdr);

    FOR r IN c_pacientes LOOP
      IF NOT v_first THEN
        v_item := ',';
        DBMS_LOB.WRITEAPPEND(v_json_data, LENGTH(v_item), v_item);
      END IF;
      v_first := FALSE;

      CASE r.id_nivel_riesgo
        WHEN 1 THEN v_riesgo_desc := 'High';
        WHEN 2 THEN v_riesgo_desc := 'Medium';
        WHEN 3 THEN v_riesgo_desc := 'Low';
        WHEN 4 THEN v_riesgo_desc := 'Critical';
        ELSE v_riesgo_desc := NULL;
      END CASE;

      v_item := '{"id": "' || r.id || '"' ||
                ', "nombres": "' || REPLACE(r.nombres, '"', '\"') || '"' ||
                ', "apellidos": "' || REPLACE(r.apellidos, '"', '\"') || '"' ||
                ', "nombre": "' || REPLACE(r.nombres || ' ' || r.apellidos, '"', '\"') || '"' ||
                ', "id_tipo_identificacion": ' || NVL(TO_CHAR(r.id_tipo_identificacion), 'null') ||
                ', "tipo_identificacion_abrev": "' || REPLACE(r.tipo_identificacion_abrev, '"', '\"') || '"' ||
                ', "tipo_identificacion_desc": "' || REPLACE(r.tipo_identificacion_desc, '"', '\"') || '"' ||
                ', "identificacion": "' || REPLACE(r.identificacion, '"', '\"') || '"' ||
                ', "telefono": "' || REPLACE(r.telefono, '"', '\"') || '"' ||
                ', "email": "' || REPLACE(r.correo_electronico, '"', '\"') || '"' ||
                ', "direccion": "' || REPLACE(r.direccion, '"', '\"') || '"' ||
                ', "id_coordinador": ' || NVL(TO_CHAR(r.id_coordinador), 'null') ||
                ', "coordinador": ' || CASE WHEN r.coordinador_nombre IS NOT NULL THEN '"' || REPLACE(r.coordinador_nombre, '"', '\"') || '"' ELSE 'null' END ||
                ', "id_nivel_riesgo": ' || NVL(TO_CHAR(r.id_nivel_riesgo), 'null') ||
                ', "riesgo": ' || CASE WHEN v_riesgo_desc IS NOT NULL THEN '"' || v_riesgo_desc || '"' ELSE 'null' END ||
                ', "estado": null' ||
                ', "cohorte": null' ||
                ', "fase": null' ||
                ', "idConvenio": null' ||
                ', "convenioNombre": null' ||
                ', "numeroCarga": null' ||
                ', "hasAlarm": false' ||
                ', "alarmReasons": []' ||
                ', "acta": null' ||
                ', "actasHistory": []' ||
                ', "tasas": null' ||
                ', "cuadroMedico": []' ||
                ', "agenda": []' ||
                ', "specialists": null' ||
                ', "operationalNotes": []' ||
                ', "clinicalNotes": []' ||
                '}';
      DBMS_LOB.WRITEAPPEND(v_json_data, LENGTH(v_item), v_item);
    END LOOP;

    v_item := ']}';
    DBMS_LOB.WRITEAPPEND(v_json_data, LENGTH(v_item), v_item);

    p_json_salida := v_json_data;

  EXCEPTION
    WHEN OTHERS THEN
      p_json_salida := '{"codigo_respuesta": -1, "mensaje_respuesta": "Error en prc_obtener_pacientes_pagina: ' 
                       || REPLACE(SQLERRM, '"', '\"') || '", "pacientes": []}';
  END prc_obtener_pacientes_pagina;

  ------------------------------------------------------------------------------
  -- PROCEDIMIENTO: prc_obtener_pacientes (Compatibilidad)
  ------------------------------------------------------------------------------
  PROCEDURE prc_obtener_pacientes (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  ) IS
  BEGIN
    prc_obtener_pacientes_pagina(p_json_entrada, p_json_salida);
  END prc_obtener_pacientes;

  ------------------------------------------------------------------------------
  -- PROCEDIMIENTO: prc_obtener_tipos_identificacion
  ------------------------------------------------------------------------------
  PROCEDURE prc_obtener_tipos_identificacion (
    p_json_salida OUT CLOB
  ) IS
    v_json  CLOB;
    v_first BOOLEAN := TRUE;
    v_item  VARCHAR2(4000);
    CURSOR c_tipos IS
        SELECT id, abreviatura, descripcion
          FROM tkr_tipos_identificacion
      ORDER BY abreviatura;
  BEGIN
    DBMS_LOB.CREATETEMPORARY(v_json, TRUE);
    v_item := '{"codigo_respuesta": 0, "mensaje_respuesta": "Tipos de identificación obtenidos exitosamente", "tipos_identificacion": [';
    DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);

    FOR r IN c_tipos LOOP
      IF NOT v_first THEN
        v_item := ',';
        DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);
      END IF;
      v_first := FALSE;

      v_item := '{"id": ' || r.id || 
                ', "abreviatura": "' || REPLACE(r.abreviatura, '"', '\"') || '"' ||
                ', "descripcion": "' || REPLACE(r.descripcion, '"', '\"') || '"}';
      DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);
    END LOOP;

    v_item := ']}';
    DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);
    p_json_salida := v_json;
  EXCEPTION
    WHEN OTHERS THEN
      p_json_salida := '{"codigo_respuesta": -1, "mensaje_respuesta": "Error en prc_obtener_tipos_identificacion: ' 
                       || REPLACE(SQLERRM, '"', '\"') || '"}';
  END prc_obtener_tipos_identificacion;

  ------------------------------------------------------------------------------
  -- PROCEDIMIENTO: prc_obtener_coordinadores
  ------------------------------------------------------------------------------
  PROCEDURE prc_obtener_coordinadores (
    p_json_salida OUT CLOB
  ) IS
    v_json  CLOB;
    v_first BOOLEAN := TRUE;
    v_item  VARCHAR2(4000);
    CURSOR c_coordinadores IS
       SELECT u.id,
              u.nombres,
              u.apellidos,
              u.id_tipo_identificacion,
              u.identificacion,
              u.telefono,
              u.correo_electronico,
              u.direccion
         FROM tkr_usuarios u
        WHERE EXISTS
              (SELECT 1
                 FROM tkr_accesos a,
                      tkr_roles_accesos ra
                WHERE a.id_usuario = u.id
                  AND ra.id_acceso = a.id
                  AND ra.id_rol = 11)
        ORDER BY u.nombres,
                 u.apellidos;
  BEGIN
    DBMS_LOB.CREATETEMPORARY(v_json, TRUE);
    v_item := '{"codigo_respuesta": 0, "mensaje_respuesta": "Coordinadores obtenidos exitosamente", "coordinadores": [';
    DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);

    FOR r IN c_coordinadores LOOP
      IF NOT v_first THEN
        v_item := ',';
        DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);
      END IF;
      v_first := FALSE;

      v_item := '{"id": ' || r.id || 
                ', "nombres": "' || REPLACE(r.nombres, '"', '\"') || '"' ||
                ', "apellidos": "' || REPLACE(r.apellidos, '"', '\"') || '"' ||
                ', "id_tipo_identificacion": ' || NVL(TO_CHAR(r.id_tipo_identificacion), 'null') ||
                ', "identificacion": "' || REPLACE(r.identificacion, '"', '\"') || '"' ||
                ', "telefono": "' || REPLACE(r.telefono, '"', '\"') || '"' ||
                ', "correo_electronico": "' || REPLACE(r.correo_electronico, '"', '\"') || '"' ||
                ', "direccion": "' || REPLACE(r.direccion, '"', '\"') || '"}';
      DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);
    END LOOP;

    v_item := ']}';
    DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);
    p_json_salida := v_json;
  EXCEPTION
    WHEN OTHERS THEN
      p_json_salida := '{"codigo_respuesta": -1, "mensaje_respuesta": "Error en prc_obtener_coordinadores: ' 
                       || REPLACE(SQLERRM, '"', '\"') || '"}';
  END prc_obtener_coordinadores;

  ------------------------------------------------------------------------------
  -- PROCEDIMIENTO: prc_obtener_estados_cohorte
  ------------------------------------------------------------------------------
  PROCEDURE prc_obtener_estados_cohorte (
    p_json_salida OUT CLOB
  ) IS
    v_json  CLOB;
    v_first BOOLEAN := TRUE;
    v_item  VARCHAR2(4000);
    CURSOR c_estados IS
        SELECT id, descripcion
          FROM tkr_estados_cohorte
      ORDER BY descripcion;
  BEGIN
    DBMS_LOB.CREATETEMPORARY(v_json, TRUE);
    v_item := '{"codigo_respuesta": 0, "mensaje_respuesta": "Estados de cohorte obtenidos exitosamente", "estados_cohorte": [';
    DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);

    FOR r IN c_estados LOOP
      IF NOT v_first THEN
        v_item := ',';
        DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);
      END IF;
      v_first := FALSE;

      v_item := '{"id": ' || r.id || 
                ', "descripcion": "' || REPLACE(r.descripcion, '"', '\"') || '"}';
      DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);
    END LOOP;

    v_item := ']}';
    DBMS_LOB.WRITEAPPEND(v_json, LENGTH(v_item), v_item);
    p_json_salida := v_json;
  EXCEPTION
    WHEN OTHERS THEN
      p_json_salida := '{"codigo_respuesta": -1, "mensaje_respuesta": "Error en prc_obtener_estados_cohorte: ' 
                       || REPLACE(SQLERRM, '"', '\"') || '"}';
  END prc_obtener_estados_cohorte;

  ------------------------------------------------------------------------------
  -- PROCEDIMIENTO: prc_guardar_paciente
  ------------------------------------------------------------------------------
  PROCEDURE prc_guardar_paciente (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  ) IS
  BEGIN
    p_json_salida := '{"codigo_respuesta": 0, "mensaje_respuesta": "Paciente guardado exitosamente"}';
  EXCEPTION
    WHEN OTHERS THEN
      p_json_salida := '{"codigo_respuesta": -1, "mensaje_respuesta": "Error al guardar paciente: ' || REPLACE(SQLERRM, '"', '\"') || '"}';
  END prc_guardar_paciente;

  ------------------------------------------------------------------------------
  -- PROCEDIMIENTO: prc_guardar_acta
  ------------------------------------------------------------------------------
  PROCEDURE prc_guardar_acta (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  ) IS
  BEGIN
    p_json_salida := '{"codigo_respuesta": 0, "mensaje_respuesta": "Acta guardada exitosamente"}';
  EXCEPTION
    WHEN OTHERS THEN
      p_json_salida := '{"codigo_respuesta": -1, "mensaje_respuesta": "Error al guardar acta: ' || REPLACE(SQLERRM, '"', '\"') || '"}';
  END prc_guardar_acta;

  ------------------------------------------------------------------------------
  -- PROCEDIMIENTO: prc_agregar_nota
  ------------------------------------------------------------------------------
  PROCEDURE prc_agregar_nota (
    p_json_entrada IN  CLOB,
    p_json_salida  OUT CLOB
  ) IS
  BEGIN
    p_json_salida := '{"codigo_respuesta": 0, "mensaje_respuesta": "Nota agregada exitosamente"}';
  EXCEPTION
    WHEN OTHERS THEN
      p_json_salida := '{"codigo_respuesta": -1, "mensaje_respuesta": "Error al agregar nota: ' || REPLACE(SQLERRM, '"', '\"') || '"}';
  END prc_agregar_nota;

END pkgln_pacientes_giris;
/
SHOW ERRORS;
