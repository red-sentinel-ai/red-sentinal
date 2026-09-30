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
  sentinel: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          room_id: string | null
          sender_address: string
          sender_role: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          room_id?: string | null
          sender_address: string
          sender_role?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          room_id?: string | null
          sender_address?: string
          sender_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          agent_id: string
          chain: string | null
          created_at: string | null
          id: string
          network: string | null
          owner_address: string | null
        }
        Insert: {
          agent_id: string
          chain?: string | null
          created_at?: string | null
          id?: string
          network?: string | null
          owner_address?: string | null
        }
        Update: {
          agent_id?: string
          chain?: string | null
          created_at?: string | null
          id?: string
          network?: string | null
          owner_address?: string | null
        }
        Relationships: []
      }
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
      ss_defender_template_comments: {
        Row: {
          comment: string
          created_at: string
          id: number
          template_id: number
          user_address: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: never
          template_id: number
          user_address: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: never
          template_id?: number
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "ss_defender_template_comments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ss_defender_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ss_defender_template_likes: {
        Row: {
          created_at: string
          id: number
          template_id: number
          user_address: string
        }
        Insert: {
          created_at?: string
          id?: never
          template_id: number
          user_address: string
        }
        Update: {
          created_at?: string
          id?: never
          template_id?: number
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "ss_defender_template_likes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ss_defender_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ss_defender_templates: {
        Row: {
          attack_goal: string | null
          avatar_url: string | null
          comment_count: number
          created_at: string
          creator_address: string
          id: number
          like_count: number
          name: string
          origin: string
          private_instructions: string | null
          public_instructions: string | null
          rank: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          attack_goal?: string | null
          avatar_url?: string | null
          comment_count?: number
          created_at?: string
          creator_address: string
          id?: number
          like_count?: number
          name: string
          origin?: string
          private_instructions?: string | null
          public_instructions?: string | null
          rank?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          attack_goal?: string | null
          avatar_url?: string | null
          comment_count?: number
          created_at?: string
          creator_address?: string
          id?: number
          like_count?: number
          name?: string
          origin?: string
          private_instructions?: string | null
          public_instructions?: string | null
          rank?: number | null
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
      ss_partner_applications: {
        Row: {
          application_id: string
          campaign_goal: string
          contact_name: string
          email: string
          project_name: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: "approved" | "pending_review" | "rejected"
          submitted_at: string
          telegram_handle: string
        }
        Insert: {
          application_id?: string
          campaign_goal: string
          contact_name: string
          email: string
          project_name: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: "approved" | "pending_review" | "rejected"
          submitted_at?: string
          telegram_handle: string
        }
        Update: {
          application_id?: string
          campaign_goal?: string
          contact_name?: string
          email?: string
          project_name?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: "approved" | "pending_review" | "rejected"
          submitted_at?: string
          telegram_handle?: string
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
      ss_sentinel_tags: {
        Row: {
          assigned_at: string
          sentinel_id: number
          tag_id: string
        }
        Insert: {
          assigned_at?: string
          sentinel_id: number
          tag_id: string
        }
        Update: {
          assigned_at?: string
          sentinel_id?: number
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ss_sentinel_tags_sentinel_id_fkey"
            columns: ["sentinel_id"]
            isOneToOne: false
            referencedRelation: "ss_agents"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "ss_sentinel_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "ss_tags"
            referencedColumns: ["tag_id"]
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
          platform_username: string | null
          user_id: string | null
        }
        Insert: {
          connected_at?: string | null
          id?: string
          platform: string
          platform_avatar_url?: string | null
          platform_user_id: string
          platform_username?: string | null
          user_id?: string | null
        }
        Update: {
          connected_at?: string | null
          id?: string
          platform?: string
          platform_avatar_url?: string | null
          platform_user_id?: string
          platform_username?: string | null
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
      ss_sentinel_attribution: {
        Row: {
          agent_id: number
          created_at: string
          org_description: string | null
          org_x_handle: string | null
          updated_at: string
        }
        Insert: {
          agent_id: number
          created_at?: string
          org_description?: string | null
          org_x_handle?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: number
          created_at?: string
          org_description?: string | null
          org_x_handle?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ss_sentinel_attribution_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "ss_agents"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ss_share_facts: {
        Row: {
          created_at: string
          fact: string
          fact_id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          fact: string
          fact_id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          fact?: string
          fact_id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ss_tags: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          is_active: boolean
          name: string
          slug: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          is_active?: boolean
          name: string
          slug: string
          tag_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ss_user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ss_user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "ss_rewards_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ss_user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "ss_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ss_user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "ss_rewards_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ss_user_follows_following_id_fkey"
            columns: ["following_id"]
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
          email_notifications: boolean | null
          id: string
          lifetime_points: number | null
          rewards_tier: string | null
          rewards_updated_at: string | null
          total_points: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          id?: string
          lifetime_points?: number | null
          rewards_tier?: string | null
          rewards_updated_at?: string | null
          total_points?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          id?: string
          lifetime_points?: number | null
          rewards_tier?: string | null
          rewards_updated_at?: string | null
          total_points?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      ss_verification_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          expires_at: string
          id: string
          target: string
          target_username: string | null
          type: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          target: string
          target_username?: string | null
          type: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          target?: string
          target_username?: string | null
          type?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ss_verification_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ss_rewards_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ss_verification_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ss_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ss_wallet_connections: {
        Row: {
          chain_id: string | null
          chain_type: string
          connected_at: string | null
          id: string
          is_primary: boolean | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          chain_id?: string | null
          chain_type: string
          connected_at?: string | null
          id?: string
          is_primary?: boolean | null
          user_id: string
          wallet_address: string
        }
        Update: {
          chain_id?: string | null
          chain_type?: string
          connected_at?: string | null
          id?: string
          is_primary?: boolean | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "ss_wallet_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ss_rewards_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ss_wallet_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ss_users"
            referencedColumns: ["id"]
          },
        ]
      }
      syndicate_chat_message: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          sender_address: string
          sender_role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          sender_address: string
          sender_role?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          sender_address?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndicate_chat_message_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "syndicate_chat_room"
            referencedColumns: ["id"]
          },
        ]
      }
      syndicate_chat_room: {
        Row: {
          created_at: string
          id: string
          network: string
          syndicate_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          network: string
          syndicate_address: string
        }
        Update: {
          created_at?: string
          id?: string
          network?: string
          syndicate_address?: string
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
      merge_user_accounts: {
        Args: { merging_user_id: string; surviving_user_id: string }
        Returns: undefined
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
  sentinel: {
    Enums: {},
  },
} as const
