const express = require("express");
const jwt = require("jsonwebtoken");
const { searchForTag } = require("./lib/hashtag");
const { search } = require("./lib/search");

const router = express.Router();

/* router.use((req, res, next) => {
  //auth
  const token = req.headers["token"];
  if (!token)
    return res.status(401).json({ success: false, message: "unauthorized" });

  if (!jwt.verify(token, "secret123"))
    return res.status(401).json({ success: false, message: "unauthorized" });

  next();
}); */

router.get("/tag/:tag", async (req, res) => {
  const cursor = req.query.cursor || 0;
  const data = await searchForTag(req.params.tag, cursor);

  const list = data.itemList || [];

  res.status(200).json({
    success: true,
    cursor: data.cursor || 0,
    data: list,
  });
});

router.get("/search/:keyword", async (req, res) => {
    const cursor = req.query.cursor || 12;

  const { data } = await search(req.params.keyword, cursor);

  res.status(200).json({
    success: true,
    data: data || [],
  });
});

module.exports = router;
