export const getStoriesPart1 = (usersMap, locationsMap) => {
  const blogs = [];
  const u = Object.values(usersMap);

  // 1. Ladakh - AMS Warning
  blogs.push({
    userId: u[0], locationId: locationsMap['Leh'],
    title: 'Do NOT fly directly to Leh if you only have 3 days',
    coverImage: 'https://images.unsplash.com/photo-1581458925433-28956bbaeb09?q=80&w=1200',
    richContent: `
      <p>I just witnessed three people being airlifted out of Leh yesterday because they ignored altitude sickness (AMS). I am writing this to warn anyone planning a quick weekend trip.</p>
      <h3>The Mistake</h3>
      <p>Flying from sea level directly to 11,500 ft (Leh) is a massive shock to your body. People take a Friday evening flight, land on Saturday morning, and immediately rent a Royal Enfield to drive to Pangong Tso.</p>
      <p><strong>This is how you get pulmonary edema.</strong></p>
      <h3>The Fix</h3>
      <ul>
        <li>You MUST rest for 48 hours in Leh upon arrival. No exploring, no drinking, just sleeping and hydrating.</li>
        <li>Start a Diamox course 2 days before your flight (consult your doctor).</li>
        <li>Drink 4-5 liters of water a day. Garlic soup actually helps.</li>
      </ul>
      <p>If you only have a 3-day weekend, do not go to Ladakh. Go to Manali or Shimla instead. Ladakh requires at least 7-9 days.</p>
    `
  });

  // 2. Andaman - Scuba diving reality check
  blogs.push({
    userId: u[1], locationId: locationsMap['Havelock'],
    title: 'Scuba Diving in Havelock: The Reality vs Instagram',
    coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200',
    richContent: `
      <p>I completed my PADI Open Water certification in Havelock last week. It cost me ₹30,000 and took 4 days. Here is the reality check that nobody tells you.</p>
      <p>The "Try Scuba" (Discover Scuba Diving) packages that they sell to tourists for ₹3,500 on the beach are heavily commercialized. You are basically dragged around by an instructor by your tank valve for 15 minutes. The corals near the shore are mostly dead due to global warming and tourist footfall.</p>
      <p>If you want to see the real magic—Manta rays, massive sea turtles, and vibrant reefs—you HAVE to go deeper. Sites like <em>Dixon's Pinnacle</em> and <em>Jackson's Bar</em> are incredible, but they require a certification.</p>
      <p><strong>My advice:</strong> Save up, get certified, and dive properly. Otherwise, stick to snorkeling at Elephant Beach.</p>
    `
  });

  // 3. Sikkim - Gurudongmar Lake
  blogs.push({
    userId: u[2], locationId: locationsMap['Gurudongmar Lake'],
    title: 'Gurudongmar Lake at 17,800 ft: Breathtaking (literally)',
    coverImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1200',
    richContent: `
      <p>We started our drive from Lachen at 4 AM. The roads are managed by the BRO (Border Roads Organisation) and are incredibly rugged. The military checkpoints are strict—foreign nationals are not allowed past a certain point.</p>
      <p>When you finally reach the lake, the wind is howling. The water is half frozen, reflecting the stark barren mountains. It is considered deeply sacred by both Buddhists and Sikhs.</p>
      <h3>Pro Tips:</h3>
      <ul>
        <li>Do not run or jump. The oxygen level is barely 60% of what it is at sea level.</li>
        <li>You can only stay there for about 30 minutes before the altitude starts messing with your head.</li>
        <li>Carry camphor or sniff camphor bundles; the locals swear by it to prevent breathlessness.</li>
      </ul>
      <p>It was physically exhausting but spiritually uplifting. 10/10 would do it again.</p>
    `
  });

  // 4. Goa - Arambol reality
  blogs.push({
    userId: u[3], locationId: locationsMap['Arambol'],
    title: 'Has Arambol lost its charm? (My 2025 perspective)',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200',
    richContent: `
      <p>I've been coming to Arambol for the winter season since 2016. The famous "Drum Circle" at sunset used to be an intimate gathering of musicians and backpackers. Now, it's surrounded by 500 tourists holding up their phones recording it for Instagram.</p>
      <p>The prices have skyrocketed. A basic shack that used to be ₹800 is now ₹3000. </p>
      <p>If you want the old Arambol vibe, you need to head further North towards <strong>Keri Beach (Querim)</strong> or move to South Goa entirely (Agonda or Patnem). Arambol is unfortunately going the way of Baga and Calangute.</p>
    `
  });

  // 5. Uttarakhand - Valley of Flowers
  blogs.push({
    userId: u[4], locationId: locationsMap['Valley of Flowers'],
    title: 'Valley of Flowers Trek: When to actually go',
    coverImage: 'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200',
    richContent: `
      <p>A lot of travel agencies sell the Valley of Flowers trek starting in June. <strong>Do not go in June.</strong> The snow has just melted, and there are barely any flowers.</p>
      <p>The absolute sweet spot is from <strong>mid-July to mid-August</strong>. Yes, it's the peak of the monsoon. Yes, it will be raining constantly. Yes, there will be leeches. But this is when the valley explodes in pink, blue, and yellow alpine flora.</p>
      <h3>The Trek Itinerary:</h3>
      <ol>
        <li>Reach Govindghat.</li>
        <li>Trek 13km to Ghangaria (base camp). It's a steep, paved path shared with mules.</li>
        <li>Next day, trek 4km into the Valley. It is mostly flat after the initial ascent.</li>
        <li>Day 3: Trek up to Hemkund Sahib (super steep, 6km).</li>
      </ol>
      <p>Bring a high-quality poncho. An umbrella is useless against the wind here.</p>
    `
  });

  // 6. Ladakh - Nubra Valley
  blogs.push({
    userId: u[5], locationId: locationsMap['Nubra Valley'],
    title: 'Diskit Monastery & Hunder Sand Dunes - Better than Pangong?',
    coverImage: 'https://images.unsplash.com/photo-1620959458999-56fb083bdfd8?q=80&w=1200',
    richContent: `
      <p>Unpopular opinion: I enjoyed Nubra Valley significantly more than Pangong Tso.</p>
      <p>To get here, you cross Khardung La (one of the highest motorable passes). The descent into Nubra is like entering another planet. You have the towering Maitreya Buddha statue at Diskit looking over the valley, and just 10km down the road, you are in a desert riding double-humped Bactrian camels in Hunder.</p>
      <p>We stayed in a luxury tent camp in Hunder for ₹4000/night including meals. The stargazing here is better than Pangong because the valley walls block out ambient light.</p>
    `
  });

  // Generate the remaining 19 stories for Part 1 programmatically but with high quality templates
  const templates = [
    {
      title: "Cost Breakdown: 5 Days in {Loc}",
      content: "<p>I tracked every single rupee I spent in <strong>{Loc}</strong>. Here is the reality of traveling here in 2025.</p><ul><li>Flights/Train: ₹4,500</li><li>Accommodation (Hostels): ₹2,500</li><li>Food (Street food & cafes): ₹3,000</li><li>Local Transport (Scooty rental): ₹1,500</li><li>Misc/Entry fees: ₹1,000</li></ul><p><strong>Total: ₹12,500</strong></p><p>It is definitely getting more expensive, but if you eat at local dhabas instead of tourist cafes, you can save a lot.</p>"
    },
    {
      title: "Why {Loc} was a massive disappointment",
      content: "<p>I'm going to get downvoted for this, but someone has to say it. <strong>{Loc}</strong> is highly overrated.</p><p>The traffic is a nightmare. The main viewpoints are littered with plastic bottles. Taxi drivers charge ₹800 for a 2km ride and refuse to use the meter.</p><p>The photos you see on Instagram are heavily edited and taken at 6 AM before the crowds arrive. By 10 AM, it's a circus. If you want peace, go during the off-season (monsoon) or skip it entirely and visit the neighboring, lesser-known villages.</p>"
    },
    {
      title: "Hidden gems in {Loc} that you won't find on TripAdvisor",
      content: "<p>I just spent a month slow-traveling through <strong>{Loc}</strong>. Forget the standard 'Top 10 things to do' lists. Here is what you actually need to see.</p><p>Talk to the homestay owners. They will point you to unmarked trails and private waterfalls. We found a small family-run eatery that served the best local thali I've ever had for just ₹80. No English menu, no Google Maps listing.</p><p>Rent a two-wheeler, pick a random dirt road that heads towards the mountains, and just drive. That's where the real magic happens.</p>"
    },
    {
      title: "Solo female travel guide to {Loc}",
      content: "<p>I just completed my solo trip to <strong>{Loc}</strong> and I want to share my safety tips.</p><ul><li>Stay in Zostel or Hosteller. You meet amazing like-minded women.</li><li>Avoid arriving at the bus stand late at night. Plan your buses so you arrive by 4 PM.</li><li>Dress modestly. I know it's annoying, but respecting local culture goes a long way in avoiding unwanted stares.</li></ul><p>Overall, I felt extremely safe. The locals are incredibly helpful and protective of solo female travelers.</p>"
    }
  ];

  const genericLocs = ['Leh', 'Arambol', 'Palolem', 'Gangtok', 'Rishikesh', 'Auli', 'Neil Island', 'Chorla Ghat', 'Lachen'];

  for (let i = 0; i < 19; i++) {
    const loc = genericLocs[Math.floor(Math.random() * genericLocs.length)];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const user = u[Math.floor(Math.random() * u.length)];
    
    blogs.push({
      userId: user,
      locationId: locationsMap[loc],
      title: template.title.replace('{Loc}', loc),
      coverImage: `https://images.unsplash.com/random/1200x800/?travel,${encodeURIComponent(loc)}&sig=${100+i}`,
      richContent: template.content.replace(/{Loc}/g, loc)
    });
  }

  return blogs;
};
