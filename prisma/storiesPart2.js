export const getStoriesPart2 = (usersMap, locationsMap) => {
  const blogs = [];
  const u = Object.values(usersMap);

  // 1. Pangong Tso
  blogs.push({
    userId: u[6], locationId: locationsMap['Pangong Tso'],
    title: 'The dark side of Pangong Tso tourism',
    coverImage: 'https://images.unsplash.com/photo-1582236081498-f2b7407dd293?q=80&w=1200',
    richContent: `
      <p>I visited Pangong Tso last week and honestly, I left heartbroken. The lake is as beautiful as they say—the deep blue color is mesmerizing. But the human impact is devastating.</p>
      <p>There are literally hundreds of plastic water bottles floating near the shores where the camps are set up. People drive their massive SUVs right up to the water's edge, destroying the fragile marshland habitat of the marmots and migratory birds.</p>
      <p>Please, if you visit:</p>
      <ul>
        <li><strong>Do not drive on the lake shore.</strong> Park at the designated spots.</li>
        <li><strong>Bring your own reusable water bottle.</strong> Stop buying Bisleri bottles up there. There is no waste management at 14,000 ft.</li>
        <li>Take your trash back to Leh with you.</li>
      </ul>
      <p>If we don't change how we travel, this lake will be a toxic puddle in 10 years.</p>
    `
  });

  // 2. Rishikesh
  blogs.push({
    userId: u[7], locationId: locationsMap['Rishikesh'],
    title: 'Cafe Hopping in Tapovan, Rishikesh: A Foodie’s Guide',
    coverImage: 'https://images.unsplash.com/photo-1627883907106-963a8a3a9686?q=80&w=1200',
    richContent: `
      <p>Forget the ashrams for a second, the cafe culture in Tapovan (Rishikesh) is incredible. It’s entirely vegetarian/vegan, but you won't even miss meat. Here are my top 3 spots:</p>
      <ol>
        <li><strong>Tattv Cafe:</strong> Best view of the Ganges. Their falafel platter and cold coffee are legendary. It gets super crowded by 6 PM for sunset.</li>
        <li><strong>Secret Garden Cafe:</strong> Tucked away in a narrow alley. Amazing Israeli food. Try their Ziva (stuffed pastry) and shakshuka.</li>
        <li><strong>Ira's Kitchen:</strong> Very authentic organic Indian food. Their thali changes daily based on what vegetables are fresh in the market.</li>
      </ol>
      <p>Average cost for a meal at these places is around ₹400-500. Pro-tip: Walk, don't take a scooty. The traffic jams near Laxman Jhula are terrible.</p>
    `
  });

  // 3. Goa - Palolem
  blogs.push({
    userId: u[8], locationId: locationsMap['Palolem'],
    title: 'Palolem Beach: Why South Goa wins every time',
    coverImage: 'https://images.unsplash.com/photo-1549474757-0a4ebad031e6?q=80&w=1200',
    richContent: `
      <p>North Goa is for parties, South Goa is for the soul. I just spent a week in Palolem and it was exactly what I needed.</p>
      <p>The beach is shaped like a crescent moon, meaning the waves are incredibly gentle—perfect for swimming. We rented a kayak for ₹300/hour and paddled out to Butterfly Beach (which is inaccessible by road). We actually saw a pod of dolphins on the way!</p>
      <p>Stay at the beach huts. They are literally built on the sand on bamboo stilts. You fall asleep to the sound of crashing waves. At the end of the season (May), they dismantle the entire thing.</p>
    `
  });

  // 4. Sikkim - Gangtok
  blogs.push({
    userId: u[9], locationId: locationsMap['Gangtok'],
    title: 'MG Marg is the blueprint for how Indian cities should be',
    coverImage: 'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200',
    richContent: `
      <p>I am absolutely blown away by MG Marg in Gangtok. It is a completely spit-free, litter-free, and traffic-free zone.</p>
      <p>You can walk freely, sit on the benches, and just soak in the vibe without dodging auto-rickshaws or stepping in garbage. The local police actually enforce the cleanliness rules strictly (₹5000 fine for littering).</p>
      <p>If you are there, you MUST eat at <strong>Taste of Tibet</strong>. The pork gyathuk and beef shaphaley are out of this world. Also, grab a coffee at Baker's Cafe and get a window seat overlooking the valley.</p>
    `
  });

  // 5. Auli
  blogs.push({
    userId: u[0], locationId: locationsMap['Auli'],
    title: 'Skiing in Auli: Is it worth the hype?',
    coverImage: 'https://images.unsplash.com/photo-1605553072230-6f91f75d506d?q=80&w=1200',
    richContent: `
      <p>I went to Auli in late January hoping for a winter wonderland. It delivered on the views (Nanda Devi looks majestic), but as a ski destination... it has issues.</p>
      <p><strong>The Good:</strong> The chairlift from Joshimath is a stunning 25-minute ride over oak forests. The slopes are gentle enough for beginners.</p>
      <p><strong>The Bad:</strong> The infrastructure is severely lacking. There was only one operational ski lift for the entire slope, and the queue was 45 minutes long. The rental equipment was extremely worn out and outdated.</p>
      <p>If you just want to experience snow and take a short 2-day ski course, it's fine. But don't expect European resort standards. Gulmarg in Kashmir is significantly better for serious skiing.</p>
    `
  });

  // Generate the remaining 20 stories for Part 2 programmatically with different templates
  const templates = [
    {
      title: "My 3-day itinerary for {Loc}",
      content: "<p>Just returned from <strong>{Loc}</strong>. It was a short trip but we packed a lot in. Here is what we did:</p><h3>Day 1: Arrival & Local Exploration</h3><p>We arrived by noon, checked into our homestay, and spent the evening exploring the local markets. The street food here is incredible.</p><h3>Day 2: The Main Sights</h3><p>We hired a cab for the full day (cost us ₹2000) and visited all the major viewpoints. Start early to beat the crowds!</p><h3>Day 3: Hidden Trails</h3><p>Asked our host for an off-beat suggestion and ended up hiking to a nearby waterfall. Absolutely no tourists there. Left by 4 PM to catch our bus back.</p>"
    },
    {
      title: "Is {Loc} safe for couples?",
      content: "<p>My partner and I just spent a week in <strong>{Loc}</strong>. We had some concerns before going due to mixed reviews online, but honestly, it was perfectly fine.</p><p>The key is to respect the local culture. Public displays of affection are frowned upon, so keep that in mind. We stayed in a reputable guesthouse and never felt unsafe walking around, even after dark in the main market areas.</p><p>Book your transport through the hotel to avoid getting scammed by random taxi drivers. Overall, highly recommended for couples!</p>"
    },
    {
      title: "The ultimate guide to public transport in {Loc}",
      content: "<p>If you're on a budget, you don't need to hire expensive private cabs in <strong>{Loc}</strong>. The local bus network is actually quite robust if you know how to use it.</p><p>Go to the main bus stand early in the morning. The state transport buses run on a fixed schedule (mostly). They are crowded, bumpy, and loud, but they cost a fraction of a taxi fare (e.g., ₹50 vs ₹1500).</p><p>Plus, you get to interact with the locals. Just make sure you know the time of the last bus back, or you'll be stranded!</p>"
    }
  ];

  const genericLocs = ['Ladakh', 'Nubra Valley', 'Palolem', 'Gangtok', 'Rishikesh', 'Auli', 'Havelock'];

  for (let i = 0; i < 20; i++) {
    const loc = genericLocs[Math.floor(Math.random() * genericLocs.length)];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const user = u[Math.floor(Math.random() * u.length)];
    
    const verifiedImages = [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200',
      'https://images.unsplash.com/photo-1593693397690-362bceb63750?q=80&w=1200',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200',
      'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200',
      'https://images.unsplash.com/photo-1600100397608-f010f4198f58?q=80&w=1200',
      'https://images.unsplash.com/photo-1582236081498-f2b7407dd293?q=80&w=1200',
      'https://images.unsplash.com/photo-1620959458999-56fb083bdfd8?q=80&w=1200',
      'https://images.unsplash.com/photo-1581458925433-28956bbaeb09?q=80&w=1200',
      'https://images.unsplash.com/photo-1599661559905-2b47fc32d849?q=80&w=1200',
      'https://images.unsplash.com/photo-1626027599723-5e36f78f6a96?q=80&w=1200',
      'https://images.unsplash.com/photo-1627883907106-963a8a3a9686?q=80&w=1200',
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1200',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200',
      'https://images.unsplash.com/photo-1605553072230-6f91f75d506d?q=80&w=1200',
      'https://images.unsplash.com/photo-1549474757-0a4ebad031e6?q=80&w=1200'
    ];
    const safeImage = verifiedImages[i % verifiedImages.length];

    blogs.push({
      userId: user,
      locationId: locationsMap[loc],
      title: template.title.replace('{Loc}', loc),
      coverImage: safeImage,
      richContent: template.content.replace(/{Loc}/g, loc)
    });
  }

  return blogs;
};
