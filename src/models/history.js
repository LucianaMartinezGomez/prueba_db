const mongoose = require('mongoose');

// Modelo Mongoose: historial clínico por paciente (documento identificado por email)
const ProductsHistorySchema = new mongoose.Schema({
  product: { type: String, unique: true, required: true },
  product_sku: String,
  // Citas embebidas para lecturas rápidas por paciente
  customer: [{
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    address: String,
    
  }]
});

module.exports = mongoose.model('ProductsHistory', ProductsHistorySchema);