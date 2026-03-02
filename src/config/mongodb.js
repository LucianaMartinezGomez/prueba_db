const { MongoClient } = require('mongodb');

// Obtenemos la URI de las variables de entorno
const uri = process.env.MONGODB_URI;
let client;
let dbConnection;

const connectMongoDB = async () => {
  // Si ya existe una conexión, la devolvemos para no crear otra
  if (dbConnection) return dbConnection;

  if (!uri) {
    throw new Error('❌ MONGODB_URI no está definida en las variables de entorno');
  }

  try {
    client = new MongoClient(uri);
    
    // Conectamos al servidor
    await client.connect();
    
    // Nombre de la base de datos 
    dbConnection = client.db(process.env.MONGODB_DB); 
    
    console.log('✅ MongoDB: Conexión establecida exitosamente');
    return dbConnection;
  } catch (error) {
    console.error('❌ MongoDB: Error de conexión:', error.message);
    process.exit(1); // Detenemos el servidor si la DB es crítica
  }
};

// Función para obtener la instancia de la DB en otros archivos
const getDb = () => {
  if (!dbConnection) {
    throw new Error('Debe llamar a connectMongoDB primero');
  }
  return dbConnection;
};

module.exports = { connectMongoDB, getDb };
const { pool } = require('./postgres');