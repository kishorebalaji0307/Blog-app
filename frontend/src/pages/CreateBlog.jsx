import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../component/Sidebar";
import "../Style/CreateBlog.css";

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get("http://localhost:5000/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserId(res.data.user.id || res.data.user._id);
        }
      } catch (err) {
        console.log("Error fetching user profile:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/blogs/${id}`);
          const blog = res.data.blog || res.data;
          setTitle(blog.title || "");
          setDescription(blog.description || "");
          setImageUrl(blog.image || "");
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
          "http://localhost:5000/api/upload",
          formData
        );
        finalImageUrl = data.imageUrl;
      }

      const blogData = {
        title,
        description,
        image: finalImageUrl,
        author: userId,
      };

      const token = localStorage.getItem("token");

      if (id) {
        await axios.put(
          `http://localhost:5000/api/blogs/${id}`,
          blogData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Blog updated successfully 🚀");
      } else {
        await axios.post(
          "http://localhost:5000/api/blogs",
          blogData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Blog created successfully 🚀");
      }

      navigate("/dashboard");
    } catch (error) {
      console.log("Submit error:", error);
      alert(id ? "Failed to update blog" : "Failed to create blog");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Blog deleted successfully 🚀");
        navigate("/profile");
      } catch (error) {
        console.log("Delete error:", error);
        alert("Failed to delete blog");
      }
    }
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content-create">
        <div className="create-blog-card">
          <h1>{id ? "Edit Post" : "Create New Post"}</h1>

          <form className="blog-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Post Caption/Title"
              className="blog-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Category / Tags"
              className="blog-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            {imageUrl && (
              <div style={{ position: "relative", width: "100%", maxHeight: "200px", overflow: "hidden", borderRadius: "8px", border: "1px solid #dbdbdb" }}>
                <img
                  src={imageUrl}
                  alt="Current Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            <input
              type="file"
              className="blog-input"
              onChange={(e) => setImage(e.target.files[0])}
            />

            <textarea
              placeholder="Write description..."
              rows="8"
              className="blog-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

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
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateBlog;