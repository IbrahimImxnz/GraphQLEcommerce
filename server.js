const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config");

connectDB();

const port = 443 || process.env.PORT;
app.listen(port, () => console.log(`server running on ${port}`));
