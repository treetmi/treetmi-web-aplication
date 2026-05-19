const prisma = require('./src/config/prisma');
const projectService = require('./src/services/project.service');

async function run() {
  console.log("Starting DB verification...");
  try {
    // 1. Check database connection
    await prisma.$connect();
    console.log("Prisma Connected: OK");

    // 2. Fetch first user in DB to get a valid streamer ID
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found in database!");
      return;
    }
    console.log(`Found User: ${user.username} (${user.id})`);

    // 3. Query projects
    console.log("Querying project assets...");
    const projects = await projectService.getProjectsByStreamer(user.id);
    console.log("Query success! Projects count:", projects.length);
  } catch (err) {
    console.error("DB EXCEPTION CAPTURED:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

run();
