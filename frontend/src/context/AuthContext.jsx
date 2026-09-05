import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import api from "../services/api";
import { getCurrentUser, logoutUser, registerUser } from "../services/auth.api";

const AuthContext = createContext(null);

export const AUTH_STATES = {
  LOADING: "LOADING",
  AUTHENTICATED: "AUTHENTICATED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  ERROR: "ERROR"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(AUTH_STATES.LOADING);
  const [authError, setAuthError] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUser = useCallback(async () => {
    if (!isMountedRef.current) return;
    setStatus(AUTH_STATES.LOADING);
    setAuthError(null);

    // 8-Second Safety Timeout to prevent permanent stuck LOADING state
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth verification request timed out")), 8000)
    );

    try {
      const data = await Promise.race([getCurrentUser(), timeoutPromise]);
      const fetchedUser = data.user || data.data || data;

      if (fetchedUser && isMountedRef.current) {
        setUser(fetchedUser);
        setStatus(AUTH_STATES.AUTHENTICATED);
      } else if (isMountedRef.current) {
        setUser(null);
        setStatus(AUTH_STATES.UNAUTHENTICATED);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setUser(null);
        if (error.message?.includes("timed out") || error.response?.status >= 500) {
          setStatus(AUTH_STATES.ERROR);
          setAuthError(error.message || "Failed to reach authentication service");
        } else {
          setStatus(AUTH_STATES.UNAUTHENTICATED);
        }
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const register = async (userData) => {
    setStatus(AUTH_STATES.LOADING);
    try {
      const data = await registerUser(userData);
      const registeredUser = data.user || data.data?.user || data.data || null;
      setUser(registeredUser);
      setStatus(registeredUser ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.UNAUTHENTICATED);
      return data;
    } catch (err) {
      setStatus(AUTH_STATES.UNAUTHENTICATED);
      throw err;
    }
  };

  const login = async (credentialsOrEmail, passwordArg) => {
    setStatus(AUTH_STATES.LOADING);
    try {
      let email = "";
      let password = "";

      if (typeof credentialsOrEmail === "object" && credentialsOrEmail !== null) {
        email = credentialsOrEmail.email || credentialsOrEmail.username || "";
        password = credentialsOrEmail.password || credentialsOrEmail.pass || "";
      } else {
        email = credentialsOrEmail || "";
        password = passwordArg || "";
      }

      email = String(email).trim();
      password = String(password);

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const response = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (response.data?.success) {
        const loggedUser = response.data.user;
        setUser(loggedUser);
        setStatus(AUTH_STATES.AUTHENTICATED);
        return { success: true, user: loggedUser };
      }

      throw new Error(response.data?.message || "Login failed");
    } catch (error) {
      setStatus(AUTH_STATES.UNAUTHENTICATED);
      const message = error.response?.data?.message || error.message || "Login failed. Please try again.";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setStatus(AUTH_STATES.UNAUTHENTICATED);
    }
  };

  const loading = status === AUTH_STATES.LOADING;
  const isAuthenticated = status === AUTH_STATES.AUTHENTICATED && Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        status,
        loading,
        isAuthenticated,
        authError,
        register,
        login,
        logout,
        checkAuth: loadUser,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
