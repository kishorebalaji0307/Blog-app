import Sidebar from "../component/Sidebar";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ProfileSkeleton } from "../component/SkeletonLoader";
import "../Style/Profile.css";

export default function Profile() {
  const { id } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [taggedBlogs, setTaggedBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setActiveTab("posts"); // Reset tab on navigation
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch current user first to compare IDs
        const meRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, { headers });
        const me = meRes.data.user;
        setLoggedInUser(me);

        // Determine if this profile is the logged-in user
        const targetUserId = id || me._id || me.id;
        const isSelf = targetUserId === (me._id || me.id);

        let targetUser;
        if (isSelf) {
          targetUser = me;
          setIsFollowing(false);
          setFollowersCount(me.followersCount || 0);
          setFollowingCount(me.followingCount || 0);
        } else {
          // Fetch target profile details
          const targetRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile/${targetUserId}`, { headers });
          targetUser = targetRes.data.user;
          setIsFollowing(targetUser.isFollowing);
          setFollowersCount(targetUser.followersCount || 0);
          setFollowingCount(targetUser.followingCount || 0);
        }

        setUser(targetUser);

        // Fetch blogs and tagged blogs
        const [userBlogsRes, taggedBlogsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/blogs/user/${targetUserId}`),
          axios.get(`${import.meta.env.VITE_API_URL}/blogs/tagged/${targetUserId}`)
        ]);

        setBlogs(userBlogsRes.data.blogs || []);
        setTaggedBlogs(taggedBlogsRes.data.blogs || []);
      } catch (err) {
        console.error("Error loading profile:", err);
        toast.error("Failed to load profile details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const openEditModal = () => {
    setEditName(user?.name || "");
    setEditBio(user?.bio || "");
    setProfileImageUrl(user?.profileImage || "");
    setProfileImage(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalProfileImage = profileImageUrl;
      if (profileImage) {
        const formData = new FormData();
        formData.append("image", profileImage);
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload`,
          formData
        );
        finalProfileImage = data.imageUrl;
      }

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        { name: editName, bio: editBio, profileImage: finalProfileImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setIsEditModalOpen(false);
      toast.success("Profile updated successfully 🚀");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to follow users");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const endpoint = isFollowing ? "unfollow" : "follow";

      // Optimistic Update
      setIsFollowing(!isFollowing);
      setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/${endpoint}/${user?._id || user?.id}`,
        {},
        { headers }
      );

      setFollowersCount(res.data.followersCount);
      toast.success(isFollowing ? "Unfollowed successfully 💔" : "Followed successfully ❤️");
    } catch (err) {
      // Revert Optimistic Update
      setIsFollowing(isFollowing);
      setFollowersCount(followersCount);
      toast.error(err.response?.data?.message || "Failed to update follow status");
    }
  };

  const isSelf = !id || id === (loggedInUser?._id || loggedInUser?.id);
  const userBlogs = blogs;

  return (
    <div className="app-container">
      <Sidebar />

      <main className="profile-content">
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="profile-container">
          {/* Profile Header */}
          <header className="profile-header">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="avatar-img" />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : "U"
                )}
              </div>
            </div>

            <section className="profile-info">
              <div className="profile-username-row">
                <h2>{user?.name || "User"}</h2>
                {isSelf ? (
                  <button className="edit-profile-btn" onClick={openEditModal}>
                    Edit Profile
                  </button>
                ) : (
                  <button
                    className={`follow-btn ${isFollowing ? "unfollow-btn" : ""}`}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>

              <div className="profile-stats">
                <span><b>{userBlogs.length}</b> posts</span>
                <span><b>{followersCount}</b> followers</span>
                <span><b>{followingCount}</b> following</span>
              </div>

              <div className="profile-bio">
                <span className="profile-real-name">{user?.name}</span>
                <p>{user?.bio || "Welcome to my Bloggram profile! Exploring the virtual space one post at a time. 🚀"}</p>
                <span className="profile-email">{user?.email}</span>
              </div>
            </section>
          </header>

          {/* Profile Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab-btn ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              POSTS
            </button>
            {isSelf && (
              <button
                className={`profile-tab-btn ${activeTab === "saved" ? "active" : ""}`}
                onClick={() => setActiveTab("saved")}
              >
                SAVED
              </button>
            )}
            <button
              className={`profile-tab-btn ${activeTab === "tagged" ? "active" : ""}`}
              onClick={() => setActiveTab("tagged")}
            >
              TAGGED
            </button>
          </div>

          {/* Profile Posts Grid */}
          <div className="profile-posts-grid">
            {activeTab === "posts" ? (
              userBlogs.length === 0 ? (
                <div className="no-posts-yet">
                  <h3>No Posts Yet</h3>
                </div>
              ) : (
                userBlogs.map((blog) => (
                  <Link to={isSelf ? `/edit-blog/${blog._id}` : `/blog/${blog._id}`} className="grid-post-item" key={blog._id}>
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
              )
            ) : activeTab === "saved" ? (
              (user?.savedBlogs || []).length === 0 ? (
                <div className="no-posts-yet">
                  <h3>No Saved Posts Yet</h3>
                </div>
              ) : (
                user.savedBlogs.map((blog) => (
                  <Link to={`/blog/${blog._id}`} className="grid-post-item" key={blog._id}>
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
              )
            ) : (
              taggedBlogs.length === 0 ? (
                <div className="no-posts-yet">
                  <h3>No Tagged Posts Yet</h3>
                </div>
              ) : (
                taggedBlogs.map((blog) => (
                  <Link to={`/blog/${blog._id}`} className="grid-post-item" key={blog._id}>
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
              )
            )}
          </div>
        </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="edit-profile-modal-overlay">
          <div className="edit-profile-modal">
            <h3>Edit Profile</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group avatar-upload-group">
                <label>Profile Picture</label>
                <div className="avatar-upload-preview-container">
                  <div className="avatar-upload-preview">
                    {profileImage ? (
                      <img src={URL.createObjectURL(profileImage)} alt="Preview" />
                    ) : profileImageUrl ? (
                      <img src={profileImageUrl} alt="Current" />
                    ) : (
                      <div className="avatar-initial">
                        {editName ? editName[0].toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  <label htmlFor="avatar-file-upload" className="change-avatar-btn">
                    Change Photo
                  </label>
                  <input
                    id="avatar-file-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setProfileImage(file);
                      }
                    }}
                  />
                </div>
              </div>
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
