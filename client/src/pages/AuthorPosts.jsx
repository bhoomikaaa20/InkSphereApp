import React, { useEffect, useState } from "react";
import PostItem from "../components/PostItem";
import axios from "axios";
import { useParams } from "react-router-dom";

const AuthorPosts = () => {
  const [posts, setPosts] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `https://inksphereapp.onrender.com/api/posts/users/${id}`
        );

        setPosts(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPosts();
  }, [id]);
  return (
    <section className="post">
      {posts.length > 0 ? (
        <div className="posts__container">
          {posts.map((post) => (
            <PostItem
              key={post._id}
              postId={post._id}
              thumbnail={post.thumbnail}
              category={post.category}
              title={post.title}
              description={post.description}
              authorID={post.creator}
              createdAt={post.createdAt}
            />
          ))}
        </div>
      ) : (
        <h2 className="center">No Posts Found</h2>
      )}
      <button className="post__back-btn" onClick={() => window.history.back()}>
        Go Back
      </button>
    </section>
  );
};

export default AuthorPosts;
