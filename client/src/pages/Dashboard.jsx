import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import defaultAvatar from "../assets/avatar1.jpg";
import axios from "axios";
import DeletePost from "./DeletePost";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const { currentUser } = useContext(UserContext);

  const token = currentUser?.data?.token;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `https://inksphereapp.onrender.com/api/posts/users/${currentUser.data._id}`
        );
        console.log(response.data.data);
        setPosts(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPosts();
  }, []);

  return posts.length > 0 ? (
    <section className="dahsboard">
      <div className="container dashboard__container">
        {posts.map((post) => {
          return (
            <article key={post._id} className="dashboard__post">
              <div className="dashboard__post-info">
                <div className="dashboard__post-thumbnail">
                  <img
                    src={
                      posts.avatar
                        ? `${import.meta.env.VITE_ASSETS_URI}/uploads/${
                            post.avatar
                          }`
                        : defaultAvatar
                    }
                    alt="Author Avatar"
                  />
                </div>
                <h5> {post.title}</h5>
              </div>
              <div className="dashboard__post-actions">
                <Link to={`/posts/${post._id}`} className="btn sm">
                  View
                </Link>
                <Link to={`/posts/${post._id}/edit`} className="btn sm primary">
                  Edit
                </Link>
                <Link
                  to={`/posts/${post._id}/delete`}
                  className="btn sm danger"
                >
                  <DeletePost postId={post._id} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  ) : (
    <h2>No Posts Found</h2>
  );
};

export default Dashboard;
