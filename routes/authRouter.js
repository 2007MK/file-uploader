const express = require("express");
const passport = require("passport");
const { prisma } = require("../lib/prisma");
const { Router } = express;
const {
  getLogin,
  postLogin,
  logout,
  postSignup,
  getSignup,
} = require("../controllers/authController");

const authRouter = Router();

authRouter.get("/signup", getSignup);

authRouter.post("/signup", postSignup);

authRouter.get("/login", getLogin);
authRouter.post("/login", postLogin);

authRouter.get("/logout", logout);

module.exports = authRouter;
