import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { RecommendationEngine } from './recommendationEngine.js';
import { resolveDestination, getWmoCondition, generatePackingTips } from './weatherService.js';

dotenv.config();

// Unified resilient Gemini caller with automatic model fallback
async function callGemini(prompt, systemInstruction = null) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("No GEMINI_API_KEY set");
  const ai = new GoogleGenerativeAI(key);
  
  // gemini-3.5-flash-lite is high-speed and officially active; fall back to flash or pro if needed
  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
  let lastErr = null;

  for (const m of models) {
    try {
      const config = { model: m };
      if (systemInstruction) config.systemInstruction = systemInstruction;
      const model = ai.getGenerativeModel(config);
      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch (e) {
      lastErr = e;
      console.warn(`Gemini model ${m} attempt failed, trying next:`, e.message);
    }
  }
  throw lastErr || new Error("All Gemini models failed");
}

const app = express();

let prisma;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'anvesh_jwt_super_secret';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// File uploading is now handled directly by passing compressed Base64 strings to /api/auth/profile

// --- Auth Middleware ---
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// --- AI & Data Features ---

// AI Itinerary Generator
app.post('/api/ai/itinerary', async (req, res) => {
  try {
    const { destination, days, vibe, budget, groupSize } = req.body;
    
    if (!destination || !days) {
      return res.status(400).json({ error: 'Destination and days are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Mocked fallback for Viva presentation if API key fails
      return res.json({
        title: `Your ${days}-Day ${vibe || 'Epic'} Trip to ${destination}`,
        days: Array.from({ length: parseInt(days) }).map((_, i) => ({
          day: i + 1,
          theme: "Exploring the Highlights",
          activities: [
            { time: "09:00 AM", activity: "Local Breakfast & Orientation", cost: "Low" },
            { time: "11:00 AM", activity: "Main Attraction Visit", cost: "Medium" },
            { time: "02:00 PM", activity: "Lunch at a traditional spot", cost: "Medium" },
            { time: "04:00 PM", activity: "Leisure Walk / Shopping", cost: "Low" },
            { time: "07:30 PM", activity: "Dinner & Nightlife", cost: "High" }
          ],
          dailyTip: "Stay hydrated and wear comfortable walking shoes!"
        }))
      });
    }

    const prompt = `
      You are an expert AI travel planner. Create a highly detailed, ${days}-day itinerary for ${destination}.
      Preferences:
      - Vibe: ${vibe || 'Balanced'}
      - Budget: ${budget || 'Moderate'}
      - Group Size: ${groupSize || 'Solo'}
      
      Respond EXACTLY with the following JSON structure (NO MARKDOWN WRAPPERS, RAW JSON ONLY):
      {
        "title": "A catchy title for the trip",
        "days": [
          {
            "day": 1,
            "theme": "Theme of the day (e.g. History & Culture)",
            "activities": [
              { "time": "09:00 AM", "activity": "Specific Activity Details", "cost": "Estimated Cost (e.g. $20 or Low)" }
            ],
            "dailyTip": "A useful tip for this specific day"
          }
        ]
      }
    `;

    const rawResponse = await callGemini(prompt);
    let rawText = rawResponse.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/```json/, '').replace(/```/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/```/g, '').trim();
    }
    
    const parsedItinerary = JSON.parse(rawText);
    res.json(parsedItinerary);

  } catch (error) {
    console.error('AI Itinerary Error:', error);
    res.status(500).json({ error: 'Failed to generate itinerary. Try again later.' });
  }
});

// --- Profile Update Route ---
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { profilePicture, coverPhoto } = req.body;
    
    // Only update fields that are provided
    const updateData = {};
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (coverPhoto !== undefined) updateData.coverPhoto = coverPhoto;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, email: true, username: true, travelStyle: true, bio: true, profilePicture: true, coverPhoto: true }
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// --- Authentication Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username, travelStyle, bio } = req.body;
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ error: 'Email already in use' });

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) return res.status(400).json({ error: 'Username already taken' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: { email, passwordHash, username, travelStyle, bio }
    });

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: newUser.id, email: newUser.email, username: newUser.username, travelStyle: newUser.travelStyle, bio: newUser.bio, profilePicture: newUser.profilePicture, onboardingComplete: newUser.onboardingComplete }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, travelStyle: user.travelStyle, bio: user.bio, profilePicture: user.profilePicture, onboardingComplete: user.onboardingComplete }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, username: true, travelStyle: true, bio: true, profilePicture: true, coverPhoto: true, createdAt: true, onboardingComplete: true, placesVisitedCount: true, budgetPreference: true, preferredVibe: true }
    });
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Onboarding Route ---
app.post('/api/auth/onboarding', authMiddleware, async (req, res) => {
  try {
    const { travelStyle, placesVisitedCount, budgetPreference, preferredVibe } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        travelStyle,
        placesVisitedCount: parseInt(placesVisitedCount) || 0,
        budgetPreference,
        preferredVibe,
        onboardingComplete: true
      },
      select: { id: true, email: true, username: true, travelStyle: true, onboardingComplete: true, placesVisitedCount: true, budgetPreference: true, preferredVibe: true }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: 'Server error during onboarding' });
  }
});

// --- Blog & Community Routes ---

// Get all blogs (Feed with filters & multi-vector recommendation scoring)
app.get('/api/blogs', async (req, res) => {
  try {
    let { userId, vibe, tag, search, sort } = req.query;
    
    // Also check Authorization header if userId not passed in query
    if (!userId && req.header('Authorization')) {
      try {
        const token = req.header('Authorization').split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
        }
      } catch (e) {}
    }

    // Build comprehensive user interest profile (declared persona + likes + bookmarks + itineraries)
    const userProfile = userId ? await RecommendationEngine.getUserProfile(prisma, userId) : null;

    // Build Prisma where filter
    const whereClause = {};
    if (vibe && vibe.toLowerCase() !== 'all') {
      const v = vibe.toLowerCase();
      whereClause.OR = [
        { tags: { hasSome: [v, `#${v}`, vibe, `#${vibe}`] } },
        { title: { contains: vibe, mode: 'insensitive' } },
        { richContent: { contains: vibe, mode: 'insensitive' } }
      ];
    }

    if (tag) {
      whereClause.tags = { has: tag };
    }

    if (search && search.trim()) {
      const s = search.trim();
      whereClause.OR = [
        ...(whereClause.OR || []),
        { title: { contains: s, mode: 'insensitive' } },
        { richContent: { contains: s, mode: 'insensitive' } },
        { tags: { hasSome: [s, `#${s}`] } },
        { location: { name: { contains: s, mode: 'insensitive' } } }
      ];
    }

    const blogs = await prisma.blog.findMany({
      where: whereClause,
      include: {
        user: { select: { username: true, travelStyle: true, profilePicture: true } },
        location: { select: { name: true, type: true, parent: { select: { name: true } } } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
        ...(userId ? {
          likes: { where: { userId } },
          bookmarks: { where: { userId } }
        } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Multi-Vector Recommendation Scoring
    let blogsWithScores = blogs.map(blog => {
      const scoreResult = RecommendationEngine.scoreBlog(blog, userProfile);
      
      return {
        ...blog,
        matchScore: scoreResult.matchScore,
        matchReason: scoreResult.matchReason,
        scoreBreakdown: scoreResult.scoreBreakdown,
        likesCount: blog._count?.likes || 0,
        commentsCount: blog._count?.comments || 0,
        bookmarksCount: blog._count?.bookmarks || 0,
        isLiked: Boolean(blog.likes && blog.likes.length > 0),
        isBookmarked: Boolean(blog.bookmarks && blog.bookmarks.length > 0)
      };
    });

    if (sort === 'popular') {
      blogsWithScores.sort((a, b) => 
        (b.likesCount * 2 + b.bookmarksCount * 3 + b.commentsCount * 1.5) - 
        (a.likesCount * 2 + a.bookmarksCount * 3 + a.commentsCount * 1.5)
      );
    } else if (sort === 'match' && userProfile) {
      blogsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    res.json(blogsWithScores);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: 'Server error fetching blogs' });
  }
});

// Get single blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    let userId = req.query.userId;
    if (!userId && req.header('Authorization')) {
      try {
        const token = req.header('Authorization').split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
        }
      } catch (e) {}
    }

    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { username: true, travelStyle: true, profilePicture: true, bio: true } },
        location: { select: { name: true, type: true, parent: { select: { name: true } } } },
        comments: {
          include: { user: { select: { username: true, profilePicture: true } } },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
        ...(userId ? {
          likes: { where: { userId } },
          bookmarks: { where: { userId } }
        } : {})
      }
    });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    res.json({
      ...blog,
      likesCount: blog._count?.likes || 0,
      commentsCount: blog._count?.comments || 0,
      bookmarksCount: blog._count?.bookmarks || 0,
      isLiked: Boolean(blog.likes && blog.likes.length > 0),
      isBookmarked: Boolean(blog.bookmarks && blog.bookmarks.length > 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching blog' });
  }
});

// Create a new blog
app.post('/api/blogs', authMiddleware, async (req, res) => {
  try {
    const { title, richContent, coverImage, locationId } = req.body;
    if (!title || !richContent) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    let tags = [];
    let readingTime = 2; // Default fallback
    let aiSummary = "";

    // ---------------------------------------------------------
    // ML FEATURE: Automated Semantic Tagging & Summarization
    // ---------------------------------------------------------
    try {
      if (process.env.GEMINI_API_KEY) {
        const cleanContent = richContent.replace(/<[^>]+>/g, ''); // strip HTML
        
        const prompt = `
          Analyze the following travel blog post titled "${title}".
          Content: ${cleanContent.substring(0, 1500)}...
          
          Provide a JSON response with EXACTLY the following structure (do NOT include markdown code blocks, just raw JSON):
          {
            "tags": ["3 to 5 relevant travel tags like #Adventure, #Budget"],
            "readingTime": <integer representing estimated minutes to read>,
            "summary": "A punchy, 2-sentence summary of this post."
          }
        `;
        
        const rawResponse = await callGemini(prompt);
        let rawText = rawResponse.trim();
        if (rawText.startsWith('```json')) {
           rawText = rawText.replace(/```json/, '').replace(/```/, '').trim();
        } else if (rawText.startsWith('```')) {
           rawText = rawText.replace(/```/g, '').trim();
        }
        const parsed = JSON.parse(rawText);
        
        tags = parsed.tags || [];
        readingTime = parsed.readingTime || Math.ceil(cleanContent.length / 1000);
        aiSummary = parsed.summary || "";
      }
    } catch (aiError) {
      console.error("Failed to auto-tag blog with Gemini:", aiError.message);
      // Fallback
      readingTime = Math.ceil(richContent.replace(/<[^>]+>/g, '').length / 1000) || 2;
    }

    const newBlog = await prisma.blog.create({
      data: {
        userId: req.user.id,
        title,
        richContent,
        coverImage: coverImage || null,
        locationId: locationId || null,
        tags,
        readingTime,
        aiSummary
      }
    });
    res.status(201).json(newBlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating blog' });
  }
});

// --- Location & Recommendation Routes ---

// Get all locations for dropdowns/search
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        parent: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching locations' });
  }
});

// Create a new location (e.g., if a user is writing about a new place)
app.post('/api/locations', authMiddleware, async (req, res) => {
  try {
    const { name, type, parentId, description, imageUrl } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

    const newLoc = await prisma.location.create({
      data: { name, type, parentId: parentId || null, description, imageUrl }
    });
    res.status(201).json(newLoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating location' });
  }
});

// AI Location Insights Route
app.get('/api/locations/:id/insights', async (req, res) => {
  try {
    const locationId = req.params.id;
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        blogs: {
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Prepare context for AI
    const communityTips = location.blogs.map(blog => 
      `@${blog.user.username} says: "${blog.title}. ${blog.richContent.replace(/<[^>]+>/g, '').substring(0, 200)}..."`
    ).join('\\n');

    let aiSummary = '';
    
    try {
      const prompt = `You are an expert travel guide. The user is asking about the location "${location.name}". 
      First, provide a brief, engaging 2-sentence summary about this location from your own knowledge. 
      Second, summarize the following community tips we have about this place, and explicitly cite the usernames (e.g. "As @username mentioned...") telling the reader to check out their full posts. 
      Format the response using HTML (like <h3>, <p>, <ul>, <li>, <strong>) so it can be rendered directly in a rich text container. Don't use markdown code blocks.
      
      Community Tips:
      ${communityTips || 'No community tips yet. Encourage the user to be the first to write one!'}`;

      aiSummary = await callGemini(prompt);
    } catch (aiError) {
      console.error("Gemini AI Error (Invalid Key?):", aiError.message);
      
      // Fallback response if the API key is invalid or request fails
      let fallbackTips = location.blogs.length > 0 
        ? `<ul>${location.blogs.map(b => `<li><strong>@${b.user.username}</strong> shared: <em>${b.title}</em>. Read their post for more details!</li>`).join('')}</ul>` 
        : '<p>Be the first to chart this territory and leave a tip!</p>';
        
      aiSummary = `
        <h3>About ${location.name}</h3>
        <p>${location.description || location.name + ' is a fantastic destination waiting to be explored.'} This is a mocked AI summary because the provided Gemini API key was invalid. Update the key in your .env file for dynamic AI generation!</p>
        <h4 style="margin-top: 1rem; color: #8ab836;">Community Insights</h4>
        <p>Our explorers have shared some amazing tips for this location:</p>
        ${fallbackTips}
      `;
    }

    res.json({ summary: aiSummary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error generating insights' });
  }
});

// The Recommendation Engine: Search for a location and get it + children + related blogs
app.get('/api/recommendations', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query parameter is required' });

    // Find locations matching the query (case-insensitive where possible)
    let locations = await prisma.location.findMany({
      where: { name: { contains: query } },
      include: {
        parent: { select: { name: true } },
        _count: { select: { blogs: true } }, // Count total data points for this location
        children: {
          include: {
            _count: { select: { blogs: true } }, // Count total data points for children
            blogs: {
              include: {
                user: { select: { username: true, profilePicture: true } },
                _count: { select: { comments: true } }
              },
              orderBy: { createdAt: 'desc' },
              take: 5 // Take top 5 recent stories for the child location
            }
          }
        },
        blogs: {
          include: {
            user: { select: { username: true, profilePicture: true } },
            _count: { select: { comments: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Take top 10 recent stories for the main location
        }
      }
    });

    // The core of the recommendation logic:
    // 1. Sort the main locations matched by the number of stories (most data-rich first)
    locations.sort((a, b) => b._count.blogs - a._count.blogs);

    // 2. For each location, sort its children (Villages, Hidden Gems) by the number of community stories.
    // This surfaces the "highest-rated" or most documented hidden gems when a user searches for a broader State/City.
    locations = locations.map(loc => {
      if (loc.children && loc.children.length > 0) {
        loc.children.sort((a, b) => b._count.blogs - a._count.blogs);
      }
      return loc;
    });

    res.json(locations);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ error: 'Server error fetching recommendations' });
  }
});

// Personalized Recommendation Shelves (Curated For You, Hidden Gems, Trending, Based on Activity)
app.get('/api/recommendations/personalized', async (req, res) => {
  try {
    let userId = req.query.userId;
    if (!userId && req.header('Authorization')) {
      try {
        const token = req.header('Authorization').split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
        }
      } catch (e) {}
    }

    const collections = await RecommendationEngine.getCuratedCollections(prisma, userId);
    res.json(collections);
  } catch (err) {
    console.error("Personalized recommendations error:", err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// Content-based Similar Blogs for Reading View
app.get('/api/blogs/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 3;
    const similar = await RecommendationEngine.getSimilarBlogs(prisma, id, limit);
    res.json(similar);
  } catch (err) {
    console.error("Similar blogs error:", err);
    res.status(500).json({ error: "Failed to fetch similar stories" });
  }
});

// Add a comment to a blog
app.post('/api/blogs/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text is required' });

    const newComment = await prisma.comment.create({
      data: {
        text,
        userId: req.user.id,
        blogId: req.params.id
      },
      include: {
        user: { select: { username: true, profilePicture: true } }
      }
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error adding comment' });
  }
});

// --- Likes & Bookmarks Routes ---

// Toggle like for a blog
app.post('/api/blogs/:id/like', authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;
    
    const existing = await prisma.blogLike.findUnique({
      where: { userId_blogId: { userId, blogId } }
    });

    if (existing) {
      await prisma.blogLike.delete({
        where: { id: existing.id }
      });
      const count = await prisma.blogLike.count({ where: { blogId } });
      return res.json({ liked: false, likeCount: count });
    } else {
      await prisma.blogLike.create({
        data: { userId, blogId }
      });
      const count = await prisma.blogLike.count({ where: { blogId } });
      return res.json({ liked: true, likeCount: count });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// Toggle bookmark for a blog
app.post('/api/blogs/:id/bookmark', authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const existing = await prisma.bookmark.findUnique({
      where: { userId_blogId: { userId, blogId } }
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id }
      });
      return res.json({ bookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: { userId, blogId }
      });
      return res.json({ bookmarked: true });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

// Get user's saved/bookmarked blogs
app.get('/api/user/bookmarks', authMiddleware, async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        blog: {
          include: {
            user: { select: { username: true, travelStyle: true, profilePicture: true } },
            location: { select: { name: true, type: true, parent: { select: { name: true } } } },
            _count: { select: { comments: true, likes: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const blogs = bookmarks.map(b => ({
      ...b.blog,
      bookmarkedAt: b.createdAt,
      isBookmarked: true,
      likesCount: b.blog._count?.likes || 0,
      commentsCount: b.blog._count?.comments || 0
    }));

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// --- Saved Itineraries & Trip Checklist CRUD ---

// Get all saved itineraries for user
app.get('/api/itineraries', authMiddleware, async (req, res) => {
  try {
    const itineraries = await prisma.itinerary.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });
    
    const parsed = itineraries.map(item => {
      let parsedData = {};
      try {
        parsedData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
      } catch (e) {
        parsedData = { raw: item.data };
      }
      return {
        ...item,
        parsedData
      };
    });

    res.json(parsed);
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    res.status(500).json({ error: "Failed to fetch itineraries" });
  }
});

// Save a new itinerary
app.post('/api/itineraries', authMiddleware, async (req, res) => {
  try {
    const { destination, title, days, vibe, budget, data, isPublic } = req.body;
    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    const newItinerary = await prisma.itinerary.create({
      data: {
        userId: req.user.id,
        destination,
        title: title || `${days || 3}-Day Trip to ${destination}`,
        days: parseInt(days) || 3,
        vibe: vibe || 'Balanced',
        budget: budget || 'Moderate',
        data: typeof data === 'string' ? data : JSON.stringify(data),
        isPublic: !!isPublic
      }
    });

    let parsedData = {};
    try {
      parsedData = JSON.parse(newItinerary.data);
    } catch (e) {
      parsedData = newItinerary.data;
    }

    res.status(201).json({ ...newItinerary, parsedData });
  } catch (error) {
    console.error("Error saving itinerary:", error);
    res.status(500).json({ error: "Failed to save itinerary" });
  }
});

// Update an existing itinerary (e.g. check off an activity, rename)
app.put('/api/itineraries/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, data, isPublic } = req.body;

    const existing = await prisma.itinerary.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Itinerary not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

    const updated = await prisma.itinerary.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(data !== undefined && { data: typeof data === 'string' ? data : JSON.stringify(data) }),
        ...(isPublic !== undefined && { isPublic })
      }
    });

    let parsedData = {};
    try {
      parsedData = JSON.parse(updated.data);
    } catch (e) {
      parsedData = updated.data;
    }

    res.json({ ...updated, parsedData });
  } catch (error) {
    console.error("Error updating itinerary:", error);
    res.status(500).json({ error: "Failed to update itinerary" });
  }
});

// Delete an itinerary
app.delete('/api/itineraries/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.itinerary.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Itinerary not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

    await prisma.itinerary.delete({ where: { id } });
    res.json({ success: true, message: "Itinerary deleted successfully" });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    res.status(500).json({ error: "Failed to delete itinerary" });
  }
});

// --- Real-time Weather & Seasonal Packing Advisor API ---
app.get('/api/weather', async (req, res) => {
  try {
    const { destination } = req.query;
    if (!destination) return res.status(400).json({ error: "Destination query parameter required" });

    // 1. Resolve to verified coordinates & state
    const resolved = await resolveDestination(destination);

    if (!resolved) {
      return res.status(404).json({ 
        error: `Could not pinpoint meteorological coordinates for "${destination}". Try searching city name (e.g. Manali, Leh, Goa, Munnar).` 
      });
    }

    const { latitude, longitude, name, admin1, country } = resolved;

    // 2. Fetch real live meteorological measurements from Open-Meteo
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`,
      { timeout: 8000 }
    );

    const current = weatherRes.data.current || {};
    const daily = weatherRes.data.daily || {};
    const condition = getWmoCondition(current.weather_code || 0);

    const temp = Math.round(current.temperature_2m ?? 20);
    const apparentTemp = Math.round(current.apparent_temperature ?? temp);
    const humidity = Math.round(current.relative_humidity_2m ?? 50);
    const windSpeed = Math.round(current.wind_speed_10m ?? 8);
    const rainProb = daily?.precipitation_probability_max?.[0] || 0;

    // Clean, proper destination display: "City, State, Country"
    const destinationLabel = `${name}${admin1 ? ', ' + admin1 : ''}${country ? ', ' + country : ', India'}`;

    // 3. Generate hyper-specific packing advice via Gemini
    const packingTips = await generatePackingTips(destinationLabel, temp, condition.label, rainProb);

    res.json({
      destination: destinationLabel,
      found: true,
      latitude,
      longitude,
      temperature: temp,
      apparentTemperature: apparentTemp,
      humidity,
      windSpeed,
      rainProbability: rainProb,
      weatherCondition: condition.label,
      conditionIcon: condition.icon,
      forecast: (daily?.time || []).slice(0, 4).map((date, idx) => ({
        date,
        maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? temp),
        minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? temp - 5),
        condition: getWmoCondition(daily.weather_code?.[idx] || 0).label,
        rainProb: daily.precipitation_probability_max?.[idx] || 0
      })),
      packingTips
    });

  } catch (error) {
    console.error("Weather error:", error.message);
    res.status(500).json({ error: "Failed to fetch real weather data: " + error.message });
  }
});

// Start server ONLY if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless
export default app;
