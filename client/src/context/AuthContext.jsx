import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'collabnation_auth';

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const storedSession = localStorage.getItem(STORAGE_KEY);

    if (!storedSession) {
      return {
        token: null,
        user: null,
      };
    }

    try {
      return JSON.parse(storedSession);
    } catch (_error) {
      localStorage.removeItem(STORAGE_KEY);

      return {
        token: null,
        user: null,
      };
    }
  });

  useEffect(() => {
    if (session.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const login = ({ email, name }) => {
    setSession({
      token: 'demo-jwt-token',
      user: {
        name: name || email.split('@')[0],
        email,
        role: 'builder',
      },
    });
  };

  const register = ({ name, email }) => {
    setSession({
      token: 'demo-jwt-token',
      user: {
        name,
        email,
        role: 'founder',
      },
    });
  };

  const logout = () => {
    setSession({
      token: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token: session.token,
        user: session.user,
        isAuthenticated: Boolean(session.token),
        login,
        register,
        logout,
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

