const { pool } = require('./postgres');

// Crea las tablas SQL necesarias si no existen (idempotente)
const initDatabase = async () => {
  const queryText = `
  CREATE TABLE IF NOT EXISTS "category" (
	"id" SERIAL,
	"name" VARCHAR(100) NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "supplier" (
	"id" SERIAL,
	"name" VARCHAR(150) NOT NULL,
	"email" VARCHAR(150) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "customer" (
	"id" SERIAL,
	"first_name" VARCHAR(150) NOT NULL,
	"last_name" VARCHAR(150) NOT NULL,
	"email" VARCHAR(150) NOT NULL UNIQUE,
	"phone" VARCHAR(30),
	"address" TEXT,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "product" (
	"product_sku" VARCHAR(20),
	"name" VARCHAR(150) NOT NULL,
	"category_id" INTEGER NOT NULL,
	PRIMARY KEY("product_sku")
);




CREATE TABLE IF NOT EXISTS "product_supplier" (
	"unit_price" DECIMAL(10,2) NOT NULL,
	"product_sku" VARCHAR(20) NOT NULL,
	"supplier_id" INTEGER NOT NULL,
	PRIMARY KEY("product_sku", "supplier_id")
);




CREATE TABLE IF NOT EXISTS "sale" (
    "id" VARCHAR(20),
    "customer_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "total_price" NUMERIC(12,2) NOT NULL CHECK(total_price >= 0), 
    "product_sku" VARCHAR(20) NOT NULL,
    "quantity" INTEGER NOT NULL CHECK(quantity >= 0),            
    PRIMARY KEY("id")
);

  `;

  try {
    await pool.query(queryText);
    console.log('✅ PostgreSQL: Esquema creado exitosamente');
  } catch (err) {
    console.error('❌ PostgreSQL Error al crear esquema:', err);
    throw err;
  }
};

module.exports = initDatabase;