import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import { IconEye, IconEyeOff } from "../components/common/Icons";
import emmyLogo from "../assets/emmy.png";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    location: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(formData);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={styles.page}>
        <div style={styles.card}>
          {/* Logo */}
          <div style={styles.logoWrap}>
            <img src={emmyLogo} alt="EMSarj" style={styles.logo} />
          </div>

          <p style={styles.subtitle}>Create your account</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Username */}
            <div style={styles.field}>
              <label htmlFor="name" style={styles.label}>
                Username
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="your name"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>

            {/* Email */}
            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="you@example.com"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>

            {/* Location */}
            <div style={styles.field}>
              <label htmlFor="location" style={styles.label}>
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Accra, Ghana"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>

            {/* Number */}
            <div style={styles.field}>
              <label htmlFor="number" style={styles.label}>
                Phone Number
              </label>
              <input
                type="tel"
                id="number"
                value={formData.number}
                onChange={handleChange}
                required
                placeholder="+233 00 000 0000"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>

            {/* Password */}
            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <div style={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: "42px" }}
                  onFocus={(e) =>
                    Object.assign(e.target.style, {
                      ...styles.inputFocus,
                      paddingRight: "42px",
                    })
                  }
                  onBlur={(e) =>
                    Object.assign(e.target.style, {
                      ...styles.input,
                      paddingRight: "42px",
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.submitBtn, opacity: 0.6 } : styles.submitBtn}
            >
              {loading ? "Registering…" : "Register"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/signin" style={styles.link}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "96px 16px 16px",
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
  logoWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "8px",
  },
  logo: {
    height: "48px",
    width: "auto",
    objectFit: "contain",
  },
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
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
  passwordWrap: {
    position: "relative",
  },
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
  footer: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#888",
  },
  link: {
    color: "#111",
    fontWeight: "600",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
};

