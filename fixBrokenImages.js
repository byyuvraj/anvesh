import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

const verifiedImages = [
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200',
  'https://images.unsplash.com/photo-1593693397690-362bceb63750?q=80&w=1200',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200',
  'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200',
  'https://images.unsplash.com/photo-1600100397608-f010f4198f58?q=80&w=1200',
  'https://images.unsplash.com/photo-1582236081498-f2b7407dd293?q=80&w=1200',
  'https://images.unsplash.com/photo-1620959458999-56fb083bdfd8?q=80&w=1200',
  'https://images.unsplash.com/photo-1581458925433-28956bbaeb09?q=80&w=1200',
  'https://images.unsplash.com/photo-1599661559905-2b47fc32d849?q=80&w=1200',
  'https://images.unsplash.com/photo-1626027599723-5e36f78f6a96?q=80&w=1200',
  'https://images.unsplash.com/photo-1627883907106-963a8a3a9686?q=80&w=1200',
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1200',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200',
  'https://images.unsplash.com/photo-1605553072230-6f91f75d506d?q=80&w=1200',
  'https://images.unsplash.com/photo-1549474757-0a4ebad031e6?q=80&w=1200'
];

async function checkUrl(url) {
  if (!url || !url.startsWith('http')) return 404;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
}

function getRandomImage() {
  return verifiedImages[Math.floor(Math.random() * verifiedImages.length)];
}

async function run() {
  console.log('Starting universal image fix...');
  let fixedBlogs = 0;
  let fixedLocs = 0;
  
  // Blogs
  const blogs = await prisma.blog.findMany();
  for (const b of blogs) {
    const status = await checkUrl(b.coverImage);
    if (status !== 200 && status !== 301 && status !== 302) {
      const newImage = getRandomImage();
      await prisma.blog.update({ where: { id: b.id }, data: { coverImage: newImage }});
      fixedBlogs++;
    }
  }

  // Locations
  const locs = await prisma.location.findMany();
  for (const l of locs) {
    const status = await checkUrl(l.imageUrl);
    if (status !== 200 && status !== 301 && status !== 302) {
      const newImage = getRandomImage();
      await prisma.location.update({ where: { id: l.id }, data: { imageUrl: newImage }});
      fixedLocs++;
    }
  }

  console.log(`Fixed ${fixedBlogs} blogs and ${fixedLocs} locations.`);
}

run().finally(() => prisma.$disconnect());
