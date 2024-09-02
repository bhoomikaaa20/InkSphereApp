const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const expressFileUpload = require("express-fileupload");

const userRoutes = require("./routes/userRoutes.js");
const postRoutes = require("./routes/postRoutes.js");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");

dotenv.config();
const app = express();
app.use(express.json());
app.use(expressFileUpload());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.urlencoded({ extended: true }));

// Updated CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://coruscating-syrniki-b735a3.netlify.app",
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Listening to server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});

// Connection to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then((res) => console.log("Connected to db"))
  .catch((err) => console.log(err));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use(notFound);
app.use(errorHandler);
