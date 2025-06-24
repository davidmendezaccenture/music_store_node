# Guía rápida para Frontend – API del Servidor Music Store Node

Esta guía te ayudará a consumir la API del servidor del proyecto.
Encontrarás los endpoints disponibles y recomendaciones para interactuar correctamente con el backend y gestionar los datos necesarios desde el frontend.

## Endpoints principales

### Productos

- **GET** `/api/products`
  - Devuelve el listado de productos.
  - Respuesta: array de productos en JSON.

### Usuarios

- **POST** `/api/register`
  - Registra un usuario nuevo.
  - Body (JSON): `{ "username": "nombre", "email": "correo", "password": "contraseña" }`
  - Respuesta: mensaje de éxito o error.

- **POST** `/api/login`
  - Login de usuario.
  - Body (JSON): `{ "username": "nombre", "password": "contraseña" }`
  - Respuesta: mensaje de éxito o error, y datos del usuario.

### Carrito

- **GET** `/api/cart?user=nombre`
  - Obtiene el carrito del usuario.
  - Respuesta: `{ user, items: [...] }`

- **POST** `/api/cart`
  - Guarda el carrito del usuario.
  - Body (JSON): `{ "user": "nombre", "items": [...] }`
  - Respuesta: mensaje de éxito o error.

## Archivos de datos

- Usuarios: `backend/data/users.json`
- Carritos: `backend/data/carts.json`
- Productos: `src/assets/data/products.json`

## Notas

- El servidor sirve los archivos estáticos desde la carpeta `src`.
- La página principal está en `/src/pages/index.html`.
- El puerto por defecto es `3000`.

## Carritos de usuarios no logueados

⚠️ **Importante:** El servidor no almacena de forma persistente los carritos de usuarios que no están logueados. Si el usuario no ha iniciado sesión, el carrito no se guarda en el backend y se perderá al recargar la página o navegar a otra página de la web, como la de registro (si no es modal)... etc.

**Recomendación:**
Para dar persistencia al carrito de usuarios no logueados, se recomienda que el frontend utilice `localStorage` o `sessionStorage` del navegador. Así, el usuario podrá mantener su carrito aunque recargue la página o cierre el navegador (mientras no borre los datos locales).

**Ejemplo básico:**

```js
// Guardar carrito en localStorage
localStorage.setItem('cart', JSON.stringify(items));

// Recuperar carrito
const items = JSON.parse(localStorage.getItem('cart')) || [];
```

Cuando el usuario se registre o inicie sesión, el frontend puede enviar el carrito almacenado localmente al backend para asociarlo a su cuenta.
