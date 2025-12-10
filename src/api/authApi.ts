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

// Register response structure
export interface RegisterResponse {
  message: string;
  user: {
    email: string;
    fullName: string;
    id: number;
  };
}

// Login response structure
export interface LoginResponse {
  email: string;
  fullName: string;
  isLoggedIn: boolean;
  message: string;
  token: string;
}

// Normalized user type for internal use
export interface AuthUser {
  id: number | string;
  email: string;
  fullName: string;
}

export const loginUser = async (data: LoginPayload): Promise<{ token: string; user: AuthUser }> => {
  const res = await apiClient.post<LoginResponse>("/auth/login", data);
  const { token, email, fullName } = res.data;
  return {
    token,
    user: {
      id: email, // backend doesn't return id in login response, use email as fallback
      email,
      fullName,
    },
  };
};

export const registerUser = async (
  data: RegisterPayload
): Promise<{ token?: string; user: AuthUser }> => {
  const res = await apiClient.post<RegisterResponse>("/auth/register", data);
  const { user } = res.data;
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    // Register response doesn't include token; caller should handle separate login
  };
};
