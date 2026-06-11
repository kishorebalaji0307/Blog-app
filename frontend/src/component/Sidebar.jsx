import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiPlusSquare, FiUser, FiLogOut, FiSun, FiMoon, FiBell, FiSearch } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import logoImg from "../assets/logo.png";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Debounced User Search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/search?q=${searchQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error("Search failed:", err);
      }
    };

    const delayDebounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click Outside Search Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDesktop = !desktopSearchRef.current || !desktopSearchRef.current.contains(event.target);
      const clickedOutsideMobile = !mobileSearchRef.current || !mobileSearchRef.current.contains(event.target);
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const handleMarkAsRead = async (notificationId, blogId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // update state locally
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setShowNotifications(false);
      if (blogId) {
        navigate(`/blog/${blogId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read! 🚀");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      toast.success("Logged out successfully 🚀");
      navigate("/");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Desktop Top Header / Search Bar */}
      <header className="desktop-header">
        <div className="search-container" ref={desktopSearchRef}>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                &times;
              </button>
            )}
          </div>

          {showSearchDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((u) => (
                <Link
                  key={u._id}
                  to={`/profile/${u._id}`}
                  className="search-result-item"
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setSearchQuery("");
                  }}
                >
                  <div className="result-avatar">
                    {u.profileImage ? (
                      <img src={u.profileImage} alt={u.name} />
                    ) : (
                      u.name ? u.name[0].toUpperCase() : "U"
                    )}
                  </div>
                  <div className="result-info">
                    <span className="result-name">{u.name}</span>
                    <span className="result-email">{u.email}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {showSearchDropdown && searchQuery.trim() && searchResults.length === 0 && (
            <div className="search-dropdown no-results">
              No users found 🔍
            </div>
          )}
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="mobile-header">
        <Link to="/dashboard" className="app-logo" style={{ textDecoration: "none", marginRight: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
          <img src={logoImg} alt="logo" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
          <span style={{ fontSize: "1.25rem", fontWeight: 800 }}>Connectify</span>
        </Link>
        
        <div className="search-container mobile-search" ref={mobileSearchRef}>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                &times;
              </button>
            )}
          </div>

          {showSearchDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((u) => (
                <Link
                  key={u._id}
                  to={`/profile/${u._id}`}
                  className="search-result-item"
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setSearchQuery("");
                  }}
                >
                  <div className="result-avatar">
                    {u.profileImage ? (
                      <img src={u.profileImage} alt={u.name} />
                    ) : (
                      u.name ? u.name[0].toUpperCase() : "U"
                    )}
                  </div>
                  <div className="result-info">
                    <span className="result-name">{u.name}</span>
                    <span className="result-email">{u.email}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {showSearchDropdown && searchQuery.trim() && searchResults.length === 0 && (
            <div className="search-dropdown no-results">
              No users found 🔍
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Mobile Notification bell */}
          <div style={{ position: "relative" }} ref={notificationRef}>
            <button 
              className="mobile-nav-item" 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ padding: 0 }}
            >
              <FiBell size={24} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <p className="no-notifications">No notifications yet 🔔</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`notification-item ${notif.read ? "read" : "unread"}`}
                        onClick={() => handleMarkAsRead(notif._id, notif.blog?._id)}
                      >
                        <Link
                          to={`/profile/${notif.sender?._id}`}
                          className="notification-avatar"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notif.sender?.profileImage ? (
                            <img src={notif.sender.profileImage} alt={notif.sender.name} className="avatar-img" />
                          ) : (
                            notif.sender?.name ? notif.sender.name[0].toUpperCase() : "U"
                          )}
                        </Link>
                        <div className="notification-item-content">
                          <p>
                            <Link
                              to={`/profile/${notif.sender?._id}`}
                              style={{ textDecoration: "none", color: "inherit" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <b>{notif.sender?.name || "Someone"}</b>
                            </Link>{" "}
                            tagged you in post: "<i>{notif.blog?.title}</i>"
                          </p>
                          <span className="notification-time">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="mobile-nav-item" onClick={toggleTheme} style={{ padding: 0 }}>
            {theme === "light" ? <FiMoon size={24} /> : <FiSun size={24} />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "16px", marginBottom: "40px" }}>
          <img src={logoImg} alt="logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          <span style={{ fontSize: "1.7rem", fontWeight: 800, fontFamily: "'Outfit', sans-serif", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Connectify</span>
        </div>
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

          {/* Desktop Notifications Bell */}
          <div className="nav-item-container" ref={notificationRef}>
            <button
              className={`nav-item-btn ${showNotifications ? "active" : ""}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <div className="icon-badge-wrapper">
                <FiBell size={22} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </div>
              <span>Notifications</span>
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <p className="no-notifications">No notifications yet 🔔</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`notification-item ${notif.read ? "read" : "unread"}`}
                        onClick={() => handleMarkAsRead(notif._id, notif.blog?._id)}
                      >
                        <Link
                          to={`/profile/${notif.sender?._id}`}
                          className="notification-avatar"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notif.sender?.profileImage ? (
                            <img src={notif.sender.profileImage} alt={notif.sender.name} className="avatar-img" />
                          ) : (
                            notif.sender?.name ? notif.sender.name[0].toUpperCase() : "U"
                          )}
                        </Link>
                        <div className="notification-item-content">
                          <p>
                            <Link
                              to={`/profile/${notif.sender?._id}`}
                              style={{ textDecoration: "none", color: "inherit" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <b>{notif.sender?.name || "Someone"}</b>
                            </Link>{" "}
                            tagged you in post: "<i>{notif.blog?.title}</i>"
                          </p>
                          <span className="notification-time">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Theme Toggle Button */}
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === "light" ? <FiMoon size={22} /> : <FiSun size={22} />}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>

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
