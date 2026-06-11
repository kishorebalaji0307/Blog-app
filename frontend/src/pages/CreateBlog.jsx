import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../component/Sidebar";
import "../Style/CreateBlog.css";

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data.user);
          setUserId(res.data.user.id || res.data.user._id);
        }
      } catch (err) {
        console.log("Error fetching user profile:", err);
      }
    };

    fetchUser();
  }, []);

  // Fetch tag autocomplete suggestions
  useEffect(() => {
    const searchUsers = async () => {
      if (!tagSearchQuery.trim()) {
        setTagSuggestions([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/search?q=${tagSearchQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTagSuggestions(res.data.users || []);
      } catch (err) {
        console.error("Error searching users:", err);
      }
    };

    const delayDebounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(delayDebounce);
  }, [tagSearchQuery]);

  // Click outside listener for autocomplete suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/blogs/${id}`);
          const blog = res.data.blog || res.data;
          setTitle(blog.title || "");
          setDescription(blog.description || "");
          setImageUrl(blog.image || "");
          setTaggedUsers(blog.taggedUsers || []);
        } catch (err) {
          console.log("Error fetching blog details:", err);
        }
      };
      fetchBlog();
    } else {
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setImageUrl("");
        setImage(null);
        setTaggedUsers([]);
      }, 0);
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = imageUrl;

      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload`,
          formData
        );
        finalImageUrl = data.imageUrl;
      }

      const blogData = {
        title,
        description,
        image: finalImageUrl,
        author: userId,
        taggedUsers: taggedUsers.map((u) => u._id),
      };

      const token = localStorage.getItem("token");

      if (id) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/blogs/${id}`,
          blogData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Blog updated successfully 🚀");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/blogs`,
          blogData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Blog created successfully 🚀");
      }

      navigate("/dashboard");
    } catch (error) {
      console.log("Submit error:", error);
      toast.error(id ? "Failed to update blog" : "Failed to create blog");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_API_URL}/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Blog deleted successfully 🚀");
        navigate("/profile");
      } catch (error) {
        console.log("Delete error:", error);
        toast.error("Failed to delete blog");
      }
    }
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content-create">
        <div className="create-blog-card">
          <h1>{id ? "Edit Post" : "Create New Post"}</h1>

          <form className="blog-form-grid" onSubmit={handleSubmit}>
            {/* Left Column: Image Upload & Preview */}
            <div className="image-upload-pane">
              {imageUrl || image ? (
                <div className="image-preview-wrapper">
                  <img
                    src={image ? URL.createObjectURL(image) : imageUrl}
                    alt="Current Preview"
                    className="image-preview"
                  />
                  <div className="change-image-overlay">
                    <label htmlFor="file-upload" className="change-image-btn">
                      Change Photo
                    </label>
                  </div>
                </div>
              ) : (
                <label htmlFor="file-upload" className="dropzone-placeholder">
                  <div className="dropzone-content">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="upload-icon">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    <span>Click to upload post image</span>
                  </div>
                </label>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden-file-input"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImage(file);
                    setImageUrl("");
                  }
                }}
              />
            </div>

            {/* Right Column: Details Pane */}
            <div className="details-pane">
              {/* User profile header inside creator (Instagram style) */}
              <div className="author-header">
                <div className="author-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="avatar-img" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : "U"
                  )}
                </div>
                <span className="author-name">{user?.name || "User"}</span>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Post Caption / Title..."
                  className="blog-input-clean"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

             

              <div className="input-group user-tagging-group" style={{ position: "relative" }} ref={suggestionsRef}>
                <input
                  type="text"
                  placeholder="Tag users..."
                  className="blog-input-clean"
                  value={tagSearchQuery}
                  onChange={(e) => {
                    setTagSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && tagSuggestions.length > 0 && (
                  <div className="tag-suggestions-dropdown">
                    {tagSuggestions.map((suggestedUser) => (
                      <div
                        key={suggestedUser._id}
                        className="suggestion-item"
                        onClick={() => {
                          if (!taggedUsers.some((u) => u._id === suggestedUser._id)) {
                            setTaggedUsers((prev) => [...prev, suggestedUser]);
                          }
                          setTagSearchQuery("");
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="suggestion-avatar">
                          {suggestedUser.profileImage ? (
                            <img src={suggestedUser.profileImage} alt={suggestedUser.name} className="avatar-img" />
                          ) : (
                            suggestedUser.name ? suggestedUser.name[0].toUpperCase() : "U"
                          )}
                        </div>
                        <div className="suggestion-info">
                          <span className="suggestion-name">{suggestedUser.name}</span>
                          <span className="suggestion-email">{suggestedUser.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Display currently selected tagged users */}
                {taggedUsers.length > 0 && (
                  <div className="tagged-users-list">
                    {taggedUsers.map((taggedUser) => (
                      <span className="tagged-user-pill" key={taggedUser._id}>
                        @{taggedUser.name}
                        <button
                          type="button"
                          className="remove-tag-btn"
                          onClick={() =>
                            setTaggedUsers((prev) =>
                              prev.filter((u) => u._id !== taggedUser._id)
                            )
                          }
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group flex-grow">
                <textarea
                  placeholder="Write description..."
                  rows="6"
                  className="blog-textarea-clean"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="action-buttons">
                <button
                  type="submit"
                  className="publish-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : id ? "Update Post" : "Publish Post"}
                </button>

                {id && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    Delete Post
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateBlog;