import React from 'react';
import { Patient } from '../types';
import { X, FileText } from 'lucide-react';
import { EpicrisisViewer } from './EpicrisisViewer';

interface EpicrisisModalProps {
  patient: Patient;
  onClose: () => void;
}

export const EpicrisisModal: React.FC<EpicrisisModalProps> = ({ patient, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f8fafc] rounded-2xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#00aae1] dark:bg-[#0284c7] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Evolución y Epicrisis Clínica</h3>
              <p className="text-xs text-white/90">
                {patient.nombre} • <span className="font-mono">{patient.identificacion}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white dark:bg-[#0f172a]">
          <EpicrisisViewer epicrisisRaw={patient.epicrisis} />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#f8fafc] dark:bg-[#1e293b] border-t border-[#e2e8eb] dark:border-[#334155] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
