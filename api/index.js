import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

dotenv.config();

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

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/```json/, '').replace(/```/, '').trim();
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

// Get all blogs (Feed)
app.get('/api/blogs', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let userPrefs = null;
    if (userId) {
      userPrefs = await prisma.user.findUnique({
        where: { id: userId },
        select: { travelStyle: true, preferredVibe: true, budgetPreference: true }
      });
    }

    const blogs = await prisma.blog.findMany({
      include: {
        user: { select: { username: true, travelStyle: true, profilePicture: true } },
        location: { select: { name: true, type: true, parent: { select: { name: true } } } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // ML FEATURE: Algorithmic "Match Score"
    const blogsWithScores = blogs.map(blog => {
      let matchScore = 0;
      
      if (userPrefs) {
        // Base score starts at 60 for logged-in users (baseline relevance)
        let score = 60; 
        
        // Match 1: Travel Style Alignment
        if (userPrefs.travelStyle && blog.user.travelStyle === userPrefs.travelStyle) {
          score += 15;
        }
        
        // Match 2: Tag Analysis (NLP Simulation)
        if (blog.tags && blog.tags.length > 0) {
          const stringifiedTags = blog.tags.join(' ').toLowerCase();
          if (userPrefs.preferredVibe && stringifiedTags.includes(userPrefs.preferredVibe.toLowerCase())) score += 15;
          if (userPrefs.budgetPreference && stringifiedTags.includes(userPrefs.budgetPreference.toLowerCase())) score += 10;
        } else {
          // If no tags, fallback text analysis
          const contentStr = (blog.title + ' ' + blog.richContent).toLowerCase();
          if (userPrefs.preferredVibe && contentStr.includes(userPrefs.preferredVibe.toLowerCase())) score += 15;
          if (userPrefs.budgetPreference && contentStr.includes(userPrefs.budgetPreference.toLowerCase())) score += 10;
        }
        
        // Randomization for serendipity (between -5 and +5)
        score += Math.floor(Math.random() * 10) - 5;
        
        // Cap at 99%
        matchScore = Math.min(99, Math.max(40, score));
      }
      
      return {
        ...blog,
        matchScore: userPrefs ? matchScore : null
      };
    });

    res.json(blogsWithScores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching blogs' });
  }
});

// Get single blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { username: true, travelStyle: true, profilePicture: true, bio: true } },
        comments: {
          include: { user: { select: { username: true, profilePicture: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
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
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
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
        
        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();
        if (rawText.startsWith('\`\`\`json')) {
           rawText = rawText.replace(/\`\`\`json/, '').replace(/\`\`\`/, '').trim();
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
      const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `You are an expert travel guide. The user is asking about the location "${location.name}". 
      First, provide a brief, engaging 2-sentence summary about this location from your own knowledge. 
      Second, summarize the following community tips we have about this place, and explicitly cite the usernames (e.g. "As @username mentioned...") telling the reader to check out their full posts. 
      Format the response using HTML (like <h3>, <p>, <ul>, <li>, <strong>) so it can be rendered directly in a rich text container. Don't use markdown code blocks.
      
      Community Tips:
      ${communityTips || 'No community tips yet. Encourage the user to be the first to write one!'}`;

      const result = await model.generateContent(prompt);
      aiSummary = result.response.text();
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

// Start server ONLY if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless
export default app;
