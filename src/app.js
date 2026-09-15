const express = require('express');
const app = express();

app.use(express.json());

const authRouter = require('./routers/auth.routers');
app.use('/api/auth', authRouter);

const tecnicoRouter = require('./routers/tecnico.routers');
app.use('/api/tecnicos', tecnicoRouter);

module.exports = app;