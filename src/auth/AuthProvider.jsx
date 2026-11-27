import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AuthContext from './AuthContext';
import { getCurrentUser } from '../services/authService';

const PUBLIC_PATHS = new Set(['/', '/registrarme']);

function AuthProvider({ children }) {
  const { pathname } = useLocation();
  const [session, setSession] = useState({ user: null, status: 'unverified' });

  useEffect(() => {
    if (PUBLIC_PATHS.has(pathname) || session.status !== 'unverified') return undefined;

    let active = true;
    getCurrentUser()
      .then((user) => {
        if (active) setSession({ user, status: 'authenticated' });
      })
      .catch((error) => {
        if (active) {
          console.error('No se pudo verificar la sesión:', error);
          setSession({ user: null, status: 'anonymous' });
        }
      });

    return () => { active = false; };
  }, [pathname, session.status]);

  const value = useMemo(() => ({
    user: session.user,
    isLoading: session.status === 'unverified',
    setAuthenticatedUser: (user) => setSession({ user, status: 'authenticated' }),
    updateAuthenticatedUser: (changes) => setSession((current) => ({
      ...current,
      user: current.user ? { ...current.user, ...changes } : current.user,
    })),
    clearAuthenticatedUser: () => setSession({ user: null, status: 'anonymous' }),
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
