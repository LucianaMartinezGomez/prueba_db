Project: TEST - Migration and Query API

Purpose: This Express API migrates data from a CSV file to PostgreSQL (relational schema) and MongoDB (patient history), and also exposes queries/reports.

Key Files

src/server.js: startup, variable loading, connections, and routes.

src/config/*.js: helpers for PostgreSQL and MongoDB; init_db.js creates tables if they don't exist.

src/routes/simulacro.js: endpoints for migration and queries.

src/services/migrationService.js: CSV to PostgreSQL + MongoDB migration logic.

src/models/history.js: MongoDB schema for history.

Requirements

Docker and Docker Compose (recommended)
Node.js (v18+ recommended) and npm


sudo docker compose -f docker-compose.yml up -d --build


Environment variables (.env)

PORT — API port (default 3000 if not defined)
DATABASE_URL — PostgreSQL connection, e.g., postgresql://user:pass@localhost:5432/db
MONGODB_URI — MongoDB URI, e.g., mongodb://localhost:27018
MONGODB_DB — MongoDB database name
SIMULACRO_CSV_PATH — path to the CSV file (default ./data/simulacro_saludplus_data.csv)

Installation and execution (recommended steps)

Install Docker and Docker Compose (Ubuntu/Debian — example)

# Install docker-compose if it's not already installed (alternative depending on the distribution):
sudo apt install -y docker-compose

Install project dependencies (in the repository root)

npm install

Check for local services that might be using the same ports (optional)

sudo systemctl status postgresql
sudo systemctl status mongod

If these services are running and will conflict with the Docker containers (using the same ports), you can temporarily stop them:

sudo systemctl stop postgresql
sudo systemctl stop mongod

Get the Docker Compose up and running

First, make sure you are in the directory containing docker-compose.yml (the project root). Then:

docker-compose up -d
# or, if your system requires sudo:
sudo docker-compose up -d

Check that the containers are running:

docker ps

Start the Node API (in the project root)

npm run dev

Endpoints and commands for testing (URLs)

Base URL (default): http://localhost:3000

Run CSV to DB migration (POST):

curl -X POST http://localhost:3000/api/prueba_migrate

Quick database checks (from the host):

# PostgreSQL (adjust port/user according to your .env or docker-compose)
psql postgresql://user_salud:password_salud@localhost:5433/pruebariwi_db -c "SELECT COUNT(*) FROM patient;"

# MongoDB (using mongosh)
mongosh --eval "db.patienthistories.find().limit(5).pretty()" mongodb://localhost:27018/mongodb

Notes and recommendations

If you already have PostgreSQL/Mongo services installed on the machine and prefer to use containers, stop the local services or reconfigure ports to avoid conflicts.

For large volumes of data, use COPY/bulk inserts in PostgreSQL and bulkWrite in MongoDB.

Before running a migration on live data, test in a staging/copy environment and perform backups.

Service, Host, Port, User / DB, Password PostgreSQL, localhost, 5432, user_pruebariwi / pruebariwi_db, password_pruebariwi MongoDB, localhost, 27018, mongodb, (No password)
