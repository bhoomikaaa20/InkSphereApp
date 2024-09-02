import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const changeInputHandler = (e) => {
    setUserData((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:8084/api/users/register",
        userData
      );
      const newUser = await response.data;
      console.log(newUser);
      if (!newUser) {
        setError("Couldn't register");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
    <section className="register">
      <div className="container">
        <h2>Sing up</h2>
        <form className="form register__form" onSubmit={registerUser}>
          {error && <p className="form__error_message">{error}</p>}

          <input
            type="text"
            name="name"
            placeholder="Enter FullName"
            value={userData.name}
            onChange={changeInputHandler}
          />

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

          <input
            type="password"
            name="password2"
            placeholder="Confirm the password"
            value={userData.password2}
            onChange={changeInputHandler}
          />
          <button type="submit" className="btn primary">
            Register
          </button>
        </form>
        <small>
          Already have an account<Link to="/login">Signin</Link>
        </small>
      </div>
    </section>
  );
};

export default Register;
