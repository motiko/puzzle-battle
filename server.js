const { Server } = require('ws');

const wss = new Server({ server });


wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});
