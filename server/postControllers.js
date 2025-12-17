const HttpError = require("../models/errorModel");
const User = require("../models/userModel.js");
const Post = require("../models/postModel.js");
const cloudinary = require("cloudinary").v2;

// Ensure 'uploads' directory exists at server startup

// Ensure 'uploads' directory exists at server startup
const createPost = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;

    // Check for required fields
    if (!title || !category || !description || !req.files?.thumbnail) {
      return next(new HttpError("Please fill all the details", 423));
    }

    const { thumbnail } = req.files;

    // Validate file size (2MB limit)
    if (thumbnail.size > 2 * 1024 * 1024) {
      return next(
        new HttpError(
          "The file is too big. Please select a file less than 2MB",
          422
        )
      );
    }

    // Upload to Cloudinary
    let uploadResult;
    try {
      uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blog-thumbnails" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(thumbnail.data);
      });
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      return next(new HttpError("Error uploading thumbnail", 500));
    }

    // Save post details to the database
    const newPost = await Post.create({
      title,
      category,
      description,
      thumbnail: uploadResult.secure_url,
      creator: req.user._id,
    });

    return res.status(201).json({
      message: "New Post Created",
      data: newPost,
    });
  } catch (err) {
    console.error("General Error:", err);
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }
};

//================GET All POSTS
// GET: api/posts
// UNPROTECTED
const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ updatedAt: -1 });
    res.status(200).json({ data: posts });
  } catch (err) {
    return next(new HttpError("Error fetching posts", 500));
  }
};

//================GET SINGLE POST
// GET: api/posts/:id
// UNPROTECTED
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new HttpError("Post Not Found", 404));
    }
    res.status(200).json({ data: post });
  } catch (err) {
    return next(new HttpError("Error fetching post", 500));
  }
};

//================GET POSTS BY CATEGORY
// GET: api/posts/categories/:category
// UNPROTECTED
const getCatPost = async (req, res, next) => {
  try {
    const catPost = await Post.find({ category: req.params.category }).sort({
      updatedAt: -1,
    });
    if (catPost.length === 0) {
      return next(new HttpError("No posts found in this category", 404));
    }
    res.status(200).json({ data: catPost });
  } catch (err) {
    return next(new HttpError("Error fetching category posts", 500));
  }
};

//================GET USER POSTS
// GET: api/posts/users/:id
// UNPROTECTED
const getUserPosts = async (req, res, next) => {
  try {
    const userPosts = await Post.find({ creator: req.params.id }).sort({
      updatedAt: -1,
    });
    res.status(200).json({ data: userPosts });
  } catch (err) {
    return next(new HttpError("Error fetching user posts", 500));
  }
};

//================EDIT POST
// PATCH: api/posts/:id
// UNPROTECTED
const editPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return next(new HttpError("Please fill all the details", 422));
    }

    const oldPost = await Post.findById(postId);
    if (!oldPost) {
      return next(new HttpError("Post not found", 404));
    }

    if (req.user._id.toString() !== oldPost.creator.toString()) {
      return next(new HttpError("Unauthorized to edit the post", 403));
    }

    let newThumbnailUrl = oldPost.thumbnail;

    // If a new file is uploaded, upload to Cloudinary
    if (req.files?.thumbnail) {
      const { thumbnail } = req.files;
      if (thumbnail.size > 2 * 1024 * 1024) {
        return next(
          new HttpError(
            "The file is too big. Please select a file less than 2MB",
            422
          )
        );
      }

      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "blog-thumbnails" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(thumbnail.data);
        });
        newThumbnailUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("Error uploading to Cloudinary:", err);
        return next(new HttpError("Error updating post thumbnail", 500));
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, category, description, thumbnail: newThumbnailUrl },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Post Edited Successfully", data: updatedPost });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Error editing post", 500));
  }
};

//================DELETE POST
// DELETE: api/posts/:id
// UNPROTECTED
const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return next(new HttpError("Post not found", 404));
    }

    if (req.user._id.toString() !== post.creator.toString()) {
      return next(new HttpError("Unauthorized to delete this post", 403));
    }

    if (post.thumbnail) {
      const filePath = path.join(uploadDir, post.thumbnail);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Error deleting post", 500));
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
