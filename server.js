const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

require("dotenv").config();

app.use(cors());

//Middleware for handling form data
app.use(express.json());

//DB Configuration
const db = process.env.mongoURI;

mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.use("/api/users", require("./routes/api/users"));
app.use("/api/confirmation", require("./routes/api/confirmation"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/forgot", require("./routes/api/forgot"));
app.use("/api/onboard", require("./routes/api/onboard"));
app.use("/api/paystack-events", require("./routes/api/paystack-events"));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
