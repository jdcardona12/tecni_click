const express = require('express');
const app = express();

app.use(express.json());

// Correcto, según tu carpeta real:
const authRouter = require('./routers/auth.routers');
app.use('/api/auth', authRouter);

module.exports = app;