import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import defaultAvatar from "../assets/avatar1.jpg";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en.json";
import ru from "javascript-time-ago/locale/ru.json";

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

const PostAuthor = ({ authorID, createdAt }) => {
  const [author, setAuthor] = useState({});

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await axios.get(
          `https://inksphereapp.onrender.com/api/users/${authorID}`
        );
        setAuthor(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAuthor();
  }, [authorID]);

  const formattedDate = createdAt ? new Date(createdAt) : null;

  return (
    <Link to={`/posts/users/${authorID}`}>
      <div className="post__author">
        <div className="post__author-avatar">
          <img
            src={
              author.avatar
                ? `${import.meta.env.VITE_ASSETS_URI}/uploads/${author.avatar}`
                : defaultAvatar
            }
            alt="Author Avatar"
          />
        </div>
        <div className="post__author-details">
          <h5>By: {author.name}</h5>
          {formattedDate && (
            <small>
              <ReactTimeAgo date={formattedDate} locale="en-US" />
            </small>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PostAuthor;
