const { MongoClient } = require('mongodb');

const URI = 'mongodb+srv://bryan213256_db_user:cAXmZ4kOF2WvmM4q@microblogging.qplomqn.mongodb.net/';
const DB_NAME = 'microblogging';

let client;
let db;

async function connect() {
  if (db) return db;
  client = new MongoClient(URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Conectado a MongoDB Atlas → base de datos: "${DB_NAME}"`);
  return db;
}

async function getDb() {
  if (!db) await connect();
  return db;
}

async function getClient() {
  if (!client) await connect();
  return client;
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connect, getDb, getClient, close };
