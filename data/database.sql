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
	"total_price" NUMERIC(12,2) NOT NULL CHECK("[object Object]" >= 0),
	"product_sku" VARCHAR(20) NOT NULL,
	"quantity" INTEGER NOT NULL CHECK("[object Object]" >= 0),
	PRIMARY KEY("id")
);



ALTER TABLE "product"
ADD FOREIGN KEY("category_id") REFERENCES "category"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "product_supplier"
ADD FOREIGN KEY("product_sku") REFERENCES "product"("product_sku")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "product_supplier"
ADD FOREIGN KEY("supplier_id") REFERENCES "supplier"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "sale"
ADD FOREIGN KEY("product_sku") REFERENCES "product_supplier"("product_sku")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "sale"
ADD FOREIGN KEY("customer_id") REFERENCES "customer"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;