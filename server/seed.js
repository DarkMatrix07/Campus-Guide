const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  console.error('Seed must not run in production');
  process.exit(1);
}

const users = [
  { name: 'Aman Sharma', email: 'aman@student.com', password: 'aman1234', role: 'student' },
  { name: 'Raj Patel', email: 'raj@owner.com', password: 'raj12345', role: 'owner' },
  { name: 'Admin', email: 'admin@campus.com', password: 'admin1234', role: 'admin' },
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
