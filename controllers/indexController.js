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
  res.send(root);
};

module.exports = { getRoot };
