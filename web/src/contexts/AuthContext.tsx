// 🔐 CONTEXTO DE AUTENTICACIÓN

import React, { createContext, useState, useEffect, useContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import authService from '../services/authService';

interface AuthContextData {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar preferencia de sesión al iniciar
    const checkRememberMe = async () => {
      const rememberMe = localStorage.getItem('rememberMe');
      
      // Si el usuario NO quiere mantener sesión y hay un usuario autenticado, cerrar sesión
      if (rememberMe === 'false') {
        await authService.logout();
      }
    };

    checkRememberMe();

    // Observar cambios en el estado de autenticación
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Cerrar sesión al cerrar pestaña si no está marcado "mantener sesión"
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const rememberMe = localStorage.getItem('rememberMe');
      if (rememberMe === 'false' && user) {
        await authService.logout();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      await authService.register(email, password, displayName);
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
