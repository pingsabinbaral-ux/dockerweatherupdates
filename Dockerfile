FROM node:lts-alpine
WORKDIR /app
COPY server.js index.html style.css ./
ENV DATA_DIR=/data
EXPOSE 3000
CMD ["node", "server.js"]