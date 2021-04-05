import { Chessground } from "chessground";
import { initialize as initializeHost } from "./host";
import { initialize as initializeGuest, join } from "./guest";
import Peer from "peerjs";

if (module.hot) {
  module.hot.accept();
}
let path = location.pathname.substr(1);

if (path) {
  initializeGuest();
  setTimeout(() => {
    join(path);
  }, 1000);
} else {
  initializeHost();
}

const config = { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" };
const board = document.getElementById("board");
const ground = Chessground(board, config);
