// import React from 'react';
import type { ReactNode } from 'react';

import Particles from "../Particles";
import "./AuthLayout.css";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Optional per-page illustration (image URL) shown above the form */
  illustration?: string;
  /** Optional preferred illustration width in pixels. If omitted, CSS defaults apply. */
  illustrationWidth?: number;
}

const AuthLayout = ({ title, subtitle, children, illustration, illustrationWidth }: AuthLayoutProps) => {
  return (
    <div className="auth-root">
      {/* Particles background */}
      <div className="auth-particles-layer">
        <Particles
          particleColors={["#60a5fa", "#fb923c", "#34d399", "#a855f7"]}
          particleCount={180}
          particleSpread={10}
          speed={0.06}
          particleBaseSize={70}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* Foreground content */}
      <div className="auth-content">
        <div className="auth-card">
          {/* Left side: product name + short copy */}
          <div className="auth-left">
            <div className="auth-product-name">SPEECH THERAPY</div>

            <h1 className="auth-title">{title}</h1>

            {subtitle && <p className="auth-subtitle">{subtitle}</p>}

            <ul className="auth-points">
              
            </ul>

            {/* Illustration placed at bottom-left of the left column */}
            {illustration && (
              <div className="auth-illustration-left">
                <img
                  src={illustration}
                  alt="illustration"
                  style={illustrationWidth ? { width: `${illustrationWidth}px` } : undefined}
                />
              </div>
            )}
          </div>

          {/* Right side: the actual typing / login area */}
          <div className="auth-right">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
