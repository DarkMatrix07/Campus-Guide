const mongoose = require('mongoose');

const buildMongoOptions = () => {
  const options = {};
  const serverSelectionTimeoutMS = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 15000);

  if (Number.isFinite(serverSelectionTimeoutMS) && serverSelectionTimeoutMS > 0) {
    options.serverSelectionTimeoutMS = serverSelectionTimeoutMS;
  }

  if (process.env.MONGO_TLS_ALLOW_INVALID_CERTIFICATES === 'true') {
    options.tlsAllowInvalidCertificates = true;
  }

  if (process.env.MONGO_TLS_ALLOW_INVALID_HOSTNAMES === 'true') {
    options.tlsAllowInvalidHostnames = true;
  }

  return options;
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, buildMongoOptions());
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.buildMongoOptions = buildMongoOptions;
