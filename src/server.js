const express = require('express');
const fs = require('fs');
const path = require('path');

// 1. CARGA MANUAL DEL .ENV (DEBE SER LO PRIMERO)
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
}

// 2. AHORA SÍ IMPORTAMOS LOS MÓDULOS (Ya pueden leer process.env)
const { connectMongoDB } = require('./config/mongodb.js'); 
const { pool } = require('./config/postgres');
const initDatabase = require('./config/init_db');
const simulacroRoutes = require('./routes/simulacro');

console.log('--- DIAGNÓSTICO DE VARIABLES ---');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ CARGADA' : '❌ NO ENCONTRADA');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ CARGADA' : '❌ NO ENCONTRADA');
console.log('--------------------------------');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/simulacro', simulacroRoutes);

const startServer = async () => {
    try {
        // 1) Conexión a MongoDB
        await connectMongoDB();

        // 2) Comprobación de PostgreSQL
        if (!pool) throw new Error("El pool de PostgreSQL no está definido");
        await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL: Connected successfully');
        
        // 3) Inicializar tablas
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error.message);
        process.exit(1);
    }
};

startServer();
