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
  sentinel: {
    Tables: {
      ss_agents: {
        Row: {
          agent_id: number
          agent_name: string
          agent_path: string
          agent_profile: string | null
          created_at: string | null
          digest: string | null
          is_featured: boolean
          model_name: string | null
          model_provider: string | null
          object_id: string
          owner: string
        }
        Insert: {
          agent_id: number
          agent_name: string
          agent_path: string
          agent_profile?: string | null
          created_at?: string | null
          digest?: string | null
          is_featured?: boolean
          model_name?: string | null
          model_provider?: string | null
          object_id: string
          owner: string
        }
        Update: {
          agent_id?: number
          agent_name?: string
          agent_path?: string
          agent_profile?: string | null
          created_at?: string | null
          digest?: string | null
          is_featured?: boolean
          model_name?: string | null
          model_provider?: string | null
          object_id?: string
          owner?: string
        }
        Relationships: []
      }
      ss_ambassador_applications: {
        Row: {
          agreed_to_code_of_conduct: boolean
          country: string | null
          created_at: string
          current_step: number
          discord_id: string | null
          discord_username: string | null
          email: string | null
          first_30_days_plan: string | null
          full_name: string | null
          github_url: string | null
          has_ambassador_experience: boolean | null
          id: string
          open_to_performance_rewards: boolean | null
          other_web3_profiles: string | null
          past_experience: string | null
          preferred_name: string | null
          previous_ambassador_programs: Json | null
          roles: string[] | null
          status:
            | "draft"
            | "submitted"
            | "under_review"
            | "approved"
            | "rejected"
          submitted_at: string | null
          sui_wallet_address: string | null
          target_region_language_audience: string | null
          telegram_username: string | null
          timezone: string | null
          twitter_url: string | null
          updated_at: string
          web3_experience_level:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "expert"
            | null
          weekly_availability: string | null
          why_become_ambassador: string | null
        }
        Insert: {
          agreed_to_code_of_conduct?: boolean
          country?: string | null
          created_at?: string
          current_step?: number
          discord_id?: string | null
          discord_username?: string | null
          email?: string | null
          first_30_days_plan?: string | null
          full_name?: string | null
          github_url?: string | null
          has_ambassador_experience?: boolean | null
          id?: string
          open_to_performance_rewards?: boolean | null
          other_web3_profiles?: string | null
          past_experience?: string | null
          preferred_name?: string | null
          previous_ambassador_programs?: Json | null
          roles?: string[] | null
          status?:
            | "draft"
            | "submitted"
            | "under_review"
            | "approved"
            | "rejected"
          submitted_at?: string | null
          sui_wallet_address?: string | null
          target_region_language_audience?: string | null
          telegram_username?: string | null
          timezone?: string | null
          twitter_url?: string | null
          updated_at?: string
          web3_experience_level?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "expert"
            | null
          weekly_availability?: string | null
          why_become_ambassador?: string | null
        }
        Update: {
          agreed_to_code_of_conduct?: boolean
          country?: string | null
          created_at?: string
          current_step?: number
          discord_id?: string | null
          discord_username?: string | null
          email?: string | null
          first_30_days_plan?: string | null
          full_name?: string | null
          github_url?: string | null
          has_ambassador_experience?: boolean | null
          id?: string
          open_to_performance_rewards?: boolean | null
          other_web3_profiles?: string | null
          past_experience?: string | null
          preferred_name?: string | null
          previous_ambassador_programs?: Json | null
          roles?: string[] | null
          status?:
            | "draft"
            | "submitted"
            | "under_review"
            | "approved"
            | "rejected"
          submitted_at?: string | null
          sui_wallet_address?: string | null
          target_region_language_audience?: string | null
          telegram_username?: string | null
          timezone?: string | null
          twitter_url?: string | null
          updated_at?: string
          web3_experience_level?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "expert"
            | null
          weekly_availability?: string | null
          why_become_ambassador?: string | null
        }
        Relationships: []
      }
      ss_defender_templates: {
        Row: {
          attack_goal: string | null
          created_at: string
          creator_address: string
          id: number
          jury_prompt: string | null
          name: string
          private_instructions: string | null
          public_instructions: string | null
          rank: number | null
          status: "pending" | "approved" | "denied" | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          attack_goal?: string | null
          created_at?: string
          creator_address: string
          id?: number
          jury_prompt?: string | null
          name: string
          private_instructions?: string | null
          public_instructions?: string | null
          rank?: number | null
          status?: "pending" | "approved" | "denied" | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          attack_goal?: string | null
          created_at?: string
          creator_address?: string
          id?: number
          jury_prompt?: string | null
          name?: string
          private_instructions?: string | null
          public_instructions?: string | null
          rank?: number | null
          status?: "pending" | "approved" | "denied" | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      ss_demo_requests: {
        Row: {
          company_name: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          join_beta: boolean | null
          last_name: string
          message: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          join_beta?: boolean | null
          last_name: string
          message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          join_beta?: boolean | null
          last_name?: string
          message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ss_feature_requests: {
        Row: {
          agent_id: number
          created_at: string | null
          description: string
          email_id: string
          id: string
          name: string
          status: "pending" | "approved" | "denied" | null
          telegram_username: string | null
          twitter_username: string | null
          wallet_address: string
        }
        Insert: {
          agent_id: number
          created_at?: string | null
          description: string
          email_id: string
          id?: string
          name: string
          status?: "pending" | "approved" | "denied" | null
          telegram_username?: string | null
          twitter_username?: string | null
          wallet_address: string
        }
        Update: {
          agent_id?: number
          created_at?: string | null
          description?: string
          email_id?: string
          id?: string
          name?: string
          status?: "pending" | "approved" | "denied" | null
          telegram_username?: string | null
          twitter_username?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "ss_feature_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ss_agents"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ss_job_applications: {
        Row: {
          availability_notes: string | null
          created_at: string
          email: string
          github_link: string | null
          id: string
          interest_notes: string | null
          job_title: string
          name: string
          resume_file_path: string
        }
        Insert: {
          availability_notes?: string | null
          created_at?: string
          email: string
          github_link?: string | null
          id?: string
          interest_notes?: string | null
          job_title: string
          name: string
          resume_file_path: string
        }
        Update: {
          availability_notes?: string | null
          created_at?: string
          email?: string
          github_link?: string | null
          id?: string
          interest_notes?: string | null
          job_title?: string
          name?: string
          resume_file_path?: string
        }
        Relationships: []
      }
      ss_manifesto_signatures: {
        Row: {
          created_at: string
          email: string
          email_sent_at: string | null
          id: number
          signed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_sent_at?: string | null
          id?: never
          signed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_sent_at?: string | null
          id?: never
          signed_at?: string | null
        }
        Relationships: []
      }
      ss_rewards_activity: {
        Row: {
          completed_at: string | null
          id: string
          metadata: Json | null
          mission_type: string
          points_earned: number
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          metadata?: Json | null
          mission_type: string
          points_earned: number
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          metadata?: Json | null
          mission_type?: string
          points_earned?: number
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ss_rewards_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ss_rewards_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ss_rewards_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ss_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ss_social_connections: {
        Row: {
          connected_at: string | null
          id: string
          platform: string
          platform_avatar_url: string | null
          platform_user_id: string
          platform_username: string
          user_id: string | null
        }
        Insert: {
          connected_at?: string | null
          id?: string
          platform: string
          platform_avatar_url?: string | null
          platform_user_id: string
          platform_username: string
          user_id?: string | null
        }
        Update: {
          connected_at?: string | null
          id?: string
          platform?: string
          platform_avatar_url?: string | null
          platform_user_id?: string
          platform_username?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ss_social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ss_rewards_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ss_social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ss_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ss_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          email_notifications: boolean | null
          id: string
          lifetime_points: number | null
          rewards_tier: string | null
          rewards_updated_at: string | null
          total_points: number | null
          username: string
          wallet_addresses: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean | null
          id?: string
          lifetime_points?: number | null
          rewards_tier?: string | null
          rewards_updated_at?: string | null
          total_points?: number | null
          username: string
          wallet_addresses?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean | null
          id?: string
          lifetime_points?: number | null
          rewards_tier?: string | null
          rewards_updated_at?: string | null
          total_points?: number | null
          username?: string
          wallet_addresses?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      ss_rewards_leaderboard: {
        Row: {
          avatar_url: string | null
          discord_avatar: string | null
          discord_user_id: string | null
          discord_username: string | null
          lifetime_points: number | null
          rank: number | null
          tier: string | null
          total_points: number | null
          twitter_avatar: string | null
          twitter_user_id: string | null
          twitter_username: string | null
          user_id: string | null
          username: string | null
          wallet_addresses: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
  sentinel: {
    Enums: {},
  },
} as const
