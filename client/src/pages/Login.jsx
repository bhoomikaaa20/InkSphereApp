import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/userContext";

const Login = () => {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const changeInputHandler = (e) => {
    setUserData((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://inksphereapp.onrender.com/api/users/login",
        userData
      );
      const user = await response.data;
      setCurrentUser(user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    }
  };

  return (
    <section className="login">
      <div className="container">
        <h2>Signin</h2>
        <form className="form login__form" onSubmit={loginUser}>
          {error && <p className="form__error_message">{error}</p>}
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={userData.email}
            onChange={changeInputHandler}
          />
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={userData.password}
            onChange={changeInputHandler}
          />

          <button type="submit" className="btn primary">
            Login
          </button>
        </form>
        <small>
          Don't have an account<Link to="/register">Singup</Link>
        </small>
      </div>
    </section>
  );
};

export default Login;
