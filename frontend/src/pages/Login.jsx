import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import logoImg from "../assets/logo.png";
import "../Style/Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleResponse = async (response) => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/google-auth`, {
          idToken: response.credential,
        });

        localStorage.setItem("token", res.data.token);
        toast.success("Login Successful 🚀");
        navigate("/dashboard");
      } catch (err) {
        toast.error(err.response?.data?.message || "Google Login Failed");
      }
    };

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          {
            theme: "outline",
            size: "large",
            width: 270, // fits 350px card minus 40px left/right paddings
          }
        );
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initializeGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      toast.success("Login Successful 🚀");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <img src={logoImg} alt="Connectify Logo" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
          <h1 className="login-title" style={{ margin: 0, fontSize: "2.4rem", fontFamily: "'Outfit', sans-serif", fontWeight: 800, background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Connectify</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.2px" }}>Share Stories. Build Connections.</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div id="google-signin-btn"></div>
      </div>

      <div className="register-box">
        <p className="register-text">
          Don't have an account?{" "}
          <Link to="/register" className="register-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;