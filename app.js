const express = require("express");
const app = express();
require("dotenv").config();
const { prisma } = require("./lib/prisma.js");
const indexRouter = require("./routes/indexRouter.js");
const authRouter = require("./routes/authRouter.js");
const session = require("express-session");
const passport = require("passport");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

// session store to work with prisma
const sessionStore = new PrismaSessionStore(prisma, {
  checkPeriod: 2 * 60 * 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: false,
});

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET || "harvey specter",
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// for working of passportjs
require("./lib/passport.js");
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  ((res.locals.errors = []),
    (res.locals.body = []),
    (res.locals.currentUser = req.user));
  next();
});

// Routes

app.use((req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  next();
});

app.use("/", authRouter);
app.use("/", indexRouter);

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).send("Something went wrong");
});

app.listen(3000, (err) => {
  if (err) throw err;
  console.log("Server started succesfully!");
});
