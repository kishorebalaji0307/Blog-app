import Sidebar from "../component/Sidebar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../Style/Profile.css";

export default function Profile() {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const openEditModal = () => {
    setEditName(user?.name || "");
    setEditBio(user?.bio || "");
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        { name: editName, bio: editBio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setIsEditModalOpen(false);
      alert("Profile updated successfully 🚀");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

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
                <button className="edit-profile-btn" onClick={openEditModal}>
                  Edit Profile
                </button>
              </div>

              <div className="profile-stats">
                <span><b>{userBlogs.length}</b> posts</span>
                <span><b>158</b> followers</span>
                <span><b>210</b> following</span>
              </div>

              <div className="profile-bio">
                <span className="profile-real-name">{user?.name}</span>
                <p>{user?.bio || "Welcome to my Bloggram profile! Exploring the virtual space one post at a time. 🚀"}</p>
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="edit-profile-modal-overlay">
          <div className="edit-profile-modal">
            <h3>Edit Profile</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  maxLength={150}
                  rows={4}
                />
                <span className="char-count">{editBio.length}/150</span>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
