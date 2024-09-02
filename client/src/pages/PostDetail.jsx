import React, { useEffect, useState } from "react";
import PostAuthor from "../components/PostAuthor";
import { Link, useParams } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";
import axios from "axios";
import DeletePost from "./DeletePost";

const PostDetail = () => {
  const [post, setPost] = useState({});
  const [error, setError] = useState();
  const { currentUser } = useContext(UserContext);
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8084/api/posts/${id}`
        );
        setPost(response.data.post);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPost();
  }, [id]);

  return (
    <section className="post-detail">
      {post && (
        <div className="container post-detail__container">
          <div className="post-detail__header">
            {<PostAuthor authorID={post.creator} createdAt={post.createdAt} />}

            {currentUser?.data?._id == post.creator && (
              <div className="post-detail__buttons">
                <Link className="btn sm primary" to={`/posts/${post._id}/edit`}>
                  Edit
                </Link>
                <DeletePost postId={id} />
              </div>
            )}
          </div>
          <h1>This is Post title</h1>
          <div className="post-detail__thumbnail">
            <img
              src={`${import.meta.env.VITE_ASSETS_URI}/uploads/${
                post.thumbnail
              }`}
              alt="img"
            />
          </div>
          <p dangerouslySetInnerHTML={{ __html: post.description }}>{}</p>
        </div>
      )}
      <button className="post__back-btn" onClick={() => window.history.back()}>
        Go Back
      </button>
    </section>
  );
};

export default PostDetail;
