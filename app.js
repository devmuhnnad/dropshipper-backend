const express = require("express");
const jwt = require("jsonwebtoken");
const { searchForTag } = require("./lib/hashtag");
var cors = require("cors");

const app = express();
const port = 80;

app.use(express.json());

//cors

app.use(cors());

//routes
const Services = require("./services");
app.use("/services", Services);

//auth

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing email or password" });

  if (email != "muhnnadhabib@gmail.com" || password != "123456") {
    return res
      .status(400)
      .json({ success: false, message: "Wrong email or password" });
  }

  res.status(200).json({
    success: true,
    token: jwt.sign(
      {
        id: 1,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      "secret123"
    ),
  });
});

app.listen(port, () => {
  console.log("listening on port 80");
});
