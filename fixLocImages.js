import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const imageMapping = {
  'Spiti Valley': 'https://images.unsplash.com/photo-1616422285623-1498b3fdfa8e?q=80&w=1200',
  'Leh': 'https://images.unsplash.com/photo-1581458925433-28956bbaeb09?q=80&w=1200',
  'Ladakh': 'https://images.unsplash.com/photo-1581458925433-28956bbaeb09?q=80&w=1200',
  'Pangong Tso': 'https://images.unsplash.com/photo-1582236081498-f2b7407dd293?q=80&w=1200',
  'Nubra Valley': 'https://images.unsplash.com/photo-1620959458999-56fb083bdfd8?q=80&w=1200',
  'Munnar': 'https://images.unsplash.com/photo-1593693397690-362bceb63750?q=80&w=1200',
  'Kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200',
  'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200',
  'Arambol': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200',
  'Palolem': 'https://images.unsplash.com/photo-1549474757-0a4ebad031e6?q=80&w=1200',
  'Hampi': 'https://images.unsplash.com/photo-1600100397608-f010f4198f58?q=80&w=1200',
  'Jaipur': 'https://images.unsplash.com/photo-1599661559905-2b47fc32d849?q=80&w=1200',
  'Rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200',
  'Jaisalmer': 'https://images.unsplash.com/photo-1599818826723-10c3773b4009?q=80&w=1200',
  'Cherrapunji': 'https://images.unsplash.com/photo-1621532152077-0c7f1a3b1a8d?q=80&w=1200',
  'Meghalaya': 'https://images.unsplash.com/photo-1590408544869-ecb0c7974da9?q=80&w=1200',
  'Rishikesh': 'https://images.unsplash.com/photo-1598155523122-3842334d6c1f?q=80&w=1200',
  'Valley of Flowers': 'https://images.unsplash.com/photo-1604928641193-47cbdb436a56?q=80&w=1200',
  'Auli': 'https://images.unsplash.com/photo-1605553072230-6f91f75d506d?q=80&w=1200',
  'Uttarakhand': 'https://images.unsplash.com/photo-1589307371536-1e64df22be72?q=80&w=1200',
  'Gangtok': 'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200',
  'Sikkim': 'https://images.unsplash.com/photo-1563811471017-d5d4d3cc820c?q=80&w=1200',
  'Gurudongmar Lake': 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1200',
  'Havelock': 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1200',
  'Andaman Islands': 'https://images.unsplash.com/photo-1583099954045-8422736b47fc?q=80&w=1200',
  'Himachal Pradesh': 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200',
  'Dharamshala': 'https://images.unsplash.com/photo-1626714486519-798835848be4?q=80&w=1200',
  'Jibhi': 'https://images.unsplash.com/photo-1601630132147-195ff15c0e14?q=80&w=1200',
  'Pushkar': 'https://images.unsplash.com/photo-1618774163914-72cebd3ee9c1?q=80&w=1200',
  'Alleppey': 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=1200',
  'Varkala': 'https://images.unsplash.com/photo-1589995646197-2394f724773c?q=80&w=1200',
  'Karnataka': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200',
  'Gokarna': 'https://images.unsplash.com/photo-1590766940554-638c4c78d424?q=80&w=1200',
  'Coorg': 'https://images.unsplash.com/photo-1598926065551-fb10c55452d3?q=80&w=1200',
  'Shillong': 'https://images.unsplash.com/photo-1626082218084-257a7d7efdb7?q=80&w=1200',
  'Dawki': 'https://images.unsplash.com/photo-1617260593457-37fb57dcb104?q=80&w=1200',
  'Neil Island': 'https://images.unsplash.com/photo-1554160453-61a067edebc1?q=80&w=1200'
};

const defaultImage = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200';

async function run() {
  const locs = await prisma.location.findMany();
  
  let fixedCount = 0;
  for (const l of locs) {
    if (!l.imageUrl || !l.imageUrl.startsWith('http')) {
      const targetImage = imageMapping[l.name] || defaultImage;
      await prisma.location.update({
        where: { id: l.id },
        data: { imageUrl: targetImage }
      });
      fixedCount++;
    }
  }
  
  console.log('Fixed', fixedCount, 'locations!');
}

run().finally(() => prisma.$disconnect());
