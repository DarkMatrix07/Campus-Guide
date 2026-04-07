const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
  { name: 'Aman Sharma', email: 'aman@student.com', password: 'aman123', role: 'student' },
  { name: 'Raj Patel', email: 'raj@owner.com', password: 'raj12345', role: 'owner' },
  { name: 'Admin', email: 'admin@campus.com', password: 'admin123', role: 'admin' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  for (const u of users) {
    await User.create(u);
  }
  console.log('Users seeded successfully');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
