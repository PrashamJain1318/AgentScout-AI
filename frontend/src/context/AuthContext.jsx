import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";
import { getCurrentUser, logoutUser, registerUser } from "../services/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data.user || data.data || data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const register = async (userData) => {
    const data = await registerUser(userData);
    const registeredUser = data.user || data.data?.user || data.data || null;
    setUser(registeredUser);
    return data;
  };

  const login = async (credentialsOrEmail, passwordArg) => {
    try {
      let email = "";
      let password = "";

      if (
        typeof credentialsOrEmail === "object" &&
        credentialsOrEmail !== null
      ) {
        email =
          credentialsOrEmail.email ||
          credentialsOrEmail.username ||
          "";

        password =
          credentialsOrEmail.password ||
          credentialsOrEmail.pass ||
          "";
      } else {
        email = credentialsOrEmail || "";
        password = passwordArg || "";
      }

      email = String(email).trim();
      password = String(password);

      console.log("LOGIN DATA:", {
        email,
        passwordLength: password.length,
      });

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("LOGIN SUCCESS:", response.data);

      if (response.data?.success) {
        setUser(response.data.user);

        return {
          success: true,
          user: response.data.user,
        };
      }

      throw new Error(
        response.data?.message || "Login failed"
      );
    } catch (error) {
      console.error("LOGIN FAILED:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";

      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
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
