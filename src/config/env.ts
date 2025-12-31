const sanitizeUrl = (url: string | undefined) => {
  if (!url) return "";
  return url.replace(/\/+$/, "");
};

// Get environment variables - required for API calls
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  if (!value && !fallback) {
    console.warn(`Warning: ${key} is not set. Please configure it in your .env file.`);
  }
  return value || fallback || "";
};

const rawApiBase = sanitizeUrl(
  getEnvVar("VITE_API_BASE_URL", import.meta.env.DEV ? "http://127.0.0.1:5000" : undefined)
);

// Separate base for assessment/audio uploads in case it differs from the API.
const rawAssessmentBase = sanitizeUrl(
  getEnvVar("VITE_ASSESSMENT_BASE_URL", rawApiBase || (import.meta.env.DEV ? "http://127.0.0.1:5000" : undefined))
);

export const API_BASE_URL = rawApiBase;
export const ASSESSMENT_BASE_URL = rawAssessmentBase;

export const withApiBase = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const withAssessmentBase = (path: string) =>
  `${ASSESSMENT_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

