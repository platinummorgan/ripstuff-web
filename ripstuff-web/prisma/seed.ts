import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Define enum values as constants to match Prisma schema
const GraveStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  HIDDEN: 'HIDDEN'
} as const

const GraveCategory = {
  TECH_GADGETS: 'TECH_GADGETS',
  KITCHEN_FOOD: 'KITCHEN_FOOD', 
  CLOTHING_LAUNDRY: 'CLOTHING_LAUNDRY',
  TOYS_GAMES: 'TOYS_GAMES',
  CAR_TOOLS: 'CAR_TOOLS',
  PETS_CHEWABLES: 'PETS_CHEWABLES',
  OUTDOORS_ACCIDENTS: 'OUTDOORS_ACCIDENTS',
  MISC: 'MISC'
} as const

async function main() {
  const sampleGraves = [
    {
      title: "My First iPhone",
      slug: "my-first-iphone",
      datesText: "2007-2012",
      backstory: "Dropped in the toilet during an important call",
      eulogyText: "Here lies my trusty first-gen iPhone, a revolutionary device that changed my life until it met its watery demise. Through countless calls, texts, and that revolutionary pinch-to-zoom, you served me well. May you rest in peace in that great Apple Store in the sky.",
      category: GraveCategory.TECH_GADGETS,
      status: GraveStatus.APPROVED,
      featured: true,
      mapX: 5,
      mapY: 7,
      photoUrl: null
    },
    {
      title: "Grandma's Cast Iron Skillet",
      slug: "grandmas-cast-iron-skillet",
      datesText: "1950-2025",
      backstory: "Cracked after decades of faithful service",
      eulogyText: "A pan is not just a pan when it carries generations of memories. Through countless Sunday dinners and holiday feasts, you seasoned not just our food but our lives. Your perfectly seasoned surface may have cracked, but our hearts are more broken.",
      category: GraveCategory.KITCHEN_FOOD,
      status: GraveStatus.APPROVED,
      featured: true,
      mapX: 3,
      mapY: 4,
      photoUrl: null
    },
    {
      title: "Lucky Running Shoes",
      slug: "lucky-running-shoes",
      datesText: "2023-2025",
      backstory: "Worn through after 1000 miles",
      eulogyText: "From your first fresh-out-of-the-box step to your final tattered mile, you carried me through rain, shine, and countless PR attempts. The holes in your soles match the hole in my heart. Run free in shoe heaven.",
      category: GraveCategory.CLOTHING_LAUNDRY,
      status: GraveStatus.APPROVED,
      featured: false,
      mapX: 8,
      mapY: 8,
      photoUrl: null
    },
    {
      title: "GameBoy Color",
      slug: "gameboy-color",
      datesText: "1999-2024",
      backstory: "Screen died after 25 years of Pokemon",
      eulogyText: "Through endless Pokemon battles and Tetris marathons, you were my constant companion. Your pixels may have faded, but the memories never will. Thank you for all the adventures, old friend.",
      category: GraveCategory.TOYS_GAMES,
      status: GraveStatus.APPROVED,
      featured: true,
      mapX: 2,
      mapY: 6,
      photoUrl: null
    }
  ];

  for (const grave of sampleGraves) {
    await prisma.grave.upsert({
      where: { slug: grave.slug },
      update: grave,
      create: {
        ...grave,
        creatorDeviceHash: "seed-script",
        heartCount: Math.floor(Math.random() * 50),
        candleCount: Math.floor(Math.random() * 30),
        roseCount: Math.floor(Math.random() * 20),
        lolCount: Math.floor(Math.random() * 10),
      }
    });
  }

  console.log('Sample graves created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });