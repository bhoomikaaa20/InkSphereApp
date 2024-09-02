import React from "react";
import PostAuthor from "./PostAuthor";
import { Link } from "react-router-dom";

const PostItem = ({
  postId,
  thumbnail,
  category,
  title,
  description,
  authorID,
  createdAt,
}) => {
  const shortDescription =
    description.length > 140 ? description.substr(0, 140) + "..." : description;
  const shortTitle = title.length > 30 ? title.substr(0, 30) + "..." : title;
  return (
    <article className="post">
      <div className="post__thumbnail">
        <img
          src={`${import.meta.env.VITE_ASSETS_URI}/uploads/${thumbnail}`}
          alt="Post thumbnail"
        />
      </div>
      <div className="post__content">
        <Link to={`/posts/${postId}`}>
          <h3>{shortTitle}</h3>
        </Link>
        <p dangerouslySetInnerHTML={{ __html: shortDescription }}></p>
        <div className="post__footer">
          <PostAuthor authorID={authorID} createdAt={createdAt} />
          <Link to={`/posts/categories/${category}`} className="post__category">
            {category}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostItem;
