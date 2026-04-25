const { prisma } = require("./lib/prisma.js");
const bcrypt = require("bcryptjs");

async function main() {
  await prisma.user.deleteMany();

  const newUser = await prisma.user.create({
    data: {
      username: "test",
      password: bcrypt.hashSync("test", 10),
      folders: {
        create: {
          name: "test-folder",
          files: {
            create: {
              name: "test.txt",
              path: "/test.txt",
            },
          },
        },
      },
    },
    include: {
      folders: true,
    },
  });

  console.log(newUser);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
