const express = require('express');
const app = express();
const mongoose = require("mongoose");
const indexRouter = require("./routes/index");
require('dotenv').config();

mongoose
  .connect(
    "mongodb+srv://mdsamiransari2000_db_user:TY1vJSbN2ouEAhQ2@cluster0.ifv8yr1.mongodb.net/?appName=Cluster0",
  )
  .then(() => console.log("Mongoose UserDB connected successfully"))
  .catch((err) => console.log("10-->",err));
const PORT = 8080;
app.use(express.json());  // ✅ first
app.use(express.urlencoded({ extended: true }));
app.use("/",indexRouter);

app.listen(PORT,()=>console.log(`Server is running on localhost: ${PORT}`));