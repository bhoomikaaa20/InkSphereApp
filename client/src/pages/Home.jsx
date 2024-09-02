import React from "react";
import Posts from "../components/Posts";

const Home = () => {
  return (
    <div>
      <Posts />
      <button className="post__back-btn" onClick={() => window.history.back()}>
        Go Back
      </button>
    </div>
  );
};

export default Home;
