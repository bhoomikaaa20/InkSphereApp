import React, { useState, useEffect, useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../context/userContext";
import axios from "axios";

const EditPost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const { currentUser } = useContext(UserContext);

  const token = currentUser?.data?.token;
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const CATEGORIES = [
    "Agriculture",
    "Business",
    "Education",
    "Entertainment",
    "Art",
    "Investment",
    "Uncategorized",
    "Weather",
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  useEffect(() => {
    const getPost = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8084/api/posts/${id}`
        );
        setTitle(response.data.post.title);
        setCategory(response.data.post.category || ""); // Ensure category is set
        setDescription(response.data.post.description);
        // Set other fields if necessary
      } catch (err) {
        setError("Failed to fetch post data");
      }
    };
    getPost();
  }, [id]);

  const editPost = async (e) => {
    e.preventDefault();

    const PostData = new FormData();
    PostData.set("title", title);
    PostData.set("category", category);
    PostData.set("description", description);
    if (thumbnail) {
      PostData.set("thumbnail", thumbnail);
    }

    try {
      const response = await axios.patch(
        `http://localhost:8084/api/posts/${id}`,
        PostData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.message);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred");
    }
  };

  return (
    <section className="create-post">
      <div className="container">
        <h1>Edit Post</h1>
        {error && <p className="form__error_message ">{error}</p>}
        <form className="create-post__form" onSubmit={editPost}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            type="text"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <ReactQuill
            modules={modules}
            formats={formats}
            value={description}
            onChange={setDescription}
          />
          <input
            type="file"
            onChange={(e) => setThumbnail(e.target.value[0])}
            accept="jpg,jpeg,png"
          />
          <button type="submit" className="btn primary">
            Update
          </button>
        </form>
      </div>
      <button className="post__back-btn" onClick={() => window.history.back()}>
        Go Back
      </button>
    </section>
  );
};

export default EditPost;
