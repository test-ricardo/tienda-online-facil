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
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      combo_items: {
        Row: {
          combo_id: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          combo_id: string
          id?: string
          product_id: string
          quantity: number
        }
        Update: {
          combo_id?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "combo_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "product_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combo_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      expiration_alerts: {
        Row: {
          alert_type: string
          created_at: string
          created_by: string
          days_before_expiration: number
          id: string
          is_active: boolean | null
          reference_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          created_by: string
          days_before_expiration?: number
          id?: string
          is_active?: boolean | null
          reference_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          created_by?: string
          days_before_expiration?: number
          id?: string
          is_active?: boolean | null
          reference_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          batch_number: string | null
          entry_date: string
          expiration_date: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          supplier: string | null
        }
        Insert: {
          batch_number?: string | null
          entry_date?: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity?: number
          supplier?: string | null
        }
        Update: {
          batch_number?: string | null
          entry_date?: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_combos: {
        Row: {
          combo_price: number
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          combo_price: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          combo_price?: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string
          cost: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          max_stock: number | null
          min_stock: number | null
          name: string
          price: number
          sell_by_weight: boolean | null
          sku: string
          stock_unit: string | null
          subcategory_id: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category_id: string
          cost: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_stock?: number | null
          min_stock?: number | null
          name: string
          price: number
          sell_by_weight?: boolean | null
          sku: string
          stock_unit?: string | null
          subcategory_id?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category_id?: string
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          price?: number
          sell_by_weight?: boolean | null
          sku?: string
          stock_unit?: string | null
          subcategory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      combo_has_stock: {
        Args: { combo_id: string }
        Returns: boolean
      }
      get_expiring_products: {
        Args: { days_ahead?: number }
        Returns: {
          product_id: string
          product_name: string
          quantity: number
          expiration_date: string
          days_until_expiry: number
        }[]
      }
      get_product_stock: {
        Args: { product_id: string }
        Returns: number
      }
      get_user_roles: {
        Args: { _user_id?: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "cashier" | "inventory"
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
      app_role: ["admin", "manager", "cashier", "inventory"],
    },
  },
} as const
