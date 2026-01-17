#!/usr/bin/env node
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8787;

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === '/reverse') {
    const { lat, lon } = parsed.query;
    if (!lat || !lon) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'lat and lon required' }));
      return;
    }

    try {
      const target = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1&accept-language=en`;
      const r = await fetch(target, { headers: { 'User-Agent': 'CochinTradersApp/1.0' } });
      const body = await r.text();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(body);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: String(err) }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => console.log(`Nominatim proxy listening on http://localhost:${PORT}`));
