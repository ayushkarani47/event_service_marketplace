// Supabase Database Types for Event Service Marketplace
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      // Users table - phone is the primary identifier
      users: {
        Row: {
          id: string;
          phone: string; // Primary identifier for users
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          role: 'customer' | 'service_provider' | 'admin';
          profile_picture: string | null;
          bio: string | null;
          address: Json | null; // { street, city, state, zipCode, country }
          rating: number;
          review_count: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'is_verified'> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };

      // Services table
      services: {
        Row: {
          id: string;
          provider_id: string; // Foreign key to users.id
          title: string;
          description: string;
          category: string;
          price: number;
          price_type: string; // 'fixed', 'hourly', 'starting_at'
          images: string[];
          location: string;
          rating: number;
          review_count: number;
          availability: Json | null; // { startDate, endDate }
          features: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["services"]["Row"]>;
      };

      // Bookings table
      bookings: {
        Row: {
          id: string;
          service_id: string; // Foreign key to services.id
          customer_id: string; // Foreign key to users.id
          provider_id: string; // Foreign key to users.id
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          booking_date: string;
          event_date: string;
          total_price: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
      };

      // Reviews table
      reviews: {
        Row: {
          id: string;
          service_id: string; // Foreign key to services.id
          reviewer_id: string; // Foreign key to users.id
          provider_id: string; // Foreign key to users.id
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };

      // Conversations table
      conversations: {
        Row: {
          id: string;
          participant_1_id: string; // Foreign key to users.id
          participant_2_id: string; // Foreign key to users.id
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversations"]["Row"], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
      };

      // Messages table
      messages: {
        Row: {
          id: string;
          conversation_id: string; // Foreign key to conversations.id
          sender_id: string; // Foreign key to users.id
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
      };

      // OTP verification table for phone authentication
      otp_verifications: {
        Row: {
          id: string;
          phone: string;
          otp_code: string;
          expires_at: string;
          verified: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["otp_verifications"]["Row"], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["otp_verifications"]["Row"]>;
      };
    };
    Views: {};
    Functions: {};
  };
}
