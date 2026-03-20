export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/** Per-day opening hours: { open: "09:00", close: "17:00" } or { closed: true } */
export type DayHours = { open: string; close: string } | { closed: true }

/** Opening hours keyed by day (monday..sunday) */
export type OpeningHoursJson = Record<string, DayHours | null>

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      exterior_colors: {
        Row: {
          created_at: string
          id: string
          name: string
          name_en: string
          name_es: string
          name_fr: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          name_en: string
          name_es: string
          name_fr: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_en?: string
          name_es?: string
          name_fr?: string
        }
        Relationships: []
      }
      engines: {
        Row: {
          created_at: string
          id: string
          name: string
          name_en: string | null
          name_es: string
          name_fr: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          name_en: string
          name_es: string
          name_fr: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_en?: string
          name_es?: string
          name_fr?: string
        }
        Relationships: []
      }
      fuels: {
        Row: {
          created_at: string
          id: string
          name: string
          name_en: string
          name_es: string
          name_fr: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          name_en: string
          name_es: string
          name_fr: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_en?: string
          name_es?: string
          name_fr?: string
        }
        Relationships: []
      }
      transmissions: {
        Row: {
          created_at: string
          id: string
          name: string
          name_en: string | null
          name_es: string
          name_fr: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          name_en: string
          name_es: string
          name_fr: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_en?: string
          name_es?: string
          name_fr?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          name_en: string | null
          name_es: string
          name_fr: string | null
          image_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          name_en: string
          name_es: string
          name_fr: string
          image_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_en?: string
          name_es?: string
          name_fr?: string
          image_url?: string | null
        }
        Relationships: []
      }
      brand_models: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      model_trims: {
        Row: {
          brand_model_id: string
          created_at: string
          id: string
          name: string
          name_en: string
          name_es: string
          name_fr: string
        }
        Insert: {
          brand_model_id: string
          created_at?: string
          id?: string
          name: string
          name_en: string
          name_es: string
          name_fr: string
        }
        Update: {
          brand_model_id?: string
          created_at?: string
          id?: string
          name?: string
          name_en?: string
          name_es?: string
          name_fr?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_trims_brand_model_id_fkey"
            columns: ["brand_model_id"]
            isOneToOne: false
            referencedRelation: "brand_models"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      car_images: {
        Row: {
          car_id: string
          created_at: string
          id: string
          image_url: string
          is_cover: boolean
          sort_order: number
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          image_url: string
          is_cover?: boolean
          sort_order?: number
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          image_url?: string
          is_cover?: boolean
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "car_images_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          brand: string
          carfax_url: string | null
          cargurus_url: string | null
          category: string | null
          exterior_color: string | null
          engine: string | null
          fuel: string | null
          created_at: string
          description: string | null
          description_en: string | null
          description_es: string | null
          description_fr: string | null
          discounted_price: number | null
          featured: boolean
          id: string
          km: number
          model: string
          price: number
          slug: string
          status: string
          transmission: string | null
          trim: string | null
          title: string
          updated_at: string
          vin: string | null
          warranty: boolean | null
          year: number
        }
        Insert: {
          brand: string
          carfax_url?: string | null
          cargurus_url?: string | null
          category?: string | null
          exterior_color?: string | null
          engine?: string | null
          fuel?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          description_fr?: string | null
          discounted_price?: number | null
          featured?: boolean
          id?: string
          km: number
          model: string
          price: number
          slug: string
          status?: string
          transmission?: string | null
          trim?: string | null
          title: string
          updated_at?: string
          vin?: string | null
          warranty?: boolean | null
          year: number
        }
        Update: {
          brand?: string
          carfax_url?: string | null
          cargurus_url?: string | null
          category?: string | null
          exterior_color?: string | null
          engine?: string | null
          fuel?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          description_fr?: string | null
          discounted_price?: number | null
          featured?: boolean
          id?: string
          km?: number
          model?: string
          price?: number
          slug?: string
          status?: string
          transmission?: string | null
          trim?: string | null
          title?: string
          updated_at?: string
          vin?: string | null
          warranty?: boolean | null
          year?: number
        }
        Relationships: []
      }
      todo_list: {
        Row: {
          created_at: string
          description: string | null
          done: boolean
          done_at: string | null
          id: number
          owner: string
          title: string
          urgent: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          id?: number
          owner: string
          title: string
          urgent?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          id?: number
          owner?: string
          title?: string
          urgent?: boolean
        }
        Relationships: []
      }
      feature_categories: {
        Row: {
          id: string
          name: string | null
          name_en: string
          name_es: string
          name_fr: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          name_en: string
          name_es: string
          name_fr: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          name_en?: string
          name_es?: string
          name_fr?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      features: {
        Row: {
          id: string
          feature_category_id: string
          name: string | null
          name_en: string
          name_es: string
          name_fr: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          feature_category_id: string
          name?: string | null
          name_en: string
          name_es: string
          name_fr: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          feature_category_id?: string
          name?: string | null
          name_en?: string
          name_es?: string
          name_fr?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "features_feature_category_id_fkey"
            columns: ["feature_category_id"]
            isOneToOne: false
            referencedRelation: "feature_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      car_features: {
        Row: {
          car_id: string
          feature_id: string
        }
        Insert: {
          car_id: string
          feature_id: string
        }
        Update: {
          car_id?: string
          feature_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_features_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          business_name: string | null
          logo_light: string | null
          logo_dark: string | null
          favicon: string | null
          address: string | null
          email: string | null
          contact_form_email: string | null
          phone: string | null
          instagram_url: string | null
          facebook_url: string | null
          twitter_url: string | null
          opening_hours: OpeningHoursJson | null
          meta_title: string | null
          meta_description: string | null
          og_image: string | null
          site_url: string | null
          google_analytics_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          business_name?: string | null
          logo_light?: string | null
          logo_dark?: string | null
          favicon?: string | null
          address?: string | null
          email?: string | null
          contact_form_email?: string | null
          phone?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          twitter_url?: string | null
          opening_hours?: OpeningHoursJson | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          site_url?: string | null
          google_analytics_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string | null
          logo_light?: string | null
          logo_dark?: string | null
          favicon?: string | null
          address?: string | null
          email?: string | null
          contact_form_email?: string | null
          phone?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          twitter_url?: string | null
          opening_hours?: OpeningHoursJson | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          site_url?: string | null
          google_analytics_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
