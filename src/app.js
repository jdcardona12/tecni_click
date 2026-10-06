const express = require('express');
const app = express();

app.use(express.json());

const authRouter = require('./routers/auth.routers');
app.use('/api/auth', authRouter);

const tecnicoRouter = require('./routers/tecnico.routers');
app.use('/api/tecnicos', tecnicoRouter);

const solicitudRouter = require('./routers/solicitud.routers');
app.use('/api/solicitudes', solicitudRouter);

const calificacionRouter = require('./routers/calificacion.routers');
app.use('/api/calificaciones', calificacionRouter);

const pagorouter = require('./routers/pago.routers');
app.use('/api/pagos', pagorouter);
module.exports = app;