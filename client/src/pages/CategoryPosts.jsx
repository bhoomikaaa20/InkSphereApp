import React, { useEffect, useState } from "react";
import PostItem from "../components/PostItem";
import axios from "axios";
import { useParams } from "react-router-dom";

const CategoryPosts = () => {
  const [posts, setPosts] = useState([]);
  const { category } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8084/api/posts/categories/${category}`
        );

        setPosts(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPosts();
  }, [category]);
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
        <h2 className="center">{`No Posts on ${category}`}</h2>
      )}
    </section>
  );
};

export default CategoryPosts;
