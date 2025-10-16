import { createClient } from '@supabase/supabase-js'
import { type User } from "@shared/schema";

const supabaseUrl = 'https://lgmhziyouvylsiqvgjtd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnbWh6aXlvdXZ5bHNpcXZnanRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzE4MDUsImV4cCI6MjA2ODg0NzgwNX0.u-Mm6-ZAmmuoNAzAjjREHFgGjBAzqq7uwiD5wkiCjBo'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const authService = {
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // First check localStorage for persisted session
      const storedSession = localStorage.getItem('user');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          
          // Check if session has expired
          if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
            console.log('Session expired, clearing localStorage');
            localStorage.removeItem('user');
            return null;
          }
          
          console.log('Found stored user session:', sessionData.user.email);
          return sessionData.user;
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
        }
      }

      // Then check if there's a Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return null;
      }
      
      if (!session?.user) return null;

      // Use the RPC function to get user details (bypasses RLS issues)
      const { data: users, error } = await supabase
        .rpc('get_user_by_email', { user_email: session.user.email });

      if (error) {
        console.error('User lookup error:', error);
        return null;
      }
      
      if (!users || users.length === 0) return null;
      
      // Store the user in localStorage for persistence with timestamp
      const sessionData = {
        user: users[0],
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem('user', JSON.stringify(sessionData));
      return users[0] as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  login: async ({ email, password }: { email: string; password: string }): Promise<User> => {
    try {
      // Use our custom login API that handles both Supabase Auth and database users
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const { user: authUser } = await response.json();
      
      // Convert the auth user to our User format
      const user: User = {
        id: authUser.id,
        username: authUser.user_metadata?.username || authUser.email,
        email: authUser.email,
        fullName: authUser.user_metadata?.full_name || authUser.email,
        role: authUser.user_metadata?.role || authUser.app_metadata?.role || 'viewer',
        isActive: true,
        isRestricted: authUser.user_metadata?.is_restricted || false,
        restrictionReason: authUser.user_metadata?.restriction_reason || null,
        restrictedAt: authUser.user_metadata?.restricted_at || null,
        restrictedBy: authUser.user_metadata?.restricted_by || null,
        createdAt: new Date().toISOString(),
      };

      // Store user in localStorage for session persistence with timestamp
      const sessionData = {
        user,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem('user', JSON.stringify(sessionData));
      console.log('User logged in and stored in localStorage:', user.email);

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // Get current user before clearing
      const currentUser = await authService.getCurrentUser();
      
      // Clear localStorage
      localStorage.removeItem('user');
      console.log('User logged out and cleared from localStorage');
      
      // Call logout API with user ID
      if (currentUser) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.id }),
          });
        } catch (apiError) {
          console.warn('Logout API call failed:', apiError);
        }
      }
      
      // Try Supabase Auth logout first
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase Auth logout failed:', error);
      }
    } catch (error) {
      console.warn('Logout error:', error);
    }
    // Always return success since we're just clearing local state
  },

  forceLogout: () => {
    // Aggressive logout - clear everything and redirect
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cookies if possible
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      console.log('Force logout completed - all data cleared');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during force logout:', error);
      // Even if there's an error, still redirect
      window.location.href = '/login';
    }
  },
  
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        // Clear localStorage on sign out
        localStorage.removeItem('user');
        callback(null);
        return;
      }

      try {
        // Use the RPC function to get user details (bypasses RLS issues)
        const { data: users, error } = await supabase
          .rpc('get_user_by_email', { user_email: session.user.email });

        if (error || !users || users.length === 0) {
          callback(null);
          return;
        }

        const user = users[0] as User;
        // Store user in localStorage for persistence with timestamp
        const sessionData = {
          user,
          timestamp: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('user', JSON.stringify(sessionData));
        callback(user);
      } catch (error) {
        console.error('Auth state change error:', error);
        callback(null);
      }
    });
  },
};
