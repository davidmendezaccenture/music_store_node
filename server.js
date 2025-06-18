const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'src')));

// API para productos
app.get('/api/products', (req, res) => {
    const productsPath = path.join(__dirname, 'src/assets/data/products.json');
    fs.readFile(productsPath, 'utf-8', (err, data) => {
        if (err) return res.status(500)({ error: 'Error al obtener productos' })
        res.json(JSON.parse(data));
    })
});

// API para login y registro (usuarios en archivo JSON)

// Registrar usuario

// Login

// --- ENDPOINTS PARA EL CARRITO ---

// Obtener carrito del usuario

// Guardar carrito del usuario

// Redirigir la raíz al index.html de pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/pages/index.html'));
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});