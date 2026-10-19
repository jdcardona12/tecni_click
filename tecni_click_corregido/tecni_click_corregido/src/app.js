const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'API Tecni-Click funcionando' });
});

app.use('/api/auth', require('./routers/auth.routers'));
app.use('/api/usuarios', require('./routers/usuario.routers'));
app.use('/api/tecnicos', require('./routers/tecnico.routers'));
app.use('/api/solicitudes', require('./routers/solicitud.routers'));
app.use('/api/calificaciones', require('./routers/calificacion.routers'));
app.use('/api/pagos', require('./routers/pago.routers'));

app.use((req, res) => res.status(404).json({ ok: false, msg: 'Endpoint no encontrado.' }));

app.use((error, req, res, next) => {
  console.error(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, msg: 'El cuerpo JSON no es válido.' });
  }
  return res.status(500).json({ ok: false, msg: 'Error interno del servidor.' });
});

module.exports = app;
