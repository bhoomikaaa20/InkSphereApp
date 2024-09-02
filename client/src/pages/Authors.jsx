import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import defaultAvatar from "../assets/avatar1.jpg";

const Authors = () => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get(`http://localhost:8084/api/users`);

        // Log the data to see the response in the console
        console.log(response.data.data);

        setAuthors(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAuthors();
  }, []);

  return (
    <section className="authors">
      {authors.length > 0 ? (
        <div className="container authors__container">
          {authors.map((auth) => {
            return (
              <Link
                key={auth._id}
                to={`/posts/users/${auth._id}`}
                className="author"
              >
                <div className="author__avatar">
                  <img
                    src={
                      auth.avatar
                        ? `${import.meta.env.VITE_ASSETS_URI}/uploads/${
                            auth.avatar
                          }`
                        : defaultAvatar
                    }
                    alt={`image of ${auth.name}`}
                  />
                </div>
                <div className="author__info">
                  <h4>{auth.name}</h4> <p>{auth.posts}</p>{" "}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <h2 className="center">No authors/Users found</h2>
      )}
      <button className="post__back-btn" onClick={() => window.history.back()}>
        Go Back
      </button>
    </section>
  );
};

export default Authors;
