import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const staticImages = [
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200', // India general
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1200', // Mountains
  'https://images.unsplash.com/photo-1622308644420-a68138db5bb5?q=80&w=1200', // Beach
  'https://images.unsplash.com/photo-1600100397608-f010f4198f58?q=80&w=1200', // Ruins
  'https://images.unsplash.com/photo-1593693397690-362bceb63750?q=80&w=1200', // Kerala tea
  'https://images.unsplash.com/photo-1616422285623-1498b3fdfa8e?q=80&w=1200', // Spiti
  'https://images.unsplash.com/photo-1599661559905-2b47fc32d849?q=80&w=1200', // Jaipur
  'https://images.unsplash.com/photo-1626027599723-5e36f78f6a96?q=80&w=1200', // Meghalaya
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1200', // Lake
  'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200', // Flowers/hills
];

async function main() {
  console.log('Fixing broken images...');
  const blogs = await prisma.blog.findMany({
    where: {
      coverImage: {
        contains: 'random'
      }
    }
  });

  console.log(`Found ${blogs.length} blogs with random unsplash URLs.`);

  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    const newImage = staticImages[i % staticImages.length];
    
    await prisma.blog.update({
      where: { id: blog.id },
      data: { coverImage: newImage }
    });
  }
  console.log('Images fixed!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
