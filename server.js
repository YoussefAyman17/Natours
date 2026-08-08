const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  // console.log(err);

  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
  .connect(DB)
  .then((con) => console.log('DB Connection Successfully'))
  .catch((err) => console.log(err));
// const port = process.env.port || 3000;
// const server = app.listen(port, () => {
//   console.log(`listening on port: ${port}`);
// });

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

module.exports = app;
