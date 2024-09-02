import React from "react";
import LoadingGIF from "../assets/blog1.jpg";

const Loader = () => {
  return (
    <div className="loader">
      <div className="loader__image">
        <img src={LoadingGIF} alt="gif"></img>
      </div>
    </div>
  );
};

export default Loader;
