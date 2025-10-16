import { createContext, useContext, useEffect, useState } from "react";
import { type User } from "@shared/schema";
import { authService } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  canManageUsers: () => boolean;
  canManageDocuments: () => boolean;
  canViewDocuments: () => boolean;
  canPerformActions: () => boolean;
  isRestricted: () => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, check if there's an existing session
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setLoading(false);
          return; // Exit early if we found a user
        }

        // If no user found, set loading to false
        setLoading(false);

        // Then set up the auth state change listener
        const { data: authListener } = authService.onAuthStateChange((user) => {
          setUser(user);
          setLoading(false);
        });

        return () => {
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const user = await authService.login(credentials);
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: user !== null,
    hasRole: (role: string) => user?.role === role,
    canManageUsers: () => user?.role === "admin",
    canManageDocuments: () =>
      user?.role === "admin" || user?.role === "archivist",
    canViewDocuments: () => user !== null,
    canPerformActions: () => user !== null && !user?.isRestricted,
    isRestricted: () => user?.isRestricted || false,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
