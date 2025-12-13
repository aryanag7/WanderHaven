const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// === Models
const User = require('../models/user');
const Listing = require('../models/listing');
const Review = require('../models/review');

// === Config / Paths
const MONGO_URI = process.env.ATLASDB_URL;
if (!MONGO_URI) {
  console.error('Missing ATLASDB_URL in .env');
  process.exit(1);
}


const USERS_CSV    = path.join(__dirname, 'csv', 'users_clean.csv');
const LISTINGS_CSV = path.join(__dirname, 'csv', 'listings_clean.csv');
const REVIEWS_CSV  = path.join(__dirname, 'csv', 'reviews_clean.csv');

// ---------- helpers ----------
function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function uniqueUsername(base) {
  const core = (base || 'user')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '');   // simple slug
  let candidate = core || 'user';
  let n = 1;
  while (await User.exists({ username: candidate })) {
    candidate = `${core}${n++}`;
  }
  return candidate;
}


// very small html <br> cleanup for review comments
function stripSimpleBreaks(s) {
  if (!s) return s;
  return String(s)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

function toNumber(x, fallback = null) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

async function main() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // maps from external IDs to Mongo _ids
  const userIdBySource = new Map();
  const listingIdBySource = new Map();

  // ===== 1) Users =====
  console.log('Reading users CSV…');
  const rawUsers = await readCsv(USERS_CSV);

  console.log('Upserting ' + rawUsers.length + ' users…');
  for (const u of rawUsers) {
    const source_id = (u.source_id || '').trim();             // e.g., "h:317540555"
    const email = (u.email || '').trim().toLowerCase();
    if (!email) continue;

    const preferred = (u.username || email.split('@')[0]);    // base name
    const username = await uniqueUsername(preferred);         // ensure uniqueness
    const createdAt = u.createdAt ? new Date(u.createdAt) : new Date();

    // Upsert by email; set username only on insert
    const res = await User.findOneAndUpdate(
        { email },
        { $setOnInsert: { email, username, createdAt } },
        { new: true, upsert: true }
    ).lean();

    if (source_id) userIdBySource.set(source_id, res._id);
}
console.log(`Users ready. Mapped ${userIdBySource.size} source user IDs.\n`);


  // ===== 2) Listings =====
  console.log('Reading listings CSV…');
  const rawListings = await readCsv(LISTINGS_CSV);

  console.log(`Upserting ${rawListings.length} listings…`);
  for (const l of rawListings) {
    const listing_source_id = (l.listing_source_id || '').trim();
    const owner_source_id = (l.owner_source_id || '').trim();

    const ownerId = userIdBySource.get(owner_source_id) || null;
    if (!ownerId) {
      // If no owner exists (e.g., users limited down), skip this listing
      continue;
    }

    const title = (l.title || '').toString().trim();
    if (!title) continue;

    const description = (l.description || '').toString().trim();
    const image = {
      url: (l.image_url || '').toString().trim(),
      filename: (l.image_filename || '').toString().trim(),
    };

    const price = toNumber(l.price, 0);
    const location = (l.location || 'Unknown').toString().trim();
    const country = (l.country || 'United States').toString().trim();

    const lng = toNumber(l.lng, null);
    const lat = toNumber(l.lat, null);

    const geometry = (lng != null && lat != null)
      ? { type: 'Point', coordinates: [lng, lat] }
      : { type: 'Point', coordinates: [-73.9851, 40.7580] }; // safe default (NYC)

    // force category into your enum; fallback to 'cities'
    const allowedCats = [
      'mountains','beaches','cities','forests','campings','pools',
      'treehouses','top-of-the-world'
    ];
    let category = (l.category || '').toString().trim().toLowerCase();
    if (!allowedCats.includes(category)) category = 'cities';

    // Upsert key: (title + owner). That’s stable enough for append-only seeding.
    const listingDoc = await Listing.findOneAndUpdate(
      { title, owner: ownerId },
      {
        $setOnInsert: {
          title, description, image, price, location, country, owner: ownerId,
          geometry, category
        }
      },
      { new: true, upsert: true }
    ).lean();

    if (listing_source_id) listingIdBySource.set(listing_source_id, listingDoc._id);
  }
  console.log(`Listings ready. Mapped ${listingIdBySource.size} source listing IDs.\n`);

  // ===== 3) Reviews =====
  console.log('Reading reviews CSV…');
  const rawReviews = await readCsv(REVIEWS_CSV);

  console.log(`Upserting ${rawReviews.length} reviews…`);
  for (const r of rawReviews) {
    const listing_source_id = (r.listing_source_id || '').trim();
    const author_source_id = (r.author_source_id || '').trim();

    const listingId = listingIdBySource.get(listing_source_id);
    const authorId  = userIdBySource.get(author_source_id);

    if (!listingId || !authorId) continue; // skip if mapping missing

    const comment  = stripSimpleBreaks(r.comment || '');
    const rating   = Math.min(5, Math.max(1, toNumber(r.rating, 5)));
    const createdAt = r.createdAt ? new Date(r.createdAt) : new Date();

    // Upsert key: (listingId, authorId, createdAt) – avoids dupes across re-runs
    const reviewDoc = await Review.findOneAndUpdate(
      { listingId, authorId, createdAt }, 
      {},
      {}
    ).lean();

    // Because Review schema doesn't store listingId, we dedupe manually:
    const maybeExisting = await Review.findOne({
      author: authorId,
      createdAt,
      comment: { $regex: '^' + escapeRegExp(comment.slice(0, 120)) }
    }).lean();

    let finalReview;
    if (maybeExisting) {
      finalReview = maybeExisting;
    } else {
      finalReview = await Review.create({ comment, rating, createdAt, author: authorId });
      // attach to listing.reviews (no duplicates)
      await Listing.updateOne(
        { _id: listingId },
        { $addToSet: { reviews: finalReview._id } }
      );
    }
  }
  console.log('Reviews seeded and linked.\n');

  await mongoose.connection.close();
  console.log('Done. Connection closed.');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
