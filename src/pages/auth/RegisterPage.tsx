// import React from 'react';
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import registerIllustration from "../../assets/illu3.png";
import { useAuth } from "../../context/AuthContext";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";

    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      // on success → go to dashboard (or any page you want)
      navigate("/dashboard");
    } catch (err) {
      // later: show proper error from backend
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create your learning account"
      subtitle="Set up a profile so we can personalise speech exercises to your needs."
      illustration={registerIllustration}
      illustrationWidth={460}
    >
      <form onSubmit={handleSubmit}>
        {/* Full name */}
        <div style={{ marginBottom: 10 }}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: 13,
              color: "#374151",
            }}
          >
            Full name
          </label>
          <input
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="e.g. Steve Harrington"
            style={{
              width: "70%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${
                errors.fullName ? "#f97373" : "#d1d5db"
              }`,
              fontSize: 14,
              outline: "none",
            }}
          />
          {errors.fullName && (
            <p style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 10 }}>
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
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="you@school.org"
            style={{
              width: "70%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${errors.email ? "#f97373" : "#d1d5db"}`,
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
        <div style={{ marginBottom: 10 }}>
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
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="At least 8 characters"
            style={{
              width: "70%",
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

        {/* Confirm password */}
        <div style={{ marginBottom: 10 }}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: 13,
              color: "#374151",
            }}
          >
            Confirm password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              handleChange("confirmPassword", e.target.value)
            }
            placeholder="Re-enter your password"
            style={{
              width: "70%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${
                errors.confirmPassword ? "#f97373" : "#d1d5db"
              }`,
              fontSize: 14,
              outline: "none",
            }}
          />
          {errors.confirmPassword && (
            <p style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Info text */}
        <p
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginBottom: 10,
            marginRight: "20%",
          }}
        >
          By creating an account, you agree to receive practice reminders and
          progress summaries related to your speech sessions.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "75%",
            padding: "9px 10px",
            borderRadius: 999,
            border: "none",
            backgroundColor: loading ? "#9ca3af" : "#8878c3",
            color: "#ffffff",
            fontSize: 15,
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Creating your account..." : "Create account"}
        </button>
      </form>

      <p
        style={{
          marginTop: 14,
          fontSize: 13,
          color: "#6b7280",
        }}
      >
        Already registered?{" "}
        <Link to="/login" style={{ color: "#8878c3" }}>
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
