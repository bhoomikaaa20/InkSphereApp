import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";
import axios from "axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:8084/api/posts");
        setPosts(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPosts();
  }, []);
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
    </section>
  );
};

export default Posts;
