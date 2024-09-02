const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");
const authMiddleware = require("../middleware/authMiddleware");

const { registerUser, loginUser, getUser, getAuthors, changeAvatar, editUser } =
  userControllers;

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.get("/", getAuthors);
router.post("/change-avatar", authMiddleware, changeAvatar); // Ensure authMiddleware is used here
router.patch("/edit-user", authMiddleware, editUser);

module.exports = router;
