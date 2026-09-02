import axios from 'axios';
import fs from 'fs';

const locations = {
  "Spiti Valley": "Spiti_Valley",
  "Hampi": "Hampi",
  "Munnar": "Munnar",
  "Gokarna": "Gokarna,_Karnataka",
  "Jaisalmer": "Jaisalmer",
  "Cherrapunji": "Cherrapunji",
  "Rishikesh": "Rishikesh",
  "Valley of Flowers": "Valley_of_Flowers_National_Park",
  "Havelock": "Swaraj_Dweep",
  "Pink City": "Jaipur",
  "McLeod Ganj": "McLeod_Ganj",
  "Varkala": "Varkala",
  "Tirthan Valley": "Great_Himalayan_National_Park"
};

async function getWikiImage(title) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1200`;
    const { data } = await axios.get(url);
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    return page.thumbnail?.source || null;
  } catch (err) {
    return null;
  }
}

async function run() {
  const images = {};
  for (const [key, title] of Object.entries(locations)) {
    let img = await getWikiImage(title);
    if (!img) {
      console.log(`Failed for ${key}, falling back to general unsplash`);
      img = `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200`; // Fallback
    }
    images[key] = img;
    console.log(`${key}: ${img}`);
  }
  
  // Now read storiesPart1.js and storiesPart2.js and replace the URLs
  let p1 = fs.readFileSync('prisma/storiesPart1.js', 'utf8');
  let p2 = fs.readFileSync('prisma/storiesPart2.js', 'utf8');
  
  // A mapping from Title snippet to location key
  const titleMapping = {
    "Spiti Valley's Hidden": "Spiti Valley",
    "Ruins of Vijayanagara": "Hampi",
    "Monsoon Retreat in Munnar": "Munnar",
    "The Goa We Lost": "Gokarna",
    "A Week in Jaisalmer": "Jaisalmer",
    "Waterfalls in Cherrapunji": "Cherrapunji",
    "Rishikesh on a Shoestring": "Rishikesh",
    "Valley of Flowers": "Valley of Flowers",
    "Scuba in Havelock": "Havelock",
    "the Pink City": "Pink City",
    "Zen in McLeod Ganj": "McLeod Ganj",
    "The Vibe of Varkala": "Varkala",
    "Tirthan Valley": "Tirthan Valley"
  };

  for (const [snippet, loc] of Object.entries(titleMapping)) {
    const imgUrl = images[loc];
    const regex = new RegExp(`(title:\\s*'.*?${snippet}.*?',\\s*coverImage:\\s*').*?(')`, 'g');
    p1 = p1.replace(regex, `$1${imgUrl}$2`);
    p2 = p2.replace(regex, `$1${imgUrl}$2`);
  }
  
  fs.writeFileSync('prisma/storiesPart1.js', p1);
  fs.writeFileSync('prisma/storiesPart2.js', p2);
  
  console.log("Files updated with true Wiki images!");
}

run();
