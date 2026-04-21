import React, { createContext, useState, useContext, useEffect } from 'react';
import { backend } from '@/lib/backendClient';
import { appParams } from '@/lib/app-params';
import { fetchAppBootstrap } from '@/lib/api/bootstrap';
import { isPublicDemoMode } from '@/lib/demo/publicDemo';

/**
 * Auth state is driven by bootstrap + `/api/auth/me` (or Supabase session). Demo role
 * selection in the browser is not a security boundary. Hosted backends must enforce
 * authentication, registration, and role checks on every protected API and function.
 */
const AuthContext = createContext();

const ROLE_STORAGE_KEY = 'tracesafe_role';

function getStoredRole() {
  if (typeof window === 'undefined') return null;
  const r = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return r === 'consumer' || r === 'regulator' ? r : null;
}

function setStoredRole(role) {
  if (typeof window === 'undefined') return;
  if (!role) window.localStorage.removeItem(ROLE_STORAGE_KEY);
  else window.localStorage.setItem(ROLE_STORAGE_KEY, role);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  const [role, setRoleState] = useState(() => getStoredRole() || 'consumer');

  useEffect(() => {
    checkAppState();
  }, []);

  const setRole = (nextRole) => {
    const r = nextRole === 'regulator' ? 'regulator' : 'consumer';
    setRoleState(r);
    setStoredRole(r);
  };

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      try {
        const publicSettings = await fetchAppBootstrap({
          appId: appParams.appId,
          token: appParams.token,
        });
        setAppPublicSettings(publicSettings);
        await checkUserAuth();
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);

        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({
              type: 'auth_required',
              message: 'Authentication required',
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app',
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message,
            });
          }
        } else {
          setAuthError({
            type: 'unknown',
            message: appError.message || 'Failed to load app',
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred',
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const has = await backend.auth.hasCredentials();
      if (!has) {
        // In public demo mode, allow role-selected navigation without a backend token.
        if (isPublicDemoMode()) {
          setUser({ id: 'demo', email: null, role });
          setIsAuthenticated(true);
          setIsLoadingAuth(false);
          return;
        }
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return;
      }
      const currentUser = await backend.auth.me();
      setUser(currentUser);
      if (currentUser?.role === 'regulator' || currentUser?.role === 'consumer') {
        setRole(currentUser.role);
      }
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      if (isPublicDemoMode()) {
        // Demo mode: don't block the app if /auth/me is unavailable.
        setUser({ id: 'demo', email: null, role });
        setIsAuthenticated(true);
        return;
      }
      setIsAuthenticated(false);

      const status = error.status ?? error.response?.status;
      if (status === 401 || status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required',
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setStoredRole(null);
    setRoleState('consumer');

    if (shouldRedirect) {
      backend.auth.logout(window.location.href);
    } else {
      backend.auth.logout(false);
    }
  };

  const navigateToLogin = () => {
    backend.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      setRole,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
