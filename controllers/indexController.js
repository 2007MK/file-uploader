const { prisma } = require("../lib/prisma");

const getRoot = async (req, res) => {
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
};

const getFolder = async (req, res) => {
  if (!req.isAuthenticated) return res.redirect("/login");
  const { id } = req.params;
  const folder = await prisma.folder.findFirst({
    where: {
      id,
    },
    include: {
      files: true,
      children: true,
    },
  });
  res.render("folder", { folder });
};

const createFolder = async (req, res) => {
  const { parentId } = req.params;
  const newFolder = await prisma.folder.create({
    data: {
      name: req.body.name,
      parentId,
      userId: req.user.id,
    },
  });
  res.redirect(`/folder/${parentId}`);
};
module.exports = { getRoot, getFolder, createFolder };
