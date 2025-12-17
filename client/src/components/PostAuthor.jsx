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
      console.log("PostAuthor: authorID =", authorID);
      if (!authorID) {
        console.log("PostAuthor: Skipping fetch because authorID is undefined");
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/users/${authorID}`
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
              typeof author.avatar === 'string' && author.avatar.includes('://')
                ? author.avatar
                : (author.avatar && author.avatar !== "undefined"
                  ? `${import.meta.env.VITE_ASSETS_URI}/uploads/${author.avatar}`
                  : defaultAvatar)
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
