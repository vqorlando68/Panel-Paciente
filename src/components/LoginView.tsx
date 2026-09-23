import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { COLOMBIA_DOC_TYPES } from '../types/auth';
import { ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, KeyRound, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { sendCode, resendCode, verifyCode } = useAuth();

  // Paso 1: 'identification' | Paso 2: 'otp'
  const [step, setStep] = useState<'identification' | 'otp'>('identification');

  // Datos Paso 1
  const [selectedDocType, setSelectedDocType] = useState<number>(4); // CC por defecto
  const [docNumber, setDocNumber] = useState<string>('');
  const [isSubmittingDoc, setIsSubmittingDoc] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);

  // Datos Paso 2
  const [accessId, setAccessId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number>(2);
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [devNotice, setDevNotice] = useState<string | null>(null);

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  // Temporizador de 90 segundos
  const [secondsLeft, setSecondsLeft] = useState<number>(90);
  const [isResending, setIsResending] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any = null;
    if (step === 'otp' && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, secondsLeft]);

  // Manejador Paso 1: Enviar Documento
  const handleSubmitIdentification = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError(null);

    const cleanDoc = docNumber.trim();
    if (!cleanDoc) {
      setDocError('Por favor ingrese su número de documento.');
      return;
    }

    if (cleanDoc.length < 4) {
      setDocError('El documento debe contener al menos 4 caracteres.');
      return;
    }

    setIsSubmittingDoc(true);
    const result = await sendCode(selectedDocType, cleanDoc);
    setIsSubmittingDoc(false);

    if (result.success && result.accessId) {
      setAccessId(result.accessId);
      setRoleId(result.roleId || 2);
      setMaskedPhone(result.maskedPhone || 'su teléfono');
      setMaskedEmail(result.maskedEmail || 'su correo');
      setDevNotice(result.devNotice || null);
      setSecondsLeft(90);
      setOtpDigits(['', '', '', '']);
      setOtpError(null);
      setStep('otp');

      // Auto-enfoque en el primer input de OTP
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } else {
      setDocError(result.error || 'No se pudo iniciar sesión. Verifique los datos ingresados.');
    }
  };

  // Manejador de Inputs OTP
  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1); // Solo dígitos numéricos
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);
    setOtpError(null);

    // Si se escribió un dígito, pasar al siguiente input
    if (cleanValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Si se completaron los 4 dígitos, validar automáticamente
    if (cleanValue && index === 3 && newDigits.every((d) => d !== '')) {
      handleValidateOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      const newDigits = ['', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      if (pastedData.length === 4) {
        handleValidateOtp(pastedData);
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  // Manejador Paso 2: Validar OTP
  const handleValidateOtp = async (codeOverride?: string) => {
    const code = codeOverride || otpDigits.join('');
    if (code.length !== 4) {
      setOtpError('Por favor complete los 4 dígitos del código.');
      return;
    }

    if (!accessId) {
      setOtpError('Sesión expirada. Regrese al paso anterior.');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    const result = await verifyCode(accessId, code, roleId, docNumber, selectedDocType);
    setIsVerifying(false);

    if (result.success) {
      if (onSuccess) onSuccess();
    } else {
      setOtpError(result.error || 'Código incorrecto o vencido. Intente de nuevo.');
      setOtpDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  // Manejador de Reenvío de código
  const handleResendCode = async () => {
    if (!accessId || secondsLeft > 0 || isResending) return;

    setIsResending(true);
    setResendSuccess(null);
    setOtpError(null);

    const res = await resendCode(accessId);
    setIsResending(false);

    if (res.success) {
      setSecondsLeft(90);
      setResendSuccess('Se ha enviado un nuevo código a su teléfono y correo.');
      setTimeout(() => setResendSuccess(null), 5000);
    } else {
      setOtpError(res.message || 'No fue posible reenviar el código.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#effaff] to-[#e0f2fe] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] flex items-center justify-center p-4 selection:bg-[#00aae1] selection:text-white transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-3xl shadow-xl p-8 relative overflow-hidden backdrop-blur-md">
        {/* Glow decorativo de marca */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00aae1]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#035476]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado Logo TeKer */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00aae1] to-[#38bdf8] text-white shadow-md shadow-[#00aae1]/25 mb-4">
            {step === 'identification' ? <ShieldCheck className="w-8 h-8" /> : <KeyRound className="w-7 h-7" />}
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#00aae1] dark:text-[#38bdf8]">
              Plataforma TeKer
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00aae1]/10 text-[#00aae1] dark:text-[#38bdf8] font-bold">
              SIAU
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#033d59] dark:text-[#f8fafc] tracking-tight">
            {step === 'identification' ? 'Iniciar Sesión' : 'Verificar Código'}
          </h1>
          <p className="text-xs text-[#035476]/80 dark:text-[#94a3b8] mt-1">
            {step === 'identification'
              ? 'Acceso seguro al Panel de Pacientes y Gestión de Riesgo'
              : 'Ingrese el PIN de 4 dígitos enviado a sus canales de contacto'}
          </p>
        </div>

        {/* ===================== PASO 1: IDENTIFICACIÓN ===================== */}
        {step === 'identification' && (
          <form onSubmit={handleSubmitIdentification} className="space-y-5">
            {docError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{docError}</span>
              </div>
            )}

            {/* Selector Tipo de Documento */}
            <div>
              <label className="block text-xs font-semibold text-[#033d59] dark:text-[#cbd5e1] mb-1.5">
                Tipo de Identificación
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00aae1]/40 focus:border-[#00aae1] transition-all cursor-pointer"
              >
                {COLOMBIA_DOC_TYPES.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.code} - {dt.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Número de Documento */}
            <div>
              <label className="block text-xs font-semibold text-[#033d59] dark:text-[#cbd5e1] mb-1.5">
                Número de Documento
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Ej: 1020304050"
                  autoFocus
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm font-medium bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00aae1]/40 focus:border-[#00aae1] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Ingrese sin puntos ni guiones.
              </p>
            </div>

            {/* Botón Continuar */}
            <button
              type="submit"
              disabled={isSubmittingDoc}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#00aae1] to-[#035476] hover:from-[#0098ca] hover:to-[#02435e] shadow-md shadow-[#00aae1]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmittingDoc ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validando acceso...</span>
                </>
              ) : (
                <>
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ===================== PASO 2: VALIDACIÓN OTP ===================== */}
        {step === 'otp' && (
          <div className="space-y-6">
            {/* Destino del código */}
            <div className="bg-[#effaff] dark:bg-[#00aae1]/10 border border-[#00aae1]/20 rounded-2xl p-4 text-xs text-[#035476] dark:text-[#bae6fd]">
              <p className="font-semibold text-[#033d59] dark:text-[#f8fafc] mb-1">
                Código de seguridad enviado a:
              </p>
              <div className="space-y-0.5">
                <p>
                  <span className="font-medium text-slate-500 dark:text-slate-400">WhatsApp:</span>{' '}
                  <span className="font-semibold">{maskedPhone}</span>
                </p>
                <p>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Correo:</span>{' '}
                  <span className="font-semibold">{maskedEmail}</span>
                </p>
              </div>
            </div>

            {devNotice && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>{devNotice}</span>
              </div>
            )}

            {otpError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{otpError}</span>
              </div>
            )}

            {resendSuccess && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>{resendSuccess}</span>
              </div>
            )}

            {/* Inputs de 4 dígitos */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isVerifying}
                  className="w-14 h-14 text-center text-2xl font-bold rounded-2xl bg-slate-50 dark:bg-[#0f172a] border-2 border-slate-200 dark:border-[#334155] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00aae1]/50 focus:border-[#00aae1] transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {/* Botón Verificar */}
            <button
              type="button"
              onClick={() => handleValidateOtp()}
              disabled={isVerifying || otpDigits.some((d) => d === '')}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#00aae1] to-[#035476] hover:from-[#0098ca] hover:to-[#02435e] shadow-md shadow-[#00aae1]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando código...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verificar y Entrar</span>
                </>
              )}
            </button>

            {/* Temporizador y Reenviar */}
            <div className="text-center pt-1 border-t border-slate-100 dark:border-[#334155]/60">
              {secondsLeft > 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Podrás solicitar un nuevo código en{' '}
                  <span className="font-bold text-[#00aae1] dark:text-[#38bdf8]">
                    {secondsLeft}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-xs font-semibold text-[#00aae1] dark:text-[#38bdf8] hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>Reenviar código de acceso</span>
                </button>
              )}
            </div>

            {/* Volver / Cambiar número */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('identification');
                  setOtpDigits(['', '', '', '']);
                  setOtpError(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cambiar número de documento</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer confidencialidad */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-[#334155]/60 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Conexión protegida por cifrado de extremo a extremo TeKer.
          </p>
        </div>
      </div>
    </div>
  );
};
