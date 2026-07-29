import React, { useState } from 'react';
import { Patient, AgendaItem } from '../types';
import { X, Calendar, Filter, ArrowUpDown, Clock, MapPin, Bell, AlertTriangle, AlertCircle, CheckCircle2, UserX } from 'lucide-react';

interface AgendaDrawerProps {
  patient: Patient;
  onClose: () => void;
}

export const AgendaDrawer: React.FC<AgendaDrawerProps> = ({ patient, onClose }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'alerts'>('agenda');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'dateTime' | 'status' | 'specialty'>('dateTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter items
  let filtered = [...patient.agenda];

  if (selectedSpecialty !== 'Todas') {
    filtered = filtered.filter((item) => item.specialty.toLowerCase() === selectedSpecialty.toLowerCase());
  }

  if (dateFrom) {
    filtered = filtered.filter((item) => item.date >= dateFrom);
  }

  if (dateTo) {
    filtered = filtered.filter((item) => item.date <= dateTo);
  }

  // Sort items
  filtered.sort((a, b) => {
    if (sortBy === 'dateTime') {
      const dateTimeA = `${a.date} ${a.time}`;
      const dateTimeB = `${b.date} ${b.time}`;
      const cmp = dateTimeA.localeCompare(dateTimeB);
      return sortOrder === 'asc' ? cmp : -cmp;
    } else if (sortBy === 'status') {
      const cmp = a.status.localeCompare(b.status);
      return sortOrder === 'asc' ? cmp : -cmp;
    } else {
      const cmp = a.specialty.localeCompare(b.specialty);
      return sortOrder === 'asc' ? cmp : -cmp;
    }
  });

  const toggleSortDateTime = () => {
    if (sortBy === 'dateTime') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('dateTime');
      setSortOrder('asc');
    }
  };

  const toggleSortStatus = () => {
    if (sortBy === 'status') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('status');
      setSortOrder('asc');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-[#e2e8eb] dark:border-[#334155] animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Detalle de Atenciones y Agenda</h3>
              <p className="text-xs text-white/80">{patient.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Tabs Bar */}
        <div className="flex border-b border-[#e2e8eb] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a]">
          <button
            type="button"
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'agenda'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#1e293b] shadow-2xs'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-[#334155]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda Programada ({patient.agenda.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#1e293b] shadow-2xs'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-[#334155]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alertas y Novedades</span>
            {(patient.alarmReasons?.length || patient.hasRehuso) ? (
              <span className="w-2 h-2 rounded-full bg-[#e11d48]"></span>
            ) : null}
          </button>
        </div>

        {/* Tab 1: Agenda Programada */}
        {activeTab === 'agenda' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filters Section */}
            <div className="bg-[#f9fafb] dark:bg-[#0f172a] p-4 border-b border-[#e2e8eb] dark:border-[#334155] space-y-3 text-xs shrink-0">
              <div className="flex items-center justify-between text-[#035476] dark:text-[#94a3b8] font-bold">
                <span className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#00aae1]" />
                  Filtros de Agenda
                </span>
                <span className="text-[11px] text-[#035476]/70 dark:text-gray-400 font-normal">{filtered.length} atenciones encontradas</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1">Especialidad</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-2.5 py-1.5 text-xs text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                  >
                    <option value="Todas">Todas las Especialidades</option>
                    <option value="Medicina General">Medicina General</option>
                    <option value="Nutrición">Nutrición</option>
                    <option value="Psicología">Psicología</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Endocrinología">Endocrinología</option>
                    <option value="Nefrología">Nefrología</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1">Desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-2 py-1 text-xs text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={toggleSortDateTime}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                    sortBy === 'dateTime'
                      ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]'
                      : 'bg-white dark:bg-[#1e293b] text-[#035476] dark:text-[#94a3b8] border-[#e2e8eb] dark:border-[#334155] hover:bg-gray-50'
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Fecha y Hora ({sortBy === 'dateTime' ? sortOrder.toUpperCase() : 'Asc'})</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSortStatus}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                    sortBy === 'status'
                      ? 'bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]'
                      : 'bg-white dark:bg-[#1e293b] text-[#035476] dark:text-[#94a3b8] border-[#e2e8eb] dark:border-[#334155] hover:bg-gray-50'
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Estado ({sortBy === 'status' ? sortOrder.toUpperCase() : 'Asc'})</span>
                </button>
              </div>
            </div>

            {/* Agenda Items List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                  No hay citas o atenciones que coincidan con los filtros.
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-xl hover:border-[#00aae1] transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#033d59] dark:text-[#f8fafc]">{item.specialty}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Realizada' ? 'bg-[#ebfef4] dark:bg-emerald-950 text-[#01ae6c] dark:text-emerald-300 border border-[#01ae6c]/20' :
                        item.status === 'Programada' ? 'bg-[#f0f9ff] dark:bg-sky-950 text-[#0284c7] dark:text-sky-300 border border-[#0284c7]/20' :
                        'bg-rose-50 dark:bg-rose-950 text-[#e11d48] dark:text-rose-300 border border-rose-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-[#035476] dark:text-[#94a3b8]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#00aae1]" />
                        {item.time}
                      </span>
                    </div>

                    <div className="text-xs text-[#033d59] dark:text-[#f8fafc] font-medium flex items-center gap-1">
                      <span>👤 {item.professional}</span>
                    </div>

                    {item.location && (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Alertas y Novedades */}
        {activeTab === 'alerts' && (
          <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-[#033d59] dark:text-[#f8fafc]">
            {patient.hasAlarm && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Alertas de Incumplimiento Activas</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  {patient.alarmReasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {patient.hasRehuso && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2 text-rose-900 dark:text-rose-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <UserX className="w-4 h-4 text-rose-600" />
                  <span>Novedad de Rehúso Registrada</span>
                </div>
                <p className="text-xs">
                  El paciente presenta rehúso explícito registrado en atención especializada. Se sugiere revisar informe en el acta del comité.
                </p>
              </div>
            )}

            {!patient.hasAlarm && !patient.hasRehuso && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#01ae6c] mx-auto" />
                <p className="font-bold text-sm">Sin Novedades Críticas</p>
                <p className="text-xs">El paciente se encuentra al día en sus controles de seguimiento.</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-[#0f172a] border-t border-[#e2e8eb] dark:border-[#334155] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
