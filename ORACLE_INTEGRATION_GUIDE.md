# Guía de Conexión a Oracle Database y Despliegue en Vercel

Este proyecto está configurado y optimizado para funcionar inicialmente con **datos dummy** en el panel cliente de React (Vite + Tailwind v4) y poder conectarse a una **Base de Datos Oracle** desplegada en **Vercel** sin cambiar los componentes de UI.

---

## 1. Arquitectura de Conexión

Debido a que el navegador web (React SPA) no se conecta directamente a Oracle por razones de seguridad y protocolos TCP, la conexión se realiza a través de **Vercel Serverless Functions** (`/api/*`).

```
[ Panel React (Vite) ]  ---> HTTP (JSON) ---> [ Vercel API /api/patients ] ---> [ Oracle DB ]
                                                                             (Procedimientos / Funciones)
```

---

## 2. Pasos para Configurar Oracle Database

Cuando tengas listos los procedimientos o funciones almacenadas de tu base de datos Oracle:

### Paso A: Proporcionar los nombres de procedimientos/funciones
Indica la estructura de los procedimientos o funciones de Oracle, por ejemplo:
- Procedimiento para obtener pacientes: `SP_OBTENER_PACIENTES(p_cohorte IN VARCHAR2, p_cursor OUT SYS_REFCURSOR)`
- Procedimiento para actualizar paciente: `SP_ACTUALIZAR_PACIENTE(...)`
- Función para obtener historial: `FN_OBTENER_NOTAS_PACIENTE(p_id IN VARCHAR2) RETURN CLOB`

### Paso B: Variables de Entorno en Vercel
En el panel de Vercel (Project Settings > Environment Variables), agrega:
```env
ORACLE_USER=tu_usuario
ORACLE_PASSWORD=tu_contrasena
ORACLE_CONNECT_STRING=tu_host:1521/tu_servicio_o_sid
```

---

## 3. Estructura de Archivos Creada

- **`src/services/patientService.ts`**: Capa de abstracción de datos. En el futuro, reemplazará los datos dummy llamando a `fetch('/api/patients')`.
- **`vercel.json`**: Configuración de enrutamiento SPA y endpoints de API en Vercel.
- **`api/oracle-config.ts`**: Plantilla de configuración para el driver de Oracle (`oracledb`).

---

## 4. Despliegue en Vercel

1. Sube este repositorio a GitHub / GitLab.
2. Importa el proyecto en [Vercel](https://vercel.com).
3. Vercel detectará la configuración de Vite (`npm run build`, carpeta de salida `dist`).
4. ¡El panel estará en producción inmediatamente!
