import React, { useState, useMemo } from 'react';
import { SpecialistInfo, SpecialistKey, Patient } from '../types';
import { X, Calendar, User, Clock, Save, ClipboardList, PanelRightClose, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

interface SpecialistEditModalProps {
  patient: Patient;
  specialistKey: SpecialistKey;
  specialistData: SpecialistInfo;
  onSave: (patientId: string, specialistKey: SpecialistKey, updatedInfo: SpecialistInfo) => void;
  onClose: () => void;
}

export const SpecialistEditModal: React.FC<SpecialistEditModalProps> = ({
  patient,
  specialistKey,
  specialistData,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<SpecialistInfo>({ ...specialistData });
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(patient.id, specialistKey, formData);
  };

  const parseDateStringToTimestamp = (str: string): number => {
    if (!str || typeof str !== 'string') return 0;
    const s = str.trim().toLowerCase();

    const stdDate = Date.parse(str);
    if (!isNaN(stdDate)) {
      return stdDate;
    }

    const monthsEs: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
      ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11
    };

    for (const [mName, mIdx] of Object.entries(monthsEs)) {
      if (s.includes(mName)) {
        const yearMatch = s.match(/\b(20\d\d|19\d\d)\b/);
        const dayMatch = s.match(/\b([0-2]?\d|3[01])\b/);
        let hour = 0, minute = 0;
        const timeMatch = s.match(/\b(\d{1,2}):(\d{2})\b/);
        if (timeMatch) {
          hour = parseInt(timeMatch[1], 10);
          minute = parseInt(timeMatch[2], 10);
          if (s.includes('pm') && hour < 12) hour += 12;
          if (s.includes('am') && hour === 12) hour = 0;
        }
        const year = yearMatch ? parseInt(yearMatch[1], 10) : 2025;
        const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;
        return new Date(year, mIdx, day, hour, minute).getTime();
      }
    }

    const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      let hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
      const minute = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
      if (s.includes('pm') && hour < 12) hour += 12;
      if (s.includes('am') && hour === 12) hour = 0;
      return new Date(year, month, day, hour, minute).getTime();
    }

    return 0;
  };

  const historyList = useMemo(() => {
    const rawList = formData.attentionsHistory && formData.attentionsHistory.length > 0 
      ? formData.attentionsHistory 
      : [
          { id: '1', dateTime: `${formData.lastAttentionDate || '10/05/2026 09:00 AM'}`, professional: formData.professionalName, status: 'Atendida' },
          { id: '2', dateTime: `${formData.targetDate || '10/06/2026 09:00 AM'}`, professional: formData.professionalName, status: 'Programada' },
          { id: '3', dateTime: '15/04/2026 10:30 AM', professional: formData.professionalName, status: 'Atendida' }
        ];

    return [...rawList].sort((a, b) => {
      const timeA = parseDateStringToTimestamp(a.dateTime);
      const timeB = parseDateStringToTimestamp(b.dateTime);
      return timeB - timeA;
    });
  }, [formData.attentionsHistory, formData.lastAttentionDate, formData.targetDate, formData.professionalName]);

  const totalRecords = historyList.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return historyList.slice(start, start + pageSize);
  }, [historyList, currentPage, pageSize]);

  const lastAppointmentCode = formData.lastAttentionCode || historyList[0]?.codigoCita || historyList[0]?.id || '—';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className={`bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] rounded-xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] w-full transition-all duration-300 overflow-hidden ${
        showDetail ? 'max-w-4xl' : 'max-w-md'
      }`}>
        <div className={`grid grid-cols-1 ${showDetail ? 'md:grid-cols-2 divide-y md:divide-y-0 md:divide-x' : ''} divide-[#e2e8eb] dark:divide-[#334155]`}>
          
          <div className="flex flex-col">
            <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Atención: {formData.specialistTitle}</h3>
                <p className="text-xs text-white/90 font-medium">{patient.nombre}</p>
              </div>
              {!showDetail && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-[#033d59] dark:text-[#f8fafc] flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wide">
                    Nombre del Profesional
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.professionalName}
                      onChange={(e) => setFormData({ ...formData, professionalName: e.target.value })}
                      className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md pl-8 pr-3 py-2 text-[#033d59] dark:text-[#f8fafc] font-medium focus:outline-none focus:border-[#00aae1]"
                      required
                    />
                    <User className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* CÓDIGO DE ÚLTIMA CITA */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wide">
                    Código de Última Cita
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej: 27 o C-219"
                      value={formData.lastAttentionCode || (historyList[0]?.codigoCita || historyList[0]?.id || '')}
                      onChange={(e) => setFormData({ ...formData, lastAttentionCode: e.target.value })}
                      className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md pl-8 pr-3 py-2 text-[#00aae1] dark:text-[#38bdf8] font-mono font-bold focus:outline-none focus:border-[#00aae1]"
                    />
                    <Tag className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wide">
                    Fecha de Última Atención (Fecha y Hora)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY HH:MM AM/PM (Ej: 18/07/2026 10:30 AM)"
                      value={formData.lastAttentionDate}
                      onChange={(e) => setFormData({ ...formData, lastAttentionDate: e.target.value })}
                      className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md pl-8 pr-3 py-2 text-[#033d59] dark:text-[#f8fafc] font-medium focus:outline-none focus:border-[#00aae1] text-xs"
                      required
                    />
                    <Calendar className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-[#035476]/70 dark:text-gray-400 mt-0.5 block">Formato: DD/MM/YYYY HH:MM AM/PM</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wide">
                      Frecuencia / Periodicidad
                    </label>
                    <div className="relative">
                      <select
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md pl-8 pr-3 py-2 text-[#033d59] dark:text-[#f8fafc] font-medium focus:outline-none focus:border-[#00aae1]"
                      >
                        <option value="Semanal">Semanal</option>
                        <option value="Quincenal">Quincenal</option>
                        <option value="Mensual">Mensual</option>
                        <option value="Bimensual">Bimensual</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                        <option value="Sin definir">Sin definir</option>
                      </select>
                      <Clock className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wide">
                      Atenciones
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={historyList.length}
                        className="w-full bg-gray-100 dark:bg-[#0f172a]/60 border border-[#e2e8eb] dark:border-[#334155] rounded-md pl-8 pr-3 py-2 text-[#035476] dark:text-[#94a3b8] font-bold cursor-not-allowed"
                      />
                      <ClipboardList className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wide">
                    Fecha Objetivo (Próxima Cita)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY HH:MM AM/PM"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md pl-8 pr-3 py-2 text-[#033d59] dark:text-[#f8fafc] font-medium focus:outline-none focus:border-[#00aae1] text-xs"
                    />
                    <Calendar className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-[#035476]/70 dark:text-gray-400 mt-0.5 block">Formato: DD/MM/YYYY HH:MM AM/PM</span>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDetail(!showDetail)}
                    className={`w-full py-2.5 px-3 border rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      showDetail
                        ? 'bg-[#00aae1] text-white border-[#00aae1]'
                        : 'bg-[#effaff] dark:bg-[#00aae1]/10 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]/30 hover:bg-[#00aae1]/20'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>{showDetail ? '📋 Ocultar Detalle Lateral' : '📋 Detalle de Atenciones (Al lado)...'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2e8eb] dark:border-[#334155] flex justify-end gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#035476] dark:text-[#94a3b8] hover:bg-[#f9fafb] dark:hover:bg-[#334155] rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>

          {showDetail && (
            <div className="flex flex-col bg-[#fafafa] dark:bg-[#0f172a] animate-in fade-in slide-in-from-left-4 duration-200">
              <div className="bg-[#033d59] text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#00aae1]" />
                    Detalle de Atenciones
                  </h3>
                  <p className="text-xs text-white/80">{formData.specialistTitle} — {patient.nombre}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-[#033d59] dark:text-[#f8fafc]">
                <div className="bg-white dark:bg-[#1e293b] p-3 rounded-lg border border-[#e2e8eb] dark:border-[#334155] shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider block">Profesional Asignado</span>
                  <p className="text-[#00aae1] dark:text-[#38bdf8] font-bold text-sm">{formData.professionalName}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#035476] dark:text-[#94a3b8] flex-wrap gap-2">
                    <span>Cód. Cita: <strong className="font-mono text-[#00aae1] dark:text-[#38bdf8]">{lastAppointmentCode}</strong></span>
                    <span>Última atenc.: <strong className="text-[#033d59] dark:text-[#f8fafc]">{formData.lastAttentionDate}</strong></span>
                    <span>Obj.: <strong className="text-[#00aae1] dark:text-[#38bdf8]">{formData.targetDate}</strong></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-[#033d59] dark:text-[#f8fafc] uppercase tracking-wide flex items-center justify-between">
                    <span>Histórico de Atenciones</span>
                    <span className="text-[10px] font-normal text-[#035476] dark:text-[#94a3b8]">{historyList.length} registros</span>
                  </h4>

                  <div className="border border-[#e2e8eb] dark:border-[#334155] rounded-lg overflow-hidden divide-y divide-[#e2e8eb] dark:divide-[#334155] bg-white dark:bg-[#1e293b] shadow-2xs">
                    <div className="bg-[#f9fafb] dark:bg-[#0f172a] px-3 py-2 font-bold text-[10px] text-[#035476] dark:text-[#94a3b8] grid grid-cols-3 gap-2 uppercase tracking-wider">
                      <span>Cód. Cita</span>
                      <span>Fecha y Hora</span>
                      <span>Estado Atención</span>
                    </div>

                    {paginatedHistory.map((item, idx) => (
                      <div key={item.id || idx} className="px-3 py-2.5 grid grid-cols-3 gap-2 items-center hover:bg-[#effaff]/40 dark:hover:bg-[#334155]/40 transition-colors">
                        <span className="font-mono text-xs font-bold text-[#00aae1] dark:text-[#38bdf8] truncate" title={item.codigoCita || item.id}>
                          {item.codigoCita || item.id || `C-${idx + 1}`}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#033d59] dark:text-[#f8fafc]">
                          {item.dateTime}
                        </span>
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Atendida' || item.status === 'Pagada' ? 'bg-[#ebfef4] dark:bg-emerald-950 text-[#01ae6c] dark:text-emerald-300 border border-[#01ae6c]/20' :
                            item.status === 'Programada' || item.status === 'Solicitud de Cita' ? 'bg-[#f0f9ff] dark:bg-sky-950 text-[#0284c7] dark:text-sky-300 border border-[#0284c7]/20' :
                            item.status === 'Cancelada' ? 'bg-rose-50 dark:bg-rose-950 text-[#e11d48] dark:text-rose-300 border border-rose-200 dark:border-rose-900' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Controles de Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 px-1 text-xs">
                      <span className="text-[11px] text-[#035476] dark:text-[#94a3b8]">
                        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalRecords} registros)
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-1 rounded-md border border-[#e2e8eb] dark:border-[#334155] hover:bg-[#effaff] dark:hover:bg-[#334155] disabled:opacity-40 disabled:cursor-not-allowed text-[#035476] dark:text-[#94a3b8] transition-colors cursor-pointer"
                          title="Página anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1 rounded-md border border-[#e2e8eb] dark:border-[#334155] hover:bg-[#effaff] dark:hover:bg-[#334155] disabled:opacity-40 disabled:cursor-not-allowed text-[#035476] dark:text-[#94a3b8] transition-colors cursor-pointer"
                          title="Página siguiente"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel Footer */}
              <div className="p-3 bg-white dark:bg-[#1e293b] border-t border-[#e2e8eb] dark:border-[#334155] flex justify-between items-center text-xs">
                <span className="text-[11px] text-[#035476] dark:text-[#94a3b8]">
                  Vista paralela de atenciones
                </span>
                <button
                  type="button"
                  onClick={() => setShowDetail(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#035476] dark:text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-[#334155] rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-[#e2e8eb] dark:border-[#334155]"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                  Cerrar Panel Lateral
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
