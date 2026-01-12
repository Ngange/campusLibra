/*
 * Seed script for CampusLibra
 * - Creates roles/permissions
 * - Seeds 3 admins, 7 librarians, 15 members
 * - Imports ~570 books from Google Books API
 * - Distributes book creation actions among admins
 * - Generates 2-8 copies per book
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { validateEnv } = require('../src/config/env.validator');
const connectDB = require('../src/config/db');
const {
  createPermissionsIfNotExists,
} = require('../src/utils/permission.util');
const { createRolesIfNotExists } = require('../src/utils/role.util');

const User = require('../src/models/user.model');
const Role = require('../src/models/role.model');
const Book = require('../src/models/book.model');
const BookCopy = require('../src/models/bookCopy.model');
const BookAudit = require('../src/models/bookAudit.model');

validateEnv();

const REQUIRED_COUNTS = {
  admin: 3,
  librarian: 7,
  member: 15,
};

const TARGET_BOOKS = 570;
const BOOK_COPY_RANGE = { min: 2, max: 8 };

const topics = [
  'fiction',
  'science',
  'technology',
  'history',
  'art',
  'biography',
  'self help',
  'fantasy',
  'mystery',
  'romance',
  'business',
  'education',
  'psychology',
  'travel',
  'health',
  'philosophy',
  'children',
  'poetry',
  'sports',
  'computer science',
];

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const parsePublishedDate = (dateStr) => {
  if (!dateStr) return undefined;
  const normalized = dateStr.length === 4 ? `${dateStr}-01-01` : dateStr;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const pickIsbn = (identifiers = []) => {
  const isbn13 = identifiers.find((id) => id.type === 'ISBN_13');
  if (isbn13) return isbn13.identifier;
  const isbn10 = identifiers.find((id) => id.type === 'ISBN_10');
  if (isbn10) return isbn10.identifier;
  return null;
};

const fetchFn = global.fetch;
if (!fetchFn) {
  throw new Error(
    'Fetch API is not available in this Node runtime. Please use Node 18+.'
  );
}

async function seedUsers(roleName, count, namePrefix) {
  const role = await Role.findOne({ name: roleName });
  if (!role) {
    throw new Error(`Role ${roleName} not found. Seed roles before users.`);
  }

  const created = [];
  for (let i = 1; i <= count; i += 1) {
    const email = `${roleName}${i}@campuslibra.test`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: `${namePrefix} ${i}`,
        email,
        password: 'Password123!',
        role: role._id,
      });
      console.log(`Created ${roleName}: ${email}`);
    } else {
      console.log(`Existing ${roleName}: ${email}`);
    }
    created.push(user);
  }

  // If there are already extra users with this role, keep them available
  const extras = await User.find({
    role: role._id,
    email: { $nin: created.map((u) => u.email) },
  });
  return [...created, ...extras];
}

async function seedBookCopies(book, copyCount) {
  const copies = [];
  for (let i = 0; i < copyCount; i += 1) {
    const barcode = `BC-${book._id
      .toString()
      .slice(-6)}-${Date.now()}-${i}-${randomInt(100, 999)}`;
    const location = `Shelf ${String.fromCharCode(65 + (i % 6))}-${randomInt(
      1,
      12
    )}`;
    const copy = await BookCopy.create({
      book: book._id,
      Barcode: barcode,
      status: 'available',
      location,
    });
    copies.push(copy);
  }
  return copies;
}

async function createAuditRecord(bookId, performedBy, details) {
  if (!performedBy) return;
  await BookAudit.create({
    book: bookId,
    action: 'seed_create_book',
    performedBy,
    details,
  });
}

async function seedBooks(targetCount, admins) {
  if (!admins.length) {
    throw new Error('No admin users available to attribute book creation.');
  }

  let createdCount = 0;
  let attempted = 0;
  let topicIndex = 0;
  const seenIsbns = new Set();

  while (createdCount < targetCount && topicIndex < topics.length) {
    const topic = topics[topicIndex];
    for (
      let start = 0;
      start < 200 && createdCount < targetCount;
      start += 40
    ) {
      const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(
        topic
      )}&startIndex=${start}&maxResults=40&printType=books&langRestrict=en`;
      attempted += 1;
      try {
        const res = await fetchFn(url);
        if (!res.ok) {
          console.warn(
            `Google Books request failed (${res.status}) for topic ${topic}`
          );
          continue;
        }
        const data = await res.json();
        const items = data.items || [];
        for (const item of items) {
          if (createdCount >= targetCount) break;
          const info = item.volumeInfo || {};
          const title = (info.title || 'Untitled Book').trim();
          const author = (
            info.authors && info.authors.length
              ? info.authors.join(', ')
              : 'Unknown Author'
          ).trim();
          const isbn = pickIsbn(info.industryIdentifiers || []);

          // Skip if ISBN already seeded in this run or DB
          if (isbn) {
            if (seenIsbns.has(isbn)) continue;
            const existingByIsbn = await Book.findOne({ isbn });
            if (existingByIsbn) {
              seenIsbns.add(isbn);
              continue;
            }
          } else {
            const duplicateByTitle = await Book.findOne({ title, author });
            if (duplicateByTitle) continue;
          }

          const book = await Book.create({
            title,
            author,
            isbn: isbn || undefined,
            publishedDate: parsePublishedDate(info.publishedDate),
            category:
              (info.categories && info.categories.length
                ? info.categories[0]
                : topic) || undefined,
          });

          // Track seen ISBNs to avoid duplicates in this run
          if (isbn) seenIsbns.add(isbn);

          // Attribute creation round-robin across admins
          const creator = admins[createdCount % admins.length];
          await createAuditRecord(book._id, creator._id, {
            source: 'google-books',
            topic,
            googleId: item.id,
          });

          const copiesToCreate = randomInt(
            BOOK_COPY_RANGE.min,
            BOOK_COPY_RANGE.max
          );
          await seedBookCopies(book, copiesToCreate);

          createdCount += 1;
          if (createdCount % 25 === 0) {
            console.log(`Books created so far: ${createdCount}/${targetCount}`);
          }
        }
      } catch (err) {
        console.error(`Error fetching books for topic ${topic}:`, err.message);
      }
    }
    topicIndex += 1;
  }

  if (createdCount < targetCount) {
    const remaining = targetCount - createdCount;
    console.log(
      `Google Books provided ${createdCount}. Seeding ${remaining} synthetic books to reach target.`
    );
    for (let i = 0; i < remaining; i += 1) {
      const idx = createdCount + i + 1;
      const title = `Seeded Book ${idx}`;
      const author = `CampusLibra Author ${randomInt(1, 200)}`;
      const isbn = `SEED-${Date.now()}-${idx}-${randomInt(1000, 9999)}`;
      const category = topics[idx % topics.length];
      const book = await Book.create({ title, author, isbn, category });
      const creator = admins[(createdCount + i) % admins.length];
      await createAuditRecord(book._id, creator._id, {
        source: 'synthetic',
      });
      const copiesToCreate = randomInt(
        BOOK_COPY_RANGE.min,
        BOOK_COPY_RANGE.max
      );
      await seedBookCopies(book, copiesToCreate);
    }
    createdCount = targetCount;
  }

  console.log(`Finished seeding books. Total created: ${createdCount}`);
}

async function main() {
  try {
    await connectDB();
    await createPermissionsIfNotExists();
    await createRolesIfNotExists();

    const admins = await seedUsers('admin', REQUIRED_COUNTS.admin, 'Admin');
    const librarians = await seedUsers(
      'librarian',
      REQUIRED_COUNTS.librarian,
      'Librarian'
    );
    const members = await seedUsers('member', REQUIRED_COUNTS.member, 'Member');

    console.log(`Admins available: ${admins.length}`);
    console.log(`Librarians available: ${librarians.length}`);
    console.log(`Members available: ${members.length}`);

    await seedBooks(TARGET_BOOKS, admins);

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await require('mongoose').connection.close();
    process.exit(0);
  }
}

main();
