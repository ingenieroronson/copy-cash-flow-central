
export interface Business {
  id: string;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBusinessRole {
  id: string;
  usuario_id: string;
  negocio_id: string;
  role: 'admin' | 'operador' | 'viewer';
  created_at: string;
  updated_at: string;
  negocios?: Business;
  usuarios?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export type BusinessRole = 'admin' | 'operador' | 'viewer';
