const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Force Node.js DNS resolution to use Google's Public DNS.
// This resolves the querySrv ECONNREFUSED error caused by some local ISP/network DNS configurations.
dns.setServers(['8.8.8.8', '8.8.4.4']);
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Temple = require('./models/Temple');
const DarshanSlot = require('./models/DarshanSlot');
const Booking = require('./models/Booking');
const Donation = require('./models/Donation');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Standard temple data
const popularTemples = [
  {
    name: 'Tirumala Venkateswara Temple',
    location: { city: 'Tirupati', state: 'Andhra Pradesh' },
    deity: 'Lord Venkateswara (Balaji)',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMK92GXKwSfxTlXCOOHoe4HVgDXToWlSFVUT8yGVx-SQ&s=10',
    description: 'Tirumala Venkateswara Temple is a landmark Vaishnavite temple situated in the hill town of Tirumala at Tirupati in Tirupati district of Andhra Pradesh, India. The Temple is dedicated to Lord Venkateswara, an incarnation of Vishnu, who is believed to have appeared here to save mankind from trials and troubles of Kali Yuga.',
    openingHours: '03:00 AM - 11:30 PM',
    speciality: 'Srivari Laddu Prasadam, Hair Tonsuring devotion, Rich heritage and structure'
  },
  {
    name: 'Shirdi Sai Baba Temple',
    location: { city: 'Shirdi', state: 'Maharashtra' },
    deity: 'Sai Baba',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800',
    description: 'The Shri Saibaba Sansthan Trust is the governing body of the famous Shirdi Sai Baba Temple. Sai Baba of Shirdi was an Indian spiritual master who is regarded by his devotees as a saint, a fakir, a satguru and an incarnation (avatar) of Shiva and Dattatreya.',
    openingHours: '04:00 AM - 10:00 PM',
    speciality: 'Kakad Aarti, Holy Dhuni (eternal fire) maintained since Baba\'s lifetime'
  },
  {
    name: 'Meenakshi Amman Temple',
    location: { city: 'Madurai', state: 'Tamil Nadu' },
    deity: 'Goddess Meenakshi (Parvati) & Lord Sundareswarar (Shiva)',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800',
    description: 'Historic Hindu temple located on the southern bank of the Vaigai River in the temple city of Madurai, Tamil Nadu, India. It is dedicated to Goddess Meenakshi, a form of Shakti, and her consort, Sundareswarar, a form of Shiva.',
    openingHours: '05:00 AM - 12:30 PM, 04:00 PM - 09:30 PM',
    speciality: 'Fourteen majestic gopurams (gateway towers), Golden Lotus Tank, Thousand Pillar Hall'
  },
  {
    name: 'Somnath Temple',
    location: { city: 'Somnath', state: 'Gujarat' },
    deity: 'Lord Shiva (Jyotirlinga)',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800',
    description: 'The Somnath temple, also called Somanatha temple or Deo Patan, is a Hindu temple located in Prabhas Patan near Veraval in Saurashtra on the western coast of Gujarat, India. It is the first among the twelve Jyotirlinga shrines of Shiva.',
    openingHours: '06:00 AM - 09:30 PM',
    speciality: 'Srivigraha, Sound & Light Show, Marvelous Chalukya architecture on the seashore'
  },
  {
    name: 'Kashi Vishwanath Temple',
    location: { city: 'Varanasi', state: 'Uttar Pradesh' },
    deity: 'Lord Shiva',
    imageUrl: 'https://images.unsplash.com/photo-1608976722765-a83d47d4eb89?auto=format&fit=crop&q=80&w=800',
    description: 'Kashi Vishwanath Temple is one of the most famous Hindu temples dedicated to Lord Shiva. It is located in Vishwanath Gali of Varanasi, Uttar Pradesh, India. The Temple stands on the western bank of the holy river Ganga, and is one of the twelve Jyotirlingas, the holiest of Shiva temples.',
    openingHours: '04:00 AM - 11:00 PM',
    speciality: 'Ganga Aarti, Golden Spire (constructed using pure gold), Kashi Vishwanath Corridor'
  },
  {
    name: 'Kedarnath Temple',
    location: { city: 'Kedarnath', state: 'Uttarakhand' },
    deity: 'Lord Shiva (Jyotirlinga)',
    imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=800',
    description: 'Kedarnath Temple is a Hindu temple dedicated to Shiva. Located on the Garhwal Himalayan range near the Mandakini river, Kedarnath is situated in the state of Uttarakhand, India. Due to extreme weather conditions, the temple is open to the general public only between the months of April (Akshaya Tritiya) and November (Kartik Purnima).',
    openingHours: '04:00 AM - 09:00 PM',
    speciality: 'High altitude Himalayan pilgrimage, Panch Kedar structure built using massive stone slabs'
  },
  {
    name: 'Golden Temple (Harmandir Sahib)',
    location: { city: 'Amritsar', state: 'Punjab' },
    deity: 'Sri Guru Granth Sahib',
    imageUrl: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800',
    description: 'The Golden Temple, also known as Harmandir Sahib, meaning "abode of God" or Darbar Sahib, is a Gurdwara located in the city of Amritsar, Punjab, India. It is the preeminent spiritual site of Sikhism and is famous for its stunning gilded gold structure and peaceful pool (Amrit Sarovar).',
    openingHours: '04:00 AM - 11:00 PM',
    speciality: 'World\'s largest free kitchen (Langar) serving over 100,000 devotees daily, Golden Dome'
  },
  {
    name: 'Brihadeeswarar Temple',
    location: { city: 'Thanjavur', state: 'Tamil Nadu' },
    deity: 'Lord Shiva (Peruvudaiyar)',
    imageUrl: 'https://images.unsplash.com/photo-1608958416719-7ba55a5bf9fa?auto=format&fit=crop&q=80&w=800',
    description: 'Brihadeeswarar Temple, also called Rajarajesvaram or Peruvudaiyar Koyil, is a Shaivite Hindu temple built in a Chola architectural style located on the south bank of the Cauvery river in Thanjavur, Tamil Nadu, India. It is one of the largest Hindu temples and is a part of the UNESCO World Heritage Site.',
    openingHours: '06:00 AM - 12:30 PM, 04:00 PM - 08:30 PM',
    speciality: 'Massive monolithic Nandi statue, 216-foot tall temple tower (Vimana) built without mortar'
  },
  {
    name: 'Jagannath Temple',
    location: { city: 'Puri', state: 'Odisha' },
    deity: 'Lord Jagannath (Vishnu)',
    imageUrl: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=800',
    description: 'The Jagannath Temple of Puri is an important Hindu temple dedicated to Jagannath, a form of Vishnu, located in Puri in the state of Odisha on the eastern coast of India. The temple is famous for its annual Ratha Yatra, or chariot festival, in which the three principal deities are pulled on huge chariots.',
    openingHours: '05:00 AM - 11:00 PM',
    speciality: 'Annual Chariot Festival (Ratha Yatra), Mahaprasad cooked in earthen pots on wood fire'
  },
  {
    name: 'Badrinath Temple',
    location: { city: 'Badrinath', state: 'Uttarakhand' },
    deity: 'Lord Vishnu (Badrinarayan)',
    imageUrl: 'https://images.unsplash.com/photo-1596760411126-f93899f8488e?auto=format&fit=crop&q=80&w=800',
    description: 'Badrinath Temple or Badrinarayan Temple is a Hindu temple dedicated to Vishnu which is situated in the town of Badrinath in Uttarakhand, India. The temple and town form one of the four Char Dham pilgrimage sites. The temple is located in Garhwal hill tracks along the Alaknanda River.',
    openingHours: '04:30 AM - 09:00 PM',
    speciality: 'Tapt Kund natural hot sulphur springs, Himalayan landscape background, part of Char Dham'
  },
  {
    name: 'Vaishno Devi Temple',
    location: { city: 'Katra', state: 'Jammu and Kashmir' },
    deity: 'Goddess Vaishno Devi (Shakti)',
    imageUrl: 'https://images.unsplash.com/photo-1609948543911-2a2c3a1d8e3d?auto=format&fit=crop&q=80&w=800',
    description: 'Vaishno Devi Temple is a Hindu temple dedicated to the Hindu Goddess, Vaishno Devi, located in the Trikuta Mountains near the town of Katra in Jammu and Kashmir, India. It is one of the most revered pilgrimage centres in India, attracting millions of devotees each year.',
    openingHours: '05:00 AM - 10:00 PM',
    speciality: 'Holy Cave Shrine with three Pindis, 12 km uphill trek/pony route, Ardh Kuwari halt point'
  },
  {
    name: 'Ramanathaswamy Temple',
    location: { city: 'Rameswaram', state: 'Tamil Nadu' },
    deity: 'Lord Shiva (Jyotirlinga)',
    imageUrl: 'https://images.unsplash.com/photo-1600100895893-fe6b0e3d5b8c?auto=format&fit=crop&q=80&w=800',
    description: 'Ramanathaswamy Temple is a Hindu temple dedicated to Lord Shiva located on Rameswaram island in the state of Tamil Nadu, India. It is one of the twelve Jyotirlinga temples and is a key site in the Char Dham pilgrimage, associated with the Ramayana legend.',
    openingHours: '05:00 AM - 01:00 PM, 03:00 PM - 09:00 PM',
    speciality: 'Longest corridor of any Hindu temple in India, 22 sacred wells (Theerthams), Agni Theertham'
  },
  {
    name: 'Akshardham Temple',
    location: { city: 'New Delhi', state: 'Delhi' },
    deity: 'Bhagwan Swaminarayan',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800',
    description: 'Akshardham is a Hindu temple complex in New Delhi, India, dedicated to Bhagwan Swaminarayan. The complex showcases traditional and modern Hindu culture, spirituality, and architecture through intricately carved stone structures, exhibitions, and a musical fountain.',
    openingHours: '09:30 AM - 06:30 PM (Closed Mondays)',
    speciality: 'Guinness World Record for largest comprehensive Hindu temple, Yagnapurush Kund, musical fountain show'
  },
  {
    name: 'Siddhivinayak Temple',
    location: { city: 'Mumbai', state: 'Maharashtra' },
    deity: 'Lord Ganesha',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    description: 'Shree Siddhivinayak Ganapati Mandir is a Hindu temple dedicated to Lord Ganesha, located in Prabhadevi, Mumbai, Maharashtra, India. Originally built in 1801, it is one of the most visited and richest temples in India, drawing devotees from all walks of life, including celebrities.',
    openingHours: '05:30 AM - 10:00 PM (Extended hours on Tuesdays)',
    speciality: 'Wooden doors carved with the Ashtavinayak, gold-plated dome, especially popular on Tuesdays'
  },
  {
    name: 'Amarnath Temple',
    location: { city: 'Amarnath', state: 'Jammu and Kashmir' },
    deity: 'Lord Shiva (Ice Lingam)',
    imageUrl: 'https://images.unsplash.com/photo-1621855885791-6e5cfa5c0c9e?auto=format&fit=crop&q=80&w=800',
    description: 'Amarnath Cave is a Hindu shrine located in Jammu and Kashmir, India. The cave is a pilgrimage site dedicated to Lord Shiva, notable for a naturally formed ice stalagmite that resembles a Shiva lingam and waxes and wanes with the phases of the moon.',
    openingHours: 'Seasonal (typically July - August, Yatra period only)',
    speciality: 'Naturally forming ice Shivalinga, high-altitude cave shrine at 3,888 m, annual Amarnath Yatra'
  },
  {
    name: 'Dwarkadhish Temple',
    location: { city: 'Dwarka', state: 'Gujarat' },
    deity: 'Lord Krishna (Dwarkadhish)',
    imageUrl: 'https://images.unsplash.com/photo-1600100893354-15dc48d3fbdd?auto=format&fit=crop&q=80&w=800',
    description: 'Dwarkadhish Temple is a Hindu temple dedicated to the deity Dwarkadhish, a form of Lord Krishna, located in Dwarka, Gujarat, India. It is one of the Char Dham pilgrimage sites and is believed to be built over the site of Krishna\'s original palace.',
    openingHours: '06:30 AM - 01:00 PM, 05:00 PM - 09:30 PM',
    speciality: 'Five-storey structure supported by 72 pillars, main entrance called Swarga Dwar, part of Char Dham'
  },
  {
    name: 'Sabarimala Ayyappa Temple',
    location: { city: 'Sabarimala', state: 'Kerala' },
    deity: 'Lord Ayyappa',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800',
    description: 'Sabarimala Sree Dharma Sastha Temple is a Hindu temple complex located in the Periyar Tiger Reserve in the Western Ghats of Kerala, India. It is dedicated to Lord Ayyappa and is one of the largest annual pilgrimage sites in the world, drawing crores of devotees.',
    openingHours: 'Seasonal (Mandala-Makaravilakku season and monthly first five days)',
    speciality: 'Eighteen sacred steps (Pathinettampadi), forest trek through Periyar Tiger Reserve, Makaravilakku festival'
  },
  {
    name: 'Mahakaleshwar Temple',
    location: { city: 'Ujjain', state: 'Madhya Pradesh' },
    deity: 'Lord Shiva (Jyotirlinga)',
    imageUrl: 'https://images.unsplash.com/photo-1600100896194-6c7d0b9c3d7b?auto=format&fit=crop&q=80&w=800',
    description: 'Mahakaleshwar Temple is a Hindu temple dedicated to Lord Shiva and is one of the twelve Jyotirlingas, located in the ancient city of Ujjain, Madhya Pradesh, India. It is distinguished as one of the few Shiva temples in India where the idol faces south.',
    openingHours: '04:00 AM - 11:00 PM',
    speciality: 'Bhasma Aarti performed with sacred ash at dawn, south-facing (Dakshinamukhi) idol, Simhastha Kumbh site'
  },
  {
    name: 'Kamakhya Temple',
    location: { city: 'Guwahati', state: 'Assam' },
    deity: 'Goddess Kamakhya (Shakti)',
    imageUrl: 'https://images.unsplash.com/photo-1600100234534-8b7e3a4c2f5e?auto=format&fit=crop&q=80&w=800',
    description: 'Kamakhya Temple is a Hindu temple dedicated to the mother goddess Kamakhya, located on the Nilachal Hill in Guwahati, Assam, India. It is one of the oldest of the 51 Shakti Peethas and a major centre of Tantric worship in India.',
    openingHours: '05:30 AM - 10:00 PM',
    speciality: 'Ambubachi Mela festival, unique architecture with beehive-shaped shikhara, prominent Shakti Peeth'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/darshanease');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing database collections
    await User.deleteMany();
    await Temple.deleteMany();
    await DarshanSlot.deleteMany();
    await Booking.deleteMany();
    await Donation.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Create Default Users (Admin, General Organizer & Normal User)
    const admin = await User.create({
      name: 'DarshanEase Admin',
      email: 'admin@darshanease.com',
      password: 'admin123', // Schema pre-save hook handles hashing
      role: 'ADMIN',
      phone: '9999999999'
    });

    const generalOrganizer = await User.create({
      name: 'General Temple Organizer',
      email: 'organizer@darshanease.com',
      password: 'organizer123',
      role: 'ORGANIZER',
      phone: '8888888888'
    });

    const normalUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'ramesh@gmail.com',
      password: 'user123',
      role: 'USER',
      phone: '7777777777'
    });

    console.log('Created Users: Global Admin, General Organizer, and Normal User.');

    // 2. Create Temples and their unique Site-Specific Organizers
    const temples = [];
    console.log('Generating unique site organizers for each temple...');

    for (const templeData of popularTemples) {
      // Create a unique, clean email prefix from the temple name
      const safePrefix = templeData.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_temple$/, ''); // remove trailing '_temple' for cleaner email

      const organizerEmail = `${safePrefix}_admin@darshanease.com`;
      const organizerName = `${templeData.name} Organizer`;

      // Create unique organizer for this specific temple
      const siteOrganizer = await User.create({
        name: organizerName,
        email: organizerEmail,
        password: 'organizer123', // common default password
        role: 'ORGANIZER',
        phone: '8888888888'
      });

      const createdTemple = await Temple.create({
        ...templeData,
        createdBy: siteOrganizer._id
      });
      temples.push(createdTemple);
    }
    console.log(`Created ${temples.length} temples with their own site administrators.`);

    // 3. Create Darshan Slots for next 7 days
    const timeSlots = [
      '06:00 AM - 08:00 AM',
      '09:00 AM - 11:00 AM',
      '03:00 PM - 05:00 PM',
      '06:00 PM - 08:00 PM'
    ];

    const slotTypes = [
      { type: 'General', price: 0, capacity: 100 },
      { type: 'VIP', price: 500, capacity: 20 },
      { type: 'Special Pooja', price: 1000, capacity: 10 }
    ];

    let slotsCreated = 0;
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD

      for (const temple of temples) {
        for (const slotTypeData of slotTypes) {
          for (const timeSlot of timeSlots) {
            await DarshanSlot.create({
              temple: temple._id,
              date: dateString,
              timeSlot,
              maxCapacity: slotTypeData.capacity,
              bookedCount: 0,
              price: slotTypeData.price,
              slotType: slotTypeData.type
            });
            slotsCreated++;
          }
        }
      }
    }
    console.log(`Created ${slotsCreated} slots across 7 days.`);

    // 4. Create a mock Booking
    const sampleSlot = await DarshanSlot.findOne({
      temple: temples[0]._id,
      slotType: 'VIP'
    });

    if (sampleSlot) {
      const booking = await Booking.create({
        user: normalUser._id,
        temple: temples[0]._id,
        slot: sampleSlot._id,
        devotees: [
          {
            name: 'Ramesh Kumar',
            age: 35,
            gender: 'Male',
            idProofType: 'Aadhaar',
            idProofNumber: '1234-5678-9012'
          },
          {
            name: 'Saritha Kumar',
            age: 32,
            gender: 'Female',
            idProofType: 'Aadhaar',
            idProofNumber: '9876-5432-1098'
          }
        ],
        totalPrice: sampleSlot.price * 2,
        bookingReference: 'DSE-MOCK123'
      });

      sampleSlot.bookedCount += 2;
      await sampleSlot.save();
      console.log('Created sample booking for Ramesh Kumar.');
    }

    // 5. Create a mock Donation
    await Donation.create({
      user: normalUser._id,
      temple: temples[0]._id,
      donorName: 'Ramesh Kumar',
      amount: 5000,
      purpose: 'Prasadam Distribution',
      transactionId: 'TXN-MOCK5000R'
    });
    console.log('Created sample donation.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();