// Endpoints del simulacro: migración y consultas (usa PostgreSQL y MongoDB)
const express = require('express');
const router = express.Router();
const path = require('path');
const { pool } = require('../config/postgres');
const { migrateData } = require('../services/migrationService');
const PatientHistory = require('../models/history');

// POST: Migrar datos desde CSV a la base de datos
// - Invoca `migrateData` que realiza inserciones en PostgreSQL y actualiza documentos en MongoDB
router.post('/migrate', async (req, res) => {
    try {
        const csvPath = path.join(__dirname, '../../data/prueba_data.csv');
        const result = await migrateData(csvPath);
        res.status(200).json({ ok: true, message: "Migration completed successfully", count: result.count });
    } catch (error) {
        // En caso de error devolvemos el mensaje para debugging
        res.status(500).json({ ok: false, error: error.message });
    }
});

// GET: Reporte de facturación por aseguradora (consulta SQL)
// - Esta ruta usa PostgreSQL para agregar datos relacionales
router.get('/report/insurance', async (req, res) => {
    try {
        const query = `
            SELECT 
                i.insurance_name,
                COUNT(a.appointment_id) as total_appointments,
                SUM(t.treatment_cost) as total_billed,
                SUM(a.amount_paid) as total_collected
            FROM insurance i
            JOIN patient p ON i.insurance_id = p.insurance_id
            JOIN appointment a ON p.patient_id = a.patient_id
            JOIN treatment t ON a.treatment_code = t.treatment_code
            GROUP BY i.insurance_name;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Historial de un paciente (MongoDB)
// - Lectura rápida desde la colección `PatientHistory` (documento por paciente)
router.get('/patient/:email/history', async (req, res) => {
    try {
        const history = await PatientHistory.findOne({ patientEmail: req.params.email });
        if (!history) return res.status(404).json({ message: "Paciente no encontrado" });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;