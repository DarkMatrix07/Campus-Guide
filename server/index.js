const dotenv = require('dotenv');
const { startServer } = require('./bootstrap');

dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

startServer({ app, connectDB }).catch((error) => {
  console.error('Server startup error:', error.message);
  process.exit(1);
});
