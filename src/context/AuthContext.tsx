import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, SendCodeResult, VerifyCodeResult } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendCode: (idType: number, id: string) => Promise<SendCodeResult>;
  resendCode: (accessId: number) => Promise<{ success: boolean; message?: string }>;
  verifyCode: (
    accessId: number,
    code: string,
    roleId?: number,
    id?: string,
    idType?: number
  ) => Promise<VerifyCodeResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'tkr_panel_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restaurar sesión persistida
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id_usuario) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Error restaurando sesión de usuario:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendCode = async (idType: number, id: string): Promise<SendCodeResult> => {
    try {
      const response = await fetch('/api/auth?action=send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idType, id }),
      });

      const data = await response.json();

      if (data.errorCode === 0) {
        return {
          success: true,
          accessId: data.accessId,
          roleId: data.roleId,
          maskedPhone: data.maskedPhone,
          maskedEmail: data.maskedEmail,
          devNotice: data.devNotice,
        };
      } else {
        return {
          success: false,
          error: data.errorMsg || 'No se pudo generar el código de acceso.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Error de conexión con el servidor.',
      };
    }
  };

  const resendCode = async (accessId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/auth?action=resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessId }),
      });

      const data = await response.json();
      if (data.errorCode === 0) {
        return { success: true, message: data.message || 'Código reenviado con éxito' };
      }
      return { success: false, message: data.errorMsg || 'Error al reenviar el código' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error de red al reenviar código' };
    }
  };

  const verifyCode = async (
    accessId: number,
    code: string,
    roleId = 2,
    id = '',
    idType = 4
  ): Promise<VerifyCodeResult> => {
    try {
      const response = await fetch('/api/auth?action=verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessId, code, roleId, id, idType }),
      });

      const data = await response.json();

      if (data.errorCode === 0 && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        } catch (_) {}
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else {
        return {
          success: false,
          error: data.errorMsg || 'Código incorrecto o expirado.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Error de comunicación al validar el código.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sendCode,
        resendCode,
        verifyCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
