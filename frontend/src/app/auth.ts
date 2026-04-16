// Simple auth utilities for localStorage
export const AUTH_KEY = 'sniper_auth_token';

export const checkAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'authenticated';
};

export const login = (username: string, password: string): boolean => {
  const validUsername = process.env.NEXT_PUBLIC_LOGIN_USERNAME || 'admin';
  const validPassword = process.env.NEXT_PUBLIC_LOGIN_PASSWORD || 'password';
  
  if (username === validUsername && password === validPassword) {
    localStorage.setItem(AUTH_KEY, 'authenticated');
    localStorage.setItem('login_time', new Date().toISOString());
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem('login_time');
};
