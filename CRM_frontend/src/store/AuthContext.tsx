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

          // Immediately construct an initial user profile from Keycloak token claims
          const parsed = keycloak.tokenParsed as any;
          if (parsed) {
            const fallbackUser: User = {
              id: 0,
              first_name: parsed.given_name || parsed.preferred_username || 'User',
              last_name: parsed.family_name || '',
              full_name:
                parsed.name ||
                `${parsed.given_name || ''} ${parsed.family_name || ''}`.trim() ||
                'User',
              email: parsed.email || parsed.preferred_username || '',
              phone: parsed.attributes?.phone?.[0] || null,
              status: 'active',
              last_login_at: new Date().toISOString(),
              role: {
                id: 1,
                role_name:
                  (parsed.realm_access?.roles || []).find((r: string) =>
                    [
                      'System Administrator',
                      'CRM Manager',
                      'Support Agent',
                      'Business Development Officer',
                    ].includes(r)
                  ) || 'System Administrator',
                description: null,
                role_tier: 1,
              },
            };
            setUser((prev) => prev || fallbackUser);
          }

          // Unblock the UI immediately so the user does not wait on a blank page
          setIsLoading(false);

          // Asynchronously enrich with the official persisted profile from the backend database
          try {
            const profile = await authService.getMe();
            setUser(profile);
            localStorage.setItem('crm_user', JSON.stringify(profile));
          } catch (e) {
            console.error('Failed to load synced user profile from backend', e);
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
