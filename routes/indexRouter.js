const express = require("express");
const { Router } = express;

const indexRouter = Router();

indexRouter.get("/", (req, res) => {
  res.render("index");
});

module.exports = indexRouter;
