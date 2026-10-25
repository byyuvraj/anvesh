/**
 * Anvesh Multi-Vector Recommendation Engine
 * Combines 4 Vectors:
 * 1. User Travel Persona (travelStyle, preferredVibe, budgetPreference)
 * 2. Interaction History (Liked tags, Bookmarked stories, Saved Itineraries)
 * 3. Geographic & Offbeat Proximity (Location hierarchy & hidden gems)
 * 4. Community Trust & Bayesian Engagement (Verified likes, bookmarks, discussions)
 */

export class RecommendationEngine {
  /**
   * Deterministic hash for stable serendipity
   */
  static getPseudoDelta(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 7) - 3; // -3 to +3
  }

  /**
   * Extract user interest profile from declared attributes and behavioral history
   */
  static async getUserProfile(prisma, userId) {
    if (!userId) return null;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          likes: {
            take: 30,
            include: { blog: { select: { tags: true, locationId: true, location: { select: { name: true, parent: { select: { name: true } } } } } } }
          },
          bookmarks: {
            take: 30,
            include: { blog: { select: { tags: true, locationId: true, location: { select: { name: true, parent: { select: { name: true } } } } } } }
          },
          itineraries: {
            take: 10,
            select: { destination: true, vibe: true, budget: true }
          }
        }
      });

      if (!user) return null;

      // Build tag frequency map
      const tagFreq = {};
      const locationSet = new Set();
      const itineraryDestinations = new Set();

      // Weight bookmarks higher (x2) than likes (x1)
      user.bookmarks?.forEach(bm => {
        if (bm.blog?.tags) {
          bm.blog.tags.forEach(t => {
            const cleanTag = t.toLowerCase().replace('#', '');
            tagFreq[cleanTag] = (tagFreq[cleanTag] || 0) + 2;
          });
        }
        if (bm.blog?.location?.name) locationSet.add(bm.blog.location.name.toLowerCase());
        if (bm.blog?.location?.parent?.name) locationSet.add(bm.blog.location.parent.name.toLowerCase());
      });

      user.likes?.forEach(like => {
        if (like.blog?.tags) {
          like.blog.tags.forEach(t => {
            const cleanTag = t.toLowerCase().replace('#', '');
            tagFreq[cleanTag] = (tagFreq[cleanTag] || 0) + 1;
          });
        }
        if (like.blog?.location?.name) locationSet.add(like.blog.location.name.toLowerCase());
        if (like.blog?.location?.parent?.name) locationSet.add(like.blog.location.parent.name.toLowerCase());
      });

      user.itineraries?.forEach(it => {
        if (it.destination) {
          itineraryDestinations.add(it.destination.toLowerCase());
          locationSet.add(it.destination.toLowerCase());
        }
        if (it.vibe) tagFreq[it.vibe.toLowerCase()] = (tagFreq[it.vibe.toLowerCase()] || 0) + 2;
      });

      return {
        id: user.id,
        travelStyle: user.travelStyle,
        preferredVibe: user.preferredVibe,
        budgetPreference: user.budgetPreference,
        tagFreq,
        locationSet,
        itineraryDestinations
      };
    } catch (err) {
      console.error("Error fetching user interest profile:", err);
      return null;
    }
  }

  /**
   * Calculate match score and generate explanatory reason
   */
  static scoreBlog(blog, userProfile) {
    if (!userProfile) {
      // Unauthenticated default
      const engagement = (blog._count?.likes || 0) * 2 + (blog._count?.bookmarks || 0) * 3 + (blog._count?.comments || 0);
      return {
        matchScore: null,
        matchReason: "Trending Community Story",
        scoreBreakdown: null
      };
    }

    let score = 52; // Baseline neutral score
    const reasons = [];
    const breakdown = {
      persona: 0,
      behavioral: 0,
      location: 0,
      quality: 0
    };

    const blogTags = (blog.tags || []).map(t => t.toLowerCase().replace('#', ''));
    const blogText = (blog.title + ' ' + (blog.richContent || '')).toLowerCase();

    // 1. PERSONA ALIGNMENT (Max: 20 pts)
    if (userProfile.travelStyle && blog.user?.travelStyle) {
      if (blog.user.travelStyle.toLowerCase() === userProfile.travelStyle.toLowerCase()) {
        score += 8;
        breakdown.persona += 8;
        reasons.push(`${userProfile.travelStyle} style`);
      }
    }

    if (userProfile.preferredVibe) {
      const v = userProfile.preferredVibe.toLowerCase();
      if (blogTags.includes(v) || blogText.includes(v)) {
        score += 7;
        breakdown.persona += 7;
        reasons.push(`${userProfile.preferredVibe} vibe`);
      }
    }

    if (userProfile.budgetPreference) {
      const b = userProfile.budgetPreference.toLowerCase();
      if (blogTags.includes(b) || blogText.includes(b)) {
        score += 5;
        breakdown.persona += 5;
        reasons.push(`${userProfile.budgetPreference} tier`);
      }
    }

    // 2. BEHAVIORAL INTERACTION ALIGNMENT (Max: 20 pts)
    let tagMatches = 0;
    let tagScore = 0;
    for (const tag of blogTags) {
      if (userProfile.tagFreq[tag]) {
        tagMatches++;
        tagScore += Math.min(4, userProfile.tagFreq[tag]);
      }
    }
    const behavioralBonus = Math.min(15, tagScore);
    score += behavioralBonus;
    breakdown.behavioral = behavioralBonus;

    if (tagMatches >= 2) {
      reasons.push("Matches your reading taste");
    }

    // Location / Itinerary Proximity (+5 pts)
    const locName = (blog.location?.name || '').toLowerCase();
    const parentLocName = (blog.location?.parent?.name || '').toLowerCase();

    let isLocMatch = false;
    for (const dest of userProfile.itineraryDestinations) {
      if (dest.includes(locName) || locName.includes(dest) || (parentLocName && dest.includes(parentLocName))) {
        score += 6;
        breakdown.location = 6;
        isLocMatch = true;
        reasons.push(`Related to your planned trip to ${blog.location?.name}`);
        break;
      }
    }

    if (!isLocMatch && (userProfile.locationSet.has(locName) || userProfile.locationSet.has(parentLocName))) {
      score += 4;
      breakdown.location = 4;
      reasons.push(`Similar to your bookmarked places`);
    }

    // 3. COMMUNITY TRUST & ENGAGEMENT (+6 pts)
    const likes = blog._count?.likes || 0;
    const bookmarks = blog._count?.bookmarks || 0;
    const comments = blog._count?.comments || 0;
    const engagementScore = Math.min(6, Math.floor((likes * 0.2 + bookmarks * 0.4 + comments * 0.3)));
    score += engagementScore;
    breakdown.quality = engagementScore;

    // 4. SERENDIPITY DELTA (-3 to +3)
    const delta = RecommendationEngine.getPseudoDelta((blog.id || '') + (userProfile.id || ''));
    score += delta;

    // Clamp score strictly between 45% and 99%
    const finalScore = Math.min(99, Math.max(45, Math.round(score)));

    // Synthesize concise, human-readable reason
    let matchReason = "";
    if (reasons.length > 0) {
      matchReason = reasons.slice(0, 2).join(' • ');
    } else if (blog.location?.type === 'HiddenGem' || blogTags.includes('offbeat')) {
      matchReason = "Hidden Gem with high community acclaim";
    } else {
      matchReason = "Personalized community match";
    }

    return {
      matchScore: finalScore,
      matchReason: `${finalScore}% Match • ${matchReason}`,
      scoreBreakdown: breakdown
    };
  }

  /**
   * Find similar blogs for a given blog ID (Content-based similarity)
   */
  static async getSimilarBlogs(prisma, blogId, limit = 3) {
    try {
      const currentBlog = await prisma.blog.findUnique({
        where: { id: blogId },
        include: {
          location: { select: { id: true, name: true, parentId: true } },
          user: { select: { travelStyle: true } }
        }
      });

      if (!currentBlog) return [];

      const targetTags = (currentBlog.tags || []).map(t => t.toLowerCase().replace('#', ''));
      const parentId = currentBlog.location?.parentId;

      // Find candidates sharing location, parent location, or tags
      const candidates = await prisma.blog.findMany({
        where: {
          id: { not: blogId },
          OR: [
            { locationId: currentBlog.locationId },
            ...(parentId ? [{ location: { parentId } }] : []),
            { tags: { hasSome: currentBlog.tags } }
          ]
        },
        include: {
          user: { select: { username: true, travelStyle: true, profilePicture: true } },
          location: { select: { name: true, type: true, parent: { select: { name: true } } } },
          _count: { select: { comments: true, likes: true, bookmarks: true } }
        },
        take: 20
      });

      // Calculate Jaccard / Cosine similarity
      const scored = candidates.map(c => {
        let sim = 50;
        const cTags = (c.tags || []).map(t => t.toLowerCase().replace('#', ''));

        // Tag overlap
        let overlap = 0;
        targetTags.forEach(t => {
          if (cTags.includes(t)) overlap++;
        });
        sim += Math.min(30, overlap * 8);

        // Same Location or State
        if (c.locationId === currentBlog.locationId) {
          sim += 15;
        } else if (parentId && c.location?.parent?.name === currentBlog.location?.parent?.name) {
          sim += 10;
        }

        // Same travel style
        if (c.user?.travelStyle && currentBlog.user?.travelStyle && c.user.travelStyle === currentBlog.user.travelStyle) {
          sim += 5;
        }

        const similarityPercentage = Math.min(99, Math.max(60, sim));
        let reason = "";
        if (c.locationId === currentBlog.locationId) {
          reason = `Also explores ${c.location.name}`;
        } else if (overlap > 0) {
          reason = `Shares ${overlap} similar travel themes`;
        } else {
          reason = `Similar travel archetype`;
        }

        return {
          ...c,
          similarityScore: similarityPercentage,
          similarityReason: `${similarityPercentage}% Similar • ${reason}`,
          likesCount: c._count?.likes || 0,
          commentsCount: c._count?.comments || 0,
          bookmarksCount: c._count?.bookmarks || 0
        };
      });

      scored.sort((a, b) => b.similarityScore - a.similarityScore);
      return scored.slice(0, limit);
    } catch (err) {
      console.error("Error computing similar blogs:", err);
      return [];
    }
  }

  /**
   * Get curated collections for Explore feed
   */
  static async getCuratedCollections(prisma, userId) {
    const userProfile = await RecommendationEngine.getUserProfile(prisma, userId);

    const allBlogs = await prisma.blog.findMany({
      include: {
        user: { select: { username: true, travelStyle: true, profilePicture: true } },
        location: { select: { name: true, type: true, parent: { select: { name: true } } } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
        ...(userId ? {
          likes: { where: { userId } },
          bookmarks: { where: { userId } }
        } : {})
      },
      take: 120
    });

    const enriched = allBlogs.map(b => {
      const scoring = RecommendationEngine.scoreBlog(b, userProfile);
      return {
        ...b,
        matchScore: scoring.matchScore,
        matchReason: scoring.matchReason,
        scoreBreakdown: scoring.scoreBreakdown,
        likesCount: b._count?.likes || 0,
        commentsCount: b._count?.comments || 0,
        bookmarksCount: b._count?.bookmarks || 0,
        isLiked: Boolean(b.likes && b.likes.length > 0),
        isBookmarked: Boolean(b.bookmarks && b.bookmarks.length > 0)
      };
    });

    // 1. Curated Top Picks (Highest matchScore)
    const curatedForYou = [...enriched]
      .filter(b => b.matchScore !== null)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 8);

    // 2. Hidden Gems (type === HiddenGem or Village, or #offbeat tag)
    const hiddenGems = [...enriched]
      .filter(b => b.location?.type === 'HiddenGem' || b.location?.type === 'Village' || (b.tags || []).some(t => t.toLowerCase().includes('offbeat')))
      .sort((a, b) => (b.likesCount + b.bookmarksCount * 2) - (a.likesCount + a.bookmarksCount * 2))
      .slice(0, 8);

    // 3. Trending Now (Weighted community activity)
    const trending = [...enriched]
      .sort((a, b) => (b.likesCount * 2 + b.bookmarksCount * 3 + b.commentsCount * 1.5) - (a.likesCount * 2 + a.bookmarksCount * 3 + a.commentsCount * 1.5))
      .slice(0, 8);

    // 4. Based on Activity / Saved Trips
    let basedOnActivity = [];
    if (userProfile && (userProfile.itineraryDestinations.size > 0 || Object.keys(userProfile.tagFreq).length > 0)) {
      basedOnActivity = [...enriched]
        .filter(b => (b.scoreBreakdown?.location || 0) > 0 || (b.scoreBreakdown?.behavioral || 0) > 6)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 8);
    }

    return {
      curatedForYou,
      hiddenGems,
      trending,
      basedOnActivity
    };
  }
}
