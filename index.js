const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
const authRoutes = require("./routes/authRoute");
const UserRoutes = require("./routes/userRoute");
const movieRoute = require("./routes/movies");
const listRoute = require("./routes/lists");
var cors = require("cors");
var ErrorHandler = require("./customErrorHnadler");
env.config();

const app = express();
app.use(cors());
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/movies", movieRoute);
app.use("/api/lists", listRoute);
app.use(ErrorHandler);
mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongo db connected"))
  .catch(err => console.log(err));

app.listen(8800, () => console.log("server is running"));
