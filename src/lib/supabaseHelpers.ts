import { supabase } from './supabaseClient';
import { Database } from '@/types_db';

// User operations
export const userOperations = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async getByPhone(phone: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    return { data, error };
  },

  async create(user: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, updates: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    return { error };
  },
};

// Service operations
export const serviceOperations = {
  async getAll(limit = 10, offset = 0) {
    const { data, error, count } = await supabase
      .from('services')
      .select('*, users(id, first_name, last_name, profile_picture, rating)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    return { data, error, count };
  },

  async search(query: string, limit = 10, offset = 0) {
    const { data, error, count } = await supabase
      .from('services')
      .select('*, users(id, first_name, last_name, profile_picture, rating)', { count: 'exact' })
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    return { data, error, count };
  },

  async getByCategory(category: string, limit = 10, offset = 0) {
    const { data, error, count } = await supabase
      .from('services')
      .select('*, users(id, first_name, last_name, profile_picture, rating)', { count: 'exact' })
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    return { data, error, count };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*, users(id, first_name, last_name, profile_picture, rating, bio)')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async getByProviderId(providerId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async create(service: Database['public']['Tables']['services']['Insert']) {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, updates: Database['public']['Tables']['services']['Update']) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    return { error };
  },
};

// Booking operations
export const bookingOperations = {
  async getByCustomerId(customerId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(id, title, price, images), provider:provider_id(id, first_name, last_name)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getByProviderId(providerId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(id, title, price, images), customer:customer_id(id, first_name, last_name)')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(id, title, price, images), customer:customer_id(id, first_name, last_name, phone), provider:provider_id(id, first_name, last_name, phone)')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(booking: Database['public']['Tables']['bookings']['Insert']) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, updates: Database['public']['Tables']['bookings']['Update']) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    return { error };
  },
};

// Review operations
export const reviewOperations = {
  async getByServiceId(serviceId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users:reviewer_id(id, first_name, last_name, profile_picture)')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(review: Database['public']['Tables']['reviews']['Insert']) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, updates: Database['public']['Tables']['reviews']['Update']) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    return { error };
  },
};

// Conversation operations
export const conversationOperations = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, participant_1:participant_1_id(id, first_name, last_name, profile_picture), participant_2:participant_2_id(id, first_name, last_name, profile_picture)')
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(conversation: Database['public']['Tables']['conversations']['Insert']) {
    const { data, error } = await supabase
      .from('conversations')
      .insert([conversation])
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, updates: Database['public']['Tables']['conversations']['Update']) {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },
};

// Message operations
export const messageOperations = {
  async getByConversationId(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(id, first_name, last_name, profile_picture)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  async create(message: Database['public']['Tables']['messages']['Insert']) {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();
    return { data, error };
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', id);
    return { error };
  },
};

// OTP operations
export const otpOperations = {
  async create(phone: string, otpCode: string, expiresAt: string) {
    const { data, error } = await supabase
      .from('otp_verifications')
      .insert([{ phone, otp_code: otpCode, expires_at: expiresAt, verified: false }])
      .select()
      .single();
    return { data, error };
  },

  async getLatestByPhone(phone: string) {
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return { data, error };
  },

  async markAsVerified(id: string) {
    const { error } = await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', id);
    return { error };
  },
};

// Storage operations
export const storageOperations = {
  async uploadImage(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    return { data, error };
  },

  async deleteImage(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { error };
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },
};
