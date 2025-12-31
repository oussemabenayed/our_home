import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectdb from './config/mongodb.js';
import Property from './models/propertymodel.js';
import User from './models/Usermodel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importProperties = async () => {
  try {
    // Get JSON file path from command line argument
    const jsonFilePath = process.argv[2];
    if (!jsonFilePath) {
      console.error('❌ Error: Please provide the path to the JSON file as a command line argument.');
      console.log('Usage: node import-properties.js <path-to-json-file>');
      process.exit(1);
    }

    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`❌ Error: File '${jsonFilePath}' does not exist.`);
      process.exit(1);
    }

    // Read and parse JSON file
    console.log('📖 Reading JSON file...');
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    let propertiesData;
    try {
      propertiesData = JSON.parse(jsonData);
    } catch (parseError) {
      console.error('❌ Error: Invalid JSON format in the file.');
      process.exit(1);
    }

    if (!Array.isArray(propertiesData)) {
      console.error('❌ Error: JSON file must contain an array of property objects.');
      process.exit(1);
    }

    console.log(`✅ Found ${propertiesData.length} properties to import.`);

    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectdb();
    console.log('✅ Connected to database.');

    // Find admin user for default ownership
    console.log('👤 Finding admin user...');
    const adminUser = await User.findOne({ email: 'admin@buildestate.com' });
    if (!adminUser) {
      console.error('❌ Error: Admin user not found. Please ensure the database is seeded with admin user.');
      process.exit(1);
    }
    console.log('✅ Admin user found.');

    // Map and prepare properties for insertion
    const propertiesToInsert = [];
    let skippedCount = 0;

    for (const item of propertiesData) {
      try {
        // Map fields according to requirements
        const mappedProperty = {
          title: item.title,
          location: `${item.geo_ville}, ${item.geo_dep}`,
          latitude: item.latitude?.toString(),
          longitude: item.longitude?.toString(),
          price: item.price,
          image: item.images || [], // array of image URLs
          beds: item.chambres,
          baths: item.salle_de_bain,
          sqft: item.surface_habitable,
          type: 'house', // default type
          availability: 'buy', // default availability
          description: item.description,
          amenities: item.options || [], // array of features
          phone: '+216 00 000 000', // default phone
          user: adminUser._id
        };

        // Validate required fields
        const requiredFields = ['title', 'location', 'price', 'image', 'beds', 'baths', 'sqft', 'type', 'availability', 'description', 'amenities', 'phone', 'user'];
        const missingFields = requiredFields.filter(field => mappedProperty[field] === undefined || mappedProperty[field] === null);

        if (missingFields.length > 0) {
          console.warn(`⚠️  Skipping property "${item.title}": Missing required fields: ${missingFields.join(', ')}`);
          skippedCount++;
          continue;
        }

        propertiesToInsert.push(mappedProperty);
      } catch (mappingError) {
        console.warn(`⚠️  Skipping property: Error mapping fields - ${mappingError.message}`);
        skippedCount++;
      }
    }

    if (propertiesToInsert.length === 0) {
      console.log('❌ No valid properties to insert.');
      process.exit(1);
    }

    console.log(`📊 Ready to insert ${propertiesToInsert.length} properties (${skippedCount} skipped).`);

    // Insert properties
    console.log('💾 Inserting properties into database...');
    const insertedProperties = await Property.insertMany(propertiesToInsert);
    console.log(`✅ Successfully inserted ${insertedProperties.length} properties.`);

    // Summary
    console.log('\n📋 Import Summary:');
    console.log(`   Total in file: ${propertiesData.length}`);
    console.log(`   Successfully inserted: ${insertedProperties.length}`);
    console.log(`   Skipped: ${skippedCount}`);

  } catch (error) {
    console.error('❌ Error during import:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

// Run the import
importProperties();