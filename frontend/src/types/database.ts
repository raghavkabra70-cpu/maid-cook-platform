// ─── frontend/src/types/database.ts ───
// Auto-generated types for Supabase (replace with `npx supabase gen types`)

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "cook" | "household";
          full_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          cuisines: string[];
          availability: Record<string, string[]>;
          price_range: string | null;
          service_radius_km: number;
          rating: number;
          reviews_count: number;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "created_at" | "updated_at" | "rating" | "reviews_count"
        >;
        Update: Partial<
          Database["public"]["Tables"]["profiles"]["Insert"]
        >;
      };
      reviews: {
        Row: {
          id: string;
          cook_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reviews"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["reviews"]["Insert"]
        >;
      };
      inquiries: {
        Row: {
          id: string;
          cook_id: string;
          household_id: string;
          message: string | null;
          status: "pending" | "accepted" | "declined";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["inquiries"]["Row"],
          "id" | "created_at" | "updated_at" | "status"
        >;
        Update: Partial<
          Database["public"]["Tables"]["inquiries"]["Insert"]
        >;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          cook_id: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["favorites"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["favorites"]["Insert"]
        >;
      };
    };
    Functions: {
      search_nearby_cooks: {
        Args: {
          user_lat: number;
          user_lng: number;
          radius_km?: number;
          cuisine_filter?: string[] | null;
          day_filter?: string | null;
          price_filter?: string | null;
          search_query?: string | null;
          sort_by?: string;
          result_limit?: number;
          result_offset?: number;
        };
        Returns: Array<
          Database["public"]["Tables"]["profiles"]["Row"] & {
            distance_km: number;
          }
        >;
      };
    };
  };
}
