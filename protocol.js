import Peer from "peerjs";
import { Chessground } from "chessground";

export function processMsg(msg) {
  console.log("Data recieved", msg);
  const dataArr = msg.split(":");
  const command = dataArr[0];
  const board = document.getElementById("board");
  switch (command) {
    case "mousepos":
      const coords = dataArr[1].split(",");
      const [x, y] = coords;
      const cursor = document.getElementById("cursor");
      cursor.style.left = `${
        parseInt(board.getBoundingClientRect().x) + parseInt(x)
      }px`;
      cursor.style.top = `${
        parseInt(board.getBoundingClientRect().y) + parseInt(y)
      }px`;
      break;
  }
}

function initBoard() {
  const config = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    movable: {
      free: false,
      color: "white",
      dests: new Map([["e2", ["e4"]]]),
      showDests: false,
    },
  };
  const board = document.getElementById("board");
  const ground = Chessground(board, config);
  window.ground = ground;
}

function ready() {
  initBoard();
  document.getElementById("board").addEventListener("mousemove", (e) => {
    send(`mousepos:${e.offsetX},${e.offsetY}`);
  });
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function initConnections() {
  var clientConnections = [];

  var hostConnection;

  const peerId = parseInt(Math.random() * 10 ** 6);
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
      // console.log("Recvied data:\n", data);
      if (data.sended !== "SYSTEM") {
        processMsg(data.message);
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
      console.log("Recvied data:\n", data);

      updatePeerList(data.peers);
    });

    hostConnection.on("close", () => {
      console.log(`Connection to ${hostConnection.peer} is closed.`);

      peer.destroy();

      location.reload();
    });
  }

  function updatePeerList(peerList) {
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

  function send(message) {
    const data = {
      sender: peerId,
      message,
    };

    if (hostConnection) {
      console.log("SSS" + JSON.stringify(data));
      hostConnection.send(data);
    }

    // host send
    if (clientConnections.length > 0) {
      broadcast({
        ...data,
        peers: generatePeerList(),
      });
    }
  }
  window.send = send;
}
