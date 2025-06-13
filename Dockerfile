# Usa Node.js como base para servir con http-server
FROM node:20-alpine

# Instala http-server globalmente
RUN npm install -g http-server

# Establece el directorio de trabajo
WORKDIR /app

# Copia todos los archivos de al contenedor
COPY src/pages .

# puerto 8080 para Cloud Run
EXPOSE 8080

# Comando para servir archivos estáticos en modo SPA
CMD ["sh", "-c", "http-server -p ${PORT:-8080} --spa"]