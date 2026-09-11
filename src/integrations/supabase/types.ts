export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          bkash_number: string
          created_at: string
          id: string
          min_deposit: number
          min_withdraw: number
          nagad_number: string
          updated_at: string
        }
        Insert: {
          bkash_number?: string
          created_at?: string
          id: string
          min_deposit?: number
          min_withdraw?: number
          nagad_number?: string
          updated_at?: string
        }
        Update: {
          bkash_number?: string
          created_at?: string
          id?: string
          min_deposit?: number
          min_withdraw?: number
          nagad_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          package_id: string | null
          sender_number: string
          status: Database["public"]["Enums"]["req_status"]
          trx_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["pay_method"]
          package_id?: string | null
          sender_number: string
          status?: Database["public"]["Enums"]["req_status"]
          trx_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          package_id?: string | null
          sender_number?: string
          status?: Database["public"]["Enums"]["req_status"]
          trx_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      job_submissions: {
        Row: {
          created_at: string
          id: string
          job_id: string
          proof: string | null
          reward: number
          status: Database["public"]["Enums"]["req_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          proof?: string | null
          reward?: number
          status?: Database["public"]["Enums"]["req_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          proof?: string | null
          reward?: number
          status?: Database["public"]["Enums"]["req_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          description: string
          duration_seconds: number
          id: string
          is_active: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          link: string | null
          proof_required: boolean
          reward: number
          slots: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          duration_seconds?: number
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          link?: string | null
          proof_required?: boolean
          reward?: number
          slots?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_seconds?: number
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          link?: string | null
          proof_required?: boolean
          reward?: number
          slots?: number
          title?: string
        }
        Relationships: []
      }
      package_purchases: {
        Row: {
          created_at: string
          daily_ads: number
          daily_income: number
          expires_at: string
          id: string
          package_id: string
          price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_ads?: number
          daily_income?: number
          expires_at: string
          id?: string
          package_id: string
          price: number
          user_id: string
        }
        Update: {
          created_at?: string
          daily_ads?: number
          daily_income?: number
          expires_at?: string
          id?: string
          package_id?: string
          price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          daily_ads: number
          daily_income: number
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
          validity_days: number
        }
        Insert: {
          created_at?: string
          daily_ads?: number
          daily_income?: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          sort_order?: number
          updated_at?: string
          validity_days?: number
        }
        Update: {
          created_at?: string
          daily_ads?: number
          daily_income?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
          validity_days?: number
        }
        Relationships: []
      }
      payment_numbers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          method: Database["public"]["Enums"]["pay_method"]
          number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          method: Database["public"]["Enums"]["pay_method"]
          number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          method?: Database["public"]["Enums"]["pay_method"]
          number?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          has_deposited: boolean
          id: string
          is_blocked: boolean
          phone: string
          total_earned: number
          username: string
        }
        Insert: {
          balance?: number
          created_at?: string
          has_deposited?: boolean
          id: string
          is_blocked?: boolean
          phone: string
          total_earned?: number
          username: string
        }
        Update: {
          balance?: number
          created_at?: string
          has_deposited?: boolean
          id?: string
          is_blocked?: boolean
          phone?: string
          total_earned?: number
          username?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_number: string
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          status: Database["public"]["Enums"]["req_status"]
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["pay_method"]
          status?: Database["public"]["Enums"]["req_status"]
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          status?: Database["public"]["Enums"]["req_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      job_type: "ad" | "video" | "microtask"
      pay_method: "bkash" | "nagad"
      req_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      job_type: ["ad", "video", "microtask"],
      pay_method: ["bkash", "nagad"],
      req_status: ["pending", "approved", "rejected"],
    },
  },
} as const
