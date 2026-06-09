import Sidebar from "../component/Sidebar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../Style/Profile.css";

export default function Profile() {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`);
        setBlogs(res.data.blogs || res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfileData();
    fetchBlogs();
  }, []);

  // Filter blogs created by this user
  const userBlogs = blogs.filter(blog => blog.author?.email === user?.email);

  return (
    <div className="app-container">
      <Sidebar />

      <main className="profile-content">
        <div className="profile-container">
          {/* Profile Header */}
          <header className="profile-header">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
            </div>

            <section className="profile-info">
              <div className="profile-username-row">
                <h2>{user?.name || "User"}</h2>
                <button className="edit-profile-btn">Edit Profile</button>
              </div>

              <div className="profile-stats">
                <span><b>{userBlogs.length}</b> posts</span>
                <span><b>158</b> followers</span>
                <span><b>210</b> following</span>
              </div>

              <div className="profile-bio">
                <span className="profile-real-name">{user?.name}</span>
                <p>Welcome to my Bloggram profile! Exploring the virtual space one post at a time. 🚀</p>
                <span className="profile-email">{user?.email}</span>
              </div>
            </section>
          </header>

          {/* Profile Posts Grid */}
          <div className="profile-posts-grid">
            {userBlogs.length === 0 ? (
              <div className="no-posts-yet">
                <h3>No Posts Yet</h3>
              </div>
            ) : (
              userBlogs.map((blog) => (
                <Link to={`/edit-blog/${blog._id}`} className="grid-post-item" key={blog._id}>
                  {blog.image ? (
                    <img src={blog.image} alt="post" />
                  ) : (
                    <div className="no-image-placeholder">
                      <span>{blog.title}</span>
                    </div>
                  )}
                  <div className="grid-post-overlay">
                    <span>{blog.title}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
