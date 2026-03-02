const mongoose = require('mongoose');

// Modelo Mongoose: historial clínico por paciente (documento identificado por email)
const PatientHistorySchema = new mongoose.Schema({
  patientEmail: { type: String, unique: true, required: true },
  patientName: String,
  // Citas embebidas para lecturas rápidas por paciente
  appointments: [{
    appointmentDate: Date,
    doctorName: String,
    specialty: String,
    treatmentDescription: String,
    treatmentCost: Number,
    insuranceName: String,
    amountPaid: Number
  }]
});

module.exports = mongoose.model('PatientHistory', PatientHistorySchema);