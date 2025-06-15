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
      cash_counts: {
        Row: {
          count: number
          created_at: string
          denomination: number
          id: string
          session_id: string
          total_value: number | null
          updated_at: string
        }
        Insert: {
          count?: number
          created_at?: string
          denomination: number
          id?: string
          session_id: string
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          count?: number
          created_at?: string
          denomination?: number
          id?: string
          session_id?: string
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_counts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_register_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_register_sessions: {
        Row: {
          closing_amount: number | null
          created_at: string
          difference_amount: number | null
          end_time: string | null
          expected_amount: number | null
          id: string
          notes: string | null
          opening_amount: number
          start_time: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closing_amount?: number | null
          created_at?: string
          difference_amount?: number | null
          end_time?: string | null
          expected_amount?: number | null
          id?: string
          notes?: string | null
          opening_amount?: number
          start_time?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closing_amount?: number | null
          created_at?: string
          difference_amount?: number | null
          end_time?: string | null
          expected_amount?: number | null
          id?: string
          notes?: string | null
          opening_amount?: number
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      customer_account_movements: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          created_by: string
          customer_id: string
          description: string
          id: string
          movement_type: string
          reference_id: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          created_by: string
          customer_id: string
          description: string
          id?: string
          movement_type: string
          reference_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          created_by?: string
          customer_id?: string
          description?: string
          id?: string
          movement_type?: string
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_account_movements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          credit_limit: number
          current_balance: number
          customer_code: string
          document_number: string | null
          document_type: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          credit_limit?: number
          current_balance?: number
          customer_code: string
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          credit_limit?: number
          current_balance?: number
          customer_code?: string
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
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
      sale_items: {
        Row: {
          combo_id: string | null
          created_at: string
          id: string
          item_name: string
          product_id: string | null
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          combo_id?: string | null
          created_at?: string
          id?: string
          item_name: string
          product_id?: string | null
          quantity?: number
          sale_id: string
          total_price?: number
          unit_price?: number
        }
        Update: {
          combo_id?: string | null
          created_at?: string
          id?: string
          item_name?: string
          product_id?: string | null
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "product_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_method: string
          reference: string | null
          sale_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_method: string
          reference?: string | null
          sale_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string
          reference?: string | null
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          created_by: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          discount_amount: number
          id: string
          notes: string | null
          paid_amount: number
          payment_method: string
          payment_status: string
          pending_amount: number
          sale_number: string
          sale_status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_method?: string
          payment_status?: string
          pending_amount?: number
          sale_number: string
          sale_status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_method?: string
          payment_status?: string
          pending_amount?: number
          sale_number?: string
          sale_status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      can_customer_buy_on_account: {
        Args: { customer_id: string; sale_amount: number }
        Returns: boolean
      }
      combo_has_stock: {
        Args: { combo_id: string }
        Returns: boolean
      }
      generate_customer_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_sale_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_cash_session: {
        Args: { user_id_param?: string }
        Returns: string
      }
      get_customer_account_summary: {
        Args: { customer_id: string }
        Returns: {
          total_sales: number
          total_payments: number
          current_balance: number
          credit_limit: number
          available_credit: number
        }[]
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
