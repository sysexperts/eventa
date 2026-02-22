import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Spotify API credentials - set these as environment variables
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string; height: number; width: number }[];
  popularity: number;
  external_urls: {
    spotify: string;
  };
  followers: {
    total: number;
  };
}

interface ArtistData {
  name: string;
  bio?: string;
  imageUrl?: string;
  genre?: string;
  tags?: string[];
  spotify?: string;
}

async function getSpotifyAccessToken(): Promise<string> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error("Spotify credentials not set. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get Spotify access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function searchSpotifyArtists(query: string, token: string, limit: number = 50): Promise<SpotifyArtist[]> {
  const artists: SpotifyArtist[] = [];
  let offset = 0;
  const maxLimit = Math.min(limit, 200); // Spotify API limit

  while (artists.length < maxLimit) {
    const batchSize = Math.min(50, maxLimit - artists.length);
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${batchSize}&offset=${offset}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Spotify API error: ${response.statusText}`);
      break;
    }

    const data = await response.json();
    const items = data.artists?.items || [];

    if (items.length === 0) break;

    artists.push(...items);
    offset += batchSize;

    if (items.length < batchSize) break; // No more results
  }

  return artists;
}

function convertSpotifyArtistToData(spotifyArtist: SpotifyArtist, communityTag?: string | null): ArtistData {
  const imageUrl = spotifyArtist.images.length > 0 
    ? spotifyArtist.images[0].url 
    : undefined;

  const genre = spotifyArtist.genres.length > 0 
    ? spotifyArtist.genres[0] 
    : undefined;

  // Start with genre tags (max 5)
  const tags = spotifyArtist.genres.slice(0, 5);
  
  // Add community tag if provided
  if (communityTag && !tags.includes(communityTag)) {
    tags.unshift(communityTag); // Add at the beginning
  }

  return {
    name: spotifyArtist.name,
    bio: `${spotifyArtist.name} ist ein Künstler mit ${spotifyArtist.followers.total.toLocaleString("de-DE")} Followern auf Spotify.`,
    imageUrl,
    genre,
    tags,
    spotify: spotifyArtist.external_urls.spotify,
  };
}

async function importArtistsToDatabase(artists: ArtistData[], dryRun: boolean = false): Promise<void> {
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const artistData of artists) {
    try {
      // Generate slug
      const slug = artistData.name
        .toLowerCase()
        .replace(/[^a-z0-9äöüß]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check if artist already exists
      const existing = await prisma.artist.findUnique({ where: { slug } });

      if (existing) {
        console.log(`⏭️  Skipped: ${artistData.name} (already exists)`);
        skipped++;
        continue;
      }

      if (dryRun) {
        console.log(`✓ Would create: ${artistData.name}`);
        created++;
        continue;
      }

      await prisma.artist.create({
        data: {
          name: artistData.name,
          slug,
          bio: artistData.bio || "",
          imageUrl: artistData.imageUrl || null,
          genre: artistData.genre || "",
          tags: artistData.tags || [],
          spotify: artistData.spotify || null,
        },
      });

      console.log(`✓ Created: ${artistData.name}`);
      created++;
    } catch (error: any) {
      console.error(`❌ Error creating ${artistData.name}:`, error.message);
      errors++;
    }
  }

  console.log("\n📊 Summary:");
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${artists.length}`);
}

// Map query keywords to community tags
function detectCommunityTag(query: string): string | null {
  const queryLower = query.toLowerCase();
  
  const communityMap: { [key: string]: string } = {
    "turkish": "turkish",
    "türk": "turkish",
    "greek": "greek",
    "griechisch": "greek",
    "arabic": "arabic",
    "arabisch": "arabic",
    "polish": "polish",
    "polnisch": "polish",
    "romanian": "romanian",
    "rumänisch": "romanian",
    "italian": "italian",
    "italienisch": "italian",
    "spanish": "spanish",
    "spanisch": "spanish",
    "balkan": "balkan",
    "serbian": "balkan",
    "croatian": "croatian",
    "kroatisch": "croatian",
    "russian": "russian",
    "russisch": "russian",
    "persian": "persian",
    "persisch": "persian",
    "kurdish": "kurdish",
    "kurdisch": "kurdish",
    "african": "african",
    "afrikanisch": "african",
    "latin": "latin",
    "lateinamerikanisch": "latin",
  };

  for (const [keyword, tag] of Object.entries(communityMap)) {
    if (queryLower.includes(keyword)) {
      return tag;
    }
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  let query = "turkish music";
  let limit = 50;
  let dryRun = false;
  let saveToFile = false;
  let communityTag: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--query" && args[i + 1]) {
      query = args[i + 1];
      i++;
    } else if (args[i] === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    } else if (args[i] === "--save") {
      saveToFile = true;
    } else if (args[i] === "--community" && args[i + 1]) {
      communityTag = args[i + 1];
      i++;
    }
  }

  // Auto-detect community tag from query if not explicitly set
  if (!communityTag) {
    communityTag = detectCommunityTag(query);
  }

  console.log("🎵 Spotify Artist Importer\n");
  console.log(`Query: "${query}"`);
  console.log(`Limit: ${limit}`);
  console.log(`Dry Run: ${dryRun ? "Yes" : "No"}\n`);

  try {
    // Get Spotify access token
    console.log("🔑 Getting Spotify access token...");
    const token = await getSpotifyAccessToken();
    console.log("✓ Access token obtained\n");

    // Search for artists
    console.log(`🔍 Searching for artists: "${query}"...`);
    const spotifyArtists = await searchSpotifyArtists(query, token, limit);
    console.log(`✓ Found ${spotifyArtists.length} artists\n`);

    if (spotifyArtists.length === 0) {
      console.log("No artists found. Try a different query.");
      return;
    }

    // Convert to our format
    const artists = spotifyArtists.map((artist) => convertSpotifyArtistToData(artist, communityTag));

    // Save to file if requested
    if (saveToFile) {
      const filename = `artists-${Date.now()}.json`;
      const filepath = path.join(process.cwd(), filename);
      fs.writeFileSync(filepath, JSON.stringify({ artists }, null, 2));
      console.log(`💾 Saved to ${filename}\n`);
    }

    // Import to database
    console.log("📥 Importing artists to database...\n");
    await importArtistsToDatabase(artists, dryRun);

    if (dryRun) {
      console.log("\n💡 This was a dry run. Run without --dry-run to actually import.");
    }
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
