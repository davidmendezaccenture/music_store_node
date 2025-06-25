const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// Servir estáticos
app.use(express.static(path.join(__dirname, "src")));

// Obtener productos
app.get("/api/products", (req, res) => {
  const productsPath = path.join(__dirname, "src/assets/data/products.json");

  // Leer productos
  fs.readFile(productsPath, "utf-8", (err, data) =>
    err
      ? res.status(500).json({ error: "Error al obtener productos" })
      : res.json(JSON.parse(data))
  );
});

// Registrar usuario
app.post("/api/register", (req, res) => {
  const usersPath = path.join(__dirname, "backend/data/users.json");
  const { username, email, password } = req.body;

  // Validar campos
  if (
    !username ||
    !email ||
    !password ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !email.trim() ||
    !password.trim()
  )
    return res.status(400).json({
      error: "Faltan campos requeridos. Se espera: username, email, password",
    });

  // Leer usuarios
  fs.readFile(usersPath, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener usuarios" });

    // Comprobar duplicados
    let users = JSON.parse(data);
    if (users.some((u) => u.username === username || u.email === email))
      return res
        .status(409)
        .json({ error: "El usuario o el email ya existen" });

    // Añadir usuario
    users.push({ username, email, password });

    // Guardar usuario
    fs.writeFile(usersPath, JSON.stringify(users, null, 2), "utf8", (err) =>
      err
        ? res.status(500).json({ error: "Error al guardar usuario" })
        : res.json({ mensaje: "Usuario registrado correctamente" })
    );
  });
});

// Login de usuario
app.post("/api/login", (req, res) => {
  const usersPath = path.join(__dirname, "backend/data/users.json");

  // Leer usuarios
  fs.readFile(usersPath, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener usuarios" });

    // Buscar usuario
    let arrayUsuarios = JSON.parse(data);
    const usuario = arrayUsuarios.find(
      (user) =>
        user.username === req.body.username &&
        user.password === req.body.password
    );

    // Devolver login
    usuario
      ? res.json({ mensaje: "Login correcto", usuario })
      : res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  });
});

// Obtener carrito
app.get("/api/cart", (req, res) => {
  const cartsPath = path.join(__dirname, "backend/data/carts.json");
  const user = req.query.user || "guest";

  // Leer carritos
  fs.readFile(cartsPath, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener carritos" });

    // Buscar carrito
    let carts = JSON.parse(data);
    const cart = carts.find((c) => c.user === user);

    // Devolver carrito
    res.json(cart || { user, items: [] });
  });
});

// Guardar carrito
app.post("/api/cart", (req, res) => {
  const cartsPath = path.join(__dirname, "backend/data/carts.json");
  const { user, items } = req.body;

  // Validar campos
  if (!user || !items || !Array.isArray(items))
    return res
      .status(400)
      .json({ error: "Faltan campos requeridos: user, items" });

  // Leer carritos
  fs.readFile(cartsPath, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener carritos" });

    // Actualizar o añadir carrito
    let carts = JSON.parse(data);
    const idx = carts.findIndex((c) => c.user === user);
    idx !== -1 ? (carts[idx].items = items) : carts.push({ user, items });

    // Guardar carrito
    fs.writeFile(cartsPath, JSON.stringify(carts, null, 2), "utf8", (err) =>
      err
        ? res.status(500).json({ error: "Error al guardar carrito" })
        : res.json({ mensaje: "Carrito guardado correctamente" })
    );
  });
});

// Redirigir raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/pages/index.html"));
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Guardado información de contacto

app.post("/api/contact", (req, res) => {
  const messagesPath = path.join(__dirname, "backend/data/messages.json");
  const { nombre, email, asunto, mensaje, telefono } = req.body;

  // Validacion basica
  if (!nombre || !email || !asunto || !mensaje)
    return res.status(400).json({ error: "Faltan campos por rellenar" });

  fs.readFile(messagesPath, "utf-8", (err, data) => {
    let messages = [];
    if (!err && data) messages = JSON.parse(data);

    messages.push({
      nombre,
      email,
      asunto,
      mensaje,
      telefono,
      fecha: new Date(),
    });

    fs.writeFile(
      messagesPath,
      JSON.stringify(messages, null, 2),
      "utf8",
      (err) =>
        err
          ? res.status(500).json({ error: "Error al guardar mensaje" })
          : res.json({ mensaje: "Mensaje recibido correctamente" })
    );
  });
});
