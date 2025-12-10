import{
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [loading, setLoading] = useState(false);

  const fakeAuth = (payload: { fullName?: string; email: string }) => {
    // dummy token + user for now
    const fakeToken = "dummy-token";
    const fakeUser: User = {
      id: "1",
      fullName: payload.fullName ?? "Test User",
      email: payload.email,
    };

    setUser(fakeUser);
    setToken(fakeToken);
    localStorage.setItem("authToken", fakeToken);
  };

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500)); // fake delay
      fakeAuth({ email: payload.email });
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 700)); // fake delay
      fakeAuth({ email: payload.email, fullName: payload.fullName });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
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
