const dotenv = require('dotenv');
const { startServer } = require('./bootstrap');

dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'SESSION_SECRET', 'CLIENT_URL', 'SERVER_BASE_URL'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const connectDB = require('./config/db');
const app = require('./app');

startServer({ app, connectDB }).catch((error) => {
  console.error('Server startup error:', error.message);
  process.exit(1);
});
