import React, { useState } from 'react';
import { Patient, UserRole, ActaInfo } from '../types';
import { X, FileText, Calendar, Users, CheckCircle, Plus, Save } from 'lucide-react';

interface ActaModalProps {
  patient: Patient;
  activeRole?: UserRole;
  initialMode?: 'view' | 'create';
  onSaveActa?: (patientId: string, newActa: ActaInfo) => void;
  onClose: () => void;
}

export const ActaModal: React.FC<ActaModalProps> = ({
  patient,
  activeRole,
  initialMode = 'view',
  onSaveActa,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'create'>(initialMode);
  
  // New Acta Form State
  const nextNum = (patient.acta?.numero || 100) + 1;
  const [actaNumero, setActaNumero] = useState<number>(nextNum);
  const [actaFecha, setActaFecha] = useState<string>(
    new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [actaResumen, setActaResumen] = useState<string>('');
  const [actaIntegrantes, setActaIntegrantes] = useState<string>(
    'Dra. Camila Morales (Líder Comité), Dr. Juan Carlos Restrepo (Cardiólogo), Enf. Beatriz Viana'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const isComite = activeRole === 'comite_medico';

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actaResumen.trim()) return;

    const newActa: ActaInfo = {
      numero: actaNumero,
      fecha: actaFecha,
      resumen: actaResumen,
      integrantes: actaIntegrantes.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (onSaveActa) {
      onSaveActa(patient.id, newActa);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveTab('view');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e2e8eb] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {activeTab === 'create' ? 'Registrar Nueva Acta del Comité' : `Acta de Comité Médico #${patient.acta?.numero || 101}`}
              </h3>
              <p className="text-xs text-white/80">{patient.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-[#e2e8eb] bg-[#f9fafb]">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'view'
                ? 'border-[#00aae1] text-[#00aae1] bg-white'
                : 'border-transparent text-[#035476] hover:bg-gray-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ver Actas Registradas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#00aae1] text-[#00aae1] bg-white'
                : 'border-transparent text-[#035476] hover:bg-gray-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Acta (Cuadro Médico)</span>
          </button>
        </div>

        {/* Tab 1: View Actas */}
        {activeTab === 'view' && (
          <div className="p-5 space-y-4 text-xs text-[#033d59] max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between bg-[#effaff] p-3 rounded-lg border border-[#00aae1]/20">
              <div className="flex items-center gap-1.5 text-[#035476]">
                <Calendar className="w-4 h-4 text-[#00aae1]" />
                <span>Fecha de Sesión:</span>
                <strong className="text-[#033d59] font-mono">{patient.acta?.fecha || '24/07/2026'}</strong>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-[#ebfef4] text-[#01ae6c] text-[11px] font-semibold border border-[#01ae6c]/20 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Aprobada
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-[#033d59] mb-1 uppercase tracking-wider text-[11px]">
                Resumen de Decisiones del Comité Médico
              </h4>
              <div className="p-3 bg-[#f9fafb] rounded-lg border border-[#e2e8eb] text-xs leading-relaxed text-[#033d59]">
                {patient.acta?.resumen || 'No hay decisiones registradas aún.'}
              </div>
            </div>

            {patient.acta?.integrantes && patient.acta.integrantes.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#035476] mb-1.5 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#00aae1]" />
                  Integrantes del Comité Firmantes
                </h4>
                <ul className="space-y-1 pl-1">
                  {patient.acta.integrantes.map((member, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-[#033d59]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00aae1]" />
                      <span>{member}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-[#e2e8eb] flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Create New Acta */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs text-[#033d59]">
            {savedSuccess && (
              <div className="p-3 bg-[#ebfef4] border border-[#01ae6c]/30 text-[#01ae6c] font-bold rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>¡Acta registrada exitosamente por el Cuadro Médico!</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#035476] uppercase mb-1">N° de Acta</label>
                <input
                  type="number"
                  value={actaNumero}
                  onChange={(e) => setActaNumero(parseInt(e.target.value, 10))}
                  className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 font-bold font-mono text-[#033d59]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#035476] uppercase mb-1">Fecha Sesión</label>
                <input
                  type="text"
                  value={actaFecha}
                  onChange={(e) => setActaFecha(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#035476] uppercase mb-1">
                Resumen de Decisiones del Cuadro Médico
              </label>
              <textarea
                rows={4}
                value={actaResumen}
                onChange={(e) => setActaResumen(e.target.value)}
                placeholder="Escriba los acuerdos, decisiones clínicas y plan de seguimiento aprobado por el cuadro médico..."
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md p-2.5 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#035476] uppercase mb-1">
                Integrantes Firmantes (separados por coma)
              </label>
              <input
                type="text"
                value={actaIntegrantes}
                onChange={(e) => setActaIntegrantes(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59]"
              />
            </div>

            <div className="pt-3 border-t border-[#e2e8eb] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#035476] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Registrar Acta
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
