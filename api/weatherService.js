import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Canonical database of 100+ Indian travel destinations with verified states and coordinates
export const INDIAN_LOCATIONS = {
  // Himachal Pradesh
  'spiti': { name: 'Kaza (Spiti Valley)', admin1: 'Himachal Pradesh', latitude: 32.2276, longitude: 78.0710 },
  'spiti valley': { name: 'Kaza (Spiti Valley)', admin1: 'Himachal Pradesh', latitude: 32.2276, longitude: 78.0710 },
  'kaza': { name: 'Kaza', admin1: 'Himachal Pradesh', latitude: 32.2276, longitude: 78.0710 },
  'tabo': { name: 'Tabo', admin1: 'Himachal Pradesh', latitude: 32.0924, longitude: 78.3820 },
  'manali': { name: 'Manali', admin1: 'Himachal Pradesh', latitude: 32.2396, longitude: 77.1887 },
  'old manali': { name: 'Old Manali', admin1: 'Himachal Pradesh', latitude: 32.2530, longitude: 77.1750 },
  'shimla': { name: 'Shimla', admin1: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734 },
  'dharamshala': { name: 'Dharamshala', admin1: 'Himachal Pradesh', latitude: 32.2190, longitude: 76.3234 },
  'mcleodganj': { name: 'McLeod Ganj', admin1: 'Himachal Pradesh', latitude: 32.2426, longitude: 76.3213 },
  'jibhi': { name: 'Jibhi', admin1: 'Himachal Pradesh', latitude: 31.6385, longitude: 77.3486 },
  'tirthan': { name: 'Tirthan Valley', admin1: 'Himachal Pradesh', latitude: 31.6420, longitude: 77.3430 },
  'tirthan valley': { name: 'Tirthan Valley', admin1: 'Himachal Pradesh', latitude: 31.6420, longitude: 77.3430 },
  'kasol': { name: 'Kasol (Parvati Valley)', admin1: 'Himachal Pradesh', latitude: 32.0100, longitude: 77.3150 },
  'parvati valley': { name: 'Parvati Valley', admin1: 'Himachal Pradesh', latitude: 32.0100, longitude: 77.3150 },
  'bir billing': { name: 'Bir Billing', admin1: 'Himachal Pradesh', latitude: 32.0460, longitude: 76.7170 },
  'bir': { name: 'Bir Billing', admin1: 'Himachal Pradesh', latitude: 32.0460, longitude: 76.7170 },
  'dalhousie': { name: 'Dalhousie', admin1: 'Himachal Pradesh', latitude: 32.5387, longitude: 75.9709 },
  'khajjiar': { name: 'Khajjiar', admin1: 'Himachal Pradesh', latitude: 32.5518, longitude: 76.0617 },
  'kalpa': { name: 'Kalpa (Kinnaur)', admin1: 'Himachal Pradesh', latitude: 31.5369, longitude: 78.2562 },
  'sangla': { name: 'Sangla (Kinnaur)', admin1: 'Himachal Pradesh', latitude: 31.4239, longitude: 78.2612 },
  'chitkul': { name: 'Chitkul (Last Village)', admin1: 'Himachal Pradesh', latitude: 31.3533, longitude: 78.4358 },
  'kinnaur': { name: 'Kinnaur Valley', admin1: 'Himachal Pradesh', latitude: 31.5830, longitude: 78.3490 },

  // Ladakh
  'leh': { name: 'Leh', admin1: 'Ladakh', latitude: 34.1526, longitude: 77.5771 },
  'ladakh': { name: 'Leh (Ladakh)', admin1: 'Ladakh', latitude: 34.1526, longitude: 77.5771 },
  'leh ladakh': { name: 'Leh (Ladakh)', admin1: 'Ladakh', latitude: 34.1526, longitude: 77.5771 },
  'nubra': { name: 'Nubra Valley', admin1: 'Ladakh', latitude: 34.6863, longitude: 77.5673 },
  'nubra valley': { name: 'Nubra Valley', admin1: 'Ladakh', latitude: 34.6863, longitude: 77.5673 },
  'hunder': { name: 'Hunder (Nubra)', admin1: 'Ladakh', latitude: 34.5778, longitude: 77.4725 },
  'diskit': { name: 'Diskit (Nubra)', admin1: 'Ladakh', latitude: 34.5424, longitude: 77.5615 },
  'pangong': { name: 'Pangong Tso', admin1: 'Ladakh', latitude: 33.7595, longitude: 78.6674 },
  'pangong tso': { name: 'Pangong Tso', admin1: 'Ladakh', latitude: 33.7595, longitude: 78.6674 },
  'tso moriri': { name: 'Tso Moriri', admin1: 'Ladakh', latitude: 32.9000, longitude: 78.3167 },
  'zanskar': { name: 'Zanskar Valley (Padum)', admin1: 'Ladakh', latitude: 33.4682, longitude: 76.8833 },
  'kargil': { name: 'Kargil', admin1: 'Ladakh', latitude: 34.5539, longitude: 76.1349 },
  'turtuk': { name: 'Turtuk (Balti Village)', admin1: 'Ladakh', latitude: 34.8464, longitude: 76.8294 },

  // Uttarakhand
  'rishikesh': { name: 'Rishikesh', admin1: 'Uttarakhand', latitude: 30.0869, longitude: 78.2676 },
  'haridwar': { name: 'Haridwar', admin1: 'Uttarakhand', latitude: 29.9457, longitude: 78.1642 },
  'dehradun': { name: 'Dehradun', admin1: 'Uttarakhand', latitude: 30.3165, longitude: 78.0322 },
  'mussoorie': { name: 'Mussoorie', admin1: 'Uttarakhand', latitude: 30.4598, longitude: 78.0644 },
  'nainital': { name: 'Nainital', admin1: 'Uttarakhand', latitude: 29.3919, longitude: 79.4542 },
  'chopta': { name: 'Chopta (Mini Switzerland)', admin1: 'Uttarakhand', latitude: 30.4855, longitude: 79.1764 },
  'tungnath': { name: 'Tungnath', admin1: 'Uttarakhand', latitude: 30.4883, longitude: 79.2167 },
  'auli': { name: 'Auli', admin1: 'Uttarakhand', latitude: 30.5300, longitude: 79.5700 },
  'dhanaulti': { name: 'Dhanaulti', admin1: 'Uttarakhand', latitude: 30.4500, longitude: 78.2333 },
  'almora': { name: 'Almora', admin1: 'Uttarakhand', latitude: 29.5971, longitude: 79.6591 },
  'mukteshwar': { name: 'Mukteshwar', admin1: 'Uttarakhand', latitude: 29.4722, longitude: 79.6472 },
  'lansdowne': { name: 'Lansdowne', admin1: 'Uttarakhand', latitude: 29.8377, longitude: 78.6853 },
  'kedarnath': { name: 'Kedarnath', admin1: 'Uttarakhand', latitude: 30.7352, longitude: 79.0669 },
  'badrinath': { name: 'Badrinath', admin1: 'Uttarakhand', latitude: 30.7433, longitude: 79.4938 },

  // Rajasthan
  'jaipur': { name: 'Jaipur', admin1: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  'udaipur': { name: 'Udaipur', admin1: 'Rajasthan', latitude: 24.5854, longitude: 73.7125 },
  'jodhpur': { name: 'Jodhpur', admin1: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },
  'jaisalmer': { name: 'Jaisalmer (Thar Desert)', admin1: 'Rajasthan', latitude: 26.9157, longitude: 70.9083 },
  'pushkar': { name: 'Pushkar', admin1: 'Rajasthan', latitude: 26.4897, longitude: 74.5511 },
  'bikaner': { name: 'Bikaner', admin1: 'Rajasthan', latitude: 28.0229, longitude: 73.3119 },
  'mount abu': { name: 'Mount Abu', admin1: 'Rajasthan', latitude: 24.5926, longitude: 72.7156 },
  'ranthambore': { name: 'Ranthambore (Sawai Madhopur)', admin1: 'Rajasthan', latitude: 25.9928, longitude: 76.5031 },
  'bundi': { name: 'Bundi', admin1: 'Rajasthan', latitude: 25.4415, longitude: 75.6416 },

  // Kerala
  'munnar': { name: 'Munnar', admin1: 'Kerala', latitude: 10.0889, longitude: 77.0595 },
  'wayanad': { name: 'Wayanad', admin1: 'Kerala', latitude: 11.6854, longitude: 76.1320 },
  'varkala': { name: 'Varkala (Cliff Beach)', admin1: 'Kerala', latitude: 8.7379, longitude: 76.7163 },
  'alleppey': { name: 'Alleppey (Alappuzha)', admin1: 'Kerala', latitude: 9.4981, longitude: 76.3388 },
  'alappuzha': { name: 'Alappuzha', admin1: 'Kerala', latitude: 9.4981, longitude: 76.3388 },
  'kochi': { name: 'Kochi (Fort Kochi)', admin1: 'Kerala', latitude: 9.9312, longitude: 76.2673 },
  'thekkady': { name: 'Thekkady (Periyar)', admin1: 'Kerala', latitude: 9.6031, longitude: 77.1687 },
  'kovalam': { name: 'Kovalam', admin1: 'Kerala', latitude: 8.4004, longitude: 76.9787 },
  'vagamon': { name: 'Vagamon', admin1: 'Kerala', latitude: 9.6872, longitude: 76.9056 },

  // Goa
  'goa': { name: 'Panaji', admin1: 'Goa', latitude: 15.4909, longitude: 73.8278 },
  'north goa': { name: 'Anjuna (North Goa)', admin1: 'Goa', latitude: 15.5843, longitude: 73.7438 },
  'south goa': { name: 'Palolem (South Goa)', admin1: 'Goa', latitude: 15.0100, longitude: 74.0232 },
  'panaji': { name: 'Panaji', admin1: 'Goa', latitude: 15.4909, longitude: 73.8278 },
  'anjuna': { name: 'Anjuna', admin1: 'Goa', latitude: 15.5843, longitude: 73.7438 },
  'palolem': { name: 'Palolem', admin1: 'Goa', latitude: 15.0100, longitude: 74.0232 },
  'arambol': { name: 'Arambol', admin1: 'Goa', latitude: 15.6869, longitude: 73.7042 },

  // Karnataka
  'hampi': { name: 'Hampi', admin1: 'Karnataka', latitude: 15.3350, longitude: 76.4600 },
  'gokarna': { name: 'Gokarna', admin1: 'Karnataka', latitude: 14.5479, longitude: 74.3188 },
  'coorg': { name: 'Coorg (Madikeri)', admin1: 'Karnataka', latitude: 12.4244, longitude: 75.7382 },
  'chikmagalur': { name: 'Chikmagalur', admin1: 'Karnataka', latitude: 13.3161, longitude: 75.7720 },
  'mysore': { name: 'Mysuru (Mysore)', admin1: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
  'bangalore': { name: 'Bengaluru (Bangalore)', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  'dandeli': { name: 'Dandeli', admin1: 'Karnataka', latitude: 15.2361, longitude: 74.6228 },

  // Meghalaya & Northeast
  'shillong': { name: 'Shillong', admin1: 'Meghalaya', latitude: 25.5788, longitude: 91.8933 },
  'cherrapunji': { name: 'Cherrapunji (Sohra)', admin1: 'Meghalaya', latitude: 25.2986, longitude: 91.7315 },
  'sohra': { name: 'Sohra (Cherrapunji)', admin1: 'Meghalaya', latitude: 25.2986, longitude: 91.7315 },
  'dawki': { name: 'Dawki (Umngot River)', admin1: 'Meghalaya', latitude: 25.1878, longitude: 92.0197 },
  'mawlynnong': { name: 'Mawlynnong', admin1: 'Meghalaya', latitude: 25.2014, longitude: 91.9161 },
  'gangtok': { name: 'Gangtok', admin1: 'Sikkim', latitude: 27.3389, longitude: 88.6065 },
  'pelling': { name: 'Pelling', admin1: 'Sikkim', latitude: 27.3167, longitude: 88.2333 },
  'lachung': { name: 'Lachung (Yumthang)', admin1: 'Sikkim', latitude: 27.6891, longitude: 88.7430 },
  'kohima': { name: 'Kohima', admin1: 'Nagaland', latitude: 25.6751, longitude: 94.1086 },
  'dzukou': { name: 'Dzukou Valley', admin1: 'Nagaland', latitude: 25.5683, longitude: 94.0722 },
  'dzukou valley': { name: 'Dzukou Valley', admin1: 'Nagaland', latitude: 25.5683, longitude: 94.0722 },
  'tawang': { name: 'Tawang', admin1: 'Arunachal Pradesh', latitude: 27.5861, longitude: 91.8594 },
  'ziro': { name: 'Ziro Valley', admin1: 'Arunachal Pradesh', latitude: 27.5367, longitude: 93.8278 },
  'kaziranga': { name: 'Kaziranga National Park', admin1: 'Assam', latitude: 26.5775, longitude: 93.1711 },
  'majuli': { name: 'Majuli (River Island)', admin1: 'Assam', latitude: 26.9535, longitude: 94.2037 },

  // Madhya Pradesh & Gujarat
  'khajuraho': { name: 'Khajuraho', admin1: 'Madhya Pradesh', latitude: 24.8318, longitude: 79.9199 },
  'pachmarhi': { name: 'Pachmarhi', admin1: 'Madhya Pradesh', latitude: 22.4674, longitude: 78.4344 },
  'indore': { name: 'Indore', admin1: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  'ujjain': { name: 'Ujjain', admin1: 'Madhya Pradesh', latitude: 23.1765, longitude: 75.7885 },
  'orchha': { name: 'Orchha', admin1: 'Madhya Pradesh', latitude: 25.3512, longitude: 78.6416 },
  'kutch': { name: 'Rann of Kutch (Dhordo)', admin1: 'Gujarat', latitude: 23.8333, longitude: 69.8333 },
  'rann of kutch': { name: 'Rann of Kutch (Dhordo)', admin1: 'Gujarat', latitude: 23.8333, longitude: 69.8333 },
  'gir': { name: 'Gir National Park', admin1: 'Gujarat', latitude: 21.1243, longitude: 70.8242 },

  // Uttar Pradesh & Other Major Centers
  'varanasi': { name: 'Varanasi (Kashi)', admin1: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
  'agra': { name: 'Agra', admin1: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081 },
  'delhi': { name: 'New Delhi', admin1: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  'mumbai': { name: 'Mumbai', admin1: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  'darjeeling': { name: 'Darjeeling', admin1: 'West Bengal', latitude: 27.0410, longitude: 88.2663 },
  'ooty': { name: 'Ooty (Udhagamandalam)', admin1: 'Tamil Nadu', latitude: 11.4102, longitude: 76.6950 },
  'kodaikanal': { name: 'Kodaikanal', admin1: 'Tamil Nadu', latitude: 10.2381, longitude: 77.4892 },
  'srinagar': { name: 'Srinagar', admin1: 'Jammu & Kashmir', latitude: 34.0837, longitude: 74.7973 },
  'gulmarg': { name: 'Gulmarg', admin1: 'Jammu & Kashmir', latitude: 34.0484, longitude: 74.3805 },
  'pahalgam': { name: 'Pahalgam', admin1: 'Jammu & Kashmir', latitude: 34.0163, longitude: 75.3150 },
  'andaman': { name: 'Havelock Island (Swaraj Dweep)', admin1: 'Andaman & Nicobar', latitude: 11.9761, longitude: 92.9876 }
};

// Clean WMO weather condition code mapper
export const getWmoCondition = (code) => {
  if (code === 0) return { label: "Clear Sky", icon: "sun" };
  if (code === 1 || code === 2) return { label: "Partly Cloudy", icon: "cloud-sun" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if ([45, 48].includes(code)) return { label: "Foggy / Mist", icon: "cloud-fog" };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { label: "Rainy / Showers", icon: "cloud-rain" };
  if ([71, 73, 75, 85, 86].includes(code)) return { label: "Snowy", icon: "snowflake" };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", icon: "cloud-lightning" };
  return { label: "Pleasant & Breezy", icon: "wind" };
};

/**
 * Resolve destination to precise coordinates and official state name
 */
export async function resolveDestination(destination) {
  if (!destination) return null;
  const raw = destination.trim().toLowerCase();

  // 1. Direct dictionary match
  if (INDIAN_LOCATIONS[raw]) {
    const loc = INDIAN_LOCATIONS[raw];
    return { ...loc, country: 'India', foundVia: 'dictionary' };
  }

  // 2. Cleaned query match (strip "valley", "district", "tourism", "india")
  const stripped = raw
    .replace(/\b(valley|district|tourism|india|trip|tour|near|city)\b/gi, '')
    .replace(/[^\w\s]/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (INDIAN_LOCATIONS[stripped]) {
    const loc = INDIAN_LOCATIONS[stripped];
    return { ...loc, country: 'India', foundVia: 'dictionary-stripped' };
  }

  // Check if any key is contained in the query
  for (const [key, loc] of Object.entries(INDIAN_LOCATIONS)) {
    if (raw.includes(key) || key.includes(raw)) {
      return { ...loc, country: 'India', foundVia: 'dictionary-partial' };
    }
  }

  // 3. Open-Meteo Geocoding Search with India preference
  try {
    const searchName = stripped || raw;
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchName)}&count=10&language=en&format=json`;
    const res = await axios.get(geoUrl, { timeout: 6000 });
    const results = res.data?.results || [];

    if (results.length > 0) {
      // Prioritize Indian results
      const inMatch = results.find(r => r.country_code === 'IN' || r.country === 'India');
      const pick = inMatch || results[0];

      return {
        name: pick.name,
        admin1: pick.admin1 || pick.admin2 || '',
        country: pick.country || 'India',
        latitude: pick.latitude,
        longitude: pick.longitude,
        foundVia: 'open-meteo'
      };
    }
  } catch (err) {
    console.warn("Geocoding API network issue:", err.message);
  }

  return null;
}

/**
 * Generate smart packing essentials via Gemini AI with fast temperature fallback
 */
export async function generatePackingTips(destinationLabel, currentTemp, conditionLabel, rainProb, apiKey) {
  // Fallback heuristics
  const fallbackTips = [];
  if (currentTemp <= 5) {
    fallbackTips.push("Sub-zero thermal base layer", "Heavy windproof down parka", "Woolen fleece beanie & gloves", "High-traction waterproof trekking boots");
  } else if (currentTemp <= 15) {
    fallbackTips.push("Lightweight down jacket or fleece", "Thermal socks & sturdy walking shoes", "Moisturizing cold cream & lip balm", "Full-length windbreaker pants");
  } else if (currentTemp >= 30) {
    fallbackTips.push("Breathable linen/cotton wear", "UV polarized sunglasses & sun-hat", "Broad-spectrum SPF 50+ sunscreen", "Hydration electrolyte flask");
  } else {
    fallbackTips.push("Versatile layers (t-shirt + light hoodie)", "Comfortable walking sneakers", "UV protection sunglasses", "Compact hydration water flask");
  }

  if (rainProb > 25) {
    fallbackTips.push("Lightweight waterproof rain poncho");
  }

  // If Gemini API Key is available, use gemini-3.5-flash-lite for hyper-specific packing advice
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) return fallbackTips.slice(0, 4);

  try {
    const ai = new GoogleGenerativeAI(key);
    const model = ai.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

    const prompt = `You are a savvy travel gear advisor. A traveler is currently checking the live weather for "${destinationLabel}".
Live Temperature: ${currentTemp}°C
Weather: ${conditionLabel}
Precipitation Risk: ${rainProb}%

Provide EXACTLY 4 highly specific, essential items to pack for this destination and current weather conditions. 
Do not be generic. Name specific apparel or gear suited for this terrain (e.g. altitude cream for Spiti, linen beach shirt for Goa, leech gaiters or rain jacket for Meghalaya).
Return ONLY a valid JSON array of 4 strings, no markdown code blocks, e.g.:
["Item 1", "Item 2", "Item 3", "Item 4"]`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith('```json')) rawText = rawText.replace(/```json/, '').replace(/```/, '').trim();
    else if (rawText.startsWith('```')) rawText = rawText.replace(/```/g, '').trim();

    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed) && parsed.length >= 4) {
      return parsed.slice(0, 4);
    }
  } catch (err) {
    console.warn("Gemini packing tips fallback:", err.message);
  }

  return fallbackTips.slice(0, 4);
}
