import Peer from "peerjs";
import { Chessground } from "chessground";
import { getCursor, boardSize } from "./dom";
import { Config } from "chessground/config";

export function processData(data: any) {
  const msg = data.message;
  const sender = data.sender;
  const command = data.command;
  switch (command) {
    case "mousepos":
      const cursor = getCursor(sender);
      const { x, y } = data;
      cursor.style.left = `${parseInt(boardSize().x) + parseInt(x)}px`;
      cursor.style.top = `${parseInt(boardSize().y) + parseInt(y)}px`;
      break;
    case "move":
      const { orig, dest } = data;
      window.ground.move(orig, dest);
  }
}

function afterMove(orig, dest, capturedPiece) {
  window.send({ command: "move", orig, dest, capturedPiece });
}

function initBoard() {
  const config: Config = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    movable: {
      free: false,
      color: "white",
      dests: new Map([["e2", ["e4"]]]),
      showDests: false,
    },
    events: {
      move: afterMove,
    },
  };
  const board = document.getElementById("board");
  const ground = Chessground(board, config);
  window.ground = ground;
}

function ready() {
  initBoard();
  let timerId;
  document.getElementById("board").addEventListener("mousemove", (e) => {
    if (timerId) return;
    timerId = setTimeout(() => {
      window.send({ command: "mousepos", x: e.offsetX, y: e.offsetY });
      timerId = undefined;
    }, 50);
  });
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function initConnections() {
  var clientConnections = [];

  var hostConnection;

  const peerId = `${Math.floor(Math.random() * 10 ** 6)}`;
  const peer = new Peer(peerId);

  peer.on("open", (id) => {
    console.log("Connection to signaller establised.");
    console.log(`Assigning id: ${id}`);
    console.log(`Your id is: ${id}`);

    let path = location.pathname.split("/").pop();
    console.log(path);
    if (isNumeric(path)) {
      join(path);
    } else {
      window.history.pushState(
        { path: `${location.pathname}/${peer.id}` },
        "",
        location + peer.id
      );
    }
    updatePeerList();
  });

  peer.on("connection", (connection) => {
    console.log(`${connection.peer} attempting to establish connection.`);

    connection.on("open", () => {
      console.log(`Connection to ${connection.peer} established.`);

      clientConnections = [...clientConnections, connection];

      const data = {
        sender: "SYSTEM",
        message: `${connection.peer} joined.`,
      };

      updatePeerList();

      broadcast({
        ...data,
        peers: generatePeerList(),
      });
      ready();
    });

    connection.on("data", (data) => {
      if (data.sender !== "SYSTEM" && data.sender !== peerId) {
        processData(data);
      }

      broadcast({
        ...data,
        peers: generatePeerList(),
      });
    });

    connection.on("close", () => {
      console.log(`Connection to ${connection.peer} is closed.`);
      clientConnections = clientConnections.filter(
        (c) => c.peer !== connection.peer
      );

      const data = {
        sender: "SYSTEM",
        message: `${connection.peer} left.`,
      };

      updatePeerList();

      broadcast({
        ...data,
        peers: generatePeerList(),
      });
    });
  });

  peer.on("disconnected", () => {
    console.log("Disconnected from signaller.");
  });

  peer.on("error", (error) => {
    console.log(error);
  });

  function reconnect() {
    console.log(`Reconnecting to signaller.`);
    peer.reconnect();
  }

  function join(hostId) {
    hostConnection = peer.connect(hostId);

    hostConnection.on("open", () => {
      console.log(`Connection to ${hostConnection.peer} established.`);
      ready();
    });

    hostConnection.on("data", (data) => {
      if (data.sender !== "SYSTEM" && data.sender !== peerId) {
        processData(data);
      }

      updatePeerList(data.peers);
    });

    hostConnection.on("close", () => {
      console.log(`Connection to ${hostConnection.peer} is closed.`);

      peer.destroy();

      location.reload();
    });
  }

  function updatePeerList(peerList?: string) {
    console.log("Peerlist:", peerList ? peerList : generatePeerList());
  }

  function generatePeerList() {
    return [
      ...clientConnections.map((connection) => connection.peer),
      `${peerId} (HOST)`,
    ].join(", ");
  }

  function broadcast(data) {
    clientConnections.forEach((connection) => connection.send(data));
  }

  function send(cmdData) {
    const data = {
      sender: peerId,
      ...cmdData,
    };

    if (hostConnection) {
      hostConnection.send(data);
    }

    if (clientConnections.length > 0) {
      broadcast({
        ...data,
        peers: generatePeerList(),
      });
    }
  }
  window.send = send;
}
