import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../Style/Register.css";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [showMockGoogle, setShowMockGoogle] = useState(false);
  const [mockName, setMockName] = useState("");
  const [mockEmail, setMockEmail] = useState("");

  const navigate = useNavigate();

  const handleMockGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!mockEmail.trim()) return;
    try {
      const mockToken = `mock-google-token-email-${encodeURIComponent(mockEmail)}-${encodeURIComponent(mockName)}`;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/google-auth`, {
        idToken: mockToken,
      });

      localStorage.setItem("token", res.data.token);
      toast.success("Registration Successful 🚀");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Google Registration Failed");
    }
  };

  useEffect(() => {
    const handleGoogleResponse = async (response) => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/google-auth`, {
          idToken: response.credential,
        });

        localStorage.setItem("token", res.data.token);
        toast.success("Registration Successful 🚀");
        navigate("/dashboard");
      } catch (err) {
        toast.error(err.response?.data?.message || "Google Registration Failed");
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
            width: 270,
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

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, {
        name,
        email,
        password,
      });

      toast.success("Registration Successful 🚀");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Bloggram</h1>

        <p className="register-subtitle">
          Sign up to see photos and posts from your virtual friends.
        </p>

        <div id="google-signin-btn"></div>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <button
            type="button"
            className="mock-google-trigger-link"
            onClick={() => setShowMockGoogle(true)}
          >
            Google Sign-in Issue? Use Local Mock Login
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <form className="register-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            className="register-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="register-input"
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

          <button
            type="submit"
            className="register-btn"
          >
            Sign Up
          </button>
        </form>
      </div>

      <div className="login-box">
        <p className="login-text">
          Already have an account?{" "}
          <Link to="/" className="login-link">
            Log in
          </Link>
        </p>
      </div>

      {showMockGoogle && (
        <div className="mock-google-modal-overlay">
          <div className="mock-google-modal">
            <h3>Simulated Google Sign In</h3>
            <p>Use this option to bypass Google OAuth restrictions during local testing.</p>
            <form onSubmit={handleMockGoogleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowMockGoogle(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="simulate-btn">
                  Simulate Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;