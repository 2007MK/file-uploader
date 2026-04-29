const express = require("express");
const { Router } = express;
const {
  getRoot,
  getFolder,
  createFolder,
} = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/", (req, res) => res.render("index"));

indexRouter.get("/root", getRoot);
indexRouter.get("/folder/:id", getFolder);

indexRouter.get("/folder/:parentId/new", (req, res) => {
  const { parentId } = req.params;
  res.render("newFolder", { parentId });
});

indexRouter.post("/folder/:parentId/new", createFolder);

module.exports = indexRouter;
