export interface DocumentTypeOption {
  id: number;
  value: number;
  title: string;
  code: string;
  countryId: number;
}

export const COLOMBIA_DOC_TYPES: DocumentTypeOption[] = [
  { id: 4, value: 4, title: 'Cédula de Ciudadanía', code: 'CC', countryId: 1 },
  { id: 6, value: 6, title: 'Cédula de Extranjería', code: 'CE', countryId: 1 },
  { id: 1, value: 1, title: 'Número Único de Identificación Personal', code: 'NUIP', countryId: 1 },
  { id: 5, value: 5, title: 'Pasaporte', code: 'PA', countryId: 1 },
  { id: 2, value: 2, title: 'Registro Civil', code: 'RC', countryId: 1 },
  { id: 3, value: 3, title: 'Tarjeta de Identidad', code: 'TI', countryId: 1 },
  { id: 7, value: 7, title: 'Número de Identificación Tributaria', code: 'NIT', countryId: 1 },
  { id: 8, value: 8, title: 'Permiso por Protección Temporal', code: 'PPT', countryId: 1 },
  { id: 9, value: 9, title: 'Permiso Especial de Permanencia', code: 'PEP', countryId: 1 },
];

export interface AuthUser {
  id_usuario: number;
  identificacion: string;
  tipo_identificacion: number | string;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  roles: number[];
  roleId: number;
  accessId?: number;
}

export interface SendCodeResult {
  success: boolean;
  accessId?: number;
  roleId?: number;
  maskedPhone?: string;
  maskedEmail?: string;
  devNotice?: string;
  error?: string;
}

export interface VerifyCodeResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}
