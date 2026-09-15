import React, { useState, useEffect, useMemo } from 'react';
import { Patient, CuadroMedicoItem, UserRole, ProfesionalEquipoMedico } from '../types';
import {
  X,
  Users,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Search,
  Copy,
  Check,
  Stethoscope,
  BadgeCheck,
  User,
  Hash,
  Database,
  Lock,
  Edit3,
  Plus,
  Trash2,
  Save,
  ExternalLink,
} from 'lucide-react';
import { PatientService } from '../services/patientService';
import CUADRO_MEDICO_DATA from '../data/cuadroMedicoData.json';

interface CuadroMedicoDrawerProps {
  patient: Patient;
  activeRole: UserRole;
  onSaveCuadroMedico?: (patientId: string, updatedItems: CuadroMedicoItem[]) => void;
  onClose: () => void;
}

// Extract the specialties and directory for manual fallback/committee edition
const SPECIALTY_OPTIONS = CUADRO_MEDICO_DATA.map((item) => item.specialty);
const PROFESSIONAL_DIRECTORY: Record<string, { specialty: string; phone: string }> = {};
CUADRO_MEDICO_DATA.forEach((specItem) => {
  specItem.professionals.forEach((prof) => {
    PROFESSIONAL_DIRECTORY[prof.name] = {
      specialty: specItem.specialty,
      phone: prof.phone,
    };
  });
});

export const CuadroMedicoDrawer: React.FC<CuadroMedicoDrawerProps> = ({
  patient,
  activeRole,
  onSaveCuadroMedico,
  onClose,
}) => {
  const isComite = activeRole === 'comite_medico';
  const [activeTab, setActiveTab] = useState<'bd_asignado' | 'manual_comite'>('bd_asignado');

  // Real Database state (pkgcn_citas.p_equipo_medico_paciente)
  const [profesionales, setProfesionales] = useState<ProfesionalEquipoMedico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  // Manual edition state (for comite_medico if needed)
  const [items, setItems] = useState<CuadroMedicoItem[]>(patient.cuadroMedico || []);
  const [hasSaved, setHasSaved] = useState(false);

  // Load medical team from Oracle
  const fetchEquipoMedico = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PatientService.getEquipoMedico(patient.id);
      setProfesionales(data || []);
    } catch (err: any) {
      console.error('[CuadroMedicoDrawer] Error fetching equipo médico:', err);
      setError('No fue posible cargar el cuadro médico asignado desde la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipoMedico();
  }, [patient.id]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filter professionals by search
  const filteredProfesionales = useMemo(() => {
    if (!searchTerm.trim()) return profesionales;
    const term = searchTerm.toLowerCase();
    return profesionales.filter((p) => {
      const nameMatch = p.profesional?.toLowerCase().includes(term);
      const idMatch = p.profesional_id?.toLowerCase().includes(term);
      const userMatch = p.usuario?.toLowerCase().includes(term);
      const rmMatch = p.registro_medico?.toLowerCase().includes(term);
      const specMatch = p.especialidad?.some((e) =>
        e.nombre_especialidad?.toLowerCase().includes(term)
      );
      return nameMatch || idMatch || userMatch || rmMatch || specMatch;
    });
  }, [profesionales, searchTerm]);

  // Helpers for manual committee edition
  const getProfessionalsForSpecialty = (specialtyName: string) => {
    const found = CUADRO_MEDICO_DATA.find(
      (s) => s.specialty.toLowerCase() === specialtyName.toLowerCase()
    );
    if (found) return found.professionals;
    return CUADRO_MEDICO_DATA.flatMap((s) => s.professionals);
  };

  const handleSpecialtyChange = (id: string, newSpecialty: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const profs = getProfessionalsForSpecialty(newSpecialty);
        const profExists = profs.some((p) => p.name === item.professional);
        const newProf = profExists ? item.professional : (profs[0]?.name || '');
        const newPhone = PROFESSIONAL_DIRECTORY[newProf]?.phone || (profs[0]?.phone || '');

        return {
          ...item,
          specialty: newSpecialty,
          professional: newProf,
          phone: newPhone,
        };
      })
    );
    setHasSaved(false);
  };

  const handleProfessionalChange = (id: string, newProf: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const directoryMatch = PROFESSIONAL_DIRECTORY[newProf];
        return {
          ...item,
          professional: newProf,
          specialty: directoryMatch ? directoryMatch.specialty : item.specialty,
          phone: directoryMatch ? directoryMatch.phone : item.phone,
        };
      })
    );
    setHasSaved(false);
  };

  const handleItemChange = (id: string, field: keyof CuadroMedicoItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
    setHasSaved(false);
  };

  const handleAddItem = () => {
    const defaultSpec = 'Medicina General';
    const profs = getProfessionalsForSpecialty(defaultSpec);
    const newItem: CuadroMedicoItem = {
      id: `cm-${Date.now()}`,
      specialty: defaultSpec,
      professional: profs[0]?.name || '',
      inNetwork: true,
      phone: profs[0]?.phone || '',
    };
    setItems((prev) => [...prev, newItem]);
    setHasSaved(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setHasSaved(false);
  };

  const handleSaveManual = () => {
    if (onSaveCuadroMedico) {
      onSaveCuadroMedico(patient.id, items);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-[#e2e8eb] dark:border-[#334155] animate-in slide-in-from-right duration-250">
        
        {/* Header Superior */}
        <div className="bg-gradient-to-r from-[#035476] via-[#00aae1] to-[#0196d4] text-white p-4.5 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight leading-tight">
                    Cuadro Médico Asignado
                  </h3>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" />
                    pkgcn_citas
                  </span>
                </div>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  {patient.nombre}
                  {patient.identificacion && (
                    <span className="opacity-75 font-mono ml-1.5">({patient.identificacion})</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contexto Rápido del Paciente */}
          <div className="mt-3 pt-2.5 border-t border-white/20 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-white/90">
              <ShieldCheck className="w-3.5 h-3.5 text-white/75 shrink-0" />
              <span className="truncate" title={patient.convenioNombre || 'Sin Convenio'}>
                {patient.convenioNombre || 'Sin Convenio'}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-white/90 font-mono text-[10px]">
              <Hash className="w-3.5 h-3.5 text-white/75 shrink-0" />
              <span>ID Usuario: {patient.id}</span>
            </div>
          </div>
        </div>

        {/* Barra de Pestañas (Asignado en BD vs Configuración Manual) */}
        {isComite && (
          <div className="flex items-center border-b border-[#e2e8eb] dark:border-[#334155] bg-gray-50 dark:bg-[#0f172a] px-3 pt-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('bd_asignado')}
              className={`pb-2 px-3 font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'bd_asignado'
                  ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Equipo Asignado BD ({profesionales.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual_comite')}
              className={`pb-2 px-3 font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'manual_comite'
                  ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Configuración Comité ({items.length})</span>
            </button>
          </div>
        )}

        {/* Vista 1: Equipo Médico Asignado en BD (pkgcn_citas.p_equipo_medico_paciente) */}
        {activeTab === 'bd_asignado' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] dark:bg-[#0f172a]">
            {/* Controles de Búsqueda y Actualización */}
            <div className="p-3.5 border-b border-[#e2e8eb] dark:border-[#334155] bg-white dark:bg-[#1e293b] flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por médico, especialidad, documento o registro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-lg text-[#033d59] dark:text-[#f8fafc] placeholder-gray-400 focus:outline-none focus:border-[#00aae1] focus:ring-1 focus:ring-[#00aae1]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={fetchEquipoMedico}
                disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#035476] dark:text-[#38bdf8] bg-[#effaff] dark:bg-[#00aae1]/10 hover:bg-[#dbeafe] dark:hover:bg-[#00aae1]/20 border border-[#00aae1]/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Actualizar datos desde Oracle"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00aae1]' : ''}`} />
                <span className="hidden sm:inline">Refrescar</span>
              </button>
            </div>

            {/* Listado de Médicos */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
              {loading ? (
                // Skeletons de Carga
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-md w-1/3" />
                      <div className="h-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                // Estado de Error
                <div className="p-6 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl my-4">
                  <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-2">{error}</p>
                  <button
                    type="button"
                    onClick={fetchEquipoMedico}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Reintentar Conexión
                  </button>
                </div>
              ) : filteredProfesionales.length === 0 ? (
                // Estado Vacío
                <div className="p-8 text-center bg-white dark:bg-[#1e293b] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl my-4 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#effaff] dark:bg-[#00aae1]/10 flex items-center justify-center text-[#00aae1]">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#033d59] dark:text-[#f8fafc]">
                      {searchTerm ? 'No hay resultados para la búsqueda' : 'Sin profesionales asignados'}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      {searchTerm
                        ? `No se encontraron coincidencias para "${searchTerm}".`
                        : `El procedimiento pkgcn_citas.p_equipo_medico_paciente retornó una lista vacía para el paciente con ID ${patient.id}.`}
                    </p>
                  </div>
                  {!searchTerm && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">
                        <Database className="w-3 h-3 text-[#00aae1]" />
                        v_id_usuario := {patient.id}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                // Listado de Tarjetas de Profesionales
                filteredProfesionales.map((prof) => {
                  const hasValidImg = prof.url_foto_profesional && !imgErrors[prof.id_profesional];
                  const initials = prof.profesional
                    ? prof.profesional
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                    : 'MD';

                  return (
                    <div
                      key={prof.id_profesional}
                      className="bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] hover:border-[#00aae1]/60 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 group relative"
                    >
                      {/* Fila Superior: Foto + Datos Principales */}
                      <div className="flex items-start gap-3.5">
                        {/* Foto de Perfil con Fallback */}
                        <div className="relative shrink-0">
                          {hasValidImg ? (
                            <img
                              src={prof.url_foto_profesional}
                              alt={prof.profesional}
                              className="w-13 h-13 rounded-full object-cover border-2 border-[#00aae1]/30 shadow-xs"
                              onError={() =>
                                setImgErrors((prev) => ({ ...prev, [prof.id_profesional]: true }))
                              }
                            />
                          ) : (
                            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#00aae1] to-[#035476] flex items-center justify-center text-white font-bold text-sm border-2 border-white/50 shadow-xs">
                              {initials || <User className="w-6 h-6 text-white" />}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#01ae6c] border-2 border-white dark:border-[#1e293b]" title="Profesional Activo" />
                        </div>

                        {/* Nombre y Documento */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-extrabold text-sm text-[#033d59] dark:text-[#f8fafc] group-hover:text-[#00aae1] transition-colors truncate">
                              {prof.profesional}
                            </h4>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ebfef4] dark:bg-[#01ae6c]/15 text-[#01ae6c] border border-[#01ae6c]/30 shrink-0">
                              <BadgeCheck className="w-3 h-3" />
                              Asignado
                            </span>
                          </div>

                          {/* Identificación y Registro Médico */}
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#035476] dark:text-gray-300">
                            {prof.profesional_id && (
                              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                                {prof.profesional_id}
                              </span>
                            )}
                            {prof.registro_medico && (
                              <span className="font-mono bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 px-1.5 py-0.5 rounded text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                                RM: {prof.registro_medico}
                              </span>
                            )}
                            {prof.usuario && (
                              prof.url_perfil ? (
                                <a
                                  href={prof.url_perfil}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#00aae1] hover:text-[#0284c7] dark:text-[#38bdf8] dark:hover:text-[#7dd3fc] hover:underline transition-colors cursor-pointer"
                                  title={`Ver perfil de ${prof.usuario.replace(/^@/, '')}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>{prof.usuario.replace(/^@/, '')}</span>
                                  <ExternalLink className="w-3 h-3 opacity-75 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {prof.usuario.replace(/^@/, '')}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Especialidades Asignadas */}
                      {Array.isArray(prof.especialidad) && prof.especialidad.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mr-1 flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" />
                            Especialidad:
                          </span>
                          {prof.especialidad.map((esp) => (
                            <span
                              key={esp.id || esp.nombre_especialidad}
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${
                                esp.tipo_especialidad === 'S'
                                  ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
                                  : esp.tipo_especialidad === 'E'
                                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                                  : 'bg-[#effaff] dark:bg-[#00aae1]/10 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]/25'
                              }`}
                            >
                              <span>{esp.nombre_especialidad}</span>
                              {esp.tipo_especialidad === 'S' && (
                                <span className="text-[9px] opacity-75 font-normal">
                                  (Subespecialidad)
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Barra de Contacto Directo */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 grid grid-cols-2 gap-2 text-xs">
                        {/* Teléfono */}
                        {prof.profesional_tel ? (
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                            <a
                              href={`tel:${prof.profesional_tel}`}
                              className="flex items-center gap-1.5 text-[#033d59] dark:text-[#f8fafc] font-mono text-[11px] font-semibold hover:text-[#00aae1] truncate"
                              title={`Llamar a ${prof.profesional_tel}`}
                            >
                              <Phone className="w-3.5 h-3.5 text-[#00aae1] shrink-0" />
                              <span className="truncate">{prof.profesional_tel}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(prof.profesional_tel, `tel-${prof.id_profesional}`)}
                              className="text-gray-400 hover:text-gray-600 p-0.5 ml-1"
                              title="Copiar teléfono"
                            >
                              {copiedId === `tel-${prof.id_profesional}` ? (
                                <Check className="w-3.5 h-3.5 text-[#01ae6c]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] p-1.5 px-2">
                            <Phone className="w-3.5 h-3.5 opacity-50" />
                            <span>Sin teléfono</span>
                          </div>
                        )}

                        {/* Email */}
                        {prof.profesional_email ? (
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                            <a
                              href={`mailto:${prof.profesional_email}`}
                              className="flex items-center gap-1.5 text-[#033d59] dark:text-[#f8fafc] text-[11px] font-medium hover:text-[#00aae1] truncate"
                              title={`Enviar correo a ${prof.profesional_email}`}
                            >
                              <Mail className="w-3.5 h-3.5 text-[#00aae1] shrink-0" />
                              <span className="truncate">{prof.profesional_email}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(prof.profesional_email, `mail-${prof.id_profesional}`)}
                              className="text-gray-400 hover:text-gray-600 p-0.5 ml-1"
                              title="Copiar correo"
                            >
                              {copiedId === `mail-${prof.id_profesional}` ? (
                                <Check className="w-3.5 h-3.5 text-[#01ae6c]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] p-1.5 px-2">
                            <Mail className="w-3.5 h-3.5 opacity-50" />
                            <span>Sin correo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Vista 2: Configuración Manual (Comité Médico) */}
        {activeTab === 'manual_comite' && isComite && (
          <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-[#033d59] dark:text-[#f8fafc]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#033d59] dark:text-[#f8fafc] uppercase tracking-wide">
                Configuración Manual ({items.length})
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[11px] font-bold text-[#00aae1] dark:text-[#38bdf8] hover:text-[#0196d4] bg-[#effaff] dark:bg-[#00aae1]/10 px-2.5 py-1 rounded-lg border border-[#00aae1]/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Profesional</span>
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 py-6 text-center italic">
                No hay profesionales registrados manualmente.
              </p>
            ) : (
              items.map((item) => {
                const availableProfessionals = getProfessionalsForSpecialty(item.specialty);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-xl space-y-2.5 shadow-2xs"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-0.5">
                          Especialidad *
                        </label>
                        <select
                          value={item.specialty}
                          onChange={(e) => handleSpecialtyChange(item.id, e.target.value)}
                          className="w-full text-xs p-1.5 bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded text-[#033d59] dark:text-[#f8fafc] font-medium"
                        >
                          {SPECIALTY_OPTIONS.map((spec) => (
                            <option key={spec} value={spec}>
                              {spec}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-0.5">
                          Profesional *
                        </label>
                        <select
                          value={item.professional}
                          onChange={(e) => handleProfessionalChange(item.id, e.target.value)}
                          className="w-full text-xs p-1.5 bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded text-[#033d59] dark:text-[#f8fafc] font-bold"
                        >
                          {availableProfessionals.map((prof) => (
                            <option key={prof.name} value={prof.name}>
                              {prof.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-end pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-0.5">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={item.phone || ''}
                          onChange={(e) => handleItemChange(item.id, 'phone', e.target.value)}
                          className="w-full text-xs p-1.5 bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded text-[#033d59] dark:text-[#f8fafc] font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleItemChange(item.id, 'inNetwork', !item.inNetwork)}
                          className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1 cursor-pointer ${
                            item.inNetwork
                              ? 'bg-[#ebfef4] text-[#01ae6c] border-[#01ae6c]/30'
                              : 'bg-rose-50 text-rose-600 border-rose-200'
                          }`}
                        >
                          {item.inNetwork ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          <span>{item.inNetwork ? 'Dentro Red' : 'Fuera Red'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer Inferior */}
        <div className="p-3.5 bg-white dark:bg-[#1e293b] border-t border-[#e2e8eb] dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              {activeTab === 'bd_asignado' ? (
                <span>
                  Total Asignados:{' '}
                  <strong className="text-[#00aae1] dark:text-[#38bdf8] font-bold">
                    {profesionales.length}
                  </strong>
                </span>
              ) : (
                <span>
                  Total Registros: <strong>{items.length}</strong>
                </span>
              )}
            </span>
            {hasSaved && (
              <span className="text-xs font-bold text-[#01ae6c] flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Cambios guardados!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-[#035476] dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            {activeTab === 'manual_comite' && isComite && (
              <button
                type="button"
                onClick={handleSaveManual}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
