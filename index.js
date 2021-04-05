import { Chessground } from "chessground";

import Peer from "peerjs";

let path = location.pathname.substr(1);
if (path) {
  console.log("!!!", path);
  const peer = new Peer();
  const conn = peer.connect("qwe123");
  conn.on("open", () => {
    conn.send("hi!");
    console.log("sent hi");
  });
} else {
  const peer = new Peer("qwe123");
  console.log(peer);
  peer.on("open", function (id) {
    console.log("My peer ID is: " + id);
    location.replace(id);
  });
  peer.on("connection", (conn) => {
    console.log("123 connected");
    conn.on("data", (data) => {
      // Will print 'hi!'
      console.log(data);
    });
    conn.on("open", () => {
      conn.send("hello!");
    });
  });
}

const config = { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" };
const board = document.getElementById("board");
const ground = Chessground(board, config);
