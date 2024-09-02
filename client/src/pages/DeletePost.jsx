import React, { useContext } from "react";
import { UserContext } from "../context/userContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const DeletePost = ({ postId: id }) => {
  const { currentUser } = useContext(UserContext);

  const token = currentUser?.data?.token;
  const navigate = useNavigate();
  const location = useLocation();

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `https://inksphereapp.onrender.com/api/posts/${id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data.message);
      const userPostsPath = `http://localhost:8084/myposts/${currentUser.data._id}`;
      console.log("Current Path:", location.pathname);
      console.log("Expected Path:", userPostsPath);

      if (location.pathname === userPostsPath) {
        navigate(0); // Refresh the page
      } else {
        navigate("/"); // Navigate to the home page
      }
    } catch (err) {
      console.error(
        "Error deleting post:",
        err.response?.data?.message || err.message
      );
    }
  };

  return (
    <div>
      <button className="btn sm danger" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
};

export default DeletePost;
