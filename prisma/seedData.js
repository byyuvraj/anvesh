export const users = [
  { username: 'spiti_wanderer', email: 'spiti@test.com', passwordHash: 'test', travelStyle: 'Backpacker', bio: 'Living out of a rucksack. Always heading to the mountains.', profilePicture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80', onboardingComplete: true },
  { username: 'lux_nomad', email: 'lux@test.com', passwordHash: 'test', travelStyle: 'Luxury', bio: 'Boutique hotels and fine dining around India.', profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', onboardingComplete: true },
  { username: 'foodie_trails', email: 'foodie@test.com', passwordHash: 'test', travelStyle: 'Foodie', bio: 'Will travel 1000 miles for a good biryani.', profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', onboardingComplete: true },
  { username: 'goa_vibes_only', email: 'goa@test.com', passwordHash: 'test', travelStyle: 'Digital Nomad', bio: 'Working from the beaches of South Goa.', profilePicture: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80', onboardingComplete: true },
  { username: 'history_geek', email: 'history@test.com', passwordHash: 'test', travelStyle: 'History Buff', bio: 'Exploring ancient ruins and forgotten empires.', profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80', onboardingComplete: true },
  { username: 'kerala_diaries', email: 'kerala@test.com', passwordHash: 'test', travelStyle: 'Nature', bio: 'Chasing monsoons across the Western Ghats.', profilePicture: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&q=80', onboardingComplete: true },
  { username: 'budget_yatri', email: 'yatri@test.com', passwordHash: 'test', travelStyle: 'Backpacker', bio: 'Seeing India under ₹500 a day. Mostly hitchhiking.', profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', onboardingComplete: true },
  { username: 'himalayan_husky', email: 'husky@test.com', passwordHash: 'test', travelStyle: 'Adventure', bio: 'Trekking the high passes. Zero network preferred.', profilePicture: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&q=80', onboardingComplete: true },
  { username: 'rajputana_explorer', email: 'raj@test.com', passwordHash: 'test', travelStyle: 'History Buff', bio: 'Forts, palaces, and desert safaris.', profilePicture: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&q=80', onboardingComplete: true },
  { username: 'solotravelgirl', email: 'solo@test.com', passwordHash: 'test', travelStyle: 'Backpacker', bio: 'Solo female traveler documenting safe routes across India.', profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', onboardingComplete: true }
];

export const locationHierarchy = [
  {
    name: 'Himachal Pradesh', type: 'State',
    children: [
      { name: 'Spiti Valley', type: 'HiddenGem', description: 'A cold desert mountain valley located high in the Himalayas.' },
      { name: 'Dharamshala', type: 'City', description: 'Home to the Dalai Lama and beautiful pine forests.' },
      { name: 'Jibhi', type: 'Village', description: 'A scenic, uncommercialized village in the Tirthan Valley.' }
    ]
  },
  {
    name: 'Rajasthan', type: 'State',
    children: [
      { name: 'Jaipur', type: 'City', description: 'The Pink City, known for its royal heritage and architecture.' },
      { name: 'Jaisalmer', type: 'City', description: 'The Golden City, standing on a ridge of yellowish sandstone.' },
      { name: 'Pushkar', type: 'Village', description: 'A holy town famous for its lake and the annual camel fair.' }
    ]
  },
  {
    name: 'Kerala', type: 'State',
    children: [
      { name: 'Munnar', type: 'HiddenGem', description: 'Famous for its tea estates and rolling hills.' },
      { name: 'Alleppey', type: 'City', description: 'Known for its tranquil backwaters and houseboat cruises.' },
      { name: 'Varkala', type: 'Village', description: 'A coastal town with beautiful red cliffs overlooking the Arabian Sea.' }
    ]
  },
  {
    name: 'Karnataka', type: 'State',
    children: [
      { name: 'Hampi', type: 'HiddenGem', description: 'An ancient village filled with ruins of the Vijayanagara Empire.' },
      { name: 'Gokarna', type: 'Village', description: 'A pilgrimage town with pristine, less-crowded beaches.' },
      { name: 'Coorg', type: 'City', description: 'The Scotland of India, known for coffee plantations.' }
    ]
  },
  {
    name: 'Meghalaya', type: 'State',
    children: [
      { name: 'Cherrapunji', type: 'HiddenGem', description: 'One of the wettest places on earth, famous for living root bridges.' },
      { name: 'Shillong', type: 'City', description: 'A beautiful hill station known for its music scene and cafes.' },
      { name: 'Dawki', type: 'Village', description: 'Famous for the crystal clear Umngot River.' }
    ]
  }
];

export const generateBlogs = (usersMap, locationsMap) => {
  const blogs = [];
  
  // 1. SPITI VALLEY (Backpacker style)
  blogs.push({
    userId: usersMap['spiti_wanderer'],
    locationId: locationsMap['Spiti Valley'],
    title: '7 Days in Spiti Valley: The Ultimate Budget Itinerary (2025 Edition)',
    coverImage: 'https://images.unsplash.com/photo-1616422285623-1498b3fdfa8e?q=80&w=1200',
    richContent: `
      <p>I just got back from a 7-day circuit of Spiti, doing the complete Shimla to Manali route. I see a lot of people asking about costs and road conditions, so here is a realistic breakdown.</p>
      
      <h3>The Itinerary:</h3>
      <ul>
        <li><strong>Day 1:</strong> Shimla to Kalpa. Long drive (9 hours). The roads get terrible after Rampur. Stayed at a homestay for ₹800.</li>
        <li><strong>Day 2:</strong> Kalpa to Nako to Tabo. The transition from green mountains to barren desert is insane. Nako lake was freezing. </li>
        <li><strong>Day 3:</strong> Tabo to Dhankar to Kaza. Dhankar monastery literally hangs off a cliff. Must visit!</li>
        <li><strong>Day 4:</strong> Kaza - Key Monastery - Kibber - Chicham Bridge. Chicham is the highest bridge in Asia. Super windy.</li>
        <li><strong>Day 5:</strong> Kaza to Langza, Hikkim (highest post office), and Komic. </li>
        <li><strong>Day 6:</strong> Kaza to Chandratal. This road... if you can call it a road. It's basically driving on a riverbed. But Chandratal at sunset makes it all worth it.</li>
        <li><strong>Day 7:</strong> Chandratal to Manali via Rohtang pass.</li>
      </ul>

      <h3>Budget Breakdown (Per Person):</h3>
      <p>Total cost for 7 days came to about ₹14,500. We were 4 people sharing a hired Sumo.</p>
      <ul>
        <li>Transport (Sumo): ₹7,000 per head</li>
        <li>Stay (Homestays): ₹3,500 (avg ₹500/night)</li>
        <li>Food: ₹4,000 (Maggie and Dal Chawal are your best friends)</li>
      </ul>
      <p><strong>Verdict:</strong> Don't try to rush this in 5 days. You need time to acclimatize. Bring Diamox.</p>
    `
  });

  blogs.push({
    userId: usersMap['budget_yatri'],
    locationId: locationsMap['Spiti Valley'],
    title: 'Unpopular Opinion: Chandratal is becoming a tourist trap',
    coverImage: 'https://images.unsplash.com/photo-1581458925433-28956bbaeb09?q=80&w=1200',
    richContent: `
      <p>Hear me out. I did Spiti back in 2018 and again last month. The difference is heartbreaking.</p>
      <p>Chandratal used to have maybe 3-4 camps 2km away from the lake. Now there is a massive tent city. There were literally traffic jams at 14,000 feet trying to get to the parking lot.</p>
      <p>People were playing loud Punjabi music on Bluetooth speakers right next to the lake, completely ruining the serenity.</p>
      <p>If you want the real Spiti experience, skip Chandratal and spend a night in <strong>Demul</strong> or <strong>Langza</strong> instead. The homestay experience there is authentic, the night sky is just as beautiful, and you won't be dealing with crowds trying to make Instagram reels.</p>
    `
  });

  // 2. KERALA (Varkala / Munnar)
  blogs.push({
    userId: usersMap['kerala_diaries'],
    locationId: locationsMap['Munnar'],
    title: 'Monsoon in Munnar: An absolute dream (with hidden trails)',
    coverImage: 'https://images.unsplash.com/photo-1593693397690-362bceb63750?q=80&w=1200',
    richContent: `
      <p>Everyone tells you to avoid Kerala during the monsoons. They are wrong. It is the most magical time to visit the tea estates.</p>
      <p>We stayed in an estate bungalow near Suryanelli. The mist rolling over the hills in the morning is unreal. Here are some hidden spots we found that the standard tour guides won't take you to:</p>
      <ol>
        <li><strong>Kolukkumalai Jeep Trail:</strong> Go for the sunrise. It's the highest organic tea estate in the world. The jeep ride will break your back but the view will heal your soul.</li>
        <li><strong>Lakkam Waterfalls (Upper trail):</strong> Don't just stop at the main falls where everyone is taking selfies. There's a small trek path to the right that takes you to a private natural pool higher up.</li>
        <li><strong>Chinnar Wildlife Sanctuary night safari:</strong> Saw a massive herd of elephants and some wild boars.</li>
      </ol>
      <p>Tip: Carry salt for the leeches. They are absolutely everywhere during the rains.</p>
    `
  });

  blogs.push({
    userId: usersMap['goa_vibes_only'],
    locationId: locationsMap['Varkala'],
    title: 'Varkala > Goa. My month as a digital nomad on the North Cliff',
    coverImage: 'https://images.unsplash.com/photo-1622308644420-a68138db5bb5?q=80&w=1200',
    richContent: `
      <p>I've spent years working out of Arambol and Palolem in Goa. Last month I decided to try Varkala, and I don't think I'm ever going back to Goa.</p>
      <h3>Why Varkala is better for remote work:</h3>
      <ul>
        <li><strong>The Vibe:</strong> It's much quieter. The cliff offers insane views of the Arabian sea right from your laptop screen.</li>
        <li><strong>Internet:</strong> Surprisingly stable fiber optics in most cafes on the North Cliff. I highly recommend Cafe Darjeeling and InDa Cafe for working.</li>
        <li><strong>The Food:</strong> Kerala cuisine is amazing, but Varkala also has excellent Tibetan and European food. </li>
        <li><strong>Cost:</strong> I got a sea-facing AC room for ₹15,000 for the whole month. You can't even get a shack in Goa for that price anymore.</li>
      </ul>
      <p>The only downside is that the beach itself isn't great for swimming due to the strong currents, but there's a black sand beach about a 20-minute scooty ride away that is completely empty.</p>
    `
  });

  // 3. HAMPI
  blogs.push({
    userId: usersMap['history_geek'],
    locationId: locationsMap['Hampi'],
    title: 'A 3-Day Historical Deep Dive into the Vijayanagara Empire (Hampi)',
    coverImage: 'https://images.unsplash.com/photo-1600100397608-f010f4198f58?q=80&w=1200',
    richContent: `
      <p>Hampi isn't just about Hippie Island (which was largely demolished anyway). It is a UNESCO world heritage site that needs to be appreciated for its history. If you are going there just to smoke up, you are missing out on the greatest medieval ruins in India.</p>
      
      <p>Here is how to actually see Hampi:</p>
      <h3>Day 1: The Sacred Centre</h3>
      <p>Start at the <strong>Virupaksha Temple</strong> at 6 AM before the crowds. Then hike up Hemakuta Hill. The view of the monolithic Ganesha statues (Kadalekalu and Sasivekalu) is amazing. Walk along the river to the Vittala Temple (where the famous stone chariot is). Take a guide! The acoustic pillars actually produce musical notes.</p>
      
      <h3>Day 2: The Royal Enclosure</h3>
      <p>This is where the King lived. See the Lotus Mahal, the Elephant Stables, and the Stepped Tank. The architecture here is a beautiful blend of Hindu and Islamic styles, showing how cosmopolitan the empire was.</p>
      
      <h3>Day 3: Matanga Hill & Anegundi</h3>
      <p>Wake up at 4:30 AM and climb Matanga Hill for sunrise. Yes, it's exhausting, but you get a 360-degree view of the entire ruined city mixed with lush green banana plantations. Later, cross the river on a coracle boat to Anegundi (the older capital).</p>
    `
  });

  blogs.push({
    userId: usersMap['solotravelgirl'],
    locationId: locationsMap['Hampi'],
    title: 'Is Hampi safe for solo female travelers? My honest experience',
    coverImage: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=1200',
    richContent: `
      <p>I get this question a lot on my DMs, so I wanted to make a dedicated post about safety in Hampi.</p>
      <p><strong>Short answer: YES. Extremely safe.</strong></p>
      <p>I stayed in Hospet on day 1 (don't recommend, it's just a dusty town) and then moved to a homestay in Sanapur (across the river). The locals are incredibly friendly and used to tourists.</p>
      <p><strong>A few tips:</strong></p>
      <ul>
        <li>Rent a scooty. Auto drivers charge exorbitant amounts (like ₹500 for a 2km ride). Having your own transport gives you freedom and keeps you safe.</li>
        <li>Be careful crossing the river after dark. The ferry stops at 5:30 PM, and taking a coracle in the dark is sketchy.</li>
        <li>Dress modestly when visiting the active temples (Virupaksha).</li>
      </ul>
      <p>I met so many other solo travelers in the cafes near Sanapur lake. Just use common sense, don't wander into the boulder fields alone at night (sloth bears and leopards are actually a thing there), and you'll have the best time.</p>
    `
  });

  // 4. RAJASTHAN (Jaipur, Jaisalmer)
  blogs.push({
    userId: usersMap['lux_nomad'],
    locationId: locationsMap['Jaipur'],
    title: 'Experiencing Royal Heritage: The Best Boutique Havelis in Jaipur',
    coverImage: 'https://images.unsplash.com/photo-1599661559905-2b47fc32d849?q=80&w=1200',
    richContent: `
      <p>Skip the modern 5-star chains when you go to Jaipur. The only way to experience the city is by staying in a restored Haveli. Here are my top 3 luxury recommendations that are worth every penny.</p>
      
      <h3>1. Samode Haveli</h3>
      <p>Located right in the heart of the walled city. The dining room is covered in original hand-painted frescoes. The pool area feels like an oasis away from the chaos of Jaipur traffic. Service is impeccable. (Approx ₹25,000/night)</p>
      
      <h3>2. Alila Fort Bishangarh</h3>
      <p>Technically an hour outside Jaipur, but I have to include it. It's a 230-year-old warrior fort converted into a resort. The sunset views from the terrace lounge are unmatched. (Approx ₹35,000/night)</p>
      
      <h3>3. 28 Kothi</h3>
      <p>If you want something more intimate and modern-minimalist, this is it. Only 5 rooms. It has a very chic, artistic vibe. The vegetarian thali they serve for dinner is Michelin-star worthy. (Approx ₹12,000/night)</p>
    `
  });

  blogs.push({
    userId: usersMap['rajputana_explorer'],
    locationId: locationsMap['Jaisalmer'],
    title: 'Do NOT book a desert safari without reading this first',
    coverImage: 'https://images.unsplash.com/photo-1549474757-0a4ebad031e6?q=80&w=1200',
    richContent: `
      <p>Just came back from a 4-day trip to Jaisalmer and I need to warn people about the Sam Sand Dunes scam.</p>
      <p>If you book a standard "Desert Camp" package from your hotel, they will take you to <strong>Sam Sand Dunes</strong>. It is basically a crowded circus. There are hundreds of tents, loud DJ music blasting until 2 AM, ATVs kicking up dust everywhere, and garbage in the sand. It completely kills the vibe of the desert.</p>
      
      <p><strong>What you should do instead:</strong></p>
      <p>Ask for <strong>Khuri Sand Dunes</strong>. It's further away, less commercialized, and much more peaceful.</p>
      <p>Better yet, book a <em>non-touristic deep desert safari</em>. You sleep directly under the stars on a cot in the middle of nowhere, with no permanent tents. The camel guides cook dinner over a campfire. It's dead silent at night. Cost us about ₹2,500 per person and it was the highlight of our Rajasthan trip.</p>
    `
  });

  // 5. MEGHALAYA
  blogs.push({
    userId: usersMap['himalayan_husky'],
    locationId: locationsMap['Cherrapunji'],
    title: 'The Double Decker Living Root Bridge Trek: A Brutal but Beautiful Guide',
    coverImage: 'https://images.unsplash.com/photo-1626027599723-5e36f78f6a96?q=80&w=1200',
    richContent: `
      <p>Let's get one thing straight: The trek to the Nongriat double-decker living root bridge is roughly 3,500 stairs DOWN into a gorge, and then 3,500 stairs UP on the way back.</p>
      <p>My calves were screaming for a week after this.</p>
      
      <p><strong>The Route:</strong></p>
      <p>You start at Tyrna village. The descent is steep. About halfway down, you can take a detour to the single root bridge (which is actually longer and less crowded than the double one). Then you cross two terrifying wire suspension bridges over raging blue rivers.</p>
      
      <p><strong>Pro Tip: Don't do this as a day trip.</strong></p>
      <p>Most tourists rush down, take a photo, and suffer the climb back up in the afternoon heat. Instead, book a homestay down in Nongriat village (Serene Homestay is great). Spend the night there. The next morning, hike further to <strong>Rainbow Falls</strong>. It's another 2 hours from the root bridge, but it is hands down the most beautiful waterfall in India. The water is freezing, but swimming there after the hike is pure bliss.</p>
    `
  });
  
  // Duplicating/generating variations to hit the 40+ mark across users
  // We'll generate generic but highly structured posts to flood the DB
  const genericTitles = [
    "My complete cost breakdown for",
    "Hidden cafes you must visit in",
    "Why I'm never going back to",
    "3 Days itinerary for",
    "A photowalk through the streets of",
    "The absolute best street food in",
    "Scammed! Watch out for this tourist trap in"
  ];
  
  const userKeys = Object.keys(usersMap);
  const locKeys = Object.keys(locationsMap);
  
  for(let i = 0; i < 35; i++) {
    const randomUser = userKeys[Math.floor(Math.random() * userKeys.length)];
    const randomLocName = locKeys[Math.floor(Math.random() * locKeys.length)];
    const randomTitlePref = genericTitles[Math.floor(Math.random() * genericTitles.length)];
    
    blogs.push({
      userId: usersMap[randomUser],
      locationId: locationsMap[randomLocName],
      title: `${randomTitlePref} ${randomLocName}`,
      coverImage: `https://images.unsplash.com/random/1200x800/?travel,${encodeURIComponent(randomLocName)}&sig=${i}`,
      richContent: `
        <p>This is a community data point regarding <strong>${randomLocName}</strong>. I wanted to share my recent experience here because I feel like the current guides online are heavily outdated.</p>
        <h3>Getting there</h3>
        <p>We took the overnight bus/train which cost us roughly ₹1,200. I highly recommend booking at least a month in advance because tickets sell out instantly during the season.</p>
        <h3>Where we stayed</h3>
        <p>Avoid the main market area. It is heavily congested and overpriced. We found a small place about 3km out of the center and rented scooters to get around. The peace and quiet was worth the daily commute.</p>
        <h3>Top Recommendations:</h3>
        <ul>
          <li>Wake up early. By 9 AM every major spot is flooded with tourists.</li>
          <li>Eat at the local dhabas instead of the highly rated Instagram cafes. The food is 10x better and a fraction of the cost.</li>
          <li>Always negotiate the taxi fares before getting in.</li>
        </ul>
        <p>Overall, a solid 8/10 experience. I'd definitely return, but probably during the off-season next time!</p>
      `
    });
  }

  return blogs;
};
