import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import connectdb from './config/mongodb.js';

// Load models
import User from './models/Usermodel.js';
import Property from './models/propertymodel.js';
import Appointment from './models/appointmentModel.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Sample users with hashed passwords
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@buildestate.com',
    phone: '+216 20 123 456',
    password: await bcrypt.hash('admin123', 10)
  },
  {
    name: 'Ahmed Ben Ali',
    email: 'ahmed.benali@email.com',
    phone: '+216 22 345 678',
    password: await bcrypt.hash('password123', 10)
  },
  {
    name: 'Fatma Trabelsi',
    email: 'fatma.trabelsi@email.com',
    phone: '+216 24 567 890',
    password: await bcrypt.hash('password123', 10)
  },
  {
    name: 'Mohamed Karray',
    email: 'mohamed.karray@email.com',
    phone: '+216 26 789 012',
    password: await bcrypt.hash('password123', 10)
  },
  {
    name: 'Leila Mansouri',
    email: 'leila.mansouri@email.com',
    phone: '+216 28 901 234',
    password: await bcrypt.hash('password123', 10)
  }
];

// Properties with exact Tunisian coordinates
const sampleProperties = [
  {
    title: 'Luxury Apartment in Lac 2',
    location: 'Lac 2, Tunis',
    latitude: '36.8625',
    longitude: '10.2297',
    price: 450000,
    image: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'
    ],
    beds: 3,
    baths: 2,
    sqft: 1200,
    type: 'apartment',
    availability: 'buy',
    description: 'Modern luxury apartment in the prestigious Lac 2 area with stunning lake views and premium amenities.',
    amenities: ['pool', 'gym', 'security_system', 'covered_parking', 'internet_ready'],
    phone: '+216 20 123 456'
  },
  {
    title: 'Beachfront Villa in Sidi Bou Said',
    location: 'Sidi Bou Said, Tunis',
    latitude: '36.8704',
    longitude: '10.3467',
    price: 1200000,
    image: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'
    ],
    beds: 5,
    baths: 4,
    sqft: 3500,
    type: 'villa',
    availability: 'buy',
    description: 'Stunning traditional Tunisian villa with panoramic sea views in the iconic blue and white village of Sidi Bou Said.',
    amenities: ['pool', 'garden', 'garage', 'security_system', 'lake_view', 'fireplace'],
    phone: '+216 22 345 678'
  },
  {
    title: 'Modern Office Space in Centre Ville',
    location: 'Centre Ville, Tunis',
    latitude: '36.8008',
    longitude: '10.1815',
    price: 180000,
    image: [
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
      'https://images.unsplash.com/photo-1549924231-f97d9601a8fa?w=800'
    ],
    beds: 0,
    baths: 2,
    sqft: 800,
    type: 'office',
    availability: 'rent',
    description: 'Prime commercial space in the heart of Tunis, perfect for businesses seeking a prestigious downtown location.',
    amenities: ['covered_parking', 'internet_ready', 'security_system'],
    phone: '+216 24 567 890'
  },
  {
    title: 'Seaside Apartment in La Marsa',
    location: 'La Marsa, Tunis',
    latitude: '36.8781',
    longitude: '10.3247',
    price: 320000,
    image: [
      'https://images.unsplash.com/photo-1560185127-6ed189bf02a3?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    beds: 2,
    baths: 2,
    sqft: 950,
    type: 'apartment',
    availability: 'rent',
    description: 'Charming coastal apartment with sea breeze and easy access to La Marsa beach and restaurants.',
    amenities: ['garden', 'security_system', 'internet_ready'],
    phone: '+216 26 789 012'
  },
  {
    title: 'Family House in Ariana',
    location: 'Ariana Ville, Ariana',
    latitude: '36.8606',
    longitude: '10.1933',
    price: 280000,
    image: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'
    ],
    beds: 4,
    baths: 3,
    sqft: 2200,
    type: 'house',
    availability: 'buy',
    description: 'Spacious family home in quiet Ariana neighborhood, perfect for families with children.',
    amenities: ['garden', 'garage', 'central_heating'],
    phone: '+216 28 901 234'
  },
  {
    title: 'Luxury Resort Villa in Hammamet',
    location: 'Hammamet Nord, Nabeul',
    latitude: '36.4167',
    longitude: '10.6167',
    price: 850000,
    image: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02a3?w=800'
    ],
    beds: 6,
    baths: 5,
    sqft: 4200,
    type: 'villa',
    availability: 'buy',
    description: 'Magnificent resort-style villa with private beach access in the prestigious Hammamet tourist zone.',
    amenities: ['pool', 'garden', 'garage', 'security_system', 'gym', 'home_theater', 'dock'],
    phone: '+216 20 123 456'
  },
  {
    title: 'Commercial Space in Sousse Medina',
    location: 'Medina, Sousse',
    latitude: '35.8256',
    longitude: '10.6411',
    price: 95000,
    image: [
      'https://images.unsplash.com/photo-1549924231-f97d9601a8fa?w=800'
    ],
    beds: 0,
    baths: 1,
    sqft: 450,
    type: 'office',
    availability: 'rent',
    description: 'Traditional commercial space in the historic Sousse Medina, ideal for artisan shops or small businesses.',
    amenities: ['internet_ready'],
    phone: '+216 22 345 678'
  },
  {
    title: 'Modern Apartment in Sfax Centre',
    location: 'Centre Ville, Sfax',
    latitude: '34.7406',
    longitude: '10.7603',
    price: 165000,
    image: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    beds: 2,
    baths: 1,
    sqft: 750,
    type: 'apartment',
    availability: 'buy',
    description: 'Contemporary apartment in Sfax city center with modern amenities and convenient location.',
    amenities: ['security_system', 'internet_ready', 'covered_parking'],
    phone: '+216 24 567 890'
  },
  {
    title: 'Countryside Villa in Zaghouan',
    location: 'Zaghouan Centre, Zaghouan',
    latitude: '36.4028',
    longitude: '10.1425',
    price: 220000,
    image: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
    ],
    beds: 3,
    baths: 2,
    sqft: 1800,
    type: 'villa',
    availability: 'buy',
    description: 'Peaceful countryside villa surrounded by olive groves with mountain views in historic Zaghouan.',
    amenities: ['garden', 'fireplace', 'garage'],
    phone: '+216 26 789 012'
  },
  {
    title: 'Penthouse in Monastir Marina',
    location: 'Marina, Monastir',
    latitude: '35.7719',
    longitude: '10.8264',
    price: 520000,
    image: [
      'https://images.unsplash.com/photo-1560185127-6ed189bf02a3?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    beds: 3,
    baths: 3,
    sqft: 1600,
    type: 'apartment',
    availability: 'buy',
    description: 'Exclusive penthouse overlooking Monastir marina with panoramic sea views and luxury finishes.',
    amenities: ['pool', 'gym', 'security_system', 'covered_parking', 'dock'],
    phone: '+216 28 901 234'
  }
];

const generateAppointments = (users, properties) => {
  const appointments = [];
  const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  const times = ['09:00', '10:30', '14:00', '15:30', '16:00'];
  
  // Generate 15 sample appointments
  for (let i = 0; i < 15; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomProperty = properties[Math.floor(Math.random() * properties.length)];
    const randomOwner = users[Math.floor(Math.random() * users.length)];
    
    // Generate dates between 30 days ago and 30 days from now
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 60) - 30);
    
    appointments.push({
      propertyId: randomProperty._id,
      userId: randomUser._id,
      ownerId: randomOwner._id,
      date: randomDate,
      time: times[Math.floor(Math.random() * times.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: `Appointment for viewing ${randomProperty.title}`,
      meetingPlatform: ['zoom', 'google-meet', 'teams'][Math.floor(Math.random() * 3)]
    });
  }
  
  return appointments;
};

const showMenu = () => {
  console.log('\n🏠 BuildEstate Database Seeder');
  console.log('================================');
  console.log('1. 📊 Show current database status');
  console.log('2. 🌱 Seed database with mock data');
  console.log('3. 🗑️  Clear all data from database');
  console.log('4. 🔄 Reset database (clear + seed)');
  console.log('5. ❌ Exit');
  console.log('================================\n');
};

const showDatabaseStatus = async () => {
  try {
    const userCount = await User.countDocuments();
    const propertyCount = await Property.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    
    console.log('\n📊 Current Database Status:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏠 Properties: ${propertyCount}`);
    console.log(`📅 Appointments: ${appointmentCount}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error checking database status:', error.message);
  }
};

const confirmAction = async (message) => {
  const answer = await question(`⚠️  ${message} (type 'YES' to confirm): `);
  return answer.toUpperCase() === 'YES';
};

const seedDatabase = async () => {
  try {
    console.log('\n🌱 Seeding database with mock data...');
    
    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Create properties with random user assignments
    console.log('🏠 Creating properties...');
    const propertiesWithOwners = sampleProperties.map(property => ({
      ...property,
      user: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id
    }));
    const createdProperties = await Property.insertMany(propertiesWithOwners);
    console.log(`✅ Created ${createdProperties.length} properties`);
    
    // Create appointments
    console.log('📅 Creating appointments...');
    const appointments = generateAppointments(createdUsers, createdProperties);
    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`✅ Created ${createdAppointments.length} appointments`);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@buildestate.com / admin123');
    console.log('User: ahmed.benali@email.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};

const clearDatabase = async () => {
  try {
    console.log('\n🗑️ Clearing database...');
    
    await User.deleteMany({});
    await Property.deleteMany({});
    await Appointment.deleteMany({});
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  }
};

const resetDatabase = async () => {
  await clearDatabase();
  await seedDatabase();
};

const main = async () => {
  try {
    await connectdb();
    console.log('✅ Connected to MongoDB');
    
    while (true) {
      showMenu();
      const choice = await question('Select an option (1-5): ');
      
      switch (choice) {
        case '1':
          await showDatabaseStatus();
          break;
          
        case '2':
          await showDatabaseStatus();
          if (await confirmAction('This will add mock data to the database. Continue?')) {
            await seedDatabase();
          } else {
            console.log('❌ Operation cancelled.');
          }
          break;
          
        case '3':
          await showDatabaseStatus();
          if (await confirmAction('This will DELETE ALL DATA from the database. Continue?')) {
            await clearDatabase();
          } else {
            console.log('❌ Operation cancelled.');
          }
          break;
          
        case '4':
          await showDatabaseStatus();
          if (await confirmAction('This will DELETE ALL DATA and then seed with mock data. Continue?')) {
            await resetDatabase();
          } else {
            console.log('❌ Operation cancelled.');
          }
          break;
          
        case '5':
          console.log('👋 Goodbye!');
          rl.close();
          process.exit(0);
          
        default:
          console.log('❌ Invalid option. Please select 1-5.');
      }
      
      await question('\nPress Enter to continue...');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
};

// Handle command line arguments for backward compatibility
if (process.argv[2] === '-d') {
  await connectdb();
  await clearDatabase();
  process.exit(0);
} else if (process.argv[2] === '-s') {
  await connectdb();
  await seedDatabase();
  process.exit(0);
} else if (process.argv[2] === '-r') {
  await connectdb();
  await resetDatabase();
  process.exit(0);
} else {
  main();
}