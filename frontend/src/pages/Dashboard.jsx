import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../component/Sidebar";
import { FiHeart, FiMessageCircle, FiSend, FiBookmark } from "react-icons/fi";
import toast from "react-hot-toast";
import "../Style/Dashboard.css";

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`);
        setBlogs(res.data.blogs || res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user);
        }
      } catch (err) {
        console.log("Failed to load user profile:", err);
      }
    };

    fetchBlogs();
    fetchUser();
  }, []);

  const handleLike = async (blogId) => {
    if (!user) {
      toast.error("Please log in to like posts!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs/${blogId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the blog's likes array locally
      setBlogs((prev) =>
        prev.map((blog) =>
          blog._id === blogId ? { ...blog, likes: res.data.likes } : blog
        )
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleSave = async (blogId) => {
    if (!user) {
      toast.error("Please log in to save posts!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs/${blogId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update user savedBlogs locally
      setUser((prev) => ({
        ...prev,
        savedBlogs: res.data.savedBlogs,
      }));
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <div className="feed-container">
          {blogs.length === 0 ? (
            <p className="no-blogs">No posts found 🚀</p>
          ) : (
            blogs.map((blog) => {
              const isLiked = user && blog.likes?.includes(user._id);
              const isSaved = user && user.savedBlogs?.some(
                (saved) => (typeof saved === "object" ? saved._id : saved) === blog._id
              );

              return (
                <article className="instagram-post" key={blog._id}>
                  {/* Post Header */}
                  <header className="post-header">
                    <div className="post-user-info">
                      <div className="user-avatar">
                        {blog.author?.name ? blog.author.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <span className="post-username">
                          {blog.author?.name || "anonymous"}
                        </span>
                        <span className="post-location">Virtual Portal</span>
                      </div>
                    </div>
                    <button className="post-options-btn">•••</button>
                  </header>

                  {/* Post Image */}
                  {blog.image && (
                    <div className="post-image-container">
                      <img
                        src={blog.image}
                        alt="post content"
                        className="post-image"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="post-actions">
                    <div className="left-actions">
                      <button
                        onClick={() => handleLike(blog._id)}
                        className={`action-btn-heart ${isLiked ? "liked" : ""}`}
                      >
                        <FiHeart size={24} />
                      </button>
                      <Link to={`/blog/${blog._id}`} className="action-btn">
                        <FiMessageCircle size={24} />
                      </Link>
                      <button className="action-btn"><FiSend size={24} /></button>
                    </div>
                    <button
                      onClick={() => handleSave(blog._id)}
                      className={`action-btn bookmark ${isSaved ? "bookmarked" : ""}`}
                    >
                      <FiBookmark size={24} />
                    </button>
                  </div>

                  {/* Post Content / Caption */}
                  <div className="post-content">
                    <div className="post-likes">
                      <span>
                        {blog.likes?.length === 0
                          ? "Be the first to like this"
                          : blog.likes?.length === 1
                          ? "1 like"
                          : `${blog.likes?.length} likes`}
                      </span>
                    </div>
                    <div className="post-caption">
                      <span className="caption-username">
                        {blog.author?.name || "anonymous"}
                      </span>
                      <span className="caption-text">
                        <b>{blog.title}</b> — {blog.description}
                      </span>
                    </div>
                    
                    <Link to={`/blog/${blog._id}`} className="post-comments-link" style={{ textDecoration: "none", display: "block" }}>
                      {blog.comments && blog.comments.length > 0
                        ? `View all ${blog.comments.length} comments`
                        : "Write a comment..."}
                    </Link>

                    <div className="post-time">
                      {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Just now"}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;