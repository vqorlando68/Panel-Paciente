import React, { useState } from 'react';
import { Patient } from '../types';
import { X, BarChart3, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

interface CostAnalysisModalProps {
  patient: Patient;
  onClose: () => void;
}

export const CostAnalysisModal: React.FC<CostAnalysisModalProps> = ({ patient, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState('Febrero 2026');
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAnalyzed(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] rounded-3xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#033d59] dark:text-[#f8fafc]">Análisis de Costos</h2>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#035476] dark:text-[#38bdf8]" />
            <button
              onClick={onClose}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAnalyzed ? (
          /* STEP 1: Select Month and Analyze */
          <div className="space-y-6">
            <p className="text-xs text-[#035476] dark:text-[#94a3b8] leading-relaxed">
              Calcula costos del paciente <strong className="text-[#033d59] dark:text-[#f8fafc]">{patient.nombre}</strong> y los compara contra la cohorte del mes.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#035476] dark:text-[#94a3b8]">
                Mes a analizar
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-xl px-3.5 py-2.5 text-xs text-[#033d59] dark:text-[#f8fafc] font-medium focus:outline-none focus:border-[#00aae1]"
              >
                <option value="Febrero 2026">Febrero 2026</option>
                <option value="Enero 2026">Enero 2026</option>
                <option value="Diciembre 2025">Diciembre 2025</option>
                <option value="Noviembre 2025">Noviembre 2025</option>
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full py-3 bg-[#00aae1] hover:bg-[#0196d4] text-white font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
              <span>Analizar paciente</span>
            </button>
          </div>
        ) : (
          /* STEP 2: Analysis Results */
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#035476] dark:text-[#94a3b8]">
              <span>Job: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-[10px] text-gray-700 dark:text-gray-300">a9f8cefe</code></span>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                completed
              </span>
            </div>

            {/* PACIENTE SECTION */}
            <div className="space-y-3 pt-1">
              <h4 className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider">PACIENTE</h4>

              <div className="bg-sky-50/70 dark:bg-[#00aae1]/10 p-3 rounded-xl flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#035476] dark:text-[#38bdf8] uppercase tracking-wide">COSTO TOTAL</span>
                <span className="text-base font-extrabold text-[#033d59] dark:text-[#f8fafc]">$ 0</span>
              </div>

              <div className="border-b border-[#e2e8eb] dark:border-[#334155] pb-3 space-y-2">
                <div className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase flex justify-between">
                  <span>COSTOS</span>
                  <span>-</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[#033d59] dark:text-[#f8fafc]">
                  <div>
                    <span className="text-[9px] text-[#035476] dark:text-[#94a3b8] block font-semibold">PRE</span>
                    <span>$ 0</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="text-right">
                    <span className="text-[9px] text-[#035476] dark:text-[#94a3b8] block font-semibold">POST</span>
                    <span>$ 0</span>
                  </div>
                </div>
              </div>

              <div className="border-b border-[#e2e8eb] dark:border-[#334155] pb-3 space-y-2">
                <div className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase flex justify-between">
                  <span>SERVICIOS</span>
                  <span>-</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[#033d59] dark:text-[#f8fafc]">
                  <div>
                    <span className="text-[9px] text-[#035476] dark:text-[#94a3b8] block font-semibold">PRE</span>
                    <span>0</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="text-right">
                    <span className="text-[9px] text-[#035476] dark:text-[#94a3b8] block font-semibold">POST</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COHORTE SECTION */}
            <div className="space-y-3 pt-1">
              <h4 className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider">COHORTE</h4>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#035476] dark:text-[#94a3b8] font-medium">Pacientes en cohorte</span>
                <span className="font-bold text-[#033d59] dark:text-[#f8fafc]">56</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase">PMPM</span>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ↓ 72.3%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[#033d59] dark:text-[#f8fafc]">
                  <div>
                    <span className="text-[9px] text-[#035476] dark:text-[#94a3b8] block font-semibold">PRE</span>
                    <span>$ 2.799.485</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="text-right">
                    <span className="text-[9px] text-[#035476] dark:text-[#94a3b8] block font-semibold">POST</span>
                    <span>$ 775.740</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                className="w-full py-2.5 bg-[#00aae1] hover:bg-[#0196d4] text-white font-bold text-xs rounded-full shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Reporte Completo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAnalyzed(false)}
                className="w-full py-2.5 bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#334155] text-[#033d59] dark:text-[#f8fafc] font-bold text-xs rounded-full shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#035476] dark:text-[#38bdf8]" />
                <span>Volver a analizar</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
