// This file is kept for type compatibility but implementation is now handled by Clerk
// The shape of 'User' should match what components expect from useAuth()

export interface User {
  id: string;
  email: string;
  name: string;
  created_date?: string; // Optional now as Clerk handles this
  last_login_date?: string; // Optional now as Clerk handles this
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Deprecated authService - no longer used with Clerk
export const authService = {
  register: async (email: string, password: string, name: string): Promise<User> => {
    throw new Error("Use Clerk SignUp component");
  },
  
  login: async (email: string, password: string): Promise<User> => {
    throw new Error("Use Clerk SignIn component");
  },
  
  logout: (): void => {
    // No-op
  },
  
  getCurrentUser: (): User | null => {
    return null;
  },
  
  isAuthenticated: (): boolean => {
    return false;
  },
};

