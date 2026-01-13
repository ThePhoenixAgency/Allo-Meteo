FROM node:20-slim
WORKDIR /app
COPY package.json .
COPY probe.js .
COPY server.js .

EXPOSE 8080
ENV PORT=8080
CMD ["node","server.js"]
