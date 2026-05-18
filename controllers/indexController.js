const { prisma } = require("../lib/prisma");
const multer = require("multer");
const path = require("path");

const getRoot = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) return res.redirect("/login");
    const root = await prisma.folder.findFirst({
      where: {
        userId: req.user.id,
        name: "root",
        parentId: null,
      },
      include: {
        files: true,
        children: true,
      },
    });
    res.render("folder", { folder: root });
  } catch (err) {
    next(err);
  }
};

const getFolder = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) return res.redirect("/login");
    const { id } = req.params;
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        files: true,
        children: true,
      },
    });
    if (!folder) return res.status(404).send("Folder not found");
    res.render("folder", { folder });
  } catch (err) {
    next(err);
  }
};

const createFolder = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) return res.redirect("/login");
    const { parentId } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).send("Folder name is required");
    }

    // Verify parent folder ownership to prevent IDOR
    const parentFolder = await prisma.folder.findFirst({
      where: {
        id: parentId,
        userId: req.user.id,
      },
    });

    if (!parentFolder) {
      return res
        .status(403)
        .send("Forbidden: You do not own the parent folder");
    }

    const newFolder = await prisma.folder.create({
      data: {
        name: name.trim(),
        parentId,
        userId: req.user.id,
      },
    });
    res.redirect(`/folder/${parentId}`);
  } catch (err) {
    next(err);
  }
};

const getNewFile = (req, res) => {
  const { parentId } = req.params;
  res.render("newFile", { parentId });
};

const PATH = "uploads";

// For giving proper filenames instead of random generated text without extensions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PATH);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage });

const postNewFile = [
  upload.single("uploaded_file"),
  async (req, res) => {
    const { parentId } = req.params;
    await prisma.file.create({
      data: {
        name: req.file.originalname,
        path: PATH,
        folderId: parentId,
      },
    });
    res.redirect(`/folder/${parentId}`);
  },
];
module.exports = { getRoot, getFolder, createFolder, getNewFile, postNewFile };
