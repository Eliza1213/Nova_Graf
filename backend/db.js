import 'dotenv/config';
import sql from 'mssql';

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT), // 1433
    options: {
        encrypt: false,               // Local, no requiere SSL
        enableArithAbort: true,
        trustServerCertificate: true
    }
};

const poolPromise = sql.connect(config)
    .then(pool => {
        console.log('✅ Conectado a SQL Server con usuario y contraseña');
        return pool;
    })
    .catch(err => {
        console.error('❌ Error de conexión a la base de datos:', err.message);
    });

export default poolPromise;
