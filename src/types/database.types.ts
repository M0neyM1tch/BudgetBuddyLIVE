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
      debts: {
        Row: {
          color: string | null
          created_at: string
          current_balance_cents: number
          debt_type: Database["public"]["Enums"]["debt_type"]
          icon: string
          id: string
          interest_rate_basis_points: number
          is_archived: boolean
          minimum_payment_cents: number
          name: string
          payment_frequency: Database["public"]["Enums"]["payment_frequency"]
          principal_cents: number
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          current_balance_cents?: number
          debt_type?: Database["public"]["Enums"]["debt_type"]
          icon?: string
          id?: string
          interest_rate_basis_points?: number
          is_archived?: boolean
          minimum_payment_cents?: number
          name: string
          payment_frequency?: Database["public"]["Enums"]["payment_frequency"]
          principal_cents?: number
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          current_balance_cents?: number
          debt_type?: Database["public"]["Enums"]["debt_type"]
          icon?: string
          id?: string
          interest_rate_basis_points?: number
          is_archived?: boolean
          minimum_payment_cents?: number
          name?: string
          payment_frequency?: Database["public"]["Enums"]["payment_frequency"]
          principal_cents?: number
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_priorities: {
        Row: {
          active_goal_id: string | null
          country_code: string | null
          created_at: string
          currency_code: string
          horizon: string
          id: string
          monthly_expenses_cents: number | null
          monthly_income_cents: number | null
          region_code: string | null
          top_priority_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_goal_id?: string | null
          country_code?: string | null
          created_at?: string
          currency_code?: string
          horizon?: string
          id?: string
          monthly_expenses_cents?: number | null
          monthly_income_cents?: number | null
          region_code?: string | null
          top_priority_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_goal_id?: string | null
          country_code?: string | null
          created_at?: string
          currency_code?: string
          horizon?: string
          id?: string
          monthly_expenses_cents?: number | null
          monthly_income_cents?: number | null
          region_code?: string | null
          top_priority_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_priorities_active_goal_id_fkey"
            columns: ["active_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_actions: {
        Row: {
          action_type: string
          completed_at: string | null
          created_at: string
          description: string | null
          dismissed_at: string | null
          due_at: string | null
          goal_id: string | null
          id: string
          impact_label: string | null
          impact_value: Json
          source: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          due_at?: string | null
          goal_id?: string | null
          id?: string
          impact_label?: string | null
          impact_value?: Json
          source?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          due_at?: string | null
          goal_id?: string | null
          id?: string
          impact_label?: string | null
          impact_value?: Json
          source?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_actions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_plan_snapshots: {
        Row: {
          confidence_score: number
          created_at: string
          current_monthly_capacity_cents: number | null
          drivers: Json
          goal_id: string
          id: string
          progress_percent: number
          projected_completion_date: string | null
          recommendations: Json
          required_monthly_cents: number | null
          snapshot_kind: string
          user_id: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          current_monthly_capacity_cents?: number | null
          drivers?: Json
          goal_id: string
          id?: string
          progress_percent?: number
          projected_completion_date?: string | null
          recommendations?: Json
          required_monthly_cents?: number | null
          snapshot_kind?: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          current_monthly_capacity_cents?: number | null
          drivers?: Json
          goal_id?: string
          id?: string
          progress_percent?: number
          projected_completion_date?: string | null
          recommendations?: Json
          required_monthly_cents?: number | null
          snapshot_kind?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_plan_snapshots_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          color: string | null
          confidence_score: number | null
          created_at: string
          current_amount_cents: number
          goal_type: string
          icon: string
          id: string
          is_archived: boolean
          last_plan_calculated_at: string | null
          monthly_commitment_cents: number | null
          name: string
          plan_status: string
          planning_rules: Json
          priority_rank: number | null
          starting_balance_cents: number
          target_amount_cents: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          confidence_score?: number | null
          created_at?: string
          current_amount_cents?: number
          goal_type?: string
          icon?: string
          id?: string
          is_archived?: boolean
          last_plan_calculated_at?: string | null
          monthly_commitment_cents?: number | null
          name: string
          plan_status?: string
          planning_rules?: Json
          priority_rank?: number | null
          starting_balance_cents?: number
          target_amount_cents: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          confidence_score?: number | null
          created_at?: string
          current_amount_cents?: number
          goal_type?: string
          icon?: string
          id?: string
          is_archived?: boolean
          last_plan_calculated_at?: string | null
          monthly_commitment_cents?: number | null
          name?: string
          plan_status?: string
          planning_rules?: Json
          priority_rank?: number | null
          starting_balance_cents?: number
          target_amount_cents?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_terms_at: string | null
          accepted_terms_version: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          accepted_terms_at?: string | null
          accepted_terms_version?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          accepted_terms_at?: string | null
          accepted_terms_version?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurring_rules: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          day_of_month: number | null
          debt_id: string | null
          description: string
          frequency: Database["public"]["Enums"]["recurring_frequency"]
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["transaction_kind"]
          next_run_date: string
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          category: string
          created_at?: string
          day_of_month?: number | null
          debt_id?: string | null
          description: string
          frequency: Database["public"]["Enums"]["recurring_frequency"]
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["transaction_kind"]
          next_run_date: string
          notes?: string | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          day_of_month?: number | null
          debt_id?: string | null
          description?: string
          frequency?: Database["public"]["Enums"]["recurring_frequency"]
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["transaction_kind"]
          next_run_date?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_rules_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          bank_connection_id: string | null
          category: string
          created_at: string
          debt_id: string | null
          description: string
          goal_id: string | null
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          needs_review: boolean
          notes: string | null
          plaid_transaction_id: string | null
          recurring_rule_id: string | null
          source: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          bank_connection_id?: string | null
          category: string
          created_at?: string
          debt_id?: string | null
          description: string
          goal_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          needs_review?: boolean
          notes?: string | null
          plaid_transaction_id?: string | null
          recurring_rule_id?: string | null
          source?: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          bank_connection_id?: string | null
          category?: string
          created_at?: string
          debt_id?: string | null
          description?: string
          goal_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["transaction_kind"]
          needs_review?: boolean
          notes?: string | null
          plaid_transaction_id?: string | null
          recurring_rule_id?: string | null
          source?: Database["public"]["Enums"]["transaction_source"]
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recurring_rule_id_fkey"
            columns: ["recurring_rule_id"]
            isOneToOne: false
            referencedRelation: "recurring_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          currency_code: string
          dismissed_tooltips: string[]
          id: string
          onboarding_completed_at: string | null
          quick_add_chips: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          dismissed_tooltips?: string[]
          id?: string
          onboarding_completed_at?: string | null
          quick_add_chips?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          dismissed_tooltips?: string[]
          id?: string
          onboarding_completed_at?: string | null
          quick_add_chips?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allocate_debt_payment: {
        Args: {
          p_amount_cents: number
          p_debt_id: string
          p_description?: string
          p_notes?: string
          p_recurring_rule_id?: string
          p_source?: Database["public"]["Enums"]["transaction_source"]
          p_transaction_date?: string
        }
        Returns: {
          amount_cents: number
          bank_connection_id: string | null
          category: string
          created_at: string
          debt_id: string | null
          description: string
          goal_id: string | null
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          needs_review: boolean
          notes: string | null
          plaid_transaction_id: string | null
          recurring_rule_id: string | null
          source: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      allocate_goal_contribution: {
        Args: {
          p_amount_cents: number
          p_description?: string
          p_goal_id: string
          p_notes?: string
          p_transaction_date?: string
        }
        Returns: {
          amount_cents: number
          bank_connection_id: string | null
          category: string
          created_at: string
          debt_id: string | null
          description: string
          goal_id: string | null
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          needs_review: boolean
          notes: string | null
          plaid_transaction_id: string | null
          recurring_rule_id: string | null
          source: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_goal_plan_recalculation: {
        Args: {
          p_action_description?: string
          p_action_due_at?: string
          p_action_impact_label?: string
          p_action_impact_value?: Json
          p_action_source?: string
          p_action_title: string
          p_action_type: string
          p_confidence_score: number
          p_current_monthly_capacity_cents: number
          p_drivers: Json
          p_goal_id: string
          p_goal_type: string
          p_last_plan_calculated_at: string
          p_monthly_commitment_cents: number
          p_plan_status: string
          p_planning_rules: Json
          p_priority_rank: number
          p_progress_percent: number
          p_projected_completion_date: string
          p_recommendations: Json
          p_required_monthly_cents: number
          p_snapshot_confidence_score: number
          p_snapshot_kind: string
        }
        Returns: Json
      }
      complete_goal_action_with_plan: {
        Args: {
          p_action_id: string
          p_completed_at: string
          p_confidence_score: number
          p_current_monthly_capacity_cents: number
          p_drivers: Json
          p_goal_type: string
          p_last_plan_calculated_at: string
          p_monthly_commitment_cents: number
          p_plan_status: string
          p_planning_rules: Json
          p_priority_rank: number
          p_progress_percent: number
          p_projected_completion_date: string
          p_recommendations: Json
          p_required_monthly_cents: number
          p_snapshot_confidence_score: number
        }
        Returns: Json
      }
      create_goal_pack_onboarding_setup: {
        Args: {
          p_action_description?: string
          p_action_due_at?: string
          p_action_impact_label?: string
          p_action_impact_value?: Json
          p_action_source?: string
          p_action_title: string
          p_action_type: string
          p_confidence_score: number
          p_country_code: string
          p_currency_code: string
          p_goal_color: string
          p_goal_icon: string
          p_goal_name: string
          p_goal_type: string
          p_horizon: string
          p_monthly_commitment_cents: number
          p_monthly_expenses_cents: number
          p_monthly_income_cents: number
          p_plan_status: string
          p_planning_rules: Json
          p_priority_rank: number
          p_region_code: string
          p_starting_balance_cents: number
          p_target_amount_cents: number
          p_target_date: string
          p_top_priority_type: string
        }
        Returns: Json
      }
      create_goal_pack_onboarding_setup_v2: {
        Args: {
          p_action_description?: string
          p_action_due_at?: string
          p_action_impact_label?: string
          p_action_impact_value?: Json
          p_action_source?: string
          p_action_title: string
          p_action_type: string
          p_confidence_score: number
          p_country_code: string
          p_currency_code: string
          p_debt_color?: string
          p_debt_current_balance_cents?: number
          p_debt_icon?: string
          p_debt_interest_rate_basis_points?: number
          p_debt_minimum_payment_cents?: number
          p_debt_name?: string
          p_debt_payment_frequency?: Database["public"]["Enums"]["payment_frequency"]
          p_debt_principal_cents?: number
          p_debt_start_date?: string
          p_debt_type?: Database["public"]["Enums"]["debt_type"]
          p_goal_color: string
          p_goal_icon: string
          p_goal_name: string
          p_goal_type: string
          p_horizon: string
          p_monthly_commitment_cents: number
          p_monthly_expenses_cents: number
          p_monthly_income_cents: number
          p_plan_status: string
          p_planning_rules: Json
          p_priority_rank: number
          p_region_code: string
          p_starting_balance_cents: number
          p_target_amount_cents: number
          p_target_date: string
          p_top_priority_type: string
        }
        Returns: Json
      }
      delete_debt_permanently: { Args: { p_debt_id: string }; Returns: string }
      delete_goal_permanently: { Args: { p_goal_id: string }; Returns: string }
      delete_transaction_and_rebalance_goal: {
        Args: { p_transaction_id: string }
        Returns: string
      }
      process_due_recurring_rules: {
        Args: { p_through?: string; p_user_id?: string }
        Returns: Json
      }
      update_debt_payment_transaction: {
        Args: {
          p_amount_cents: number
          p_description?: string
          p_notes?: string
          p_transaction_date: string
          p_transaction_id: string
        }
        Returns: {
          amount_cents: number
          bank_connection_id: string | null
          category: string
          created_at: string
          debt_id: string | null
          description: string
          goal_id: string | null
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          needs_review: boolean
          notes: string | null
          plaid_transaction_id: string | null
          recurring_rule_id: string | null
          source: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_goal_contribution_transaction: {
        Args: {
          p_amount_cents: number
          p_description?: string
          p_notes?: string
          p_transaction_date: string
          p_transaction_id: string
        }
        Returns: {
          amount_cents: number
          bank_connection_id: string | null
          category: string
          created_at: string
          debt_id: string | null
          description: string
          goal_id: string | null
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          needs_review: boolean
          notes: string | null
          plaid_transaction_id: string | null
          recurring_rule_id: string | null
          source: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      debt_type:
        | "mortgage"
        | "car_loan"
        | "student_loan"
        | "credit_card"
        | "line_of_credit"
        | "personal_loan"
        | "other"
      payment_frequency: "weekly" | "biweekly" | "semi_monthly" | "monthly"
      recurring_frequency: "weekly" | "biweekly" | "semi_monthly" | "monthly"
      transaction_kind: "income" | "expense" | "transfer"
      transaction_source: "manual" | "recurring" | "plaid" | "csv_import"
      user_role: "user" | "admin"
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
      debt_type: [
        "mortgage",
        "car_loan",
        "student_loan",
        "credit_card",
        "line_of_credit",
        "personal_loan",
        "other",
      ],
      payment_frequency: ["weekly", "biweekly", "semi_monthly", "monthly"],
      recurring_frequency: ["weekly", "biweekly", "semi_monthly", "monthly"],
      transaction_kind: ["income", "expense", "transfer"],
      transaction_source: ["manual", "recurring", "plaid", "csv_import"],
      user_role: ["user", "admin"],
    },
  },
} as const
