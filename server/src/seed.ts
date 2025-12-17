import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from './models/User';
import BusinessProfile, { VerificationStatus } from './models/BusinessProfile';
import Complaint, { ComplaintStatus } from './models/Complaint';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'your_mongodb_connection_string_here';

// --- DATA GENERATORS ---
const industries = ['Technology', 'Retail', 'Healthcare', 'Finance', 'Food & Beverage', 'Automotive', 'Real Estate', 'Education'];
const complaintTitles = ['Late Delivery', 'Damaged Product', 'Overcharged', 'Customer Service Issue', 'Defective Item', 'Refund Not Received', 'Account Locked', 'App Crashing'];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected to MongoDB...');

    // 1. Clear existing data
    console.log('🧹 Clearing old data...');
    await User.deleteMany({});
    await BusinessProfile.deleteMany({});
    await Complaint.deleteMany({});

    // (Admin Creation Removed as requested)

    // 2. Create 20 Business Users & Profiles
    console.log('🏢 Creating 20 Businesses...');
    const businessUsers = [];
    for (let i = 1; i <= 20; i++) {
      // Create User
      const user = await User.create({
        googleId: `biz_google_id_${i}`,
        email: `business${i}@example.com`,
        displayName: `Business Owner ${i}`,
        role: UserRole.BUSINESS,
        isVerified: i <= 15 // First 15 are verified, last 5 are pending
      });
      businessUsers.push(user);

      // Create Profile
      const status = i <= 15 ? VerificationStatus.APPROVED : (i <= 18 ? VerificationStatus.PENDING : VerificationStatus.REJECTED);
      
      await BusinessProfile.create({
        user: user._id,
        companyName: `Company ${i} - ${getRandom(industries)}`,
        industry: getRandom(industries),
        description: `We are a leading provider in the ${getRandom(industries)} sector, dedicated to serving customers since 20${10 + i}.`,
        documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1631234567/sample.pdf', // Dummy PDF
        status: status,
        submittedAt: new Date()
      });
    }

    // 3. Create 20 Consumers
    console.log('👤 Creating 20 Consumers...');
    const consumerUsers = [];
    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        googleId: `cons_google_id_${i}`,
        email: `consumer${i}@example.com`,
        displayName: `Consumer ${i}`,
        role: UserRole.CONSUMER,
        isVerified: true
      });
      consumerUsers.push(user);
    }

    // 4. Create 20 Complaints
    console.log('📝 Creating 20 Complaints...');
    for (let i = 1; i <= 20; i++) {
      const consumer = getRandom(consumerUsers);
      const business = getRandom(businessUsers.slice(0, 15)); // Only complain against verified businesses
      const status = getRandom(Object.values(ComplaintStatus));
      
      // Generate Thread
      const thread = [];
      // Initial message
      thread.push({
        userId: consumer._id,
        userName: consumer.displayName,
        role: 'CONSUMER',
        content: `I am facing an issue with my order. ${getRandom(complaintTitles)}. Please help.`,
        timestamp: new Date(Date.now() - 10000000)
      });

      // If open/resolved, add business reply
      if (status !== 'PENDING') {
        thread.push({
          userId: business._id,
          userName: `Company Rep`,
          role: 'BUSINESS',
          content: 'We apologize for the inconvenience. Can you please provide your order ID?',
          timestamp: new Date(Date.now() - 5000000)
        });
      }

      await Complaint.create({
        complaintId: `CMP-SEED-${1000 + i}`,
        title: getRandom(complaintTitles),
        description: `I purchased a service last week and I am facing a ${getRandom(complaintTitles)}. It has been very frustrating trying to reach support.`,
        consumer: consumer._id,
        business: business._id, // User ID of the business
        status: status,
        thread: thread,
        createdAt: new Date()
      });
    }

    console.log('✅ Database Seeded Successfully (No Admin Created)!');
    process.exit();

  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();