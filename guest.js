import { processData } from "./protocol";

var lastPeerId = null;
var peer = null; // own peer object
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
  });
  peer.on("connection", function (c) {
    // Disallow incoming connections
    c.on("open", function () {
      c.send("guest does not accept incoming connections");
      setTimeout(function () {
        c.close();
      }, 500);
    });
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
  var connectButton = document.getElementById("connect-button");
  connectButton.addEventListener("click", () => join());
}

/**
 * Create the connection between the two Peers.
 *
 * Sets up callbacks that handle any events related to the
 * connection and data received on it.
 */
export function join(id) {
  // Close old connection
  if (conn) {
    conn.close();
  }
  console.log(id);
  var recvIdInput = document.getElementById("receiver-id");

  // Create connection to destination peer specified in the input field
  conn = peer.connect(id || recvIdInput.value, {
    reliable: true,
  });

  conn.on("open", function () {
    status.innerHTML = "Connected to: " + conn.peer;
    console.log("Connected to: " + conn.peer);
    document.getElementById("board").addEventListener("mousemove", (e) => {
      conn.send(`mousepos:${e.offsetX},${e.offsetY}`);
    });
  });

  conn.on("data", processData);
  conn.on("close", function () {
    status.innerHTML = "Connection closed";
  });
}
