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
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    
    const user = users.find((u: any) => u.email === email);
    
    if (!user || passwords[email] !== password) {
      throw new Error('Invalid email or password');
    }
    
    // Update last login
    user.last_login_date = new Date().toISOString();
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  },
  
  logout: (): void => {
    localStorage.removeItem('currentUser');
  },
  
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('currentUser');
  },
};
