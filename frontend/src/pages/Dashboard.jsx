import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../component/Sidebar";
import { FiHeart, FiMessageCircle, FiSend, FiBookmark } from "react-icons/fi";
import "../Style/Dashboard.css";

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/blogs");
        setBlogs(res.data.blogs || res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <div className="feed-container">
          {blogs.length === 0 ? (
            <p className="no-blogs">No posts found 🚀</p>
          ) : (
            blogs.map((blog) => (
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
                    <button className="action-btn-heart"><FiHeart size={24} /></button>
                    <button className="action-btn"><FiMessageCircle size={24} /></button>
                    <button className="action-btn"><FiSend size={24} /></button>
                  </div>
                  <button className="action-btn bookmark"><FiBookmark size={24} /></button>
                </div>

                {/* Post Content / Caption */}
                <div className="post-content">
                  <div className="post-likes">
                    <span>Liked by <b>readers</b> and others</span>
                  </div>
                  <div className="post-caption">
                    <span className="caption-username">
                      {blog.author?.name || "anonymous"}
                    </span>
                    <span className="caption-text">
                      <b>{blog.title}</b> — {blog.description}
                    </span>
                  </div>
                  <div className="post-comments-link">
                    View comments
                  </div>
                  <div className="post-time">
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Just now"}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;