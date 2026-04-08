const startServer = async ({ app, connectDB, port = process.env.PORT || 5000, logger = console }) => {
  await connectDB();

  return await new Promise((resolve, reject) => {
    let server;

    try {
      server = app.listen(port);
    } catch (error) {
      reject(error);
      return;
    }

    server.once('error', reject);
    server.once('listening', () => {
      logger.log(`Server running on port ${port}`);
      resolve(server);
    });
  });
};

module.exports = { startServer };
