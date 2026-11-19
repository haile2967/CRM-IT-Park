import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import keycloak from '../services/keycloak';
import { authService } from '../services/authService';
import type { LoginCredentials, User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials?: LoginCredentials) => void;
  logout: () => Promise<void>;
  setAuthSession: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('crm_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('crm_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isInitCalled = useRef(false);

  const logout = useCallback(async () => {
    // 1. Immediately purge authentication credentials from local storage & React state
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    sessionStorage.clear();
    setToken(null);
    setUser(null);

    // 2. Fire-and-forget backend session revocation
    authService.logout().catch(() => {});

    // 3. Invalidate Keycloak SSO session if authenticated (with safety timeout)
    try {
      if (keycloak.authenticated) {
        await Promise.race([
          keycloak.logout({ redirectUri: window.location.origin + '/login' }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Keycloak logout timeout')), 1500)),
        ]);
        return;
      }
    } catch (e) {
      console.warn('Keycloak logout error:', e);
    }

    // 4. Instant browser redirection to login page
    window.location.replace('/login');
  }, []);

  useEffect(() => {
    if (isInitCalled.current) return;
    isInitCalled.current = true;

    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then(async (authenticated) => {
        if (authenticated && keycloak.token) {
          setToken(keycloak.token);
          localStorage.setItem('crm_token', keycloak.token);

          // Asynchronously enrich and verify with the official persisted profile from the backend database
          try {
            const profile = await authService.getMe();
            setUser(profile);
            localStorage.setItem('crm_user', JSON.stringify(profile));
            setIsLoading(false);
          } catch (e: any) {
            console.error('Failed to load synced user profile from backend', e);

            const status = e?.response?.status;
            const errorMsg =
              e?.response?.data?.message ||
              'Access Denied: Your account has not been provisioned in the Ethiopian IT Park CRM.';

            // Approach 2: Strict Enterprise Security — Reject unprovisioned or deactivated accounts
            localStorage.removeItem('crm_token');
            localStorage.removeItem('crm_user');
            setToken(null);
            setUser(null);
            setIsLoading(false);

            if (status === 403 || status === 401) {
              const redirectUri = `${window.location.origin}/login?error=${encodeURIComponent(errorMsg)}`;
              try {
                await keycloak.logout({ redirectUri });
              } catch {
                window.location.replace(redirectUri);
              }
              return;
            }
          }
        } else {
          setToken(null);
          setUser(null);
          localStorage.removeItem('crm_token');
          localStorage.removeItem('crm_user');
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Keycloak initialization error', err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        setIsLoading(false);
      });

    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed && keycloak.token) {
            setToken(keycloak.token);
            localStorage.setItem('crm_token', keycloak.token);
          }
        })
        .catch(() => {
          console.warn('Keycloak token refresh failed, logging out');
          logout();
        });
    };

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('crm:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('crm:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = useCallback((_credentials?: LoginCredentials) => {
    keycloak.login({
      redirectUri: window.location.origin + '/dashboard',
    });
  }, []);

  const setAuthSession = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('crm_token', newToken);
    localStorage.setItem('crm_user', JSON.stringify(newUser));
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean((keycloak.authenticated || token) && user),
    login,
    logout,
    setAuthSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
