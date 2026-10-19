require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = Number(process.env.PORT || 3000);

async function iniciarServidor() {
  try {
    await pool.query('SELECT 1');
    console.log('Conexión con MySQL/MariaDB exitosa.');
    app.listen(PORT, () => console.log(`Tecni-Click API escuchando en http://localhost:${PORT}`));
  } catch (error) {
    console.error('No fue posible conectar con la base de datos. Revisa el archivo .env y ejecuta database/tecniclick.sql.');
    console.error(error.message);
    process.exit(1);
  }
}
iniciarServidor();
