import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
}

async function run() {
  const blogs = await prisma.blog.findMany();
  for (const b of blogs) {
    if (b.coverImage) {
      const status = await checkUrl(b.coverImage);
      if (status !== 200 && status !== 301 && status !== 302) {
        console.log('Broken Blog Image:', b.title, b.coverImage, 'Status:', status);
      }
    }
  }
  console.log('Blog images check complete.');
}
run().finally(() => prisma.$disconnect());
