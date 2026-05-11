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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      booking_intents: {
        Row: {
          assigned_admin: string | null
          birth_year: string
          category: string | null
          contact_phone: string
          converted_at: string | null
          created_at: string
          id: string
          parent_email: string | null
          player_name: string
          preferred_location: string | null
          preferred_schedule: string | null
          sport: string
          status: string
          trial_date: string | null
          tutor_name: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          assigned_admin?: string | null
          birth_year: string
          category?: string | null
          contact_phone: string
          converted_at?: string | null
          created_at?: string
          id?: string
          parent_email?: string | null
          player_name: string
          preferred_location?: string | null
          preferred_schedule?: string | null
          sport: string
          status?: string
          trial_date?: string | null
          tutor_name: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          assigned_admin?: string | null
          birth_year?: string
          category?: string | null
          contact_phone?: string
          converted_at?: string | null
          created_at?: string
          id?: string
          parent_email?: string | null
          player_name?: string
          preferred_location?: string | null
          preferred_schedule?: string | null
          sport?: string
          status?: string
          trial_date?: string | null
          tutor_name?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      calculator_leads: {
        Row: {
          category: string
          coeficiente: number
          created_at: string
          dimensions: Json | null
          id: string
          location: string
          parent_email: string
          parent_goal: string | null
          parent_name: string
          parent_phone: string | null
          player_age: number
          player_name: string
          tier: string
        }
        Insert: {
          category: string
          coeficiente: number
          created_at?: string
          dimensions?: Json | null
          id?: string
          location: string
          parent_email: string
          parent_goal?: string | null
          parent_name: string
          parent_phone?: string | null
          player_age: number
          player_name: string
          tier: string
        }
        Update: {
          category?: string
          coeficiente?: number
          created_at?: string
          dimensions?: Json | null
          id?: string
          location?: string
          parent_email?: string
          parent_goal?: string | null
          parent_name?: string
          parent_phone?: string | null
          player_age?: number
          player_name?: string
          tier?: string
        }
        Relationships: []
      }
      class_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          duration_minutes: number
          id: string
          is_active: boolean
          location_name: string
          location_zone: string | null
          maps_url: string | null
          sport: string
          start_hour: number
          start_minute: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          location_name: string
          location_zone?: string | null
          maps_url?: string | null
          sport: string
          start_hour: number
          start_minute: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          location_name?: string
          location_zone?: string | null
          maps_url?: string | null
          sport?: string
          start_hour?: number
          start_minute?: number
        }
        Relationships: []
      }
      comm_log: {
        Row: {
          body_preview: string | null
          booking_intent_id: string | null
          comm_type: string
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          sender_email: string
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          body_preview?: string | null
          booking_intent_id?: string | null
          comm_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sender_email?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          body_preview?: string | null
          booking_intent_id?: string | null
          comm_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sender_email?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comm_log_booking_intent_id_fkey"
            columns: ["booking_intent_id"]
            isOneToOne: false
            referencedRelation: "booking_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string
          error: string | null
          id: string
          idempotency_key: string
          payload: Json | null
          prospect_id: string
          scheduled_for: string
          sent_at: string | null
          status: string
          template: string
          to_email: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key: string
          payload?: Json | null
          prospect_id: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          template: string
          to_email: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string
          payload?: Json | null
          prospect_id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          template?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "trial_class_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_event_registrations: {
        Row: {
          calculated_fee_mxn: number
          created_at: string
          current_club: string | null
          event_id: string
          guardian_email: string
          guardian_full_name: string
          guardian_phone: string
          id: string
          is_partner_school: boolean
          notes: string | null
          payment_status: string
          player_dob: string
          player_name: string
          reminder_12h_sent: boolean
          reminder_48h_sent: boolean
          school_name: string
          source: string
        }
        Insert: {
          calculated_fee_mxn?: number
          created_at?: string
          current_club?: string | null
          event_id: string
          guardian_email: string
          guardian_full_name: string
          guardian_phone: string
          id?: string
          is_partner_school?: boolean
          notes?: string | null
          payment_status?: string
          player_dob: string
          player_name: string
          reminder_12h_sent?: boolean
          reminder_48h_sent?: boolean
          school_name: string
          source?: string
        }
        Update: {
          calculated_fee_mxn?: number
          created_at?: string
          current_club?: string | null
          event_id?: string
          guardian_email?: string
          guardian_full_name?: string
          guardian_phone?: string
          id?: string
          is_partner_school?: boolean
          notes?: string | null
          payment_status?: string
          player_dob?: string
          player_name?: string
          reminder_12h_sent?: boolean
          reminder_48h_sent?: boolean
          school_name?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "evaluation_events"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_events: {
        Row: {
          address: string
          check_in_time: string
          created_at: string
          end_time: string
          event_date: string
          id: string
          is_active: boolean
          location_name: string
          maps_url: string | null
          start_time: string
          title: string
        }
        Insert: {
          address?: string
          check_in_time?: string
          created_at?: string
          end_time?: string
          event_date: string
          id?: string
          is_active?: boolean
          location_name?: string
          maps_url?: string | null
          start_time?: string
          title?: string
        }
        Update: {
          address?: string
          check_in_time?: string
          created_at?: string
          end_time?: string
          event_date?: string
          id?: string
          is_active?: boolean
          location_name?: string
          maps_url?: string | null
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      follow_up_tasks: {
        Row: {
          assigned_to: string
          completed_at: string | null
          created_at: string
          due_at: string
          id: string
          idempotency_key: string | null
          notes: string | null
          prospect_id: string
          status: string
          type: string
        }
        Insert: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          due_at: string
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          prospect_id: string
          status?: string
          type: string
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          due_at?: string
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          prospect_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_tasks_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "trial_class_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_runs: {
        Row: {
          created_at: string
          error_count: number | null
          finished_at: string | null
          id: string
          job_name: string
          last_error: string | null
          processed_count: number | null
          started_at: string
          status: string
        }
        Insert: {
          created_at?: string
          error_count?: number | null
          finished_at?: string | null
          id?: string
          job_name: string
          last_error?: string | null
          processed_count?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          error_count?: number | null
          finished_at?: string | null
          id?: string
          job_name?: string
          last_error?: string | null
          processed_count?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      leads_verano: {
        Row: {
          created_at: string
          deposito_fecha: string | null
          deposito_metodo: string | null
          deposito_monto: number | null
          deposito_pagado: boolean
          edad_jugador: number
          email: string | null
          estado: string
          forma_pago: string | null
          fuente: string
          grupo: string
          id: string
          mes_interes: string
          nombre_jugador: string
          nombre_padre: string
          notas: string | null
          paquete_interes: string
          saldo_fecha: string | null
          saldo_metodo: string | null
          saldo_monto: number | null
          saldo_pagado: boolean
          stripe_link_clicked: string | null
          telefono: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposito_fecha?: string | null
          deposito_metodo?: string | null
          deposito_monto?: number | null
          deposito_pagado?: boolean
          edad_jugador: number
          email?: string | null
          estado?: string
          forma_pago?: string | null
          fuente?: string
          grupo: string
          id?: string
          mes_interes: string
          nombre_jugador: string
          nombre_padre: string
          notas?: string | null
          paquete_interes: string
          saldo_fecha?: string | null
          saldo_metodo?: string | null
          saldo_monto?: number | null
          saldo_pagado?: boolean
          stripe_link_clicked?: string | null
          telefono: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposito_fecha?: string | null
          deposito_metodo?: string | null
          deposito_monto?: number | null
          deposito_pagado?: boolean
          edad_jugador?: number
          email?: string | null
          estado?: string
          forma_pago?: string | null
          fuente?: string
          grupo?: string
          id?: string
          mes_interes?: string
          nombre_jugador?: string
          nombre_padre?: string
          notas?: string | null
          paquete_interes?: string
          saldo_fecha?: string | null
          saldo_metodo?: string | null
          saldo_monto?: number | null
          saldo_pagado?: boolean
          stripe_link_clicked?: string | null
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      offboarding_forms: {
        Row: {
          completed_at: string | null
          created_at: string
          feedback: string | null
          id: string
          prospect_id: string
          reason: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          prospect_id: string
          reason: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          prospect_id?: string
          reason?: string
        }
        Relationships: []
      }
      partner_schools: {
        Row: {
          active: boolean
          created_at: string
          id: string
          school_name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          school_name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          school_name?: string
        }
        Relationships: []
      }
      reprogram_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_used_at: string | null
          prospect_id: string
          token_hash: string
          uses_count: number
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          last_used_at?: string | null
          prospect_id: string
          token_hash: string
          uses_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_used_at?: string | null
          prospect_id?: string
          token_hash?: string
          uses_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "reprogram_tokens_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "trial_class_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_class_registrations: {
        Row: {
          age_or_birth_year: string
          attendance_grace_min: number
          attendance_marked_at: string | null
          attendance_marked_by: string | null
          category: string
          comments: string | null
          contact_phone: string
          created_at: string
          email_normalized: string | null
          id: string
          lost_at: string | null
          lost_reason: string | null
          no_show_processed_at: string | null
          notes: string | null
          parent_email: string | null
          phone_normalized: string | null
          player_name: string
          preferred_location: string
          preferred_schedule: string
          reactivation_paused_until: string | null
          reactivation_status: string
          referral_name: string | null
          referral_source: string | null
          school: string | null
          status: string
          status_updated_at: string
          trial_duration_min: number
          trial_start_at: string | null
          tutor_name: string
        }
        Insert: {
          age_or_birth_year: string
          attendance_grace_min?: number
          attendance_marked_at?: string | null
          attendance_marked_by?: string | null
          category: string
          comments?: string | null
          contact_phone: string
          created_at?: string
          email_normalized?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          no_show_processed_at?: string | null
          notes?: string | null
          parent_email?: string | null
          phone_normalized?: string | null
          player_name: string
          preferred_location: string
          preferred_schedule: string
          reactivation_paused_until?: string | null
          reactivation_status?: string
          referral_name?: string | null
          referral_source?: string | null
          school?: string | null
          status?: string
          status_updated_at?: string
          trial_duration_min?: number
          trial_start_at?: string | null
          tutor_name: string
        }
        Update: {
          age_or_birth_year?: string
          attendance_grace_min?: number
          attendance_marked_at?: string | null
          attendance_marked_by?: string | null
          category?: string
          comments?: string | null
          contact_phone?: string
          created_at?: string
          email_normalized?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          no_show_processed_at?: string | null
          notes?: string | null
          parent_email?: string | null
          phone_normalized?: string | null
          player_name?: string
          preferred_location?: string
          preferred_schedule?: string
          reactivation_paused_until?: string | null
          reactivation_status?: string
          referral_name?: string | null
          referral_source?: string | null
          school?: string | null
          status?: string
          status_updated_at?: string
          trial_duration_min?: number
          trial_start_at?: string | null
          tutor_name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_registrations: {
        Row: {
          batch: string
          category: string
          child_age: number | null
          child_birth_year: number | null
          child_name: string
          created_at: string
          id: string
          notes: string | null
          parent_email: string | null
          parent_name: string
          parent_whatsapp: string
          school: string | null
          source: string
          status: string
        }
        Insert: {
          batch?: string
          category?: string
          child_age?: number | null
          child_birth_year?: number | null
          child_name: string
          created_at?: string
          id?: string
          notes?: string | null
          parent_email?: string | null
          parent_name: string
          parent_whatsapp: string
          school?: string | null
          source?: string
          status?: string
        }
        Update: {
          batch?: string
          category?: string
          child_age?: number | null
          child_birth_year?: number | null
          child_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          parent_email?: string | null
          parent_name?: string
          parent_whatsapp?: string
          school?: string | null
          source?: string
          status?: string
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
      insert_waitlist_registration: {
        Args: {
          p_batch?: string
          p_category?: string
          p_child_age?: number
          p_child_birth_year?: number
          p_child_name: string
          p_notes?: string
          p_parent_email?: string
          p_parent_name?: string
          p_parent_whatsapp?: string
          p_school?: string
          p_source?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
