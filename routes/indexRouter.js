const express = require("express");
const { Router } = express;
const { getRoot } = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/", (req, res) => res.render("index"));
indexRouter.get("/root", getRoot);

module.exports = indexRouter;
