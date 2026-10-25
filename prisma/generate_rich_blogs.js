import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { users } from './seedData.js';
import { richLocations } from './richLocations.js';
import { getStoriesPart1 } from './storiesPart1.js';
import { getStoriesPart2 } from './storiesPart2.js';
import { extraAuthenticStories } from './extraStories.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Multifold Authentic Real-Data Seeding & Migration for Anvesh...');

  // 1. CLEAR EXISTING DATA
  console.log('🧹 Purging old data with cascading safety...');
  await prisma.comment.deleteMany({});
  await prisma.blogLike.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.itinerary.deleteMany({});
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Location" CASCADE;`);
  await prisma.user.deleteMany({});
  console.log('✅ Clean slate prepared.');

  // 2. SEED USERS WITH RICH PERSONAS
  console.log('👤 Seeding 30 diverse traveler personas...');
  const salt = await bcrypt.genSalt(10);
  const usersMap = {}; // username -> user record
  const userList = [];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.passwordHash || 'password123', salt);
    const budgetPrefs = ['Budget', 'Mid-range', 'Luxury'];
    const vibes = ['Adventure', 'Heritage', 'Culinary', 'Nature', 'Relaxation', 'Backpacker'];
    const assignedBudget = u.travelStyle === 'Luxury' ? 'Luxury' : (u.travelStyle === 'Backpacker' ? 'Budget' : budgetPrefs[Math.floor(Math.random() * budgetPrefs.length)]);
    const assignedVibe = u.travelStyle === 'Adventure' ? 'Adventure' : (u.travelStyle === 'History Buff' ? 'Heritage' : (u.travelStyle === 'Foodie' ? 'Culinary' : vibes[Math.floor(Math.random() * vibes.length)]));

    const created = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        username: u.username,
        travelStyle: u.travelStyle,
        bio: u.bio,
        profilePicture: u.profilePicture,
        onboardingComplete: true,
        placesVisitedCount: Math.floor(Math.random() * 18) + 4,
        budgetPreference: assignedBudget,
        preferredVibe: assignedVibe
      }
    });
    usersMap[u.username] = created;
    userList.push(created);
  }
  console.log(`✅ 30 traveler user profiles created with distinct travel personas.`);

  // 3. SEED LOCATIONS HIERARCHY
  console.log('📍 Seeding geographical hierarchy...');
  const locationsMap = {}; // name -> id

  for (const state of richLocations) {
    const createdState = await prisma.location.create({
      data: {
        name: state.name,
        type: state.type,
        description: state.description || `${state.name} region, India`
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
            parentId: createdState.id
          }
        });
        locationsMap[child.name] = createdChild.id;
      }
    }
  }
  console.log(`✅ Nested locations (States, Cities, Villages, Hidden Gems) initialized.`);

  // 4. COLLECT ALL BLOGS (50 Original + 120 New Authentic Extra Stories = 170 Stories)
  console.log('✍️ Assembling 170 authentic real-world travel blogs...');
  
  const p1 = getStoriesPart1(usersMap, locationsMap);
  const p2 = getStoriesPart2(usersMap, locationsMap);
  const baseOriginals = [...p1, ...p2];

  const enrichedOriginals = baseOriginals.map((b, idx) => {
    const userKeys = Object.keys(usersMap);
    const assignedUser = usersMap[userKeys[idx % userKeys.length]];
    
    let tags = b.tags && b.tags.length > 0 ? b.tags : [];
    if (tags.length === 0) {
      const titleLower = b.title.toLowerCase();
      if (titleLower.includes('spiti') || titleLower.includes('leh') || titleLower.includes('lake') || titleLower.includes('altitude')) {
        tags = ['#HighAltitude', '#Himalayas', '#Offbeat', '#Adventure', '#BudgetTravel'];
      } else if (titleLower.includes('scuba') || titleLower.includes('beach') || titleLower.includes('goa') || titleLower.includes('island')) {
        tags = ['#Coastal', '#IslandVibes', '#Nature', '#ScubaDiving', '#SlowTravel'];
      } else if (titleLower.includes('hampi') || titleLower.includes('temple') || titleLower.includes('fort') || titleLower.includes('heritage')) {
        tags = ['#Heritage', '#HistoryBuff', '#Architecture', '#Monoliths', '#Culture'];
      } else if (titleLower.includes('food') || titleLower.includes('biryani') || titleLower.includes('tea') || titleLower.includes('eat')) {
        tags = ['#Culinary', '#StreetFood', '#FoodieTrail', '#LocalCuisine', '#Authentic'];
      } else {
        tags = ['#CommunityStory', '#RealTravel', '#ExploreIndia', '#Offbeat', '#Wanderlust'];
      }
    }

    const cleanText = b.richContent.replace(/<[^>]+>/g, '');
    const readingTime = Math.max(3, Math.ceil(cleanText.length / 850));
    const aiSummary = b.aiSummary || `An authentic community journal on ${b.title}, sharing practical tips, route details, and local advice.`;

    return {
      id: crypto.randomUUID(),
      title: b.title,
      richContent: b.richContent,
      coverImage: b.coverImage || null,
      userId: assignedUser.id,
      locationId: b.locationId || locationsMap['Himachal Pradesh'],
      tags,
      readingTime,
      aiSummary
    };
  });

  const extraStoriesList = extraAuthenticStories(usersMap, locationsMap).map(b => ({
    ...b,
    id: crypto.randomUUID()
  }));

  const allBlogsData = [...enrichedOriginals, ...extraStoriesList];
  console.log(`📦 Total curated stories to batch insert: ${allBlogsData.length}`);

  // Batch insert all blogs
  await prisma.blog.createMany({
    data: allBlogsData
  });
  console.log(`✅ Inserted ${allBlogsData.length} blogs in 1 query!`);

  // 5. BATCH GENERATE SOCIAL SIGNALS (Likes, Bookmarks, Comments)
  console.log('❤️ Generating batch engagement (Likes, Bookmarks, Comments)...');
  const allLikes = [];
  const allBookmarks = [];
  const allComments = [];

  const commentPool = [
    "This is so helpful! What bus did you take from the junction, and how much did it cost?",
    "Can confirm the homestay host mentioned here is an absolute gem. Her homecooked meals are unforgettable.",
    "Is an inner line permit required for solo travelers on this exact trail?",
    "Saved to my bucket list! Visiting in late October. Is the mountain pass generally open then?",
    "Incredible photography and raw writeup. So refreshing to read real experiences instead of commercial sponsored lists.",
    "How was mobile network connectivity here? Was Jio or Airtel working for emergency UPI payments?",
    "The local food recommendation was spot on. Had the exact same dish when I traveled last monsoon.",
    "Did you rent a scooter locally or rely on shared cabs? Planning my budget right now.",
    "Thanks for the tip about AMS. So many people underestimate the altitude shock.",
    "The sunrise view from this ridge must be unreal in early November.",
    "Bookmarked this for my winter road trip! Are snow chains required for tires?"
  ];

  for (const b of allBlogsData) {
    // 4-8 likes per blog
    const likers = userList.filter(u => u.id !== b.userId).sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 4);
    for (const liker of likers) {
      allLikes.push({
        userId: liker.id,
        blogId: b.id
      });
    }

    // 2-5 bookmarks per blog
    const bookmarkers = userList.filter(u => u.id !== b.userId).sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2);
    for (const bm of bookmarkers) {
      allBookmarks.push({
        userId: bm.id,
        blogId: b.id
      });
    }

    // 2-3 comments per blog
    const commenters = userList.filter(u => u.id !== b.userId).sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2);
    for (const c of commenters) {
      allComments.push({
        userId: c.id,
        blogId: b.id,
        text: commentPool[Math.floor(Math.random() * commentPool.length)]
      });
    }
  }

  // Batch insert likes, bookmarks, and comments
  await prisma.blogLike.createMany({
    data: allLikes,
    skipDuplicates: true
  });
  console.log(`✅ Batch inserted ${allLikes.length} likes.`);

  await prisma.bookmark.createMany({
    data: allBookmarks,
    skipDuplicates: true
  });
  console.log(`✅ Batch inserted ${allBookmarks.length} bookmarks.`);

  await prisma.comment.createMany({
    data: allComments
  });
  console.log(`✅ Batch inserted ${allComments.length} comments.`);

  console.log(`🎉 SUCCESS! Seeded ${allBlogsData.length} rich community blogs with verified tags, reading times, aiSummaries, likes, bookmarks, and genuine comments!`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
