
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth: Iniciando configuración de autenticación...');
    
    // Get initial session
    const getSession = async () => {
      try {
        console.log('useAuth: Obteniendo sesión inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuth: Error obteniendo sesión:', error);
          setLoading(false);
          return;
        }
        
        console.log('useAuth: Sesión obtenida:', session ? 'Usuario autenticado' : 'Sin sesión');
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('useAuth: Error inesperado en getSession:', error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    console.log('useAuth: Configurando listener de cambios de autenticación...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Cambio de estado de autenticación:', event, session ? 'Con sesión' : 'Sin sesión');
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      console.log('useAuth: Limpiando subscription...');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('useAuth: Intentando iniciar sesión para:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('useAuth: Error en signIn:', error);
      } else {
        console.log('useAuth: Inicio de sesión exitoso');
      }
      
      return { error };
    } catch (error) {
      console.error('useAuth: Error inesperado en signIn:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('useAuth: Intentando registro para:', email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        console.error('useAuth: Error en signUp:', error);
      } else {
        console.log('useAuth: Registro exitoso');
      }
      
      return { error };
    } catch (error) {
      console.error('useAuth: Error inesperado en signUp:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuth: Cerrando sesión...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('useAuth: Error en signOut:', error);
      } else {
        console.log('useAuth: Sesión cerrada exitosamente');
      }
      
      return { error };
    } catch (error) {
      console.error('useAuth: Error inesperado en signOut:', error);
      return { error };
    }
  };

  console.log('useAuth: Estado actual - loading:', loading, 'user:', user ? 'autenticado' : 'no autenticado');

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
