import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database…");

  const hashedPassword = await bcrypt.hash("password123", 12);

  // Create demo artist
  const artist = await prisma.user.upsert({
    where: { email: "artist@demo.com" },
    update: {},
    create: {
      name: "Alex Ink",
      email: "artist@demo.com",
      password: hashedPassword,
      role: "ARTIST",
      artistProfile: {
        create: {
          displayName: "Alex Ink Studio",
          bio: "Fine line and blackwork specialist based in Austin. 8 years experience. Specializing in botanical, geometric, and minimalist designs.",
          location: "Austin, TX",
          instagramHandle: "alexinkstudio",
          depositAmount: 75,
          allowFlash: true,
          allowCustom: true,
          portfolioImages: JSON.stringify([
            "https://images.unsplash.com/photo-1542643516-21145bca78ef?w=800",
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
            "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800",
          ]),
          sizeOptions: {
            create: [
              { label: "Tiny (under 1 inch)", price: 80, sortOrder: 0 },
              { label: "Small (1–2 inches)", price: 120, sortOrder: 1 },
              { label: "Medium (3–4 inches)", price: 200, sortOrder: 2 },
              { label: "Large (5–7 inches)", price: 350, sortOrder: 3 },
              { label: "XL (8+ inches)", price: 500, sortOrder: 4 },
            ],
          },
          flashDesigns: {
            create: [
              {
                name: "Botanical Rose",
                description: "Fine line rose with delicate petals",
                imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600",
                available: true,
                basePrice: 150,
                sortOrder: 0,
              },
              {
                name: "Geometric Moon",
                description: "Sacred geometry moon phases",
                imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600",
                available: true,
                basePrice: 120,
                sortOrder: 1,
              },
              {
                name: "Minimalist Wave",
                description: "Single line ocean wave",
                imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600",
                available: true,
                basePrice: 100,
                sortOrder: 2,
              },
            ],
          },
        },
      },
    },
    include: { artistProfile: true },
  });

  // Create demo client
  await prisma.user.upsert({
    where: { email: "client@demo.com" },
    update: {},
    create: {
      name: "Jamie Smith",
      email: "client@demo.com",
      password: hashedPassword,
      role: "CLIENT",
    },
  });

  console.log("Seed complete!");
  console.log("Demo accounts:");
  console.log("  Artist: artist@demo.com / password123");
  console.log("  Client: client@demo.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
