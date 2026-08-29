import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { users, locationHierarchy, generateBlogs } from './seedData.js';
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
  console.log('📝 Seeding blogs and itineraries...');
  const blogs1 = generateBlogs(usersMap, locationsMap);
  const blogs2 = getStoriesPart1(usersMap, locationsMap);
  const blogs3 = getStoriesPart2(usersMap, locationsMap);
  const blogsToInsert = [...blogs1, ...blogs2, ...blogs3];
  const createdBlogs = [];
  
  for (const blog of blogsToInsert) {
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
  console.log(`✅ Inserted ${blogsToInsert.length} blogs.`);

  // 5. SEED COMMENTS
  console.log('💬 Seeding comments...');
  const userIds = Object.values(usersMap);
  const genericComments = [
    "This is so helpful, thanks for sharing!",
    "Wow, adding this to my bucket list.",
    "Did you feel safe traveling alone here?",
    "Great itinerary! How much did the flights cost?",
    "I was there last year, absolutely loved it.",
    "Can't agree more with your points.",
    "Thanks for the honest review.",
    "Beautiful photos!"
  ];

  let commentCount = 0;
  for (const blog of createdBlogs) {
    // Add 1 to 4 random comments to each blog
    const numComments = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numComments; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const randomText = genericComments[Math.floor(Math.random() * genericComments.length)];
      
      await prisma.comment.create({
        data: {
          text: randomText,
          userId: randomUserId,
          blogId: blog.id
        }
      });
      commentCount++;
    }
  }
  console.log(`✅ Inserted ${commentCount} comments.`);
  
  console.log('🎉 Seeding complete! Database is flooded with genuine data.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
