const passport = require("passport");
const { prisma } = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const { body, validationResult, matchedData } = require("express-validator");
const { validateLogin } = require("../lib/validator");

const validateSignup = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username should be between 3 and 20 characters")
    .toLowerCase()
    .custom(async (value) => {
      const user = await prisma.user.findFirst({
        where: { username: value },
      });
      if (user) throw new Error("Username already exists");
    }),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value != req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
];

module.exports.getLogin = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");
  res.render("login");
};

module.exports.getSignup = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");
  res.render("signup");
};

module.exports.postLogin = [
  validateLogin,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("login", { errors: errors.array() });
    }

    // manual method to verify the user, and for easy error handling.
    const verify = passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.render("login", { error: info.message });

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect("/");
      });
    });
    // this line is added because, passport.authenticate(...) returns a function... and the below line calls that function.
    verify(req, res, next);
  },
];

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

module.exports.postSignup = [
  validateSignup,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("signup", { errors: errors.array(), body: req.body });
    }

    const { username, password } = matchedData(req);
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          folders: {
            create: {
              name: "root",
              parentId: null,
            },
          },
        },
      });
      res.redirect("/login");
    } catch (err) {
      next(err);
    }
  },
];
