import { useState } from "react";
import { z } from "zod";
import { useAuth } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import { IconEye, IconEyeOff } from "../components/common/Icons";

import emmyLogo from "../assets/emmy.png";

// ── Zod schema ──────────────────────────────────────────────
const signupSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  location: z.string().min(2, "Location is required"),
  number: z
    .string()
    .min(7, "Phone number is too short")
    .regex(/^[+\d\s\-().]+$/, "Enter a valid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

// ── Password rules with live check ─────────────────────────
const PASSWORD_RULES = [
  { id: "length",  label: "At least 8 characters",         test: (v) => v.length >= 8 },
  { id: "upper",   label: "One uppercase letter (A–Z)",     test: (v) => /[A-Z]/.test(v) },
  { id: "lower",   label: "One lowercase letter (a–z)",     test: (v) => /[a-z]/.test(v) },
  { id: "number",  label: "One number (0–9)",               test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "One special character (!@#$…)",  test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const EXAMPLES = ["Emsarj@2025", "Ghana#Boy1", "Style!99Gh"];

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    location: "",
    password: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) setFieldErrors((prev) => ({ ...prev, [id]: undefined }));
      // reset top-level auth error as user corrects input
      setIsError(false);
      setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});


    // Client-side Zod validation first
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setFieldErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])));
      return;
    }

    try {
      // start loading state
      setIsLoading(true);
      // clear previous error/message
      setIsError(false);
      setMessage("");

      await signUp(formData);
      navigate("/");
    } catch (err) {
      setIsError(true);
      setMessage(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }



  };

  // Live password rule checks
  const pw = formData.password;
  const ruleResults = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(pw) }));
  const allPassed = ruleResults.every((r) => r.passed);
  const passedCount = ruleResults.filter((r) => r.passed).length;

  const strengthMeta = (() => {
    if (!pw) return null;
    if (passedCount <= 2) return { label: "Weak",   color: "#dc2626", fill: 1 };
    if (passedCount === 3) return { label: "Fair",   color: "#f59e0b", fill: 2 };
    if (passedCount === 4) return { label: "Good",   color: "#16a34a", fill: 3 };
    return                        { label: "Strong", color: "#15803d", fill: 4 };
  })();

  const inputStyle = (fieldId) => ({
    ...styles.input,
    border: fieldErrors[fieldId] ? "1px solid #dc2626" : "1px solid #d1d5db",
  });

  const inputFocusStyle = (fieldId) => ({
    ...styles.inputFocus,
    border: fieldErrors[fieldId] ? "1px solid #dc2626" : "1px solid #111",
  });

  const showChecklist = passwordFocused || (pw.length > 0 && !allPassed);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src={emmyLogo} alt="EMSarj" style={styles.logo} />
        </div>

        <p style={styles.subtitle}>Create your account</p>

        {/* Auth-level error from useAuthStatus */}
        {isError && <div style={styles.errorBox}>{message}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Username */}
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>Username</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="your name"
              style={inputStyle("name")}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle("name"))}
              onBlur={(e) => Object.assign(e.target.style, inputStyle("name"))}
            />
            {fieldErrors.name && <span style={styles.fieldError}>{fieldErrors.name}</span>}
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={inputStyle("email")}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle("email"))}
              onBlur={(e) => Object.assign(e.target.style, inputStyle("email"))}
            />
            {fieldErrors.email && <span style={styles.fieldError}>{fieldErrors.email}</span>}
          </div>

          {/* Location */}
          <div style={styles.field}>
            <label htmlFor="location" style={styles.label}>Location</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Accra, Ghana"
              style={inputStyle("location")}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle("location"))}
              onBlur={(e) => Object.assign(e.target.style, inputStyle("location"))}
            />
            {fieldErrors.location && <span style={styles.fieldError}>{fieldErrors.location}</span>}
          </div>

          {/* Phone Number */}
          <div style={styles.field}>
            <label htmlFor="number" style={styles.label}>Phone Number</label>
            <input
              type="tel"
              id="number"
              value={formData.number}
              onChange={handleChange}
              required
              placeholder="+233 00 000 0000"
              style={inputStyle("number")}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle("number"))}
              onBlur={(e) => Object.assign(e.target.style, inputStyle("number"))}
            />
            {fieldErrors.number && <span style={styles.fieldError}>{fieldErrors.number}</span>}
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <div style={styles.passwordWrap}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                style={{ ...inputStyle("password"), paddingRight: "42px" }}
                onFocus={(e) => {
                  setPasswordFocused(true);
                  Object.assign(e.target.style, { ...inputFocusStyle("password"), paddingRight: "42px" });
                }}
                onBlur={(e) => {
                  setPasswordFocused(false);
                  Object.assign(e.target.style, { ...inputStyle("password"), paddingRight: "42px" });
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {pw && strengthMeta && (
              <div style={styles.strengthWrap}>
                <div style={styles.strengthBar}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        ...styles.strengthSegment,
                        backgroundColor: i <= strengthMeta.fill ? strengthMeta.color : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                <span style={{ ...styles.strengthLabel, color: strengthMeta.color }}>
                  {strengthMeta.label}
                </span>
              </div>
            )}

            {/* Live checklist */}
            {showChecklist && (
              <div style={styles.checklist}>
                <p style={styles.checklistTitle}>Your password must include:</p>
                {ruleResults.map((rule) => (
                  <div key={rule.id} style={styles.checkRow}>
                    <span style={{ ...styles.checkIcon, color: rule.passed ? "#16a34a" : "#aaa" }}>
                      {rule.passed ? "✓" : "○"}
                    </span>
                    <span style={{
                      ...styles.checkLabel,
                      color: rule.passed ? "#16a34a" : "#555",
                      textDecoration: rule.passed ? "line-through" : "none",
                    }}>
                      {rule.label}
                    </span>
                  </div>
                ))}
                <div style={styles.exampleWrap}>
                  <span style={styles.exampleTitle}>e.g. </span>
                  {EXAMPLES.map((ex, i) => (
                    <span key={ex}>
                      <code style={styles.exampleCode}>{ex}</code>
                      {i < EXAMPLES.length - 1 && <span style={styles.exampleSep}> · </span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {pw && allPassed && (
              <p style={styles.successMsg}>✓ Password looks great!</p>
            )}

            {fieldErrors.password && (
              <span style={styles.fieldError}>{fieldErrors.password}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={isLoading ? { ...styles.submitBtn, opacity: 0.6 } : styles.submitBtn}
          >
            {isLoading ? "Registering…" : "Register"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/signin" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "0 16px",
    fontFamily: "'Georgia', serif",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    padding: "36px 32px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: "8px" },
  logo: { height: "48px", width: "auto", objectFit: "contain" },
  subtitle: {
    textAlign: "center",
    fontSize: "13px",
    color: "#888",
    marginBottom: "24px",
    letterSpacing: "0.02em",
  },
  errorBox: {
    backgroundColor: "#fff0f0",
    border: "1px solid #fca5a5",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#b91c1c",
    marginBottom: "16px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#111",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#fafafa",
    color: "#111",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  inputFocus: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #111",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#fff",
    color: "#111",
    boxSizing: "border-box",
  },
  passwordWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    color: "#888",
    display: "flex",
    alignItems: "center",
  },
  strengthWrap: { display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" },
  strengthBar: { display: "flex", gap: "3px", flex: 1 },
  strengthSegment: {
    flex: 1,
    height: "3px",
    borderRadius: "2px",
    transition: "background-color 0.25s",
  },
  strengthLabel: { fontSize: "11px", fontWeight: "600", minWidth: "42px", textAlign: "right" },
  checklist: {
    marginTop: "8px",
    backgroundColor: "#f9f9f9",
    border: "1px solid #e5e7eb",
    borderRadius: "7px",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  checklistTitle: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#555",
    margin: "0 0 5px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  checkRow: { display: "flex", alignItems: "center", gap: "7px" },
  checkIcon: { fontSize: "12px", fontWeight: "700", width: "14px", textAlign: "center", transition: "color 0.2s" },
  checkLabel: { fontSize: "12px", transition: "color 0.2s, text-decoration 0.2s" },
  exampleWrap: {
    marginTop: "8px",
    paddingTop: "7px",
    borderTop: "1px dashed #e0e0e0",
    fontSize: "11px",
    color: "#888",
    lineHeight: "1.6",
  },
  exampleTitle: { fontWeight: "600", color: "#aaa" },
  exampleCode: {
    backgroundColor: "#efefef",
    borderRadius: "3px",
    padding: "1px 5px",
    fontSize: "11px",
    fontFamily: "monospace",
    color: "#333",
    letterSpacing: "0.03em",
  },
  exampleSep: { color: "#ccc" },
  successMsg: { fontSize: "12px", color: "#16a34a", fontWeight: "600", margin: "4px 0 0" },
  fieldError: { fontSize: "11px", color: "#dc2626", marginTop: "2px" },
  submitBtn: {
    marginTop: "4px",
    width: "100%",
    padding: "11px",
    backgroundColor: "#111",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    letterSpacing: "0.04em",
    transition: "background-color 0.15s",
  },
  footer: { textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#888" },
  link: { color: "#111", fontWeight: "600", textDecoration: "underline", textUnderlineOffset: "2px" },
};