const express = require("express");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt"); // Encriptar y verificar contraseñas

// Cargar variables de entorno
require("dotenv").config();

const app = express();
app.use(express.json());

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "instrumentsratpatck@gmail.com", // Desde variable de entorno
    pass: "fcss drxu zmse nzqf", // Desde variable de entorno
  },
});

// Servir estáticos
app.use(express.static(path.join(__dirname, "src")));

// Ejecutar logout al iniciar el servidor
logoutAllUsers();

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

//---------------------------------------------------------------------------------------------------------------///
//-----------------------------------------------------LOGIN-----------------------------------------------------///
//---------------------------------------------------------------------------------------------------------------///

// Middleware para leer datos de formularios
app.use(express.urlencoded({ extended: true }));

// RUTA POST /register
app.post("/api/register", async (req, res) => {
  const usersPath = path.join(__dirname, "backend/data/users.json");
  const {
    nombre,
    apellidos,
    fechaNacimiento,
    telefono,
    pais,
    region,
    codigoPostal,
    direccion,
    email,
    emailConfirm,
    password,
    passwordConfirm,
  } = req.body;

  // Validación de campos vacíos
  if (
    !nombre ||
    !apellidos ||
    !fechaNacimiento ||
    !telefono ||
    !pais ||
    !region ||
    !codigoPostal ||
    !direccion ||
    !email ||
    !emailConfirm ||
    !password ||
    !passwordConfirm
  ) {
    return res.status(400).send("Faltan campos por completar.");
  }

  // Validar coincidencia de email y contraseña
  if (email !== emailConfirm || password !== passwordConfirm) {
    return res.status(400).send("El email o la contraseña no coinciden.");
  }

  // Validación de seguridad de contraseña (mínimo 10 caracteres, mayúscula, minúscula, número y símbolo)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .send(
        "La contraseña debe tener al menos 10 caracteres, incluir mayúsculas, minúsculas, números y símbolos."
      );
  }

  fs.readFile(usersPath, "utf-8", async (err, data) => {
    if (err) {
      console.error("Error leyendo users.json:", err);
      return res.status(500).send("Error al leer los usuarios");
    }

    const usuarios = data ? JSON.parse(data) : [];

    if (usuarios.some((u) => u.email === email)) {
      return res.status(409).send("El email ya está registrado.");
    }

    // Encriptar la contraseña antes de guardar
    try {
      const saltRounds = 10; // Nivel de seguridad del hash
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      usuarios.push({
        nombre,
        apellidos,
        fechaNacimiento,
        telefono,
        pais,
        region,
        codigoPostal,
        direccion,
        email,
        password: hashedPassword, // Guardar el hash, no la contraseña en texto plano
        isLoggedIn: 0,
      });

      fs.writeFile(usersPath, JSON.stringify(usuarios, null, 2), (err) => {
        if (err) return res.status(500).send("Error al guardar el usuario");
        res.status(200).json({ mensaje: "Usuario registrado correctamente" });
      });
    } catch (hashErr) {
      console.error("Error al encriptar la contraseña:", hashErr);
      return res.status(500).send("Error al procesar la contraseña");
    }
  });
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "src/pages/index.html"));
});

// RUTA POST /login
app.post("/login", (req, res) => {
  const usersPath = path.join(__dirname, "backend/data/users.json");
  const { email, password } = req.body;

  fs.readFile(usersPath, "utf-8", async (err, data) => {
    if (err)
      return res.status(500).json({ error: "Error al leer los usuarios" });

    let usuarios = JSON.parse(data);
    const userIndex = usuarios.findIndex((u) => u.email === email);

    if (userIndex === -1)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    // Verificar la contraseña usando bcrypt
    const user = usuarios[userIndex];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    // Actualizar estado de login a 1 (true)
    usuarios[userIndex].isLoggedIn = 1;

    // Guardar cambios en el archivo
    fs.writeFile(usersPath, JSON.stringify(usuarios, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error al actualizar estado de login:", writeErr);
        return res.status(500).json({ error: "Error al actualizar sesión" });
      }

      // Devolver datos del usuario (sin password)
      const { password: _, ...userWithoutPassword } = usuarios[userIndex];
      res.json({
        mensaje: "Login exitoso",
        usuario: userWithoutPassword,
      });
    });
  });
});

// RUTA POST /logout
app.post("/logout", (req, res) => {
  const usersPath = path.join(__dirname, "backend/data/users.json");
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email requerido para logout" });
  }

  fs.readFile(usersPath, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Error al leer los usuarios" });

    let usuarios = JSON.parse(data);
    const userIndex = usuarios.findIndex((u) => u.email === email);

    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualizar estado de login a 0 (false)
    usuarios[userIndex].isLoggedIn = 0;

    // Guardar cambios en el archivo
    fs.writeFile(usersPath, JSON.stringify(usuarios, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error al actualizar estado de logout:", writeErr);
        return res.status(500).json({ error: "Error al cerrar sesión" });
      }

      res.json({ mensaje: "Logout exitoso" });
    });
  });
});

// RUTA GET /api/user-status/:email - Verificar estado de login
app.get("/api/user-status/:email", (req, res) => {
  const usersPath = path.join(__dirname, "backend/data/users.json");
  const { email } = req.params;

  fs.readFile(usersPath, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Error al leer los usuarios" });

    const usuarios = JSON.parse(data);
    const usuario = usuarios.find((u) => u.email === email);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Devolver datos del usuario (sin password) solo si está logueado
    if (usuario.isLoggedIn === 1) {
      const { password: _, ...userWithoutPassword } = usuario;
      res.json({
        isLoggedIn: true,
        usuario: userWithoutPassword,
      });
    } else {
      res.json({
        isLoggedIn: false,
      });
    }
  });
});

// RUTA GET /api/current-user - Obtener usuario actualmente logueado
app.get("/api/current-user", (req, res) => {
  const usersPath = path.join(__dirname, "backend/data/users.json");

  fs.readFile(usersPath, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Error al leer los usuarios" });

    const usuarios = JSON.parse(data);
    const usuarioLogueado = usuarios.find((u) => u.isLoggedIn === 1);

    if (!usuarioLogueado) {
      return res.json({ isLoggedIn: false });
    }

    // Devolver datos del usuario (sin password)
    const { password: _, ...userWithoutPassword } = usuarioLogueado;
    res.json({
      isLoggedIn: true,
      usuario: userWithoutPassword,
    });
  });
});

//---------------------------------------------------------------------------------------------------------------///
//-----------------------------------------------------CARRITO---------------------------------------------------///
//---------------------------------------------------------------------------------------------------------------///

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
    return res.status(400).json({ error: "Datos inválidos" });

  // Leer carritos
  fs.readFile(cartsPath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error al leer carritos" });

    const carts = data ? JSON.parse(data) : [];
    const index = carts.findIndex((cart) => cart.user === user);

    if (index !== -1) {
      carts[index].items = items;
    } else {
      carts.push({ user, items });
    }

    fs.writeFile(cartsPath, JSON.stringify(carts, null, 2), (err) => {
      if (err)
        return res.status(500).json({ error: "Error al guardar carrito" });
      res.json({ message: "Carrito guardado" });
    });
  });
});

// Vaciar carrito si realiza compra
app.delete("/api/cart", (req, res) => {
  const cartsPath = path.join(__dirname, "backend/data/carts.json");
  const { user } = req.body;

  // Validar campos
  if (!user) {
    return res.status(400).json({ error: "Usuario requerido" });
  }

  // Leer cart
  fs.readFile(cartsPath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error al leer carritos" });
    }

    const carts = data ? JSON.parse(data) : [];
    const index = carts.findIndex((cart) => cart.user === user);

    if (index !== -1) {
      // Limpiar los items del carrito del usuario
      carts[index].items = [];

      fs.writeFile(cartsPath, JSON.stringify(carts, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: "Error al eliminar carrito" });
        }
        res.json({ message: "Carrito eliminado correctamente" });
      });
    } else {
      // if user no esta en json, creamos uno vacio
      carts.push({ user, items: [] });

      fs.writeFile(cartsPath, JSON.stringify(carts, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: "Error al crear cart vacío" });
        }
        res.json({ message: "Cart de usuario eliminado" });
      });
    }
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

//---------------------------------------------------------------------------------------------------------------///
//------------------------------------------------Contacto-ChatBot-----------------------------------------------///
//---------------------------------------------------------------------------------------------------------------///

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
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Error al guardar mensaje" });
        }

        // Enviar mensaje si se guarda al cliente
        const mailOptions = {
          from: process.env.EMAIL_USER, // Desde variable de entorno
          to: email, // Email del cliente (destinatario)
          subject: `Confirmación: Hemos recibido tu mensaje - ${asunto}`,
          text: `Hola ${nombre},\n\nGracias por contactarnos. Hemos recibido tu mensaje:\n\n"${mensaje}"\n\nNos pondremos en contacto contigo pronto.\n\nSaludos,\nEquipo Rat Pack Instruments`,
        };

        // Email para administracion o persona de soporte
        /* const adminMailOptions = {
          from: email,
          to: "admin@ratpackinstruments.com",
          subject: `Nuevo mensaje de contacto: ${asunto}`,
          text: `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${
            telefono || "No proporcionado"
          }\nMensaje: ${mensaje}`,
        }; */

        // Enviar email (no bloquea la respuesta si falla)
        transporter.sendMail(mailOptions, (emailError, info) => {
          if (emailError) {
            console.log("Error al enviar email:", emailError);
            // No fallar la petición, solo loguear el error
          } else {
            console.log("Email enviado:", info.response);
          }
        });

        // Responder al cliente inmediatamente
        res.json({ mensaje: "Mensaje recibido correctamente" });
      }
    );
  });
});

// Endpoint chatbot con productos reales
app.post("/api/chatbot", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Mensaje requerido" });
  }

  // Cargar productos reales de la tienda
  const productsPath = path.join(__dirname, "src/assets/data/products.json");
  let productsInfo = "";

  try {
    const productsData = fs.readFileSync(productsPath, "utf-8");
    const products = JSON.parse(productsData);

    // Crear resumen más inteligente con ofertas destacadas
    productsInfo = "\n=== PRODUCTOS DISPONIBLES EN TIENDA ===\n";

    // Separar productos por categoría y destacar ofertas
    const categories = {};
    products.forEach((product) => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push(product);
    });

    Object.keys(categories).forEach((category) => {
      productsInfo += `\n${category.toUpperCase()}:\n`;
      categories[category].forEach((product) => {
        const isOnOffer =
          product.offerPrice && product.offerPrice < product.price;
        const price = isOnOffer ? product.offerPrice : product.price;
        const offerText = isOnOffer ? ` (OFERTA! antes ${product.price}€)` : "";

        productsInfo += `• ${product.name}: ${price}€${offerText}\n`;
        if (product.description) {
          productsInfo += `  - ${product.description.substring(0, 80)}...\n`;
        }
      });
    });

    console.log("Productos procesados por categoría:", Object.keys(categories));
  } catch (error) {
    console.log("Error cargando productos:", error);
  }

  // Prompt engineering específico para Rat Pack Instruments
  const systemPrompt = `Eres Aria, el asistente virtual experto de "Rat Pack Instruments".

REGLAS IMPORTANTES:
- SIEMPRE consulta la lista de PRODUCTOS DISPONIBLES al final de este prompt
- Menciona productos específicos con precios exactos
- Si un producto tiene offerPrice, usa ese precio (está en oferta)
- Máximo 100 palabras por respuesta
- Siempre termina preguntando si necesita más ayuda

INFORMACIÓN ACTUALIZADA:
- Envíos GRATIS a partir de 50€
- Garantía extendida de 3 años
- Devoluciones hasta 30 días
- Pago en 3 cuotas sin intereses

EJEMPLOS DE RESPUESTAS IDEALES:
Usuario: "Guitarra para rock, 400€"
Aria: "Para rock te recomiendo la Guitarra Les Paul a 350€ (¡en oferta desde 650€!) 🎸 Perfecta para rock con pastillas humbucker potentes. También incluye funda y envío gratis. ¿Te interesa algún amplificador también?"

PRODUCTOS CON OFERTAS DESTACADAS:
${productsInfo}

IMPORTANTE: Al recomendar productos, siempre menciona:
1. Precio exacto (usa offerPrice si existe)
2. Por qué es bueno para su necesidad específica
3. Qué incluye o accesorios recomendados
4. Pregunta de seguimiento relevante`;

  console.log(
    "Prompt completo (últimos 500 chars):",
    systemPrompt.substring(systemPrompt.length - 500)
  );

  try {
    // Groq
    console.log("Enviando request a Groq...");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // Desde variable de entorno
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 120,
          temperature: 0.4,
          top_p: 0.8,
          stream: false,
        }),
      }
    );

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({ reply: reply });
  } catch (error) {
    console.error("Error del chatbot Groq:", error);

    // Mensaje específico según el tipo de error
    let errorMessage =
      "Lo siento, no puedo responder ahora. Prueba nuestro formulario de contacto o llama al +34 900 123 456";

    if (error.message.includes("402")) {
      errorMessage =
        "Servicio temporalmente no disponible (límite alcanzado). Prueba nuestro formulario de contacto o llama al +34 900 123 456";
    } else if (error.message.includes("401")) {
      errorMessage =
        "Error de autenticación. Prueba nuestro formulario de contacto o llama al +34 900 123 456";
    }

    res.status(500).json({ error: errorMessage });
  }
});

//---------------------------------------------------------------------------------------------------------------///
//---------------------------------------------------Log Out-----------------------------------------------------///
//---------------------------------------------------------------------------------------------------------------///

// Función para desloguear todos los usuarios al iniciar el servidor
function logoutAllUsers() {
  const usersPath = path.join(__dirname, "backend/data/users.json");

  fs.readFile(usersPath, "utf-8", (err, data) => {
    if (err) {
      console.log("Error al leer usuarios para logout inicial:", err);
      return;
    }

    try {
      let usuarios = JSON.parse(data);
      let usuariosModificados = 0;

      // Poner todos los usuarios como deslogueados
      usuarios.forEach((usuario) => {
        if (usuario.isLoggedIn === 1) {
          usuario.isLoggedIn = 0;
          usuariosModificados++;
        }
      });

      // Solo escribir si hay cambios
      if (usuariosModificados > 0) {
        fs.writeFile(
          usersPath,
          JSON.stringify(usuarios, null, 2),
          (writeErr) => {
            if (writeErr) {
              console.log("Error al desloguear usuarios:", writeErr);
            } else {
              console.log(
                `${usuariosModificados} usuarios deslogueados al iniciar el servidor`
              );
            }
          }
        );
      } else {
        console.log("Todos los usuarios ya estaban deslogueados");
      }
    } catch (parseErr) {
      console.log("Error al parsear usuarios.json:", parseErr);
    }
  });
}

//---------------------------------------------------------------------------------------------------------------///
//-------------------------------------Recuperacion_password-----------------------------------------------------///
//---------------------------------------------------------------------------------------------------------------///

// RUTA POST /api/recover-password
app.post("/api/recover-password", async (req, res) => {
  const usersPath = path.join(__dirname, "backend/data/users.json");
  const { email, newPassword, confirmNewPassword } = req.body;

  // Validar que los campos estén completos
  if (!email || !newPassword || !confirmNewPassword) {
    return res
      .status(400)
      .json({ error: "Todos los campos son obligatorios." });
  }

  // Validar que las contraseñas coincidan
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: "Las contraseñas no coinciden." });
  }

  // Validar seguridad de la nueva contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error:
        "La contraseña debe tener al menos 10 caracteres, incluir mayúsculas, minúsculas, números y símbolos.",
    });
  }

  // Leer usuarios y buscar el email
  fs.readFile(usersPath, "utf-8", async (err, data) => {
    if (err) {
      console.error("Error leyendo users.json:", err);
      return res.status(500).json({ error: "Error al leer los usuarios." });
    }

    let usuarios = data ? JSON.parse(data) : [];
    // Normaliza el email para evitar problemas de mayúsculas/espacios
    const userIndex = usuarios.findIndex(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    try {
      // Encriptar la nueva contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar la contraseña encriptada
      usuarios[userIndex].password = hashedPassword;

      // Guardar el archivo actualizado
      fs.writeFile(usersPath, JSON.stringify(usuarios, null, 2), (err) => {
        if (err) {
          console.error("Error al guardar la nueva contraseña:", err);
          return res
            .status(500)
            .json({ error: "Error al guardar la contraseña." });
        }
        res.json({ mensaje: "Contraseña actualizada correctamente." });
      });
    } catch (hashErr) {
      console.error("Error al encriptar la contraseña:", hashErr);
      return res
        .status(500)
        .json({ error: "Error al procesar la contraseña." });
    }
  });
});
