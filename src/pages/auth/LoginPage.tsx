// import React from 'react';
import type { FormEvent } from "react";
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import loginIllustration from "../../assets/illu2.png";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      await login({ email, password });
      // on success, go to dashboard (or any protected page)
      navigate("/dashboard");
    } catch (err) {
      // later: replace with proper error message from backend
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Pick up your last speech exercise or start a new guided session."
      illustration={loginIllustration}
      illustrationWidth={180}
    >
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: 13,
              color: "#374151",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@mua.org"
            style={{
              width: "80%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${
                errors.email ? "#f97373" : "#d1d5db"
              }`,
              fontSize: 14,
              outline: "none",
            }}
          />
          {errors.email && (
            <p style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: 13,
              color: "#374151",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={{
              width: "80%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${
                errors.password ? "#f97373" : "#d1d5db"
              }`,
              fontSize: 14,
              outline: "none",
            }}
          />
          {errors.password && (
            <p style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "87%",
            padding: "9px 10px",
            borderRadius: 999,
            border: "none",
            backgroundColor: loading ? "#9ca3af" : "#8878c3",
            color: "#ffffff",
            fontSize: 15,
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Signing you in..." : "Log in"}
        </button>
      </form>

      <p
        style={{
          marginTop: 14,
          fontSize: 13,
          color: "#6b7280",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link to="/register" style={{ color: "#8878c3" }}>
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
