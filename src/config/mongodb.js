const mongoose = require('mongoose');

// Obtenemos la URI de las variables de entorno
const uri = process.env.MONGODB_URI;

const connectMongoDB = async () => {
 try {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ MongoDB: Conexión (mongoose) establecida exitosamente');
  

 } catch (error) {
  console.log('❌ MongoDB: Error de conexión (mongoose):', error.message);
  process.exit(1);
 }
}

module.exports = { connectMongoDB };
