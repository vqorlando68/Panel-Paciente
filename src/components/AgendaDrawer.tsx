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

  const toggleSortSpecialty = () => {
    if (sortBy === 'specialty') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('specialty');
      setSortOrder('asc');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end font-sans">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-[#e2e8eb] flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#033d59] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00aae1] rounded-lg text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Detalle de Atenciones</h3>
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
        <div className="flex border-b border-[#e2e8eb] bg-[#f9fafb]">
          <button
            type="button"
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'agenda'
                ? 'border-[#00aae1] text-[#00aae1] bg-white shadow-2xs'
                : 'border-transparent text-[#035476] hover:bg-gray-100'
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
                ? 'border-[#00aae1] text-[#00aae1] bg-white shadow-2xs'
                : 'border-transparent text-[#035476] hover:bg-gray-100'
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
            <div className="bg-[#f9fafb] p-4 border-b border-[#e2e8eb] space-y-3 text-xs shrink-0">
              <div className="flex items-center justify-between text-[#035476] font-bold">
                <span className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#00aae1]" />
                  Filtros de Agenda
                </span>
                <span className="text-[11px] text-[#035476]/70 font-normal">{filtered.length} atenciones encontradas</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Especialidad */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#035476] mb-1">Especialidad</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-white border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-xs text-[#033d59] focus:outline-none focus:border-[#00aae1]"
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

                {/* Date Range: From */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#035476] mb-1">Desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-white border border-[#e2e8eb] rounded-md px-2 py-1 text-xs text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                  />
                </div>
              </div>

              {/* Sort Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={toggleSortDateTime}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                    sortBy === 'dateTime'
                      ? 'bg-[#effaff] text-[#00aae1] border-[#00aae1]'
                      : 'bg-white text-[#035476] border-[#e2e8eb] hover:bg-gray-50'
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
                      ? 'bg-[#effaff] text-[#00aae1] border-[#00aae1]'
                      : 'bg-white text-[#035476] border-[#e2e8eb] hover:bg-gray-50'
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Estado ({sortBy === 'status' ? sortOrder.toUpperCase() : 'Asc'})</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSortSpecialty}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                    sortBy === 'specialty'
                      ? 'bg-[#effaff] text-[#00aae1] border-[#00aae1]'
                      : 'bg-white text-[#035476] border-[#e2e8eb] hover:bg-gray-50'
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Especialidad</span>
                </button>
              </div>
            </div>

            {/* Agenda List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
              {filtered.length === 0 ? (
                <p className="text-gray-500 py-10 text-center italic">No hay atenciones agendadas para los criterios seleccionados.</p>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-[#e2e8eb] rounded-xl hover:shadow-xs transition-shadow space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#00aae1] uppercase tracking-wider">
                        {item.specialty}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Completada'
                            ? 'bg-[#ebfef4] text-[#01ae6c] border border-[#01ae6c]/20'
                            : item.status === 'Programada'
                            ? 'bg-[#f0f9ff] text-[#0284c7] border border-[#0284c7]/20'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#033d59]">
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#035476]" />
                        <span>{item.date} — {item.time}</span>
                      </div>

                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        {item.type}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#035476] pt-1 border-t border-[#e2e8eb]">
                      <span>Profesional: </span>
                      <strong className="text-[#033d59]">{item.professional}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Alertas y Novedades */}
        {activeTab === 'alerts' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#f9fafb]/50">
            {/* Active System Alarms */}
            <div className="bg-white rounded-xl p-3.5 border border-[#e2e8eb] shadow-2xs space-y-2.5">
              <h4 className="font-bold text-[#033d59] flex items-center gap-2 text-xs border-b border-[#e2e8eb] pb-2">
                <AlertTriangle className="w-4 h-4 text-[#e11d48]" />
                <span>Alertas Activas del Paciente</span>
              </h4>

              {patient.alarmReasons && patient.alarmReasons.length > 0 ? (
                <ul className="space-y-2">
                  {patient.alarmReasons.map((reason, idx) => (
                    <li key={idx} className="bg-[#fff1f2] border border-[#fecdd3] text-rose-800 p-2.5 rounded-lg text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[#e11d48] shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#01ae6c] font-semibold text-xs flex items-center gap-1.5 bg-[#ebfef4] p-2.5 rounded-lg border border-[#01ae6c]/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sin alertas críticas registradas para este paciente.</span>
                </p>
              )}
            </div>

            {/* Rehúso Notification Banner */}
            {patient.hasRehuso && (
              <div className="bg-[#fff1f2] rounded-xl p-3.5 border border-[#fecdd3] shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#e11d48] text-xs">
                  <UserX className="w-4 h-4" />
                  <span>REGISTRO DE REHÚSO ACTIVO</span>
                </div>
                <p className="text-xs text-rose-900 leading-snug">
                  El paciente ha manifestado rehúso para atención especializada.
                  {patient.rehusoInfo && (
                    <strong className="block mt-1">
                      Profesional: {patient.rehusoInfo.professional} ({patient.rehusoInfo.specialty})
                    </strong>
                  )}
                </p>
              </div>
            )}

            {/* Inasistencias / Cancelaciones / Novedades History */}
            <div className="bg-white rounded-xl p-3.5 border border-[#e2e8eb] shadow-2xs space-y-2.5">
              <h4 className="font-bold text-[#033d59] flex items-center gap-2 text-xs border-b border-[#e2e8eb] pb-2">
                <Clock className="w-4 h-4 text-[#00aae1]" />
                <span>Historial de Novedades e Inasistencias</span>
              </h4>

              {patient.tasas?.history && patient.tasas.history.length > 0 ? (
                <div className="space-y-2">
                  {patient.tasas.history.map((nov) => (
                    <div key={nov.id} className="p-2.5 bg-[#f9fafb] border border-[#e2e8eb] rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#033d59]">{nov.specialty}</div>
                        <div className="text-[11px] text-[#035476]">{nov.professional} • {nov.date}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        nov.status === 'Inasistida' ? 'bg-rose-100 text-rose-800' :
                        nov.status === 'Cancelada' ? 'bg-amber-100 text-amber-800' :
                        nov.status === 'Reprogramada' ? 'bg-sky-100 text-sky-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {nov.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#035476] italic text-center py-4">No registra novedades de inasistencia o cancelación.</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#f9fafb] border-t border-[#e2e8eb] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#033d59] bg-white border border-[#e2e8eb] hover:bg-gray-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

