const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let players = {};
let idCounter = 1;

function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (ws) => {
  const id = idCounter++;
  players[id] = { x: 50, y: 50 };

  ws.send(JSON.stringify({ type: 'init', id, players }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'move') {
      players[id] = { x: data.x, y: data.y };
      broadcast({ type: 'update', id, x: data.x, y: data.y });
    }
    if (data.type === 'chat') {
      broadcast({ type: 'chat', id, message: data.message });
    }
  });

  ws.on('close', () => {
    delete players[id];
    broadcast({ type: 'remove', id });
  });
});

console.log('Servidor WebSocket en ws://localhost:3000');

