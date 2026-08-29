import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const imageMapping = {
  'Spiti Valley': 'https://images.unsplash.com/photo-1616422285623-1498b3fdfa8e?q=80&w=1200',
  'Leh': 'https://images.unsplash.com/photo-1581458925433-28956bbaeb09?q=80&w=1200',
  'Ladakh': 'https://images.unsplash.com/photo-1581458925433-28956bbaeb09?q=80&w=1200',
  'Pangong Tso': 'https://images.unsplash.com/photo-1582236081498-f2b7407dd293?q=80&w=1200',
  'Nubra Valley': 'https://images.unsplash.com/photo-1620959458999-56fb083bdfd8?q=80&w=1200',
  'Munnar': 'https://images.unsplash.com/photo-1593693397690-362bceb63750?q=80&w=1200',
  'Kerala': 'https://images.unsplash.com/photo-1593693397690-362bceb63750?q=80&w=1200',
  'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200',
  'Arambol': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200',
  'Palolem': 'https://images.unsplash.com/photo-1549474757-0a4ebad031e6?q=80&w=1200',
  'Hampi': 'https://images.unsplash.com/photo-1600100397608-f010f4198f58?q=80&w=1200',
  'Jaipur': 'https://images.unsplash.com/photo-1599661559905-2b47fc32d849?q=80&w=1200',
  'Rajasthan': 'https://images.unsplash.com/photo-1599661559905-2b47fc32d849?q=80&w=1200',
  'Jaisalmer': 'https://images.unsplash.com/photo-1549474757-0a4ebad031e6?q=80&w=1200',
  'Cherrapunji': 'https://images.unsplash.com/photo-1626027599723-5e36f78f6a96?q=80&w=1200',
  'Meghalaya': 'https://images.unsplash.com/photo-1626027599723-5e36f78f6a96?q=80&w=1200',
  'Rishikesh': 'https://images.unsplash.com/photo-1627883907106-963a8a3a9686?q=80&w=1200',
  'Valley of Flowers': 'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200',
  'Auli': 'https://images.unsplash.com/photo-1605553072230-6f91f75d506d?q=80&w=1200',
  'Uttarakhand': 'https://images.unsplash.com/photo-1627883907106-963a8a3a9686?q=80&w=1200',
  'Gangtok': 'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200',
  'Sikkim': 'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200',
  'Gurudongmar Lake': 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1200',
  'Havelock': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200',
  'Andaman Islands': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200',
};

const defaultImage = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200';

async function main() {
  console.log('Running Smart Image Fixer...');
  const blogs = await prisma.blog.findMany({
    include: { location: true }
  });

  console.log(`Analyzing ${blogs.length} blogs for image correction...`);

  let fixedCount = 0;
  for (const blog of blogs) {
    let targetImage = defaultImage;

    // Check if the blog's location name exists in our map
    if (blog.location && imageMapping[blog.location.name]) {
      targetImage = imageMapping[blog.location.name];
    } else {
      // Fallback: check if title contains a mapped keyword
      for (const [key, url] of Object.entries(imageMapping)) {
        if (blog.title.toLowerCase().includes(key.toLowerCase())) {
          targetImage = url;
          break;
        }
      }
    }

    // Check if the current coverImage is one of the mapped ones, or if it's missing/random
    const isMappedImage = Object.values(imageMapping).includes(blog.coverImage) || blog.coverImage === defaultImage;
    const isRightImage = blog.coverImage === targetImage;

    if (!blog.coverImage || blog.coverImage.includes('random') || (!isRightImage && isMappedImage)) {
      await prisma.blog.update({
        where: { id: blog.id },
        data: { coverImage: targetImage }
      });
      fixedCount++;
    }
  }
  
  console.log(`Successfully mapped and fixed ${fixedCount} blog images.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
