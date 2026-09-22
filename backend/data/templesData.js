
const allTemplesData = [
  {
    "name": "Sri Venkateswara Temple",
    "location": {
      "city": "Tirumala",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Venkateswara (Balaji)",
    "imageUrl": "/images/temples/tirumala_balaji.jpg",
    "description": "Renowned Kali Yuga Vaikuntha located on the Seshachalam Hills. Famous worldwide for its sacred darshan, hair tonsuring rituals, and divine Tirupati Laddu Prasadam.",
    "openingHours": "03:00 AM - 11:30 PM",
    "speciality": "Srivari Laddu, Ananda Nilayam Golden Gopuram, Suprabhata Seva"
  },
  {
    "name": "Kanaka Durga Temple",
    "location": {
      "city": "Vijayawada",
      "state": "Andhra Pradesh"
    },
    "deity": "Goddess Kanaka Durga (Mahishasuramardini)",
    "imageUrl": "/images/temples/kanaka_durga.jpg",
    "description": "Set atop the Indrakeeladri hill on the banks of Krishna River. One of the most famous Shakti shrines in Andhra Pradesh, vibrant during Navratri festival.",
    "openingHours": "04:00 AM - 09:00 PM",
    "speciality": "Indrakeeladri Hilltop shrine, Navratri Dasara Teppotsavam in Krishna River"
  },
  {
    "name": "Mallikarjuna Temple",
    "location": {
      "city": "Srisailam",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Shiva (Mallikarjuna Jyotirlinga) & Bhramaramba Devi",
    "imageUrl": "/images/temples/srisailam.jpg",
    "description": "One of the rare sacred places housing both a Jyotirlinga of Lord Shiva and a Maha Shakti Peetha of Goddess Parvati on the scenic Nallamala Hills.",
    "openingHours": "04:30 AM - 10:00 PM",
    "speciality": "Combined Jyotirlinga and Shakti Peetha shrine, Patala Ganga ropeway"
  },
  {
    "name": "Srikalahasteeswara Temple",
    "location": {
      "city": "Srikalahasti",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Shiva (Vayu Lingam) & Gnana Prasunambika Devi",
    "imageUrl": "/images/temples/srikalahasti.jpg",
    "description": "One of the Pancha Bhoota Sthalas representing the element Air (Vayu). Famed for Rahu-Ketu Sarpa Dosha Nivarana pujas near Swarnamukhi River.",
    "openingHours": "05:00 AM - 09:00 PM",
    "speciality": "Pancha Bhoota Vayu Sthalam, Rahu Ketu Nivarana Pooja, Unflickering lamp"
  },
  {
    "name": "Varaha Lakshmi Narasimha Temple",
    "location": {
      "city": "Simhachalam",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Varaha Lakshmi Narasimha Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    "description": "Ancient hill temple dedicated to the Lion-Boar incarnation of Vishnu. The presiding idol remains perpetually covered with sandalwood paste throughout the year.",
    "openingHours": "05:00 AM - 09:00 PM",
    "speciality": "Chandanotsavam annual festival when the real idol is revealed, Kalinga architecture"
  },
  {
    "name": "Kanipakam Vinayaka Temple",
    "location": {
      "city": "Kanipakam",
      "state": "Andhra Pradesh"
    },
    "deity": "Sri Varasiddhi Vinayaka Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1621855885791-6e5cfa5c0c9e?auto=format&fit=crop&q=80&w=800",
    "description": "Famous self-manifested (Swayambhu) idol of Lord Ganesha in a water well that continuously grows in size. Devotees take oaths at the holy temple tank.",
    "openingHours": "04:00 AM - 09:30 PM",
    "speciality": "Growing Swayambhu Ganesha idol immersed in water well, Bahuda River"
  },
  {
    "name": "Dwaraka Tirumala Temple",
    "location": {
      "city": "Dwaraka Tirumala",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Venkateswara (Chinna Tirupati)",
    "imageUrl": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=800",
    "description": "Popularly known as Chinna Tirupati, situated in Eluru district. Devotees who cannot visit Tirumala often complete their vows at this holy hill shrine.",
    "openingHours": "05:00 AM - 09:00 PM",
    "speciality": "Chinna Tirupati, Swayambhu half-murti discovered by sage Dwaraka"
  },
  {
    "name": "Ahobilam Narasimha Temples",
    "location": {
      "city": "Ahobilam",
      "state": "Andhra Pradesh"
    },
    "deity": "Nava Narasimha (Nine Forms of Lord Narasimha)",
    "imageUrl": "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&q=80&w=800",
    "description": "Sacred mountain complex in Eastern Ghats where Lord Narasimha killed Hiranyakashipu. Features nine shrines spread across Upper and Lower Ahobilam.",
    "openingHours": "06:00 AM - 08:00 PM",
    "speciality": "Nava Narasimha Kshetram, Ugra Stambham pillar mountain peak"
  },
  {
    "name": "Sri Kurmam Temple",
    "location": {
      "city": "Srikurmam",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Kurmanatha (Tortoise Incarnation of Vishnu)",
    "imageUrl": "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&q=80&w=800",
    "description": "The only prominent Hindu temple in the world dedicated to Lord Vishnu in his Kurma (tortoise) avatar, located near Srikakulam.",
    "openingHours": "06:00 AM - 08:00 PM",
    "speciality": "World sole Kurma Avatar temple, Tortoise conservation park on premises"
  },
  {
    "name": "Suryanarayana Temple",
    "location": {
      "city": "Arasavalli",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Suryanarayana Swamy (Sun God)",
    "imageUrl": "https://images.unsplash.com/photo-1567591414240-e792b0c1692e?auto=format&fit=crop&q=80&w=800",
    "description": "One of the most ancient Sun temples in India built by Kalinga rulers. Twice a year, morning sun rays fall directly upon the feet of the Sun deity.",
    "openingHours": "05:00 AM - 08:30 PM",
    "speciality": "Direct solar ray illumination on deity twice a year (Uttarayanam & Dakshinayanam)"
  },
  {
    "name": "Bhimeswara Temple",
    "location": {
      "city": "Draksharamam",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Bhimeswara Swamy & Manikyamba Devi",
    "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
    "description": "One of the five Pancharama Kshetras and Shakti Peethas. The 14-foot tall crystal Shivalinga is worshipped from two storeys.",
    "openingHours": "05:30 AM - 08:00 PM",
    "speciality": "Pancharama Kshetra, 14-ft Spatika Linga, Manikyamba Shakti Peeth"
  },
  {
    "name": "Amaralingeswara Temple",
    "location": {
      "city": "Amaravati",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Amaralingeswara Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
    "description": "Prime Pancharama temple on the banks of holy Krishna River. Features a 16-foot tall white marble Shivalinga installed by Lord Indra.",
    "openingHours": "05:00 AM - 08:00 PM",
    "speciality": "First Pancharama temple, sacred Krishna river bank, heritage Buddhist confluence"
  },
  {
    "name": "Kumararama Bhimeswara Temple",
    "location": {
      "city": "Samalkota",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Bhimeswara Swamy (Kumara Bhimeswara)",
    "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    "description": "Magnificent Pancharama Kshetra constructed during the Eastern Chalukya era with dual floor mandapams around the tall limestone lingam.",
    "openingHours": "05:30 AM - 08:00 PM",
    "speciality": "Pancharama Kshetra, Chalukya monolithic stone pillars"
  },
  {
    "name": "Ksheerarama Temple",
    "location": {
      "city": "Palakollu",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Ksheera Ramalingeswara Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    "description": "Famous Pancharama shrine boasting a 120-foot tall Rajagopuram. Legend says Lord Rama consecrated the milk-white Shivalinga.",
    "openingHours": "05:30 AM - 08:30 PM",
    "speciality": "Highest temple tower among Pancharamas, White milk-hued Shivalinga"
  },
  {
    "name": "Panakala Narasimha Temple",
    "location": {
      "city": "Mangalagiri",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Panakala Lakshmi Narasimha Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    "description": "Ancient hill temple where devotees offer pots of sweet jaggery water (Panakam) into the wide-open mouth of the deity.",
    "openingHours": "05:00 AM - 07:00 PM",
    "speciality": "Deity drinks half of the offered jaggery water, Gali Gopuram built in 1807"
  },
  {
    "name": "Veerabhadra Temple",
    "location": {
      "city": "Lepakshi",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Veerabhadra & Lord Shiva",
    "imageUrl": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800",
    "description": "Architectural marvel of the Vijayanagara Empire known for its miraculous Hanging Pillar, monolithic Nandi, and seven-hooded Naga Linga.",
    "openingHours": "06:00 AM - 06:00 PM",
    "speciality": "Hanging pillar, Giant monolithic granite Nandi, Vijayanagara fresco murals"
  },
  {
    "name": "Satyanarayana Temple",
    "location": {
      "city": "Annavaram",
      "state": "Andhra Pradesh"
    },
    "deity": "Sri Veera Venkata Satyanarayana Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1608976722765-a83d47d4eb89?auto=format&fit=crop&q=80&w=800",
    "description": "Situated on Ratnagiri hill beside the Pampa River. Devotees flock from all across India to perform the sacred Satyanarayana Vratam.",
    "openingHours": "05:00 AM - 09:00 PM",
    "speciality": "Renowned for Satyanarayana Vratam, Chariot-shaped temple structure on Ratnagiri"
  },
  {
    "name": "Govindaraja Swamy Temple",
    "location": {
      "city": "Tirupati",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Govindaraja Swamy (Elder Brother of Balaji)",
    "imageUrl": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=800",
    "description": "Monumental Vaishnavite shrine in the heart of Tirupati city consecrated by Saint Ramanujacharya in 1130 AD, featuring a towering 7-tiered gopuram.",
    "openingHours": "05:00 AM - 09:30 PM",
    "speciality": "Consecrated by Sri Ramanujacharya, resting posture (Sayana Murti) of Vishnu"
  },
  {
    "name": "Kapila Theertham",
    "location": {
      "city": "Tirupati",
      "state": "Andhra Pradesh"
    },
    "deity": "Lord Kapileswara Swamy (Shiva)",
    "imageUrl": "https://images.unsplash.com/photo-1596760411126-f93899f8488e?auto=format&fit=crop&q=80&w=800",
    "description": "The only major Shiva temple in Tirupati, nestled directly at the base of the Tirumala hill slopes next to a picturesque mountain waterfall and holy pond.",
    "openingHours": "05:00 AM - 08:30 PM",
    "speciality": "Natural waterfall feeding holy Theertham, Sage Kapila meditation cave"
  },
  {
    "name": "Sri Rama Temple",
    "location": {
      "city": "Bhadrachalam",
      "state": "Telangana"
    },
    "deity": "Lord Sitaramachandra Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800",
    "description": "Sacred abode of Sri Rama on the banks of Godavari River built by the legendary devotee Bhakta Ramadasu (Kancharla Gopanna) in the 17th century.",
    "openingHours": "04:30 AM - 09:00 PM",
    "speciality": "Bhakta Ramadasu legacy, Sri Rama Navami Sita Rama Kalyanam celebrations"
  },
  {
    "name": "Yadadri Lakshmi Narasimha Temple",
    "location": {
      "city": "Yadadri",
      "state": "Telangana"
    },
    "deity": "Sri Lakshmi Narasimha Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800",
    "description": "Magnificent hill shrine completely reconstructed in black granite (Krishna Sila) following traditional Kakatiya and Dravidian architectural principles.",
    "openingHours": "04:00 AM - 09:30 PM",
    "speciality": "World largest monolithic black stone architectural renovation, Cave shrine"
  },
  {
    "name": "Thousand Pillar Temple",
    "location": {
      "city": "Hanamkonda",
      "state": "Telangana"
    },
    "deity": "Trikutalayam (Shiva, Vishnu, Surya)",
    "imageUrl": "https://images.unsplash.com/photo-1600100234534-8b7e3a4c2f5e?auto=format&fit=crop&q=80&w=800",
    "description": "Historic Kakatiya masterwork built in 1163 AD by Rudra Deva. Features intricately sculpted star-shaped pillars and a monolithic basalt Nandi.",
    "openingHours": "06:00 AM - 08:00 PM",
    "speciality": "Star-shaped Trikutalayam, 1000 carved interlocking pillars, Monolithic Nandi"
  },
  {
    "name": "Ramappa Temple",
    "location": {
      "city": "Palampet",
      "state": "Telangana"
    },
    "deity": "Ramalingeswara Swamy (Shiva)",
    "imageUrl": "https://images.unsplash.com/photo-1600100895893-fe6b0e3d5b8c?auto=format&fit=crop&q=80&w=800",
    "description": "UNESCO World Heritage Site recognized for its unique sandbox technology, lightweight floating bricks, and dancing bracket sculptures.",
    "openingHours": "06:00 AM - 06:00 PM",
    "speciality": "UNESCO World Heritage site, Floating brick construction, Sandbox foundation"
  },
  {
    "name": "Jogulamba Temple",
    "location": {
      "city": "Alampur",
      "state": "Telangana"
    },
    "deity": "Goddess Jogulamba & Bala Brahmeswara Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1600100893354-15dc48d3fbdd?auto=format&fit=crop&q=80&w=800",
    "description": "The 5th Maha Shakti Peetha located where the Tungabhadra and Krishna rivers converge. Part of the historic Navabrahma group of temples.",
    "openingHours": "06:00 AM - 08:30 PM",
    "speciality": "5th Maha Shakti Peetham, Navabrahma temples complex, Badami Chalukya style"
  },
  {
    "name": "Kaleshwara Mukteswara Temple",
    "location": {
      "city": "Kaleshwaram",
      "state": "Telangana"
    },
    "deity": "Lord Kaleshwara (Yama) & Mukteswara (Shiva)",
    "imageUrl": "https://images.unsplash.com/photo-1608958416719-7ba55a5bf9fa?auto=format&fit=crop&q=80&w=800",
    "description": "Unique shrine housing two Shivalingas on a single pedestal at the holy Triveni Sangamam of Godavari, Pranahita, and Saraswati rivers.",
    "openingHours": "04:30 AM - 09:00 PM",
    "speciality": "Two Shivalingas on one panavattam (Yama & Shiva), Triveni Sangam"
  },
  {
    "name": "Vemulawada Rajarajeshwara Temple",
    "location": {
      "city": "Vemulawada",
      "state": "Telangana"
    },
    "deity": "Sri Rajarajeshwara Swamy (Harihara Kshetram)",
    "imageUrl": "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=800",
    "description": "Affectionately known as Dakshina Kasi. Devotees perform the unique Kode Mokku ritual (tethering a calf to the deity) for fulfillment of wishes.",
    "openingHours": "04:00 AM - 10:00 PM",
    "speciality": "Kode Mokku sacred ritual, Dharmagundam holy pond, Dakshina Kasi kshetram"
  },
  {
    "name": "Chilkur Balaji Temple",
    "location": {
      "city": "Hyderabad",
      "state": "Telangana"
    },
    "deity": "Lord Balaji (Visa God)",
    "imageUrl": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800",
    "description": "Famous temple on the banks of Osman Sagar known for accepting no monetary donations (no hundi). Devotees complete 108 circumambulations (pradakshinas).",
    "openingHours": "05:00 AM - 08:00 PM",
    "speciality": "No money hundi/donation box policy, 108 Pradakshinas vow fulfillment"
  },
  {
    "name": "Birla Mandir",
    "location": {
      "city": "Hyderabad",
      "state": "Telangana"
    },
    "deity": "Lord Venkateswara",
    "imageUrl": "https://images.unsplash.com/photo-1609948543911-2a2c3a1d8e3d?auto=format&fit=crop&q=80&w=800",
    "description": "Built entirely with 2,000 tons of pure white Rajasthani marble atop the 280-foot high Naubat Pahad hill overlooking Hussain Sagar lake.",
    "openingHours": "07:00 AM - 12:00 PM, 03:00 PM - 09:00 PM",
    "speciality": "Pure white Rajasthani Makrana marble, panoramic cityscape of Hyderabad"
  },
  {
    "name": "Karmanghat Hanuman Temple",
    "location": {
      "city": "Hyderabad",
      "state": "Telangana"
    },
    "deity": "Lord Dhyana Anjaneya Swamy",
    "imageUrl": "https://images.unsplash.com/photo-1621855885791-6e5cfa5c0c9e?auto=format&fit=crop&q=80&w=800",
    "description": "Historic temple established in 1143 AD by a Kakatiya king. Mughal emperor Aurangzeb was unable to break into this powerful Hanuman sanctuary.",
    "openingHours": "06:00 AM - 12:00 PM, 04:30 PM - 08:30 PM",
    "speciality": "Over 880-year heritage, Aurangzeb miraculous defeat legend"
  },
  {
    "name": "Ghanpur Temples",
    "location": {
      "city": "Ghanpur",
      "state": "Telangana"
    },
    "deity": "Lord Shiva (Kota Gullu)",
    "imageUrl": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800",
    "description": "Ancient Kakatiya complex consisting of 22 stone temples surrounded by a double fortification wall, displaying intricate red sandstone motifs.",
    "openingHours": "06:00 AM - 06:00 PM",
    "speciality": "Kota Gullu fortification complex, Kakatiya period architecture"
  },
  {
    "name": "Dichpally Ramalayam",
    "location": {
      "city": "Dichpally",
      "state": "Telangana"
    },
    "deity": "Lord Rama, Sita, Lakshmana",
    "imageUrl": "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&q=80&w=800",
    "description": "Referred to as Khajuraho of Telangana due to its striking stone carvings on black and white stone, built in the 14th century by the Kakatiya rulers.",
    "openingHours": "06:00 AM - 07:00 PM",
    "speciality": "Khajuraho of Telangana stone carvings, 105 stone steps approach"
  },
  {
    "name": "Komuravelli Mallanna Temple",
    "location": {
      "city": "Komuravelli",
      "state": "Telangana"
    },
    "deity": "Lord Mallikarjuna Swamy (Mallanna)",
    "imageUrl": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&q=80&w=800",
    "description": "A natural cave shrine of Lord Mallanna (incarnation of Shiva) on Indrakeeladri hill, celebrated for Patnam bonam and Oggu Katha folk rituals.",
    "openingHours": "05:00 AM - 08:30 PM",
    "speciality": "Natural cave deity, Oggu Katha traditional ballad performances"
  },
  {
    "name": "Basara Saraswati Temple",
    "location": {
      "city": "Basara",
      "state": "Telangana"
    },
    "deity": "Goddess Gnana Saraswati",
    "imageUrl": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800",
    "description": "One of the very few dedicated Goddess Saraswati temples in India, located on the Godavari River. Famed for Aksharabhyasam ceremony for children.",
    "openingHours": "04:00 AM - 09:00 PM",
    "speciality": "Aksharabhyasam learning ceremony, Established by Sage Vyasa"
  },
  {
    "name": "Kondagattu Anjaneya Temple",
    "location": {
      "city": "Kondagattu",
      "state": "Telangana"
    },
    "deity": "Lord Anjaneya Swamy (Swayambhu Hanuman)",
    "imageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    "description": "Popular hilltop temple in Jagtial district where the idol features Lord Narasimha on one side and Lord Anjaneya on the other side.",
    "openingHours": "05:00 AM - 08:30 PM",
    "speciality": "Dual facet idol (Narasimha and Hanuman), 40-day Hanuman Deeksha fulfillment"
  },
  {
    "name": "Birla Mandir (Laxminarayan Temple)",
    "location": {
      "city": "New Delhi",
      "state": "Delhi"
    },
    "deity": "Lord Vishnu & Goddess Lakshmi",
    "imageUrl": "https://images.unsplash.com/photo-1600100896194-6c7d0b9c3d7b?auto=format&fit=crop&q=80&w=800",
    "description": "Iconic red sandstone and marble temple inaugurated by Mahatma Gandhi on the condition that all castes be permitted inside.",
    "openingHours": "04:30 AM - 01:30 PM, 02:30 PM - 09:00 PM",
    "speciality": "Orissan architecture, Historic inauguration by Mahatma Gandhi"
  },
  {
    "name": "Akshardham Temple",
    "location": {
      "city": "New Delhi",
      "state": "Delhi"
    },
    "deity": "Bhagwan Swaminarayan",
    "imageUrl": "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&q=80&w=800",
    "description": "A colossal modern spiritual campus showcasing 10,000 years of Indian art, spirituality, boat rides, and Sahaj Anand water show.",
    "openingHours": "09:30 AM - 06:30 PM",
    "speciality": "Guinness World Record for largest Hindu temple complex, Sahaj Anand musical fountain"
  },
  {
    "name": "Lotus Temple",
    "location": {
      "city": "New Delhi",
      "state": "Delhi"
    },
    "deity": "Universal Bahá'í House of Worship",
    "imageUrl": "https://images.unsplash.com/photo-1599557766579-373df8995a94?auto=format&fit=crop&q=80&w=800",
    "description": "Spectacular lotus-flower shaped architectural landmark welcoming people of all religions to pray, meditate, and reflect in peace.",
    "openingHours": "08:30 AM - 05:00 PM (Closed Mondays)",
    "speciality": "27 free-standing marble petals, International architectural awards"
  },
  {
    "name": "Kashi Vishwanath Temple",
    "location": {
      "city": "Varanasi",
      "state": "Uttar Pradesh"
    },
    "deity": "Lord Shiva (Jyotirlinga)",
    "imageUrl": "/images/temples/kashi_vishwanath.jpg",
    "description": "One of the most sacred Shiva Jyotirlingas on the banks of holy Ganga, recently revitalized with the grand Kashi Vishwanath Corridor.",
    "openingHours": "03:00 AM - 11:00 PM",
    "speciality": "Ganga Ghat access, Kashi Vishwanath Dham corridor, Golden Spire"
  },
  {
    "name": "Ram Mandir",
    "location": {
      "city": "Ayodhya",
      "state": "Uttar Pradesh"
    },
    "deity": "Lord Shri Ram Lalla",
    "imageUrl": "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=800",
    "description": "The historic Ram Janmabhoomi temple built in Nagara architectural style with carved Bansi Paharpur pink sandstone celebrating the birthplace of Lord Rama.",
    "openingHours": "06:30 AM - 09:30 PM",
    "speciality": "Ram Janmabhoomi, Grand Nagara architecture, Surya Tilak ritual"
  },
  {
    "name": "Krishna Janmabhoomi Temple",
    "location": {
      "city": "Mathura",
      "state": "Uttar Pradesh"
    },
    "deity": "Lord Krishna (Balgopal)",
    "imageUrl": "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=800",
    "description": "The holy prison cell (Garbha Griha) where Lord Krishna incarnated thousands of years ago, attracting millions of devotees especially during Janmashtami.",
    "openingHours": "05:00 AM - 12:00 PM, 04:00 PM - 09:30 PM",
    "speciality": "Garbha Griha prison birthplace of Krishna, Janmashtami grand celebration"
  },
  {
    "name": "Banke Bihari Temple",
    "location": {
      "city": "Vrindavan",
      "state": "Uttar Pradesh"
    },
    "deity": "Lord Krishna (Banke Bihari)",
    "imageUrl": "https://images.unsplash.com/photo-1609766857329-bc361c47df83?auto=format&fit=crop&q=80&w=800",
    "description": "The most celebrated temple in Vrindavan where Krishna stands in the Tribhanga posture. Curtains are pulled open and shut intermittently during darshan.",
    "openingHours": "07:45 AM - 12:00 PM, 05:30 PM - 09:30 PM",
    "speciality": "Jhulan Yatra festival, Charnamrit darshan on Akshaya Tritiya only"
  },
  {
    "name": "Prem Mandir",
    "location": {
      "city": "Vrindavan",
      "state": "Uttar Pradesh"
    },
    "deity": "Radha Krishna & Sita Rama",
    "imageUrl": "https://images.unsplash.com/photo-1605649487210-998877e8fb1d?auto=format&fit=crop&q=80&w=800",
    "description": "Enchanting white Italian Carrara marble temple complex illuminated with vibrant dynamic musical laser and LED lighting at twilight.",
    "openingHours": "05:30 AM - 12:00 PM, 04:30 PM - 08:30 PM",
    "speciality": "Pure Italian Carrara marble, Spectacular musical fountain and LED night light show"
  },
  {
    "name": "Sankat Mochan Hanuman Temple",
    "location": {
      "city": "Varanasi",
      "state": "Uttar Pradesh"
    },
    "deity": "Lord Hanuman (Sankat Mochan)",
    "imageUrl": "https://images.unsplash.com/photo-1600100896194-6c7d0b9c3d7b?auto=format&fit=crop&q=80&w=800",
    "description": "Established by Goswami Tulsidas on the banks of the Assi River. Devotees offer besan laddoos to be relieved from difficulties and planetary distress.",
    "openingHours": "05:00 AM - 10:00 PM",
    "speciality": "Founded by Saint Tulsidas, Annual Sankat Mochan Sangeet Samaroh festival"
  },
  {
    "name": "Durga Kund Temple",
    "location": {
      "city": "Varanasi",
      "state": "Uttar Pradesh"
    },
    "deity": "Goddess Durga (Monkey Temple)",
    "imageUrl": "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&q=80&w=800",
    "description": "18th-century North Indian Nagara style temple finished in vibrant red ochre, built by a Bengali queen next to the sacred Durga Kund tank.",
    "openingHours": "05:00 AM - 11:00 PM",
    "speciality": "Ochre-red Nagara spire, Multi-tiered Durga Kund water tank"
  },
  {
    "name": "Badrinath Temple",
    "location": {
      "city": "Badrinath",
      "state": "Uttarakhand"
    },
    "deity": "Lord Vishnu (Badrinarayan)",
    "imageUrl": "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&q=80&w=800",
    "description": "Crown of the Char Dham pilgrimage nestled along the Alaknanda River between Nar and Narayana mountain ranges in the Himalayas.",
    "openingHours": "04:30 AM - 09:00 PM",
    "speciality": "High altitude Char Dham shrine, Tapt Kund hot springs, Nilkantha peak backdrop"
  },
  {
    "name": "Kedarnath Temple",
    "location": {
      "city": "Kedarnath",
      "state": "Uttarakhand"
    },
    "deity": "Lord Shiva (Jyotirlinga)",
    "imageUrl": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800",
    "description": "The highest of the 12 Jyotirlingas, situated at 3,583 meters altitude near the Chorabari glacier and Mandakini River in the Himalayas.",
    "openingHours": "04:00 AM - 09:00 PM (May - Nov)",
    "speciality": "Highest Jyotirlinga in India, 16 km scenic alpine trek, Panch Kedar head"
  },
  {
    "name": "Gangotri Temple",
    "location": {
      "city": "Gangotri",
      "state": "Uttarakhand"
    },
    "deity": "Goddess Ganga",
    "imageUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
    "description": "Origin shrine of the holy river Ganga (Bhagirathi River) in Uttarkashi district, built with white granite by Gorkha General Amar Singh Thapa.",
    "openingHours": "06:00 AM - 08:30 PM (Seasonal)",
    "speciality": "Origin of River Ganga, Bhagirath Shila where King Bhagiratha meditated"
  },
  {
    "name": "Yamunotri Temple",
    "location": {
      "city": "Yamunotri",
      "state": "Uttarakhand"
    },
    "deity": "Goddess Yamuna",
    "imageUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800",
    "description": "The first stop of the Chhota Char Dham circuit dedicated to Yamuna Devi, famous for the natural boiling thermal springs of Surya Kund.",
    "openingHours": "06:00 AM - 08:00 PM (Seasonal)",
    "speciality": "Surya Kund thermal boiling spring where rice is cooked as Prasad, Divya Shila"
  },
  {
    "name": "Somnath Temple",
    "location": {
      "city": "Somnath",
      "state": "Gujarat"
    },
    "deity": "Lord Shiva (First Jyotirlinga)",
    "imageUrl": "/images/temples/somnath.jpg",
    "description": "First among the twelve sacred Jyotirlinga shrines of Lord Shiva, magnificently restored on the shores of the Arabian Sea.",
    "openingHours": "06:00 AM - 09:30 PM",
    "speciality": "First Jyotirlinga, Arrow Pillar (Bāna Stambha) pointing to South Pole"
  },
  {
    "name": "Dwarkadhish Temple",
    "location": {
      "city": "Dwarka",
      "state": "Gujarat"
    },
    "deity": "Lord Krishna (King of Dwarka)",
    "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    "description": "Grand 5-story temple with 72 pillars built over the ancient capital of Krishna kingdom at the confluence of Gomti River and the Arabian Sea.",
    "openingHours": "06:30 AM - 01:00 PM, 05:00 PM - 09:30 PM",
    "speciality": "52-yard flag changed five times daily, Swarga Dwar and Moksha Dwar gates"
  },
  {
    "name": "Nageshwar Jyotirlinga",
    "location": {
      "city": "Dwarka",
      "state": "Gujarat"
    },
    "deity": "Lord Shiva (Nageshwar)",
    "imageUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    "description": "Ancient Jyotirlinga shrine believed to protect devotees from all poisons and negative energies, highlighted by a towering 80-foot Shiva statue.",
    "openingHours": "06:00 AM - 09:00 PM",
    "speciality": "Colossal 80-foot Lord Shiva statue, Daarukavanam sacred forest location"
  },
  {
    "name": "Ambaji Temple",
    "location": {
      "city": "Ambaji",
      "state": "Gujarat"
    },
    "deity": "Goddess Amba (Maha Shakti Peeth)",
    "imageUrl": "https://images.unsplash.com/photo-1608976722765-a83d47d4eb89?auto=format&fit=crop&q=80&w=800",
    "description": "Prime Shakti Peetha situated on the Gabbar hill where the heart of Devi Sati fell. Worship is performed on the sacred Viso Yantra.",
    "openingHours": "07:00 AM - 11:30 AM, 12:30 PM - 04:30 PM, 06:30 PM - 09:00 PM",
    "speciality": "No physical idol; worship of gold-plated Shree Viso Yantra, Gabbar Hill"
  },
  {
    "name": "Modhera Sun Temple",
    "location": {
      "city": "Modhera",
      "state": "Gujarat"
    },
    "deity": "Surya (Sun God)",
    "imageUrl": "https://images.unsplash.com/photo-1600100895893-fe6b0e3d5b8c?auto=format&fit=crop&q=80&w=800",
    "description": "Solanki architectural triumph built in 1026 AD with an exquisite stepped water tank (Surya Kund) having 108 miniature shrines.",
    "openingHours": "07:00 AM - 06:00 PM",
    "speciality": "Equinox sun alignment, Stepwell Surya Kund with 108 shrines, Annual Dance Festival"
  },
  {
    "name": "Mahakaleshwar Temple",
    "location": {
      "city": "Ujjain",
      "state": "Madhya Pradesh"
    },
    "deity": "Lord Shiva (Dakshinamukhi Jyotirlinga)",
    "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800",
    "description": "World famous for its sacred Bhasma Aarti at 4:00 AM. One of the 12 Jyotirlingas where the Shiva Linga faces South towards death (Kala).",
    "openingHours": "03:00 AM - 11:00 PM",
    "speciality": "Bhasma Aarti with fresh cremation ash, South-facing idol, Mahakal Lok corridor"
  },
  {
    "name": "Omkareshwar Temple",
    "location": {
      "city": "Omkareshwar",
      "state": "Madhya Pradesh"
    },
    "deity": "Lord Shiva (Jyotirlinga)",
    "imageUrl": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800",
    "description": "Situated on the sacred island of Mandhata in Narmada River, which naturally resembles the sacred Hindu symbol \"OM\" in aerial view.",
    "openingHours": "05:00 AM - 09:30 PM",
    "speciality": "Island naturally shaped like Om symbol, Parikrama pathway around Mandhata island"
  },
  {
    "name": "Kandariya Mahadeva Temple",
    "location": {
      "city": "Khajuraho",
      "state": "Madhya Pradesh"
    },
    "deity": "Lord Shiva",
    "imageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    "description": "UNESCO World Heritage masterpiece built by Chandela rulers in 1030 AD, adorned with over 800 intricately carved sandstone sculptures.",
    "openingHours": "06:00 AM - 06:00 PM",
    "speciality": "UNESCO World Heritage site, 84 miniature spires recreating Mount Kailash"
  },
  {
    "name": "Maa Sharda Temple",
    "location": {
      "city": "Maihar",
      "state": "Madhya Pradesh"
    },
    "deity": "Goddess Sharda (Saraswati)",
    "imageUrl": "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=800",
    "description": "Perched atop the 1,063-step Trikoota hill. Legend tells of warriors Alha and Udal who first discovered the Goddess and offered flowers.",
    "openingHours": "05:00 AM - 08:30 PM",
    "speciality": "1,063 stone steps & ropeway, Alha and Udal warrior folklore, Shakti Peeth"
  },
  {
    "name": "Ram Raja Temple",
    "location": {
      "city": "Orchha",
      "state": "Madhya Pradesh"
    },
    "deity": "Lord Rama (Worshipped as King)",
    "imageUrl": "https://images.unsplash.com/photo-1608958416719-7ba55a5bf9fa?auto=format&fit=crop&q=80&w=800",
    "description": "The only temple in India where Lord Rama is officially treated and worshipped as an Emperor/King with a daily police guard of honour.",
    "openingHours": "08:00 AM - 12:30 PM, 07:00 PM - 09:30 PM",
    "speciality": "Daily gun salute by police, Palace converted into temple, Rama as King"
  },
  {
    "name": "Trimbakeshwar Temple",
    "location": {
      "city": "Trimbak",
      "state": "Maharashtra"
    },
    "deity": "Lord Shiva (Three-faced Jyotirlinga)",
    "imageUrl": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&q=80&w=800",
    "description": "Source of the sacred Godavari River located at the base of Brahmagiri mountain. Features a three-faced lingam embodying Brahma, Vishnu, and Shiva.",
    "openingHours": "05:30 AM - 09:00 PM",
    "speciality": "Origin of River Godavari, Three-faced Lingam (Brahma-Vishnu-Shiva), Kalsarpa Pooja"
  },
  {
    "name": "Bhimashankar Temple",
    "location": {
      "city": "Bhimashankar",
      "state": "Maharashtra"
    },
    "deity": "Lord Shiva (Jyotirlinga)",
    "imageUrl": "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&q=80&w=800",
    "description": "Nagara-style Jyotirlinga sanctuary situated in the dense Sahyadri forests, which also serves as the source of the Bhima River.",
    "openingHours": "04:30 AM - 09:30 PM",
    "speciality": "Origin of Bhima River, Giant Malabar Squirrel wildlife sanctuary surround"
  },
  {
    "name": "Grishneshwar Temple",
    "location": {
      "city": "Ellora",
      "state": "Maharashtra"
    },
    "deity": "Lord Shiva (12th Jyotirlinga)",
    "imageUrl": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800",
    "description": "The 12th and final Jyotirlinga of Lord Shiva, located adjacent to the world-famous Ellora UNESCO rock-cut caves, rebuilt by Ahilyabai Holkar.",
    "openingHours": "05:30 AM - 09:00 PM",
    "speciality": "12th Jyotirlinga, Red stone carvings, proximity to Ellora Kailash cave"
  },
  {
    "name": "Siddhivinayak Temple",
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra"
    },
    "deity": "Lord Ganesha (Siddhivinayak)",
    "imageUrl": "https://images.unsplash.com/photo-1609948543911-2a2c3a1d8e3d?auto=format&fit=crop&q=80&w=800",
    "description": "Mumbai’s most prominent Ganesh shrine with a gold-plated sanctum dome. Famed for fulfilling heartfelt wishes of millions of pilgrims.",
    "openingHours": "05:30 AM - 10:00 PM",
    "speciality": "Right-turned trunk Ganesha idol, Gold-plated inner sanctorum dome"
  },
  {
    "name": "Shirdi Sai Baba Temple",
    "location": {
      "city": "Shirdi",
      "state": "Maharashtra"
    },
    "deity": "Sai Baba of Shirdi",
    "imageUrl": "https://images.unsplash.com/photo-1621855885791-6e5cfa5c0c9e?auto=format&fit=crop&q=80&w=800",
    "description": "The global pilgrimage center dedicated to Saint Sai Baba. Houses Baba’s Samadhi Mandir, Dwarkamai mosque, and eternal Dhuni fire.",
    "openingHours": "04:00 AM - 10:30 PM",
    "speciality": "Samadhi Mandir, Holy eternal Dhuni fire, Prasadalaya serving thousands daily"
  },
  {
    "name": "Tulja Bhavani Temple",
    "location": {
      "city": "Tuljapur",
      "state": "Maharashtra"
    },
    "deity": "Goddess Bhavani (Kuladaivat of Shivaji Maharaj)",
    "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
    "description": "Celebrated as one of the 51 Shakti Peethas and family deity (Kuladaivat) of Chhatrapati Shivaji Maharaj who received the Bhavani Talwar here.",
    "openingHours": "04:00 AM - 10:00 PM",
    "speciality": "Chhatrapati Shivaji Maharaj patron shrine, Swayambhu stone idol"
  },
  {
    "name": "Ramanathaswamy Temple",
    "location": {
      "city": "Rameswaram",
      "state": "Tamil Nadu"
    },
    "deity": "Lord Shiva (Ramanathaswamy Jyotirlinga)",
    "imageUrl": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    "description": "Southern Char Dham shrine featuring the longest temple pillared corridor in the world and 22 sacred theertham bathing wells inside the complex.",
    "openingHours": "05:00 AM - 01:00 PM, 03:00 PM - 09:00 PM",
    "speciality": "Longest corridor with 1212 pillars, 22 sacred Theerthams, Agni Theertham"
  },
  {
    "name": "Meenakshi Amman Temple",
    "location": {
      "city": "Madurai",
      "state": "Tamil Nadu"
    },
    "deity": "Goddess Meenakshi & Sundareswarar",
    "imageUrl": "/images/temples/meenakshi_amman.jpg",
    "description": "World-renowned architectural marvel featuring 14 sky-high gopurams filled with thousands of polychrome sculptures and the Thousand Pillar Hall.",
    "openingHours": "05:00 AM - 12:30 PM, 04:00 PM - 09:30 PM",
    "speciality": "Fourteen monumental gopurams, Hall of 1000 Pillars, Golden Lotus pond"
  },
  {
    "name": "Brihadeeswarar Temple",
    "location": {
      "city": "Thanjavur",
      "state": "Tamil Nadu"
    },
    "deity": "Lord Shiva (Peruvudaiyar)",
    "imageUrl": "https://images.unsplash.com/photo-1596760411126-f93899f8488e?auto=format&fit=crop&q=80&w=800",
    "description": "Chola engineering wonder built by Raja Raja Chola I with a single 80-ton granite dome atop a 216-foot tower, casting no shadow at noon.",
    "openingHours": "06:00 AM - 12:30 PM, 04:00 PM - 08:30 PM",
    "speciality": "UNESCO World Heritage, 80-ton single stone cap, massive monolithic Nandi"
  },
  {
    "name": "Kapaleeshwarar Temple",
    "location": {
      "city": "Chennai",
      "state": "Tamil Nadu"
    },
    "deity": "Lord Shiva (Kapaleeshwarar) & Karpagambal",
    "imageUrl": "https://images.unsplash.com/photo-1567591414240-e792b0c1692e?auto=format&fit=crop&q=80&w=800",
    "description": "7th-century Dravidian masterpiece located in Mylapore, Chennai. Notable for its 37-meter gopuram, tank festival, and Saint Sambandar legends.",
    "openingHours": "05:30 AM - 12:00 PM, 04:30 PM - 09:30 PM",
    "speciality": "Mylapore heritage gopuram, Panguni Peruvizha chariot festival"
  },
  {
    "name": "Ranganathaswamy Temple",
    "location": {
      "city": "Srirangam",
      "state": "Tamil Nadu"
    },
    "deity": "Lord Ranganatha (Reclining Vishnu)",
    "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
    "description": "Largest functioning Hindu temple complex in the world covering 156 acres across 7 concentric enclosures (prakarams) with 21 grand gopurams.",
    "openingHours": "06:00 AM - 09:00 PM",
    "speciality": "World largest functioning temple complex, 236-ft Rajagopuram, 7 enclosures"
  },
  {
    "name": "Arunachaleswarar Temple",
    "location": {
      "city": "Tiruvannamalai",
      "state": "Tamil Nadu"
    },
    "deity": "Lord Shiva (Agni Lingam - Fire Element)",
    "imageUrl": "https://images.unsplash.com/photo-1600100234534-8b7e3a4c2f5e?auto=format&fit=crop&q=80&w=800",
    "description": "Pancha Bhoota Sthalam representing Fire (Agni). Devotees undertake the 14-km barefoot Girivalam walk around the sacred Arunachala hill on full moon days.",
    "openingHours": "05:30 AM - 09:30 PM",
    "speciality": "Agni Sthalam, 14 km holy Girivalam circumambulation, Karthigai Deepam flame"
  },
  {
    "name": "Nataraja Temple",
    "location": {
      "city": "Chidambaram",
      "state": "Tamil Nadu"
    },
    "deity": "Lord Nataraja (Cosmic Dancer - Space Element)",
    "imageUrl": "https://images.unsplash.com/photo-1600100893354-15dc48d3fbdd?auto=format&fit=crop&q=80&w=800",
    "description": "Pancha Bhoota Sthalam of Akasha (Space). The famous Chidambara Rahasyam represents the formless, infinite cosmos beside the dancing Shiva image.",
    "openingHours": "06:00 AM - 12:00 PM, 05:00 PM - 10:00 PM",
    "speciality": "Akasha (Space) Sthalam, Gold roofed Chit Sabha, Chidambara Rahasyam"
  },
  {
    "name": "Ekambareswarar Temple",
    "location": {
      "city": "Kanchipuram",
      "state": "Tamil Nadu"
    },
    "deity": "Lord Shiva (Prithvi Lingam - Earth Element)",
    "imageUrl": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800",
    "description": "Pancha Bhoota Sthalam for the Earth (Prithvi) element. Features an ancient 3,500-year-old sacred Mango tree whose 4 branches yield 4 different tastes.",
    "openingHours": "06:00 AM - 12:30 PM, 04:00 PM - 08:30 PM",
    "speciality": "Prithvi Sthalam, 3500-year sacred Mango tree, 194-foot southern Rajagopuram"
  },
  {
    "name": "Kailasanathar Temple",
    "location": {
      "city": "Kanchipuram",
      "state": "Tamil Nadu"
    },
    "deity": "Lord Shiva (Kailasanathar)",
    "imageUrl": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800",
    "description": "Oldest surviving stone structural temple in Kanchipuram built in 705 AD by Pallava king Rajasimha, famous for sandstone lion-carved pillars.",
    "openingHours": "06:00 AM - 12:00 PM, 04:00 PM - 07:30 PM",
    "speciality": "Earliest Pallava structural temple, 58 sub-shrines, circumambulation passage"
  },
  {
    "name": "Guruvayur Temple",
    "location": {
      "city": "Guruvayur",
      "state": "Kerala"
    },
    "deity": "Lord Guruvayurappan (Child Krishna)",
    "imageUrl": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=800",
    "description": "Known as the Bhooloka Vaikuntham (Heaven on Earth). The deity is adorned with Tulsi garlands and worshiped with sweet Palpayasam prasadam.",
    "openingHours": "03:00 AM - 01:30 PM, 04:30 PM - 09:15 PM",
    "speciality": "Bhooloka Vaikuntham, Punnathur Kotta elephant sanctuary, Nirmalya Darshanam"
  },
  {
    "name": "Sabarimala Temple",
    "location": {
      "city": "Sabarimala",
      "state": "Kerala"
    },
    "deity": "Lord Ayyappa (Swamiye Saranam Ayyappa)",
    "imageUrl": "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=800",
    "description": "Historic hill shrine in the Periyar Tiger Reserve. Millions of pilgrims observe a 41-day vratham before ascending the holy 18 golden steps.",
    "openingHours": "03:00 AM - 01:00 PM, 04:00 PM - 11:00 PM (Mandala Season)",
    "speciality": "Pathinettampadi (18 holy steps), Makaravilakku divine flame, Irumudi kettu"
  },
  {
    "name": "Padmanabhaswamy Temple",
    "location": {
      "city": "Thiruvananthapuram",
      "state": "Kerala"
    },
    "deity": "Lord Padmanabhaswamy (Anantha Sayana)",
    "imageUrl": "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=800",
    "description": "Richest temple in the world blending Kerala and Dravidian architecture. The 18-foot deity is viewed through three separate sanctum doorways.",
    "openingHours": "03:30 AM - 12:00 PM, 05:00 PM - 08:30 PM",
    "speciality": "Anantha Sayana viewed through 3 doors, Padmanabha vaults, Strict traditional attire"
  },
  {
    "name": "Vadakkunnathan Temple",
    "location": {
      "city": "Thrissur",
      "state": "Kerala"
    },
    "deity": "Lord Shiva (Ghee Mound Lingam)",
    "imageUrl": "https://images.unsplash.com/photo-1609766857329-bc361c47df83?auto=format&fit=crop&q=80&w=800",
    "description": "Ancient classical Kerala temple recognized by UNESCO for architectural preservation. Hosts the world-famous Thrissur Pooram festival.",
    "openingHours": "04:00 AM - 11:00 AM, 05:00 PM - 08:30 PM",
    "speciality": "UNESCO Award of Excellence, Thrissur Pooram venue, Gigantic Ghee Lingam"
  },
  {
    "name": "Chottanikkara Temple",
    "location": {
      "city": "Chottanikkara",
      "state": "Kerala"
    },
    "deity": "Chottanikkara Devi (Rajarajeswari & Bhadrakali)",
    "imageUrl": "https://images.unsplash.com/photo-1600100896194-6c7d0b9c3d7b?auto=format&fit=crop&q=80&w=800",
    "description": "Renowned for healing mental illnesses and spiritual ailments. The deity is worshipped as Saraswati in morning, Lakshmi at noon, and Durga in evening.",
    "openingHours": "04:00 AM - 12:00 PM, 04:00 PM - 08:45 PM",
    "speciality": "Three roopas of Devi daily, Kizhukkavu Guruthi pooja for driving away negative energies"
  },
  {
    "name": "Jagannath Temple",
    "location": {
      "city": "Puri",
      "state": "Odisha"
    },
    "deity": "Lord Jagannath, Balabhadra, Subhadra",
    "imageUrl": "/images/temples/puri_jagannath.jpg",
    "description": "Sacred Eastern Char Dham temple famous for the annual Ratha Yatra and the world’s largest kitchen preparing Mahaprasad in earthen pots.",
    "openingHours": "05:00 AM - 11:00 PM",
    "speciality": "Ratha Yatra chariot festival, Neela Chakra flag flutter defying wind, Mahaprasad"
  },
  {
    "name": "Lingaraj Temple",
    "location": {
      "city": "Bhubaneswar",
      "state": "Odisha"
    },
    "deity": "Lord Harihara (Shiva and Vishnu combined)",
    "imageUrl": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800",
    "description": "Largest temple in Bhubaneswar dating to the 11th century, crowned by a 180-foot deula tower dominating the skyline of the temple city.",
    "openingHours": "06:00 AM - 09:00 PM",
    "speciality": "Kalinga architectural peak, Bindusagar lake, Harihara combined deity worship"
  },
  {
    "name": "Konark Sun Temple",
    "location": {
      "city": "Konark",
      "state": "Odisha"
    },
    "deity": "Surya (Sun God)",
    "imageUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
    "description": "UNESCO World Heritage Site shaped as a 24-wheeled chariot pulled by 7 horses. The wheels function as accurate sundials.",
    "openingHours": "06:00 AM - 08:00 PM",
    "speciality": "UNESCO World Heritage, Stone sundial chariot wheels, Black Pagoda architecture"
  },
  {
    "name": "Mukteshwar Temple",
    "location": {
      "city": "Bhubaneswar",
      "state": "Odisha"
    },
    "deity": "Lord Shiva (Mukteshwar)",
    "imageUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800",
    "description": "Gem of Odisha architecture built in the 10th century, famous for its magnificent freestanding arched gateway (Torana) with Buddhist influences.",
    "openingHours": "06:30 AM - 07:30 PM",
    "speciality": "Celebrated Torana arched gateway, transition milestone in Kalinga temple art"
  },
  {
    "name": "Baidyanath Temple",
    "location": {
      "city": "Deoghar",
      "state": "Jharkhand"
    },
    "deity": "Lord Shiva (Baidyanath Jyotirlinga)",
    "imageUrl": "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&q=80&w=800",
    "description": "One of the 12 revered Jyotirlingas and 51 Shakti Peethas. During the holy month of Shravan, millions of Kanwariyas bring Ganga water on foot.",
    "openingHours": "04:00 AM - 09:00 PM",
    "speciality": "Annual Shravan Mela, Kanwariya Yatra from Sultanganj, 21 sub-temples in complex"
  },
  {
    "name": "Kalighat Temple",
    "location": {
      "city": "Kolkata",
      "state": "West Bengal"
    },
    "deity": "Maa Kali (Kalika Devi)",
    "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    "description": "One of the 51 Shakti Peethas where the right toes of Sati fell on the banks of Adi Ganga canal. The icon features three huge eyes and a long gold tongue.",
    "openingHours": "05:00 AM - 02:00 PM, 05:00 PM - 10:30 PM",
    "speciality": "Famous Shakti Peetha, Distinctive traditional Bengal chala architecture"
  },
  {
    "name": "Dakshineswar Kali Temple",
    "location": {
      "city": "Kolkata",
      "state": "West Bengal"
    },
    "deity": "Bhavatarini (Goddess Kali)",
    "imageUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    "description": "Established in 1855 by Rani Rashmoni on the Hooghly River, where Saint Sri Ramakrishna Paramahamsa served as priest and attained realization.",
    "openingHours": "06:00 AM - 12:30 PM, 03:30 PM - 08:30 PM",
    "speciality": "Sri Ramakrishna Paramahamsa spiritual home, 12 Shiva shrines along river bank"
  },
  {
    "name": "Belur Math",
    "location": {
      "city": "Kolkata",
      "state": "West Bengal"
    },
    "deity": "Sri Ramakrishna & Swami Vivekananda",
    "imageUrl": "https://images.unsplash.com/photo-1608976722765-a83d47d4eb89?auto=format&fit=crop&q=80&w=800",
    "description": "Headquarters of Ramakrishna Math & Mission founded by Swami Vivekananda, harmoniously blending Hindu, Islamic, and Christian architectural motifs.",
    "openingHours": "06:00 AM - 11:30 AM, 04:00 PM - 08:30 PM",
    "speciality": "Synthesis of universal world religions architecture, Peace and meditation halls"
  },
  {
    "name": "Kamakhya Temple",
    "location": {
      "city": "Guwahati",
      "state": "Assam"
    },
    "deity": "Maa Kamakhya (Shakti)",
    "imageUrl": "https://images.unsplash.com/photo-1600100895893-fe6b0e3d5b8c?auto=format&fit=crop&q=80&w=800",
    "description": "One of the oldest and most revered of the 51 Shakti Peethas perched on Nilachal Hill, celebrating womanhood and the sacred Ambubachi Mela.",
    "openingHours": "05:30 AM - 10:00 PM",
    "speciality": "Ambubachi Mela festival, Natural spring in underground rock cave sanctuary"
  },
  {
    "name": "Umananda Temple",
    "location": {
      "city": "Guwahati",
      "state": "Assam"
    },
    "deity": "Lord Shiva",
    "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800",
    "description": "Situated on the smallest inhabited river island in the world (Peacock Island) amidst the mighty Brahmaputra River, reached by country boat.",
    "openingHours": "05:30 AM - 05:00 PM",
    "speciality": "World smallest inhabited river island location in Brahmaputra, Golden Langurs"
  },
  {
    "name": "Mahabodhi Temple",
    "location": {
      "city": "Bodh Gaya",
      "state": "Bihar"
    },
    "deity": "Lord Gautama Buddha",
    "imageUrl": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800",
    "description": "UNESCO World Heritage Site marking the spot where Lord Buddha attained supreme enlightenment beneath the sacred Bodhi Tree around 500 BC.",
    "openingHours": "05:00 AM - 09:00 PM",
    "speciality": "UNESCO World Heritage, Sacred Bodhi Tree, Vajrasana (Diamond Throne)"
  },
  {
    "name": "Vishnupad Temple",
    "location": {
      "city": "Gaya",
      "state": "Bihar"
    },
    "deity": "Lord Vishnu (Footprint)",
    "imageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    "description": "Ancient temple on the banks of Falgu River featuring a 40-cm footprint of Lord Vishnu stamped in solid basalt rock, premier site for Pind Daan rituals.",
    "openingHours": "06:00 AM - 09:00 PM",
    "speciality": "40-cm footprint of Lord Vishnu (Dharmasila), Holy Pind Daan ancestral rites"
  },
  {
    "name": "Vaishno Devi Temple",
    "location": {
      "city": "Katra",
      "state": "Jammu & Kashmir"
    },
    "deity": "Maa Vaishno Devi (Maha Kali, Maha Lakshmi, Maha Saraswati)",
    "imageUrl": "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=800",
    "description": "Holy cave shrine located at 5,200 feet in the Trikuta Mountains, where Mother Goddess is manifested as three holy natural stone pindis.",
    "openingHours": "05:00 AM - 10:00 PM",
    "speciality": "Three holy Pindis inside natural cave, 12-km scenic mountain track, Jai Mata Di chanting"
  },
  {
    "name": "Amarnath Cave Temple",
    "location": {
      "city": "Amarnath",
      "state": "Jammu & Kashmir"
    },
    "deity": "Lord Shiva (Swayambhu Ice Lingam)",
    "imageUrl": "https://images.unsplash.com/photo-1608958416719-7ba55a5bf9fa?auto=format&fit=crop&q=80&w=800",
    "description": "Himalayan cave at an altitude of 3,888 meters where a natural ice stalagmite Shiva Lingam forms and wanes with the phases of the moon during Shravan.",
    "openingHours": "06:00 AM - 06:00 PM (July - August Yatra)",
    "speciality": "Natural ice Shivalinga formation, Legendary Amarnath Yatra pilgrimage"
  },
  {
    "name": "Golden Temple",
    "location": {
      "city": "Amritsar",
      "state": "Punjab"
    },
    "deity": "Guru Granth Sahib",
    "imageUrl": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&q=80&w=800",
    "description": "Holiest Gurdwara of Sikhism covered with pure gold foil, located in the centre of the sacred Amrit Sarovar pond, serving free meals (Langar) to 100,000 people daily.",
    "openingHours": "04:00 AM - 11:00 PM (Langar 24/7)",
    "speciality": "World largest free community kitchen (Guru ka Langar), Pure gold gilded exterior"
  },
  {
    "name": "Murudeshwar Temple",
    "location": {
      "city": "Murudeshwar",
      "state": "Karnataka"
    },
    "deity": "Lord Shiva",
    "imageUrl": "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&q=80&w=800",
    "description": "Flanked by the Arabian Sea on three sides, famous for the second tallest Lord Shiva statue in the world (123 feet) and a 20-story Rajagopuram.",
    "openingHours": "06:00 AM - 01:00 PM, 03:00 PM - 08:30 PM",
    "speciality": "123-ft world second tallest Shiva statue, 20-storey Raja Gopuram with lift view"
  },
  {
    "name": "Udupi Sri Krishna Temple",
    "location": {
      "city": "Udupi",
      "state": "Karnataka"
    },
    "deity": "Lord Krishna (Kanakana Kindi)",
    "imageUrl": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800",
    "description": "Established in the 13th century by Saint Madhvacharya. The deity is worshiped through the holy Kanakana Kindi window through which Lord Krishna turned for his devotee Kanakadasa.",
    "openingHours": "05:00 AM - 09:30 PM",
    "speciality": "Kanakana Kindi 9-holed silver window, Ashta Mathas administration, Annadana"
  },
  {
    "name": "Virupaksha Temple",
    "location": {
      "city": "Hampi",
      "state": "Karnataka"
    },
    "deity": "Lord Virupaksha (Shiva) & Pampa Devi",
    "imageUrl": "https://images.unsplash.com/photo-1609948543911-2a2c3a1d8e3d?auto=format&fit=crop&q=80&w=800",
    "description": "The crowning jewel of the UNESCO World Heritage Hampi ruins on the Tungabhadra River, actively in continuous worship since the 7th century AD.",
    "openingHours": "06:00 AM - 08:00 PM",
    "speciality": "UNESCO World Heritage, Pin-hole camera optical effect, 160-foot eastern gopuram"
  },
  {
    "name": "Kukke Subramanya Temple",
    "location": {
      "city": "Subramanya",
      "state": "Karnataka"
    },
    "deity": "Lord Kartikeya (Subramanya)",
    "imageUrl": "https://images.unsplash.com/photo-1621855885791-6e5cfa5c0c9e?auto=format&fit=crop&q=80&w=800",
    "description": "Surrounded by the Western Ghats Kumaraparvatha mountains. Revered across the world for Sarpa Samskara and Ashlesha Bali snake dosha remedies.",
    "openingHours": "05:00 AM - 01:30 PM, 03:30 PM - 08:30 PM",
    "speciality": "Sarpa Samskara and Ashlesha Bali remedies, Kumara Parvatha trek gateway"
  },
  {
    "name": "Chamundeshwari Temple",
    "location": {
      "city": "Mysuru",
      "state": "Karnataka"
    },
    "deity": "Goddess Chamundeshwari (Durga)",
    "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
    "description": "Regal Shakti shrine atop the 3,300-foot Chamundi Hills overlooking the royal city of Mysuru, celebrated as the slayer of demon Mahishasura.",
    "openingHours": "07:30 AM - 02:00 PM, 03:30 PM - 06:00 PM, 07:30 PM - 09:00 PM",
    "speciality": "Mysore Dasara royal celebrations, 1000 stone steps with monolithic Nandi"
  },
  {
    "name": "Kollur Mookambika Temple",
    "location": {
      "city": "Kollur",
      "state": "Karnataka"
    },
    "deity": "Goddess Mookambika (Mahalakshmi / Saraswati / Durga)",
    "imageUrl": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    "description": "Sacred pilgrimage centre situated in the foothills of Kodachadri in Western Ghats, renowned as a seat of Vidyarambham, fine arts, and divine Shakti energy.",
    "openingHours": "05:00 AM - 01:30 PM, 03:00 PM - 09:00 PM",
    "speciality": "Sowparnika river holy dip, Jyotirlinga with golden streak line, Vidyarambham rituals"
  }
];

module.exports = allTemplesData;
