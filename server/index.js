const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const expressFileUpload = require("express-fileupload");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
app.use(express.json());
app.use(expressFileUpload());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Updated CORS configuration
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://inksphereapplication.netlify.app", // Deployed frontend
];

app.use(
  cors({
    credentials: true, // Enable cookies and headers
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow no-origin requests
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy does not allow access from origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Handle preflight requests
app.options("*", cors());

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8084;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));
