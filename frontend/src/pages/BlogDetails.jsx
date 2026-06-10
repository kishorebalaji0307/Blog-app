import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../component/Sidebar";
import { FiHeart, FiBookmark, FiMessageCircle, FiChevronLeft, FiMoreVertical, FiShare2 } from "react-icons/fi";
import toast from "react-hot-toast";
import "../Style/BlogDetails.css";

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchBlogAndUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch user profile to check likes and saved status
        if (token) {
          const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers,
          });
          setUser(userRes.data.user);
        }

        // Fetch single blog detail
        const blogRes = await axios.get(`${import.meta.env.VITE_API_URL}/blogs/${id}`);
        setBlog(blogRes.data.blog || blogRes.data);
      } catch (err) {
        console.error("Failed to load details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogAndUser();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local blog likes array
      setBlog((prev) => ({
        ...prev,
        likes: res.data.likes,
      }));
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to save posts!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs/${id}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update user saved status locally
      setUser((prev) => ({
        ...prev,
        savedBlogs: res.data.savedBlogs,
      }));
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to comment!");
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs/${id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local comments array
      setBlog((prev) => ({
        ...prev,
        comments: res.data.comments,
      }));
      setCommentText("");
      toast.success("Comment added successfully 🚀");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleEdit = () => {
    navigate(`/edit-blog/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_API_URL}/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Blog deleted successfully 🚀");
        navigate("/dashboard");
      } catch (err) {
        console.error("Delete error:", err);
        toast.error(err.response?.data?.message || "Failed to delete blog");
      }
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title || "Blog Post",
          text: blog?.description?.substring(0, 100) || "Check out this blog post!",
          url: shareUrl,
        });
        toast.success("Shared successfully 🚀");
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard! 📋");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="blog-details-container">
        <Sidebar />
        <main className="blog-details-content">
          <div className="blog-details-card" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <p>Loading blog details... 🚀</p>
          </div>
        </main>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-details-container">
        <Sidebar />
        <main className="blog-details-content">
          <div className="blog-details-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <p>Blog post not found.</p>
            <button className="interaction-btn" onClick={() => navigate("/dashboard")}>
              <FiChevronLeft /> Go Back to Feed
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isLiked = user && blog.likes?.includes(user._id);
  // Compare by string ID values
  const isSaved = user && user.savedBlogs?.some(
    (saved) => (typeof saved === "object" ? saved._id : saved) === id
  );

  const isAuthor = user && blog && blog.author && (
    (typeof blog.author === "object" ? blog.author._id : blog.author) === user._id
  );

  return (
    <div className="blog-details-container">
      <Sidebar />

      <main className="blog-details-content">
        <div className="blog-details-card">
          {/* Back Navigation & Header info */}
          <header className="blog-details-header">
            <button className="interaction-btn" style={{ paddingLeft: 0 }} onClick={() => navigate(-1)}>
              <FiChevronLeft size={20} /> Back
            </button>
            <div className="blog-author-info">
              <div className="author-avatar">
                {blog.author?.profileImage ? (
                  <img src={blog.author.profileImage} alt={blog.author.name} className="avatar-img" />
                ) : (
                  blog.author?.name ? blog.author.name[0].toUpperCase() : "U"
                )}
              </div>
              <div className="author-meta">
                <h4>{blog.author?.name || "anonymous"}</h4>
                <p>Virtual Portal</p>
              </div>
            </div>
            <div className="blog-details-header-right">
              <span className="blog-date">
                {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Just now"}
              </span>
              {isAuthor && (
                <div className="blog-menu-container" ref={menuRef}>
                  <button
                    className="blog-menu-trigger"
                    onClick={() => setShowMenu((prev) => !prev)}
                    aria-label="Options"
                  >
                    <FiMoreVertical size={20} />
                  </button>
                  {showMenu && (
                    <div className="blog-dropdown-menu">
                      <button className="blog-dropdown-item edit-option" onClick={handleEdit}>
                        Edit Post
                      </button>
                      <button className="blog-dropdown-item delete-option" onClick={handleDelete}>
                        Delete Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Title */}
          <h1 className="blog-details-title">{blog.title}</h1>

          {/* Featured Image */}
          {blog.image && (
            <div className="blog-image-wrapper">
              <img src={blog.image} alt={blog.title} className="blog-details-img" />
            </div>
          )}

          {/* Description / Caption Content */}
          <div className="blog-details-desc">{blog.description}</div>

          {/* Interaction Bar */}
          <div className="blog-interaction-bar">
            <div className="interaction-actions">
              <button
                onClick={handleLike}
                className={`interaction-btn ${isLiked ? "active-like" : ""}`}
              >
                <FiHeart size={22} />
                <span>{blog.likes?.length || 0} Likes</span>
              </button>

              <div className="interaction-btn">
                <FiMessageCircle size={22} />
                <span>{blog.comments?.length || 0} Comments</span>
              </div>

              <button
                onClick={handleShare}
                className="interaction-btn share-btn"
              >
                <FiShare2 size={22} />
                <span>Share</span>
              </button>
            </div>

            <button
              onClick={handleSave}
              className={`interaction-btn ${isSaved ? "active-save" : ""}`}
            >
              <FiBookmark size={22} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>

          {/* Comments Section */}
          <section className="comments-section">
            <h3>Comments</h3>

            <div className="comments-list">
              {!blog.comments || blog.comments.length === 0 ? (
                <p className="no-comments-prompt">No comments yet. Be the first to start the conversation! 💬</p>
              ) : (
                blog.comments.map((comment) => (
                  <div className="comment-card" key={comment._id}>
                    <div className="comment-avatar">
                      {comment.user?.profileImage ? (
                        <img src={comment.user.profileImage} alt={comment.user.name} className="avatar-img" />
                      ) : (
                        comment.user?.name ? comment.user.name[0].toUpperCase() : "U"
                      )}
                    </div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-username">
                          {comment.user?.name || "anonymous"}
                        </span>
                        <span className="comment-time">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Just now"}
                        </span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Box */}
            <form className="add-comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                className="comment-input-textarea"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
                required
              />
              <button
                type="submit"
                className="comment-post-btn"
                disabled={isSubmittingComment || !commentText.trim()}
              >
                {isSubmittingComment ? "Posting..." : "Post"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
