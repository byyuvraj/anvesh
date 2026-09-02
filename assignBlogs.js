import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const aarav = await prisma.user.findUnique({ where: { email: 'aarav@test.com' } });
  if (!aarav) return console.log('Aarav not found');
  
  const blogs = await prisma.blog.findMany({ take: 8 });
  for (let b of blogs) {
    await prisma.blog.update({
      where: { id: b.id },
      data: { userId: aarav.id }
    });
  }
  
  console.log('Successfully assigned 8 blogs to Aarav!');
}

run().finally(() => prisma.$disconnect());
