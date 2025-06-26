const express = require("express");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

// Cargar variables de entorno
require("dotenv").config();

const app = express();
app.use(express.json());

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Desde variable de entorno
    pass: process.env.EMAIL_PASS, // Desde variable de entorno
  },
});

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

    // Crear resumen de productos para el chatbot
    productsInfo = "\n\nPRODUCTOS DISPONIBLES EN TIENDA:\n";
    products.forEach((product) => {
      productsInfo += `• ${product.name}: ${
        product.offerPrice || product.price
      }€ (Categoría: ${product.category})\n`;
    });
    // Logs para ver si carga productos correctamente
    console.log("Productos cargados:", products.length);
    console.log("Info de productos:", productsInfo.substring(0, 200) + "...");
  } catch (error) {
    console.log("No se pudieron cargar los productos:", error);
  }

  // Prompt engineering específico para Rat Pack Instruments
  const systemPrompt = `Eres Aria, el asistente virtual experto de "Rat Pack Instruments", una tienda online especializada en instrumentos musicales de alta calidad.

TU PERSONALIDAD:
- Eres amigable, entusiasta y muy conocedora de música
- Tienes pasión genuina por ayudar a músicos de todos los niveles
- Usas un lenguaje cercano pero profesional
- Ocasionalmente usas emojis musicales (🎸🎹🥁🎺🎷🎻)

INFORMACIÓN DE LA TIENDA:
- Horario: Lunes-Viernes 9:00-20:00, Sábados 10:00-14:00
- Teléfono soporte: +34 900 123 456
- Equipo: Aria (soporte técnico), Juan (atención cliente), Lucía (postventa)
- Envíos gratis a partir de 50€
- Garantía de 3 años en todos los productos
- Cambios y devoluciones hasta 30 días

TUS FUNCIONES:
1. Recomendar instrumentos según presupuesto, nivel y estilo musical
2. Comparar productos y explicar diferencias técnicas
3. Sugerir accesorios complementarios (cuerdas, fundas, púas, cables)
4. Informar sobre ofertas y promociones actuales
5. Ayudar con dudas técnicas básicas
6. Direccionar al formulario de contacto para consultas complejas
7. **USAR LA LISTA DE PRODUCTOS DISPONIBLES** para dar precios exactos y recomendaciones específicas

ESTILO DE RESPUESTA:
- Máximo 120 palabras por respuesta
- **SIEMPRE menciona productos específicos de la lista de PRODUCTOS DISPONIBLES**
- **USA PRECIOS EXACTOS de los productos listados al final**
- **Fijate en descuentos y ofertas actuales**
- Pregunta detalles si necesitas más información
- Si no sabes algo exacto, deriva al contacto
- Siempre termina ofreciendo más ayuda

IMPORTANTE: Al final de este prompt tienes una lista completa de PRODUCTOS DISPONIBLES EN TIENDA con precios exactos. Úsala SIEMPRE para dar recomendaciones específicas.

EJEMPLOS DE RESPUESTAS CORRECTAS:
- Usuario: "Quiero una guitarra para empezar, presupuesto 250€"
- Respuesta: "¡Perfecto! Con 250€ te recomiendo nuestra Guitarra Acústica a 150€ o la Guitarra Flamenca a 180€. Ambas son ideales para principiantes..."
- Usuario: "Diferencia entre Stratocaster y Les Paul"
- Respuesta: "Tenemos la Guitarra Stratocaster a 550€ y la Guitarra Les Paul a 650€. La Strat tiene un sonido más versátil..."

Si te preguntan sobre productos muy específicos que no están en tu conocimiento base, deriva amablemente al formulario de contacto o al teléfono de soporte.${productsInfo}`;

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
          max_tokens: 150,
          temperature: 0.7,
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
