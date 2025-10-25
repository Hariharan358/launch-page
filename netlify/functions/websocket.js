const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running 🚀');
});

const wss = new WebSocket.Server({ server, perMessageDeflate: false });

let launchState = {
  clickCount: 0,
  isLaunched: false,
  participants: [],
  launchTime: null
};

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  });
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(launchState));
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'launch_click' && !launchState.participants.includes(data.userId)) {
      launchState.participants.push(data.userId);
      launchState.clickCount++;
      if (launchState.clickCount >= 10) launchState.isLaunched = true;
      broadcast(launchState);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WebSocket server running on ${PORT}`);
});
