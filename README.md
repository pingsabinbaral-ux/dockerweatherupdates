# Toronto Weather

Small Node.js app that records Toronto weather every 5 minutes (via Open-Meteo, no API key needed) and shows it in a table. No npm dependencies.

## Run

```sh
docker compose up -d --build
```

Open http://localhost:3000. History is stored in the `weather-data` Docker volume.

## Develop without rebuilding

```sh
docker run -d --name weather -p 3000:3000 \
  -v "$PWD":/app -v weather-data:/data -w /app \
  node:lts-alpine node --watch server.js
```