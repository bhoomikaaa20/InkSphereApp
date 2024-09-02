import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState(null);

  const { currentUser } = useContext(UserContext);

  const token = currentUser?.data?.token;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const CATEGORIES = [
    "Select a Category",
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

  const createPost = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const PostData = new FormData();
    PostData.set("title", title);
    PostData.set("category", category);
    PostData.set("description", description);
    if (thumbnail) {
      PostData.set("thumbnail", thumbnail);
    }

    try {
      const response = await axios.post(
        "http://localhost:8084/api/posts",
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
        <h1>Create Post</h1>
        {error && <p className="form__error_message">{error}</p>}
        <form className="create-post__form" onSubmit={createPost}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
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
            onChange={(e) => setThumbnail(e.target.files[0])}
            accept="image/jpg, image/jpeg, image/png"
          />
          <button type="submit" className="btn primary">
            Create
          </button>
        </form>
      </div>
      <button className="post__back-btn" onClick={() => window.history.back()}>
        Go Back
      </button>
    </section>
  );
};

export default CreatePost;
