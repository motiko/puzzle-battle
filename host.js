import { processData } from "./protocol";

var lastPeerId = null;
var peer = null; // Own peer object
var peerId = null;
var conn = null;
var status = document.getElementById("status");

/**
 * Create the Peer object for our end of the connection.
 *
 * Sets up callbacks that handle any events related to our
 * peer object.
 */
export function initialize() {
  // Create own peer object with connection to shared PeerJS server
  peer = new Peer(null, {
    debug: 2,
  });

  peer.on("open", function (id) {
    // Workaround for peer.reconnect deleting previous id
    if (peer.id === null) {
      console.log("Received null id from peer open");
      peer.id = lastPeerId;
    } else {
      lastPeerId = peer.id;
    }

    console.log("ID: " + peer.id);
    window.history.pushState(
      { path: `${location.pathname}/${peer.id}` },
      "",
      location + peer.id
    );
    status.innerHTML = "Awaiting connection...";
  });

  peer.on("connection", function (c) {
    conn = c;
    console.log("Connected to: " + conn.peer);
    status.innerHTML = "Connected";
    ready();
  });
  peer.on("disconnected", function () {
    status.innerHTML = "Connection lost. Please reconnect";
    console.log("Connection lost. Please reconnect");

    // Workaround for peer.reconnect deleting previous id
    peer.id = lastPeerId;
    peer._lastServerId = lastPeerId;
    peer.reconnect();
  });
  peer.on("close", function () {
    conn = null;
    status.innerHTML = "Connection destroyed. Please refresh";
    console.log("Connection destroyed");
  });
  peer.on("error", function (err) {
    console.log(err);
  });
}

/**
 * Triggered once a connection has been achieved.
 * Defines callbacks to handle incoming data and connection events.
 */
function ready() {
  document.getElementById("board").addEventListener("mousemove", (e) => {
    conn.send(`mousepos:${e.offsetX},${e.offsetY}`);
  });
  conn.on("data", (data) => {
    processData(data);
  });
  conn.on("close", function () {
    status.innerHTML = "Connection reset<br>Awaiting connection...";
    conn = null;
  });
}
