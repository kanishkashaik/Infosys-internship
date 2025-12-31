import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "../api/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeParseUser = (): AuthUser | null => {
  try {
    const raw = safeGetItem("authUser");
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const persistSession = (
  user: AuthUser,
  token: string,
  setUser: (u: AuthUser) => void,
  setToken: (t: string) => void
) => {
  const normalizedUser = { ...user, id: String(user.id) };
  setUser(normalizedUser);
  setToken(token);
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(normalizedUser));
  localStorage.setItem("user_id", String(normalizedUser.id));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => safeParseUser());
  const [token, setToken] = useState<string | null>(() =>
    safeGetItem("authToken")
  );
  const [loading, setLoading] = useState(false);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const { token: nextToken, user: nextUser } = await loginUser(payload);
      persistSession(nextUser, nextToken, setUser, setToken);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const { token: registerToken, user: registerUserResult } =
        await registerUser(payload);

      if (registerToken) {
        persistSession(registerUserResult, registerToken, setUser, setToken);
        return;
      }

      // If backend doesn't return a token on register, log the user in using their credentials.
      const { token: loginToken, user: loginUserResult } = await loginUser({
        email: payload.email,
        password: payload.password,
      });
      persistSession(loginUserResult, loginToken, setUser, setToken);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("user_id");
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
