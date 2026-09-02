const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany();
  const blogs = await prisma.blog.findMany();
  const locs = await prisma.location.findMany();
  
  const badUsers = users.filter(u => !u.profilePicture || !u.profilePicture.startsWith('http'));
  const badBlogs = blogs.filter(b => !b.coverImage || !b.coverImage.startsWith('http'));
  const badLocs = locs.filter(l => !l.imageUrl || !l.imageUrl.startsWith('http'));
  
  console.log('Total Users:', users.length, 'Bad Users:', badUsers.length);
  console.log('Total Blogs:', blogs.length, 'Bad Blogs:', badBlogs.length);
  console.log('Total Locs:', locs.length, 'Bad Locations:', badLocs.length);
  
  if(badLocs.length > 0) console.log('Bad locations:', badLocs.map(l => l.name).join(', '));
}

run().then(() => prisma.$disconnect()).catch(console.error);
