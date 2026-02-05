import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  bio: string;
  category: string;
  avatar_url?: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender?: UserProfile;
}

// LocalStorage helper for demo/fallback
export const localStorageHelper = {
  getUser: (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem('prime_studio_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: UserProfile | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (user) {
        localStorage.setItem('prime_studio_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('prime_studio_user');
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  getMessages: (): Message[] => {
    if (typeof window === 'undefined') return [];
    try {
      const messages = localStorage.getItem('prime_studio_messages');
      return messages ? JSON.parse(messages) : [];
    } catch {
      return [];
    }
  },

  addMessage: (message: Message) => {
    if (typeof window === 'undefined') return;
    try {
      const messages = localStorageHelper.getMessages();
      messages.push(message);
      localStorage.setItem('prime_studio_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving message to localStorage:', error);
    }
  },

  clearMessages: (userId: string) => {
    if (typeof window === 'undefined') return;
    try {
      let messages = localStorageHelper.getMessages();
      messages = messages.filter((msg: Message) => msg.sender_id !== userId);
      localStorage.setItem('prime_studio_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  },
};
