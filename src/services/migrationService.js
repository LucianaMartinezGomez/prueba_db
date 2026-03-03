const fs = require("fs");
const csv = require("csv-parser");
const { pool } = require("../config/postgres");
const PatientHistory = require("../models/history");

const migrateData = async (csvPath) => {
  const results = [];

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvPath)) {
      return reject(
        new Error(`El archivo CSV no existe en la ruta: ${csvPath}`),
      );
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          console.log(`🚀 Procesando ${results.length} filas...`);

          for (const row of results) {
            // 1. Insertar Cliente (customer)
            customer_nameSplit = row.customer_name.split(" ");
            let first_name = customer_nameSplit[0];
            let last_name = customer_nameSplit[1];
            console.log(first_name);
            console.log(last_name);
            
            const custRes = await pool.query(
              `INSERT INTO "customer" (first_name, last_name, email, phone, address) 
                             VALUES ($1, $2, $3, $4, $5) 
                             ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name 
                             RETURNING id`,
              [
                first_name,
                last_name,
                row.customer_email,
                row.customer_phone,
                row.customer_address,
              ],
            );
            const customerId = custRes.rows[0].id;

            // 2. Insertar Proveedor (supplier)
            const suppRes = await pool.query(
              `INSERT INTO "supplier" (name, email) 
                             VALUES ($1, $2) 
                             ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name 
                             RETURNING id`,
              [row.supplier_name, row.supplier_email],
            );
            const supplierId = suppRes.rows[0].id;

            // 3. Insertar Producto (product)
            const prodRes = await pool.query(
              `INSERT INTO "product" (product_sku, name, category_id) 
                             VALUES ($1, $2, $3) 
                             ON CONFLICT (product_sku) DO UPDATE SET name = EXCLUDED.name 
                             RETURNING product_sku`,
              [row.product_sku, row.product_name, row.category_id || 1],
            );
            const productSku = prodRes.rows[0].product_sku;

            // 4. Insertar Venta (sale)
            await pool.query(
              `INSERT INTO "sale" (id, customer_id, supplier_id, date, total_price, product_sku, quantity) 
                             VALUES ($1, $2, $3, $4, $5, $6, $7) 
                             ON CONFLICT (id) DO NOTHING`,
              [
                row.sale_id,
                customerId,
                supplierId,
                row.date,
                row.total_price,
                productSku,
                row.quantity,
              ],
            );

            // 5. MongoDB (NoSQL)
            await PatientHistory.findOneAndUpdate(
              { patientEmail: row.email },
              {
                patientName: `${row.first_name} ${row.last_name}`,
                $push: {
                  appointments: {
                    date: row.date,
                    productName: row.product_name,
                    totalPrice: row.total_price,
                  },
                },
              },
              { upsert: true },
            );
          }
          resolve({ ok: true, count: results.length });
        } catch (error) {
          //await pool.query('ROLLBACK'); // En caso de error, revertimos cualquier cambio parcial
          console.error("❌ Error en migración:", error.message);
          reject(error);
        }
      });
  });
};

module.exports = { migrateData };
