import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  console.log('Running automated semantic tagging for existing blogs...');
  const blogs = await prisma.blog.findMany({ where: { tags: { isEmpty: true } } });
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('No GEMINI_API_KEY found.');
    return;
  }
  
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  for (const blog of blogs) {
    console.log('Processing:', blog.title);
    const cleanContent = blog.richContent.replace(/<[^>]+>/g, '');
    
    try {
      const prompt = `
        Analyze the following travel blog post titled "${blog.title}".
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
      
      await prisma.blog.update({
        where: { id: blog.id },
        data: {
          tags: parsed.tags || [],
          readingTime: parsed.readingTime || 3,
          aiSummary: parsed.summary || ""
        }
      });
      console.log('Success:', parsed.tags);
    } catch (err) {
      console.error('Failed for', blog.title, err.message);
    }
  }
  
  console.log('Finished semantic tagging.');
}

run().finally(() => prisma.$disconnect());
