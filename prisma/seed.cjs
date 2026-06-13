const { PrismaClient } = require("@prisma/client");
const { importPosts } = require("../scripts/import-posts.cjs");

const prisma = new PrismaClient();

async function main() {
  const result = await importPosts({
    prisma
  });

  console.log(`Seed completed: ${result.imported} Markdown post(s) imported.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
