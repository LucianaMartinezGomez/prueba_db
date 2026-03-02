// Migra datos desde un CSV hacia PostgreSQL y MongoDB (procesamiento fila-a-fila)
// Nota: para grandes volúmenes hay que optimizar (batches, COPY, bulkWrite)
const fs = require('fs');
const csv = require('csv-parser');
const { pool } = require('../config/postgres');
const PatientHistory = require('../models/history');

const migrateData = async (csvPath) => {
    const results = [];
    
    return new Promise((resolve, reject) => {
        // Validación: existe el archivo CSV
        if (!fs.existsSync(csvPath)) {
            return reject(new Error(`El archivo CSV no existe en la ruta: ${csvPath}`));
        }

        // Lectura secuencial del CSV
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    console.log(`Iniciando procesamiento de ${results.length} filas...`);

                    // Procesamiento actual: fila-a-fila (await en cada iteración).
                    // Recomendar optimizar si hay muchos registros (batching).

                    for (const row of results) {
                        // 1) SQL: insertar u obtener aseguradora (upsert por nombre)
                        const CustRes = await pool.query(
                            'INSERT INTO customer (first_name, last_name, email) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name RETURNING customer_id',
                            [row.first_name, row.last_name, row.email]
                        );
                        const insuranceId = CustRes.rows[0].customer_id;

                        // 2) SQL: insertar u obtener doctor (upsert por email)
                        const supplierRes = await pool.query(
                            'INSERT INTO supplier (supplier_name, supplier_email) VALUES ($1, $2) ON CONFLICT (supplier_email) DO UPDATE SET supplier_name = EXCLUDED.supplier_name RETURNING supplier_id',
                            [row.supplier_name, row.supplier_email]
                        );
                        const supplierId = supplierRes.rows[0].supplier_id;

                        // 3) SQL: insertar u obtener paciente (upsert por email)
                        const productRes = await pool.query(
                            'INSERT INTO product (product_name, patient_email, patient_phone, patient_address, insurance_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (patient_email) DO UPDATE SET product_name = EXCLUDED.product_name RETURNING product_id',
                            [row.patient_name, row.patient_email, row.patient_phone, row.patient_address, insuranceId]
                        );
                        const patientId = productRes.rows[0].product_id;

                        // 4) SQL: insertar tratamiento (si no existe)
                        await pool.query(
                            'INSERT INTO treatment (treatment_code, treatment_description, treatment_cost) VALUES ($1, $2, $3) ON CONFLICT (treatment_code) DO NOTHING',
                            [row.treatment_code, row.treatment_description, row.treatment_cost]
                        );

                        // 5) SQL: insertar cita (registro relacional)
                        await pool.query(
                            'INSERT INTO appointment (appointment_date, patient_id, supplier_id, treatment_code, coverage_percentage, amount_paid) VALUES ($1, $2, $3, $4, $5, $6)',
                            [row.appointment_date, patientId, doctorId, row.treatment_code, row.coverage_percentage, row.amount_paid]
                        );

                        // 6) NoSQL: actualizar historial en MongoDB por email (upsert)
                        await PatientHistory.findOneAndUpdate(
                            { patientEmail: row.patient_email },
                            { 
                                patientName: row.patient_name,
                                $push: { 
                                    appointments: {
                                        appointmentDate: row.appointment_date,
                                        doctorName: row.doctor_name,
                                        specialty: row.specialty,
                                        treatmentDescription: row.treatment_description,
                                        treatmentCost: row.treatment_cost,
                                        insuranceName: row.insurance_provider,
                                        amountPaid: row.amount_paid
                                    } 
                                }
                            },
                            { upsert: true }
                        );
                    }
                    resolve({ ok: true, count: results.length });
                } catch (error) {
                    // Rechazamos con el error para que el llamador lo maneje
                    reject(error);
                }
            });
    });
};

module.exports = { migrateData };