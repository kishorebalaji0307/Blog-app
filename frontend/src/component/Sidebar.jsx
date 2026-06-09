import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiPlusSquare, FiUser, FiLogOut } from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <h2 className="app-logo">Bloggram</h2>
      </header>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <h2 className="app-logo">Bloggram</h2>
        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
          >
            <FiHome size={22} />
            <span>Home</span>
          </Link>
          <Link
            to="/create"
            className={`nav-item ${location.pathname === "/create" ? "active" : ""}`}
          >
            <FiPlusSquare size={22} />
            <span>Create</span>
          </Link>
          <Link
            to="/profile"
            className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
          >
            <FiUser size={22} />
            <span>Profile</span>
          </Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut size={22} />
          <span>Log Out</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <Link
          to="/dashboard"
          className={`mobile-nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
        >
          <FiHome size={24} />
        </Link>
        <Link
          to="/create"
          className={`mobile-nav-item ${location.pathname === "/create" ? "active" : ""}`}
        >
          <FiPlusSquare size={24} />
        </Link>
        <Link
          to="/profile"
          className={`mobile-nav-item ${location.pathname === "/profile" ? "active" : ""}`}
        >
          <FiUser size={24} />
        </Link>
        <button className="mobile-nav-item logout-icon-btn" onClick={handleLogout}>
          <FiLogOut size={24} />
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
