import React from 'react';
import { Patient } from '../types';
import { Bell, ArrowRight } from 'lucide-react';

interface AlarmBannerProps {
  patients: Patient[];
  onActivateAlarmFilter: () => void;
}

export const AlarmBanner: React.FC<AlarmBannerProps> = ({ patients, onActivateAlarmFilter }) => {
  const alarmPatients = patients.filter((p) => p.hasAlarm);

  if (alarmPatients.length === 0) return null;

  // Aggregate alarm lines (1 line per alarm with count of patients)
  let medGenPatients = 0;
  let fueraCuadroPatients = 0;
  let especialidadVencidaPatients = 0;

  alarmPatients.forEach((p) => {
    let hasMedGen = false;
    let hasFueraCuadro = false;
    let hasEspVencida = false;

    p.alarmReasons.forEach((r) => {
      const lower = r.toLowerCase();
      if (lower.includes('medicina general')) hasMedGen = true;
      if (lower.includes('cuadro médico') || lower.includes('cuadro medico') || lower.includes('fuera de red')) hasFueraCuadro = true;
      if (lower.includes('vencida') && !lower.includes('medicina general')) hasEspVencida = true;
    });

    if (hasMedGen) medGenPatients++;
    if (hasFueraCuadro) fueraCuadroPatients++;
    if (hasEspVencida) especialidadVencidaPatients++;
  });

  const alarmLines: string[] = [];

  if (medGenPatients > 0) {
    alarmLines.push(
      `${medGenPatients} ${medGenPatients === 1 ? 'Paciente lleva' : 'Pacientes llevan'} más de 3 meses sin visita de Medicina General.`
    );
  }

  if (fueraCuadroPatients > 0) {
    alarmLines.push(
      `${fueraCuadroPatients} ${fueraCuadroPatients === 1 ? 'Paciente' : 'Pacientes'} con cita de Especialista diferente al cuadro médico asociado.`
    );
  }

  if (especialidadVencidaPatients > 0) {
    alarmLines.push(
      `${especialidadVencidaPatients} ${especialidadVencidaPatients === 1 ? 'Paciente' : 'Pacientes'} con atención de Especialidad vencida.`
    );
  }

  if (alarmLines.length === 0) {
    alarmLines.push(`${alarmPatients.length} Pacientes con alertas de gestión activas.`);
  }

  return (
    <div className="bg-[#fffbeb] border border-[#fbbf24] rounded-xl p-3 max-w-[1550px] w-full mx-auto my-2 font-sans shadow-2xs flex items-start justify-between gap-3 text-xs text-[#b45309]">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 bg-[#fbbf24] text-white rounded-lg shrink-0 mt-0.5">
          <Bell className="w-4 h-4 fill-white" />
        </div>
        <div className="space-y-1">
          {alarmLines.map((line, index) => (
            <p key={index} className="text-xs font-semibold text-[#92400e] leading-snug">
              ⚠️ {line}
            </p>
          ))}
        </div>
      </div>

      <button
        onClick={onActivateAlarmFilter}
        className="px-3 py-1.5 bg-[#fef3c7] hover:bg-[#fde68a] border border-[#f59e0b]/40 rounded-lg font-bold text-xs text-[#92400e] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs self-center"
      >
        <span>Ver Pacientes Afectados</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
