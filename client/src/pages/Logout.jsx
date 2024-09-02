import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";

const Logout = () => {
  const { setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Perform the logout operation and navigate to login page
    setCurrentUser(null);
    navigate("/login");
  }, [setCurrentUser, navigate]); // Dependencies array to ensure useEffect runs when these values change

  return <div>Logging out...</div>;
};

export default Logout;
