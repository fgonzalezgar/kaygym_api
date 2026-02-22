const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const gymRoutes = require('./src/routes/gymRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (como la página principal y las imágenes)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de health check para comprobar el estado de la API
app.get('/api/health', (req, res) => {
    res.json({
        api: 'KAYGYM API',
        status: 'online',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api', authRoutes);
app.use('/api/gyms', gymRoutes);

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor de prueba corriendo en el puerto ${PORT}`);
    });
}

module.exports = app;
