import "../Style/Blog.css"

const BlogCard = ({ title, description }) => {
  return (
    <div className="blog-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default BlogCard;
