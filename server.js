const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let players = {};

wss.on('connection', function connection(ws) {
  const id = Date.now();
  players[id] = { x: 100, y: 100, color: getRandomColor() };

  ws.send(JSON.stringify({ type: 'init', id, players }));

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);
    if (data.type === 'move') {
      players[id].x = data.x;
      players[id].y = data.y;
      broadcast({ type: 'update', id, x: data.x, y: data.y });
    }
  });

  ws.on('close', () => {
    delete players[id];
    broadcast({ type: 'remove', id });
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

function getRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

console.log('Servidor WebSocket en ws://localhost:3000');
