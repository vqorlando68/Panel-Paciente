import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Filter,
  CheckCircle2,
  TrendingDown,
  Building2,
  Users,
  Activity,
  DollarSign,
  ArrowRight,
  Stethoscope,
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { CostAnalysisResponse, Patient } from '../types';

interface CostReportFullModalProps {
  patient: Patient;
  costData: CostAnalysisResponse;
  onClose: () => void;
}

export const CostReportFullModal: React.FC<CostReportFullModalProps> = ({
  patient,
  costData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'cups' | 'stats' | 'cohort_months' | 'hospital_stay'>('cups');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNomenclador, setSelectedNomenclador] = useState<string>('Todos');

  // Pagination states for each section (default 5 records)
  const [cupsPage, setCupsPage] = useState(1);
  const [cupsPerPage, setCupsPerPage] = useState(5);

  const [statsPage, setStatsPage] = useState(1);
  const [statsPerPage, setStatsPerPage] = useState(5);

  const [activeMonthsPage, setActiveMonthsPage] = useState(1);
  const [activeMonthsPerPage, setActiveMonthsPerPage] = useState(5);

  const [staysPage, setStaysPage] = useState(1);
  const [staysPerPage, setStaysPerPage] = useState(5);

  // Formatter helper for Colombian Pesos
  const formatCOP = (val: number | undefined | null): string => {
    if (val === undefined || val === null || isNaN(val)) return '$ 0';
    return `$ ${Math.round(val).toLocaleString('es-CO')}`;
  };

  // Safe data extraction
  const q1q2 = useMemo(() => costData.user_data?.q1_q2 || [], [costData]);
  const userCalc = costData.user_calculated;
  const globalCalc = costData.global_calculated;
  const generalData = costData.costos_data?.general;
  const ingresosEgresos = costData.user_data?.ingresos_egresos || [];

  // Nomencladores list for filter
  const nomencladoresList = useMemo(() => {
    const set = new Set<string>();
    q1q2.forEach((item) => {
      if (item.Nomenclador_C) set.add(item.Nomenclador_C);
    });
    return Array.from(set).sort();
  }, [q1q2]);

  // Filtered CUPS Items
  const filteredCups = useMemo(() => {
    return q1q2.filter((item) => {
      if (selectedNomenclador !== 'Todos' && item.Nomenclador_C !== selectedNomenclador) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const desc = (item.Des_CUPS_Unificado || '').toLowerCase();
        const nom = (item.Nomenclador_C || '').toLowerCase();
        const mes = (item.Mes_Emision || '').toLowerCase();
        if (!desc.includes(query) && !nom.includes(query) && !mes.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [q1q2, selectedNomenclador, searchTerm]);

  // Reset CUPS page when filter or search changes
  useEffect(() => {
    setCupsPage(1);
  }, [searchTerm, selectedNomenclador]);

  // Paginated CUPS calculations
  const cupsTotalPages = Math.max(1, Math.ceil(filteredCups.length / cupsPerPage));
  const cupsStartIndex = filteredCups.length === 0 ? 0 : (cupsPage - 1) * cupsPerPage;
  const cupsEndIndex = Math.min(filteredCups.length, cupsPage * cupsPerPage);
  const paginatedCups = filteredCups.slice(cupsStartIndex, cupsEndIndex);

  // Sum of filtered CUPS costs
  const totalFilteredCost = useMemo(() => {
    return filteredCups.reduce((acc, curr) => acc + (curr['Costo Total'] || 0), 0);
  }, [filteredCups]);

  // PMPM calculation percentage
  const pmpmDiffPercent = useMemo(() => {
    if (globalCalc && globalCalc.pmpm_pre > 0) {
      const diff = globalCalc.pmpm_post - globalCalc.pmpm_pre;
      return ((diff / globalCalc.pmpm_pre) * 100).toFixed(1);
    }
    return '0.0';
  }, [globalCalc]);

  // Months list for Statistics (-12 to 12)
  const statsMonths = useMemo(() => {
    if (!generalData) return [];
    const keys = Object.keys(generalData.estadisticas_urgencias || {});
    return keys.sort((a, b) => Number(a) - Number(b));
  }, [generalData]);

  // Paginated Stats Months
  const statsTotalPages = Math.max(1, Math.ceil(statsMonths.length / statsPerPage));
  const statsStartIndex = statsMonths.length === 0 ? 0 : (statsPage - 1) * statsPerPage;
  const statsEndIndex = Math.min(statsMonths.length, statsPage * statsPerPage);
  const paginatedStatsMonths = statsMonths.slice(statsStartIndex, statsEndIndex);

  // Active patients months list
  const activeMonthsList = useMemo(() => {
    if (!generalData?.pacientes_activos_por_mes) return [];
    return Object.keys(generalData.pacientes_activos_por_mes).sort((a, b) => Number(a) - Number(b));
  }, [generalData]);

  // Paginated Active Months
  const activeMonthsTotalPages = Math.max(1, Math.ceil(activeMonthsList.length / activeMonthsPerPage));
  const activeMonthsStartIndex = activeMonthsList.length === 0 ? 0 : (activeMonthsPage - 1) * activeMonthsPerPage;
  const activeMonthsEndIndex = Math.min(activeMonthsList.length, activeMonthsPage * activeMonthsPerPage);
  const paginatedActiveMonths = activeMonthsList.slice(activeMonthsStartIndex, activeMonthsEndIndex);

  // Paginated Stays
  const staysTotalPages = Math.max(1, Math.ceil(ingresosEgresos.length / staysPerPage));
  const staysStartIndex = ingresosEgresos.length === 0 ? 0 : (staysPage - 1) * staysPerPage;
  const staysEndIndex = Math.min(ingresosEgresos.length, staysPage * staysPerPage);
  const paginatedStays = ingresosEgresos.slice(staysStartIndex, staysEndIndex);

  const getNomencladorColor = (nom: string) => {
    const n = nom.toLowerCase();
    if (n.includes('laboratorio')) return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50';
    if (n.includes('consulta') || n.includes('consul')) return 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/50';
    if (n.includes('quirurg') || n.includes('cirugia')) return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50';
    if (n.includes('hospitaliz')) return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
    if (n.includes('suministro')) return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#111c35] text-[#033d59] dark:text-[#f8fafc] rounded-3xl shadow-2xl border border-[#e2e8eb] dark:border-[#1e293b] w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* TOP HEADER */}
        <div className="px-6 py-4 border-b border-[#e2e8eb] dark:border-[#1e293b] bg-linear-to-r from-sky-50/60 via-white to-sky-50/30 dark:from-[#0b1329] dark:via-[#111c35] dark:to-[#0f172a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00aae1] to-[#01ae6c] flex items-center justify-center text-white shadow-md">
              <DollarSign className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-xl font-extrabold text-[#033d59] dark:text-white tracking-tight">
                  Reporte Integral de Análisis de Costos
                </h2>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {costData.status || 'completed'}
                </span>
                <span className="bg-sky-100 dark:bg-sky-950 text-[#035476] dark:text-[#38bdf8] px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-sky-200 dark:border-sky-800">
                  {costData.costos_data?.mes_corte || 'Marzo_2026'}
                </span>
              </div>
              <p className="text-xs text-[#035476] dark:text-[#94a3b8] mt-0.5">
                Paciente: <strong className="text-[#033d59] dark:text-white font-bold">{patient.nombre}</strong> • Identificación: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-[11px] text-gray-700 dark:text-gray-300">{costData.requested_user_id || patient.identificacion}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-[#1e293b] transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* EXECUTIVE KPI SUMMARY CARDS */}
        <div className="p-4 md:p-6 pb-2 border-b border-[#e2e8eb] dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0c1427]/60 shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Card 1: Costo Total Paciente */}
            <div className="bg-white dark:bg-[#16223f] border border-[#e2e8eb] dark:border-[#223354] p-3.5 rounded-2xl shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider">
                  Costo Paciente
                </span>
                <span className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#00aae1]">
                  <DollarSign className="w-4 h-4 stroke-[2.5]" />
                </span>
              </div>
              <div className="text-xl font-extrabold text-[#033d59] dark:text-white mt-1">
                {formatCOP(userCalc?.total_cost)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#035476] dark:text-[#94a3b8] mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span>Pre: <strong>{formatCOP(userCalc?.pre_cost)}</strong></span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span>Post: <strong>{formatCOP(userCalc?.post_cost)}</strong></span>
              </div>
            </div>

            {/* Card 2: Servicios Paciente */}
            <div className="bg-white dark:bg-[#16223f] border border-[#e2e8eb] dark:border-[#223354] p-3.5 rounded-2xl shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider">
                  Servicios Paciente
                </span>
                <span className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500">
                  <Activity className="w-4 h-4 stroke-[2.5]" />
                </span>
              </div>
              <div className="text-xl font-extrabold text-[#033d59] dark:text-white mt-1">
                {userCalc?.total_services || 0} <span className="text-xs font-semibold text-gray-400">servicios</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#035476] dark:text-[#94a3b8] mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span>Pre: <strong>{userCalc?.pre_services || 0}</strong></span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span>Post: <strong>{userCalc?.post_services || 0}</strong></span>
              </div>
            </div>

            {/* Card 3: PMPM Cohorte Global */}
            <div className="bg-white dark:bg-[#16223f] border border-[#e2e8eb] dark:border-[#223354] p-3.5 rounded-2xl shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider">
                  PMPM Cohorte
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  {pmpmDiffPercent}%
                </span>
              </div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCOP(globalCalc?.pmpm_post)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#035476] dark:text-[#94a3b8] mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span>Pre: <strong>{formatCOP(globalCalc?.pmpm_pre)}</strong></span>
                <span className="text-emerald-600 font-semibold text-[10px]">
                  Δ {formatCOP(costData.costos_data?.diferencia_pmpm)}
                </span>
              </div>
            </div>

            {/* Card 4: Cohorte Global Stats */}
            <div className="bg-white dark:bg-[#16223f] border border-[#e2e8eb] dark:border-[#223354] p-3.5 rounded-2xl shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider">
                  Cohorte ({globalCalc?.cohort_patients || 0} pac.)
                </span>
                <span className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                  <Users className="w-4 h-4 stroke-[2.5]" />
                </span>
              </div>
              <div className="text-xl font-extrabold text-[#033d59] dark:text-white mt-1">
                {formatCOP(globalCalc?.total_cost)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#035476] dark:text-[#94a3b8] mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span>Total: <strong>{globalCalc?.total_services || 0} serv.</strong></span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold text-[10px]">
                  Post: {formatCOP(globalCalc?.post_cost)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-[#e2e8eb] dark:border-[#1e293b] overflow-x-auto shrink-0 bg-white dark:bg-[#111c35]">
          <button
            onClick={() => setActiveTab('cups')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'cups'
                ? 'border-[#00aae1] text-[#00aae1] bg-sky-50/50 dark:bg-[#16223f]'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Detalle de Consumos CUPS ({q1q2.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'stats'
                ? 'border-[#00aae1] text-[#00aae1] bg-sky-50/50 dark:bg-[#16223f]'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Urgencias vs Hospitalización ({statsMonths.length} meses)</span>
          </button>

          <button
            onClick={() => setActiveTab('cohort_months')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'cohort_months'
                ? 'border-[#00aae1] text-[#00aae1] bg-sky-50/50 dark:bg-[#16223f]'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pacientes Activos Cohorte ({activeMonthsList.length} meses)</span>
          </button>

          <button
            onClick={() => setActiveTab('hospital_stay')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'hospital_stay'
                ? 'border-[#00aae1] text-[#00aae1] bg-sky-50/50 dark:bg-[#16223f]'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Ingresos / Egresos ({ingresosEgresos.length})</span>
          </button>
        </div>

        {/* TAB CONTENTS - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* TAB 1: DETALLE DE CONSUMOS CUPS (q1_q2) */}
          {activeTab === 'cups' && (
            <div className="space-y-4">
              
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-[#16223f] p-3.5 rounded-2xl border border-[#e2e8eb] dark:border-[#223354]">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por descripción, nomenclador..."
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0b1329] border border-[#e2e8eb] dark:border-[#223354] rounded-xl text-xs text-[#033d59] dark:text-white focus:outline-none focus:border-[#00aae1]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter className="w-4 h-4 text-[#035476] dark:text-[#94a3b8]" />
                  <span className="text-xs font-semibold text-[#035476] dark:text-[#94a3b8] whitespace-nowrap">Nomenclador:</span>
                  <select
                    value={selectedNomenclador}
                    onChange={(e) => setSelectedNomenclador(e.target.value)}
                    className="bg-white dark:bg-[#0b1329] border border-[#e2e8eb] dark:border-[#223354] rounded-xl px-3 py-1.5 text-xs text-[#033d59] dark:text-white font-medium focus:outline-none focus:border-[#00aae1]"
                  >
                    <option value="Todos">Todos ({q1q2.length})</option>
                    {nomencladoresList.map((nom) => (
                      <option key={nom} value={nom}>
                        {nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-right text-xs font-semibold text-[#035476] dark:text-[#94a3b8] ml-auto">
                  Total Selección: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{formatCOP(totalFilteredCost)}</strong>
                </div>
              </div>

              {/* Table */}
              <div className="border border-[#e2e8eb] dark:border-[#223354] rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 dark:bg-[#16223f] text-[#035476] dark:text-[#94a3b8] font-bold uppercase text-[10px] tracking-wider border-b border-[#e2e8eb] dark:border-[#223354]">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Mes Emisión / Rep.</th>
                        <th className="py-3 px-4">Fecha Servicio</th>
                        <th className="py-3 px-4">Nomenclador / Categoría</th>
                        <th className="py-3 px-4">Descripción CUPS Unificado</th>
                        <th className="py-3 px-4 text-right">Costo Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8eb] dark:divide-[#1e293b]">
                      {paginatedCups.map((item, idx) => {
                        const itemIndex = cupsStartIndex + idx + 1;
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-sky-50/40 dark:hover:bg-[#16223f]/50 transition-colors"
                          >
                            <td className="py-2.5 px-4 font-mono text-gray-400 text-[11px]">{itemIndex}</td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className="font-semibold text-[#033d59] dark:text-white block">{item.Mes_Emision}</span>
                              <span className="text-[10px] text-gray-400">Rep: {item.Mes_Reporte}</span>
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                              {item.fecha_servicio ? item.fecha_servicio.slice(0, 10) : '—'}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getNomencladorColor(item.Nomenclador_C)}`}>
                                {item.Nomenclador_C}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-medium text-[#033d59] dark:text-gray-200 max-w-md">
                              {item.Des_CUPS_Unificado}
                            </td>
                            <td className="py-2.5 px-4 text-right whitespace-nowrap font-extrabold text-[#033d59] dark:text-emerald-400">
                              {formatCOP(item['Costo Total'])}
                            </td>
                          </tr>
                        );
                      })}
                      {paginatedCups.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400">
                            No se encontraron servicios que coincidan con la búsqueda o filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION FOOTER - CUPS */}
                <div className="p-3 bg-slate-50 dark:bg-[#16223f] border-t border-[#e2e8eb] dark:border-[#223354] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Filas por página:</span>
                    <select
                      value={cupsPerPage}
                      onChange={(e) => {
                        setCupsPerPage(Number(e.target.value));
                        setCupsPage(1);
                      }}
                      className="bg-white dark:bg-[#0b1329] border border-[#e2e8eb] dark:border-[#223354] rounded-lg px-2 py-1 text-xs font-bold text-[#033d59] dark:text-white cursor-pointer focus:outline-none focus:border-[#00aae1]"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>

                    <span className="text-gray-400">|</span>

                    <span className="text-gray-600 dark:text-gray-300">
                      Mostrando <strong>{filteredCups.length === 0 ? 0 : cupsStartIndex + 1}</strong> -{' '}
                      <strong>{cupsEndIndex}</strong> de <strong>{filteredCups.length}</strong> servicios
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCupsPage(1)}
                      disabled={cupsPage === 1}
                      title="Primera página"
                      className="p-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCupsPage((prev) => Math.max(1, prev - 1))}
                      disabled={cupsPage === 1}
                      title="Página anterior"
                      className="px-2.5 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] font-bold text-[#033d59] dark:text-white hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    <span className="px-3 py-1 text-xs font-bold text-[#035476] dark:text-[#94a3b8]">
                      Página <strong className="text-[#00aae1] dark:text-[#38bdf8]">{cupsPage}</strong> de{' '}
                      <strong className="text-[#033d59] dark:text-white">{cupsTotalPages}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setCupsPage((prev) => Math.min(cupsTotalPages, prev + 1))}
                      disabled={cupsPage === cupsTotalPages || cupsTotalPages === 0}
                      title="Página siguiente"
                      className="px-2.5 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] font-bold text-[#033d59] dark:text-white hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCupsPage(cupsTotalPages)}
                      disabled={cupsPage === cupsTotalPages || cupsTotalPages === 0}
                      title="Última página"
                      className="p-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: URGENCIAS VS HOSPITALIZACIÓN */}
          {activeTab === 'stats' && generalData && (
            <div className="space-y-6">
              
              <div className="bg-sky-50/50 dark:bg-[#16223f]/50 p-4 rounded-2xl border border-sky-100 dark:border-[#223354] flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#033d59] dark:text-white">
                    Estadísticas Comparativas de la Cohorte ({costData.costos_data?.mes_corte})
                  </h3>
                  <p className="text-xs text-[#035476] dark:text-[#94a3b8]">
                    Fecha de corte cohorte: <strong>{generalData.fecha_final?.slice(0, 10)}</strong> • Mes Máximo analizado: <strong>{generalData.mes_maximo}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Urgencias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Hospitalización</span>
                  </div>
                </div>
              </div>

              {/* Table of Monthly Stats */}
              <div className="border border-[#e2e8eb] dark:border-[#223354] rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 dark:bg-[#16223f] text-[#035476] dark:text-[#94a3b8] font-bold uppercase text-[10px] tracking-wider border-b border-[#e2e8eb] dark:border-[#223354]">
                        <th className="py-3 px-4">Mes Relativo</th>
                        <th className="py-3 px-4">Pacientes Activos</th>
                        <th className="py-3 px-4 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">Urgencias (Costo Total)</th>
                        <th className="py-3 px-4 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">Urgencias (Pac. Consumo)</th>
                        <th className="py-3 px-4 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">Urgencias (Promedio)</th>
                        <th className="py-3 px-4 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">Hosp. (Costo Total)</th>
                        <th className="py-3 px-4 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">Hosp. (Pac. Consumo)</th>
                        <th className="py-3 px-4 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">Hosp. (Promedio)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8eb] dark:divide-[#1e293b]">
                      {paginatedStatsMonths.map((mKey) => {
                        const urg = generalData.estadisticas_urgencias[mKey] || {};
                        const hosp = generalData.estadisticas_hospitalizacion[mKey] || {};
                        const isPre = Number(mKey) < 0;
                        const label = isPre ? `Mes ${mKey}` : `Mes +${mKey}`;

                        return (
                          <tr key={mKey} className="hover:bg-sky-50/30 dark:hover:bg-[#16223f]/40 transition-colors">
                            <td className="py-2.5 px-4 font-bold text-[#033d59] dark:text-white">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isPre ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}>
                                {label}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-gray-700 dark:text-gray-300">
                              {urg.pacientes_activos ?? hosp.pacientes_activos ?? '—'}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/10">
                              {formatCOP(urg.costo_total)}
                            </td>
                            <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300 bg-amber-50/30 dark:bg-amber-950/10">
                              {urg.pacientes_con_consumo || 0}
                            </td>
                            <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300 bg-amber-50/30 dark:bg-amber-950/10 font-mono">
                              {formatCOP(urg.costo_promedio)}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-rose-700 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/10">
                              {formatCOP(hosp.costo_total)}
                            </td>
                            <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300 bg-rose-50/30 dark:bg-rose-950/10">
                              {hosp.pacientes_con_consumo || 0}
                            </td>
                            <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300 bg-rose-50/30 dark:bg-rose-950/10 font-mono">
                              {formatCOP(hosp.costo_promedio)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION FOOTER - STATS */}
                <div className="p-3 bg-slate-50 dark:bg-[#16223f] border-t border-[#e2e8eb] dark:border-[#223354] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Meses por página:</span>
                    <select
                      value={statsPerPage}
                      onChange={(e) => {
                        setStatsPerPage(Number(e.target.value));
                        setStatsPage(1);
                      }}
                      className="bg-white dark:bg-[#0b1329] border border-[#e2e8eb] dark:border-[#223354] rounded-lg px-2 py-1 text-xs font-bold text-[#033d59] dark:text-white cursor-pointer focus:outline-none focus:border-[#00aae1]"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={24}>24 (Todos)</option>
                    </select>

                    <span className="text-gray-400">|</span>

                    <span className="text-gray-600 dark:text-gray-300">
                      Mostrando <strong>{statsMonths.length === 0 ? 0 : statsStartIndex + 1}</strong> -{' '}
                      <strong>{statsEndIndex}</strong> de <strong>{statsMonths.length}</strong> meses
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStatsPage((prev) => Math.max(1, prev - 1))}
                      disabled={statsPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] font-bold text-[#033d59] dark:text-white hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>

                    <span className="px-3 py-1 text-xs font-bold text-[#035476] dark:text-[#94a3b8]">
                      Página <strong className="text-[#00aae1] dark:text-[#38bdf8]">{statsPage}</strong> de{' '}
                      <strong className="text-[#033d59] dark:text-white">{statsTotalPages}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setStatsPage((prev) => Math.min(statsTotalPages, prev + 1))}
                      disabled={statsPage === statsTotalPages || statsTotalPages === 0}
                      className="px-2.5 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] font-bold text-[#033d59] dark:text-white hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: PACIENTES ACTIVOS POR MES */}
          {activeTab === 'cohort_months' && generalData?.pacientes_activos_por_mes && (
            <div className="space-y-4">
              <div className="bg-sky-50/50 dark:bg-[#16223f]/50 p-4 rounded-2xl border border-sky-100 dark:border-[#223354]">
                <h3 className="text-sm font-bold text-[#033d59] dark:text-white">
                  Distribución y Recuento de Pacientes Activos por Mes en la Cohorte
                </h3>
                <p className="text-xs text-[#035476] dark:text-[#94a3b8]">
                  Desglose de pacientes en seguimiento activo mes a mes y lista de cédulas asociadas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {paginatedActiveMonths.map((mKey) => {
                  const arr = generalData.pacientes_activos_por_mes[mKey] || [];
                  const isPre = Number(mKey) < 0;
                  const label = isPre ? `Mes ${mKey}` : `Mes +${mKey}`;

                  return (
                    <div
                      key={mKey}
                      className="bg-white dark:bg-[#16223f] border border-[#e2e8eb] dark:border-[#223354] rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                            isPre ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {label}
                          </span>
                          <span className="text-xs font-bold text-[#033d59] dark:text-white">
                            {arr.length} pacientes
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-500 dark:text-gray-400 max-h-28 overflow-y-auto space-y-1 font-mono">
                          <div className="flex flex-wrap gap-1">
                            {arr.map((cedula, cIdx) => (
                              <span
                                key={cIdx}
                                className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  String(cedula) === String(costData.requested_user_id) || String(cedula) === '6070110'
                                    ? 'bg-sky-500 text-white font-bold'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {cedula}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION FOOTER - COHORT ACTIVE MONTHS */}
              <div className="p-3 bg-slate-50 dark:bg-[#16223f] rounded-2xl border border-[#e2e8eb] dark:border-[#223354] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Meses por página:</span>
                  <select
                    value={activeMonthsPerPage}
                    onChange={(e) => {
                      setActiveMonthsPerPage(Number(e.target.value));
                      setActiveMonthsPage(1);
                    }}
                    className="bg-white dark:bg-[#0b1329] border border-[#e2e8eb] dark:border-[#223354] rounded-lg px-2 py-1 text-xs font-bold text-[#033d59] dark:text-white cursor-pointer focus:outline-none focus:border-[#00aae1]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={24}>24 (Todos)</option>
                  </select>

                  <span className="text-gray-400">|</span>

                  <span className="text-gray-600 dark:text-gray-300">
                    Mostrando <strong>{activeMonthsList.length === 0 ? 0 : activeMonthsStartIndex + 1}</strong> -{' '}
                    <strong>{activeMonthsEndIndex}</strong> de <strong>{activeMonthsList.length}</strong> periodos
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveMonthsPage((prev) => Math.max(1, prev - 1))}
                    disabled={activeMonthsPage === 1}
                    className="px-2.5 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] font-bold text-[#033d59] dark:text-white hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <span className="px-3 py-1 text-xs font-bold text-[#035476] dark:text-[#94a3b8]">
                    Página <strong className="text-[#00aae1] dark:text-[#38bdf8]">{activeMonthsPage}</strong> de{' '}
                    <strong className="text-[#033d59] dark:text-white">{activeMonthsTotalPages}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveMonthsPage((prev) => Math.min(activeMonthsTotalPages, prev + 1))}
                    disabled={activeMonthsPage === activeMonthsTotalPages || activeMonthsTotalPages === 0}
                    className="px-2.5 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] font-bold text-[#033d59] dark:text-white hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: INGRESOS / EGRESOS */}
          {activeTab === 'hospital_stay' && (
            <div className="space-y-4">
              <div className="bg-sky-50/50 dark:bg-[#16223f]/50 p-4 rounded-2xl border border-sky-100 dark:border-[#223354]">
                <h3 className="text-sm font-bold text-[#033d59] dark:text-white">
                  Historial de Ingresos y Egresos Hospitalarios del Paciente
                </h3>
                <p className="text-xs text-[#035476] dark:text-[#94a3b8]">
                  Eventos de hospitalización registrados y cálculo del riesgo clínico asociado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedStays.map((stay, idx) => {
                  const eventIndex = staysStartIndex + idx + 1;
                  return (
                    <div
                      key={idx}
                      className="bg-white dark:bg-[#16223f] border border-[#e2e8eb] dark:border-[#223354] rounded-2xl p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider">
                          Evento #{eventIndex}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 capitalize flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Riesgo {stay.riesgo}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Fecha Ingreso</span>
                          <span className="text-xs font-bold text-[#033d59] dark:text-white">
                            {stay.fecha_ingreso ? stay.fecha_ingreso.slice(0, 10) : '—'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Fecha Egreso</span>
                          <span className="text-xs font-bold text-[#033d59] dark:text-white">
                            {stay.fecha_egreso ? stay.fecha_egreso.slice(0, 10) : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[#035476] dark:text-[#94a3b8] flex items-center justify-between pt-1">
                        <span>Cédula Registrada:</span>
                        <code className="font-mono font-bold text-[#033d59] dark:text-white">{stay.Cedula_Costos}</code>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION FOOTER - STAYS (if > staysPerPage) */}
              {ingresosEgresos.length > staysPerPage && (
                <div className="p-3 bg-slate-50 dark:bg-[#16223f] rounded-2xl border border-[#e2e8eb] dark:border-[#223354] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-gray-600 dark:text-gray-300">
                    Mostrando <strong>{staysStartIndex + 1}</strong> - <strong>{staysEndIndex}</strong> de <strong>{ingresosEgresos.length}</strong> eventos
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStaysPage((prev) => Math.max(1, prev - 1))}
                      disabled={staysPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] font-bold text-[#033d59] dark:text-white hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-[#035476] dark:text-[#94a3b8]">
                      Página {staysPage} de {staysTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStaysPage((prev) => Math.min(staysTotalPages, prev + 1))}
                      disabled={staysPage === staysTotalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-[#e2e8eb] dark:border-[#223354] bg-white dark:bg-[#0b1329] font-bold text-[#033d59] dark:text-white hover:bg-[#00aae1] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* BOTTOM FOOTER */}
        <div className="px-6 py-3.5 border-t border-[#e2e8eb] dark:border-[#1e293b] bg-slate-50 dark:bg-[#0c1427] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#00aae1] hover:bg-[#0196d4] text-white font-bold text-xs rounded-full shadow-md transition cursor-pointer"
          >
            Cerrar Reporte
          </button>
        </div>

      </div>
    </div>
  );
};
