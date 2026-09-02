import fs from 'fs';

const users = [
  { username: 'himalayan_yogi', name: 'Aarav Sharma', email: 'aarav@test.com', passwordHash: 'test', travelStyle: 'Backpacker', bio: 'Finding peace in the high altitudes of Spiti and Ladakh.', profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', onboardingComplete: true },
  { username: 'goa_drifter', name: 'Kabir Fernandes', email: 'kabir@test.com', passwordHash: 'test', travelStyle: 'Digital Nomad', bio: 'Remote worker café hopping across South Goa.', profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', onboardingComplete: true },
  { username: 'rajputana_royals', name: 'Priya Singh', email: 'priya@test.com', passwordHash: 'test', travelStyle: 'Luxury', bio: 'Exploring the rich heritage and boutique stays of Rajasthan.', profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', onboardingComplete: true },
  { username: 'kerala_monsoons', name: 'Aditi Menon', email: 'aditi@test.com', passwordHash: 'test', travelStyle: 'Nature', bio: 'Chasing waterfalls and lush green trails in the Western Ghats.', profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', onboardingComplete: true },
  { username: 'history_walker', name: 'Vikram Joshi', email: 'vikram@test.com', passwordHash: 'test', travelStyle: 'History Buff', bio: 'Documenting the forgotten architectural marvels of Hampi.', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', onboardingComplete: true },
  { username: 'northeast_diaries', name: 'Neha Chhetri', email: 'neha@test.com', passwordHash: 'test', travelStyle: 'Adventure', bio: 'Uncovering the root bridges and pristine lakes of Meghalaya.', profilePicture: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', onboardingComplete: true },
  { username: 'budget_yatri', name: 'Rohan Patel', email: 'rohan@test.com', passwordHash: 'test', travelStyle: 'Backpacker', bio: 'Seeing India under ₹500 a day. Mostly hitchhiking.', profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', onboardingComplete: true },
  { username: 'foodie_trails_india', name: 'Sanya Gupta', email: 'sanya@test.com', passwordHash: 'test', travelStyle: 'Foodie', bio: 'Will travel 1000 miles for an authentic biryani.', profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', onboardingComplete: true },
  { username: 'chai_and_mountains', name: 'Arjun Das', email: 'arjun@test.com', passwordHash: 'test', travelStyle: 'Backpacker', bio: 'Searching for the perfect cup of tea in Darjeeling and beyond.', profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80', onboardingComplete: true },
  { username: 'temple_run_india', name: 'Ananya Iyer', email: 'ananya@test.com', passwordHash: 'test', travelStyle: 'History Buff', bio: 'On a spiritual journey across the ancient temples of the South.', profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80', onboardingComplete: true },
  { username: 'beach_bum_life', name: 'Rahul Nair', email: 'rahul@test.com', passwordHash: 'test', travelStyle: 'Digital Nomad', bio: 'Trading city traffic for ocean waves in Gokarna.', profilePicture: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&q=80', onboardingComplete: true },
  { username: 'valley_of_flowers', name: 'Sneha Reddy', email: 'sneha@test.com', passwordHash: 'test', travelStyle: 'Nature', bio: 'Botanist capturing the rare blooms of Uttarakhand.', profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', onboardingComplete: true },
  { username: 'nomadic_soul', name: 'Karan Singh', email: 'karan@test.com', passwordHash: 'test', travelStyle: 'Adventure', bio: 'Living out of a van and exploring the unmapped roads of India.', profilePicture: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80', onboardingComplete: true },
  { username: 'culture_curator', name: 'Meera Kapoor', email: 'meera@test.com', passwordHash: 'test', travelStyle: 'Luxury', bio: 'Curating the best art, textiles, and culture experiences.', profilePicture: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&q=80', onboardingComplete: true },
  { username: 'snow_leopard_tracker', name: 'Tenzing Norgay', email: 'tenzing@test.com', passwordHash: 'test', travelStyle: 'Adventure', bio: 'Winter expeditions in Spiti and Zanskar valleys.', profilePicture: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&q=80', onboardingComplete: true },
  { username: 'south_india_diaries', name: 'Lakshmi Rao', email: 'lakshmi@test.com', passwordHash: 'test', travelStyle: 'Foodie', bio: 'Dosas, filter coffee, and backwater sunsets.', profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', onboardingComplete: true },
  { username: 'forts_and_palaces', name: 'Rajendra Shekhawat', email: 'rajendra@test.com', passwordHash: 'test', travelStyle: 'History Buff', bio: 'Uncovering the martial history of Rajputana.', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', onboardingComplete: true },
  { username: 'island_hopper', name: 'Natasha Dsouza', email: 'natasha@test.com', passwordHash: 'test', travelStyle: 'Nature', bio: 'Scuba diving instructor based in the Andamans.', profilePicture: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', onboardingComplete: true },
  { username: 'street_food_ninja', name: 'Aman Verma', email: 'aman@test.com', passwordHash: 'test', travelStyle: 'Foodie', bio: 'Reviewing the spiciest chaat from Delhi to Kolkata.', profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', onboardingComplete: true },
  { username: 'solo_travel_girl', name: 'Shruti Desai', email: 'shruti@test.com', passwordHash: 'test', travelStyle: 'Backpacker', bio: 'Empowering women to travel solo across India safely.', profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', onboardingComplete: true },
  { username: 'himalayan_monk', name: 'Lobsang Dorjee', email: 'lobsang@test.com', passwordHash: 'test', travelStyle: 'Nature', bio: 'Sharing the spiritual silence of Buddhist monasteries.', profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80', onboardingComplete: true },
  { username: 'weekend_warrior', name: 'Ravi Teja', email: 'ravi@test.com', passwordHash: 'test', travelStyle: 'Adventure', bio: 'Corporate by weekday, scaling peaks by weekend.', profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80', onboardingComplete: true },
  { username: 'heritage_stays', name: 'Pooja Bhatt', email: 'pooja@test.com', passwordHash: 'test', travelStyle: 'Luxury', bio: 'Reviewing the best restored havelis and heritage properties.', profilePicture: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&q=80', onboardingComplete: true },
  { username: 'biker_diaries', name: 'Siddharth Roy', email: 'siddharth@test.com', passwordHash: 'test', travelStyle: 'Adventure', bio: 'Riding my Royal Enfield from Kanyakumari to Kashmir.', profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', onboardingComplete: true },
  { username: 'wildlife_lens', name: 'Aditya Chauhan', email: 'aditya@test.com', passwordHash: 'test', travelStyle: 'Nature', bio: 'Wildlife photographer tracking tigers in Ranthambore and Bandhavgarh.', profilePicture: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80', onboardingComplete: true },
  { username: 'sufi_trails', name: 'Zoya Khan', email: 'zoya@test.com', passwordHash: 'test', travelStyle: 'History Buff', bio: 'Exploring the poetry, music, and shrines of Sufi saints.', profilePicture: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&q=80', onboardingComplete: true },
  { username: 'yoga_retreats', name: 'Maya Sharma', email: 'maya@test.com', passwordHash: 'test', travelStyle: 'Digital Nomad', bio: 'Finding balance between asanas in Rishikesh and remote work.', profilePicture: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&q=80', onboardingComplete: true },
  { username: 'coffee_county', name: 'Varun Kumar', email: 'varun@test.com', passwordHash: 'test', travelStyle: 'Foodie', bio: 'Brewing stories from the coffee estates of Coorg and Chikmagalur.', profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', onboardingComplete: true },
  { username: 'desert_nomad', name: 'Gaurav Bhati', email: 'gaurav@test.com', passwordHash: 'test', travelStyle: 'Backpacker', bio: 'Camping under the stars in the Thar desert.', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', onboardingComplete: true },
  { username: 'artisan_routes', name: 'Nandini Das', email: 'nandini@test.com', passwordHash: 'test', travelStyle: 'Luxury', bio: 'Meeting master craftsmen and weavers across rural India.', profilePicture: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', onboardingComplete: true }
];

const locationHierarchy = [
  {
    name: 'Himachal Pradesh', type: 'State', imageUrl: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200',
    children: [
      { name: 'Spiti Valley', type: 'HiddenGem', description: 'A cold desert mountain valley located high in the Himalayas.', imageUrl: 'https://images.unsplash.com/photo-1616422285623-1498b3fdfa8e?q=80&w=1200' },
      { name: 'Dharamshala', type: 'City', description: 'Home to the Dalai Lama and beautiful pine forests.', imageUrl: 'https://images.unsplash.com/photo-1626714486519-798835848be4?q=80&w=1200' },
      { name: 'Jibhi', type: 'Village', description: 'A scenic, uncommercialized village in the Tirthan Valley.', imageUrl: 'https://images.unsplash.com/photo-1601630132147-195ff15c0e14?q=80&w=1200' }
    ]
  },
  {
    name: 'Rajasthan', type: 'State', imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200',
    children: [
      { name: 'Jaipur', type: 'City', description: 'The Pink City, known for its royal heritage and architecture.', imageUrl: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1200' },
      { name: 'Jaisalmer', type: 'City', description: 'The Golden City, standing on a ridge of yellowish sandstone.', imageUrl: 'https://images.unsplash.com/photo-1599818826723-10c3773b4009?q=80&w=1200' },
      { name: 'Pushkar', type: 'Village', description: 'A holy town famous for its lake and the annual camel fair.', imageUrl: 'https://images.unsplash.com/photo-1618774163914-72cebd3ee9c1?q=80&w=1200' }
    ]
  },
  {
    name: 'Kerala', type: 'State', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200',
    children: [
      { name: 'Munnar', type: 'HiddenGem', description: 'Famous for its tea estates and rolling hills.', imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200' },
      { name: 'Alleppey', type: 'City', description: 'Known for its tranquil backwaters and houseboat cruises.', imageUrl: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=1200' },
      { name: 'Varkala', type: 'Village', description: 'A coastal town with beautiful red cliffs overlooking the Arabian Sea.', imageUrl: 'https://images.unsplash.com/photo-1589995646197-2394f724773c?q=80&w=1200' }
    ]
  },
  {
    name: 'Karnataka', type: 'State', imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200',
    children: [
      { name: 'Hampi', type: 'HiddenGem', description: 'An ancient village filled with ruins of the Vijayanagara Empire.', imageUrl: 'https://images.unsplash.com/photo-1620766165457-a80fe59217ab?q=80&w=1200' },
      { name: 'Gokarna', type: 'Village', description: 'A pilgrimage town with pristine, less-crowded beaches.', imageUrl: 'https://images.unsplash.com/photo-1590766940554-638c4c78d424?q=80&w=1200' },
      { name: 'Coorg', type: 'City', description: 'The Scotland of India, known for coffee plantations.', imageUrl: 'https://images.unsplash.com/photo-1598926065551-fb10c55452d3?q=80&w=1200' }
    ]
  },
  {
    name: 'Meghalaya', type: 'State', imageUrl: 'https://images.unsplash.com/photo-1590408544869-ecb0c7974da9?q=80&w=1200',
    children: [
      { name: 'Cherrapunji', type: 'HiddenGem', description: 'One of the wettest places on earth, famous for living root bridges.', imageUrl: 'https://images.unsplash.com/photo-1621532152077-0c7f1a3b1a8d?q=80&w=1200' },
      { name: 'Shillong', type: 'City', description: 'A beautiful hill station known for its music scene and cafes.', imageUrl: 'https://images.unsplash.com/photo-1626082218084-257a7d7efdb7?q=80&w=1200' },
      { name: 'Dawki', type: 'Village', description: 'Famous for the crystal clear Umngot River.', imageUrl: 'https://images.unsplash.com/photo-1617260593457-37fb57dcb104?q=80&w=1200' }
    ]
  },
  {
    name: 'Uttarakhand', type: 'State', imageUrl: 'https://images.unsplash.com/photo-1589307371536-1e64df22be72?q=80&w=1200',
    children: [
      { name: 'Rishikesh', type: 'City', description: 'Yoga capital of the world, sitting on the Ganges.', imageUrl: 'https://images.unsplash.com/photo-1598155523122-3842334d6c1f?q=80&w=1200' },
      { name: 'Valley of Flowers', type: 'HiddenGem', description: 'A UNESCO World Heritage site known for alpine flowers.', imageUrl: 'https://images.unsplash.com/photo-1604928641193-47cbdb436a56?q=80&w=1200' }
    ]
  },
  {
    name: 'Andaman Islands', type: 'State', imageUrl: 'https://images.unsplash.com/photo-1583099954045-8422736b47fc?q=80&w=1200',
    children: [
      { name: 'Havelock', type: 'HiddenGem', description: 'Famous for Radhanagar Beach and scuba diving.', imageUrl: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1200' },
      { name: 'Neil Island', type: 'Village', description: 'A quieter, more relaxed island near Havelock.', imageUrl: 'https://images.unsplash.com/photo-1554160453-61a067edebc1?q=80&w=1200' }
    ]
  }
];

export { users, locationHierarchy };
