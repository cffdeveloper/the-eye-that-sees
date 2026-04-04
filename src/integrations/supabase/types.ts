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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_usage_events: {
        Row: {
          created_at: string
          edge_function: string
          id: string
          metadata: Json | null
          tokens_in: number
          tokens_out: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          edge_function?: string
          id?: string
          metadata?: Json | null
          tokens_in?: number
          tokens_out?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          edge_function?: string
          id?: string
          metadata?: Json | null
          tokens_in?: number
          tokens_out?: number
          user_id?: string | null
        }
        Relationships: []
      }
      api_health_history: {
        Row: {
          checked_at: string
          id: string
          integration_id: string
          message: string | null
          status: string
        }
        Insert: {
          checked_at?: string
          id?: string
          integration_id: string
          message?: string | null
          status: string
        }
        Update: {
          checked_at?: string
          id?: string
          integration_id?: string
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_health_history_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "api_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_integrations: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          health_status: string
          id: string
          key_code: string
          last_checked_at: string | null
          last_health_message: string | null
          secret_value: string | null
          sort_order: number
          source_file_hint: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          health_status?: string
          id?: string
          key_code: string
          last_checked_at?: string | null
          last_health_message?: string | null
          secret_value?: string | null
          sort_order?: number
          source_file_hint?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          health_status?: string
          id?: string
          key_code?: string
          last_checked_at?: string | null
          last_health_message?: string | null
          secret_value?: string | null
          sort_order?: number
          source_file_hint?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          amount_paid_usd: number
          created_at: string
          credits_granted_usd: number
          currency: string
          event_type: string
          id: string
          metadata: Json | null
          paystack_reference: string
          user_id: string
        }
        Insert: {
          amount_paid_usd: number
          created_at?: string
          credits_granted_usd?: number
          currency?: string
          event_type: string
          id?: string
          metadata?: Json | null
          paystack_reference: string
          user_id: string
        }
        Update: {
          amount_paid_usd?: number
          created_at?: string
          credits_granted_usd?: number
          currency?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          paystack_reference?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          balance_after_usd: number
          created_at: string
          delta_usd: number
          id: string
          paystack_reference: string | null
          reason: string
          user_id: string
        }
        Insert: {
          balance_after_usd: number
          created_at?: string
          delta_usd: number
          id?: string
          paystack_reference?: string | null
          reason: string
          user_id: string
        }
        Update: {
          balance_after_usd?: number
          created_at?: string
          delta_usd?: number
          id?: string
          paystack_reference?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      geo_intel_cache: {
        Row: {
          alerts: Json | null
          analysis: string | null
          connections: Json | null
          created_at: string
          gaps: Json | null
          geo_scope: string
          id: string
          market_data: Json | null
          opportunities: Json | null
          scope_key: string
          scope_type: string
        }
        Insert: {
          alerts?: Json | null
          analysis?: string | null
          connections?: Json | null
          created_at?: string
          gaps?: Json | null
          geo_scope: string
          id?: string
          market_data?: Json | null
          opportunities?: Json | null
          scope_key: string
          scope_type: string
        }
        Update: {
          alerts?: Json | null
          analysis?: string | null
          connections?: Json | null
          created_at?: string
          gaps?: Json | null
          geo_scope?: string
          id?: string
          market_data?: Json | null
          opportunities?: Json | null
          scope_key?: string
          scope_type?: string
        }
        Relationships: []
      }
      intel_insights: {
        Row: {
          created_at: string
          detail: string | null
          estimated_value: string | null
          geo_context: string[] | null
          id: string
          insight_type: string
          raw_data: Json | null
          referenced_count: number | null
          related_industries: string[] | null
          score: number | null
          source_industry: string | null
          source_subflow: string | null
          still_relevant: boolean | null
          tags: string[] | null
          title: string
          urgency: string | null
        }
        Insert: {
          created_at?: string
          detail?: string | null
          estimated_value?: string | null
          geo_context?: string[] | null
          id?: string
          insight_type: string
          raw_data?: Json | null
          referenced_count?: number | null
          related_industries?: string[] | null
          score?: number | null
          source_industry?: string | null
          source_subflow?: string | null
          still_relevant?: boolean | null
          tags?: string[] | null
          title: string
          urgency?: string | null
        }
        Update: {
          created_at?: string
          detail?: string | null
          estimated_value?: string | null
          geo_context?: string[] | null
          id?: string
          insight_type?: string
          raw_data?: Json | null
          referenced_count?: number | null
          related_industries?: string[] | null
          score?: number | null
          source_industry?: string | null
          source_subflow?: string | null
          still_relevant?: boolean | null
          tags?: string[] | null
          title?: string
          urgency?: string | null
        }
        Relationships: []
      }
      intel_matches: {
        Row: {
          action_items: Json | null
          challenges: Json | null
          collaborators: Json | null
          confidence: number | null
          created_at: string
          description: string | null
          estimated_value: string | null
          geo_context: string[] | null
          id: string
          industries: string[] | null
          match_type: string
          raw_data_refs: string[] | null
          source_insights: string[] | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          challenges?: Json | null
          collaborators?: Json | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          estimated_value?: string | null
          geo_context?: string[] | null
          id?: string
          industries?: string[] | null
          match_type: string
          raw_data_refs?: string[] | null
          source_insights?: string[] | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          challenges?: Json | null
          collaborators?: Json | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          estimated_value?: string | null
          geo_context?: string[] | null
          id?: string
          industries?: string[] | null
          match_type?: string
          raw_data_refs?: string[] | null
          source_insights?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      intel_snapshots: {
        Row: {
          alerts: Json | null
          analysis: string | null
          connections: Json | null
          created_at: string
          gaps: Json | null
          id: string
          live_data: Json | null
          news: Json | null
          scope_key: string
          scope_type: string
          summary: string | null
        }
        Insert: {
          alerts?: Json | null
          analysis?: string | null
          connections?: Json | null
          created_at?: string
          gaps?: Json | null
          id?: string
          live_data?: Json | null
          news?: Json | null
          scope_key: string
          scope_type: string
          summary?: string | null
        }
        Update: {
          alerts?: Json | null
          analysis?: string | null
          connections?: Json | null
          created_at?: string
          gaps?: Json | null
          id?: string
          live_data?: Json | null
          news?: Json | null
          scope_key?: string
          scope_type?: string
          summary?: string | null
        }
        Relationships: []
      }
      memory_embeddings: {
        Row: {
          content_hash: string
          created_at: string
          embedding: string
          id: string
          user_id: string
          user_memory_id: string | null
        }
        Insert: {
          content_hash: string
          created_at?: string
          embedding: string
          id?: string
          user_id: string
          user_memory_id?: string | null
        }
        Update: {
          content_hash?: string
          created_at?: string
          embedding?: string
          id?: string
          user_id?: string
          user_memory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_embeddings_user_memory_id_fkey"
            columns: ["user_memory_id"]
            isOneToOne: false
            referencedRelation: "user_memory"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          user_id?: string
        }
        Relationships: []
      }
      proactive_gaps: {
        Row: {
          batch_id: string | null
          created_at: string
          feasibility: Json
          id: string
          insight: Json
          search_evidence: Json
          user_context_snapshot: Json
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          feasibility?: Json
          id?: string
          insight: Json
          search_evidence?: Json
          user_context_snapshot?: Json
          user_id: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          feasibility?: Json
          id?: string
          insight?: Json
          search_evidence?: Json
          user_context_snapshot?: Json
          user_id?: string
        }
        Relationships: []
      }
      proactive_search_cache: {
        Row: {
          cache_key: string
          expires_at: string
          payload: Json
        }
        Insert: {
          cache_key: string
          expires_at: string
          payload: Json
        }
        Update: {
          cache_key?: string
          expires_at?: string
          payload?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          credit_balance_usd: number
          display_name: string | null
          experience_level: string | null
          full_name: string | null
          goals: string[] | null
          id: string
          industries_of_interest: string[] | null
          max_startup_capital_usd: number
          onboarding_completed: boolean | null
          organization: string | null
          preferred_regions: string[] | null
          prefers_business_that_employs: boolean
          primary_market: string
          proactive_monitoring: string
          role: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credit_balance_usd?: number
          display_name?: string | null
          experience_level?: string | null
          full_name?: string | null
          goals?: string[] | null
          id: string
          industries_of_interest?: string[] | null
          max_startup_capital_usd?: number
          onboarding_completed?: boolean | null
          organization?: string | null
          preferred_regions?: string[] | null
          prefers_business_that_employs?: boolean
          primary_market?: string
          proactive_monitoring?: string
          role?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credit_balance_usd?: number
          display_name?: string | null
          experience_level?: string | null
          full_name?: string | null
          goals?: string[] | null
          id?: string
          industries_of_interest?: string[] | null
          max_startup_capital_usd?: number
          onboarding_completed?: boolean | null
          organization?: string | null
          preferred_regions?: string[] | null
          prefers_business_that_employs?: boolean
          primary_market?: string
          proactive_monitoring?: string
          role?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      raw_market_data: {
        Row: {
          created_at: string
          data_type: string
          expires_at: string | null
          geo_scope: string | null
          id: string
          industry: string | null
          payload: Json
          source: string
          tags: string[] | null
        }
        Insert: {
          created_at?: string
          data_type: string
          expires_at?: string | null
          geo_scope?: string | null
          id?: string
          industry?: string | null
          payload?: Json
          source: string
          tags?: string[] | null
        }
        Update: {
          created_at?: string
          data_type?: string
          expires_at?: string | null
          geo_scope?: string | null
          id?: string
          industry?: string | null
          payload?: Json
          source?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paystack_customer_code: string | null
          paystack_email: string | null
          paystack_subscription_code: string | null
          plan_code: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_email?: string | null
          paystack_subscription_code?: string | null
          plan_code?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_email?: string | null
          paystack_subscription_code?: string | null
          plan_code?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_geo_preferences: {
        Row: {
          created_at: string
          geo_type: string
          geo_values: string[]
          id: string
          is_active: boolean | null
          session_id: string
        }
        Insert: {
          created_at?: string
          geo_type: string
          geo_values?: string[]
          id?: string
          is_active?: boolean | null
          session_id: string
        }
        Update: {
          created_at?: string
          geo_type?: string
          geo_values?: string[]
          id?: string
          is_active?: boolean | null
          session_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          content: string
          created_at: string
          id: string
          kind: string
          metadata: Json
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_credit_topup: {
        Args: {
          p_amount_paid_usd: number
          p_credits_granted_usd: number
          p_paystack_ref: string
          p_user_id: string
        }
        Returns: Json
      }
      consume_user_credits: {
        Args: { p_amount: number; p_reason: string; p_user_id: string }
        Returns: Json
      }
      cron_invoke_edge_function: {
        Args: { function_path: string }
        Returns: undefined
      }
      record_donation_event: {
        Args: {
          p_amount_paid_usd: number
          p_paystack_ref: string
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
