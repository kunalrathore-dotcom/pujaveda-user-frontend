import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getSession());
  const [loading, setLoading] = useState(Boolean(authService.getToken()));

  useEffect(() => {
    let isMounted = true;
    const token = authService.getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((verifiedUser) => {
        if (!isMounted) return;
        if (verifiedUser) {
          setUser(verifiedUser);
        } else {
          authService.logout();
          setUser(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        authService.logout();
        setUser(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (emailOrCredentials, maybePassword) => {
    const credentials =
      typeof emailOrCredentials === "string"
        ? { email: emailOrCredentials, password: maybePassword }
        : emailOrCredentials;
    setLoading(true);
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (details) => {
    setLoading(true);
    try {
      const registeredUser = await authService.register(details);
      setUser(registeredUser);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
