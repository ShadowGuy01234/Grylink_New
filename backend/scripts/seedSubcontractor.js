const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Company = require('../models/Company');
const SubContractor = require('../models/SubContractor');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const seedSubcontractor = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // 1. First ensure we have a sales user (required for company)
    let salesUser = await User.findOne({ role: 'sales' });
    if (!salesUser) {
      salesUser = new User({
        name: 'Sales Manager',
        email: 'sales@gryork.com',
        password: 'password123',
        role: 'sales',
        phone: '8888888888'
      });
      await salesUser.save();
      console.log('Created sales user');
    }

    // 2. Create or find EPC Company (Buyer)
    let epcCompany = await Company.findOne({ email: 'epc.test@infrabuilders.com' });
    if (!epcCompany) {
      epcCompany = new Company({
        companyName: 'Infra Builders Pvt Ltd',
        ownerName: 'Rajesh Kumar',
        email: 'epc.test@infrabuilders.com',
        phone: '9876543210',
        address: '123 Industrial Area, Phase 1, Gurugram, Haryana - 122001',
        cin: 'U45200HR2015PTC054321',
        gstin: '06AABCI1234C1Z5',
        pan: 'AABCI1234C',
        status: 'ACTIVE',
        role: 'BUYER',
        salesAgentId: salesUser._id,
      });
      await epcCompany.save();
      console.log('Created EPC Company: Infra Builders Pvt Ltd');
    } else {
      console.log('EPC Company already exists');
    }

    // 3. Create EPC User account
    let epcUser = await User.findOne({ email: 'epc.test@infrabuilders.com' });
    if (!epcUser) {
      epcUser = new User({
        name: 'Rajesh Kumar',
        email: 'epc.test@infrabuilders.com',
        password: 'password123',
        role: 'epc',
        phone: '9876543210',
        companyId: epcCompany._id
      });
      await epcUser.save();
      
      // Link user to company
      epcCompany.userId = epcUser._id;
      await epcCompany.save();
      console.log('Created EPC User: epc.test@infrabuilders.com / password123');
    } else {
      console.log('EPC User already exists');
    }

    // 4. Create SubContractor record
    let subContractor = await SubContractor.findOne({ email: 'sc.test@metroworks.com' });
    if (!subContractor) {
      subContractor = new SubContractor({
        companyName: 'Metro Works Engineering',
        contactName: 'Amit Sharma',
        ownerName: 'Amit Sharma',
        email: 'sc.test@metroworks.com',
        phone: '9988776655',
        constitutionType: 'PVT_LTD',
        registeredAddress: {
          street: '45 Industrial Estate, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          country: 'India'
        },
        address: '45 Industrial Estate, Sector 62, Noida, UP - 201301',
        vendorId: 'VND-2024-0001',
        gstin: '09AABCM5678D1Z2',
        pan: 'AABCM5678D',
        bankDetails: {
          accountNumber: '123456789012',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          branchName: 'Noida Sector 62',
          accountType: 'CURRENT',
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date()
        },
        kycStatus: 'COMPLETED',
        kycCompletedAt: new Date(),
        sellerDeclaration: {
          accepted: true,
          acceptedAt: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script'
        },
        status: 'KYC_COMPLETED',
        linkedEpcId: epcCompany._id,
        salesAgentId: salesUser._id,
        contactedAt: new Date(),
        contactedBy: salesUser._id,
        contactNotes: 'Initial outreach completed via seed script'
      });
      await subContractor.save();
      console.log('Created SubContractor: Metro Works Engineering');
    } else {
      console.log('SubContractor already exists');
    }

    // 5. Create SubContractor User account
    let scUser = await User.findOne({ email: 'sc.test@metroworks.com' });
    if (!scUser) {
      scUser = new User({
        name: 'Amit Sharma',
        email: 'sc.test@metroworks.com',
        password: 'password123',
        role: 'subcontractor',
        phone: '9988776655',
        subContractorId: subContractor._id
      });
      await scUser.save();
      
      // Link user to subcontractor
      subContractor.userId = scUser._id;
      await subContractor.save();
      console.log('Created SubContractor User: sc.test@metroworks.com / password123');
    } else {
      console.log('SubContractor User already exists');
    }

    console.log('\n========================================');
    console.log('SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('\nTEST CREDENTIALS:');
    console.log('----------------------------------------');
    console.log('EPC (Buyer) Login:');
    console.log('  Email: epc.test@infrabuilders.com');
    console.log('  Password: password123');
    console.log('  Company: Infra Builders Pvt Ltd');
    console.log('----------------------------------------');
    console.log('SubContractor Login:');
    console.log('  Email: sc.test@metroworks.com');
    console.log('  Password: password123');
    console.log('  Company: Metro Works Engineering');
    console.log('  Status: KYC_COMPLETED (can submit CWCRF)');
    console.log('----------------------------------------');
    console.log('Internal Users (if needed):');
    console.log('  Sales: sales@gryork.com / password123');
    console.log('  Ops: ops@gryork.com / password123');
    console.log('  RMT: rmt@gryork.com / password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding subcontractor:', error);
    process.exit(1);
  }
};

seedSubcontractor();
