# Login TeKer (extraído de `apps/main`)

Login sin contraseña: **tipo + número de documento → código OTP de 4 dígitos (WhatsApp + correo) → sesión JWT en cookies**.

Los archivos en `src/` conservan la misma ruta que tienen en `apps/main`, así que los imports `@/...` apuntan a donde corresponde. Los archivos `*.extract.js` son solo recortes de archivos más grandes (`lib/staticData.js`, `lib/utils.js`).

Stack: Next.js 15 (App Router, JS), `oracledb` 6.8, `jose` (JWT HS256), Redux Toolkit, `react-hook-form`, `cookies-next`.

---

## 1. Flujo

```
/login  (components/routes/login/Content.js)
  │  form: idType + id
  ▼
userByIdentification({ idType, id, login: true })     ← server action (app/server-actions/auth/login.js)
  ├─ accessExists   → pkgln_accesos.f_existe_acceso            (¿existe el acceso?)
  ├─ getById        → pkgln_usuarios.p_existe_id_usuario        (solo si rol por defecto es null/3 o login=false)
  │                   + pkgca_tkr_accesos.f_json_x_id_usuario
  └─ sendCode       → pkgln_seguridad.p_generar_codigo_acceso   (genera y envía el OTP)
  │
  │  cliente: dispatch(setUserData(resp)); setCookie("tkr_usr_id", resp.accessData.id_usuario)
  ▼
/login/validar  (app/login/validar/page.js)
  │  PIN de 4 dígitos, contador de 90 s para reenviar
  │  reenviar → POST /api/user/code/generate { id: accessId } → sendCode
  ▼
loginAction({ roleId, accessId, id_usuario, id, idType, code })   ← server action
  └─ loginUser → pkgln_accesos.f_existe_acceso_clave  (valida el código y devuelve 3 CLOBs)
               + SELECT id_rol FROM tkr_roles_accesos WHERE id_acceso = :accessId
  │
  ├─ setSessionCookie({ ...usrData, ...rest }, rest.accessData.ID_USUARIO, roleId || 3)
  ├─ dispatch(updateUserData(rest))
  ├─ regLogAction(...) → pkgln_logs.p_registrar_log
  └─ router.push(`/app/${configByRole[roleId || 3].mainRoute}`)
```

Truco existente: si el número de documento termina en `t` (ej. `12345678t`), se quita la `t` y se llama con `login: false` → **no se envía OTP** y se devuelven los datos del usuario (`getById`). Ojo: esto expone datos personales solo con el número de documento; mejor no replicarlo.

---

## 2. Procedimientos Oracle

### 2.1 `pkgln_accesos.f_existe_acceso` — ¿existe el usuario?
Archivo: `src/lib/oracle-db/pl-sql/general/accessExists.js`

```sql
BEGIN :res := pkgln_accesos.f_existe_acceso(:idType, :id, :CLOBres); END;
```

| Bind      | Dir | Tipo   | Nota                                      |
|-----------|-----|--------|-------------------------------------------|
| `res`     | OUT | NUMBER | `0` = no existe → `"No tiene acceso"`     |
| `idType`  | IN  | NUMBER | id de tipo de documento (ver §5)          |
| `id`      | IN  | STRING | número de documento                       |
| `CLOBres` | OUT | CLOB   | JSON del acceso (**keys en minúscula**)   |

JSON de `CLOBres` → se renombra así:
- `id` → `accessId`
- `id_rol_defecto` → `roleId`
- el resto se pasa tal cual (se usan: `id_usuario`, `telefono`, `correo`).

### 2.2 `pkgln_seguridad.p_generar_codigo_acceso` — enviar OTP
Archivo: `src/lib/oracle-db/pl-sql/general/sendCode.js`

```sql
BEGIN pkgln_seguridad.p_generar_codigo_acceso(:accessId, :errorCode, :errorMsg); END;
```

| Bind        | Dir | Tipo   |
|-------------|-----|--------|
| `accessId`  | IN  | NUMBER |
| `errorCode` | OUT | NUMBER (`0` = ok) |
| `errorMsg`  | OUT | STRING |

### 2.3 `pkgln_accesos.f_existe_acceso_clave` — validar OTP y traer datos
Archivo: `src/lib/oracle-db/pl-sql/dashboard/login.js`

```sql
BEGIN
  :res := pkgln_accesos.f_existe_acceso_clave(
    :accessId, :code, :roleId, :CLOBaccess, :CLOBuser, :CLOBpartner
  );
END;
```

| Bind          | Dir | Tipo   | Nota                                          |
|---------------|-----|--------|-----------------------------------------------|
| `res`         | OUT | NUMBER | `0` = código incorrecto → `"Acceso y clave incorrectos"` |
| `accessId`    | IN  | NUMBER |                                               |
| `code`        | IN  | NUMBER | el PIN (se envía como número)                 |
| `roleId`      | IN  | NUMBER | `roleId || 3`                                 |
| `CLOBaccess`  | OUT | CLOB   | JSON acceso (**keys en MAYÚSCULA**)           |
| `CLOBuser`    | OUT | CLOB   | JSON usuario (**keys en MAYÚSCULA**)          |
| `CLOBpartner` | OUT | CLOB   | JSON array; se toma `[0]`                     |

Además: `SELECT id_rol FROM tkr_roles_accesos WHERE id_acceso = :accessId` → lista de roles del acceso (se filtran 7 y 8).

### 2.4 `pkgln_usuarios.p_existe_id_usuario` + `pkgca_tkr_accesos.f_json_x_id_usuario`
Archivo: `src/lib/oracle-db/pl-sql/user/getById.js` — datos del paciente (rol 3) en el primer paso.

```sql
BEGIN
  pkgln_usuarios.p_existe_id_usuario(
    :userId, 'N', :userCLOB, :exists, :paymentDataExists,
    :paymentDataCLOB, :pendingCLOB, :errorCode, :errorMsg
  );
  :accessRow := pkgca_tkr_accesos.f_json_x_id_usuario(:userId);
END;
```

### 2.5 `pkgln_logs.p_registrar_log` — log de ingreso
Archivo: `src/lib/oracle-db/pl-sql/general/registerLog.js`

```sql
BEGIN pkgln_logs.p_registrar_log(:data, :errorCode, :errorMsg); END;
```
`data` = `JSON.stringify({ id_log_medicion, id_acceso, id_usuario, id_aplicacion })`.

`id_log_medicion` por rol (en `app/login/validar/page.js`):

| roleId | id_log_medicion | Título                      |
|--------|-----------------|-----------------------------|
| 2      | 5               | Ingreso Coordinador         |
| 3      | 3               | Ingreso Paciente            |
| 4      | 4               | Ingreso Profesional         |
| 7      | 6               | Ingreso Coordinador Aliado  |
| 8      | 7               | Ingreso Administrador Aliado|
| 9      | 9               | Ingreso Corredor            |
| 11     | 11              | Ingreso Coordinador Riesgo  |
| 12     | 12              | Ingreso Coordinador Riesgo (así está en el código; es el coordinador médico) |

`id_aplicacion` = `configByRole[roleId].appId` (ver §4).

---

## 3. Forma de los datos (keys)

⚠️ Ojo con mayúsculas/minúsculas: el **primer paso** usa keys en minúscula (`id_usuario`), el **segundo paso** devuelve keys en MAYÚSCULA (`ID_USUARIO`).

### Respuesta de `userByIdentification` (queda en Redux `userData.usrData`)
```js
{
  accessData: { roleId, accessId, id_usuario, telefono, correo, ... },
  // solo si rol por defecto es null/3 (getById):
  accessId, idType, idTitle, id, email, name, lastName, phoneNumber,
  address, department, city, cityId, rawUser, pending, paymentData,
  exists, paymentDataExists,
  errorCode: 0, errorMsg: null
}
```

### Respuesta de `loginAction` (`loginUser`)
```js
{
  accessData: {
    accessId,          // ← CLOBaccess.ID
    roleId,            // ← CLOBaccess.ID_ROL_DEFECTO
    code,
    roles: [{ id_rol }],
    ID_USUARIO, ...    // resto de CLOBaccess
  },
  userData: {
    ID, NOMBRES, APELLIDOS, FECHA_NACIMIENTO, USUARIO, ID_CIUDAD_RESIDENCIA,
    DIRECCION, CORREO_ELECTRONICO, ID_PRESTADOR_SALUD, ID_GENERO,
    ID_TIPO_IDENTIFICACION, IDENTIFICACION, ID_REGIMEN_ASEGURAMIENTO, ID_MEDIO,
    REGIMEN_SIMPLE, ID_PAIS, TELEFONO, SISBEN, ETNIA,
    FECHA_EXPEDICION_IDENTIFICACION, ID_ESTADO_CIVIL, ID_OCUPACION,
    // solo rol 4 (profesional):
    ESPECIALIDADES, ESTADO_CAPACITACION
  },
  partnerData,         // CLOBpartner[0]
  errorCode: 0
}
```

### Convención de errores
Todas las server actions devuelven `{ errorCode, errorMsg }`: `0` = ok, `1` = error de negocio, `-1` = error de conexión/Oracle (lo pone `WithDatabase`, con `errorDetails: { code, offset }`).

---

## 4. Sesión y cookies

Archivo: `src/app/server-actions/auth/encryption.js`

| Cookie            | Valor                              | httpOnly | Uso |
|-------------------|------------------------------------|----------|-----|
| `tkr_usr_session` | JWT HS256 firmado con `JWT_SECRET`, payload = `{ ...usrData, ...loginResult }` | sí | sesión |
| `tkr_usr_role`    | `roleId`                           | sí | middleware decide ruta |
| `tkr_usr_id`      | `ID_USUARIO` (se setea también en cliente en el paso 1 con `id_usuario`) | sí* | |
| `tkr_has_session` | `"1"`                              | no | el cliente sabe si hay sesión |

- `maxAge`: 1 h si `NEXT_PUBLIC_ENVIRONMENT` ∈ `production | demo | stage`; 1 año en otro caso.
- `secure` solo en esos entornos, `sameSite: "lax"`.
- Logout = `deleteCookie(["tkr_usr_session","tkr_usr_role","tkr_usr_id","tkr_has_session"])` → `/login`.
- `hooks/useSessionRefresh.js`: renueva la cookie cada 5 min con actividad y cierra sesión tras 30 min de inactividad.

### `middleware.js`
- Rutas `/app/<mainRoute>/...` exigen `tkr_usr_session`; si no, redirige a `/login`.
- El `mainRoute` debe coincidir con `configByRole[tkr_usr_role].mainRoute` y el sub-segmento debe estar en `routes`.
- Si ya hay sesión y se entra a `/login`, redirige al dashboard.
- Rate limit en memoria: 20 req/min por IP en `/login*` (por instancia, best-effort).

### Roles (`configByRole`, ver `src/lib/staticData.extract.js`)

| roleId | userType | appId | mainRoute            |
|--------|----------|-------|----------------------|
| 2      | CT       | 6     | coordinador          |
| 3      | P        | 1     | paciente             |
| 4      | M        | 2     | profesional          |
| 7      | E (AC)   | 3     | aliado               |
| 8      | E (AA)   | 4     | aliado               |
| 9      | C        | 5     | corredor             |
| 11     | CR       | 7     | coordinador-riesgo   |
| 12     | CM       | 8     | coordinador-medico   |

---

## 5. Tipos de documento (`idTypes`, Colombia `countryId = 1`)

| id | code | título |
|----|------|--------|
| 4  | CC   | Cédula de Ciudadanía |
| 6  | CE   | Cédula de Extranjería |
| 1  | NUIP | Número Único de Identificación Personal |
| 5  | PA   | Pasaporte |
| 2  | RC   | Registro Civil |
| 3  | TI   | Tarjeta de Identidad |
| 7  | NIT  | Número de Identificación Tributaria |
| 8  | PPT  | Permiso por Protección Temporal |
| 9  | PEP  | Permiso Especial de Permanencia |

México (`countryId = 3`): `-1` CURP, `-2` INE, `-3` LC.

Validación del número en el form: `/^[A-Z0-9]+$/i`, 5–16 caracteres.

---

## 6. Variables de entorno

```
DB_USER=
DB_PASSWORD=
DEV_DB_CONNECTION_STRING=
PROD_DB_CONNECTION_STRING=      # se usa si NEXT_PUBLIC_ENVIRONMENT es production|demo
NEXT_PUBLIC_ENVIRONMENT=        # production | demo | stage | development
JWT_SECRET=                     # debe ser el mismo si se quiere compartir sesión entre apps
```

---

## 7. Pendiente / notas

- El bloqueo por intentos fallidos (`lib/auth/loginSecurity.js`, `tkr_intentos_acceso`, `tkr_bloqueo_temporal`) está **comentado** en `login.js` y `route.js`: depende de un patch de BD que backend aún no ha aplicado (ticket CTR-EIPD-0178). Se incluye `loginSecurity.js` solo como referencia.
- `pkgln_seguridad` (bloqueo manual) tampoco está conectado al login.
- Componentes de UI que no se incluyen (`Select`, `Input`, `Button`, toast, `tkrAxiosInstance`) son genéricos; se pueden reemplazar por los propios.
