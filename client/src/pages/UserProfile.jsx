import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { IoCheckmarkCircle } from "react-icons/io5";
import { UserContext } from "../context/userContext";
import axios from "axios";
import defaultAvatar from "../assets/avatar1.jpg";

const UserProfile = () => {
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isAvatarTouched, setIsAvatarTouched] = useState(false);
  const [error, setError] = useState("");

  const { currentUser } = useContext(UserContext);
  const token = currentUser?.data?.token;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      console.log("UserProfile: currentUser.data._id =", currentUser.data._id);
      if (!currentUser.data._id) {
        console.log("UserProfile: Skipping fetch because _id is undefined");
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/users/${currentUser.data._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setName(response.data.data.name);
        setEmail(response.data.data.email);
        setAvatar(response.data.data.avatar);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [currentUser.data._id, token]);

  const handleAvatar = async () => {
    if (avatar && avatar instanceof File) {
      setIsAvatarTouched(false);
      console.log("UserProfile: avatar before change-avatar API call:", avatar);
      try {
        const PostData = new FormData();
        PostData.set("avatar", avatar);

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/change-avatar`,
          PostData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("UserProfile: response.data.avatar:", response.data.avatar);
        setAvatar(response.data.avatar); // Update avatar with the new one
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    console.log("UserProfile: avatar in handleSubmit:", avatar);

    try {
      const UserData = new FormData();
      // Note: Avatar is handled separately via change-avatar endpoint
      UserData.set("name", name);
      UserData.set("email", email);
      UserData.set("currentPassword", currentPassword);
      UserData.set("newPassword", newPassword);
      UserData.set("confirmNewPassword", confirmNewPassword);

      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/users/edit-user`,
        UserData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/logout");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred"); // Set a meaningful error message
    }
  };

  return (
    <section className="profile">
      <div className="container profile__container">
        <Link to={`/myposts/${currentUser.data._id}`} className="btn">
          My Posts
        </Link>
        <div className="profile__details">
          <div className="avatar__wrapper">
            <div className="profile__avatar">
              <img
                src={typeof avatar === 'string' && avatar.includes('://') ? avatar : (avatar ? `${import.meta.env.VITE_ASSETS_URI}/uploads/${avatar}` : defaultAvatar)}
                alt="User Avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatar; // Fallback in case of error
                }}
              />
            </div>
            <form className="avatar__form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="file"
                name="file"
                id="file"
                accept="image/png, image/jpg, image/jpeg"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
              <label htmlFor="file">
                <FaRegEdit onClick={() => setIsAvatarTouched(true)} />
              </label>
              {isAvatarTouched && (
                <button
                  type="button"
                  className="profile__avatar-btn"
                  onClick={handleAvatar}
                >
                  <IoCheckmarkCircle />
                </button>
              )}
            </form>
          </div>
          <h1>{name}</h1>
          <form className="form profile__form" onSubmit={handleSubmit}>
            {error && <p className="form__error_message">{error}</p>}
            <input
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <button type="submit" className="btn primary">
              Update Details
            </button>
          </form>
        </div>
      </div>
      <button className="post__back-btn" onClick={() => window.history.back()}>
        Go Back
      </button>
    </section>
  );
};

export default UserProfile;
