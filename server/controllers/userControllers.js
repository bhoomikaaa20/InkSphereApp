const HttpError = require("../models/errorModel");
const User = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
//==================REGISTER USER
//POST:api/users/register
//UNPROTECTED

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;

    // Check if all fields are filled
    if (!name || !email || !password) {
      return next(new HttpError("Please fill all the fields", 422));
    }

    // Convert email to lowercase (correct method is toLowerCase())
    const newEmail = email.toLowerCase();

    // Check if the email is already registered
    const findEmail = await User.findOne({ email: newEmail });
    if (findEmail) {
      return next(new HttpError("User already Registered!", 422));
    }

    // Check if password length is at least 6 characters
    if (password.length < 6) {
      return next(
        new HttpError("Password must contain at least 6 characters", 422)
      );
    }
    if (password !== password2) {
      return next(new HttpError("Passwords doesn't match", 422));
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      name: name,
      email: newEmail,
      password: hashPass,
    });

    // Respond with the created user
    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    return next(new HttpError("User Registration failed", 500));
  }
};

//==================LOGIN NEW USER
//GET: api/users/login
//UNPROTECTED

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpError("Please Fill all the Feilds", 422));
    }
    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return next(new HttpError("User doesn't exist"));
    }
    const hashPass = await bcrypt.compare(password, user.password);
    if (!hashPass) {
      return next(new HttpError("Username or Password is incorrect"));
    }
    const { _id, name } = user;
    const token = jwt.sign({ _id, name }, process.env.secret_key, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login Successful",
      data: { token, _id, name },
    });
  } catch {
    return next(new HttpError("User Login Failed", 422));
  }
};

//================GET USER
//GET: api/users/:id
//UNPROTECTED
const getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ _id: id }).select("-password");
    if (!user) {
      return next(new HttpError("User Not Found"));
    }
    res.status(200).json({
      data: user,
    });
  } catch (error) {
    return next(new HttpError(error));
  }
};

//================GET AUTHORS
//GET: api/users
//UNPROTECTED
const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select("-password");
    res.status(200).json({
      message: "Authors data",
      data: authors,
    });
  } catch {
    return next(new HttpError("No authors Found", 422));
  }
};

//================CHANGE AVATAR
//GET: api/users/change-avatar
//UNPROTECTED
const changeAvatar = async (req, res, next) => {
  try {
    //Checking whether the avatar is present in req
    if (!req.files || !req.files.avatar) {
      return next(new HttpError("Please upload an avatar"), 400);
    }

    //Checking whether the user gone through authMiddleware and authenticated or not
    if (!req.user || !req.user._id) {
      return next(new HttpError("User not authenticated"), 401);
    }

    const avatar = req.files.avatar;

    // Check file size
    if (avatar.size > 500000) {
      return next(
        new HttpError(
          "The file is too big. Please select a file less than 500kb"
        ),
        422
      );
    }

    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new HttpError("User not found"), 404);
    }

    // Delete old avatar if exists
    if (user.avatar) {
      fs.unlink(path.join(__dirname, "..", "uploads", user.avatar), (err) => {
        if (err) {
          return next(new HttpError("Error deleting old avatar", 500));
        }
      });
    }

    // Generate new file name
    const filename = avatar.name;
    const splittedFileName = filename.split(".");
    const extension = splittedFileName.pop();
    const newFileName = `${splittedFileName.join(
      "."
    )}_${uuidv4()}.${extension}`;

    // Move the new avatar file
    avatar.mv(path.join(__dirname, "..", "uploads", newFileName), (err) => {
      if (err) {
        return next(new HttpError("Error moving file to uploads folder", 500));
      }
    });

    // Update user with new avatar file
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: newFileName },
      { new: true }
    );

    if (!updatedUser) {
      return next(new HttpError("Avatar cannot be updated", 400));
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    return next(new HttpError("Internal server error", 500));
  }
};
//================EDIT USER
//GET: api/users/edit-user
//UNPROTECTED
const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, confirmNewPassword } =
      req.body;

    // Check if all required fields are provided
    if (
      !name ||
      !email ||
      !currentPassword ||
      !newPassword ||
      !confirmNewPassword
    ) {
      return next(new HttpError("Please fill all the details", 422));
    }

    // Check if the user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new HttpError("User doesn't exist", 403));
    }

    // Check if the email is already used by another user
    const userDetails = await User.findOne({ email });
    if (userDetails && userDetails._id.toString() !== user._id.toString()) {
      return next(new HttpError("Email is already used by another user", 422));
    }

    // Validate the current password
    const validatePassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validatePassword) {
      return next(new HttpError("Current password is incorrect", 422));
    }

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      return next(new HttpError("New passwords do not match", 422));
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user details
    const updatedDetails = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, password: hashedPassword },
      { new: true }
    );

    // Send updated user details
    res.status(200).json(updatedDetails);
  } catch (err) {
    console.error(err); // Log the error
    return next(new HttpError(err.message || "An error occurred", 500));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  getAuthors,
  changeAvatar,
  editUser,
};
