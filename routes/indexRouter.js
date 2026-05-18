const express = require("express");
const { Router } = express;
const {
  getRoot,
  getFolder,
  createFolder,
  getNewFile,
  postNewFile,
} = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/", (req, res) => res.render("index"));

indexRouter.get("/root", getRoot);
indexRouter.get("/folder/:id", getFolder);

indexRouter.get("/folder/:parentId/new", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  const { parentId } = req.params;
  res.render("newFolder", { parentId });
});

indexRouter.post("/folder/:parentId/new", createFolder);

indexRouter.get("/folder/:parentId/upload", getNewFile);
indexRouter.post("/folder/:parentId/upload", postNewFile);

module.exports = indexRouter;
