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
        if (err) {
            return res.status(500).json({ error: 'Error al obtener productos' })
        }
        res.json(JSON.parse(data));
    })
});

// API para login y registro (usuarios en archivo JSON)

// Registrar usuario
app.post('/api/register', (req, res) => {
    const usersPath = path.join(__dirname, 'backend/data/users.json');
    const { username, email, password } = req.body;

    // Validar que los campos existen y no están vacíos (ni undefined ni string vacío)
    if (
        !username || !email || !password ||
        typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string' ||
        !username.trim() || !email.trim() || !password.trim()
    ) {
        return res.status(400).json({ error: 'Faltan campos requeridos. Se espera: username, email, password' });
    }

    fs.readFile(usersPath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        let users = JSON.parse(data);

        const yaRegistrado = users.some(user => user.username === username || user.email === email);
        if (yaRegistrado) {
            return res.status(409).json({ error: 'El usuario o el email ya existen' });
        }

        users.push({ username, email, password });

        fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar usuario' });
            }
            res.json({ mensaje: 'Usuario registrado correctamente' });
        });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const usersPath = path.join(__dirname, 'backend/data/users.json');
    fs.readFile(usersPath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        let array = JSON.parse(data);
        const usuario = array.find(user =>
            user.username === req.body.username && user.password === req.body.password
        );
        if (usuario) {
            res.json({ mensaje: 'Login correcto', usuario });
        } else {
            res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
    });
});

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