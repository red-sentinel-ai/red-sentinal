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
    PostgrestVersion: "12.0.2 (a4e00ff)"
  }
  public: {
    Tables: {
      aztec_discord_server_collections: {
        Row: {
          collection_id: string
          created_at: string | null
          discord_server_id: string
          id: string
          role_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          discord_server_id: string
          id?: string
          role_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          discord_server_id?: string
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aztec_discord_server_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "aztec_nft_collections"
            referencedColumns: ["collection_id"]
          },
        ]
      }
      aztec_discord_verifications: {
        Row: {
          discord_user_id: string
          id: string
          verified_at: string
          wallet_address: string
        }
        Insert: {
          discord_user_id: string
          id?: string
          verified_at?: string
          wallet_address: string
        }
        Update: {
          discord_user_id?: string
          id?: string
          verified_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      aztec_nft_collections: {
        Row: {
          banner_url: string | null
          base_image_url: string | null
          collection_id: string
          collection_type: string | null
          contract_address: string | null
          created_at: string | null
          creator_address: string
          description: string
          environment: string | null
          floor_price: number | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_mint_public: boolean
          launch_date: string | null
          max_supply: number
          mint_limit_per_wallet: number | null
          mint_price: number
          mint_start_date: number | null
          name: string
          owner_count: number | null
          public_keys: string | null
          rh_public_duration: number | null
          rh_whitelist_duration: number | null
          royalty_fee: number | null
          salt: string | null
          socials: Json
          symbol: string
          total_volume: number | null
          trait_schema: Json | null
          updated_at: string | null
          voucher_amount: number | null
          whitelist_mint_price: number | null
          whitelist_mint_start_date: number | null
          whitelisted_addresses: Json | null
        }
        Insert: {
          banner_url?: string | null
          base_image_url?: string | null
          collection_id?: string
          collection_type?: string | null
          contract_address?: string | null
          created_at?: string | null
          creator_address: string
          description: string
          environment?: string | null
          floor_price?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_mint_public?: boolean
          launch_date?: string | null
          max_supply: number
          mint_limit_per_wallet?: number | null
          mint_price: number
          mint_start_date?: number | null
          name: string
          owner_count?: number | null
          public_keys?: string | null
          rh_public_duration?: number | null
          rh_whitelist_duration?: number | null
          royalty_fee?: number | null
          salt?: string | null
          socials?: Json
          symbol: string
          total_volume?: number | null
          trait_schema?: Json | null
          updated_at?: string | null
          voucher_amount?: number | null
          whitelist_mint_price?: number | null
          whitelist_mint_start_date?: number | null
          whitelisted_addresses?: Json | null
        }
        Update: {
          banner_url?: string | null
          base_image_url?: string | null
          collection_id?: string
          collection_type?: string | null
          contract_address?: string | null
          created_at?: string | null
          creator_address?: string
          description?: string
          environment?: string | null
          floor_price?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_mint_public?: boolean
          launch_date?: string | null
          max_supply?: number
          mint_limit_per_wallet?: number | null
          mint_price?: number
          mint_start_date?: number | null
          name?: string
          owner_count?: number | null
          public_keys?: string | null
          rh_public_duration?: number | null
          rh_whitelist_duration?: number | null
          royalty_fee?: number | null
          salt?: string | null
          socials?: Json
          symbol?: string
          total_volume?: number | null
          trait_schema?: Json | null
          updated_at?: string | null
          voucher_amount?: number | null
          whitelist_mint_price?: number | null
          whitelist_mint_start_date?: number | null
          whitelisted_addresses?: Json | null
        }
        Relationships: []
      }
      aztec_nfts: {
        Row: {
          claim_txn_hash: string | null
          collection_id: string
          created_at: string | null
          current_price: number | null
          description: string | null
          id: number
          image_url: string
          is_listed: boolean | null
          last_sale_date: string | null
          last_sale_price: number | null
          mint_date: string | null
          name: string
          owner_address: string | null
          token_id: number | null
          token_uri: string | null
          traits: Json | null
          txn_hash: string | null
          updated_at: string | null
        }
        Insert: {
          claim_txn_hash?: string | null
          collection_id: string
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          id?: never
          image_url: string
          is_listed?: boolean | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          mint_date?: string | null
          name: string
          owner_address?: string | null
          token_id?: number | null
          token_uri?: string | null
          traits?: Json | null
          txn_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          claim_txn_hash?: string | null
          collection_id?: string
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          id?: never
          image_url?: string
          is_listed?: boolean | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          mint_date?: string | null
          name?: string
          owner_address?: string | null
          token_id?: number | null
          token_uri?: string | null
          traits?: Json | null
          txn_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aztec_nfts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "aztec_nft_collections"
            referencedColumns: ["collection_id"]
          },
        ]
      }
      aztec_transactions: {
        Row: {
          age: string
          block_height: string | null
          created_at: string
          id: number
          txn_hash: string
          txn_status: string
          txn_type: string
        }
        Insert: {
          age: string
          block_height?: string | null
          created_at?: string
          id?: number
          txn_hash: string
          txn_status: string
          txn_type: string
        }
        Update: {
          age?: string
          block_height?: string | null
          created_at?: string
          id?: number
          txn_hash?: string
          txn_status?: string
          txn_type?: string
        }
        Relationships: []
      }
      fitrace_signup_emails: {
        Row: {
          created_at: string
          email: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          competition_key: string
          created_at: string
          game_id: number
          id: number
          score: number
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          competition_key: string
          created_at?: string
          game_id: number
          id?: number
          score: number
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          competition_key?: string
          created_at?: string
          game_id?: number
          id?: number
          score?: number
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: true
            referencedRelation: "transaction_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      global_config: {
        Row: {
          config_values: Json
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          config_values: Json
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          config_values?: Json
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      minapunks_nfts: {
        Row: {
          category: string
          created_at: string
          id: number
          img_url: string
          is_public_mint: boolean
          name: string
          nft_id: number | null
          owner_address: string | null
          price: number
          traits: Json | null
          txn_hash: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: number
          img_url: string
          is_public_mint?: boolean
          name: string
          nft_id?: number | null
          owner_address?: string | null
          price: number
          traits?: Json | null
          txn_hash?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: number
          img_url?: string
          is_public_mint?: boolean
          name?: string
          nft_id?: number | null
          owner_address?: string | null
          price?: number
          traits?: Json | null
          txn_hash?: string | null
        }
        Relationships: []
      }
      minaty_nfts: {
        Row: {
          category: Database["public"]["Enums"]["nft_category"]
          created_at: string
          description: string | null
          id: number
          img_url: string
          is_public_mint: boolean
          name: string
          nft_id: number | null
          owner_address: string | null
          price: number
          traits: Json | null
          txn_hash: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["nft_category"]
          created_at?: string
          description?: string | null
          id?: number
          img_url: string
          is_public_mint?: boolean
          name: string
          nft_id?: number | null
          owner_address?: string | null
          price: number
          traits?: Json | null
          txn_hash?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["nft_category"]
          created_at?: string
          description?: string | null
          id?: number
          img_url?: string
          is_public_mint?: boolean
          name?: string
          nft_id?: number | null
          owner_address?: string | null
          price?: number
          traits?: Json | null
          txn_hash?: string | null
        }
        Relationships: []
      }
      nonce_counters: {
        Row: {
          counter: number | null
          id: number
          last_updated: string | null
          wallet_address: string
        }
        Insert: {
          counter?: number | null
          id?: number
          last_updated?: string | null
          wallet_address: string
        }
        Update: {
          counter?: number | null
          id?: number
          last_updated?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string
          category: string
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          place_id: string
        }
        Insert: {
          address: string
          category: string
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          name: string
          place_id: string
        }
        Update: {
          address?: string
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          name?: string
          place_id?: string
        }
        Relationships: []
      }
      player_profile: {
        Row: {
          avatar_url: string | null
          created_at: string
          discord_username: Json
          email_address: Json
          followers: string[]
          following: string[]
          fullname: string | null
          id: number
          telegram_username: Json
          total_rewards: number
          twitter_username: Json
          username: string
          wallet_address: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          discord_username?: Json
          email_address?: Json
          followers?: string[]
          following?: string[]
          fullname?: string | null
          id?: number
          telegram_username?: Json
          total_rewards?: number
          twitter_username?: Json
          username: string
          wallet_address: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          discord_username?: Json
          email_address?: Json
          followers?: string[]
          following?: string[]
          fullname?: string | null
          id?: number
          telegram_username?: Json
          total_rewards?: number
          twitter_username?: Json
          username?: string
          wallet_address?: string
        }
        Relationships: []
      }
      pvp_challenge_participants: {
        Row: {
          challenge_id: number
          created_at: string
          has_played: boolean
          id: number
          joined_at: string
          played_at: string | null
          score: number | null
          txn_hash: string | null
          txn_status: string | null
          wallet_address: string
        }
        Insert: {
          challenge_id: number
          created_at?: string
          has_played?: boolean
          id?: number
          joined_at?: string
          played_at?: string | null
          score?: number | null
          txn_hash?: string | null
          txn_status?: string | null
          wallet_address: string
        }
        Update: {
          challenge_id?: number
          created_at?: string
          has_played?: boolean
          id?: number
          joined_at?: string
          played_at?: string | null
          score?: number | null
          txn_hash?: string | null
          txn_status?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "pvp_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_challenges: {
        Row: {
          created_at: string
          created_by: string
          end_time: string
          entry_fee: number
          id: number
          invite_code: string
          is_public: boolean
          is_reward_sent: boolean
          is_speed_challenge: boolean
          max_participants: number
          name: string
          reward_txn_hash: string | null
          speed_duration: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          end_time: string
          entry_fee?: number
          id?: number
          invite_code: string
          is_public?: boolean
          is_reward_sent?: boolean
          is_speed_challenge?: boolean
          max_participants?: number
          name: string
          reward_txn_hash?: string | null
          speed_duration?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          end_time?: string
          entry_fee?: number
          id?: number
          invite_code?: string
          is_public?: boolean
          is_reward_sent?: boolean
          is_speed_challenge?: boolean
          max_participants?: number
          name?: string
          reward_txn_hash?: string | null
          speed_duration?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          downvotes: number | null
          id: string
          location_proof: string
          place_id: string
          rating: number
          review_text: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          downvotes?: number | null
          id?: string
          location_proof: string
          place_id: string
          rating: number
          review_text: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          downvotes?: number | null
          id?: string
          location_proof?: string
          place_id?: string
          rating?: number
          review_text?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["place_id"]
          },
        ]
      }
      rh_nft_upload_tasks: {
        Row: {
          collection_id: string
          created_at: string | null
          file_path: string | null
          id: string
          public_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          file_path?: string | null
          id?: string
          public_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          file_path?: string | null
          id?: string
          public_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_nft_upload_tasks_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "aztec_nft_collections"
            referencedColumns: ["collection_id"]
          },
        ]
      }
      rh_rewards_activity: {
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
            foreignKeyName: "fk_rh_rewards_activity_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rh_rewards_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_rh_rewards_activity_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rh_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_social_connections: {
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
            foreignKeyName: "rh_social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rh_rewards_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "rh_social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rh_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          lifetime_points: number | null
          rewards_tier: string | null
          rewards_updated_at: string | null
          total_points: number | null
          username: string | null
          wallet_addresses: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          lifetime_points?: number | null
          rewards_tier?: string | null
          rewards_updated_at?: string | null
          total_points?: number | null
          username?: string | null
          wallet_addresses?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          lifetime_points?: number | null
          rewards_tier?: string | null
          rewards_updated_at?: string | null
          total_points?: number | null
          username?: string | null
          wallet_addresses?: string[] | null
        }
        Relationships: []
      }
      rh_whitelist_addresses: {
        Row: {
          address: string
          collection_id: string | null
          created_at: string | null
          id: string
          indices: string[]
          is_active: boolean | null
          root: string
          siblings: string[]
        }
        Insert: {
          address: string
          collection_id?: string | null
          created_at?: string | null
          id?: string
          indices: string[]
          is_active?: boolean | null
          root: string
          siblings: string[]
        }
        Update: {
          address?: string
          collection_id?: string | null
          created_at?: string | null
          id?: string
          indices?: string[]
          is_active?: boolean | null
          root?: string
          siblings?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "rh_whitelist_addresses_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "aztec_nft_collections"
            referencedColumns: ["collection_id"]
          },
        ]
      }
      signup_emails: {
        Row: {
          access_grant_email_sent: boolean | null
          created_at: string
          description: string | null
          discord_username: string | null
          email: string
          email_sent_at: string | null
          id: string
          is_approved: boolean | null
          is_call_schedule_email_send: boolean | null
          is_email_sent: boolean | null
          is_priority: boolean | null
          name: string
          twitter_username: string | null
          type: string | null
          wallet_address: string | null
        }
        Insert: {
          access_grant_email_sent?: boolean | null
          created_at?: string
          description?: string | null
          discord_username?: string | null
          email: string
          email_sent_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_call_schedule_email_send?: boolean | null
          is_email_sent?: boolean | null
          is_priority?: boolean | null
          name: string
          twitter_username?: string | null
          type?: string | null
          wallet_address?: string | null
        }
        Update: {
          access_grant_email_sent?: boolean | null
          created_at?: string
          description?: string | null
          discord_username?: string | null
          email?: string
          email_sent_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_call_schedule_email_send?: boolean | null
          is_email_sent?: boolean | null
          is_priority?: boolean | null
          name?: string
          twitter_username?: string | null
          type?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      ss_agents: {
        Row: {
          agent_id: number
          agent_name: string
          agent_profile: string | null
          created_at: string | null
          digest: string | null
          is_featured: boolean
          object_id: string
          owner: string
        }
        Insert: {
          agent_id: number
          agent_name: string
          agent_profile?: string | null
          created_at?: string | null
          digest?: string | null
          is_featured?: boolean
          object_id: string
          owner: string
        }
        Update: {
          agent_id?: number
          agent_name?: string
          agent_profile?: string | null
          created_at?: string | null
          digest?: string | null
          is_featured?: boolean
          object_id?: string
          owner?: string
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
          id: string
          lifetime_points: number | null
          rewards_tier: string | null
          rewards_updated_at: string | null
          total_points: number | null
          username: string | null
          wallet_addresses: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          lifetime_points?: number | null
          rewards_tier?: string | null
          rewards_updated_at?: string | null
          total_points?: number | null
          username?: string | null
          wallet_addresses?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          lifetime_points?: number | null
          rewards_tier?: string | null
          rewards_updated_at?: string | null
          total_points?: number | null
          username?: string | null
          wallet_addresses?: string[] | null
        }
        Relationships: []
      }
      telegram_auth: {
        Row: {
          authenticated: boolean | null
          chat_id: string | null
          created_at: string
          id: number
          wallet_address: string | null
        }
        Insert: {
          authenticated?: boolean | null
          chat_id?: string | null
          created_at?: string
          id?: number
          wallet_address?: string | null
        }
        Update: {
          authenticated?: boolean | null
          chat_id?: string | null
          created_at?: string
          id?: number
          wallet_address?: string | null
        }
        Relationships: []
      }
      tileville_builder_nfts: {
        Row: {
          created_at: string
          img_url: string
          is_public_mint: boolean
          name: string
          nft_id: number
          owner_address: string | null
          price: number
          traits: Json | null
          txn_hash: string | null
        }
        Insert: {
          created_at?: string
          img_url: string
          is_public_mint?: boolean
          name: string
          nft_id?: number
          owner_address?: string | null
          price: number
          traits?: Json | null
          txn_hash?: string | null
        }
        Update: {
          created_at?: string
          img_url?: string
          is_public_mint?: boolean
          name?: string
          nft_id?: number
          owner_address?: string | null
          price?: number
          traits?: Json | null
          txn_hash?: string | null
        }
        Relationships: []
      }
      tileville_competitions: {
        Row: {
          competition_tweet_content: string
          created_at: string
          currency_symbol: string
          description: string
          end_date: string
          funds: number
          id: number
          is_speed_version: boolean
          name: string
          participation_fee: number | null
          poster_url: string | null
          priority: number
          prizes: Json | null
          score_tweet_content: string
          seed: number
          speed_duration: number
          start_date: string
          treasury_address: string | null
          unique_keyname: string
        }
        Insert: {
          competition_tweet_content?: string
          created_at?: string
          currency_symbol?: string
          description: string
          end_date: string
          funds?: number
          id?: number
          is_speed_version?: boolean
          name: string
          participation_fee?: number | null
          poster_url?: string | null
          priority?: number
          prizes?: Json | null
          score_tweet_content?: string
          seed?: number
          speed_duration?: number
          start_date: string
          treasury_address?: string | null
          unique_keyname: string
        }
        Update: {
          competition_tweet_content?: string
          created_at?: string
          currency_symbol?: string
          description?: string
          end_date?: string
          funds?: number
          id?: number
          is_speed_version?: boolean
          name?: string
          participation_fee?: number | null
          poster_url?: string | null
          priority?: number
          prizes?: Json | null
          score_tweet_content?: string
          seed?: number
          speed_duration?: number
          start_date?: string
          treasury_address?: string | null
          unique_keyname?: string
        }
        Relationships: []
      }
      transaction_logs: {
        Row: {
          competition_key: string
          created_at: string
          id: number
          is_game_played: boolean
          network: string
          txn_hash: string
          txn_status: string
          wallet_address: string
        }
        Insert: {
          competition_key: string
          created_at?: string
          id?: number
          is_game_played?: boolean
          network?: string
          txn_hash: string
          txn_status?: string
          wallet_address: string
        }
        Update: {
          competition_key?: string
          created_at?: string
          id?: number
          is_game_played?: boolean
          network?: string
          txn_hash?: string
          txn_status?: string
          wallet_address?: string
        }
        Relationships: []
      }
      voucher_codes: {
        Row: {
          code: string
          competition_id: number | null
          created_at: string
          expiry_date: string | null
          id: number
          is_redeemed: boolean
          redeemed_at: string | null
          redeemed_by: string | null
        }
        Insert: {
          code: string
          competition_id?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: number
          is_redeemed?: boolean
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Update: {
          code?: string
          competition_id?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: number
          is_redeemed?: boolean
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Relationships: []
      }
      wallet_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          fingerprint: string
          id: string
          token: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          fingerprint: string
          id?: string
          token: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          fingerprint?: string
          id?: string
          token?: string
          wallet_address?: string
        }
        Relationships: []
      }
      zkgod_nfts: {
        Row: {
          created_at: string
          id: number
          img_url: string
          is_public_mint: boolean
          name: string
          nft_id: number | null
          owner_address: string | null
          price: number
          traits: Json | null
          txn_hash: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          img_url: string
          is_public_mint?: boolean
          name: string
          nft_id?: number | null
          owner_address?: string | null
          price: number
          traits?: Json | null
          txn_hash?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          img_url?: string
          is_public_mint?: boolean
          name?: string
          nft_id?: number | null
          owner_address?: string | null
          price?: number
          traits?: Json | null
          txn_hash?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      rh_rewards_leaderboard: {
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
        }
        Relationships: []
      }
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
        }
        Relationships: []
      }
    }
    Functions: {
      increment_nonce_counter: {
        Args: { wallet_addr: string }
        Returns: number
      }
      increment_user_points: {
        Args: { points_to_add: number; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      nft_category:
        | "FOUNDER"
        | "DESIGNER"
        | "SOLDIER"
        | "GUARDIAN"
        | "TOTEM"
        | "YOUR_NEW_CATEGORY"
        | "ZKON"
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
      nft_category: [
        "FOUNDER",
        "DESIGNER",
        "SOLDIER",
        "GUARDIAN",
        "TOTEM",
        "YOUR_NEW_CATEGORY",
        "ZKON",
      ],
    },
  },
} as const
