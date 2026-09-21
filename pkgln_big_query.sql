/*******************************************************************************
  PAQUETE: pkgln_big_query
  DESCRIPCION: Paquete de Lógica de Negocio e Integración para consultas 360° a
               servicios analíticos de BigQuery / API REST externa Teker.
               Realiza peticiones HTTP autenticadas y entrega el resultado en CLOB.
*******************************************************************************/

-- =============================================================================
-- ESPECIFICACION DEL PAQUETE (PACKAGE SPEC)
-- =============================================================================
CREATE OR REPLACE PACKAGE pkgln_big_query AS
    /*****************************************************************************
      PROCEDIMIENTO: p_datos_usuario_cohorte
      DESCRIPCION: Invoca el endpoint especificado en p_json_entrada para un paciente
                   ($.metodo y $.identificacion) y retorna la respuesta en p_json_salida.
    *****************************************************************************/
    PROCEDURE p_datos_usuario_cohorte (
        p_json_entrada IN  CLOB,
        p_json_salida  OUT CLOB
    );
END pkgln_big_query;
/

-- =============================================================================
-- CUERPO DEL PAQUETE (PACKAGE BODY)
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY pkgln_big_query
AS
    PROCEDURE p_datos_usuario_cohorte (p_json_entrada IN CLOB, p_json_salida OUT CLOB)
    IS
        vro_parametro       tkr_parametros%ROWTYPE;
        vro_parametro_url   tkr_parametros%ROWTYPE;
        v_identificacion    VARCHAR2 (1000);
        v_url               VARCHAR2 (4000);
        v_metodo            VARCHAR2 (4000);
        v_cadena            VARCHAR2 (4000);
        v_request           UTL_HTTP.req;
        v_response          UTL_HTTP.resp;
        v_buffer            VARCHAR2 (32767);
        v_amount            PLS_INTEGER := 32767;
        v_cod_error         NUMBER := 0;
        v_mensaje_error     VARCHAR2 (1000);
    BEGIN
        v_identificacion := json_value (p_json_entrada, '$.identificacion');
        v_metodo := json_value (p_json_entrada, '$.metodo');
        v_cadena := REPLACE (v_metodo, '{id}', v_identificacion);

        IF pkgtkr_parametros_dao.f_existe (-140, vro_parametro_url) = FALSE
        THEN
            v_cod_error := 10;
            v_mensaje_error := 'No encontró URL para el api de BigQuery de pacientes 360';
        ELSIF pkgtkr_parametros_dao.f_existe (-134, vro_parametro) = FALSE
        THEN
            v_cod_error := 20;
            v_mensaje_error := 'No encontró clave para el api de BigQuery';
        ELSE
            -- Construcción dinámica de la URL
            v_url := vro_parametro_url.valor_parametro || v_cadena;

            -- Iniciar la petición HTTP
            v_request := UTL_HTTP.begin_request (url => v_url, method => 'GET', http_version => UTL_HTTP.http_version_1_1);
            dbms_output.put_line('Url: ' || v_url);

            -- Agregar la cabecera con la API Key y aceptación JSON
            UTL_HTTP.set_header (v_request, 'X-API-Key', 'vYv3UmlPffKl40iP9WlqVWLbeCTOhkuLimAmZ6WlVD4');
            UTL_HTTP.set_header (v_request, 'Accept', 'application/json');

            -- Obtener la respuesta del servidor remoto
            v_response := UTL_HTTP.get_response (v_request);

            -- Configurar charset UTF-8 explícito para decodificar caracteres acentuados y especiales (evita mojibake ISO-8859-1)
            UTL_HTTP.set_body_charset (v_response, 'UTF-8');

            -- Escribir directamente en p_json_salida
            DBMS_LOB.createtemporary (p_json_salida, TRUE);

            BEGIN
                LOOP
                    UTL_HTTP.read_text (v_response, v_buffer, v_amount);
                    DBMS_LOB.writeappend (p_json_salida, LENGTH (v_buffer), v_buffer);
                END LOOP;
            EXCEPTION
                WHEN UTL_HTTP.end_of_body
                THEN
                    NULL;
            END;

            -- Cerrar la respuesta y liberar recursos
            UTL_HTTP.end_response (v_response);

            DBMS_OUTPUT.put_line ('Status HTTP: ' || v_response.status_code);
            DBMS_OUTPUT.put_line ('Respuesta: ' || DBMS_LOB.SUBSTR (p_json_salida, 4000, 1));
        END IF;

        IF v_cod_error <> 0 THEN
            p_json_salida := '{"codigo_error":' || v_cod_error || ',"mensaje_error":"' || v_mensaje_error || '"}';
        END IF;
    EXCEPTION
        WHEN OTHERS
        THEN
            DBMS_OUTPUT.put_line ('Error: ' || SQLERRM);
            BEGIN
                UTL_HTTP.end_response (v_response);
            EXCEPTION
                WHEN OTHERS THEN NULL;
            END;
            p_json_salida := '{"codigo_error":-1,"mensaje_error":"' || REPLACE(SQLERRM, '"', '\"') || '"}';
    END p_datos_usuario_cohorte;
END pkgln_big_query;
/
