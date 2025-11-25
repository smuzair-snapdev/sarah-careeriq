export interface User {
  id: string;
  email: string;
  name: string;
  created_date: string;
  last_login_date: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const authService = {
  register: (email: string, password: string, name: string): User => {
    if (typeof window === 'undefined') {
      throw new Error('localStorage not available');
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      created_date: new Date().toISOString(),
      last_login_date: new Date().toISOString(),
    };
    
    // Store user and password separately
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Store password (in real app, this would be hashed)
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    passwords[email] = password;
    localStorage.setItem('passwords', JSON.stringify(passwords));
    
    // Set current user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return newUser;
  },
  
  login: (email: string, password: string): User => {
    if (typeof window === 'undefined') {
      throw new Error('localStorage not available');
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    
    const user = users.find((u: any) => u.email === email);
    
    if (!user) {
      throw new Error('No account found with this email. Please sign up first.');
    }
    
    if (passwords[email] !== password) {
      throw new Error('Invalid password');
    }
    
    // Update last login
    user.last_login_date = new Date().toISOString();
    const updatedUsers = users.map((u: User) => u.id === user.id ? user : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  },
  
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  },
  
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('currentUser');
  },
};

