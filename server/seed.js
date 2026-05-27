/**
 * Seed Script — Creates demo user + sample job applications
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobtracker';

// ─── Inline schemas (avoid importing full models) ─────────────────────────────
const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String }, { timestamps: true });
const jobSchema  = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId, companyName: String, roleTitle: String,
  location: String, jobUrl: String, source: String, status: String,
  appliedDate: Date, interviewDate: Date, salaryNote: String, notes: String, priority: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Job  = mongoose.model('JobApplication', jobSchema);

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Wipe existing demo user
  const existing = await User.findOne({ email: 'demo@jobtracker.com' });
  if (existing) {
    await Job.deleteMany({ user: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log('🗑  Cleared existing demo data');
  }

  // Create demo user
  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash('demo123', salt);
  const user = await User.create({ name: 'Demo User', email: 'demo@jobtracker.com', password: hashed });
  console.log('👤 Demo user created: demo@jobtracker.com / demo123');

  // Sample applications
  const jobs = [
    { companyName: 'Google', roleTitle: 'Software Engineer (SWE)', location: 'Bangalore', source: 'LinkedIn', status: 'Interview', priority: 'High', appliedDate: new Date('2025-01-05'), interviewDate: new Date('2025-02-10'), salaryNote: '₹28 LPA', notes: 'Phone screen cleared. Next: technical round.' },
    { companyName: 'Microsoft', roleTitle: 'SDE-1', location: 'Hyderabad', source: 'Company Website', status: 'OA', priority: 'High', appliedDate: new Date('2025-01-08'), salaryNote: '₹24 LPA', notes: 'OA scheduled for next week.' },
    { companyName: 'Amazon', roleTitle: 'SDE Intern', location: 'Remote', source: 'LinkedIn', status: 'Applied', priority: 'Medium', appliedDate: new Date('2025-01-10'), salaryNote: '₹8k/month stipend' },
    { companyName: 'Flipkart', roleTitle: 'Backend Engineer', location: 'Bangalore', source: 'Referral', status: 'Offer', priority: 'High', appliedDate: new Date('2024-12-20'), interviewDate: new Date('2025-01-15'), salaryNote: '₹20 LPA', notes: 'Offer received! Negotiating.' },
    { companyName: 'Swiggy', roleTitle: 'Full Stack Developer', location: 'Bangalore', source: 'Naukri', status: 'Applied', priority: 'Medium', appliedDate: new Date('2025-01-12') },
    { companyName: 'Zomato', roleTitle: 'React Developer', location: 'Delhi', source: 'LinkedIn', status: 'Rejected', priority: 'Low', appliedDate: new Date('2024-12-15'), notes: 'Rejected after 1st round.' },
    { companyName: 'Razorpay', roleTitle: 'Node.js Engineer', location: 'Bangalore', source: 'Company Website', status: 'Saved', priority: 'Medium', salaryNote: '₹18-22 LPA' },
    { companyName: 'CRED', roleTitle: 'Frontend Engineer', location: 'Bangalore', source: 'LinkedIn', status: 'Applied', priority: 'Medium', appliedDate: new Date('2025-01-14') },
    { companyName: 'Zepto', roleTitle: 'Software Engineer', location: 'Mumbai', source: 'Referral', status: 'Interview', priority: 'High', appliedDate: new Date('2025-01-03'), interviewDate: new Date('2025-01-28'), notes: 'Referral from senior.' },
    { companyName: 'Meesho', roleTitle: 'MERN Developer', location: 'Bangalore', source: 'Indeed', status: 'Withdrawn', priority: 'Low', appliedDate: new Date('2024-12-10'), notes: 'Withdrew — salary too low.' },
  ];

  const created = await Job.insertMany(jobs.map(j => ({ ...j, user: user._id })));
  console.log(`✅ Created ${created.length} sample job applications`);

  console.log('\n🎉 Seed complete! Login with:');
  console.log('   Email:    demo@jobtracker.com');
  console.log('   Password: demo123\n');

  await mongoose.disconnect();
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
