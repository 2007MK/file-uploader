const { prisma } = require("../lib/prisma");

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
      return res.status(403).send("Forbidden: You do not own the parent folder");
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
module.exports = { getRoot, getFolder, createFolder };
