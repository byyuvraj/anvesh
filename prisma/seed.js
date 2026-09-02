import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { users, locationHierarchy } from './seedData.js';
import { newLocations } from './newLocations.js';
import { getStoriesPart1 } from './storiesPart1.js';
import { getStoriesPart2 } from './storiesPart2.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. CLEAR EXISTING DATA (Respecting Foreign Keys)
  console.log('🧹 Clearing existing data...');
  await prisma.comment.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.itinerary.deleteMany({});
  // Locations can self-reference, so deleteMany might fail if not done carefully.
  // Prisma handles cascading deletes if configured, but to be safe:
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Location" CASCADE;`);
  await prisma.user.deleteMany({});
  console.log('✅ Database cleared.');

  // 2. SEED USERS
  console.log('👤 Seeding users...');
  const usersMap = {}; // Maps username to real DB ID
  const salt = await bcrypt.genSalt(10);
  
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.passwordHash, salt);
    const createdUser = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        username: u.username,
        travelStyle: u.travelStyle,
        bio: u.bio,
        profilePicture: u.profilePicture,
        onboardingComplete: u.onboardingComplete,
        placesVisitedCount: Math.floor(Math.random() * 20),
      }
    });
    usersMap[u.username] = createdUser.id;
  }
  console.log(`✅ Inserted ${users.length} users.`);

  // 3. SEED LOCATIONS (Hierarchy)
  console.log('📍 Seeding locations...');
  const locationsMap = {}; // Maps location name to real DB ID
  
  const allLocations = [...locationHierarchy, ...newLocations];

  for (const state of allLocations) {
    const createdState = await prisma.location.create({
      data: {
        name: state.name,
        type: state.type,
      }
    });
    locationsMap[state.name] = createdState.id;

    if (state.children) {
      for (const child of state.children) {
        const createdChild = await prisma.location.create({
          data: {
            name: child.name,
            type: child.type,
            description: child.description,
            parentId: createdState.id // Link to state
          }
        });
        locationsMap[child.name] = createdChild.id;
      }
    }
  }
  console.log('✅ Inserted locations.');

  // 4. SEED BLOGS (Stories)
  console.log('📝 Seeding blogs...');
  const blogs1 = getStoriesPart1(usersMap, locationsMap);
  const blogs2 = getStoriesPart2(usersMap, locationsMap);
  const blogsToInsert = [...blogs1, ...blogs2];
  const createdBlogs = [];
  
  for (const blog of blogsToInsert) {
    if (!blog.userId || !blog.locationId) {
       console.log(`Skipping blog: ${blog.title} - Missing user or location`);
       continue;
    }
    const created = await prisma.blog.create({
      data: {
        title: blog.title,
        richContent: blog.richContent,
        coverImage: blog.coverImage,
        userId: blog.userId,
        locationId: blog.locationId
      }
    });
    createdBlogs.push(created);
  }
  console.log(`✅ Inserted ${createdBlogs.length} blogs.`);

  // 5. SEED EXPERIENCES
  console.log('🌟 Seeding experiences...');

  // 6. SEED ITINERARIES
  console.log('🗺️ Seeding itineraries...');

  // 7. SEED CONTEXTUAL COMMENTS
  console.log('💬 Seeding contextual comments...');
  
  // Specific contextual comments for the rich blogs
  const commentTemplates = [
    "I was just there last month and experienced exactly this. The part about {detail} is so true!",
    "Wow, I had no idea about {detail}. Adding this to my bucket list.",
    "This is so detailed! Did you happen to find {detail} difficult to manage?",
    "I completely agree. Everyone rushes to the famous spots, but {detail} is where the real magic is.",
    "Such beautiful formatting and photos. I tried doing a similar trip in 2022 but {detail} stopped me. Glad you made it!",
    "Thank you for this guide! The tip about {detail} just saved me a lot of trouble for my upcoming trip.",
    "This is why I love Anvesh. You won't find deep insights like {detail} on generic travel blogs.",
    "Incredible storytelling. I felt like I was right there with you during {detail}."
  ];

  // Helper to extract a detail from the blog's content
  const extractDetail = (content) => {
    const match = content.match(/<strong>(.*?)<\/strong>/);
    return match ? match[1] : 'the local culture';
  };

  const userIds = Object.values(usersMap);
  let commentCount = 0;

  for (const blog of createdBlogs) {
    // Add 3-5 comments per blog
    const numComments = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < numComments; i++) {
      const template = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
      const detail = extractDetail(blog.richContent);
      const commentText = template.replace('{detail}', detail);
      
      const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
      
      // Don't comment on own post
      if (randomUser === blog.userId) continue;

      await prisma.comment.create({
        data: {
          text: commentText,
          userId: randomUser,
          blogId: blog.id
        }
      });
      commentCount++;
    }
  }
  
  console.log(`✅ Inserted ${commentCount} contextual comments.`);
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
