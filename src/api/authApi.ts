import apiClient from "./apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

// Register response structure (may vary by backend)
export interface RegisterResponse {
  message?: string;
  token?: string;
  user?: {
    email?: string;
    fullName?: string;
    id?: number | string;
  };
  // some backends wrap data
  data?: {
    token?: string;
    user?: {
      email?: string;
      fullName?: string;
      id?: number | string;
    };
  };
}

// Login response structure (matches backend format)
export interface LoginResponse {
  email?: string;
  fullName?: string;
  isLoggined?: string; // Backend returns string "True"/"False"
  isLoggedIn?: boolean; // Normalized boolean (for compatibility)
  message?: string;
  statusCode?: number;
  token?: string;
  user?: {
    id?: number | string;
    email?: string;
    fullName?: string;
  };
  userId?: number | string;
  user_id?: number | string;
  data?: {
    token?: string;
    user?: {
      id?: number | string;
      email?: string;
      fullName?: string;
    };
    userId?: number | string;
    user_id?: number | string;
    email?: string;
    fullName?: string;
  };
}

// Normalized user type for internal use
export interface AuthUser {
  id: number | string;
  email: string;
  fullName: string;
}

const extractUser = (payload: LoginResponse | RegisterResponse, fallbackEmail: string, fallbackName: string): AuthUser => {
  const rootUser =
    payload.user ||
    (payload as any)?.data?.user ||
    (payload as any)?.data?.data?.user ||
    (payload as any)?.data?.user_data;

  const email =
    rootUser?.email ||
    (payload as any)?.data?.email ||
    (payload as any)?.email ||
    fallbackEmail;

  const fullName =
    rootUser?.fullName ||
    (payload as any)?.fullName ||
    (payload as any)?.data?.fullName ||
    fallbackName;

  const rawId =
    rootUser?.id ||
    (payload as any)?.userId ||
    (payload as any)?.user_id ||
    (payload as any)?.data?.userId ||
    (payload as any)?.data?.user_id ||
    email;

  return {
    id: rawId ?? email,
    email: email ?? fallbackEmail,
    fullName: fullName ?? fallbackName,
  };
};

const extractToken = (payload: LoginResponse | RegisterResponse): string | undefined => {
  return (
    payload.token ||
    (payload as any)?.data?.token ||
    (payload as any)?.data?.data?.token
  );
};

/**
 * Adapter function to normalize backend login response.
 * Handles isLoggined (string "True"/"False") -> isLoggedIn (boolean)
 */
const normalizeLoginResponse = (response: LoginResponse): {
  isLoggedIn: boolean;
  token?: string;
  user: AuthUser;
} => {
  // Normalize isLoggined (string "True"/"False") to boolean isLoggedIn
  const isLogginedStr = response.isLoggined?.toLowerCase();
  const isLoggedIn = isLogginedStr === "true" || response.isLoggedIn === true;

  const token = extractToken(response);
  const user = extractUser(response, response.email || "", response.fullName || "User");

  return {
    isLoggedIn,
    token,
    user,
  };
};

export const loginUser = async (
  data: LoginPayload
): Promise<{ token: string; user: AuthUser }> => {
  const res = await apiClient.post<LoginResponse>("/auth/login", data);
  const normalized = normalizeLoginResponse(res.data);

  // Validate login was successful using isLoggedIn
  if (!normalized.isLoggedIn) {
    throw new Error(
      res.data.message || "Login failed. Please check your credentials."
    );
  }

  // Token might be in response or handled via cookies (withCredentials: true)
  // If no token in response but login is successful, use email as fallback identifier
  // The actual auth may be cookie-based, but we need something for localStorage
  const token = normalized.token || `auth-${normalized.user.email}-${Date.now()}`;

  return {
    token,
    user: normalized.user,
  };
};

export const registerUser = async (
  data: RegisterPayload
): Promise<{ token?: string; user: AuthUser }> => {
  const res = await apiClient.post<RegisterResponse>("/auth/register", data);
  const token = extractToken(res.data);
  const user = extractUser(res.data, data.email, data.fullName);

  return {
    token,
    user,
  };
};
