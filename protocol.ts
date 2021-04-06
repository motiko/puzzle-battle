import Peer from "peerjs";
import { Chessground } from "chessground";
import { getCursor, boardSize } from "./dom";
import { Config } from "chessground/config";
import { isNumeric } from "./utils";
import { initBoard } from "./board";

var clientConnections = [];

var hostConnection;

const peerId = `${Math.floor(Math.random() * 10 ** 6)}`;
const peer = new Peer(peerId);

export function initConnections() {
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
      initBoard();
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
}

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

function reconnect() {
  console.log(`Reconnecting to signaller.`);
  peer.reconnect();
}

function join(hostId) {
  hostConnection = peer.connect(hostId);

  hostConnection.on("open", () => {
    console.log(`Connection to ${hostConnection.peer} established.`);
    initBoard();
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

export function send(cmdData) {
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
