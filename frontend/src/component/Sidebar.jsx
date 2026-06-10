import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiPlusSquare, FiUser, FiLogOut, FiSun, FiMoon, FiBell } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

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
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <h2 className="app-logo">Bloggram</h2>
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
                        <div className="notification-avatar">
                          {notif.sender?.profileImage ? (
                            <img src={notif.sender.profileImage} alt={notif.sender.name} className="avatar-img" />
                          ) : (
                            notif.sender?.name ? notif.sender.name[0].toUpperCase() : "U"
                          )}
                        </div>
                        <div className="notification-item-content">
                          <p>
                            <b>{notif.sender?.name || "Someone"}</b> tagged you in post: "<i>{notif.blog?.title}</i>"
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
                        <div className="notification-avatar">
                          {notif.sender?.profileImage ? (
                            <img src={notif.sender.profileImage} alt={notif.sender.name} className="avatar-img" />
                          ) : (
                            notif.sender?.name ? notif.sender.name[0].toUpperCase() : "U"
                          )}
                        </div>
                        <div className="notification-item-content">
                          <p>
                            <b>{notif.sender?.name || "Someone"}</b> tagged you in post: "<i>{notif.blog?.title}</i>"
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
