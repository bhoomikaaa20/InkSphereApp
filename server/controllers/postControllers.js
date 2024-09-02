const HttpError = require("../models/errorModel");
const User = require("../models/userModel.js");
const Post = require("../models/postModel.js");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

//================CREATE POST
// GET: api/posts
//UNPROTECTED

const createPost = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;
    if (!title || !category || !description || !req.files.thumbnail) {
      console.log(req.files);
      return next(new HttpError("Please fill all the details"), 423);
    }

    const { thumbnail } = req.files;
    if (thumbnail.size > 2000000) {
      return next(
        new HttpError(
          "The file is too big. Please select a file less than 2mb"
        ),
        422
      );
    }

    const filename = thumbnail.name;
    const splittedFileName = filename.split(".");
    const extension = splittedFileName.pop();
    const newFileName = `${splittedFileName.join(
      "."
    )}_${uuidv4()}.${extension}`;

    // Move the new avatar file
    thumbnail.mv(
      path.join(__dirname, "..", "uploads", newFileName),
      async (err) => {
        if (err) {
          return next(
            new HttpError("Error moving file to uploads folder", 500)
          );
        } else {
          const newPost = await Post.create({
            title,
            category,
            description,
            thumbnail: newFileName,
            creator: req.user._id,
          });

          if (!newPost) {
            return next(new HttpError("Post cannot be created"), 422);
          }

          // Find the user and update their posts count
          const currentUser = await User.findById(req.user._id);
          if (currentUser) {
            currentUser.posts = currentUser.posts + 1; // Update post count
            await currentUser.save(); // Save the updated user document
          }

          res.status(201).json({
            message: "New Post Created",
            data: newPost,
          });
        }
      }
    );
  } catch (err) {
    return next(new HttpError(err));
  }
};

//================GET All POSTS
// GET: api/posts
//UNPROTECTED

const getPosts = async (req, res, next) => {
  const posts = await Post.find().sort({ updatedAt: -1 });
  res.status(200).send({
    data: posts,
  });
  try {
  } catch (err) {
    return next(new HttpError(err));
  }
};

//================GET SINGLE POST
// GET: api/posts/:id
//UNPROTECTED

const getPost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
      return next(new HttpError("Post Not Found", 404));
    }
    res.status(200).json({
      post,
    });
  } catch (err) {
    return next(new HttpError(err));
  }
};

//================GET POSTS BY CATEGORY
// GET: api/posts/categories/:category
//UNPROTECTED

const getCatPost = async (req, res, next) => {
  try {
    const { category } = req.params;
    console.log(req.params);
    const catPost = await Post.find({ category }).sort({ updatedAt: -1 });
    if (!catPost) {
      return next(new HttpError("Post Not Found", 404));
    }
    res.status(200).json({
      message: `Single Post with ${category} sent`,
      data: catPost,
    });
  } catch (err) {
    return next(new HttpError(err));
  }
};

//================GET USER/AUTHOR POSTS
// GET: api/posts/users/:id
//UNPROTECTED

const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authPosts = await Post.find({ creator: id }).sort({ updatedAt: -1 });
    res.status(200).json({
      message: "Author posts Sent",
      data: authPosts,
    });
  } catch (err) {
    return next(new HttpError(err));
  }
};

//================EDIT POST
// PATCH: api/posts/:id
//UNPROTECTED

const editPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    console.log("Post ID:", postId); // Log postId to debug

    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return next(new HttpError("Please fill all the details", 422));
    }

    const oldPost = await Post.findById(postId);
    if (!oldPost) {
      return next(new HttpError("Post not found", 404));
    }

    if (req.user._id != oldPost.creator) {
      return next(new HttpError("Unauthorized to edit the post", 403));
    }

    if (!req.files || !req.files.thumbnail) {
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { title, category, description },
        { new: true }
      );

      if (!updatedPost) {
        return next(new HttpError("Error updating post", 500));
      }

      return res.status(200).json({
        message: "Post Edited Successfully",
        data: updatedPost,
      });
    } else {
      const { thumbnail } = req.files;
      if (thumbnail.size > 2000000) {
        return next(
          new HttpError(
            "The file is too big. Please select a file less than 2mb",
            422
          )
        );
      }

      const filename = thumbnail.name;
      const splittedFileName = filename.split(".");
      const extension = splittedFileName.pop();
      const newFileName = `${splittedFileName.join(
        "."
      )}_${uuidv4()}.${extension}`;

      thumbnail.mv(
        path.join(__dirname, "..", "uploads", newFileName),
        async (err) => {
          if (err) {
            return next(
              new HttpError("Error moving file to uploads folder", 500)
            );
          }

          const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { title, category, description, thumbnail: newFileName },
            { new: true }
          );

          if (!updatedPost) {
            return next(new HttpError("Error updating post", 500));
          }

          return res.status(200).json({
            message: "Post Edited Successfully",
            data: updatedPost,
          });
        }
      );
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    return next(new HttpError("Error editing post", 500));
  }
};

//================DELETE POST
//DELETE: api/posts/:id
//UNPROTECTED

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const dbPost = await Post.findById(postId);

    if (!dbPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (dbPost.creator.toString() !== req.user._id.toString()) {
      return res
        .status(423)
        .json({ message: "Unauthorized to delete this post" });
    }

    if (!dbPost.thumbnail) {
      await Post.findByIdAndDelete(postId);
    } else {
      const filename = dbPost.thumbnail;
      const filePath = path.join(__dirname, "..", "uploads", filename);

      fs.unlink(filePath, async (err) => {
        if (err && err.code !== "ENOENT") {
          return next(new Error("Error deleting old thumbnail"));
        }

        await Post.findByIdAndDelete(postId);

        const userDetails = await User.findById(req.user._id);
        const updatedPostsCount = userDetails.posts - 1;
        await User.findByIdAndUpdate(req.user._id, {
          posts: updatedPostsCount,
        });

        return res
          .status(200)
          .json({ message: `Post with postId ${postId} deleted successfully` });
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  getCatPost,
  getUserPosts,
  editPost,
  deletePost,
};
