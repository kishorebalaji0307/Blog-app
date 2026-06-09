import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import "../Style/Register.css";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleResponse = async (response) => {
      try {
        const res = await axios.post("http://localhost:5000/api/users/google-auth", {
          idToken: response.credential,
        });

        localStorage.setItem("token", res.data.token);
        alert("Registration Successful 🚀");
        navigate("/dashboard");
      } catch (err) {
        alert(err.response?.data?.message || "Google Registration Failed");
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
      await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });

      alert("Registration Successful 🚀");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
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
    </div>
  );
};

export default Register;