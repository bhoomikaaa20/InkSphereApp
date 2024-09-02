import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import logo from "../assets/logo.png";
import { FaBars } from "react-icons/fa6";
import { UserContext } from "../context/userContext";

const Header = () => {
  const [isNavShowing, setIsNavShowing] = useState(window.innerWidth > 800);
  const { currentUser } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    // Adjust the nav visibility when the component mounts or the location changes
    setIsNavShowing(window.innerWidth > 800);
  }, [location]);

  const closeNavHandler = () => {
    setIsNavShowing((prev) => !prev);
  };

  return (
    <nav>
      <div className="container nav__container">
        <Link to="/" className="nav__logo">
          <img src={logo} alt="imggg" />
        </Link>

        {isNavShowing && (
          <ul className="nav__menu">
            {currentUser && currentUser.data._id ? (
              <>
                <li>
                  <Link
                    to={`/profile/${currentUser.data._id}`}
                    onClick={closeNavHandler}
                  >
                    {currentUser.data.name}
                  </Link>
                </li>
                <li>
                  <Link to="/create" onClick={closeNavHandler}>
                    Create post
                  </Link>
                </li>
                <li>
                  <Link to="/authors" onClick={closeNavHandler}>
                    Authors
                  </Link>
                </li>
                <li>
                  <Link to="/logout" onClick={closeNavHandler}>
                    Logout
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/authors" onClick={closeNavHandler}>
                    Authors
                  </Link>
                </li>
                <li>
                  <Link to="/login" onClick={closeNavHandler}>
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        )}

        <button className="nav__toggle-btn" onClick={closeNavHandler}>
          {isNavShowing ? <AiOutlineClose /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Header;
