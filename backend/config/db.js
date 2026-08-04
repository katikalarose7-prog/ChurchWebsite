import './loadEnv.js';
import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(
      '\nMONGO_URI is not set.\n' +
        '  1. Make sure a ".env" file exists inside the backend/ folder (copy .env.example to .env).\n' +
        '  2. Make sure it contains a line like: MONGO_URI=mongodb+srv://...\n' +
        '  3. Restart the server after saving the .env file.\n'
    );
    process.exit(1);
  }

  // Some networks/ISPs use DNS resolvers that don't correctly support the
  // "SRV" DNS record type that mongodb+srv:// connection strings rely on.
  // This causes: "querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net"
  // even though the internet connection itself is fine. As a workaround,
  // operators can set DNS_SERVERS in .env (e.g. "8.8.8.8,8.8.4.4") to force
  // Node to use a resolver known to support SRV lookups (Google/Cloudflare).
  if (process.env.DNS_SERVERS) {
    const servers = process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean);
    if (servers.length) {
      dns.setServers(servers);
      console.log(`Using custom DNS servers for MongoDB SRV lookup: ${servers.join(', ')}`);
    }
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);

    // Build all model indexes (e.g. the Song text-search index) up front and
    // surface any failure clearly, instead of letting it fail silently on
    // whichever request happens to trigger index creation first.
    const modelNames = mongoose.modelNames();
    for (const name of modelNames) {
      try {
        await mongoose.model(name).init();
      } catch (indexErr) {
        console.error(`\nFailed to build indexes for model "${name}": ${indexErr.message}`);
        console.error(
          'This usually means the MongoDB Atlas database user does not have\n' +
            'permission to create indexes, or a conflicting index already exists.\n' +
            'Check Atlas → Database Access (user role should be at least\n' +
            '"readWrite" on this database) and Atlas → your cluster → Browse\n' +
            'Collections → the affected collection\'s Indexes tab.\n'
        );
      }
    }
  } catch (error) {
    if (error.message?.includes('querySrv') || error.code === 'ECONNREFUSED') {
      console.error(
        `\nMongoDB connection error: ${error.message}\n\n` +
          'This usually means your network/ISP DNS resolver cannot look up the\n' +
          '"SRV" record that mongodb+srv:// connection strings require — it is\n' +
          'not a problem with your code or MongoDB Atlas credentials. Try one of:\n\n' +
          '  A) Add this line to backend/.env and restart the server:\n' +
          '       DNS_SERVERS=8.8.8.8,8.8.4.4\n\n' +
          '  B) Change your Windows network adapter\'s DNS servers to\n' +
          '       8.8.8.8 / 8.8.4.4 (Google) or 1.1.1.1 / 1.0.0.1 (Cloudflare),\n' +
          '       then run: ipconfig /flushdns\n\n' +
          '  C) In MongoDB Atlas, click "Connect" on your cluster and choose the\n' +
          '       older standard connection string (starts with "mongodb://" and\n' +
          '       lists multiple hosts, not "mongodb+srv://") — this avoids SRV\n' +
          '       DNS lookups entirely.\n'
      );
    } else {
      console.error(`MongoDB connection error: ${error.message}`);
    }
    process.exit(1);
  }
};

export default connectDB;
