export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      fotocopiadoras: {
        Row: {
          id: string
          negocio_id: string | null
          nombre: string | null
          ubicacion: string | null
          usuario_id: string | null
        }
        Insert: {
          id?: string
          negocio_id?: string | null
          nombre?: string | null
          ubicacion?: string | null
          usuario_id?: string | null
        }
        Update: {
          id?: string
          negocio_id?: string | null
          nombre?: string | null
          ubicacion?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotocopiadoras_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotocopiadoras_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      insumos: {
        Row: {
          id: string
          negocio_id: string | null
          nombre: string
          precio: number
          usuario_id: string | null
        }
        Insert: {
          id?: string
          negocio_id?: string | null
          nombre: string
          precio: number
          usuario_id?: string | null
        }
        Update: {
          id?: string
          negocio_id?: string | null
          nombre?: string
          precio?: number
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insumos_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insumos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      machines: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "machines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      negocios: {
        Row: {
          created_at: string
          descripcion: string | null
          direccion: string | null
          email: string | null
          id: string
          nombre: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      precios: {
        Row: {
          id: string
          negocio_id: string | null
          precio: number | null
          tipo: string | null
          usuario_id: string | null
        }
        Insert: {
          id?: string
          negocio_id?: string | null
          precio?: number | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Update: {
          id?: string
          negocio_id?: string | null
          precio?: number | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precios_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          machine_id: string | null
          negocio_id: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          supply_name: string | null
          unit_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          machine_id?: string | null
          negocio_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          supply_name?: string | null
          unit_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          machine_id?: string | null
          negocio_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          supply_name?: string | null
          unit_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pricing_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_records: {
        Row: {
          created_at: string | null
          current_value: number
          date: string
          id: string
          machine_id: string
          previous_value: number
          quantity: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          total: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number
          date?: string
          id?: string
          machine_id: string
          previous_value?: number
          quantity?: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          total?: number | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number
          date?: string
          id?: string
          machine_id?: string
          previous_value?: number
          quantity?: number | null
          service_type?: Database["public"]["Enums"]["service_type"]
          total?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_records_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_sales: {
        Row: {
          cantidad: number
          created_at: string | null
          fecha: string
          fotocopiadora_id: string
          id: string
          negocio_id: string | null
          nombre_insumo: string
          precio_unitario: number
          total: number
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          cantidad?: number
          created_at?: string | null
          fecha?: string
          fotocopiadora_id: string
          id?: string
          negocio_id?: string | null
          nombre_insumo: string
          precio_unitario?: number
          total?: number
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          fecha?: string
          fotocopiadora_id?: string
          id?: string
          negocio_id?: string | null
          nombre_insumo?: string
          precio_unitario?: number
          total?: number
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_supply_sales_fotocopiadora"
            columns: ["fotocopiadora_id"]
            isOneToOne: false
            referencedRelation: "fotocopiadoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_supply_sales_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_sales_fotocopiadora_id_fkey"
            columns: ["fotocopiadora_id"]
            isOneToOne: false
            referencedRelation: "fotocopiadoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_sales_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          email: string
          id: string
          nombre: string | null
        }
        Insert: {
          email: string
          id?: string
          nombre?: string | null
        }
        Update: {
          email?: string
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      usuarios_negocios: {
        Row: {
          created_at: string
          id: string
          negocio_id: string
          role: Database["public"]["Enums"]["business_role"]
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          negocio_id: string
          role?: Database["public"]["Enums"]["business_role"]
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          negocio_id?: string
          role?: Database["public"]["Enums"]["business_role"]
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_negocios_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_negocios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ventas: {
        Row: {
          cantidad: number | null
          errores: number | null
          fecha: string
          fotocopiadora_id: string | null
          id: string
          negocio_id: string | null
          nombre_insumo: string | null
          precio_unitario: number | null
          tipo: string | null
          total: number | null
          usuario_id: string | null
          valor_actual: number | null
          valor_anterior: number | null
        }
        Insert: {
          cantidad?: number | null
          errores?: number | null
          fecha: string
          fotocopiadora_id?: string | null
          id?: string
          negocio_id?: string | null
          nombre_insumo?: string | null
          precio_unitario?: number | null
          tipo?: string | null
          total?: number | null
          usuario_id?: string | null
          valor_actual?: number | null
          valor_anterior?: number | null
        }
        Update: {
          cantidad?: number | null
          errores?: number | null
          fecha?: string
          fotocopiadora_id?: string | null
          id?: string
          negocio_id?: string | null
          nombre_insumo?: string | null
          precio_unitario?: number | null
          tipo?: string | null
          total?: number | null
          usuario_id?: string | null
          valor_actual?: number | null
          valor_anterior?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ventas_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_fotocopiadora_id_fkey"
            columns: ["fotocopiadora_id"]
            isOneToOne: false
            referencedRelation: "fotocopiadoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_business_role: {
        Args: { _user_id: string; _negocio_id: string }
        Returns: Database["public"]["Enums"]["business_role"]
      }
      get_user_business_role_with_super_admin: {
        Args: { _user_id: string; _negocio_id: string }
        Returns: Database["public"]["Enums"]["business_role"]
      }
      has_business_role: {
        Args: {
          _user_id: string
          _negocio_id: string
          _role: Database["public"]["Enums"]["business_role"]
        }
        Returns: boolean
      }
      has_minimum_business_role: {
        Args: {
          _user_id: string
          _negocio_id: string
          _minimum_role: Database["public"]["Enums"]["business_role"]
        }
        Returns: boolean
      }
      has_minimum_business_role_with_super_admin: {
        Args: {
          _user_id: string
          _negocio_id: string
          _minimum_role: Database["public"]["Enums"]["business_role"]
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      business_role: "admin" | "operador" | "viewer"
      service_type: "color_copies" | "bw_copies" | "color_prints" | "bw_prints"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      business_role: ["admin", "operador", "viewer"],
      service_type: ["color_copies", "bw_copies", "color_prints", "bw_prints"],
    },
  },
} as const
