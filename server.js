const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/data';
const DATA_FILE = path.join(DATA_DIR, 'history.json');
const MAX_ROWS = 288; // 24 hours at 5-minute intervals

const API = 'https://api.open-meteo.com/v1/forecast'
  + '?latitude=43.6532&longitude=-79.3832'
  + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code'
  + '&timezone=America%2FToronto';

const CODES = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Violent showers',
  85: 'Snow showers', 86: 'Snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
};

fs.mkdirSync(DATA_DIR, { recursive: true });
let history = [];
try { history = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch {}

async function update() {
  try {
    const res = await fetch(API);
    const { current } = await res.json();
    history.push({
      time: new Date().toISOString(),
      temp: current.temperature_2m,
      feels: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      precip: current.precipitation,
      sky: CODES[current.weather_code] || `Code ${current.weather_code}`
    });
    history = history.slice(-MAX_ROWS);
    fs.writeFileSync(DATA_FILE, JSON.stringify(history));
    console.log('Updated', new Date().toISOString());
  } catch (err) {
    console.error('Update failed:', err.message);
  }
}

update();
setInterval(update, 5 * 60 * 1000);

const FILES = {
  '/': ['index.html', 'text/html'],
  '/style.css': ['style.css', 'text/css']
};

http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/api/history') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(history));
  }
  const file = FILES[url];
  if (!file) {
    res.writeHead(404);
    return res.end('Not found');
  }
  fs.readFile(path.join(__dirname, file[0]), (err, data) => {
    if (err) { res.writeHead(500); return res.end('Error'); }
    res.writeHead(200, { 'Content-Type': file[1] });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Listening on port ${PORT}`));