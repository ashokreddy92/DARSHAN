const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Deity = require('../models/Deity');
const Temple = require('../models/Temple');

const INITIAL_DEITIES = [
  {
    name: 'Lord Venkateswara',
    slug: 'lord-venkateswara',
    alternateNames: ['Balaji', 'Srinivasa', 'Govinda', 'Venkata Ramana'],
    description: 'The supreme manifestation of Lord Vishnu, widely revered for bestowing blessings and grace upon pilgrims at Tirumala.',
    category: 'Vaishnavism',
    isFeatured: true,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Lord Shiva',
    slug: 'lord-shiva',
    alternateNames: ['Mahadeva', 'Bholenath', 'Somnath', 'Kashi Vishwanath'],
    description: 'The auspicious destroyer of evil and the transformer of the universe, worshipped across sacred Jyotirlingas.',
    category: 'Shaivism',
    isFeatured: true,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Goddess Meenakshi',
    slug: 'goddess-meenakshi',
    alternateNames: ['Meenakshi Amman', 'Tadadakai', 'Sundareswarar Consort'],
    description: 'An avatar of the sacred Goddess Parvati, revered as the queen and divine protector of Madurai.',
    category: 'Shakta',
    isFeatured: true,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1609766857329-bc361c47df83?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Lord Hanuman',
    slug: 'lord-hanuman',
    alternateNames: ['Anjaneya', 'Maruti', 'Bajrangbali', 'Sankat Mochan'],
    description: 'The epitome of devotion, courage, and selfless service to Lord Rama, invoked for protection and strength.',
    category: 'Hanuman',
    isFeatured: true,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Lord Ganesha',
    slug: 'lord-ganesha',
    alternateNames: ['Vinayaka', 'Ganapati', 'Vighnaharta', 'Siddhivinayak'],
    description: 'The remover of all obstacles and herald of auspicious new beginnings, patron of arts, wisdom, and learning.',
    category: 'Ganesha',
    isFeatured: true,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80'
  }
];

async function seedDeities() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    for (const d of INITIAL_DEITIES) {
      const existing = await Deity.findOne({ slug: d.slug });
      if (!existing) {
        const created = await Deity.create(d);
        console.log(`Created deity: ${created.name}`);
      } else {
        console.log(`Deity already exists: ${existing.name}`);
      }
    }

    // Map existing temples to matching deities
    const temples = await Temple.find();
    for (const temple of temples) {
      const matchedDeity = await Deity.findOne({
        $or: [
          { name: new RegExp(temple.deity, 'i') },
          { alternateNames: { $in: [new RegExp(temple.deity, 'i')] } }
        ]
      });

      if (matchedDeity) {
        temple.primaryDeity = matchedDeity._id;
        await temple.save();

        if (!matchedDeity.temples.includes(temple._id)) {
          matchedDeity.temples.push(temple._id);
          await matchedDeity.save();
        }
        console.log(`Mapped Temple '${temple.name}' -> Deity '${matchedDeity.name}'`);
      }
    }

    console.log('Deity seeding and temple mapping complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding deities:', err);
    process.exit(1);
  }
}

seedDeities();
