Proyecto: PRUEBA - API de migración y consulta

    Propósito: Esta API Express migra datos desde un CSV hacia PostgreSQL (esquema relacional) y MongoDB (historial por paciente), además de exponer consultas/reportes.

Archivos clave

    src/server.js: arranque, carga de variables, conexiones y rutas.
    src/config/*.js: helpers para PostgreSQL y MongoDB; init_db.js crea tablas si no existen.
    src/routes/simulacro.js: endpoints para migración y consultas.
    src/services/migrationService.js: lógica de migración CSV -> PostgreSQL + MongoDB.
    src/models/history.js: esquema MongoDB para historial.

Requisitos

    Docker y Docker Compose (recomendado)
    Node.js (v18+ recomendado) y npm

Variables de entorno (.env)

    PORT — puerto de la API (por defecto 3000 si no se define)
    DATABASE_URL — conexión PostgreSQL, ej.: postgresql://user:pass@localhost:5432/db
    MONGODB_URI — URI MongoDB, ej.: mongodb://localhost:27018
    MONGODB_DB — nombre de la base de datos Mongo
    SIMULACRO_CSV_PATH — ruta al CSV (por defecto ./data/simulacro_saludplus_data.csv)

Instalación y ejecución (pasos recomendados)

    Instalar Docker y Docker Compose (Ubuntu/Debian — ejemplo)

# Instalar docker-compose si no está (alternativa según distro):
sudo apt install -y docker-compose

    Instalar dependencias del proyecto (en la raíz del repositorio)

npm install

    Comprobar servicios locales que puedan usar los mismos puertos (opcional)

sudo systemctl status postgresql
sudo systemctl status mongod

Si estos servicios están corriendo y van a entrar en conflicto con los contenedores Docker (mismos puertos), puede pararlos temporalmente:

sudo systemctl stop postgresql
sudo systemctl stop mongod

    Levantar las bases con Docker Compose

Primero asegúrate de estar en el directorio que contiene docker-compose.yml (la raíz del proyecto). Luego:

docker-compose up -d
# o, si tu sistema requiere sudo:
sudo docker-compose up -d

Comprueba que los contenedores están en marcha:

docker ps

    Iniciar la API Node (en la raíz del proyecto)

npm run dev

Endpoints y comandos para probar (URLs)

    Base URL (por defecto): http://localhost:3000

    Ejecutar migración CSV -> DBs (POST):

curl -X POST http://localhost:3000/api/prueba_migrate

    Comprobaciones rápidas en BD (desde host):

# PostgreSQL (ajusta puerto/usuario según tu .env o docker-compose)
psql postgresql://user_salud:password_salud@localhost:5433/pruebariwi_db -c "SELECT COUNT(*) FROM patient;"

# MongoDB (usando mongosh)
mongosh --eval "db.patienthistories.find().limit(5).pretty()" mongodb://localhost:27018/mongodb

Notas y recomendaciones

    Si tienes servicios PostgreSQL/Mongo ya instalados en la máquina y prefieres usar los contenedores, detén los servicios locales o reconfigura puertos para evitar conflictos.
    Para grandes volúmenes de datos usa COPY/bulk inserts en PostgreSQL y bulkWrite en Mongo.
    Antes de correr una migración sobre datos reales, haz pruebas en un entorno de staging/copia y realiza backups.

Servicio,Host,Puerto,Usuario / DB,Contraseña PostgreSQL,localhost,5432,user_pruebariwi / pruebariwi_db,password_pruebariwi MongoDB,localhost,27018,mongodb,(Sin contraseña)