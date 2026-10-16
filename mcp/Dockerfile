# Se construye desde la raíz del repositorio:  docker build -f mcp/Dockerfile -t mantenimiento-mcp .
FROM node:22-slim
WORKDIR /app
COPY mcp/package.json mcp/package-lock.json ./mcp/
RUN cd mcp && npm ci --omit=dev
COPY mcp ./mcp
COPY scripts/lib ./scripts/lib
# Copia de respaldo de los datos, por si el sitio publicado no responde
COPY assets/equipos.js ./assets/equipos.js
COPY assets/js ./assets/js
COPY assets/data ./assets/data
ENV NODE_ENV=production PORT=8080
USER node
EXPOSE 8080
CMD ["node", "mcp/server.mjs"]
